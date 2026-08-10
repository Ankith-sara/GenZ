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
    <div className="font-graphik mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={product.name}
        description={`Catalog Item ID: ${product.id}`}
        breadcrumbs={[
          { label: "Seller Desk", href: "/seller/dashboard" },
          { label: "Products", href: "/seller/dashboard/products" },
          { label: product.name },
        ]}
        actions={
          <StatusBadge
            status={product.status === "published" ? "active" : "draft"}
            label={PRODUCT_STATUS_LABEL[product.status] || product.status}
          />
        }
      />

      {/* 1. Combined Product Media & Photo Gallery Card */}
      <div className="space-y-6 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <h3 className="text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
          Product Media & Photo Gallery
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Main Cover Image */}
          <div>
            <p className="mb-2 text-xs font-semibold text-[#1A1A18]">
              Main Cover Image
            </p>
            <ProductCoverUploader
              productId={product.id}
              sellerId={session.userId}
              currentPath={product.cover_image_path}
            />
          </div>

          {/* Photo Gallery Grid */}
          <div>
            <p className="mb-2 text-xs font-semibold text-[#1A1A18]">
              Additional Gallery Photos
            </p>
            <ProductImageUploader
              productId={product.id}
              sellerId={session.userId}
              images={images ?? []}
            />
          </div>
        </div>
      </div>

      {/* 2. Specifications, Craft Story & Pricing */}
      <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <h3 className="mb-4 text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
          Product Specifications & Pricing
        </h3>
        <ProductForm mode="edit" product={product} />
      </div>

      {/* 3. Product Variants & Inventory Options */}
      <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <h3 className="mb-4 text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
          Product Variants & Inventory Options
        </h3>
        <ProductVariantEditor productId={product.id} variants={variants ?? []} />
      </div>

      {/* 4. Status & Publication Controls (Placed BELOW Variants) */}
      <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <h3 className="mb-4 text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
          Status & Publication Controls
        </h3>
        <PublishControls productId={product.id} status={product.status} />
      </div>

      {/* 5. Video Reels Management */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-[#8C8C85] uppercase">
            Product Video Reels
          </h3>
          <p className="mt-1 text-xs text-[#52524E]">
            {reelCount ?? 0} video reel{reelCount === 1 ? "" : "s"} linked to this
            catalog item
          </p>
        </div>
        <Button
          asChild
          className="h-10 shrink-0 rounded-xl bg-black px-5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-neutral-800"
        >
          <Link
            href={`/seller/dashboard/products/${product.id}/reels`}
            className="flex items-center gap-2"
          >
            <Film className="h-4 w-4 text-white" />
            <span>Manage Video Reels</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
