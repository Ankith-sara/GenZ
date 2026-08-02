import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { signOut } from "@/app/login/actions";
import { Search, Bell, Calendar, ChevronDown, LogOut } from "lucide-react";

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
    <div className="flex min-h-screen bg-[#F5F5F3] font-sans text-black antialiased">
      {/* 1. STANDALONE LEFT SIDEBAR */}
      <AdminSidebar
        adminUser={{
          full_name: session.profile?.full_name,
          email: "admin@genz.in",
        }}
        counts={counts}
      />

      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="flex min-w-0 flex-1 flex-col space-y-6 overflow-y-auto bg-[#FAFAFA] p-6 lg:p-8">
        {/* Top Header Controls (Matching Image Header) */}
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:px-6">
          {/* Left Greeting with User Avatar */}
          <div className="flex items-center gap-3">
            <div className="bg-brand-yellow flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-sm font-bold text-black">
              {firstName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-nantes text-lg leading-tight font-bold text-black">
                Hello {firstName}
              </h1>
              <p className="font-graphik text-xs text-[#73736E]">
                Welcome back to GenZ Platform
              </p>
            </div>
          </div>

          {/* Right Header Toolbar (Search, Notification Bell, Date Filters & SignOut) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white text-[#52524E] transition-all hover:bg-[#F5F5F3] hover:text-black">
              <Search className="h-4 w-4" />
            </button>

            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white text-[#52524E] transition-all hover:bg-[#F5F5F3] hover:text-black">
              <Bell className="h-4 w-4" />
              {counts.pendingVerifications > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>

            <div className="font-graphik flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3 py-2 text-xs font-medium text-[#52524E] hover:bg-[#F5F5F3]">
              <span>Last 7 days</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#8C8C85]" />
            </div>

            <div className="font-graphik flex items-center gap-2 rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2 text-xs font-semibold text-black shadow-xs">
              <Calendar className="h-4 w-4 text-[#73736E]" />
              <span>{dateRangeFormatted}</span>
            </div>

            <form action={signOut} className="ml-2">
              <button
                type="submit"
                className="font-graphik flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-[#52524E] transition-all hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Exit</span>
              </button>
            </form>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
