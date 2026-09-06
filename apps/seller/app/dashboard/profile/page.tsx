import { createClient } from "@genz/database";
import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import type { SellerProfile, SellerApplication, VerificationStatus } from "@genz/types";
import { SellerInstagramProfileStudio } from "./profile-studio";

export const metadata = {
  title: "Maker Profile & Storefront Studio — GenZ Seller Portal",
  description: "Customize your Instagram-style artisan profile, journey narrative, and catalog showcase.",
};

interface ApplicationFormData {
  business_name?: string;
  gst_number?: string;
  gstNumber?: string;
  factory_address?: string;
  address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pin_code?: string;
  description?: string;
  established_year?: string | number;
  establishedYear?: string | number;
  year_established?: string | number;
}

export default async function SellerProfilePage() {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const [
    { data: userProfile },
    { data: sellerProfile },
    { count: productCount },
    { count: reelCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", session.userId)
      .maybeSingle(),
    supabase.from("seller_profiles").select("*").eq("id", session.userId).maybeSingle(),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", session.userId),
    supabase
      .from("reels")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", session.userId),
  ]);

  // Fetch signup details from seller_applications to pre-populate missing profile fields
  const email = session.email?.toLowerCase().trim();
  let applicationData: SellerApplication | null = null;
  if (email) {
    try {
      const { data: appRow } = await supabase
        .from("seller_applications")
        .select("*")
        .ilike("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      applicationData = appRow;
    } catch (err) {
      console.warn("[SellerProfilePage] Notice loading seller application:", err);
    }
  }

  const formData = (applicationData?.form_data || {}) as ApplicationFormData;

  const appStatus = applicationData?.status;
  const fallbackStatus: VerificationStatus =
    appStatus === "approved"
      ? "verified"
      : appStatus === "rejected"
        ? "rejected"
        : appStatus === "pending"
          ? "pending"
          : "verified";

  const effectiveStatus: VerificationStatus =
    sellerProfile?.status || fallbackStatus;

  const effectiveSellerProfile: SellerProfile = {
    id: session.userId,
    business_name:
      sellerProfile?.business_name && sellerProfile.business_name !== "Factory Seller"
        ? sellerProfile.business_name
        : applicationData?.business_name || formData.business_name || "Factory Seller",
    gst_number:
      sellerProfile?.gst_number && sellerProfile.gst_number !== "PENDING"
        ? sellerProfile.gst_number
        : formData.gst_number || formData.gstNumber || "Pending",
    factory_address:
      sellerProfile?.factory_address ||
      formData.factory_address ||
      formData.address ||
      formData.street_address ||
      null,
    city: sellerProfile?.city || formData.city || null,
    state: sellerProfile?.state || formData.state || null,
    pincode: sellerProfile?.pincode || formData.pincode || formData.pin_code || null,
    description: sellerProfile?.description || formData.description || null,
    established_year:
      sellerProfile?.established_year ||
      (formData.established_year ? Number(formData.established_year) : null) ||
      (formData.establishedYear ? Number(formData.establishedYear) : null) ||
      (formData.year_established ? Number(formData.year_established) : null) ||
      null,
    status: effectiveStatus,
    rejection_reason: sellerProfile?.rejection_reason || null,
    submitted_at: sellerProfile?.submitted_at || null,
    reviewed_at: sellerProfile?.reviewed_at || null,
    reviewed_by: sellerProfile?.reviewed_by || null,
    created_at: sellerProfile?.created_at || new Date().toISOString(),
    updated_at: sellerProfile?.updated_at || new Date().toISOString(),
  };

  // Auto-persist into seller_profiles if record was missing or incomplete
  if (
    !sellerProfile ||
    !sellerProfile.factory_address ||
    !sellerProfile.city ||
    !sellerProfile.gst_number ||
    sellerProfile.gst_number === "PENDING"
  ) {
    try {
      const adminClient = createAdminClient();
      await adminClient.from("seller_profiles").upsert(
        {
          id: session.userId,
          business_name: effectiveSellerProfile.business_name,
          gst_number:
            effectiveSellerProfile.gst_number !== "Pending"
              ? effectiveSellerProfile.gst_number
              : "PENDING",
          factory_address: effectiveSellerProfile.factory_address,
          city: effectiveSellerProfile.city,
          state: effectiveSellerProfile.state,
          pincode: effectiveSellerProfile.pincode,
          description: effectiveSellerProfile.description,
          established_year: effectiveSellerProfile.established_year,
          status: effectiveSellerProfile.status,
        },
        { onConflict: "id" }
      );
    } catch {
      // Fallback ignore if DB offline
    }
  }

  return (
    <SellerInstagramProfileStudio
      userId={session.userId}
      fullName={userProfile?.full_name || applicationData?.full_name || "Factory Seller"}
      avatarUrl={userProfile?.avatar_url || null}
      sellerProfile={effectiveSellerProfile}
      productCount={productCount ?? 0}
      reelCount={reelCount ?? 0}
    />
  );
}
