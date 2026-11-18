import { createClient } from "@genz/database";
import { requireRole } from "@genz/database/authorization";
import { SellerProductsClient } from "./seller-products-client";
import { getAuthenticatedSellerApiClient } from "@/lib/api-server-client";

export default async function SellerProductsPage() {
  const session = await requireRole("seller");
  let products: any[] = [];
  try {
    const client = await getAuthenticatedSellerApiClient();
    const res = await client.sellers.listProducts({ status: "all", limit: 100 });
    products = res.products;
  } catch {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", session.userId)
      .order("updated_at", { ascending: false });
    products = data ?? [];
  }

  return <SellerProductsClient initialProducts={products ?? []} />;
}
