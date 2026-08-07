/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only package so Vitest environment can run server-side guard tests
vi.mock("server-only", () => ({}));

import { requireRole } from "@/lib/require-role";
import * as authLib from "@/lib/auth";

// Mock Next.js navigation redirect to throw a traceable error for test assertions
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error(`NEXT_REDIRECT:${url}`);
    (err as unknown as { digest: string }).digest =
      `NEXT_REDIRECT;replace;${url};307;;`;
    throw err;
  }),
}));

describe("requireRole Authorization Guard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // EDGE CASES & RESTRICTIONS (Fail-Closed Behavior)
  // --------------------------------------------------------------------------

  it("1. [Unauthenticated] Redirects unauthenticated users directly to /login", async () => {
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue(null);

    await expect(requireRole("seller")).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("2. [Privilege Escalation] Redirects a Buyer trying to access a Seller area to /profile", async () => {
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue({
      userId: "user-123",
      email: "buyer@example.com",
      avatarUrl: null,
      profile: { id: "user-123", role: "buyer", full_name: "Regular Buyer" },
      user: {
        id: "user-123",
        email: "buyer@example.com",
        user_metadata: { role: "buyer" },
      },
    } as any);

    await expect(requireRole("seller")).rejects.toThrow("NEXT_REDIRECT:/profile");
  });

  it("3. [Privilege Escalation] Redirects a Buyer trying to access an Admin area to /profile", async () => {
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue({
      userId: "user-123",
      email: "buyer@example.com",
      avatarUrl: null,
      profile: { id: "user-123", role: "buyer", full_name: "Regular Buyer" },
      user: {
        id: "user-123",
        email: "buyer@example.com",
        user_metadata: { role: "buyer" },
      },
    } as any);

    await expect(requireRole("admin")).rejects.toThrow("NEXT_REDIRECT:/profile");
  });

  it("4. [Privilege Escalation] Redirects a Seller trying to access an Admin area to /dashboard", async () => {
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue({
      userId: "seller-456",
      email: "seller@example.com",
      avatarUrl: null,
      profile: { id: "seller-456", role: "seller", full_name: "Verified Seller" },
      user: {
        id: "seller-456",
        email: "seller@example.com",
        user_metadata: { role: "seller" },
      },
    } as any);

    await expect(requireRole("admin")).rejects.toThrow("NEXT_REDIRECT:/dashboard");
  });

  it("5. [Missing DB Profile / RLS Block] Falls back to user_metadata role when profile row is null", async () => {
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue({
      userId: "seller-789",
      email: "seller-meta@example.com",
      avatarUrl: null,
      profile: null, // Profile row query failed or returned null
      user: {
        id: "seller-789",
        email: "seller-meta@example.com",
        user_metadata: { role: "seller" },
      },
    } as any);

    // Seller metadata allows access to seller route
    const session = await requireRole("seller");
    expect(session).toBeDefined();
    expect(session.email).toBe("seller-meta@example.com");
  });

  it("6. [Unknown/Corrupted Role] Treats unknown or corrupted roles as buyer (restricted from seller/admin)", async () => {
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue({
      userId: "user-999",
      email: "unknown@example.com",
      avatarUrl: null,
      profile: {
        id: "user-999",
        role: "unknown_role" as any,
        full_name: "Corrupted Account",
      },
      user: { id: "user-999", email: "unknown@example.com", user_metadata: {} },
    } as any);

    await expect(requireRole("seller")).rejects.toThrow("NEXT_REDIRECT:/profile");
  });

  // --------------------------------------------------------------------------
  // HAPPY PATHS & HIERARCHICAL PERMISSIONS
  // --------------------------------------------------------------------------

  it("7. [Seller Access] Allows a Seller to access Seller routes", async () => {
    const mockSession = {
      userId: "seller-101",
      email: "seller@genz.com",
      avatarUrl: null,
      profile: {
        id: "seller-101",
        role: "seller" as const,
        full_name: "Indian Handicrafts",
      },
      user: {
        id: "seller-101",
        email: "seller@genz.com",
        user_metadata: { role: "seller" },
      },
    } as any;
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue(mockSession);

    const result = await requireRole("seller");
    expect(result).toEqual(mockSession);
  });

  it("8. [Hierarchical Access] Allows a Seller to access Buyer routes", async () => {
    const mockSession = {
      userId: "seller-101",
      email: "seller@genz.com",
      avatarUrl: null,
      profile: {
        id: "seller-101",
        role: "seller" as const,
        full_name: "Indian Handicrafts",
      },
      user: {
        id: "seller-101",
        email: "seller@genz.com",
        user_metadata: { role: "seller" },
      },
    } as any;
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue(mockSession);

    const result = await requireRole("buyer");
    expect(result).toEqual(mockSession);
  });

  it("9. [Superadmin Access] Allows an Admin to access Admin routes", async () => {
    const mockSession = {
      userId: "admin-001",
      email: "admin@genz.com",
      avatarUrl: null,
      profile: { id: "admin-001", role: "admin" as const, full_name: "Platform Owner" },
      user: {
        id: "admin-001",
        email: "admin@genz.com",
        user_metadata: { role: "admin" },
      },
    } as any;
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue(mockSession);

    const result = await requireRole("admin");
    expect(result).toEqual(mockSession);
  });

  it("10. [Superadmin Access] Allows an Admin to access Seller routes", async () => {
    const mockSession = {
      userId: "admin-001",
      email: "admin@genz.com",
      avatarUrl: null,
      profile: { id: "admin-001", role: "admin" as const, full_name: "Platform Owner" },
      user: {
        id: "admin-001",
        email: "admin@genz.com",
        user_metadata: { role: "admin" },
      },
    } as any;
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue(mockSession);

    const result = await requireRole("seller");
    expect(result).toEqual(mockSession);
  });

  it("11. [Superadmin Access] Allows an Admin to access Buyer routes", async () => {
    const mockSession = {
      userId: "admin-001",
      email: "admin@genz.com",
      avatarUrl: null,
      profile: { id: "admin-001", role: "admin" as const, full_name: "Platform Owner" },
      user: {
        id: "admin-001",
        email: "admin@genz.com",
        user_metadata: { role: "admin" },
      },
    } as any;
    vi.spyOn(authLib, "getUserAndProfile").mockResolvedValue(mockSession);

    const result = await requireRole("buyer");
    expect(result).toEqual(mockSession);
  });
});
