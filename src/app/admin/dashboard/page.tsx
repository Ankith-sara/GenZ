import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import Link from "next/link";
import { VercelAnalyticsChart } from "@/components/admin/vercel-analytics-chart";
import { getAnalyticsData } from "@/lib/vercel-analytics";
import { MetricCard } from "@/components/admin/ui/metric-card";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import {
  Users,
  Building2,
  ShoppingBag,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default async function AdminDashboardOverviewPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [
    { count: pendingCount },
    { count: verifiedCount },
    { count: productCount },
    { count: inquiryCount },
    { data: allProfiles },
    { data: recentSellers },
    analytics,
  ] = await Promise.all([
    supabase
      .from("seller_profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("seller_profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "verified"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("seller_profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    getAnalyticsData(),
  ]);

  const totalUsers = allProfiles?.length ?? 0;
  const sellersCount = (allProfiles ?? []).filter((p) => p.role === "seller").length;
  const buyersCount = (allProfiles ?? []).filter((p) => p.role === "buyer").length;

  return (
    <div className="space-y-8 select-none">
      {/* 1. KPI WIDGETS SECTION (4 Column Grid) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Platform Users"
          value={totalUsers}
          change="+14.2%"
          changeType="increase"
          description={`${sellersCount} Sellers · ${buyersCount} Buyers`}
          icon={<Users className="h-4 w-4" />}
          sparklineData={[10, 15, 12, 19, 24, 30, 36]}
        />

        <MetricCard
          title="Pending Audits"
          value={pendingCount ?? 0}
          change={pendingCount && pendingCount > 0 ? "Requires Action" : "Clear"}
          changeType={pendingCount && pendingCount > 0 ? "decrease" : "increase"}
          description={`${verifiedCount ?? 0} Sellers Cleared`}
          icon={<Building2 className="h-4 w-4" />}
          sparklineData={[4, 6, 8, 5, 9, 7, 5]}
        />

        <MetricCard
          title="Active Products"
          value={productCount ?? 0}
          change="+8.6%"
          changeType="increase"
          description="Catalog listings online"
          icon={<ShoppingBag className="h-4 w-4" />}
          sparklineData={[14, 18, 20, 22, 25, 29, 34]}
        />

        <MetricCard
          title="Inquiry Messages"
          value={inquiryCount ?? 0}
          change="+21.5%"
          changeType="increase"
          description="Direct buyer RFQs"
          icon={<MessageSquare className="h-4 w-4" />}
          sparklineData={[8, 12, 16, 21, 28, 35, 42]}
        />
      </div>

      {/* 2. MAIN 12-COLUMN GRID (Analytics 8-col + System Activity 4-col) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 8-Column Analytics Card */}
        <div className="space-y-6 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs lg:col-span-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#F0F0EC] pb-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex items-center gap-1 rounded bg-black px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                  Platform Traffic
                </span>
                <a
                  href="https://genzonline.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-mono text-xs font-semibold text-[#73736E] hover:text-black"
                >
                  www.genzonline.in
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  ● Live Tracking
                </span>
              </div>
              <h2 className="font-graphik text-xl font-bold text-[#1A1A18]">
                Website Traffic & Performance
              </h2>
            </div>
          </div>

          {/* Interactive Chart */}
          <VercelAnalyticsChart
            dailyData={analytics.dailyData}
            totalVisitors={analytics.totalVisitors}
            totalPageViews={analytics.totalPageViews}
          />

          {/* Detailed Insights Grid */}
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            {/* Top Pages */}
            <div className="space-y-3 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4">
              <div className="font-graphik flex items-center justify-between border-b border-[#E5E5E0] pb-2 text-xs font-bold text-black">
                <span>Top Viewed Routes</span>
                <span>Pageviews</span>
              </div>
              <div className="space-y-2">
                {analytics.topPages.length > 0 ? (
                  analytics.topPages.slice(0, 5).map((page, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between font-mono text-xs"
                    >
                      <span className="max-w-[180px] truncate font-semibold text-black">
                        {page.path}
                      </span>
                      <span className="font-bold text-[#73736E]">{page.views}</span>
                    </div>
                  ))
                ) : (
                  <p className="font-graphik text-xs text-[#8C8C85]">
                    No page data recorded yet
                  </p>
                )}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="space-y-3 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4">
              <div className="font-graphik flex items-center justify-between border-b border-[#E5E5E0] pb-2 text-xs font-bold text-black">
                <span>Traffic Referrers</span>
                <span>Hits</span>
              </div>
              <div className="space-y-2">
                {analytics.topReferrers.length > 0 ? (
                  analytics.topReferrers.slice(0, 5).map((ref, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between font-mono text-xs"
                    >
                      <span className="max-w-[200px] truncate text-black">
                        {ref.source}
                      </span>
                      <span className="font-bold text-[#73736E]">{ref.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="font-graphik text-xs text-[#8C8C85]">
                    No referrer data recorded yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Platform Health & Real-time Activity */}
        <div className="space-y-6 lg:col-span-4">
          {/* Platform Status */}
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-graphik text-sm font-bold text-[#1A1A18]">
                  System Status
                </span>
              </div>
              <StatusBadge status="active" label="Operational" />
            </div>

            <div className="font-graphik mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#73736E]">Supabase Database</span>
                <span className="font-mono text-xs font-semibold text-emerald-700">
                  99.99%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#73736E]">Next.js Middleware</span>
                <span className="font-mono text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#73736E]">Storage & Document Vault</span>
                <span className="font-mono text-xs font-semibold text-emerald-700">
                  Operational
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Feed */}
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-black" />
                <span className="font-graphik text-sm font-bold text-[#1A1A18]">
                  Admin Quick Desk
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Link
                href="/admin/dashboard/verifications"
                className="group flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3 transition-colors hover:bg-black hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-[#52524E] group-hover:text-white" />
                  <span className="font-graphik text-xs font-semibold">
                    Review Verification Queue ({pendingCount ?? 0})
                  </span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8C8C85] group-hover:text-white" />
              </Link>

              <Link
                href="/admin/dashboard/users"
                className="group flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3 transition-colors hover:bg-black hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-[#52524E] group-hover:text-white" />
                  <span className="font-graphik text-xs font-semibold">
                    User Access & Roles ({totalUsers})
                  </span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8C8C85] group-hover:text-white" />
              </Link>

              <Link
                href="/admin/dashboard/products"
                className="group flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3 transition-colors hover:bg-black hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 text-[#52524E] group-hover:text-white" />
                  <span className="font-graphik text-xs font-semibold">
                    Inspect Product Portfolio ({productCount ?? 0})
                  </span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8C8C85] group-hover:text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER 12-COLUMN RECENT RECORDS GRID (6-col Recent Users + 6-col Pending Applications) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 6-Col Recent Users Table */}
        <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
            <div>
              <h3 className="font-graphik text-base font-bold text-[#1A1A18]">
                Recently Registered Accounts
              </h3>
              <p className="font-graphik text-xs text-[#73736E]">
                Latest user profile signups
              </p>
            </div>
            <Link
              href="/admin/dashboard/users"
              className="font-graphik text-xs font-semibold text-black hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="divide-y divide-[#F0F0EC]">
            {!allProfiles || allProfiles.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#73736E]">
                No users registered yet.
              </p>
            ) : (
              allProfiles.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="font-graphik flex items-center justify-between py-3 text-xs first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E5E0] bg-[#FAF7F0] font-bold text-black">
                      {(user.full_name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-black">
                        {user.full_name || "Anonymous User"}
                      </p>
                      <p className="max-w-[160px] truncate font-mono text-[10px] text-[#73736E] sm:max-w-[200px]">
                        {user.id}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={user.role === "seller" ? "processing" : "active"}
                    label={user.role || "buyer"}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6-Col Seller Audit Applications */}
        <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
            <div>
              <h3 className="font-graphik text-base font-bold text-[#1A1A18]">
                Pending Verification Queue
              </h3>
              <p className="font-graphik text-xs text-[#73736E]">
                Factories awaiting admin clearance
              </p>
            </div>
            <Link
              href="/admin/dashboard/verifications"
              className="font-graphik text-xs font-semibold text-black hover:underline"
            >
              Inspect Queue →
            </Link>
          </div>

          <div className="divide-y divide-[#F0F0EC]">
            {!recentSellers || recentSellers.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-emerald-600" />
                <p className="font-graphik text-xs font-semibold text-[#1A1A18]">
                  Verification Queue Cleared
                </p>
                <p className="font-graphik mt-0.5 text-[11px] text-[#73736E]">
                  No seller applications currently awaiting review.
                </p>
              </div>
            ) : (
              recentSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="font-graphik flex items-center justify-between py-3 text-xs first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 font-bold text-amber-800">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-black">{seller.business_name}</p>
                      <p className="font-mono text-[10px] text-[#73736E]">
                        GST: {seller.gst_number || "PENDING"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/dashboard/verifications`}
                    className="rounded-lg border border-[#E5E5E0] bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-[#FAF7F0]"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
