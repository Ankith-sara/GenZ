import { requireRole } from "@/features/auth/lib/require-role";
import { createClient } from "@genz/database";
import { DashboardSidebar } from "@/components/ui/organisms/dashboard-sidebar";
import { signOut } from "@/app/login/actions";
import { SearchTriggerButton } from "@genz/ui";
import { SellerHeaderNotifications } from "./header-notifications";
import { Calendar, LogOut, CheckCircle2, ShieldAlert } from "lucide-react";

export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const [{ data: sellerProfile }, { count: documentCount }, { count: productCount }] =
    await Promise.all([
      supabase
        .from("seller_profiles")
        .select("status, business_name, gst_number")
        .eq("id", session.userId)
        .maybeSingle(),
      supabase
        .from("seller_documents")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", session.userId),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", session.userId),
    ]);

  const isVerified = sellerProfile?.status === "verified";
  const businessName =
    sellerProfile?.business_name || session.profile?.full_name || "Factory Desk";

  // Calculate incomplete onboarding steps for notification badge
  const hasProfileDetails =
    Boolean(sellerProfile?.business_name) &&
    Boolean(sellerProfile?.gst_number && sellerProfile?.gst_number !== "PENDING");
  const hasDocuments = (documentCount ?? 0) > 0;
  const hasProducts = (productCount ?? 0) > 0;

  const pendingSteps: { label: string; href: string }[] = [];
  if (!hasProfileDetails) {
    pendingSteps.push({
      label: "Complete Business Profile & GSTIN",
      href: "/seller/dashboard/account",
    });
  }
  if (!hasDocuments) {
    pendingSteps.push({
      label: "Upload GST / Trade License documents",
      href: "/seller/dashboard/documents",
    });
  }
  if (!hasProducts) {
    pendingSteps.push({
      label: "Publish your first product listing",
      href: "/seller/dashboard/products/new",
    });
  }
  if (!isVerified) {
    pendingSteps.push({
      label: "Verification clearance pending admin audit",
      href: "/seller/dashboard",
    });
  }

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
    <div className="font-graphik flex min-h-screen flex-col bg-[#FAF8F4] text-[#1A1A18] antialiased sm:flex-row">
      {/* 1. SELLER SIDEBAR */}
      <DashboardSidebar
        role="seller"
        user={{
          full_name: session.profile?.full_name,
          email: session.user.email,
        }}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Sticky Header Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E5E5E0] bg-[#FAF8F4]/90 px-3 backdrop-blur-md select-none sm:px-6">
          {/* Workspace Title & Verification Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="font-graphik xs:max-w-[160px] max-w-[120px] truncate text-xs font-bold text-[#1A1A18] sm:max-w-xs sm:text-sm">
              {businessName}
            </h1>
            <span
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase sm:px-2.5 sm:text-[10px] ${
                isVerified
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span className="xs:inline hidden">Verified Factory</span>
                  <span className="xs:hidden">Verified</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3 w-3 text-amber-600" />
                  <span className="xs:inline hidden">Pending Clearance</span>
                  <span className="xs:hidden">Pending</span>
                </>
              )}
            </span>
          </div>

          {/* Controls: Search, Notifications, date badge, exit */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <SearchTriggerButton placeholder="Search factory..." />

            <SellerHeaderNotifications pendingSteps={pendingSteps} />

            <div className="hidden items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-white px-2.5 py-1 font-mono text-xs font-semibold text-[#52524E] shadow-2xs md:flex">
              <Calendar className="h-3.5 w-3.5 text-[#73736E]" />
              <span>{dateRangeFormatted}</span>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-[#E5E5E0] bg-white px-2 text-xs font-semibold text-[#52524E] shadow-2xs transition-colors hover:bg-rose-50 hover:text-rose-700 sm:px-2.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </form>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-3.5 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
