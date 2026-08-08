import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/lib/require-role";
import { ProductsTableClient } from "./products-table-client";

export default async function AdminProductsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("updated_at", { ascending: false });

  return <ProductsTableClient initialProducts={products ?? []} />;
}
