import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { createMockSupabaseClient } from "./mocks/supabase.mock";

const mockClient = createMockSupabaseClient();
vi.mock("../src/integrations/supabase", () => ({
  getSupabaseClient: () => mockClient,
  getSupabaseAdminClient: () => mockClient,
}));

import { buildApp } from "../src/app";

describe("Customers Profile & Addresses API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /v1/customers/profile returns 401 when unauthorized", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/customers/profile",
    });

    expect(res.statusCode).toBe(401);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("GET /v1/customers/profile returns customer profile with Bearer token", async () => {
    // Mock user lookup for customer-123
    mockClient.auth.admin.getUserById.mockResolvedValueOnce({
      data: {
        user: {
          id: "customer-123",
          email: "customer@example.com",
          created_at: new Date().toISOString(),
          user_metadata: {
            full_name: "Aarav Sharma",
            phone: "+919876543210",
            addresses: [
              {
                id: "addr-1",
                recipientName: "Aarav Sharma",
                phone: "+919876543210",
                addressLine: "Flat 402, Lotus Towers",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "560001",
                isDefault: true,
              },
            ],
          },
        },
      },
      error: null,
    });

    const res = await app.inject({
      method: "GET",
      url: "/v1/customers/profile",
      headers: {
        authorization: "Bearer test-token-customer-123",
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.data.profile.id).toBe("customer-123");
    expect(json.data.profile.email).toBe("customer@example.com");
    expect(Array.isArray(json.data.profile.addresses)).toBe(true);
  });

  it("POST /v1/customers/addresses validates Indian 6-digit pincode", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/customers/addresses",
      headers: {
        authorization: "Bearer test-token-customer-123",
      },
      payload: {
        recipientName: "Aarav Sharma",
        phone: "+919876543210",
        addressLine: "MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "INVALID_PIN",
      },
    });

    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });
});

