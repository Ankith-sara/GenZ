import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { AdminDashboardTabs } from "./admin-tabs";

export default async function AdminDashboard() {
  const session = await requireRole("admin");
  const supabase = await createClient();

  // Parallel data fetching for the whole website management
  const [
    { data: pendingManufacturers },
    { data: verifiedManufacturers },
    { data: waitlist },
    { data: products },
    { data: inquiries },
    { data: contactMessages },
  ] = await Promise.all([
    supabase
      .from("manufacturer_profiles")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false }),
    supabase
      .from("manufacturer_profiles")
      .select("*")
      .neq("status", "pending")
      .order("updated_at", { ascending: false }),
    supabase.from("waitlist").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("*").order("updated_at", { ascending: false }),
    supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const pendingCount = pendingManufacturers?.length ?? 0;
  const verifiedCount = (verifiedManufacturers ?? []).filter(
    (m) => m.status === "verified"
  ).length;
  const waitlistCount = waitlist?.length ?? 0;
  const productCount = products?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12">
      <div className="flex items-end justify-between border-b pb-6">
        <div>
          <p className="mb-1 text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">
            GenZ Control Center
          </p>
          <h1 className="font-serif text-3xl text-black">
            Welcome, {session.profile?.full_name ?? "Administrator"}.
          </h1>
        </div>
      </div>

      {/* High level Stats Indicators */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Pending Reviews",
            count: pendingCount,
            color: "border-brand-yellow/30 bg-brand-yellow/5",
          },
          {
            label: "Verified Partners",
            count: verifiedCount,
            color: "border-brand-yellow-hover/30 bg-brand-yellow-hover/5",
          },
          {
            label: "Waitlist Signups",
            count: waitlistCount,
            color: "border-ash bg-white/40",
          },
          {
            label: "Listed Products",
            count: productCount,
            color: "border-black/10 bg-black/[0.02]",
          },
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-[4px] border p-6 ${stat.color}`}>
            <p className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-4xl font-medium text-black">
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs list to manage different lists */}
      <AdminDashboardTabs
        initialData={{
          pendingManufacturers: pendingManufacturers ?? [],
          verifiedManufacturers: verifiedManufacturers ?? [],
          waitlist: waitlist ?? [],
          products: products ?? [],
          inquiries: inquiries ?? [],
          contactMessages: contactMessages ?? [],
        }}
      />
    </div>
  );
}
