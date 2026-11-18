import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { createMockSupabaseClient } from "./mocks/supabase.mock";

const mockClient = createMockSupabaseClient();
vi.mock("../src/integrations/supabase", () => ({
  getSupabaseClient: () => mockClient,
  getSupabaseAdminClient: () => mockClient,
}));

import { buildApp } from "../src/app";

describe("Sellers Fastify API Endpoints", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /v1/sellers/:id/public-profile returns public profile without auth", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/sellers/etikoppaka-lacquer-crafts/public-profile",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.seller.business_name).toBe("Etikoppaka Heritage Lacquer Toys");
    expect(json.data.seller.city).toBe("Etikoppaka");
  });

  it("GET /v1/sellers/me/overview returns 401 when unauthenticated", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/sellers/me/overview",
    });

    expect(res.statusCode).toBe(401);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("GET /v1/sellers/me/overview returns 403 when user is buyer instead of seller", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/sellers/me/overview",
      headers: {
        authorization: "Bearer test-token-buyer-123",
      },
    });

    expect(res.statusCode).toBe(403);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("FORBIDDEN");
  });

  it("GET /v1/sellers/me/overview succeeds for seller", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/sellers/me/overview",
      headers: {
        authorization: "Bearer test-token-seller-456",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("productCount");
    expect(json.data).toHaveProperty("totalOrdersCount");
    expect(json.data).toHaveProperty("documentCount");
  });

  it("GET /v1/sellers/me/profile returns seller profile", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/sellers/me/profile",
      headers: {
        authorization: "Bearer test-token-seller-456",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("profile");
  });

  it("PUT /v1/sellers/me/profile updates seller profile details", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/v1/sellers/me/profile",
      headers: {
        authorization: "Bearer test-token-seller-456",
      },
      payload: {
        business_name: "Heritage Woodcrafters",
        city: "Etikoppaka",
        state: "Andhra Pradesh",
        pincode: "531055",
        gst_number: "37AAAAA0000A1Z5",
        established_year: 1990,
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.success).toBe(true);
  });

  it("POST /v1/sellers/me/verify marks profile as submitted for review", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/sellers/me/verify",
      headers: {
        authorization: "Bearer test-token-seller-456",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("submitted");
  });

  it("GET /v1/sellers/me/products lists seller products", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/sellers/me/products",
      headers: {
        authorization: "Bearer test-token-seller-456",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("products");
    expect(Array.isArray(json.data.products)).toBe(true);
  });

  it("POST /v1/sellers/me/products creates a product under seller ownership", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/sellers/me/products",
      headers: {
        authorization: "Bearer test-token-seller-456",
      },
      payload: {
        name: "Handcrafted Wooden Tops",
        category: "toys",
        price_inr: 450,
        materials: ["Ankudi Karra wood", "Natural lacquer"],
        inventory_count: 25,
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.product).toBeDefined();
  });

  it("GET /v1/sellers/me/orders returns orders scoped to seller", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/sellers/me/orders",
      headers: {
        authorization: "Bearer test-token-seller-456",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("orders");
    expect(Array.isArray(json.data.orders)).toBe(true);
  });
});

