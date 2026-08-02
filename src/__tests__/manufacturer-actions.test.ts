import { describe, it, expect, vi, beforeEach } from "vitest";
import { signupManufacturer } from "@/app/signup/manufacturer/actions";

// Mock Supabase server client & rate limiter
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-123" } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ blocked: false }),
  logRateLimitAttempt: vi.fn().mockResolvedValue({}),
}));

describe("signupManufacturer Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts founder_name correctly for Startup / Brand signups", async () => {
    const formData = new FormData();
    formData.append("email", "founder@brand.com");
    formData.append("password", "brandPass123");
    formData.append("founder_name", "Ankith Sara");
    formData.append("business_type", "startup");
    formData.append("business_name", "Artisanal Co.");
    formData.append("country_code", "+91");
    formData.append("phone", "9876543210");

    const result = await signupManufacturer({}, formData);
    // Should NOT throw "Name is required"
    expect(result.error).toBeUndefined();
  });

  it("extracts owner_name correctly for Regular Manufacturer signups", async () => {
    const formData = new FormData();
    formData.append("email", "owner@factory.com");
    formData.append("password", "factoryPass123");
    formData.append("owner_name", "Rajesh Kumar");
    formData.append("business_type", "manufacturer");
    formData.append("business_name", "Apex Industrial Polymers");
    formData.append("country_code", "+91");
    formData.append("phone", "9123456789");

    const result = await signupManufacturer({}, formData);
    expect(result.error).toBeUndefined();
  });

  it("returns validation error when email is missing or malformed", async () => {
    const formData = new FormData();
    formData.append("email", "invalid-email");
    formData.append("password", "factoryPass123");
    formData.append("owner_name", "Rajesh Kumar");

    const result = await signupManufacturer({}, formData);
    expect(result.error).toBeDefined();
  });

  it("returns rate limit error when endpoint rate limit is exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limiter");
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      blocked: true,
      error: "Too many attempts. Please try again later.",
    });

    const formData = new FormData();
    formData.append("email", "blocked@factory.com");
    formData.append("password", "factoryPass123");

    const result = await signupManufacturer({}, formData);
    expect(result.error).toContain("Too many attempts");
  });
});
