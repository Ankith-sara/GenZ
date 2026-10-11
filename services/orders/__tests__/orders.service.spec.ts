import { describe, it, expect } from "vitest";
import { OrdersService } from "../orders.service";

describe("OrdersService", () => {
  it("enforces valid status transition state transitions", () => {
    expect(OrdersService.isAllowedTransition("placed", "processing")).toBe(true);
    expect(OrdersService.isAllowedTransition("processing", "shipped")).toBe(true);
    expect(OrdersService.isAllowedTransition("shipped", "delivered")).toBe(true);
    expect(OrdersService.isAllowedTransition("placed", "cancelled")).toBe(true);

    // Disallowed transitions
    expect(OrdersService.isAllowedTransition("placed", "delivered")).toBe(false);
    expect(OrdersService.isAllowedTransition("delivered", "placed")).toBe(false);
    expect(OrdersService.isAllowedTransition("cancelled", "shipped")).toBe(false);
  });

  it("fails to create order when items list is empty", async () => {
    await expect(
      OrdersService.createOrder({
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        shippingAddress: {
          recipientName: "Jane Doe",
          addressLine: "123 Craft Lane",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
          phone: "9876543210",
        },
        paymentMethod: "cod",
        items: [],
        subtotal: 0,
        tax: 0,
        shippingFee: 0,
        totalAmount: 0,
      })
    ).rejects.toThrow("Cannot create an order with zero items");
  });
});
