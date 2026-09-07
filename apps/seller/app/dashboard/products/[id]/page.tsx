import { notFound } from "next/navigation";
import { createClient } from "@genz/database";
import { requireRole } from "@/features/auth/lib/require-role";
import { SellerProductEditClient } from "./seller-product-edit-client";

export default async function SellerProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("seller");
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("seller_id", session.userId)
    .maybeSingle();

  if (!product) notFound();

  const { count: reelCount } = await supabase
    .from("reels")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  const { data: images } = await supabase
    .from("product_images")
    .select("id, image_path")
    .eq("product_id", id)
    .order("position", { ascending: true });

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: true });

  // Intelligent fallback for seller business name (Rule 4)
  const { data: sellerProfile } = await supabase
    .from("seller_profiles")
    .select("business_name")
    .eq("id", session.userId)
    .maybeSingle();

  let businessName = sellerProfile?.business_name;
  if (!businessName && session.email) {
    const { data: appData } = await supabase
      .from("seller_applications")
      .select("business_name")
      .eq("email", session.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (appData?.business_name) {
      businessName = appData.business_name;
    }
  }

  return (
    <div className="font-graphik mx-auto max-w-5xl py-6 sm:py-8">
      <SellerProductEditClient
        product={product}
        images={images ?? []}
        variants={variants ?? []}
        reelCount={reelCount ?? 0}
        sellerId={session.userId}
        sellerBusinessName={businessName ?? undefined}
      />
    </div>
  );
}
