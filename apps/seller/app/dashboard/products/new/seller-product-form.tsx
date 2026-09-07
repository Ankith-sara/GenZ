"use client";

import React, { useActionState } from "react";
import { ProductEditorForm } from "@genz/ui/shared-features";
import { createProduct, type ProductFormState } from "@/app/dashboard/products/actions";
import { createBrowserClient } from "@genz/database";

interface SellerProductFormProps {
  sellerId: string;
  sellerBusinessName?: string;
}

/**
 * Uploads a single image File to Supabase Storage client-side.
 * Returns the storage path on success, or null on failure.
 */
async function uploadImageToStorage(
  file: File,
  sellerId: string,
  index: number
): Promise<string | null> {
  const supabase = createBrowserClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = `upload-${Date.now()}-${index}.${ext}`;
  const path = `${sellerId}/products/pending/${safeName}`;

  const { error } = await supabase.storage
    .from("product-media")
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error(`Client upload error for image ${index}:`, error);
    return null;
  }
  return path;
}

export function SellerProductForm({
  sellerId,
  sellerBusinessName,
}: SellerProductFormProps) {
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    createProduct,
    {}
  );

  const handleUploadImage = (file: File, index: number) => {
    return uploadImageToStorage(file, sellerId, index);
  };

  return (
    <ProductEditorForm
      role="seller"
      sellerId={sellerId}
      sellerBusinessName={sellerBusinessName}
      action={formAction}
      state={state}
      isPending={isPending}
      cancelHref="/dashboard/products"
      onUploadImage={handleUploadImage}
    />
  );
}
