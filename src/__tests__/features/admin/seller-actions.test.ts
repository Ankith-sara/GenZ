import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-key";

// Mock rate limiter
vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ blocked: false }),
  logRateLimitAttempt: vi.fn().mockResolvedValue(undefined),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map([["x-forwarded-for", "127.0.0.1"]])),
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

import {
  approveSeller,
  rejectSeller,
} from "@/app/admin/dashboard/verifications/actions";

// Mock Supabase admin client
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockImplementation(() => ({
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_new_seller_01", email: "seller@genz.in" } },
          error: null,
        }),
      },
    },
    from: vi.fn().mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle,
    }),
  })),
}));

// Mock requireRole
vi.mock("@/features/auth/lib/require-role", () => ({
  requireRole: vi.fn().mockResolvedValue({
    userId: "admin_user_01",
    role: "admin",
  }),
}));

describe("Admin Feature: Seller Verification Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails approval when applicationId is missing from form payload", async () => {
    const formData = new FormData();
    const result = await approveSeller({}, formData);
    expect(result.error).toBe("Application ID missing.");
  });

  it("fails rejection when sellerId or reason is missing", async () => {
    const formData = new FormData();
    formData.append("sellerId", "app_123");
    // Reason omitted
    const result = await rejectSeller({}, formData);
    expect(result.error).toBe("Rejection reason is required");
  });
});
