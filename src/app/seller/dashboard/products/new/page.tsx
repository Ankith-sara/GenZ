import { requireRole } from "@/features/auth/lib/require-role";
import { ProductForm } from "../product-form";
import { PageHeader } from "@/components/ui/organisms/page-header";

export default async function NewProductPage() {
  await requireRole("seller");

  return (
    <div className="font-graphik space-y-6 select-none">
      <PageHeader
        title="Add New Catalog Listing"
        description="Publish your manufactured products to the wholesale buyer catalog. Include high-res visual assets and material specifications."
        breadcrumbs={[
          { label: "Seller Desk", href: "/seller/dashboard" },
          { label: "Products", href: "/seller/dashboard/products" },
          { label: "New Listing" },
        ]}
      />

      <ProductForm mode="create" />
    </div>
  );
}
