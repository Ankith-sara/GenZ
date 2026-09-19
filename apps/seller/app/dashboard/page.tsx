import React from "react";
import { createClient } from "@genz/database";
import { requireRole } from "@/features/auth/lib/require-role";
import Link from "next/link";
import {
  Package,
  Building2,
  FileCheck,
  ShoppingBag,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Eye,
  Store,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getOrders } from "@genz/database/orders";
import { PRODUCT_STATUS_LABEL, formatInr } from "@/features/products/lib/products";
import { VercelAnalyticsChart } from "@/features/admin/components/vercel-analytics-chart";
import { getSellerAnalyticsData } from "@/features/admin/lib/vercel-analytics";
import { SITE_URL } from "@genz/utils";
import { DashboardPageHeader } from "@genz/ui";

export default async function SellerDashboardPage() {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const [
    { count: productCount },
    sellerOrdersRaw,
    { count: documentCount },
    { data: sellerProfile },
    { data: recentProducts },
    analytics,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", session.userId),
    getOrders({ sellerId: session.userId }).catch(() => []),
    supabase
      .from("seller_documents")
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

  // Intelligent fallback for store business name
  let storeName = sellerProfile?.business_name;
  if (!storeName || storeName === "Factory Seller") {
    const email = session.email?.toLowerCase().trim();
    if (email) {
      try {
        const { data: appRow } = await supabase
          .from("seller_applications")
          .select("business_name, full_name, form_data")
          .ilike("email", email)
          .limit(1)
          .maybeSingle();
        if (appRow) {
          const fd = (appRow.form_data || {}) as Record<string, unknown>;
          storeName =
            appRow.business_name || (fd.business_name as string) || appRow.full_name;
        }
      } catch {}
    }
  }
  storeName = storeName || session.profile?.full_name || "Seller Store";

  // Scope orders to authenticated seller and calculate genuine financials
  const rawList = Array.isArray(sellerOrdersRaw) ? sellerOrdersRaw : [];
  const scopedOrders = rawList.map((order) => {
    const sellerItems = (order.items || []).filter(
      (item) => (item.sellerId || item.seller_id) === session.userId
    );
    const sellerSubtotal = sellerItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    return {
      ...order,
      items: sellerItems.length > 0 ? sellerItems : order.items,
      totalAmount: sellerItems.length > 0 ? sellerSubtotal : order.totalAmount,
    };
  });

  const totalRevenue = scopedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = scopedOrders.length;
  const pendingOrders = scopedOrders.filter(
    (o) => o.status === "placed" || o.status === "processing"
  );
  const shippedOrders = scopedOrders.filter((o) => o.status === "shipped");
  const deliveredOrders = scopedOrders.filter((o) => o.status === "delivered");

  const isVerified = sellerProfile?.status === "verified";
  const hasProfileDetails =
    Boolean(sellerProfile?.business_name) &&
    Boolean(sellerProfile?.gst_number && sellerProfile?.gst_number !== "PENDING");
  const hasDocuments = (documentCount ?? 0) > 0;
  const hasProducts = (productCount ?? 0) > 0;

  // Milestone tracking (data-driven, clean progress)
  const milestones = [
    {
      label: "Business Profile",
      completed: hasProfileDetails,
      href: "/dashboard/account",
    },
    {
      label: "Product Catalog",
      completed: hasProducts,
      href: "/dashboard/products/new",
    },
    {
      label: "Verification Docs",
      completed: hasDocuments,
      href: "/dashboard/documents",
    },
    { label: "Store Clearance", completed: isVerified, href: "/dashboard" },
  ];
  const completedMilestonesCount = milestones.filter((m) => m.completed).length;
  const progressPercent = Math.round(
    (completedMilestonesCount / milestones.length) * 100
  );

  // Data-driven "Needs Your Attention" items
  interface AttentionItem {
    id: string;
    level: "required" | "recommended" | "info";
    title: string;
    description: string;
    href: string;
    ctaText: string;
    icon: React.ElementType;
  }

  const attentionItems: AttentionItem[] = [];

  if (pendingOrders.length > 0) {
    attentionItems.push({
      id: "pending-orders",
      level: "required",
      title: `${pendingOrders.length} order${pendingOrders.length > 1 ? "s" : ""} waiting to be fulfilled`,
      description:
        "Customer orders require packing, courier dispatch, or tracking details.",
      href: "/dashboard/orders",
      ctaText: "Process Orders",
      icon: ShoppingBag,
    });
  }

  if (!hasProfileDetails) {
    attentionItems.push({
      id: "missing-profile",
      level: "required",
      title: "Complete your business & tax profile",
      description:
        "Add your registered trade name, GSTIN, and business address to qualify for verified status.",
      href: "/dashboard/account",
      ctaText: "Complete Profile",
      icon: Building2,
    });
  }

  if (sellerProfile?.status === "rejected" || sellerProfile?.rejection_reason) {
    attentionItems.push({
      id: "verification-changes",
      level: "required",
      title: "Verification changes requested",
      description:
        sellerProfile.rejection_reason ||
        "The platform administration requested updates to your business credentials.",
      href: "/dashboard/account",
      ctaText: "View Feedback",
      icon: AlertCircle,
    });
  }

  if (!hasProducts) {
    attentionItems.push({
      id: "empty-catalog",
      level: "required",
      title: "Your product catalog is empty",
      description:
        "Add and publish your first craft product to start showcasing on the marketplace.",
      href: "/dashboard/products/new",
      ctaText: "Add First Product",
      icon: Package,
    });
  } else if (!hasDocuments) {
    attentionItems.push({
      id: "recommended-documents",
      level: "recommended",
      title: "Upload verification documents",
      description:
        "Providing GST registration or trade certifications accelerates store verification.",
      href: "/dashboard/documents",
      ctaText: "Upload Docs",
      icon: FileCheck,
    });
  }

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 pb-12">
      <DashboardPageHeader
        eyebrow="Seller workspace"
        title={`${timeGreeting}, ${storeName}`}
        description="A focused view of your orders, catalog, storefront activity and the actions that need your attention."
        actions={
          <>
            <Link
              href={`${SITE_URL}/sellers/${session.userId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Store className="text-on-surface-variant h-3.5 w-3.5" />
              <span>View Storefront</span>
              <ExternalLink className="text-on-surface-variant h-3 w-3" />
            </Link>
            <Link
              href="/dashboard/products/new"
              className="bg-primary text-on-primary shadow-elevation-1 hover:shadow-elevation-2 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </>
        }
      />

      {/* Store status */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            isVerified
              ? "bg-success-container text-on-success-container border-success/20 border"
              : "bg-warning-container text-on-warning-container border-warning/20 border"
          }`}
        >
          {isVerified ? <CheckCircle2 className="text-success h-3 w-3" /> : <Clock className="text-warning h-3 w-3" />}
          {isVerified ? "Verified Store" : "Verification Pending"}
        </span>
      </div>

      {/* 2. NEEDS YOUR ATTENTION (ACTION CENTER) */}
      {attentionItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-on-surface-variant flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="text-warning h-3.5 w-3.5" />
              <span>Needs Your Attention ({attentionItems.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {attentionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`shadow-elevation-1 flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                    item.level === "required"
                      ? "border-warning/30 bg-warning-container/20"
                      : "border-outline-variant/60 bg-surface-container-lowest hover:border-outline"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        item.level === "required"
                          ? "bg-warning-container text-on-warning-container"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                            item.level === "required"
                              ? "bg-warning-container text-on-warning-container border-warning/20 border"
                              : "bg-surface-container text-on-surface-variant border-outline-variant/40 border"
                          }`}
                        >
                          {item.level}
                        </span>
                      </div>
                      <h4 className="text-on-surface mt-1 truncate text-xs font-bold">
                        {item.title}
                      </h4>
                      <p className="text-on-surface-variant mt-0.5 line-clamp-2 text-[11px] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-outline-variant/40 mt-3 flex justify-end border-t pt-3">
                    <Link
                      href={item.href}
                      className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                    >
                      <span>{item.ctaText}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. STORE SETUP & VERIFICATION PROGRESS */}
      {completedMilestonesCount < milestones.length && (
        <section className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 rounded-2xl border p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-on-surface text-sm font-bold">
                  Store Setup &amp; Verification
                </h3>
                <span className="bg-surface-container-high text-on-surface-variant rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                  {completedMilestonesCount} of {milestones.length} Completed
                </span>
              </div>
              <p className="text-on-surface-variant mt-0.5 text-xs">
                Complete your profile and catalog to maximize store visibility and
                trust.
              </p>
            </div>

            <span className="text-on-surface text-xs font-bold">
              {progressPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="bg-surface-container-high my-3.5 h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Milestone step chips */}
          <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
            {milestones.map((m, idx) => (
              <Link
                key={idx}
                href={m.href}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs transition-colors ${
                  m.completed
                    ? "border-success/20 bg-success-container/40 text-on-success-container"
                    : "border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {m.completed ? (
                  <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
                ) : (
                  <div className="border-outline h-4 w-4 shrink-0 rounded-full border" />
                )}
                <span className="truncate font-medium">{m.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. KPI STORE PERFORMANCE CARDS (Genuine Data Only) */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Sales */}
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-xs font-semibold">
              Sales Revenue
            </span>
            <div className="bg-success-container text-success flex h-8 w-8 items-center justify-center rounded-xl">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-on-surface text-2xl font-bold tracking-tight">
              {formatInr(totalRevenue)}
            </p>
            <p className="text-on-surface-variant mt-0.5 text-[11px]">
              From {deliveredOrders.length} delivered order
              {deliveredOrders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Metric 2: Orders Breakdown */}
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-xs font-semibold">
              Customer Orders
            </span>
            <div className="bg-primary-container text-primary flex h-8 w-8 items-center justify-center rounded-xl">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-on-surface text-2xl font-bold tracking-tight">
              {totalOrdersCount}
            </p>
            <div className="text-on-surface-variant mt-0.5 flex items-center gap-2 text-[11px]">
              <span className="text-warning font-semibold">
                {pendingOrders.length} to fulfill
              </span>
              <span>·</span>
              <span>{shippedOrders.length} in transit</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Products */}
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-xs font-semibold">
              Active Products
            </span>
            <div className="bg-secondary-container text-secondary flex h-8 w-8 items-center justify-center rounded-xl">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-on-surface text-2xl font-bold tracking-tight">
              {productCount ?? 0}
            </p>
            <p className="text-on-surface-variant mt-0.5 text-[11px]">
              {(productCount ?? 0) > 0 ? "Published on marketplace" : "Catalog empty"}
            </p>
          </div>
        </div>

        {/* Metric 4: Storefront Views */}
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-xs font-semibold">
              Product Views
            </span>
            <div className="bg-surface-container-high text-on-surface-variant flex h-8 w-8 items-center justify-center rounded-xl">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-on-surface text-2xl font-bold tracking-tight">
              {analytics.totalPageViews}
            </p>
            <p className="text-on-surface-variant mt-0.5 text-[11px]">
              {analytics.totalVisitors} unique buyer visit
              {analytics.totalVisitors !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>

      {/* 5. ANALYTICS & QUICK ACTIONS */}
      <section id="analytics" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 8-Col Analytics Chart & Details */}
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-5 rounded-2xl border p-5 sm:p-6 lg:col-span-8">
          <div className="border-outline-variant/40 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-on-surface text-sm font-bold sm:text-base">
                Storefront Traffic &amp; Product Views
              </h3>
              <p className="text-on-surface-variant text-xs">
                Daily engagement from buyers browsing your products
              </p>
            </div>
            <span className="text-success inline-flex items-center gap-1.5 text-xs font-medium">
              <span className="bg-success h-2 w-2 animate-pulse rounded-full" />
              Live activity
            </span>
          </div>

          {/* Interactive Chart */}
          <VercelAnalyticsChart
            dailyData={analytics.dailyData}
            totalVisitors={analytics.totalVisitors}
            totalPageViews={analytics.totalPageViews}
          />

          {/* Top Products & Referrers Grid */}
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <div className="border-outline-variant/50 bg-surface-container-low rounded-xl border p-4 text-xs">
              <div className="border-outline-variant/40 text-on-surface flex items-center justify-between border-b pb-2 font-semibold">
                <span>Top Viewed Products</span>
                <span>Views</span>
              </div>
              <div className="mt-2.5 space-y-2">
                {analytics.topPages.length > 0 ? (
                  analytics.topPages.slice(0, 5).map((page, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-on-surface max-w-[180px] truncate font-medium">
                        {page.path}
                      </span>
                      <span className="text-on-surface-variant font-semibold">
                        {page.views}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant/70 py-2 text-center">
                    No product views recorded yet
                  </p>
                )}
              </div>
            </div>

            <div className="border-outline-variant/50 bg-surface-container-low rounded-xl border p-4 text-xs">
              <div className="border-outline-variant/40 text-on-surface flex items-center justify-between border-b pb-2 font-semibold">
                <span>Top Traffic Sources</span>
                <span>Visitors</span>
              </div>
              <div className="mt-2.5 space-y-2">
                {analytics.topReferrers.length > 0 ? (
                  analytics.topReferrers.slice(0, 5).map((ref, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-on-surface max-w-[180px] truncate font-medium">
                        {ref.source}
                      </span>
                      <span className="text-on-surface-variant font-semibold">
                        {ref.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant/70 py-2 text-center">
                    No referrers recorded yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Col Quick Actions & Store Status */}
        <div className="space-y-4 lg:col-span-4">
          <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5">
            <h3 className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <Link
                href="/dashboard/products/new"
                className="bg-primary text-on-primary shadow-elevation-1 hover:shadow-elevation-2 flex items-center justify-between rounded-full p-3 text-xs font-semibold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="h-4 w-4" />
                  <span>Add New Product</span>
                </div>
                <ChevronRight className="text-on-primary/80 h-3.5 w-3.5" />
              </Link>

              <Link
                href="/dashboard/orders"
                className="border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-between rounded-full border p-3 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="text-on-surface-variant h-4 w-4" />
                  <span>Manage Orders ({totalOrdersCount})</span>
                </div>
                <ChevronRight className="text-on-surface-variant h-3.5 w-3.5" />
              </Link>

              <Link
                href="/dashboard/products"
                className="border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-between rounded-full border p-3 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="text-on-surface-variant h-4 w-4" />
                  <span>View Products ({productCount ?? 0})</span>
                </div>
                <ChevronRight className="text-on-surface-variant h-3.5 w-3.5" />
              </Link>

              <Link
                href="/dashboard/profile"
                className="border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-between rounded-full border p-3 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="text-on-surface-variant h-4 w-4" />
                  <span>Edit Storefront Profile</span>
                </div>
                <ChevronRight className="text-on-surface-variant h-3.5 w-3.5" />
              </Link>

              <Link
                href="/dashboard/documents"
                className="border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-between rounded-full border p-3 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="text-on-surface-variant h-4 w-4" />
                  <span>Verification Documents</span>
                </div>
                <ChevronRight className="text-on-surface-variant h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RECENT ORDERS TABLE */}
      <section className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5">
        <div className="border-outline-variant/40 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-on-surface text-sm font-bold">
              Recent Customer Orders
            </h3>
            <p className="text-on-surface-variant text-xs">
              Orders placed for your store products
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-primary text-xs font-semibold hover:underline"
          >
            View All Orders ({totalOrdersCount})
          </Link>
        </div>

        {scopedOrders.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="text-on-surface-variant/40 mx-auto h-8 w-8" />
            <p className="text-on-surface mt-2 text-xs font-semibold">
              No customer orders yet
            </p>
            <p className="text-on-surface-variant text-[11px]">
              When customers purchase your products, orders will appear here for
              fulfillment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-outline-variant/40 text-on-surface-variant border-b text-[11px] font-semibold tracking-wider uppercase">
                  <th className="pb-2.5">Order ID</th>
                  <th className="pb-2.5">Destination</th>
                  <th className="pb-2.5">Items</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-outline-variant/30 divide-y">
                {scopedOrders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-container-low/70 transition-colors"
                  >
                    <td className="text-on-surface py-3 font-semibold">{order.id}</td>
                    <td className="text-on-surface-variant py-3">
                      {order.shippingAddress?.city || "Standard Shipping"}
                    </td>
                    <td className="text-on-surface-variant py-3">
                      {(order.items || []).length} item
                      {(order.items || []).length !== 1 ? "s" : ""}
                    </td>
                    <td className="text-on-surface py-3 font-semibold">
                      {formatInr(order.totalAmount)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                          order.status === "delivered"
                            ? "bg-success-container text-on-success-container border-success/20 border"
                            : order.status === "shipped"
                              ? "bg-secondary-container text-on-secondary-container border-secondary/20 border"
                              : order.status === "processing"
                                ? "bg-primary-container text-on-primary-container border-primary/20 border"
                                : "bg-warning-container text-on-warning-container border-warning/20 border"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href="/dashboard/orders"
                        className="border-outline-variant/60 text-on-surface hover:bg-surface-container rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 7. RECENT PRODUCTS CATALOG */}
      <section className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5">
        <div className="border-outline-variant/40 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-on-surface text-sm font-bold">Recent Products</h3>
            <p className="text-on-surface-variant text-xs">Products in your catalog</p>
          </div>
          <Link
            href="/dashboard/products"
            className="text-primary text-xs font-semibold hover:underline"
          >
            View All Products ({productCount ?? 0})
          </Link>
        </div>

        {!recentProducts || recentProducts.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="text-on-surface-variant/40 mx-auto h-8 w-8" />
            <p className="text-on-surface mt-2 text-xs font-semibold">
              Your catalog is empty
            </p>
            <p className="text-on-surface-variant text-[11px]">
              Add your first product to start selling on the marketplace.
            </p>
            <Link
              href="/dashboard/products/new"
              className="bg-primary text-on-primary shadow-elevation-1 hover:shadow-elevation-2 mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </Link>
          </div>
        ) : (
          <div className="divide-outline-variant/30 divide-y">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-surface-container-high text-on-surface-variant flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="text-on-surface block truncate text-xs font-semibold hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="text-on-surface-variant block truncate text-[11px]">
                      {product.category} · {formatInr(product.price_inr)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      product.status === "published"
                        ? "bg-success-container text-on-success-container border-success/20 border"
                        : "bg-surface-container-high text-on-surface-variant border-outline-variant border"
                    }`}
                  >
                    {PRODUCT_STATUS_LABEL[product.status] || product.status}
                  </span>
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="border-outline-variant/60 text-on-surface hover:bg-surface-container rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
