import { notFound } from "next/navigation";
import { createClient } from "@genz/database";
import { requireRole } from "@genz/database/authorization";
import { SellerProductEditClient } from "./seller-product-edit-client";
import { getAuthenticatedSellerApiClient } from "@/lib/api-server-client";

export default async function SellerProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("seller");
  const { id } = await params;
  const supabase = await createClient();

  let product: any = null;
  let variants: any[] = [];

  try {
    const client = await getAuthenticatedSellerApiClient();
    const res = await client.sellers.getProduct(id);
    product = res;
    variants = (res as any)?.product_variants || [];
  } catch {
    const { data: p } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("seller_id", session.userId)
      .maybeSingle();
    product = p;
  }

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

  if (variants.length === 0) {
    const { data: varData } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: true });
    variants = varData ?? [];
  }

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

  const { data: catRows } = await supabase.from("products").select("category");

  const categories = Array.from(
    new Set((catRows ?? []).map((p) => p.category?.trim()).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="w-full">
      <SellerProductEditClient
        product={product}
        images={images ?? []}
        variants={variants ?? []}
        reelCount={reelCount ?? 0}
        sellerId={session.userId}
        sellerBusinessName={businessName ?? undefined}
        categories={categories}
      />
    </div>
  );
}
