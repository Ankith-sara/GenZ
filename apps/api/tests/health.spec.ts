import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";

describe("Health & Readiness API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns 200 with standard success envelope", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("ok");
    expect(json.data.service).toBe("@genz/api");
  });

  it("GET /ready returns 200 with readiness data", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/ready",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBeDefined();
  });

  it("returns 404 standard envelope for unknown route", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/non-existent-route",
    });

    expect(res.statusCode).toBe(404);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });

  it("GET /v1/docs serves interactive documentation", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/docs",
    });

    // Fastify Swagger UI either redirects /v1/docs to /v1/docs/ or returns 200 HTML
    expect([200, 301, 302]).toContain(res.statusCode);
  });

  it("GET /v1/docs/json returns valid OpenAPI 3 spec and exports apps/api/openapi.json", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/docs/json",
    });

    expect(res.statusCode).toBe(200);
    const spec = res.json();
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.info.title).toBe("GenZ Artisan Marketplace API");
    expect(spec.paths).toBeDefined();

    // Export to apps/api/openapi.json
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../openapi.json");
    fs.writeFileSync(filePath, JSON.stringify(spec, null, 2), "utf8");
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
