import type { OrderStatus, PaymentStatus, RefundStatus } from "@genz/types";

/**
 * Refund & cancellation policy numbers used by the code. Customer-facing policy
 * wording lives elsewhere; keep the two in sync when the policy changes.
 */

/** Days after delivery during which a customer may request a return. */
export const RETURN_WINDOW_DAYS = 7;

/** A customer can cancel an order only before it is handed to the courier. */
export const CUSTOMER_CANCELLABLE_STATUSES: readonly OrderStatus[] = ["placed", "processing"];

/** Returns are only possible for delivered orders. */
export const RETURNABLE_ORDER_STATUS: OrderStatus = "delivered";

/** Refunds still in flight. The database allows at most one per order. */
export const OPEN_REFUND_STATUSES: readonly RefundStatus[] = [
  "requested",
  "approved",
  "processing",
];

/** Refunds that no longer count against the refundable balance. */
export const RELEASED_REFUND_STATUSES: readonly RefundStatus[] = ["rejected", "failed"];

/** Payment states in which money was actually collected and can be returned. */
export const REFUNDABLE_PAYMENT_STATUSES: readonly PaymentStatus[] = [
  "paid",
  "partially_refunded",
];

export const REFUND_REASON_MAX_LENGTH = 1000;
