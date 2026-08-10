import { describe, it, expect, vi, beforeEach } from "vitest";
import { productSchema } from "@/lib/validation";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "seller-123" } }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "prod-999" }, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

// Mock Supabase admin client
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "seller-123" } }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "prod-999" }, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

// Mock authentication requireRole
vi.mock("@/features/auth/lib/require-role", () => ({
  requireRole: vi.fn().mockResolvedValue({
    userId: "seller-123",
    email: "seller@genz.com",
    role: "seller",
  }),
}));

// Mock rate limiter
vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ blocked: false }),
  logRateLimitAttempt: vi.fn().mockResolvedValue(undefined),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

describe("Product Creation Action & Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully parses valid product creation form data", () => {
    const formData = new FormData();
    formData.append("name", "Artisan Wooden Rocking Horse");
    formData.append("category", "Wooden Toys");
    formData.append("age_group", "3-5 years");
    formData.append(
      "description",
      "Handmade teakwood rocking horse with natural varnish finish."
    );
    formData.append("price_inr", "2499");
    formData.append("materials", "Teakwood, Organic Lacquer, Cotton");

    const fields = {
      name: String(formData.get("name")),
      category: String(formData.get("category")),
      age_group: String(formData.get("age_group")),
      description: String(formData.get("description")),
      price_inr: Number(formData.get("price_inr")),
      materials: String(formData.get("materials"))
        .split(",")
        .map((m) => m.trim()),
    };

    const validation = productSchema.safeParse(fields);
    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(validation.data.name).toBe("Artisan Wooden Rocking Horse");
      expect(validation.data.price_inr).toBe(2499);
      expect(validation.data.materials).toEqual([
        "Teakwood",
        "Organic Lacquer",
        "Cotton",
      ]);
    }
  });

  it("handles fallback and optional fields correctly when missing in payload", () => {
    const fields = {
      name: "Minimalist Puzzle Blocks",
      category: "Educational",
      age_group: null,
      description: null,
      price_inr: 899,
      materials: [],
    };

    const validation = productSchema.safeParse(fields);
    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(validation.data.age_group).toBeNull();
      expect(validation.data.description).toBeNull();
      expect(validation.data.materials).toEqual([]);
    }
  });

  it("rejects product submission when required product name is missing", () => {
    const fields = {
      name: "   ",
      category: "Wooden Toys",
      price_inr: 1200,
    };

    const validation = productSchema.safeParse(fields);
    expect(validation.success).toBe(false);
    if (!validation.success) {
      expect(validation.error.issues[0].message).toBe("Product name is required");
    }
  });
});
