import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Film } from "lucide-react";
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
    <div className="max-w-6xl space-y-6">
      {/* Header and Back Link Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-nantes text-3xl font-bold text-[#1A1A18]">
            {product.name}
          </h1>
          <Badge
            variant={product.status === "published" ? "verified" : "default"}
            className="font-mono text-[9px] font-bold tracking-wider uppercase"
          >
            {PRODUCT_STATUS_LABEL[product.status]}
          </Badge>
        </div>
        <Link
          href="/dashboard/manufacturer/products"
          className="font-graphik flex items-center gap-1.5 text-xs font-semibold text-[#52524E] hover:text-black sm:order-first"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Details & Assets */}
        <div className="space-y-6 lg:col-span-2">
          {/* Cover Image Upload Card */}
          <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
            <h3 className="font-graphik mb-4 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
              Cover Image
            </h3>
            <ProductCoverUploader
              productId={product.id}
              manufacturerId={session.userId}
              currentPath={product.cover_image_path}
            />
          </div>

          {/* Product Media Gallery Card */}
          <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
            <h3 className="font-graphik mb-4 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
              Product Gallery
            </h3>
            <ProductImageUploader
              productId={product.id}
              manufacturerId={session.userId}
              images={images ?? []}
            />
          </div>

          {/* Product Form Card */}
          <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
            <h3 className="font-graphik mb-4 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
              Product details
            </h3>
            <ProductForm mode="edit" product={product} />
          </div>
        </div>

        {/* Right 1 Column: Variants, Reels & Actions */}
        <div className="space-y-6">
          {/* Publish Controls Card */}
          <div className="space-y-4 rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
            <h3 className="font-graphik text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
              Status Controls
            </h3>
            <PublishControls productId={product.id} status={product.status} />

            {product.status === "published" && (
              <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
                <Link
                  href={`/products/${product.id}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1.5"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Product Variants Card */}
          <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
            <h3 className="font-graphik mb-4 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
              Product Variants
            </h3>
            <ProductVariantEditor productId={product.id} variants={variants ?? []} />
          </div>

          {/* Reels Card */}
          <div className="space-y-4 rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
            <h3 className="font-graphik text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
              Product Reels
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-graphik text-sm text-[#52524E]">
                {reelCount ?? 0} reel{reelCount === 1 ? "" : "s"} linked
              </span>
              <Film className="h-4 w-4 text-[#8C8C85]" />
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
              <Link href={`/dashboard/manufacturer/products/${product.id}/reels`}>
                Manage Reels
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
