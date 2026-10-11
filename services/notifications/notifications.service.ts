import { createAdminClient } from "@genz/database/admin";
import { sendSellerOrderNotificationEmail } from "@genz/utils/resend";
import {
  buildOrderConfirmationEmail,
  buildOrderStatusEmail,
  buildRefundEmail,
  sendCustomerEmail,
  type CustomerEmailOrder,
  type CustomerRefundEmailKind,
  type CustomerStatusEmailKind,
} from "@genz/utils/order-emails";
import type { OrderRecord, RefundRecord } from "@genz/types";
import { ShippingService } from "../shipping/shipping.service";
import { RETURN_WINDOW_DAYS } from "../refunds/refunds.constants";
import type {
  SendEmailResult,
  SendSellerOrderNotificationInput,
} from "./notifications.types";

export class NotificationsService {
  /**
   * Dispatches order notification email to the seller/artisan.
   * Resolves the email address automatically by querying seller_applications or auth users.
   */
  static async sendSellerOrderNotification(
    input: SendSellerOrderNotificationInput
  ): Promise<SendEmailResult> {
    let recipientEmail = "";
    let sellerDisplayName = input.sellerName;

    try {
      const admin = createAdminClient();
      // 1. Try finding application email
      const { data: appData } = await admin
        .from("seller_applications")
        .select("email, full_name, business_name")
        .eq("id", input.sellerId)
        .maybeSingle();

      if (appData?.email) {
        recipientEmail = appData.email;
        sellerDisplayName = appData.business_name || appData.full_name || sellerDisplayName;
      } else {
        // 2. Check auth users list
        const { data: userData } = await admin.auth.admin.getUserById(input.sellerId);
        if (userData?.user?.email) {
          recipientEmail = userData.user.email;
        }
      }

      if (!recipientEmail) {
        return {
          success: false,
          error: `Could not resolve email address for seller ${input.sellerId}`,
        };
      }

      const result = await sendSellerOrderNotificationEmail({
        to: recipientEmail,
        sellerName: sellerDisplayName,
        orderId: input.orderId,
        items: input.items,
        totalAmount: input.totalAmount,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
      });

      return {
        success: result.success,
        error: result.error,
        messageId: (result as { messageId?: string }).messageId,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Notification dispatch failed";
      return { success: false, error: msg };
    }
  }
}

/** Maps an order to the shape used by customer email templates. */
export function toCustomerEmailOrder(order: OrderRecord): CustomerEmailOrder {
  return {
    id: order.id,
    customerName: order.customerName,
    items: (order.items || []).map((item) => ({
      name: item.name || item.product_name || item.title || "Handcrafted product",
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      variant:
        item.variantName && item.variantValue
          ? `${item.variantName}: ${item.variantValue}`
          : item.variantValue || null,
      sellerName: item.sellerBusinessName || null,
    })),
    subtotal: Number(order.subtotal) || 0,
    tax: Number(order.tax) || 0,
    shippingFee: Number(order.shippingFee) || 0,
    totalAmount: Number(order.totalAmount) || 0,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
  };
}

/**
 * Customer-facing transactional emails. Every method resolves (never throws)
 * so an email outage can never fail an order, status change or refund.
 */
export class CustomerNotificationsService {
  static async sendOrderConfirmation(order: OrderRecord): Promise<SendEmailResult> {
    try {
      const email = buildOrderConfirmationEmail(toCustomerEmailOrder(order));
      return await sendCustomerEmail(order.customerEmail, email, `order_confirmation ${order.id}`);
    } catch (err) {
      console.error("[CustomerNotifications] confirmation failed:", err);
      return { success: false, error: "Email build failed" };
    }
  }

  static async sendOrderStatusUpdate(
    order: OrderRecord,
    status: CustomerStatusEmailKind,
    note?: string | null
  ): Promise<SendEmailResult> {
    try {
      const trackingUrl =
        order.carrier && order.trackingNumber
          ? ShippingService.validateDispatch(order.carrier, order.trackingNumber).trackingUrl
          : undefined;
      const email = buildOrderStatusEmail(toCustomerEmailOrder(order), status, {
        trackingUrl,
        note,
        returnWindowDays: RETURN_WINDOW_DAYS,
      });
      return await sendCustomerEmail(order.customerEmail, email, `order_${status} ${order.id}`);
    } catch (err) {
      console.error("[CustomerNotifications] status update failed:", err);
      return { success: false, error: "Email build failed" };
    }
  }

  static async sendRefundUpdate(
    order: OrderRecord,
    refund: RefundRecord,
    kind: CustomerRefundEmailKind
  ): Promise<SendEmailResult> {
    try {
      const email = buildRefundEmail(
        toCustomerEmailOrder(order),
        {
          id: refund.id,
          amount: refund.amount,
          method: refund.method,
          reason: refund.reason,
          adminNote: refund.adminNote,
          manualReference: refund.manualReference,
        },
        kind
      );
      return await sendCustomerEmail(order.customerEmail, email, `refund_${kind} ${refund.id}`);
    } catch (err) {
      console.error("[CustomerNotifications] refund update failed:", err);
      return { success: false, error: "Email build failed" };
    }
  }
}

// Backward-compatibility alias
export { NotificationsService as NotificationService };
