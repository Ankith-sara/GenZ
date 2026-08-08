import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireRole } from "@/features/auth/lib/require-role";

// Mock Supabase server client & Auth session
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    })
  ),
}));

// Mock Next.js navigation redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

describe("Role Authorization & Access Control (requireRole)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated user to login page", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("No session found"),
    });

    await expect(requireRole("admin")).rejects.toThrow("REDIRECT:/login");
  });

  it("grants access when user has the requested role in public profile table", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user_admin_01", email: "admin@genz.in" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "user_admin_01", role: "admin" },
            error: null,
          }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: "user_admin_01", status: "verified" },
            error: null,
          }),
        }),
      }),
    });

    const session = await requireRole("admin");
    expect(session.userId).toBe("user_admin_01");
    expect(session.email).toBe("admin@genz.in");
    expect(session.user.id).toBe("user_admin_01");
  });

  it("redirects unauthorized role to profile page", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user_buyer_01", email: "buyer@genz.in" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "user_buyer_01", role: "buyer" },
            error: null,
          }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    await expect(requireRole("admin")).rejects.toThrow("REDIRECT:/profile");
  });

  it("grants access for seller role access check", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user_seller_01", email: "seller@genz.in" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "user_seller_01", role: "seller" },
            error: null,
          }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: "user_seller_01", status: "verified" },
            error: null,
          }),
        }),
      }),
    });

    const session = await requireRole("seller");
    expect(session.userId).toBe("user_seller_01");
  });
});
