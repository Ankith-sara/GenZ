import { createClient } from "@genz/database";
import { requireRole } from "@genz/database/authorization";
import { SellerProductsClient } from "./seller-products-client";

export default async function SellerProductsPage() {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", session.userId)
    .order("updated_at", { ascending: false });

  return <SellerProductsClient initialProducts={products ?? []} />;
}
