import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-key";

// Mock rate limiter
vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ blocked: false }),
  logRateLimitAttempt: vi.fn().mockResolvedValue(undefined),
  withRateLimit: vi.fn().mockImplementation(async (_options, fn) => fn()),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
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

vi.mock("@/lib/resend", () => ({
  sendSellerApprovalEmail: vi.fn(),
}));

import {
  approveSeller,
  rejectSeller,
} from "@/app/admin/dashboard/verifications/actions";
import { sendSellerApprovalEmail } from "@/lib/resend";

// Mock Supabase admin client
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockUpsert = vi.fn();
const mockEq = vi.fn();
const mockOr = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockImplementation(() => ({
    auth: {
      admin: {
        listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
        createUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_new_seller_01", email: "seller@genz.in" } },
          error: null,
        }),
      },
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: mockUpsert.mockResolvedValue({ error: null }),
      eq: vi.fn().mockReturnThis(),
      or: mockOr.mockResolvedValue({ error: null }),
      maybeSingle: mockMaybeSingle.mockResolvedValue({
        data: {
          id: "app_123",
          business_name: "Artisan Toys Co",
          full_name: "Rajesh Kumar",
          email: "rajesh@artisantoys.com",
          phone: "9876543210",
          business_type: "Manufacturer",
          form_data: { city: "Jaipur", state: "Rajasthan" },
        },
      }),
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

  it("approves seller application and sets emailSent: true when Resend email succeeds", async () => {
    vi.mocked(sendSellerApprovalEmail).mockResolvedValue({
      success: true,
      id: "msg_12345",
    });

    const formData = new FormData();
    formData.append("applicationId", "app_123");
    formData.append("email", "rajesh@artisantoys.com");
    formData.append("password", "SecurePass123!");
    formData.append("sendEmail", "on");

    const result = await approveSeller({}, formData);

    expect(result.success).toBe(true);
    expect(result.credentials).toEqual({
      email: "rajesh@artisantoys.com",
      password: "SecurePass123!",
      emailSent: true,
      emailError: undefined,
    });
    expect(sendSellerApprovalEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "rajesh@artisantoys.com",
        fullName: "Rajesh Kumar",
        businessName: "Artisan Toys Co",
        password: "SecurePass123!",
      })
    );
  });

  it("approves seller application and sets emailSent: false with error when Resend email fails", async () => {
    vi.mocked(sendSellerApprovalEmail).mockResolvedValue({
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables.",
    });

    const formData = new FormData();
    formData.append("applicationId", "app_123");
    formData.append("email", "rajesh@artisantoys.com");
    formData.append("password", "SecurePass123!");
    formData.append("sendEmail", "on");

    const result = await approveSeller({}, formData);

    expect(result.success).toBe(true);
    expect(result.credentials).toEqual({
      email: "rajesh@artisantoys.com",
      password: "SecurePass123!",
      emailSent: false,
      emailError: "RESEND_API_KEY is not configured in environment variables.",
    });
  });
});
