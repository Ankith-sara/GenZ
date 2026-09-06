import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { SellerProductForm } from "./seller-product-form";

export default async function NewProductPage() {
  const session = await requireRole("seller");

  let businessName = "Verified Workshop";
  try {
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("seller_profiles")
      .select("business_name, description")
      .eq("id", session.userId)
      .maybeSingle();

    if (profile) {
      businessName = profile.business_name || businessName;
      if (profile.description && typeof profile.description === "string" && profile.description.startsWith("{")) {
        try {
          const meta = JSON.parse(profile.description);
          businessName = (meta.business_name as string) || businessName;
        } catch {}
      }
    }
  } catch (e) {
    console.warn("Could not fetch seller profile for product creation:", e);
  }

  return (
    <div className="mx-auto max-w-[1440px] pb-16">
      <SellerProductForm
        sellerId={session.userId}
        sellerBusinessName={businessName}
      />
    </div>
  );
}
