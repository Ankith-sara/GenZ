import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("admin");
  const supabase = await createClient();

  const [
    { count: pendingCount },
    { count: productsCount },
    { count: inquiriesCount },
    { count: waitlistCount },
    { count: contactCount },
    { data: allProfiles },
  ] = await Promise.all([
    supabase
      .from("manufacturer_profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("waitlist").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ]);

  const counts = {
    users: allProfiles?.length ?? 0,
    pendingVerifications: pendingCount ?? 0,
    products: productsCount ?? 0,
    inquiries: inquiriesCount ?? 0,
    waitlist: waitlistCount ?? 0,
    contact: contactCount ?? 0,
  };

  const adminName = session.profile?.full_name || "Robert";
  const firstName = adminName.split(" ")[0];

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateRangeFormatted = `${sevenDaysAgo.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  })} - ${now.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })}`;

  return (
    <AdminLayoutShell
      adminUser={{
        full_name: session.profile?.full_name,
        email: "admin@genz.in",
      }}
      counts={counts}
      firstName={firstName}
      dateRangeFormatted={dateRangeFormatted}
    >
      {children}
    </AdminLayoutShell>
  );
}
