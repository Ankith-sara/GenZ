import type { OrderRecord, RefundMethod, RefundRecord, RefundStatus } from "@genz/types";
import {
  CUSTOMER_CANCELLABLE_STATUSES,
  OPEN_REFUND_STATUSES,
  REFUNDABLE_PAYMENT_STATUSES,
  RELEASED_REFUND_STATUSES,
  RETURNABLE_ORDER_STATUS,
  RETURN_WINDOW_DAYS,
} from "./refunds.constants";

/** Pure refund & cancellation eligibility rules (no I/O). */

export type Eligibility = { allowed: true } | { allowed: false; reason: string };

const DAY_MS = 24 * 60 * 60 * 1000;
const round2 = (n: number) => Math.round(n * 100) / 100;

type RefundLike = Pick<RefundRecord, "amount" | "status">;

/**
 * True when the customer has paid, or claims to have paid via UPI QR (a UTR was
 * submitted and is awaiting manual verification). COD orders that were never
 * delivered have collected nothing and are not refundable.
 */
export function hasCollectedPayment(order: Pick<OrderRecord, "paymentStatus" | "paymentMethod">): boolean {
  if (REFUNDABLE_PAYMENT_STATUSES.includes(order.paymentStatus)) return true;
  return order.paymentMethod === "upi_qr" && order.paymentStatus === "pending";
}

/** Sum of refunds that still count against the order (everything except rejected/failed). */
export function committedRefundTotal(refunds: RefundLike[]): number {
  return round2(
    refunds
      .filter((r) => !RELEASED_REFUND_STATUSES.includes(r.status))
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  );
}

export function processedRefundTotal(refunds: RefundLike[]): number {
  return round2(
    refunds
      .filter((r) => r.status === "processed")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  );
}

export function getRefundableBalance(
  order: Pick<OrderRecord, "totalAmount">,
  refunds: RefundLike[]
): number {
  return Math.max(0, round2(Number(order.totalAmount || 0) - committedRefundTotal(refunds)));
}

export function hasOpenRefund(refunds: Pick<RefundRecord, "status">[]): boolean {
  return refunds.some((r) => OPEN_REFUND_STATUSES.includes(r.status));
}

/** When the order was delivered, from its tracking timeline. */
export function getDeliveredAt(
  order: Pick<OrderRecord, "status" | "trackingEvents" | "updatedAt">
): Date | null {
  const events = (order.trackingEvents || []).filter((e) => e.status === "delivered");
  const last = events[events.length - 1];
  const raw = last?.timestamp || (order.status === "delivered" ? order.updatedAt : null);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getReturnWindowEndsAt(
  order: Pick<OrderRecord, "status" | "trackingEvents" | "updatedAt">
): Date | null {
  const deliveredAt = getDeliveredAt(order);
  return deliveredAt ? new Date(deliveredAt.getTime() + RETURN_WINDOW_DAYS * DAY_MS) : null;
}

export function canCustomerCancel(order: Pick<OrderRecord, "status">): Eligibility {
  if (CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) return { allowed: true };
  if (order.status === "cancelled") {
    return { allowed: false, reason: "This order is already cancelled." };
  }
  return {
    allowed: false,
    reason: "This order has already shipped, so it can no longer be cancelled. You can request a return after delivery.",
  };
}

/** Whether cancelling this order must open a refund for the customer. */
export function cancellationNeedsRefund(
  order: Pick<OrderRecord, "paymentStatus" | "paymentMethod" | "totalAmount">,
  refunds: RefundLike[]
): boolean {
  return hasCollectedPayment(order) && getRefundableBalance(order, refunds) > 0;
}

export function canRequestReturn(
  order: Pick<
    OrderRecord,
    "status" | "trackingEvents" | "updatedAt" | "paymentStatus" | "paymentMethod" | "totalAmount"
  >,
  refunds: RefundLike[],
  now: Date = new Date()
): Eligibility {
  if (order.status !== RETURNABLE_ORDER_STATUS) {
    return { allowed: false, reason: "Returns can be requested only after the order is delivered." };
  }
  const endsAt = getReturnWindowEndsAt(order);
  if (!endsAt) {
    return { allowed: false, reason: "We could not find the delivery date for this order." };
  }
  if (now.getTime() > endsAt.getTime()) {
    return {
      allowed: false,
      reason: `The ${RETURN_WINDOW_DAYS}-day return window for this order has closed.`,
    };
  }
  if (hasOpenRefund(refunds as Pick<RefundRecord, "status">[])) {
    return { allowed: false, reason: "A refund request for this order is already in progress." };
  }
  if (!hasCollectedPayment(order)) {
    return { allowed: false, reason: "No payment has been recorded for this order yet." };
  }
  if (getRefundableBalance(order, refunds) <= 0) {
    return { allowed: false, reason: "This order has already been fully refunded." };
  }
  return { allowed: true };
}

export function validateRefundAmount(
  amount: number,
  order: Pick<OrderRecord, "totalAmount">,
  refunds: RefundLike[]
): Eligibility {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { allowed: false, reason: "Refund amount must be greater than zero." };
  }
  if (Math.abs(Math.round(amount * 100) - amount * 100) > 1e-6) {
    return { allowed: false, reason: "Refund amount can have at most 2 decimal places." };
  }
  const balance = getRefundableBalance(order, refunds);
  if (amount > balance + 1e-9) {
    return {
      allowed: false,
      reason: `Refund amount exceeds the refundable balance of ₹${balance.toFixed(2)}.`,
    };
  }
  return { allowed: true };
}

/** Gateway refunds need a verified gateway payment id; everything else is manual (UTR). */
export function resolveRefundMethod(
  order: Pick<OrderRecord, "paymentMethod" | "paymentGatewayId">
): RefundMethod {
  return order.paymentMethod === "razorpay" && order.paymentGatewayId ? "razorpay" : "manual";
}

/** Maps a Razorpay refund entity status to ours. */
export function mapGatewayRefundStatus(status: string | undefined | null): RefundStatus {
  switch (status) {
    case "processed":
      return "processed";
    case "failed":
      return "failed";
    default:
      // Razorpay reports "pending" until the bank confirms.
      return "processing";
  }
}

export interface CustomerOrderActions {
  canCancel: boolean;
  canReturn: boolean;
  /** Why a return is not possible (only set for delivered orders). */
  returnBlockedReason: string | null;
  /** ISO timestamp when the return window closes, for delivered orders. */
  returnWindowEndsAt: string | null;
  /** Whether cancelling would open a refund (money was collected). */
  refundOnCancel: boolean;
}

/** What the customer may do with their order right now (for the orders page). */
export function getCustomerOrderActions(
  order: Pick<
    OrderRecord,
    "status" | "trackingEvents" | "updatedAt" | "paymentStatus" | "paymentMethod" | "totalAmount"
  >,
  refunds: Pick<RefundRecord, "amount" | "status">[],
  now: Date = new Date()
): CustomerOrderActions {
  const cancel = canCustomerCancel(order);
  const ret = canRequestReturn(order, refunds, now);
  const endsAt = order.status === "delivered" ? getReturnWindowEndsAt(order) : null;
  return {
    canCancel: cancel.allowed,
    canReturn: ret.allowed,
    returnBlockedReason:
      order.status === "delivered" && !ret.allowed ? ret.reason : null,
    returnWindowEndsAt: endsAt ? endsAt.toISOString() : null,
    refundOnCancel: cancellationNeedsRefund(order, refunds),
  };
}
