import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import Link from "next/link";
import {
  ArrowUpRight,
  Package,
  Building2,
  FileText,
  MessageSquare,
  Plus,
} from "lucide-react";
import { PRODUCT_STATUS_LABEL, formatInr } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { VercelAnalyticsChart } from "@/components/admin/vercel-analytics-chart";
import { getManufacturerAnalyticsData } from "@/lib/vercel-analytics";

export default async function ManufacturerDashboardPage() {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: inquiryCount },
    { data: manufacturerProfile },
    { data: recentProducts },
    analytics,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("manufacturer_id", session.userId),
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("manufacturer_id", session.userId),
    supabase
      .from("manufacturer_profiles")
      .select("*")
      .eq("id", session.userId)
      .maybeSingle(),
    supabase
      .from("products")
      .select("*")
      .eq("manufacturer_id", session.userId)
      .order("updated_at", { ascending: false })
      .limit(3),
    getManufacturerAnalyticsData(session.userId),
  ]);

  const isVerified = manufacturerProfile?.status === "verified";
  const businessName = manufacturerProfile?.business_name || "Your Business";
  const verificationStatus = manufacturerProfile?.status || "pending";

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

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
          <div className="mb-1.5 flex items-center gap-2">
            <p className="font-graphik text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
              MANUFACTURER DESK
            </p>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase ${
                statusColors[verificationStatus] || statusColors.pending
              }`}
            >
              ● {verificationStatus}
            </span>
          </div>
          <h2 className="font-nantes text-3xl font-bold text-[#1A1A18]">
            {businessName}
          </h2>
        </div>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-2 gap-4 border-b border-[#F0F0EC] pb-4 sm:grid-cols-4">
          <div>
            <p className="font-graphik text-xs text-[#73736E]">Current Date</p>
            <p className="font-graphik mt-1 text-sm font-bold text-black">
              {currentDateFormatted}
            </p>
          </div>

          <div>
            <p className="font-graphik text-xs text-[#73736E]">Active Listings</p>
            <p className="font-graphik mt-1 text-sm font-bold text-black">
              {productCount ?? 0} listed
            </p>
          </div>

          <div>
            <p className="font-graphik text-xs text-[#73736E]">Pending Inquiries</p>
            <p className="font-graphik mt-1 text-sm font-bold text-black">
              {inquiryCount ?? 0} in stream
            </p>
          </div>

          <div>
            <p className="font-graphik text-xs text-[#73736E]">Portal Clearance</p>
            <p
              className={`font-graphik mt-1 text-sm font-bold ${
                isVerified ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {isVerified ? "Cleared" : "Under Review"}
            </p>
          </div>
        </div>

        {/* 4 Action Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/manufacturer/products"
            className="group flex h-32 flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5 transition-all hover:bg-[#F5F5F0]"
          >
            <div className="flex items-start justify-between">
              <Package className="h-5 w-5 text-[#52524E] group-hover:text-black" />
              <ArrowUpRight className="h-4 w-4 text-[#8C8C85] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black" />
            </div>
            <span className="font-graphik text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
              MANAGE PRODUCTS
            </span>
          </Link>

          <Link
            href="/dashboard/manufacturer/onboarding"
            className="group flex h-32 flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5 transition-all hover:bg-[#F5F5F0]"
          >
            <div className="flex items-start justify-between">
              <Building2 className="h-5 w-5 text-[#52524E] group-hover:text-black" />
              <ArrowUpRight className="h-4 w-4 text-[#8C8C85] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black" />
            </div>
            <span className="font-graphik text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
              BUSINESS PROFILE
            </span>
          </Link>

          <Link
            href="/dashboard/manufacturer/documents"
            className="group flex h-32 flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5 transition-all hover:bg-[#F5F5F0]"
          >
            <div className="flex items-start justify-between">
              <FileText className="h-5 w-5 text-[#52524E] group-hover:text-black" />
              <ArrowUpRight className="h-4 w-4 text-[#8C8C85] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black" />
            </div>
            <span className="font-graphik text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
              DOCUMENTS LOCKER
            </span>
          </Link>

          <Link
            href="/dashboard/manufacturer/inquiries"
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
        </div>
      </div>

      {/* 2. REAL ANALYTICS */}
      <div className="space-y-6 rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#F0F0EC] pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-black px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                Listing Traffic
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                ● Active Performance
              </span>
            </div>
            <h3 className="font-nantes text-2xl font-bold text-black">
              Product Performance Analytics
            </h3>
          </div>
        </div>

        {/* Interactive Chart */}
        <VercelAnalyticsChart
          dailyData={analytics.dailyData}
          totalVisitors={analytics.totalVisitors}
          totalPageViews={analytics.totalPageViews}
        />

        {/* Top Products Views Grid */}
        <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
          {/* Top Pages */}
          <div className="space-y-3 rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] p-5">
            <div className="font-graphik flex items-center justify-between border-b border-[#E5E5E0] pb-2 text-xs font-bold text-black">
              <span>Top Viewed Products</span>
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
                <p className="font-graphik text-xs text-[#8C8C85]">No view data yet</p>
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

      {/* 3. RECENT PRODUCTS CARD */}
      <div className="space-y-6 rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-[#F0F0EC] pb-5">
          <div>
            <span className="flex w-fit items-center gap-1 rounded bg-black px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
              Recent Listings
            </span>
            <h3 className="font-nantes mt-1 text-2xl font-bold text-black">
              Product Portfolio
            </h3>
          </div>
          <Link
            href="/dashboard/manufacturer/products/new"
            className="font-graphik flex items-center gap-1.5 rounded-xl border border-black bg-black px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-neutral-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Product</span>
          </Link>
        </div>

        <div className="divide-y divide-[#F0F0EC]">
          {!recentProducts || recentProducts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-graphik text-sm text-[#8C8C85]">
                No products cataloged yet.
              </p>
            </div>
          ) : (
            recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <Link
                    href={`/dashboard/manufacturer/products/${product.id}`}
                    className="font-graphik text-sm font-semibold text-black hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="font-graphik text-xs text-[#73736E]">
                    {product.category} · {formatInr(product.price_inr)}
                  </p>
                </div>
                <Badge
                  variant={product.status === "published" ? "verified" : "default"}
                  className="font-mono text-[10px] font-bold uppercase"
                >
                  {PRODUCT_STATUS_LABEL[product.status]}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
