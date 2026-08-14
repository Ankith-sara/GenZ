import { createClient } from "@genz/database";
import { requireRole } from "@/features/auth/lib/require-role";
import { SettingsClient } from "./settings-client";

export default async function AdminSettingsPage() {
  const session = await requireRole("admin");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session.userId)
    .single();

  return (
    <SettingsClient
      adminUser={{
        id: session.userId,
        email: session.email || "admin@genz.in",
        fullName: profile?.full_name || "Super Administrator",
      }}
    />
  );
}
