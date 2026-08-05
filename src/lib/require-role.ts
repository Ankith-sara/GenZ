import "server-only";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import type { Role } from "@/types/database";

/**
 * Guard for role-specific dashboard pages. Redirects to /login if there's
 * no session, or to the user's own dashboard if their role doesn't match.
 * Also checks manufacturer verification status.
 *
 * Role resolution: profile.role → user_metadata.role → "buyer"
 */
export async function requireRole(allowed: Role) {
  const session = await getUserAndProfile();
  if (!session) redirect("/login");

  // Get role from profile row; if that's missing (RLS error, no row),
  // fall back to auth user_metadata which is always available from the JWT
  const user = session.user;

  const role =
    session.profile?.role ??
    (user?.user_metadata?.role as string | undefined) ??
    "buyer";

  console.log(
    `[requireRole] user=${session.email}, profile_role=${session.profile?.role ?? "NULL"}, meta_role=${user?.user_metadata?.role ?? "NULL"}, resolved=${role}, allowed=${allowed}`
  );

  if (role !== allowed) {
    // Redirect to the correct dashboard for their actual role
    if (role === "admin") redirect("/admin/dashboard");
    if (role === "manufacturer") redirect("/dashboard");
    redirect("/profile");
  }

  return session;
}
