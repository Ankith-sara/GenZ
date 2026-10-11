import "server-only";
import type { OrderRecord, RefundRecord, RefundStatus } from "@genz/types";
import {
  getRefundByGatewayRefundId,
  getRefundById,
  insertRefund,
  listRefunds,
  transitionRefund,
  RefundStoreError,
} from "@genz/database/refunds";
import { applyOrderRefundTotals } from "@genz/database/orders";
import { recordRefundJournal, reverseOrderCommissions } from "@genz/database/accounting";
import { OrdersRepository } from "../orders/orders.repository";
import { PaymentsService } from "../payments/payments.service";
import { CustomerNotificationsService } from "../notifications/notifications.service";
import {
  canCustomerCancel,
  canRequestReturn,
  cancellationNeedsRefund,
  getRefundableBalance,
  hasCollectedPayment,
  hasOpenRefund,
  mapGatewayRefundStatus,
  processedRefundTotal,
  resolveRefundMethod,
  validateRefundAmount,
} from "./refunds.rules";

export interface RefundActionResult {
  success: boolean;
  error?: string;
  refund?: RefundRecord;
  order?: OrderRecord | null;
}

const NOT_FOUND = "Order not found.";

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof RefundStoreError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

async function loadOwnedOrder(orderId: string, userId: string): Promise<OrderRecord | null> {
  const order = await OrdersRepository.getById(orderId);
  // Same response for "missing" and "someone else's" so order ids cannot be probed.
  if (!order || !order.customerId || order.customerId !== userId) return null;
  return order;
}

export class RefundsService {
  // ------------------------------------------------------------------
  // Customer flows
  // ------------------------------------------------------------------

  /** Cancels an order that has not shipped and opens a refund if money was collected. */
  static async cancelOrderByCustomer(input: {
    orderId: string;
    userId: string;
    reason?: string | null;
  }): Promise<RefundActionResult> {
    try {
      const order = await loadOwnedOrder(input.orderId, input.userId);
      if (!order) return { success: false, error: NOT_FOUND };

      const eligibility = canCustomerCancel(order);
      if (!eligibility.allowed) return { success: false, error: eligibility.reason };

      let refund: RefundRecord | undefined;
      // Unpaid (e.g. COD) orders need no refund, so they never depend on the refunds table.
      const existing = hasCollectedPayment(order)
        ? await listRefunds({ orderIds: [order.id] })
        : [];
      if (cancellationNeedsRefund(order, existing) && !hasOpenRefund(existing)) {
        // Record the refund first: if this fails the order stays active rather
        // than ending up cancelled with no refund on file.
        refund = await insertRefund({
          orderId: order.id,
          amount: getRefundableBalance(order, existing),
          type: "cancellation",
          method: resolveRefundMethod(order),
          status: "requested",
          reason: input.reason || "Cancelled by customer",
          gatewayPaymentId: order.paymentGatewayId ?? null,
          requestedBy: input.userId,
        });
      }

      const reasonNote = input.reason ? ` Reason: ${input.reason}` : "";
      const updated = await OrdersRepository.updateStatus(order.id, {
        status: "cancelled",
        note: `Cancelled by customer.${reasonNote}`,
      });

      if (updated) {
        await CustomerNotificationsService.sendOrderStatusUpdate(
          updated,
          "cancelled",
          input.reason ? `Reason: ${input.reason}` : null
        );
      }

      return { success: true, order: updated, refund };
    } catch (err) {
      console.error("[RefundsService] cancelOrderByCustomer failed:", err);
      return { success: false, error: errorMessage(err, "Could not cancel the order.") };
    }
  }

  /** Opens a return refund request for a delivered order within the return window. */
  static async requestReturn(input: {
    orderId: string;
    userId: string;
    reason: string;
    now?: Date;
  }): Promise<RefundActionResult> {
    try {
      const order = await loadOwnedOrder(input.orderId, input.userId);
      if (!order) return { success: false, error: NOT_FOUND };

      const existing = await listRefunds({ orderIds: [order.id] });
      const eligibility = canRequestReturn(order, existing, input.now);
      if (!eligibility.allowed) return { success: false, error: eligibility.reason };

      const refund = await insertRefund({
        orderId: order.id,
        amount: getRefundableBalance(order, existing),
        type: "return",
        method: resolveRefundMethod(order),
        status: "requested",
        reason: input.reason,
        gatewayPaymentId: order.paymentGatewayId ?? null,
        requestedBy: input.userId,
      });

      return { success: true, order, refund };
    } catch (err) {
      console.error("[RefundsService] requestReturn failed:", err);
      return { success: false, error: errorMessage(err, "Could not request the return.") };
    }
  }

  /** Refunds visible to the customer for their own orders. */
  static async getRefundsForOrders(orderIds: string[]): Promise<RefundRecord[]> {
    try {
      return await listRefunds({ orderIds });
    } catch (err) {
      console.warn("[RefundsService] getRefundsForOrders notice:", err);
      return [];
    }
  }

  // ------------------------------------------------------------------
  // Seller/admin cancellations
  // ------------------------------------------------------------------

  /**
   * Called after a seller or admin cancels an order: opens a cancellation refund
   * for collected payments so the customer's money is never forgotten. Never throws.
   */
  static async ensureCancellationRefund(
    order: OrderRecord,
    actorUserId: string,
    actorLabel: "seller" | "admin"
  ): Promise<RefundRecord | null> {
    try {
      if (!hasCollectedPayment(order)) return null;
      const existing = await listRefunds({ orderIds: [order.id] });
      if (!cancellationNeedsRefund(order, existing) || hasOpenRefund(existing)) return null;
      return await insertRefund({
        orderId: order.id,
        amount: getRefundableBalance(order, existing),
        type: "cancellation",
        method: resolveRefundMethod(order),
        status: "requested",
        reason: `Order cancelled by ${actorLabel}`,
        gatewayPaymentId: order.paymentGatewayId ?? null,
        requestedBy: actorUserId,
      });
    } catch (err) {
      console.error(
        `[RefundsService] Could not open cancellation refund for ${order.id}:`,
        err
      );
      return null;
    }
  }

  // ------------------------------------------------------------------
  // Admin flows
  // ------------------------------------------------------------------

  static async listForAdmin(filter?: { status?: RefundStatus[] }): Promise<RefundRecord[]> {
    return listRefunds({ status: filter?.status });
  }

  /** Admin-initiated refund straight from an order. */
  static async initiateAdminRefund(input: {
    orderId: string;
    amount: number;
    reason: string;
    adminId: string;
    manualReference?: string | null;
    adminNote?: string | null;
  }): Promise<RefundActionResult> {
    try {
      const order = await OrdersRepository.getById(input.orderId);
      if (!order) return { success: false, error: NOT_FOUND };
      if (!hasCollectedPayment(order)) {
        return { success: false, error: "No payment has been collected for this order." };
      }

      const existing = await listRefunds({ orderIds: [order.id] });
      if (hasOpenRefund(existing)) {
        return {
          success: false,
          error: "This order already has an open refund. Review it in the queue first.",
        };
      }
      const amountCheck = validateRefundAmount(input.amount, order, existing);
      if (!amountCheck.allowed) return { success: false, error: amountCheck.reason };

      const refund = await insertRefund({
        orderId: order.id,
        amount: input.amount,
        type: "admin",
        method: resolveRefundMethod(order),
        status: "approved",
        reason: input.reason,
        gatewayPaymentId: order.paymentGatewayId ?? null,
        requestedBy: input.adminId,
        reviewedBy: input.adminId,
        adminNote: input.adminNote ?? null,
      });

      return this.approveRefund({
        refundId: refund.id,
        adminId: input.adminId,
        manualReference: input.manualReference,
        adminNote: input.adminNote,
      });
    } catch (err) {
      console.error("[RefundsService] initiateAdminRefund failed:", err);
      return { success: false, error: errorMessage(err, "Could not create the refund.") };
    }
  }

  /**
   * Approves a refund and moves the money:
   * - Razorpay orders: calls the Razorpay Refunds API (processing/processed).
   * - Manual orders (UPI QR / COD / bank): requires the UTR and marks processed.
   * Failures are recorded as `failed` with the error, never as success.
   */
  static async approveRefund(input: {
    refundId: string;
    adminId: string;
    amount?: number;
    manualReference?: string | null;
    adminNote?: string | null;
  }): Promise<RefundActionResult> {
    try {
      const refund = await getRefundById(input.refundId);
      if (!refund) return { success: false, error: "Refund not found." };
      const claimable: RefundStatus[] = ["requested", "approved", "failed"];
      if (!claimable.includes(refund.status)) {
        return { success: false, error: `This refund is already ${refund.status}.` };
      }

      const order = await OrdersRepository.getById(refund.orderId);
      if (!order) return { success: false, error: NOT_FOUND };

      const amount = input.amount ?? refund.amount;
      if (amount > refund.amount) {
        return {
          success: false,
          error: "The approved amount cannot be higher than the requested amount.",
        };
      }
      const others = (await listRefunds({ orderIds: [order.id] })).filter(
        (r) => r.id !== refund.id
      );
      const amountCheck = validateRefundAmount(amount, order, others);
      if (!amountCheck.allowed) return { success: false, error: amountCheck.reason };

      const method = resolveRefundMethod(order);
      const adminNote = input.adminNote?.trim() || refund.adminNote;

      if (method === "manual") {
        const reference = input.manualReference?.trim();
        if (!reference) {
          return {
            success: false,
            error: "Enter the bank / UPI transfer reference (UTR) for this manual refund.",
          };
        }
        const processed = await transitionRefund(refund.id, claimable, {
          status: "processed",
          amount,
          method,
          manualReference: reference,
          reviewedBy: input.adminId,
          adminNote,
          failureReason: null,
          processedAt: new Date().toISOString(),
        });
        if (!processed) {
          return { success: false, error: "This refund was already handled by someone else." };
        }
        await this.finalizeProcessedRefund(processed, input.adminId);
        return { success: true, refund: processed, order };
      }

      // Razorpay
      const paymentId = order.paymentGatewayId || refund.gatewayPaymentId;
      if (!PaymentsService.getRazorpayCredentials() || !paymentId) {
        const reason = !paymentId
          ? "This order has no verified Razorpay payment id."
          : "Razorpay keys are not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).";
        const failed = await transitionRefund(refund.id, claimable, {
          status: "failed",
          amount,
          method,
          reviewedBy: input.adminId,
          adminNote,
          failureReason: reason,
        });
        return { success: false, error: reason, refund: failed ?? refund };
      }

      // Claim the refund before calling the gateway so two admins cannot both send it.
      const claimed = await transitionRefund(refund.id, claimable, {
        status: "processing",
        amount,
        method,
        gatewayPaymentId: paymentId,
        reviewedBy: input.adminId,
        adminNote,
        failureReason: null,
      });
      if (!claimed) {
        return { success: false, error: "This refund was already handled by someone else." };
      }

      const gateway = await PaymentsService.createRazorpayRefund({
        paymentId,
        amountInPaise: Math.round(amount * 100),
        receipt: claimed.id,
        notes: { refund_id: claimed.id, order_id: order.id },
      });

      if (!gateway.success || !gateway.refundId) {
        const failed = await transitionRefund(claimed.id, ["processing"], {
          status: "failed",
          failureReason: gateway.error || "Razorpay refund failed.",
        });
        return {
          success: false,
          error: gateway.error || "Razorpay refund failed.",
          refund: failed ?? claimed,
        };
      }

      const nextStatus = mapGatewayRefundStatus(gateway.status);
      const updated = await transitionRefund(claimed.id, ["processing"], {
        status: nextStatus,
        gatewayRefundId: gateway.refundId,
        failureReason: nextStatus === "failed" ? "Razorpay reported the refund as failed." : null,
        processedAt: nextStatus === "processed" ? new Date().toISOString() : null,
      });
      // A webhook may already have moved it; re-read to report the real state.
      const current = updated ?? (await getRefundById(claimed.id)) ?? claimed;

      if (updated && updated.status === "processed") {
        await this.finalizeProcessedRefund(updated, input.adminId);
      } else if (current.status === "processing") {
        await CustomerNotificationsService.sendRefundUpdate(order, current, "initiated");
      }

      if (current.status === "failed") {
        return { success: false, error: "Razorpay reported the refund as failed.", refund: current };
      }
      return { success: true, refund: current, order };
    } catch (err) {
      console.error("[RefundsService] approveRefund failed:", err);
      return { success: false, error: errorMessage(err, "Could not approve the refund.") };
    }
  }

  static async rejectRefund(input: {
    refundId: string;
    adminId: string;
    adminNote: string;
  }): Promise<RefundActionResult> {
    try {
      const rejected = await transitionRefund(
        input.refundId,
        ["requested", "approved", "failed"],
        { status: "rejected", reviewedBy: input.adminId, adminNote: input.adminNote }
      );
      if (!rejected) {
        return { success: false, error: "This refund can no longer be rejected." };
      }
      const order = await OrdersRepository.getById(rejected.orderId);
      if (order) {
        await CustomerNotificationsService.sendRefundUpdate(order, rejected, "rejected");
      }
      return { success: true, refund: rejected, order };
    } catch (err) {
      console.error("[RefundsService] rejectRefund failed:", err);
      return { success: false, error: errorMessage(err, "Could not reject the refund.") };
    }
  }

  // ------------------------------------------------------------------
  // Gateway webhooks
  // ------------------------------------------------------------------

  /**
   * Applies a verified Razorpay `refund.processed` / `refund.failed` event.
   * Idempotent: replays of an already-applied event are no-ops.
   */
  static async applyGatewayRefundEvent(input: {
    event: "refund.processed" | "refund.failed";
    gatewayRefundId: string;
    paymentId?: string | null;
    amountInPaise?: number | null;
    notesRefundId?: string | null;
  }): Promise<{ handled: boolean; detail: string }> {
    let refund = await getRefundByGatewayRefundId(input.gatewayRefundId);
    if (
      !refund &&
      input.notesRefundId &&
      /^[0-9a-f-]{36}$/i.test(input.notesRefundId)
    ) {
      const candidate = await getRefundById(input.notesRefundId);
      // Only trust the notes link when the payment matches too.
      if (
        candidate &&
        (!candidate.gatewayPaymentId || candidate.gatewayPaymentId === input.paymentId)
      ) {
        refund = candidate;
      }
    }
    if (!refund) return { handled: false, detail: "No matching refund" };

    if (
      input.amountInPaise &&
      Math.round(refund.amount * 100) !== Number(input.amountInPaise)
    ) {
      console.warn(
        `[RefundsService] Webhook amount ${input.amountInPaise} paise differs from refund ${refund.id} (${refund.amount} INR).`
      );
    }

    if (input.event === "refund.processed") {
      if (refund.status === "processed") return { handled: true, detail: "Already processed" };
      const processed = await transitionRefund(refund.id, ["processing", "approved", "failed"], {
        status: "processed",
        gatewayRefundId: input.gatewayRefundId,
        failureReason: null,
        processedAt: new Date().toISOString(),
      });
      if (!processed) return { handled: true, detail: "Already handled" };
      await this.finalizeProcessedRefund(processed, processed.reviewedBy ?? undefined);
      return { handled: true, detail: "Marked processed" };
    }

    if (refund.status === "failed") return { handled: true, detail: "Already failed" };
    const failed = await transitionRefund(refund.id, ["processing"], {
      status: "failed",
      gatewayRefundId: input.gatewayRefundId,
      failureReason: "Razorpay reported the refund as failed.",
    });
    return { handled: true, detail: failed ? "Marked failed" : "Already handled" };
  }

  // ------------------------------------------------------------------
  // Shared completion step
  // ------------------------------------------------------------------

  /**
   * Runs exactly once per refund (callers only reach it after winning the
   * compare-and-set into `processed`): rolls totals into the order, posts the
   * ledger journal, reverses commissions on full refunds and emails the customer.
   */
  static async finalizeProcessedRefund(refund: RefundRecord, actorId?: string): Promise<void> {
    const order = await OrdersRepository.getById(refund.orderId);
    if (!order) {
      console.error(`[RefundsService] Order ${refund.orderId} missing for refund ${refund.id}`);
      return;
    }

    let updatedOrder: OrderRecord | null = order;
    try {
      const all = await listRefunds({ orderIds: [order.id] });
      updatedOrder = (await applyOrderRefundTotals(order.id, processedRefundTotal(all))) ?? order;
    } catch (err) {
      console.error(`[RefundsService] Refund totals update failed for ${order.id}:`, err);
    }

    try {
      await recordRefundJournal({
        refundId: refund.id,
        orderId: order.id,
        amount: refund.amount,
        method: refund.method,
        afterDelivery: order.status === "delivered",
        postedBy: actorId,
      });
    } catch (err) {
      console.error(`[RefundsService] Refund journal failed for ${refund.id}:`, err);
    }

    if (updatedOrder?.paymentStatus === "refunded") {
      try {
        await reverseOrderCommissions(order.id);
      } catch (err) {
        console.error(`[RefundsService] Commission reversal failed for ${order.id}:`, err);
      }
    }

    await CustomerNotificationsService.sendRefundUpdate(updatedOrder ?? order, refund, "processed");
  }
}
