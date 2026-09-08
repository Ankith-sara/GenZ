"use client";

import React, { useActionState } from "react";
import { ProductEditorForm, type ProductImageItem } from "@genz/ui/shared-features";
import { updateProduct, type ProductFormState } from "@/app/dashboard/products/actions";
import { createBrowserClient } from "@genz/database";
import type { Product, ProductVariant, ProductStatus } from "@genz/types";
import { productMediaUrl } from "@/features/products/lib/products";
import { PublishControls } from "./publish-controls";

interface SellerProductEditClientProps {
  product: Product;
  images: { id: string; image_path: string }[];
  variants: ProductVariant[];
  reelCount: number;
  sellerId: string;
  sellerBusinessName?: string;
}

async function uploadImageToStorage(
  file: File,
  sellerId: string,
  index: number
): Promise<string | null> {
  const supabase = createBrowserClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = `upload-${Date.now()}-${index}.${ext}`;
  const path = `${sellerId}/products/pending/${safeName}`;

  const { error } = await supabase.storage.from("product-media").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    console.error(`Client upload error for image ${index}:`, error);
    return null;
  }
  return path;
}

export function SellerProductEditClient({
  product,
  images,
  variants: _variants,
  reelCount,
  sellerId,
  sellerBusinessName,
}: SellerProductEditClientProps) {
  const updateProductWithId = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    updateProductWithId,
    {}
  );

  const initialImages: ProductImageItem[] = [];
  if (product.cover_image_path) {
    initialImages.push({
      id: "cover",
      previewUrl: productMediaUrl(product.cover_image_path) || product.cover_image_path,
      source: "url",
      name: "Cover Image",
    });
  }
  images.forEach((img, idx) => {
    if (img.image_path !== product.cover_image_path) {
      initialImages.push({
        id: img.id || `img-${idx}`,
        previewUrl: productMediaUrl(img.image_path) || img.image_path,
        source: "url",
        name: `Gallery Image ${idx + 1}`,
      });
    }
  });

  return (
    <div className="space-y-6">
      <PublishControls
        productId={product.id}
        status={product.status as ProductStatus}
      />
      <ProductEditorForm
        role="seller"
        mode="edit"
        productId={product.id}
        sellerId={sellerId}
        sellerBusinessName={sellerBusinessName}
        action={formAction}
        state={state}
        isPending={isPending}
        cancelHref="/dashboard/products"
        manageReelsHref={`/dashboard/products/${product.id}/reels`}
        reelsCount={reelCount}
        submitLabel="Save Changes"
        onUploadImage={(file, index) => uploadImageToStorage(file, sellerId, index)}
        initialValues={{
          name: product.name,
          priceInr: product.price_inr !== null ? String(product.price_inr) : "",
          category: product.category || "Wooden Toys & Crafts",
          description: product.description || "",
          materials: Array.isArray(product.materials) ? product.materials.join(", ") : "",
          status: (product.status as "published" | "draft") || "published",
          images: initialImages,
          sku: product.sku || "",
          stockQty:
            product.inventory_count !== null && product.inventory_count !== undefined
              ? String(product.inventory_count)
              : "0",
          lowStockThreshold:
            product.low_stock_threshold !== null &&
            product.low_stock_threshold !== undefined
              ? String(product.low_stock_threshold)
              : "5",
          trackInventory: product.track_inventory ?? true,
          isFeatured: product.is_featured ?? false,
          isNewArrival: product.is_new_arrival ?? true,
          isBestSeller: product.is_best_seller ?? false,
        }}
      />
    </div>
  );
}
