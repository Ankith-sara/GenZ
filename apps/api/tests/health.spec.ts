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
});

