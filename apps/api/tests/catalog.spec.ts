import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { FastifyInstance } from "fastify";
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

describe("Catalog, Categories, Search & Sellers API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /v1/catalog/products returns list with pagination metadata", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/catalog/products?page=0&limit=10",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.products)).toBe(true);
    expect(json.data.page).toBe(0);
    expect(json.data.limit).toBe(10);
    expect(typeof json.data.hasMore).toBe("boolean");
  });

  it("GET /v1/catalog/featured returns featured products and sellers", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/catalog/featured",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.products)).toBe(true);
    expect(Array.isArray(json.data.sellers)).toBe(true);
  });

  it("GET /v1/categories returns list of platform categories", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/categories",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.categories)).toBe(true);
  });

  it("GET /v1/search returns structured search results for query", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/search?q=",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.products)).toBe(true);
    expect(Array.isArray(json.data.categories)).toBe(true);
  });

  it("GET /v1/sellers/:id/public-profile returns curated master artisan profile", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/sellers/etikoppaka-lacquer-crafts/public-profile",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.profile.business_name).toBe("Etikoppaka Heritage Lacquer Toys");
    expect(json.data.profile.maker_name).toBe("Polumuri Nageswara Rao");
  });
});
