import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRODUCT_STATUS_LABEL, formatInr } from "@/lib/products";

export default async function ManufacturerProductsPage() {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  const [{ data: products }, { data: manufacturerProfile }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("manufacturer_id", session.userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("manufacturer_profiles")
      .select("status")
      .eq("id", session.userId)
      .maybeSingle(),
  ]);

  const isVerified = manufacturerProfile?.status === "verified";

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-12">
      <Link
        href="/dashboard/manufacturer"
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl leading-[1.27]">Your products</h1>
        {isVerified ? (
          <Button asChild>
            <Link href="/dashboard/manufacturer/products/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New product
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/dashboard/manufacturer/onboarding">
              Get verified to list products
            </Link>
          </Button>
        )}
      </div>

      {!isVerified && (
        <p className="text-muted-foreground mt-3 text-sm">
          Only verified manufacturers can publish products — finish onboarding and get
          approved first.
        </p>
      )}

      <div className="divide-border border-border bg-card mt-8 divide-y rounded-[4px] border">
        {(products ?? []).length === 0 && (
          <p className="text-muted-foreground p-6 text-sm">No products yet.</p>
        )}
        {(products ?? []).map((product) => (
          <Link
            key={product.id}
            href={`/dashboard/manufacturer/products/${product.id}`}
            className="hover:bg-background flex flex-wrap items-center justify-between gap-3 p-6"
          >
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-muted-foreground text-sm">
                {product.category} · {formatInr(product.price_inr)}
              </p>
            </div>
            <Badge variant="default">{PRODUCT_STATUS_LABEL[product.status]}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
