import { describe, it, expect, beforeEach, vi } from "vitest";
import type { CreateOrderInput } from "./orders";

// Mock Supabase admin client to isolate logic & fallback storage tests
vi.mock("./admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

describe("Orders Domain Service Specs", () => {
  let ordersService: typeof import("./orders");

  beforeEach(async () => {
    vi.clearAllMocks();
    ordersService = await import("./orders");
  });

  const mockOrderInput: CreateOrderInput = {
    customerId: "cust-123",
    customerName: "Ankith Sharma",
    customerEmail: "ankith@example.com",
    customerPhone: "+91 9876543210",
    shippingAddress: {
      recipientName: "Ankith Sharma",
      phone: "+91 9876543210",
      addressLine: "123 MG Road, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
    },
    paymentMethod: "cod",
    items: [
      {
        productId: "prod-1",
        title: "Channapatna Wooden Rocking Horse",
        name: "Channapatna Wooden Rocking Horse",
        price: 1299,
        quantity: 1,
        sellerId: "seller-alpha",
        image: "https://example.com/horse.jpg",
      },
      {
        productId: "prod-2",
        title: "Kondapalli Dancing Doll",
        name: "Kondapalli Dancing Doll",
        price: 850,
        quantity: 2,
        sellerId: "seller-beta",
        image: "https://example.com/doll.jpg",
      },
    ],
    subtotal: 2999,
    tax: 360,
    shippingFee: 0,
    totalAmount: 3359,
    notes: "Please pack with extra bubble wrap",
  };

  describe("createOrderRecord", () => {
    it("generates a well-formed order with GZ-ORD prefix and distinct seller IDs", async () => {
      const order = await ordersService.createOrderRecord(mockOrderInput);

      expect(order.id).toMatch(/^GZ-ORD-\d{6}$/);
      expect(order.customerName).toBe("Ankith Sharma");
      expect(order.totalAmount).toBe(3359);
      expect(order.paymentStatus).toBe("pending");
      expect(order.status).toBe("placed");

      // Verify seller IDs aggregation from multiple items
      expect(order.sellerIds).toContain("seller-alpha");
      expect(order.sellerIds).toContain("seller-beta");
      expect(order.sellerIds).toHaveLength(2);

      // Verify initial tracking event
      expect(order.trackingEvents).toBeDefined();
      expect(order.trackingEvents.length).toBeGreaterThanOrEqual(1);
      expect(order.trackingEvents[0].status).toBe("placed");
      expect(order.trackingEvents[0].title).toBe("Order Placed");
    });

    it("defaults payment status to paid when payment method is online", async () => {
      const onlineInput = {
        ...mockOrderInput,
        paymentMethod: "online",
      };

      const order = await ordersService.createOrderRecord(onlineInput);
      expect(order.paymentMethod).toBe("online");
      expect(order.paymentStatus).toBe("paid");
    });
  });

  describe("updateOrderStatus and tracking timeline", () => {
    it("advances order to processing and appends tracking event", async () => {
      const created = await ordersService.createOrderRecord(mockOrderInput);
      const updated = await ordersService.updateOrderStatus(created.id, {
        status: "processing",
        note: "Artisan has started carving the wooden toy",
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe("processing");
      expect(updated!.trackingEvents.length).toBe(created.trackingEvents.length + 1);

      const latestEvent = updated!.trackingEvents[updated!.trackingEvents.length - 1];
      expect(latestEvent.status).toBe("processing");
      expect(latestEvent.title).toBe("Order in Processing");
    });

    it("advances order to shipped with carrier and tracking details", async () => {
      const created = await ordersService.createOrderRecord(mockOrderInput);
      const updated = await ordersService.updateOrderStatus(created.id, {
        status: "shipped",
        carrier: "BlueDart Express",
        trackingNumber: "BD99283741IN",
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe("shipped");
      expect(updated!.carrier).toBe("BlueDart Express");
      expect(updated!.trackingNumber).toBe("BD99283741IN");

      const latestEvent = updated!.trackingEvents[updated!.trackingEvents.length - 1];
      expect(latestEvent.status).toBe("shipped");
      expect(latestEvent.description).toContain("BlueDart Express");
      expect(latestEvent.description).toContain("BD99283741IN");
    });

    it("automatically sets payment status to paid when order is marked delivered", async () => {
      const created = await ordersService.createOrderRecord(mockOrderInput);
      expect(created.paymentStatus).toBe("pending");

      const delivered = await ordersService.updateOrderStatus(created.id, {
        status: "delivered",
      });

      expect(delivered).not.toBeNull();
      expect(delivered!.status).toBe("delivered");
      expect(delivered!.paymentStatus).toBe("paid");

      const latestEvent = delivered!.trackingEvents[delivered!.trackingEvents.length - 1];
      expect(latestEvent.status).toBe("delivered");
      expect(latestEvent.title).toBe("Order Delivered");
    });
  });

  describe("getOrderById and getOrders filtering", () => {
    it("retrieves the order by matching ID", async () => {
      const created = await ordersService.createOrderRecord(mockOrderInput);
      const found = await ordersService.getOrderById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.customerEmail).toBe("ankith@example.com");
    });

    it("returns null for non-existent order ID", async () => {
      const found = await ordersService.getOrderById("NON-EXISTENT-ID-999");
      expect(found).toBeNull();
    });

    it("filters orders by sellerId correctly", async () => {
      const uniqueSeller = `seller-unique-${Date.now()}`;
      const sellerInput: CreateOrderInput = {
        ...mockOrderInput,
        items: [
          {
            productId: "prod-special",
            title: "Special Clay Figurine",
            name: "Special Clay Figurine",
            price: 500,
            quantity: 1,
            sellerId: uniqueSeller,
          },
        ],
      };

      const order = await ordersService.createOrderRecord(sellerInput);
      const sellerOrders = await ordersService.getOrders({ sellerId: uniqueSeller });

      expect(sellerOrders.length).toBeGreaterThanOrEqual(1);
      expect(sellerOrders.some((o) => o.id === order.id)).toBe(true);

      const unrelatedOrders = await ordersService.getOrders({ sellerId: "seller-does-not-exist" });
      expect(unrelatedOrders).toHaveLength(0);
    });

    it("filters orders by customerId correctly", async () => {
      const uniqueCust = `cust-filter-test-${Date.now()}`;
      const custInput: CreateOrderInput = {
        ...mockOrderInput,
        customerId: uniqueCust,
      };

      const order = await ordersService.createOrderRecord(custInput);
      const customerOrders = await ordersService.getOrders({ customerId: uniqueCust });

      expect(customerOrders.length).toBeGreaterThanOrEqual(1);
      expect(customerOrders.some((o) => o.id === order.id)).toBe(true);
    });
  });
});
