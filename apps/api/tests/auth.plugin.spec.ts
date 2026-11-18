import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { sendSuccess } from "../src/common/utils/response";

describe("Authentication Plugin & Guard", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();

    // Register test routes to verify authentication decorators
    app.get(
      "/test/protected",
      { preHandler: [app.authenticate] },
      async (req, reply) => {
        return sendSuccess(reply, { user: req.user });
      }
    );

    app.get(
      "/test/optional",
      { preHandler: [app.optionalAuthenticate] },
      async (req, reply) => {
        return sendSuccess(reply, { user: req.user || null });
      }
    );

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects unauthenticated request on protected route with 401", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/test/protected",
    });

    expect(res.statusCode).toBe(401);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("authenticates valid test bearer token and attaches user context", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/test/protected",
      headers: {
        authorization: "Bearer test-token-customer-123",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.user.id).toBe("customer-123");
    expect(json.data.user.role).toBe("buyer");
  });

  it("allows unauthenticated guest access on optional route", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/test/optional",
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.user).toBeNull();
  });

  it("attaches user context on optional route when token is provided", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/test/optional",
      headers: {
        authorization: "Bearer test-token-guest-turned-user",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.user.id).toBe("guest-turned-user");
  });
});

