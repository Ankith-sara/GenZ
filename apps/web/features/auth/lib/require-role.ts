import "server-only";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/features/auth/lib/auth";
import type { Role } from "@genz/types";

/**
 * Guard for role-specific dashboard pages. Redirects to /login if there's
 * no session, or to the user's own dashboard if their role doesn't match.
 * Also checks seller verification status.
 *
 * Role resolution: profile.role → user_metadata.role → "buyer"
 */
export async function requireRole(allowed: Role) {
  const session = await getUserAndProfile();
  if (!session) redirect("/login");

  const user = session.user;
  const role = (session.profile?.role ?? user?.user_metadata?.role ?? "buyer") as Role;

  const isAllowed =
    role === "admin" ||
    (role === "seller" && (allowed === "seller" || allowed === "buyer")) ||
    (role === "buyer" && allowed === "buyer");

  if (!isAllowed) {
    if (role === "seller") redirect("/seller/dashboard");
    redirect("/profile");
  }

  return session;
}
