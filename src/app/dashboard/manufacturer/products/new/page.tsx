import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  const { data: manufacturerProfile } = await supabase
    .from("manufacturer_profiles")
    .select("status")
    .eq("id", session.userId)
    .maybeSingle();

  if (manufacturerProfile?.status !== "verified") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 sm:px-12">
        <Link
          href="/dashboard/manufacturer/products"
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Back to products
        </Link>
        <h1 className="mt-4 text-3xl leading-[1.27]">Get verified first</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Only verified manufacturers can list products on GenZ. Finish your business
          profile and documents to get reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 sm:px-12">
      <Link
        href="/dashboard/manufacturer/products"
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to products
      </Link>
      <h1 className="mt-4 text-3xl leading-[1.27]">New product</h1>
      <p className="text-muted-foreground mt-2 max-w-xl">
        Starts as a draft — you can add reels and publish it once it&apos;s ready.
      </p>

      <div className="border-border bg-card mt-8 rounded-[4px] border p-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
