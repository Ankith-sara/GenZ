"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/atoms/button";
import { validateFileContent } from "@/lib/file-validation";
import { productMediaUrl } from "@/features/products/lib/products";
import { uploadProductCoverAction } from "@/app/seller/dashboard/products/actions";

export function ProductCoverUploader({
  productId,
  sellerId: _sellerId,
  currentPath,
}: {
  productId: string;
  sellerId: string;
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

    // Fast client-side check
    const validation = await validateFileContent(file, ["image"]);
    if (!validation.valid) {
      setStatus("error");
      setError(validation.error || "Invalid file content.");
      return;
    }

    const formData = new FormData();
    formData.append("cover_image", file);

    const result = await uploadProductCoverAction(productId, formData);

    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
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
