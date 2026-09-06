import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { ProductsTableClient } from "./products-table-client";

export default async function AdminProductsPage() {
  await requireRole("admin");
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
