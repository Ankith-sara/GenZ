import "server-only";
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
