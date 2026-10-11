import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { SellerProductForm } from "./seller-product-form";

export default async function NewProductPage() {
  const session = await requireRole("seller");

  let businessName = "Verified Workshop";
  let categories: string[] = [];

  try {
    const supabase = createAdminClient();
    const [profileRes, catRes] = await Promise.all([
      supabase
        .from("seller_profiles")
        .select("business_name, description")
        .eq("id", session.userId)
        .maybeSingle(),
      supabase
        .from("products")
        .select("category"),
    ]);

    const profile = profileRes.data;
    if (profile) {
      businessName = profile.business_name || businessName;
      if (
        profile.description &&
        typeof profile.description === "string" &&
        profile.description.startsWith("{")
      ) {
        try {
          const meta = JSON.parse(profile.description);
          businessName = (meta.business_name as string) || businessName;
        } catch {}
      }
    }

    categories = Array.from(
      new Set((catRes.data ?? []).map((p) => p.category?.trim()).filter(Boolean))
    ).sort() as string[];
  } catch (e) {
    console.warn("Could not fetch seller profile or categories for product creation:", e);
  }

  return (
    <div className="w-full">
      <SellerProductForm
        sellerId={session.userId}
        sellerBusinessName={businessName}
        categories={categories}
      />
    </div>
  );
}
