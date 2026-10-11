import { notFound } from "next/navigation";
import { createAdminClient } from "@genz/database/admin";
import { requirePermission } from "@genz/database/authorization";
import { AdminProductEditClient } from "./admin-product-edit-client";
import type { SellerOption } from "@genz/ui/shared-features";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { session } = await requirePermission("products:write");
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();

  // Fetch verified sellers for assignment dropdown
  const { data: rawSellers } = await supabase
    .from("seller_profiles")
    .select("id, business_name")
    .order("business_name", { ascending: true });

  const sellers: SellerOption[] = (rawSellers ?? []).map((s) => ({
    id: s.id,
    business_name: s.business_name,
  }));

  const { data: catRows } = await supabase
    .from("products")
    .select("category");

  const categories = Array.from(
    new Set((catRows ?? []).map((p) => p.category?.trim()).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="mx-auto max-w-5xl py-6 sm:py-8">
      <AdminProductEditClient
        product={product}
        adminUserId={session.userId}
        sellers={sellers}
        categories={categories}
      />
    </div>
  );
}
