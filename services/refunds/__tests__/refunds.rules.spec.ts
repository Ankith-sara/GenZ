import { describe, it, expect } from "vitest";
import type { OrderRecord, RefundRecord } from "@genz/types";
import {
  canCustomerCancel,
  canRequestReturn,
  cancellationNeedsRefund,
  committedRefundTotal,
  getCustomerOrderActions,
  getDeliveredAt,
  getRefundableBalance,
  hasCollectedPayment,
  mapGatewayRefundStatus,
  resolveRefundMethod,
  validateRefundAmount,
} from "../refunds.rules";
import { RETURN_WINDOW_DAYS } from "../refunds.constants";

const DAY = 24 * 60 * 60 * 1000;
const DELIVERED_AT = "2026-10-01T10:00:00.000Z";

function order(overrides: Partial<OrderRecord> = {}): OrderRecord {
  return {
    id: "GZ-ORD-100001",
    createdAt: "2026-09-28T10:00:00.000Z",
    updatedAt: "2026-09-28T10:00:00.000Z",
    customerId: "user-1",
    customerName: "Asha",
    customerEmail: "asha@example.com",
    shippingAddress: {
      recipientName: "Asha",
      phone: "9876543210",
      addressLine: "1 Main Rd",
      city: "Pune",
      state: "MH",
      pincode: "411001",
    },
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    paymentGatewayId: "pay_ABC123",
    status: "placed",
    subtotal: 1000,
    tax: 50,
    shippingFee: 0,
    totalAmount: 1050,
    items: [{ name: "Toy", price: 1000, quantity: 1 }],
    sellerIds: ["s1"],
    trackingEvents: [],
    ...overrides,
  };
}

function delivered(overrides: Partial<OrderRecord> = {}): OrderRecord {
  return order({
    status: "delivered",
    updatedAt: "2026-10-05T00:00:00.000Z",
    trackingEvents: [
      { status: "placed", timestamp: "2026-09-28T10:00:00.000Z", title: "Placed" },
      { status: "delivered", timestamp: DELIVERED_AT, title: "Delivered" },
    ],
    ...overrides,
  });
}

function refund(amount: number, status: RefundRecord["status"]) {
  return { amount, status };
}

describe("canCustomerCancel", () => {
  it("allows cancelling placed and processing orders", () => {
    expect(canCustomerCancel(order({ status: "placed" })).allowed).toBe(true);
    expect(canCustomerCancel(order({ status: "processing" })).allowed).toBe(true);
  });

  it("blocks cancelling shipped, delivered and cancelled orders", () => {
    expect(canCustomerCancel(order({ status: "shipped" })).allowed).toBe(false);
    expect(canCustomerCancel(order({ status: "delivered" })).allowed).toBe(false);
    const cancelled = canCustomerCancel(order({ status: "cancelled" }));
    expect(cancelled.allowed).toBe(false);
    if (!cancelled.allowed) expect(cancelled.reason).toMatch(/already cancelled/);
  });
});

describe("cancellationNeedsRefund / hasCollectedPayment", () => {
  it("opens a refund for paid and UPI-claimed orders only", () => {
    expect(cancellationNeedsRefund(order(), [])).toBe(true);
    expect(
      cancellationNeedsRefund(order({ paymentMethod: "upi_qr", paymentStatus: "pending" }), [])
    ).toBe(true);
    expect(
      cancellationNeedsRefund(order({ paymentMethod: "cod", paymentStatus: "pending" }), [])
    ).toBe(false);
    expect(hasCollectedPayment(order({ paymentStatus: "failed" }))).toBe(false);
  });

  it("does not open a refund once the full amount is committed", () => {
    expect(cancellationNeedsRefund(order(), [refund(1050, "processed")])).toBe(false);
  });
});

describe("return window", () => {
  it("reads the delivery time from the tracking timeline", () => {
    expect(getDeliveredAt(delivered())?.toISOString()).toBe(DELIVERED_AT);
  });

  it("allows a return exactly at the window boundary", () => {
    const boundary = new Date(new Date(DELIVERED_AT).getTime() + RETURN_WINDOW_DAYS * DAY);
    expect(canRequestReturn(delivered(), [], boundary).allowed).toBe(true);
  });

  it("rejects a return one millisecond after the window closes", () => {
    const after = new Date(new Date(DELIVERED_AT).getTime() + RETURN_WINDOW_DAYS * DAY + 1);
    const res = canRequestReturn(delivered(), [], after);
    expect(res.allowed).toBe(false);
    if (!res.allowed) expect(res.reason).toMatch(/return window/);
  });

  it("allows a return right after delivery", () => {
    expect(canRequestReturn(delivered(), [], new Date(DELIVERED_AT)).allowed).toBe(true);
  });

  it("rejects returns for orders that are not delivered", () => {
    expect(canRequestReturn(order({ status: "shipped" }), [], new Date()).allowed).toBe(false);
  });

  it("rejects a second return while one is open", () => {
    const res = canRequestReturn(
      delivered(),
      [refund(1050, "requested")],
      new Date(DELIVERED_AT)
    );
    expect(res.allowed).toBe(false);
  });

  it("allows a new request after a rejected one", () => {
    expect(
      canRequestReturn(delivered(), [refund(1050, "rejected")], new Date(DELIVERED_AT)).allowed
    ).toBe(true);
  });

  it("reports the window in the customer actions view", () => {
    const actions = getCustomerOrderActions(delivered(), [], new Date(DELIVERED_AT));
    expect(actions.canCancel).toBe(false);
    expect(actions.canReturn).toBe(true);
    expect(actions.returnWindowEndsAt).toBe(
      new Date(new Date(DELIVERED_AT).getTime() + RETURN_WINDOW_DAYS * DAY).toISOString()
    );
  });
});

describe("refund amounts", () => {
  it("ignores rejected and failed refunds in the committed total", () => {
    expect(
      committedRefundTotal([
        refund(100, "processed"),
        refund(200, "requested"),
        refund(300, "rejected"),
        refund(400, "failed"),
      ])
    ).toBe(300);
  });

  it("computes the remaining refundable balance", () => {
    expect(getRefundableBalance(order(), [refund(50.5, "processed")])).toBe(999.5);
    expect(getRefundableBalance(order(), [refund(2000, "processed")])).toBe(0);
  });

  it("accepts an amount equal to the remaining balance", () => {
    expect(validateRefundAmount(999.5, order(), [refund(50.5, "processed")]).allowed).toBe(true);
  });

  it("rejects an amount above the remaining balance", () => {
    const res = validateRefundAmount(999.51, order(), [refund(50.5, "processed")]);
    expect(res.allowed).toBe(false);
    if (!res.allowed) expect(res.reason).toMatch(/exceeds/);
  });

  it("rejects zero, negative, non-finite and sub-paisa amounts", () => {
    expect(validateRefundAmount(0, order(), []).allowed).toBe(false);
    expect(validateRefundAmount(-1, order(), []).allowed).toBe(false);
    expect(validateRefundAmount(Number.NaN, order(), []).allowed).toBe(false);
    expect(validateRefundAmount(10.005, order(), []).allowed).toBe(false);
  });
});

describe("refund method & gateway status", () => {
  it("uses Razorpay only with a verified gateway payment id", () => {
    expect(resolveRefundMethod(order())).toBe("razorpay");
    expect(resolveRefundMethod(order({ paymentGatewayId: null }))).toBe("manual");
    expect(resolveRefundMethod(order({ paymentMethod: "upi_qr" }))).toBe("manual");
  });

  it("maps Razorpay refund statuses", () => {
    expect(mapGatewayRefundStatus("processed")).toBe("processed");
    expect(mapGatewayRefundStatus("failed")).toBe("failed");
    expect(mapGatewayRefundStatus("pending")).toBe("processing");
    expect(mapGatewayRefundStatus(undefined)).toBe("processing");
  });
});
