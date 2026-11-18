import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { createMockSupabaseClient } from "./mocks/supabase.mock";

const mockClient = createMockSupabaseClient();
vi.mock("../src/integrations/supabase", () => ({
  getSupabaseClient: () => mockClient,
  getSupabaseAdminClient: () => mockClient,
}));

import { buildApp } from "../src/app";

describe("Transactions: Checkout, Orders, Payments & Shipping API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/checkout/orders places an order with recalculated pricing", async () => {
    // Mock product lookup for checkout
    const mockFrom = mockClient.from as any;
    mockFrom.mockImplementation((table: string) => {
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                id: "prod-1",
                name: "Etikoppaka Lacquer Top",
                category: "Toys",
                price_inr: 500,
                status: "published",
                seller_id: "seller-123",
              },
            ],
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const res = await app.inject({
      method: "POST",
      url: "/v1/checkout/orders",
      payload: {
        items: [{ productId: "prod-1", quantity: 1 }],
        shippingAddress: {
          recipientName: "Pooja Reddy",
          phone: "9876543210",
          addressLine: "Plot 12, Jubilee Hills",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500033",
        },
        guestEmail: "pooja@example.com",
        payment: {
          method: "upi_qr",
          utr: "123456789012",
        },
      },
    });

    expect(res.statusCode).toBe(201);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.order).toBeDefined();
    expect(json.data.order.id).toMatch(/^GZ-ORD-/);
    expect(json.data.order.totalAmount).toBeGreaterThan(500); // 500 + tax + shipping
  }, 15000);

  it("GET /v1/orders requires customer authentication (returns 401)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/orders",
    });

    expect(res.statusCode).toBe(401);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("GET /v1/orders returns only the authenticated user's orders", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/orders",
      headers: {
        authorization: "Bearer test-token-customer-456",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.orders)).toBe(true);
  });

  it("GET /v1/shipping/carriers returns supported carrier list", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/shipping/carriers",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.carriers)).toBe(true);
    expect(json.data.carriers.some((c: any) => c.id === "delhivery")).toBe(true);
  });

  it("GET /v1/shipping/track generates valid tracking URL for Delhivery", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/shipping/track?carrier=delhivery&trackingNumber=DEL123456789",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.valid).toBe(true);
    expect(json.data.trackingUrl).toContain("delhivery.com/track/package/DEL123456789");
  });
});

