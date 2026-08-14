import { createClient } from "@genz/database";
import { requireRole } from "@/features/auth/lib/require-role";
import { UsersTableClient } from "./users-table-client";

export default async function AdminUsersPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return <UsersTableClient initialProfiles={profiles ?? []} />;
}
