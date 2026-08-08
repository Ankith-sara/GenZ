import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { AdminProductForm, type SellerOption } from "./admin-product-form";

export default async function AdminNewProductPage() {
  const session = await requireRole("admin");

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  // Fetch list of sellers to allow admin assignment
  const { data: rawSellers } = await supabase
    .from("seller_profiles")
    .select("id, business_name");

  const sellerIds = (rawSellers ?? []).map((s) => s.id);

  const profilesMap: Record<string, string> = {};
  if (sellerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", sellerIds);

    (profiles ?? []).forEach((p) => {
      profilesMap[p.id] = p.full_name || "";
    });
  }

  const sellersList: SellerOption[] = (rawSellers ?? []).map((s) => ({
    id: s.id,
    business_name: s.business_name || "Factory Seller",
    full_name: profilesMap[s.id] || null,
  }));

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Admin Product Dispatch & Creation"
        description="Add a new catalog listing on behalf of a verified seller or directly to the platform portfolio."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/dashboard/products" },
          { label: "Add Product" },
        ]}
      />

      <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <AdminProductForm sellers={sellersList} adminUserId={session.userId} />
      </div>
    </div>
  );
}
