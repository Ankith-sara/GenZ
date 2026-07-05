"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { productMediaUrl } from "@/lib/products";
import type { ProductImage } from "@/types/database";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 8;

export function ProductImageUploader({
  productId,
  manufacturerId,
  images,
}: {
  productId: string;
  manufacturerId: string;
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
    const oversize = files.find((f) => f.size > MAX_FILE_BYTES);
    if (oversize) {
      setError("Each image must be under 5MB.");
      return;
    }

    setStatus("uploading");
    setError(null);

    const supabase = createClient();
    let nextPosition = images.length;

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${manufacturerId}/products/${productId}/gallery-${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-media")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setStatus("error");
        setError(uploadError.message);
        return;
      }

      const { error: insertError } = await supabase.from("product_images").insert({
        product_id: productId,
        manufacturer_id: manufacturerId,
        image_path: path,
        position: nextPosition,
      });

      if (insertError) {
        setStatus("error");
        setError(insertError.message);
        return;
      }

      nextPosition += 1;
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
