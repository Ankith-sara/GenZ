import { requireRole } from "@genz/database/authorization";
import { createClient } from "@genz/database";
import { cookies } from "next/headers";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { signOut, exitSupportSession } from "@/app/login/actions";
import { SearchTriggerButton } from "@genz/ui";
import { SellerHeaderNotifications } from "./header-notifications";
import { LogOut, CheckCircle2, AlertCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import { getAuthenticatedSellerApiClient } from "@/lib/api-server-client";

export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("seller");
  const supabase = await createClient();
  const cookieStore = await cookies();
  const isSupportSession = cookieStore.get("support_session")?.value === "true";

  let sellerProfile: any = null;
  let documentCount = 0;
  let productCount = 0;
  let businessName = session.profile?.full_name || "Seller Store";
  let isVerified = false;

  try {
    const client = await getAuthenticatedSellerApiClient();
    const overview = await client.sellers.getOverview();
    sellerProfile = overview.sellerProfile;
    documentCount = overview.documentCount;
    productCount = overview.productCount;
    businessName = overview.storeName || businessName;
    isVerified = overview.isVerified;
  } catch {
    const [{ data: sp }, { count: dc }, { count: pc }] = await Promise.all([
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
    sellerProfile = sp;
    documentCount = dc ?? 0;
    productCount = pc ?? 0;
    isVerified = sellerProfile?.status === "verified";
    businessName = sellerProfile?.business_name || businessName;
  }

  // Calculate data-driven pending steps for notification badge
  const hasProfileDetails =
    Boolean(sellerProfile?.business_name) &&
    Boolean(sellerProfile?.gst_number && sellerProfile?.gst_number !== "PENDING");
  const hasDocuments = (documentCount ?? 0) > 0;
  const hasProducts = (productCount ?? 0) > 0;

  const pendingSteps: { label: string; href: string }[] = [];
  if (!hasProfileDetails) {
    pendingSteps.push({
      label: "Complete Business Profile & GSTIN",
      href: "/dashboard/account",
    });
  }
  if (!hasDocuments) {
    pendingSteps.push({
      label: "Upload Business / Verification Documents",
      href: "/dashboard/documents",
    });
  }
  if (!hasProducts) {
    pendingSteps.push({
      label: "Publish your first product",
      href: "/dashboard/products/new",
    });
  }
  if (!isVerified) {
    pendingSteps.push({
      label: "Store verification review in progress",
      href: "/dashboard",
    });
  }

  return (
    <div className="bg-surface text-on-surface flex min-h-screen flex-col antialiased sm:flex-row">
      {/* 1. SELLER SIDEBAR */}
      <DashboardSidebar
        role="seller"
        user={{
          full_name: session.profile?.full_name,
          email: session.user.email,
        }}
        businessName={businessName}
        isVerified={isVerified}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Support Impersonation Session Banner */}
        {isSupportSession && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-600 bg-amber-500 px-4 py-2 text-xs font-medium text-amber-950 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-900" />
              <span>
                <strong>Support Impersonation Mode:</strong> You are actively inspecting{" "}
                <span className="font-semibold underline">{businessName}</span>
                &apos;s seller desk. Actions taken here modify live records.
              </span>
            </div>
            <form action={exitSupportSession}>
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-amber-950 px-3 py-1 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-black"
                title="End support session and return to Admin portal"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Exit to Admin Desk</span>
              </button>
            </form>
          </div>
        )}

        {/* Sticky Header Topbar */}
        <header className="border-outline-variant/60 bg-surface-container-lowest/95 shadow-elevation-1 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-3 backdrop-blur-md select-none sm:px-6">
          {/* Workspace Title & Verification Chip */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-on-surface max-w-[140px] truncate text-xs font-semibold sm:max-w-xs sm:text-sm">
              {businessName}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-tight ${
                isVerified
                  ? "border-success/20 bg-success-container text-on-success-container border"
                  : "border-warning/20 bg-warning-container text-on-warning-container border"
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="text-success h-3 w-3" />
                  <span className="xs:inline hidden">Verified Store</span>
                  <span className="xs:hidden">Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="text-warning h-3 w-3" />
                  <span className="xs:inline hidden">Pending Review</span>
                  <span className="xs:hidden">Pending</span>
                </>
              )}
            </span>
          </div>

          {/* Controls: Search, Notifications, Exit */}
          <div className="flex items-center gap-2">
            <SearchTriggerButton placeholder="Search store..." />

            <SellerHeaderNotifications pendingSteps={pendingSteps} />

            <form action={signOut}>
              <button
                type="submit"
                className="border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-error-container hover:text-on-error-container hover:border-error/30 flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors"
                title="Sign out of seller account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
