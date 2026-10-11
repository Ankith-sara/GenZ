import { createAdminClient } from "@genz/database/admin";
import { requirePermission } from "@genz/database/authorization";
import { ProductsTableClient } from "./products-table-client";

export default async function AdminProductsPage() {
  await requirePermission("products:read");
  const supabase = createAdminClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[AdminProductsPage] Error fetching products:", error);
  }

  return <ProductsTableClient initialProducts={products ?? []} />;
}
