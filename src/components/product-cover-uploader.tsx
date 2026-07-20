"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { validateFileContent } from "@/lib/file-validation";
import { productMediaUrl } from "@/lib/products";

export function ProductCoverUploader({
  productId,
  manufacturerId,
  currentPath,
}: {
  productId: string;
  manufacturerId: string;
  currentPath: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const previewUrl = productMediaUrl(currentPath);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError(null);

    const validation = await validateFileContent(file, ["image"]);
    if (!validation.valid) {
      setStatus("error");
      setError(validation.error || "Invalid file content.");
      return;
    }

    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${manufacturerId}/products/${productId}/cover-${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-media")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setStatus("error");
      setError(uploadError.message);
      return;
    }

    const previous = currentPath;
    const { error: updateError } = await supabase
      .from("products")
      .update({ cover_image_path: path })
      .eq("id", productId);

    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }

    if (previous) {
      await supabase.storage.from("product-media").remove([previous]);
    }

    setStatus("idle");
    router.refresh();
  }

  return (
    <div>
      {previewUrl ? (
        <div className="border-border relative mb-4 aspect-video w-full overflow-hidden rounded-[4px] border">
          <Image src={previewUrl} alt="" fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="border-border text-muted-foreground mb-4 flex aspect-video w-full items-center justify-center rounded-[4px] border border-dashed text-sm">
          No cover image yet
        </div>
      )}

      <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="file:border-foreground text-sm file:mr-3 file:h-10 file:rounded-[4px] file:border file:bg-transparent file:px-3 file:text-sm"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={status === "uploading"}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {status === "uploading" ? "Uploading…" : "Upload cover"}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
