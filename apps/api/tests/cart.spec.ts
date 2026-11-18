import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { createMockSupabaseClient } from "./mocks/supabase.mock";

const mockClient = createMockSupabaseClient();
vi.mock("../src/integrations/supabase", () => ({
  getSupabaseClient: () => mockClient,
  getSupabaseAdminClient: () => mockClient,
}));

import { buildApp } from "../src/app";

describe("Cart Validation & Calculation API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/cart/validate returns 400 when cart is empty", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/cart/validate",
      payload: { items: [] },
    });

    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json.success).toBe(false);
  });

  it("POST /v1/cart/validate recalculates pricing using database records", async () => {
    // Mock database return for products
    const mockFrom = mockClient.from as any;
    mockFrom.mockImplementation((table: string) => {
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                id: "prod-1",
                name: "Etikoppaka Handcrafted Top",
                category: "Toys",
                price_inr: 450,
                status: "published",
                seller_id: "seller-1",
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
      url: "/v1/cart/validate",
      payload: {
        items: [
          {
            productId: "prod-1",
            quantity: 2,
            // Caller attempts to tamper with price: 10 INR
            price: 10,
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.valid).toBe(true);
    expect(json.data.itemCount).toBe(2);

    // Verified price is 450 (not 10!), subtotal = 900
    const item = json.data.items[0];
    expect(item.price).toBe(450);
    expect(item.lineTotal).toBe(900);
    expect(json.data.pricing.subtotal).toBe(900);
    expect(json.data.pricing.total).toBeGreaterThan(900);
  });
});

