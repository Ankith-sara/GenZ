import { describe, it, expect } from "vitest";
import { NotificationsService } from "../notifications.service";

describe("NotificationsService", () => {
  it("returns error result gracefully when seller email cannot be resolved", async () => {
    const result = await NotificationsService.sendSellerOrderNotification({
      sellerId: "unknown-seller-id",
      sellerName: "Test Artisan",
      orderId: "GZ-ORD-111",
      customerName: "Buyer Kumar",
      shippingAddress: {
        recipientName: "Buyer Kumar",
        addressLine: "123 Road",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        phone: "9876543210",
      },
      items: [{ name: "Toy", quantity: 1, price: 500 }],
      totalAmount: 500,
      paymentMethod: "UPI",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
