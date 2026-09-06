import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@genz/types";
import { getUserAndProfile } from "./auth";

/**
 * Requires an authenticated user session.
 * Throws an Error if unauthenticated.
 */
export async function requireUser() {
  const session = await getUserAndProfile();
  if (!session || !session.user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return session;
}

/**
 * Requires an authenticated seller user.
 * Throws an Error if unauthenticated or not a seller/admin.
 */
export async function requireSeller() {
  const session = await requireUser();
  const role = session.profile?.role ?? session.user.user_metadata?.role;
  if (role !== "seller" && role !== "admin") {
    throw new Error("Forbidden: Seller authorization required");
  }
  return session;
}

/**
 * Requires an authenticated admin user.
 * Throws an Error if unauthenticated or not an admin.
 */
export async function requireAdmin() {
  const session = await requireUser();
  const role = session.profile?.role ?? session.user.user_metadata?.role;
  if (role !== "admin") {
    throw new Error("Forbidden: Admin authorization required");
  }
  return session;
}

/**
 * Requires that the authenticated user owns the resource or is an admin.
 */
export async function requireSellerOwnership(resourceSellerId: string) {
  const session = await requireSeller();
  const role = session.profile?.role ?? session.user.user_metadata?.role;
  if (role === "admin") return session;
  if (session.userId !== resourceSellerId) {
    throw new Error(
      "Forbidden: You do not have permission to access or modify this seller's resources"
    );
  }
  return session;
}

/**
 * Shared RBAC guard for role-specific dashboard pages and server actions.
 * Evaluates the required role against the user profile/metadata and redirects
 * appropriately if unauthorized.
 *
 * Role hierarchy & permissions:
 * - admin: access to all roles ('admin', 'seller', 'buyer')
 * - seller: access to 'seller' and 'buyer'
 * - buyer: access to 'buyer'
 */
export async function requireRole(
  allowed: Role,
  options?: { redirectOnUnauthenticated?: string; redirectOnForbidden?: string }
) {
  const session = await getUserAndProfile();
  if (!session) {
    redirect(options?.redirectOnUnauthenticated ?? "/login");
  }

  const user = session.user;
  const role = (session.profile?.role ?? user?.user_metadata?.role ?? "buyer") as Role;

  const isAllowed =
    role === "admin" ||
    (role === "seller" && (allowed === "seller" || allowed === "buyer")) ||
    (role === "buyer" && allowed === "buyer");

  if (!isAllowed) {
    if (options?.redirectOnForbidden) {
      redirect(options.redirectOnForbidden);
    }
    if (allowed === "admin") {
      redirect("/login?error=forbidden_admin_only");
    }
    if (allowed === "seller") {
      redirect("/login?error=forbidden_seller_only");
    }
    if (role === "seller") {
      redirect("/seller/dashboard");
    }
    redirect("/profile");
  }

  return session;
}

