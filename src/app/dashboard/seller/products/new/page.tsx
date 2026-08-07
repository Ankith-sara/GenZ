import { requireRole } from "@/lib/require-role";
import { ProductForm } from "../product-form";
import { PageHeader } from "@/components/admin/ui/page-header";

export default async function NewProductPage() {
  await requireRole("seller");

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Add New Catalog Listing"
        description="Starts as a draft. You can add image assets, variants, and reels once created."
        breadcrumbs={[
          { label: "Seller Desk", href: "/dashboard/seller" },
          { label: "Products", href: "/dashboard/seller/products" },
          { label: "New Listing" },
        ]}
      />

      <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
