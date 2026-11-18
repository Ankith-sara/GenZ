import { describe, it, expect, vi } from "vitest";
import { GenZApiClient, ApiError } from "./client";

describe("GenZApiClient", () => {
  it("initializes with base URL and authorization token", () => {
    const client = new GenZApiClient({
      baseUrl: "http://localhost:4000",
      token: "test-token",
    });

    expect(client).toBeDefined();
    expect(client.catalog).toBeDefined();
    expect(client.customers).toBeDefined();
    expect(client.checkout).toBeDefined();
    expect(client.orders).toBeDefined();
    expect(client.payments).toBeDefined();
    expect(client.shipping).toBeDefined();
  });

  it("sends Bearer Authorization header when token is provided", async () => {
    const originalFetch = globalThis.fetch;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true, data: { product: { id: "p1" } } }),
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    try {
      const client = new GenZApiClient({
        baseUrl: "http://localhost:4000",
        token: "secret-token",
      });

      const result = await client.catalog.getProductDetails("p1");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("http://localhost:4000/v1/catalog/products/p1");
      const headers = init.headers as Headers;
      expect(headers.get("authorization")).toBe("Bearer secret-token");
      expect(result).toEqual({ product: { id: "p1" } });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("handles API error responses gracefully", async () => {
    const originalFetch = globalThis.fetch;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Product not found",
        },
      }),
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    try {
      const client = new GenZApiClient({
        baseUrl: "http://localhost:4000",
      });

      await expect(client.catalog.getProductDetails("missing")).rejects.toThrow(ApiError);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
