import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { AdminLayoutShell } from "@/features/admin/components/admin-layout-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("admin");

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  // 1. Fetch records in parallel
  const [
    { data: rawApplications },
    { data: rawSellerProfiles },
    { count: productsCount },
    { count: inquiriesCount },
    { count: waitlistCount },
    { count: contactCount },
    { count: usersCount },
  ] = await Promise.all([
    supabase.from("seller_applications").select("id, email, status"),
    supabase.from("seller_profiles").select("id, status"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("waitlist").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  // 2. Fetch real Auth emails for cross-table mapping
  const authUserEmails: Record<string, string> = {};
  try {
    const { data: userListData } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    (userListData?.users ?? []).forEach((u) => {
      if (u.id && u.email) authUserEmails[u.id] = u.email;
    });
  } catch (err) {
    console.error("[AdminDashboardLayout] Auth users fetch notice:", err);
  }

  // 3. Deduplicate and calculate real pending verifications
  const statusMap = new Map<string, "pending" | "approved" | "rejected">();
  const emailToKeyMap = new Map<string, string>();

  (rawApplications ?? []).forEach((app) => {
    const email = (app.email || authUserEmails[app.id] || "").trim().toLowerCase();
    const status: "pending" | "approved" | "rejected" =
      app.status === "approved"
        ? "approved"
        : app.status === "rejected"
          ? "rejected"
          : "pending";
    statusMap.set(app.id, status);
    if (email) {
      emailToKeyMap.set(email, app.id);
    }
  });

  (rawSellerProfiles ?? []).forEach((sp) => {
    const email = (authUserEmails[sp.id] || "").trim().toLowerCase();
    let key = sp.id;
    if (!statusMap.has(sp.id) && email && emailToKeyMap.has(email)) {
      key = emailToKeyMap.get(email)!;
    }

    const isVerified = sp.status === "verified" || (sp.status as string) === "approved";
    if (isVerified) {
      statusMap.set(key, "approved");
    } else if (sp.status === "rejected" && statusMap.get(key) !== "approved") {
      statusMap.set(key, "rejected");
    } else if (!statusMap.has(key)) {
      statusMap.set(key, sp.status === "pending" ? "pending" : "rejected");
    }
  });

  let realPendingCount = 0;
  statusMap.forEach((status) => {
    if (status === "pending") realPendingCount++;
  });

  const counts = {
    users: usersCount ?? 0,
    pendingVerifications: realPendingCount,
    products: productsCount ?? 0,
    inquiries: inquiriesCount ?? 0,
    waitlist: waitlistCount ?? 0,
    contact: contactCount ?? 0,
  };

  const adminName = session.profile?.full_name || "Admin User";
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
