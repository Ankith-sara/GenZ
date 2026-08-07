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
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PRODUCT_STATUS_LABEL, formatInr } from "@/lib/products";
import { MetricCard } from "@/components/admin/ui/metric-card";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { VercelAnalyticsChart } from "@/components/admin/vercel-analytics-chart";
import { getSellerAnalyticsData } from "@/lib/vercel-analytics";

export default async function SellerDashboardPage() {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: inquiryCount },
    { data: sellerProfile },
    { data: recentProducts },
    analytics,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", session.userId),
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", session.userId),
    supabase.from("seller_profiles").select("*").eq("id", session.userId).maybeSingle(),
    supabase
      .from("products")
      .select("*")
      .eq("seller_id", session.userId)
      .order("updated_at", { ascending: false })
      .limit(5),
    getSellerAnalyticsData(session.userId),
  ]);

  const isVerified = sellerProfile?.status === "verified";
  const verificationStatus = sellerProfile?.status || "pending";

  return (
    <div className="space-y-8 select-none">
      {/* 1. KPI WIDGETS SECTION (4 Column Grid) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Catalog Listings"
          value={productCount ?? 0}
          change={(productCount ?? 0) > 0 ? `+${productCount}` : "0 active"}
          changeType={(productCount ?? 0) > 0 ? "increase" : "neutral"}
          description="Active products in market"
          icon={<Package className="h-4 w-4" />}
          sparklineData={
            (productCount ?? 0) > 0
              ? [1, 2, 3, 5, 8, productCount ?? 10]
              : [0, 0, 0, 0, 0, 0, 0]
          }
        />

        <MetricCard
          title="Buyer Inquiries"
          value={inquiryCount ?? 0}
          change={(inquiryCount ?? 0) > 0 ? `+${inquiryCount}` : "0 RFQs"}
          changeType={(inquiryCount ?? 0) > 0 ? "increase" : "neutral"}
          description="Direct buyer procurement RFQs"
          icon={<MessageSquare className="h-4 w-4" />}
          sparklineData={
            (inquiryCount ?? 0) > 0
              ? [1, 2, 4, 6, inquiryCount ?? 8]
              : [0, 0, 0, 0, 0, 0, 0]
          }
        />

        <MetricCard
          title="Listing Page Views"
          value={analytics.totalPageViews}
          change={
            analytics.totalPageViews > 0 ? `+${analytics.totalPageViews}` : "0 views"
          }
          changeType={analytics.totalPageViews > 0 ? "increase" : "neutral"}
          description={`${analytics.totalVisitors} Unique Buyer Visits`}
          icon={<ExternalLink className="h-4 w-4" />}
          sparklineData={
            analytics.totalPageViews > 0
              ? [10, 25, 45, 80, 140, analytics.totalPageViews]
              : [0, 0, 0, 0, 0, 0, 0]
          }
        />

        <MetricCard
          title="Verification Clearance"
          value={isVerified ? "Cleared" : "Pending"}
          change={isVerified ? "Verified" : "Under Audit"}
          changeType={isVerified ? "increase" : "decrease"}
          description="GST & Business credentials"
          icon={<ShieldCheck className="h-4 w-4" />}
          sparklineData={isVerified ? [10, 10, 10, 10, 10] : [2, 2, 2, 2, 2]}
        />
      </div>

      {/* 2. MAIN 12-COLUMN GRID (Analytics 8-Col + Desk Desk Quick Action 4-Col) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 8-Column Listing Performance Analytics */}
        <div className="space-y-6 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs lg:col-span-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#F0F0EC] pb-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex items-center gap-1 rounded bg-black px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                  Listing Traffic
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  ● Real-time Sourcing Activity
                </span>
              </div>
              <h2 className="font-graphik text-xl font-bold text-[#1A1A18]">
                Storefront Traffic & Product Engagement
              </h2>
            </div>
          </div>

          {/* Analytics Interactive Chart */}
          <VercelAnalyticsChart
            dailyData={analytics.dailyData}
            totalVisitors={analytics.totalVisitors}
            totalPageViews={analytics.totalPageViews}
          />

          {/* Detailed Top Pages & Referrers Grid */}
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <div className="font-graphik space-y-3 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2 font-bold text-black">
                <span>Top Viewed Product Listings</span>
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
                  <p className="text-[#8C8C85]">No product views recorded yet</p>
                )}
              </div>
            </div>

            <div className="font-graphik space-y-3 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2 font-bold text-black">
                <span>Top Buyer Referrers</span>
                <span>Traffic Hits</span>
              </div>
              <div className="space-y-2">
                {analytics.topReferrers.length > 0 ? (
                  analytics.topReferrers.slice(0, 5).map((ref, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between font-mono text-xs"
                    >
                      <span className="max-w-[180px] truncate font-semibold text-black">
                        {ref.source}
                      </span>
                      <span className="font-bold text-[#73736E]">{ref.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[#8C8C85]">No referrers recorded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Factory Status & Navigation Shortcuts */}
        <div className="space-y-6 lg:col-span-4">
          {/* Factory Verification Card */}
          <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-black" />
                <span className="font-graphik text-sm font-bold text-[#1A1A18]">
                  Factory Status
                </span>
              </div>
              <StatusBadge status={verificationStatus} />
            </div>

            {isVerified ? (
              <div className="space-y-1 rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>GST Clearance Active</span>
                </div>
                <p className="font-graphik text-[11px] leading-relaxed text-emerald-800/90">
                  Your business credentials and factory clearance pass all compliance
                  audits.
                </p>
              </div>
            ) : (
              <div className="space-y-1 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Audit Pending Review</span>
                </div>
                <p className="font-graphik text-[11px] leading-relaxed text-amber-800/90">
                  Your seller application is undergoing verification by GenZ platform
                  admins.
                </p>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <Link
                href="/dashboard/seller/products/new"
                className="group flex items-center justify-between rounded-xl border border-black bg-black p-3 text-white transition-all hover:bg-neutral-800"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="h-4 w-4" />
                  <span className="font-graphik text-xs font-semibold">
                    Add New Product Listing
                  </span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/dashboard/seller/products"
                className="group flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3 text-black transition-colors hover:bg-black hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-[#52524E] group-hover:text-white" />
                  <span className="font-graphik text-xs font-semibold">
                    Manage Product Catalog ({productCount ?? 0})
                  </span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8C8C85] group-hover:text-white" />
              </Link>

              <Link
                href="/dashboard/seller/inquiries"
                className="group flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3 text-black transition-colors hover:bg-black hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4 text-[#52524E] group-hover:text-white" />
                  <span className="font-graphik text-xs font-semibold">
                    Buyer Inquiries Queue ({inquiryCount ?? 0})
                  </span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8C8C85] group-hover:text-white" />
              </Link>

              <Link
                href="/dashboard/seller/documents"
                className="group flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3 text-black transition-colors hover:bg-black hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-[#52524E] group-hover:text-white" />
                  <span className="font-graphik text-xs font-semibold">
                    Document Vault & GST
                  </span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8C8C85] group-hover:text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT PRODUCT LISTINGS TABLE */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-4">
          <div>
            <h3 className="font-graphik text-base font-bold text-[#1A1A18]">
              Recent Catalog Portfolio
            </h3>
            <p className="font-graphik text-xs text-[#73736E]">
              Latest product listings published on GenZ Storefront
            </p>
          </div>
          <Link
            href="/dashboard/seller/products"
            className="font-graphik text-xs font-semibold text-black hover:underline"
          >
            View Full Portfolio →
          </Link>
        </div>

        <div className="divide-y divide-[#F0F0EC]">
          {!recentProducts || recentProducts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-graphik text-xs text-[#8C8C85]">
                No products listed yet. Click &ldquo;Add New Product Listing&rdquo;
                above to publish your first catalog item.
              </p>
            </div>
          ) : (
            recentProducts.map((product) => (
              <div
                key={product.id}
                className="font-graphik flex items-center justify-between py-3.5 text-xs first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] font-bold text-black">
                    <Package className="h-4 w-4 text-[#73736E]" />
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/seller/products/${product.id}`}
                      className="block font-semibold text-[#1A1A18] hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="font-mono text-[10px] text-[#73736E]">
                      {product.category} · {formatInr(product.price_inr)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={product.status === "published" ? "active" : "draft"}
                    label={PRODUCT_STATUS_LABEL[product.status] || product.status}
                  />
                  <Link
                    href={`/dashboard/seller/products/${product.id}`}
                    className="rounded-lg border border-[#E5E5E0] bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-[#FAF7F0]"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
