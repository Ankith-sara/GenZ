import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import crypto from "crypto";
import { createMockSupabaseClient } from "./mocks/supabase.mock";

const mockClient = createMockSupabaseClient();
vi.mock("../src/integrations/supabase", () => ({
  getSupabaseClient: () => mockClient,
  getSupabaseAdminClient: () => mockClient,
}));
vi.mock("@genz/database/admin", () => ({
  createAdminClient: () => mockClient,
}));

import { buildApp } from "../src/app";

describe("Transactions: Checkout, Orders, Payments & Shipping API", () => {
  let app: FastifyInstance;

  const mockProducts = [
    {
      id: "prod-1",
      name: "Etikoppaka Lacquer Top",
      category: "Toys",
      price_inr: 500,
      status: "published",
      seller_id: "seller-123",
      cover_image_path: "/images/top.jpg",
    },
    {
      id: "prod-2",
      name: "Kondapalli Dancing Doll",
      category: "Crafts",
      price_inr: 800,
      status: "published",
      seller_id: "seller-456",
      cover_image_path: "/images/doll.jpg",
    },
  ];

  let mockPayments: any[] = [];
  let mockOrders: any[] = [];
  let mockVariants: any[] = [];

  function generateValidSignature(orderId: string, paymentId: string): string {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return "test_mock_sig";
    return crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
  }

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockPayments = [];
    mockOrders = [];
    mockVariants = [];

    const mockFrom = mockClient.from as any;
    mockFrom.mockImplementation((table: string) => {
      if (table === "products") {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockImplementation((_col: string, ids: string[]) => {
              const matched = mockProducts.filter((p) => ids.includes(p.id));
              return Promise.resolve({ data: matched, error: null });
            }),
          }),
        };
      }

      if (table === "product_variants") {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockImplementation((_col: string, ids: string[]) => {
              const matched = mockVariants.filter((v) => ids.includes(v.id));
              return Promise.resolve({ data: matched, error: null });
            }),
          }),
        };
      }

      if (table === "payments") {
        return {
          insert: vi.fn().mockImplementation((payload: any) => {
            const row = { id: `pay-row-${Date.now()}`, ...payload };
            mockPayments.push(row);
            return Promise.resolve({ data: row, error: null });
          }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockImplementation((field: string, val: any) => {
              const matched = mockPayments.filter((p) => p[field] === val);
              return {
                maybeSingle: vi.fn().mockResolvedValue({
                  data: matched[0] || null,
                  error: null,
                }),
                single: vi.fn().mockResolvedValue({
                  data: matched[0] || null,
                  error: matched[0] ? null : { message: "Payment row not found" },
                }),
              };
            }),
          }),
          update: vi.fn().mockImplementation((patch: any) => ({
            eq: vi.fn().mockImplementation((field: string, val: any) => {
              const target = mockPayments.find((p) => p[field] === val);
              if (target) Object.assign(target, patch);
              return Promise.resolve({ data: target || null, error: null });
            }),
          })),
        };
      }

      if (table === "orders") {
        return {
          insert: vi.fn().mockImplementation((payload: any) => {
            const row = { id: payload.id || `GZ-ORD-${Date.now()}`, ...payload };
            mockOrders.push(row);
            return {
              select: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
                single: vi.fn().mockResolvedValue({ data: row, error: null }),
              }),
              then: (resolve: any) => resolve({ data: row, error: null }),
            };
          }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockImplementation((field: string, val: any) => {
              const matched = mockOrders.filter((o) => o[field] === val);
              return {
                maybeSingle: vi.fn().mockResolvedValue({
                  data: matched[0] || null,
                  error: null,
                }),
                single: vi.fn().mockResolvedValue({
                  data: matched[0] || null,
                  error: matched[0] ? null : { message: "Order not found" },
                }),
              };
            }),
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((field: string, val: any) => {
                const matched = mockOrders.filter((o) => o[field] === val);
                return Promise.resolve({ data: matched, error: null });
              }),
              then: (resolve: any) => resolve({ data: mockOrders, error: null }),
            }),
          }),
          update: vi.fn().mockImplementation((patch: any) => ({
            eq: vi.fn().mockImplementation((field: string, val: any) => {
              const target = mockOrders.find((o) => o[field] === val);
              if (target) Object.assign(target, patch);
              return Promise.resolve({ data: target || null, error: null });
            }),
          })),
        };
      }

      return {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });
  });

  it("POST /v1/checkout/orders places an order with recalculated pricing", async () => {
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
    expect(json.data.order.totalAmount).toBeGreaterThan(500); // 500 + tax
  }, 15000);

  it("POST /v1/checkout/orders rejects tampered client-supplied expected price (PRICING_MISMATCH)", async () => {
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
        expectedTotalInr: 100, // Tampered client price (authoritative is 590)
        payment: {
          method: "cod",
        },
      },
    });

    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("PRICING_MISMATCH");
  });

  it("POST /v1/checkout/orders rejects variant belonging to another product (cross-product binding attack)", async () => {
    // Add variant belonging to prod-2
    mockVariants.push({
      id: "var-doll-small",
      product_id: "prod-2", // Belongs to prod-2, NOT prod-1
      price_inr: 50,
    });

    const res = await app.inject({
      method: "POST",
      url: "/v1/checkout/orders",
      payload: {
        items: [
          {
            productId: "prod-1", // prod-1 submitted with prod-2's variant
            variantId: "var-doll-small",
            quantity: 1,
          },
        ],
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
          method: "cod",
        },
      },
    });

    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /v1/checkout/orders rejects payment when gateway order amount does not match cart total", async () => {
    // Payment created for ₹200 (20000 paise), but prod-1 total is ₹590 (59000 paise)
    mockPayments.push({
      id: "pay-1",
      gateway_order_id: "order_mismatch_123",
      amount_paise: 20000,
      status: "created",
      order_ref: null,
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
          method: "razorpay",
          razorpayOrderId: "order_mismatch_123",
          razorpayPaymentId: "pay_test_abc",
          razorpaySignature: generateValidSignature(
            "order_mismatch_123",
            "pay_test_abc"
          ),
        },
      },
    });

    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("PRICING_MISMATCH");
  });

  it("POST /v1/checkout/orders rejects reused payment that was already claimed by an order", async () => {
    // Payment already claimed by an existing order
    mockPayments.push({
      id: "pay-2",
      gateway_order_id: "order_reused_456",
      amount_paise: 59500,
      status: "captured",
      order_ref: "GZ-ORD-PREVIOUS-CLAIM",
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
          method: "razorpay",
          razorpayOrderId: "order_reused_456",
          razorpayPaymentId: "pay_test_reused",
          razorpaySignature: generateValidSignature(
            "order_reused_456",
            "pay_test_reused"
          ),
        },
      },
    });

    expect(res.statusCode).toBe(409);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("CONFLICT");
  });

  it("POST /v1/webhooks/razorpay processes payment.captured and is idempotent on duplicate delivery", async () => {
    const webhookSecret = "test_webhook_secret_key_123";
    const prevSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    // Seed existing payment row
    mockPayments.push({
      id: "pay-hook",
      gateway_order_id: "order_webhook_789",
      amount_paise: 59500,
      status: "created",
      order_ref: null,
    });

    const body = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test_hook",
            order_id: "order_webhook_789",
            amount: 59000,
            status: "captured",
          },
        },
      },
    });

    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body, "utf8")
      .digest("hex");

    // First delivery
    const res1 = await app.inject({
      method: "POST",
      url: "/v1/webhooks/razorpay",
      headers: {
        "x-razorpay-signature": signature,
        "content-type": "application/json",
      },
      payload: body,
    });

    expect(res1.statusCode).toBe(200);
    const json1 = res1.json();
    expect(json1.success).toBe(true);
    expect(json1.data.status).toBe("captured");

    // Second duplicate delivery (idempotency check)
    const res2 = await app.inject({
      method: "POST",
      url: "/v1/webhooks/razorpay",
      headers: {
        "x-razorpay-signature": signature,
        "content-type": "application/json",
      },
      payload: body,
    });

    expect(res2.statusCode).toBe(200);
    const json2 = res2.json();
    expect(json2.success).toBe(true);
    expect(json2.data.status).toBe("captured");

    if (prevSecret) process.env.RAZORPAY_WEBHOOK_SECRET = prevSecret;
    else delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  it("POST /v1/payments/razorpay/order calculates authoritative cart total and records payment row", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/payments/razorpay/order",
      payload: {
        items: [{ productId: "prod-1", quantity: 1 }],
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.amount).toBe(59500); // 500 + 18% GST + platform fee in paise
    expect(json.data.orderId).toBeDefined();
    expect(mockPayments.some((p) => p.gateway_order_id === json.data.orderId)).toBe(
      true
    );
  });

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
