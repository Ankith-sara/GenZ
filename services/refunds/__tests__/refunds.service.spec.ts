import { describe, it, expect, vi, beforeEach } from "vitest";
import type { OrderRecord, RefundRecord } from "@genz/types";

const store = vi.hoisted(() => ({
  refunds: [] as RefundRecord[],
}));

vi.mock("@genz/database/refunds", () => ({
  RefundStoreError: class RefundStoreError extends Error {},
  listRefunds: vi.fn(async () => store.refunds),
  insertRefund: vi.fn(async (input: Record<string, unknown>) => {
    const r = {
      id: "11111111-1111-4111-8111-111111111111",
      orderId: input.orderId,
      amount: input.amount,
      currency: "INR",
      reason: input.reason ?? null,
      type: input.type,
      status: input.status ?? "requested",
      method: input.method,
      gatewayPaymentId: input.gatewayPaymentId ?? null,
      gatewayRefundId: null,
      manualReference: null,
      failureReason: null,
      requestedBy: input.requestedBy ?? null,
      reviewedBy: null,
      adminNote: null,
      processedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as RefundRecord;
    store.refunds.push(r);
    return r;
  }),
  getRefundById: vi.fn(async (id: string) => store.refunds.find((r) => r.id === id) ?? null),
  getRefundByGatewayRefundId: vi.fn(async () => null),
  transitionRefund: vi.fn(async () => null),
}));

vi.mock("@genz/database/orders", () => ({ applyOrderRefundTotals: vi.fn() }));
vi.mock("@genz/database/accounting", () => ({
  recordRefundJournal: vi.fn(),
  reverseOrderCommissions: vi.fn(),
}));

import { RefundsService } from "../refunds.service";
import { OrdersRepository } from "../../orders/orders.repository";
import { CustomerNotificationsService } from "../../notifications/notifications.service";
import { insertRefund } from "@genz/database/refunds";

function order(overrides: Partial<OrderRecord> = {}): OrderRecord {
  return {
    id: "GZ-ORD-200001",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    customerId: "owner-1",
    customerName: "Meera",
    customerEmail: "meera@example.com",
    shippingAddress: {
      recipientName: "Meera",
      phone: "9876543210",
      addressLine: "5 Lake Rd",
      city: "Mysuru",
      state: "KA",
      pincode: "570001",
    },
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    paymentGatewayId: "pay_XYZ",
    status: "processing",
    subtotal: 800,
    tax: 40,
    shippingFee: 70,
    totalAmount: 910,
    items: [{ name: "Etikoppaka toy", price: 800, quantity: 1 }],
    sellerIds: ["s1"],
    trackingEvents: [],
    ...overrides,
  };
}

describe("RefundsService.cancelOrderByCustomer", () => {
  beforeEach(() => {
    store.refunds = [];
    vi.restoreAllMocks();
    vi.mocked(insertRefund).mockClear();
    vi.spyOn(CustomerNotificationsService, "sendOrderStatusUpdate").mockResolvedValue({
      success: true,
    });
  });

  it("refuses to cancel another customer's order without revealing it", async () => {
    vi.spyOn(OrdersRepository, "getById").mockResolvedValue(order({ customerId: "someone-else" }));
    const update = vi.spyOn(OrdersRepository, "updateStatus");

    const res = await RefundsService.cancelOrderByCustomer({
      orderId: "GZ-ORD-200001",
      userId: "owner-1",
    });

    expect(res).toEqual({ success: false, error: "Order not found." });
    expect(update).not.toHaveBeenCalled();
    expect(insertRefund).not.toHaveBeenCalled();
  });

  it("refuses to cancel a shipped order", async () => {
    vi.spyOn(OrdersRepository, "getById").mockResolvedValue(order({ status: "shipped" }));
    const update = vi.spyOn(OrdersRepository, "updateStatus");
    const res = await RefundsService.cancelOrderByCustomer({ orderId: "x", userId: "owner-1" });
    expect(res.success).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("cancels a paid order and opens a full cancellation refund", async () => {
    vi.spyOn(OrdersRepository, "getById").mockResolvedValue(order());
    vi.spyOn(OrdersRepository, "updateStatus").mockResolvedValue(order({ status: "cancelled" }));

    const res = await RefundsService.cancelOrderByCustomer({
      orderId: "GZ-ORD-200001",
      userId: "owner-1",
      reason: "Ordered by mistake",
    });

    expect(res.success).toBe(true);
    expect(insertRefund).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "GZ-ORD-200001",
        amount: 910,
        type: "cancellation",
        method: "razorpay",
        status: "requested",
        requestedBy: "owner-1",
      })
    );
    expect(CustomerNotificationsService.sendOrderStatusUpdate).toHaveBeenCalled();
  });

  it("cancels an unpaid COD order without creating a refund", async () => {
    vi.spyOn(OrdersRepository, "getById").mockResolvedValue(
      order({ paymentMethod: "cod", paymentStatus: "pending", paymentGatewayId: null })
    );
    vi.spyOn(OrdersRepository, "updateStatus").mockResolvedValue(order({ status: "cancelled" }));

    const res = await RefundsService.cancelOrderByCustomer({ orderId: "x", userId: "owner-1" });
    expect(res.success).toBe(true);
    expect(res.refund).toBeUndefined();
    expect(insertRefund).not.toHaveBeenCalled();
  });
});

describe("RefundsService.requestReturn", () => {
  beforeEach(() => {
    store.refunds = [];
    vi.restoreAllMocks();
    vi.mocked(insertRefund).mockClear();
  });

  it("only lets the owner request a return", async () => {
    vi.spyOn(OrdersRepository, "getById").mockResolvedValue(
      order({ customerId: "someone-else", status: "delivered" })
    );
    const res = await RefundsService.requestReturn({
      orderId: "x",
      userId: "owner-1",
      reason: "Damaged in transit",
    });
    expect(res.success).toBe(false);
    expect(insertRefund).not.toHaveBeenCalled();
  });
});
