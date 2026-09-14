import { describe, it, expect } from "vitest";
import type { OrderRecord, OrderStatus } from "@genz/types";

// Security state machine transition rules for seller order fulfillment
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function validateStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  carrier?: string,
  trackingNumber?: string
): { valid: boolean; error?: string } {
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext.includes(nextStatus)) {
    return {
      valid: false,
      error: `Invalid transition: Cannot change order status from "${currentStatus}" to "${nextStatus}".`,
    };
  }

  if (nextStatus === "shipped") {
    if (!carrier?.trim() || !trackingNumber?.trim()) {
      return {
        valid: false,
        error:
          "Carrier partner and tracking number are required when marking an order as shipped.",
      };
    }
  }

  return { valid: true };
}

// Scoping logic used by seller order views
function scopeOrdersForSeller(
  orders: OrderRecord[],
  authenticatedSellerId: string
): OrderRecord[] {
  // Only include orders that contain items from the authenticated seller
  const relevantOrders = orders.filter(
    (order) =>
      (order.sellerIds && order.sellerIds.includes(authenticatedSellerId)) ||
      (order.items || []).some(
        (item) => (item.sellerId || item.seller_id) === authenticatedSellerId
      )
  );

  return relevantOrders.map((order) => {
    const sellerItems = (order.items || []).filter(
      (item) => (item.sellerId || item.seller_id) === authenticatedSellerId
    );
    const sellerSubtotal = sellerItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    return {
      ...order,
      items: sellerItems,
      totalAmount: sellerSubtotal,
    };
  });
}

describe("Seller Order Security & Isolation Specs", () => {
  const mockOrders: OrderRecord[] = [
    {
      id: "GZ-ORD-1001",
      orderId: "GZ-ORD-1001",
      customerName: "Buyer One",
      customerEmail: "buyer1@example.com",
      shippingAddress: {
        recipientName: "Buyer One",
        addressLine: "123 Street",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        phone: "+91 9999999999",
      },
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "placed",
      subtotal: 1500,
      tax: 180,
      shippingFee: 0,
      totalAmount: 1680,
      sellerIds: ["seller-alpha"],
      items: [
        {
          productId: "prod-1",
          name: "Channapatna Toy",
          price: 1500,
          quantity: 1,
          sellerId: "seller-alpha",
        },
      ],
      trackingEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "GZ-ORD-1002",
      orderId: "GZ-ORD-1002",
      customerName: "Buyer Two",
      customerEmail: "buyer2@example.com",
      shippingAddress: {
        recipientName: "Buyer Two",
        addressLine: "456 Avenue",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        phone: "+91 8888888888",
      },
      paymentMethod: "online",
      paymentStatus: "paid",
      status: "processing",
      subtotal: 3000,
      tax: 360,
      shippingFee: 0,
      totalAmount: 3360,
      sellerIds: ["seller-beta"],
      items: [
        {
          productId: "prod-2",
          name: "Kondapalli Doll",
          price: 3000,
          quantity: 1,
          sellerId: "seller-beta",
        },
      ],
      trackingEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "GZ-ORD-1003",
      orderId: "GZ-ORD-1003",
      customerName: "Buyer Three",
      customerEmail: "buyer3@example.com",
      shippingAddress: {
        recipientName: "Buyer Three",
        addressLine: "789 Boulevard",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600001",
        phone: "+91 7777777777",
      },
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "placed",
      subtotal: 4500,
      tax: 540,
      shippingFee: 0,
      totalAmount: 5040,
      sellerIds: ["seller-alpha", "seller-beta"],
      items: [
        {
          productId: "prod-1",
          name: "Channapatna Toy",
          price: 1500,
          quantity: 1,
          sellerId: "seller-alpha",
        },
        {
          productId: "prod-2",
          name: "Kondapalli Doll",
          price: 3000,
          quantity: 1,
          sellerId: "seller-beta",
        },
      ],
      trackingEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe("Seller Order Isolation", () => {
    it("returns ONLY orders containing items from the authenticated seller", () => {
      const alphaOrders = scopeOrdersForSeller(mockOrders, "seller-alpha");
      expect(alphaOrders).toHaveLength(2);
      expect(alphaOrders.map((o) => o.id)).toEqual(["GZ-ORD-1001", "GZ-ORD-1003"]);
    });

    it("returns an empty array [] when a seller has zero orders (NEVER leaks all platform orders)", () => {
      const newSellerOrders = scopeOrdersForSeller(
        mockOrders,
        "seller-with-zero-orders"
      );
      expect(newSellerOrders).toEqual([]);
      expect(newSellerOrders).toHaveLength(0);
    });

    it("multi-seller orders strictly isolate items belonging only to the querying seller", () => {
      const alphaOrders = scopeOrdersForSeller(mockOrders, "seller-alpha");
      const multiOrder = alphaOrders.find((o) => o.id === "GZ-ORD-1003");

      expect(multiOrder).toBeDefined();
      expect(multiOrder!.items).toHaveLength(1);
      expect(multiOrder!.items[0].sellerId).toBe("seller-alpha");
      expect(multiOrder!.totalAmount).toBe(1500); // Only Alpha's portion, not 5040
    });
  });

  describe("Fulfillment Status Transitions", () => {
    it("permits valid transitions: placed -> processing -> shipped -> delivered", () => {
      expect(validateStatusTransition("placed", "processing").valid).toBe(true);
      expect(
        validateStatusTransition("processing", "shipped", "Delhivery", "DL123456").valid
      ).toBe(true);
      expect(validateStatusTransition("shipped", "delivered").valid).toBe(true);
    });

    it("permits cancellation from placed or processing states", () => {
      expect(validateStatusTransition("placed", "cancelled").valid).toBe(true);
      expect(validateStatusTransition("processing", "cancelled").valid).toBe(true);
    });

    it("rejects invalid backward transitions (e.g., delivered -> placed)", () => {
      const result = validateStatusTransition("delivered", "placed");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Cannot change order status");
    });

    it("rejects transition to shipped when carrier or trackingNumber is missing", () => {
      const missingCarrier = validateStatusTransition(
        "processing",
        "shipped",
        "",
        "DL123456"
      );
      expect(missingCarrier.valid).toBe(false);
      expect(missingCarrier.error).toContain(
        "Carrier partner and tracking number are required"
      );

      const missingTracking = validateStatusTransition(
        "processing",
        "shipped",
        "Delhivery",
        ""
      );
      expect(missingTracking.valid).toBe(false);
      expect(missingTracking.error).toContain(
        "Carrier partner and tracking number are required"
      );
    });

    it("rejects transitions out of cancelled state", () => {
      expect(validateStatusTransition("cancelled", "processing").valid).toBe(false);
      expect(
        validateStatusTransition("cancelled", "shipped", "Courier", "TRK1").valid
      ).toBe(false);
    });
  });
});
