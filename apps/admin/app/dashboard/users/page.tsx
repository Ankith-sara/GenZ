import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { UsersTableClient } from "./users-table-client";

export default async function AdminUsersPage() {
  await requireRole("admin");
  const supabase = createAdminClient();

  const [profilesRes, authRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.auth.admin.listUsers().catch((err) => {
      console.error("[AdminUsersPage] Error fetching auth users:", err);
      return { data: { users: [] } };
    }),
  ]);

  const profiles = profilesRes.data ?? [];
  const authUsers = authRes.data?.users ?? [];

  const authMap = new Map<string, { email?: string; last_sign_in_at?: string | null }>();
  authUsers.forEach((u) => {
    authMap.set(u.id, {
      email: u.email,
      last_sign_in_at: u.last_sign_in_at,
    });
  });

  const combinedProfiles = profiles.map((p) => {
    const authInfo = authMap.get(p.id);
    return {
      ...p,
      email: p.email || authInfo?.email || null,
      last_active_at: authInfo?.last_sign_in_at || p.created_at || null,
    };
  });

  // Also include any auth users missing from profiles table
  const existingProfileIds = new Set(profiles.map((p) => p.id));
  authUsers.forEach((u) => {
    if (!existingProfileIds.has(u.id)) {
      combinedProfiles.push({
        id: u.id,
        full_name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User",
        role: u.user_metadata?.role || "buyer",
        city: null,
        state: null,
        created_at: u.created_at,
        email: u.email || null,
        last_active_at: u.last_sign_in_at || u.created_at || null,
      });
    }
  });

  return <UsersTableClient initialProfiles={combinedProfiles} />;
}
