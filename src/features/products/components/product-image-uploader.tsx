"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/atoms/button";
import { createClient } from "@/lib/supabase/client";
import { validateFileContent } from "@/lib/file-validation";
import { productMediaUrl } from "@/features/products/lib/products";
import type { ProductImage } from "@/types/database";
import { uploadProductImagesAction } from "@/app/seller/dashboard/products/actions";

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

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const files = Array.from(fileInputRef.current?.files ?? []);
    if (files.length === 0) return;
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Up to ${MAX_IMAGES} gallery images per product.`);
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
    <div>
      <p className="mb-2 text-sm font-medium">Gallery images</p>
      {images.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image) => {
            const url = productMediaUrl(image.image_path);
            return (
              <div
                key={image.id}
                className="border-border group relative aspect-square overflow-hidden rounded-[4px] border"
              >
                {url && (
                  <Image src={url} alt="" fill className="object-cover" unoptimized />
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(image)}
                  aria-label="Remove image"
                  className="bg-background/90 text-foreground border-border absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="file:border-foreground text-sm file:mr-3 file:h-10 file:rounded-[4px] file:border file:bg-transparent file:px-3 file:text-sm"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={status === "uploading"}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {status === "uploading" ? "Uploading…" : "Add images"}
        </Button>
      </form>
      <p className="text-muted-foreground mt-1.5 text-xs">
        Up to {MAX_IMAGES} images, 5MB each, in addition to the cover image above.
      </p>
      {error && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
