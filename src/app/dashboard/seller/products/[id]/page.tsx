import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Film } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/lib/require-role";
import { Button } from "@/components/ui/atoms/button";
import { ProductCoverUploader } from "@/features/products/components/product-cover-uploader";
import { ProductImageUploader } from "@/features/products/components/product-image-uploader";
import { ProductVariantEditor } from "@/features/products/components/product-variant-editor";
import { PRODUCT_STATUS_LABEL } from "@/features/products/lib/products";
import { ProductForm } from "../product-form";
import { PublishControls } from "./publish-controls";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { StatusBadge } from "@/components/ui/atoms/status-badge";

export default async function SellerProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("seller");
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("seller_id", session.userId)
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
    <div className="space-y-6 select-none">
      <PageHeader
        title={product.name}
        description={`Catalog Item ID: ${product.id}`}
        breadcrumbs={[
          { label: "Seller Desk", href: "/dashboard/seller" },
          { label: "Products", href: "/dashboard/seller/products" },
          { label: product.name },
        ]}
        actions={
          <StatusBadge
            status={product.status === "published" ? "active" : "draft"}
            label={PRODUCT_STATUS_LABEL[product.status] || product.status}
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Details & Assets */}
        <div className="space-y-6 lg:col-span-2">
          {/* Cover Image Upload Card */}
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
            <h3 className="font-graphik mb-4 text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
              Product Cover Image
            </h3>
            <ProductCoverUploader
              productId={product.id}
              sellerId={session.userId}
              currentPath={product.cover_image_path}
            />
          </div>

          {/* Product Media Gallery Card */}
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
            <h3 className="font-graphik mb-4 text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
              Product Media Gallery
            </h3>
            <ProductImageUploader
              productId={product.id}
              sellerId={session.userId}
              images={images ?? []}
            />
          </div>

          {/* Product Form Card */}
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
            <h3 className="font-graphik mb-4 text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
              Product Specification & Pricing
            </h3>
            <ProductForm mode="edit" product={product} />
          </div>
        </div>

        {/* Right 1 Column: Status, Variants, Reels */}
        <div className="space-y-6">
          {/* Publish Controls Card */}
          <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
            <h3 className="font-graphik text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
              Status & Publication
            </h3>
            <PublishControls productId={product.id} status={product.status} />

            {product.status === "published" && (
              <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
                <Link
                  href={`/discover`}
                  target="_blank"
                  className="font-graphik flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Product Variants Card */}
          <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
            <h3 className="font-graphik mb-4 text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
              Product Variants
            </h3>
            <ProductVariantEditor productId={product.id} variants={variants ?? []} />
          </div>

          {/* Reels Card */}
          <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
            <h3 className="font-graphik text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
              Product Reels
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-graphik text-xs font-semibold text-[#52524E]">
                {reelCount ?? 0} video reel{reelCount === 1 ? "" : "s"} linked
              </span>
              <Film className="h-4 w-4 text-[#8C8C85]" />
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
              <Link href={`/dashboard/seller/products/${product.id}/reels`}>
                Manage Reels
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
