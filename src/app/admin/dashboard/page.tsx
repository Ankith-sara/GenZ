import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import Link from "next/link";
import { VercelAnalyticsChart } from "@/components/admin/vercel-analytics-chart";
import { getAnalyticsData } from "@/lib/vercel-analytics";
import {
  ArrowUpRight,
  Building2,
  Users,
  MessageSquare,
  ShoppingBag,
  ExternalLink,
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
    analytics,
  ] = await Promise.all([
    supabase
      .from("manufacturer_profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("manufacturer_profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "verified"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*"),
    getAnalyticsData(),
  ]);

  const totalUsers = allProfiles?.length ?? 0;
  const manufacturers = (allProfiles ?? []).filter(
    (p) => p.role === "manufacturer"
  ).length;
  const buyers = (allProfiles ?? []).filter((p) => p.role === "buyer").length;
  const mfgPercent =
    totalUsers > 0 ? Math.round((manufacturers / totalUsers) * 100) : 40;
  const buyerPercent = 100 - mfgPercent;

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });

  return (
    <div className="space-y-6 select-none">
      {/* 1. SHIFT BOARD CARD */}
      <div className="space-y-6 rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <div>
          <p className="font-graphik mb-1 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
            CONTROL OFFICE / MORNING SHIFT
          </p>
          <h2 className="font-nantes text-3xl font-bold text-[#1A1A18]">Shift Board</h2>
        </div>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-2 gap-4 border-b border-[#F0F0EC] pb-4 sm:grid-cols-4">
          <div>
            <p className="font-graphik text-xs text-[#73736E]">Date</p>
            <p className="font-graphik mt-1 text-sm font-bold text-black">
              {currentDateFormatted}
            </p>
          </div>

          <div>
            <p className="font-graphik text-xs text-[#73736E]">Arrivals / Logins</p>
            <p className="font-graphik mt-1 text-sm font-bold text-black">
              {totalUsers} active accounts
            </p>
          </div>

          <div>
            <p className="font-graphik text-xs text-[#73736E]">Verified Partners</p>
            <p className="font-graphik mt-1 text-sm font-bold text-black">
              {verifiedCount ?? 0} cleared
            </p>
          </div>

          <div>
            <p className="font-graphik text-xs text-[#73736E]">Pending Audits</p>
            <p className="font-graphik mt-1 text-sm font-bold text-amber-700">
              {pendingCount ?? 0} flagged
            </p>
          </div>
        </div>

        {/* 4 Action Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/dashboard/verifications"
            className="group flex h-32 flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5 transition-all hover:bg-[#F5F5F0]"
          >
            <div className="flex items-start justify-between">
              <Building2 className="h-5 w-5 text-[#52524E] group-hover:text-black" />
              <ArrowUpRight className="h-4 w-4 text-[#8C8C85] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black" />
            </div>
            <span className="font-graphik text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
              REVIEW AUDITS
            </span>
          </Link>

          <Link
            href="/admin/dashboard/users"
            className="group flex h-32 flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5 transition-all hover:bg-[#F5F5F0]"
          >
            <div className="flex items-start justify-between">
              <Users className="h-5 w-5 text-[#52524E] group-hover:text-black" />
              <ArrowUpRight className="h-4 w-4 text-[#8C8C85] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black" />
            </div>
            <span className="font-graphik text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
              MANAGE USERS
            </span>
          </Link>

          <Link
            href="/admin/dashboard/inquiries"
            className="group flex h-32 flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5 transition-all hover:bg-[#F5F5F0]"
          >
            <div className="flex items-start justify-between">
              <MessageSquare className="h-5 w-5 text-[#52524E] group-hover:text-black" />
              <ArrowUpRight className="h-4 w-4 text-[#8C8C85] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black" />
            </div>
            <span className="font-graphik text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
              INQUIRIES QUEUE
            </span>
          </Link>

          <Link
            href="/admin/dashboard/products"
            className="group flex h-32 flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5 transition-all hover:bg-[#F5F5F0]"
          >
            <div className="flex items-start justify-between">
              <ShoppingBag className="h-5 w-5 text-[#52524E] group-hover:text-black" />
              <ArrowUpRight className="h-4 w-4 text-[#8C8C85] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black" />
            </div>
            <span className="font-graphik text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
              PLATFORM CATALOG
            </span>
          </Link>
        </div>
      </div>

      {/* 2. REAL ANALYTICS — DATA FROM SUPABASE page_views TABLE */}
      <div className="space-y-6 rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#F0F0EC] pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-black px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                Site Analytics
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
                ● Real-time Tracking
              </span>
            </div>
            <h3 className="font-nantes text-2xl font-bold text-black">
              Website Analytics
            </h3>
          </div>
        </div>

        {/* Interactive Chart — fed with REAL Supabase data */}
        <VercelAnalyticsChart
          dailyData={analytics.dailyData}
          totalVisitors={analytics.totalVisitors}
          totalPageViews={analytics.totalPageViews}
        />

        {/* Detailed Insights Grid — REAL DATA */}
        <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
          {/* Top Pages */}
          <div className="space-y-3 rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5">
            <div className="font-graphik flex items-center justify-between border-b border-[#E5E5E0] pb-2 text-xs font-bold text-black">
              <span>Top Pages</span>
              <span>Views</span>
            </div>
            <div className="space-y-2">
              {analytics.topPages.length > 0 ? (
                analytics.topPages.map((page, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between font-mono text-xs"
                  >
                    <span className="max-w-[200px] truncate font-semibold text-black">
                      {page.path}
                    </span>
                    <span className="font-bold text-[#73736E]">{page.views}</span>
                  </div>
                ))
              ) : (
                <p className="font-graphik text-xs text-[#8C8C85]">No page data yet</p>
              )}
            </div>
          </div>

          {/* Top Referrers */}
          <div className="space-y-3 rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5">
            <div className="font-graphik flex items-center justify-between border-b border-[#E5E5E0] pb-2 text-xs font-bold text-black">
              <span>Referrers</span>
              <span>Views</span>
            </div>
            <div className="space-y-2">
              {analytics.topReferrers.length > 0 ? (
                analytics.topReferrers.map((ref, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between font-mono text-xs"
                  >
                    <span className="max-w-[220px] truncate text-black">
                      {ref.source}
                    </span>
                    <span className="font-bold text-[#73736E]">{ref.count}</span>
                  </div>
                ))
              ) : (
                <p className="font-graphik text-xs text-[#8C8C85]">
                  No referrer data yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER USER METRICS CARD */}
      <div className="space-y-6 rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-graphik mb-1 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
              BOOKING SOURCES / USER METRICS
            </p>
            <div className="flex items-baseline gap-3">
              <span className="font-nantes text-4xl font-bold text-black">
                {totalUsers.toLocaleString()}
              </span>
              <span className="font-graphik text-sm text-[#73736E]">
                active user profiles
              </span>
            </div>
          </div>

          <div className="font-graphik flex items-center gap-6 text-xs">
            <div>
              <span className="mr-1.5 text-[#73736E]">Manufacturers</span>
              <span className="font-bold text-black">{manufacturers}</span>
              <span className="ml-1 text-[#8C8C85]">{mfgPercent}%</span>
            </div>
            <div>
              <span className="mr-1.5 text-[#73736E]">Buyers</span>
              <span className="font-bold text-black">{buyers}</span>
              <span className="ml-1 text-[#8C8C85]">{buyerPercent}%</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex h-4 w-full overflow-hidden rounded-full border border-[#E5E5E0] bg-[#FAF7F0]">
            <div
              className="bg-brand-yellow h-full transition-all"
              style={{ width: `${mfgPercent}%` }}
            />
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${buyerPercent}%` }}
            />
          </div>
          <div className="font-graphik flex justify-between text-[11px] text-[#8C8C85]">
            <span>0</span>
            <span>500</span>
            <span>1,000</span>
            <span>1,500</span>
            <span>2,000+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
