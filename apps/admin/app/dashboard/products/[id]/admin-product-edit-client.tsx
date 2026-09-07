"use client";

import React, { useActionState } from "react";
import {
  ProductEditorForm,
  type ProductImageItem,
  type SellerOption,
} from "@genz/ui/shared-features";
import {
  adminUpdateProductFormAction,
  type ProductFormState,
} from "@/app/dashboard/products/actions";
import type { Product } from "@genz/types";

interface AdminProductEditClientProps {
  product: Product;
  adminUserId: string;
  sellers: SellerOption[];
}

export function AdminProductEditClient({
  product,
  adminUserId,
  sellers,
}: AdminProductEditClientProps) {
  const updateProductWithId = adminUpdateProductFormAction.bind(null, product.id);
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    updateProductWithId,
    {}
  );

  const initialImages: ProductImageItem[] = [];
  if (product.cover_image_path) {
    initialImages.push({
      id: "cover",
      previewUrl: product.cover_image_path,
      source: "url",
      name: "Cover Image",
    });
  }

  return (
    <ProductEditorForm
      role="admin"
      mode="edit"
      productId={product.id}
      adminUserId={adminUserId}
      sellerId={product.seller_id}
      sellers={sellers}
      action={formAction}
      state={state}
      isPending={isPending}
      cancelHref="/admin/dashboard/products"
      submitLabel="Save Changes"
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
          product.low_stock_threshold !== null && product.low_stock_threshold !== undefined
            ? String(product.low_stock_threshold)
            : "5",
        trackInventory: product.track_inventory ?? true,
        isFeatured: product.is_featured ?? false,
        isNewArrival: product.is_new_arrival ?? true,
        isBestSeller: product.is_best_seller ?? false,
      }}
    />
  );
}
