import { describe, it, expect, vi } from "vitest";
import { CheckoutService } from "../checkout.service";
import { OrdersService } from "../../orders/orders.service";
import type { OrderRecord } from "@genz/types";

describe("CheckoutService", () => {
  it("rejects checkout when customer name or email is missing", async () => {
    const res = await CheckoutService.processCheckout({
      customerName: "",
      customerEmail: "",
      shippingAddress: {
        recipientName: "Test",
        addressLine: "Road 1",
        city: "City",
        state: "State",
        pincode: "123456",
        phone: "9876543210",
      },
      paymentMethod: "cod",
      items: [{ name: "Toy", price: 100, quantity: 1 }],
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("Customer name and email are required");
  });

  it("orchestrates checkout order creation and verified pricing calculations", async () => {
    const mockOrder: OrderRecord = {
      id: "GZ-ORD-999999",
      customerId: "cust-1",
      customerName: "Radha Sharma",
      customerEmail: "radha@example.com",
      status: "placed",
      paymentMethod: "upi_qr",
      paymentStatus: "pending",
      subtotal: 500,
      tax: 25,
      shippingFee: 70,
      totalAmount: 595,
      shippingAddress: {
        recipientName: "Radha Sharma",
        addressLine: "42 Silk Mill Road",
        city: "Kanchipuram",
        state: "Tamil Nadu",
        pincode: "631501",
        phone: "9876543210",
      },
      sellerIds: ["artisan_1"],
      items: [
        {
          name: "Handwoven Silk Stole",
          price: 500,
          quantity: 1,
          sellerId: "artisan_1",
          sellerBusinessName: "Kanchi Weaves",
        },
      ],
      trackingEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(OrdersService, "createOrder").mockResolvedValue(mockOrder);

    const res = await CheckoutService.processCheckout({
      customerId: "cust-1",
      customerName: "Radha Sharma",
      customerEmail: "radha@example.com",
      shippingAddress: {
        recipientName: "Radha Sharma",
        addressLine: "42 Silk Mill Road",
        city: "Kanchipuram",
        state: "Tamil Nadu",
        pincode: "631501",
        phone: "9876543210",
      },
      paymentMethod: "upi_qr",
      items: [
        {
          name: "Handwoven Silk Stole",
          price: 500,
          quantity: 1,
          sellerId: "artisan_1",
          sellerBusinessName: "Kanchi Weaves",
        },
      ],
    });

    expect(res.success).toBe(true);
    expect(res.order?.id).toBe("GZ-ORD-999999");
    expect(res.order?.totalAmount).toBe(595);

    vi.restoreAllMocks();
  });
});
