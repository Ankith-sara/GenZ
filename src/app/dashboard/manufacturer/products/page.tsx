import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_STATUS_LABEL, formatInr } from "@/lib/products";

export default async function ManufacturerProductsPage() {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("manufacturer_id", session.userId)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header and Back Link Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-nantes text-3xl font-bold text-[#1A1A18]">
            Your Products
          </h1>
          <p className="font-graphik mt-1 text-xs text-[#73736E]">
            Manage your catalog listings, drafts, and variant properties.
          </p>
        </div>
        <Link
          href="/dashboard/manufacturer"
          className="font-graphik flex items-center gap-1.5 text-xs font-semibold text-[#52524E] hover:text-black sm:order-first"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      {/* Products Grid & List Card */}
      <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-5">
          <span className="font-graphik text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
            Product Catalog ({products?.length ?? 0})
          </span>
          <Link
            href="/dashboard/manufacturer/products/new"
            className="font-graphik flex items-center gap-1.5 rounded-xl border border-black bg-black px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-neutral-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product</span>
          </Link>
        </div>

        <div className="divide-y divide-[#F0F0EC]">
          {!products || products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-graphik text-sm text-[#8C8C85]">
                No products listed in your catalog.
              </p>
              <Link
                href="/dashboard/manufacturer/products/new"
                className="font-graphik mt-3 inline-flex items-center gap-1 text-xs font-bold text-black hover:underline"
              >
                Create your first product listing
              </Link>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="group flex flex-wrap items-center justify-between gap-4 rounded-xl px-2 py-5 transition-all hover:bg-[#FAFAFA]"
              >
                <div className="min-w-[200px] flex-1">
                  <Link
                    href={`/dashboard/manufacturer/products/${product.id}`}
                    className="font-graphik block text-sm font-semibold text-black group-hover:text-neutral-900 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="font-graphik mt-0.5 text-xs text-[#73736E]">
                    Category:{" "}
                    <span className="font-medium text-black">{product.category}</span> ·
                    Age Group:{" "}
                    <span className="font-medium text-black">
                      {product.age_group || "All ages"}
                    </span>{" "}
                    · {formatInr(product.price_inr)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={product.status === "published" ? "verified" : "default"}
                    className="font-mono text-[9px] font-bold tracking-wider uppercase"
                  >
                    {PRODUCT_STATUS_LABEL[product.status]}
                  </Badge>
                  <Link
                    href={`/dashboard/manufacturer/products/${product.id}`}
                    className="font-graphik text-xs font-semibold text-[#8C8C85] hover:text-black"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
