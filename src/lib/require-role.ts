import "server-only";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/database";

/**
 * Guard for role-specific dashboard pages. Redirects to /login if there's
 * no session, or to the user's own dashboard if their role doesn't match.
 * Also checks manufacturer verification status.
 */
export async function requireRole(allowed: Role) {
  const session = await getUserAndProfile();
  if (!session) redirect("/login");

  const role = session.profile?.role ?? "buyer";
  if (role !== allowed) redirect("/dashboard");

  // Additional check for manufacturers
  if (role === "manufacturer") {
    const supabase = await createClient();
    const { data: manufacturer } = await supabase
      .from("manufacturer_profiles")
      .select("status")
      .eq("id", session.userId)
      .maybeSingle();

    if (manufacturer && manufacturer.status !== "verified") {
      redirect("/dashboard/pending-verification");
    }
  }

  return session;
}
