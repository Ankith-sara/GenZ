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
    { data: contactMessages }
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
    supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
  ]);

  const pendingCount = pendingManufacturers?.length ?? 0;
  const verifiedCount = (verifiedManufacturers ?? []).filter(m => m.status === "verified").length;
  const waitlistCount = waitlist?.length ?? 0;
  const productCount = products?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12">
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <p className="text-neutral-500 text-xs font-medium tracking-[0.2em] uppercase mb-1">
            GenZ Control Center
          </p>
          <h1 className="text-3xl font-serif text-black">
            Welcome, {session.profile?.full_name ?? "Administrator"}.
          </h1>
        </div>
      </div>

      {/* High level Stats Indicators */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Pending Reviews", count: pendingCount, color: "border-forest-green/30 bg-forest-green/5" },
          { label: "Verified Partners", count: verifiedCount, color: "border-forest-mid/30 bg-forest-mid/5" },
          { label: "Waitlist Signups", count: waitlistCount, color: "border-ash bg-white/40" },
          { label: "Listed Products", count: productCount, color: "border-black/10 bg-black/[0.02]" }
        ].map((stat, idx) => (
          <div key={idx} className={`border rounded-[4px] p-6 ${stat.color}`}>
            <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="mt-2 font-serif text-4xl text-black font-medium">{stat.count}</p>
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
          contactMessages: contactMessages ?? []
        }} 
      />
    </div>
  );
}
