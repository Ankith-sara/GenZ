import "server-only";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import type { Role } from "@/types/database";

/**
 * Guard for role-specific dashboard pages. Redirects to /login if there's
 * no session, or to the user's own dashboard if their role doesn't match.
 */
export async function requireRole(allowed: Role) {
  const session = await getUserAndProfile();
  if (!session) redirect("/login");

  const role = session.profile?.role ?? "buyer";
  if (role !== allowed) redirect("/dashboard");

  return session;
}
