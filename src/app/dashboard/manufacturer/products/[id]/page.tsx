import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCoverUploader } from "@/components/product-cover-uploader";
import { ProductImageUploader } from "@/components/product-image-uploader";
import { ProductVariantEditor } from "@/components/product-variant-editor";
import { PRODUCT_STATUS_LABEL } from "@/lib/products";
import { ProductForm } from "../product-form";
import { PublishControls } from "./publish-controls";

export default async function ManufacturerProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("manufacturer");
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("manufacturer_id", session.userId)
    .maybeSingle();

  if (!product) notFound();

  const { count: reelCount } = await supabase
    .from("reels")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("position", { ascending: true });

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 sm:px-12">
      <Link
        href="/dashboard/manufacturer/products"
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to products
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl leading-[1.27]">{product.name}</h1>
        <Badge variant="default">{PRODUCT_STATUS_LABEL[product.status]}</Badge>
      </div>

      <div className="mt-8">
        <ProductCoverUploader
          productId={product.id}
          manufacturerId={session.userId}
          currentPath={product.cover_image_path}
        />
      </div>

      <div className="border-border bg-card mt-6 rounded-[4px] border p-6">
        <ProductImageUploader
          productId={product.id}
          manufacturerId={session.userId}
          images={images ?? []}
        />
      </div>

      <div className="border-border bg-card mt-8 rounded-[4px] border p-8">
        <ProductForm mode="edit" product={product} />
      </div>

      <div className="border-border bg-card mt-6 rounded-[4px] border p-6">
        <ProductVariantEditor productId={product.id} variants={variants ?? []} />
      </div>

      <div className="border-border bg-card mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[4px] border p-6">
        <div>
          <p className="text-muted-foreground text-sm">
            {reelCount ?? 0} reel{reelCount === 1 ? "" : "s"}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href={`/dashboard/manufacturer/products/${product.id}/reels`}>
              Manage reels
            </Link>
          </Button>
        </div>
        {product.status === "published" && (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/products/${product.id}`} target="_blank">
              View public page
            </Link>
          </Button>
        )}
      </div>

      <PublishControls productId={product.id} status={product.status} />
    </div>
  );
}
