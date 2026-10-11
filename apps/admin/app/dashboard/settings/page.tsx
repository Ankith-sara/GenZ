import { createAdminClient } from "@genz/database/admin";
import { getPlatformCategories } from "@genz/database/categories";
import { requirePermission } from "@genz/database/authorization";
import { SettingsClient } from "@/features/settings";

export default async function AdminSettingsPage() {
  const { session } = await requirePermission("system:write");
  // Access is checked above; the service-role client lets admins and permitted
  // staff (role emp) read past RLS policies that only admit profiles.role = admin.
  const supabase = createAdminClient();

  const [{ data: profile }, categories] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", session.userId)
      .single(),
    getPlatformCategories(),
  ]);

  return (
    <SettingsClient
      adminUser={{
        id: session.userId,
        email: session.email || "admin@genz.in",
        fullName: profile?.full_name || "Super Administrator",
      }}
      initialCategories={categories}
    />
  );
}
