import "server-only";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/features/auth/lib/auth";
import type { Role } from "@genz/types";

/**
 * Guard for role-specific dashboard pages in the Admin Application.
 */
export async function requireRole(allowed: Role) {
  const session = await getUserAndProfile();
  if (!session) redirect("/login");

  const user = session.user;
  const role = (session.profile?.role ?? user?.user_metadata?.role ?? "buyer") as Role;

  const isAllowed = role === "admin";

  if (!isAllowed) {
    redirect("/login?error=forbidden_admin_only");
  }

  return session;
}
