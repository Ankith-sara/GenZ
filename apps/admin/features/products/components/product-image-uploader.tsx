"use client";

import { useRef, useState } from "react";
import { Upload, X, RefreshCw, Images } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@genz/ui";
import { createClient } from "@genz/database";
import { validateFileContent } from "@/lib/file-validation";
import { productMediaUrl } from "@/features/products/lib/products";
import type { ProductImage } from "@genz/types";
import { uploadProductImagesAction } from "@/app/dashboard/products/actions";

const MAX_IMAGES = 8;

export function ProductImageUploader({
  productId,
  sellerId: _sellerId,
  images,
}: {
  productId: string;
  sellerId: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} gallery images allowed per product.`);
      return;
    }
    setStatus("uploading");
    setError(null);

    // Fast client-side check
    for (const file of files) {
      const validation = await validateFileContent(file, ["image"]);
      if (!validation.valid) {
        setStatus("error");
        setError(validation.error || "Invalid file content.");
        return;
      }
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append("gallery_images", file);
    }

    const result = await uploadProductImagesAction(productId, formData);

    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleRemove(image: ProductImage) {
    const supabase = createClient();
    await supabase.from("product_images").delete().eq("id", image.id);
    await supabase.storage.from("product-media").remove([image.image_path]);
    router.refresh();
  }

  return (
    <div className="font-graphik space-y-4">
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => {
            const url = productMediaUrl(image.image_path);
            return (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] shadow-2xs transition-all hover:border-black/50"
              >
                {url && (
                  <Image
                    src={url}
                    alt="Gallery Image"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(image)}
                  aria-label="Remove image"
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white opacity-0 shadow-xs transition-opacity group-hover:opacity-100 hover:bg-rose-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[100px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E5E0] bg-[#FAF8F4]/50 p-4 text-center">
          <Images className="mb-1 h-6 w-6 text-[#8C8C85]" />
          <p className="text-xs text-[#73736E]">No gallery photos added yet</p>
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === "uploading" || images.length >= MAX_IMAGES}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-neutral-800"
        >
          {status === "uploading" ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
              <span className="text-white">Uploading Photos...</span>
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5 text-white" />
              <span className="font-semibold text-white">
                {images.length > 0 ? "Add More Photos" : "Upload Gallery Photos"}
              </span>
            </>
          )}
        </Button>

        <span className="font-mono text-[10px] text-[#73736E]">
          {images.length}/{MAX_IMAGES} Gallery Photos (Max 5MB each)
        </span>
      </form>

      {error && (
        <p role="alert" className="text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
