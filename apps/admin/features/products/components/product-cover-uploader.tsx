"use client";

import { useRef, useState } from "react";
import { Upload, ImageIcon, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@genz/ui";
import { validateFileContent } from "@/lib/file-validation";
import { productMediaUrl } from "@/features/products/lib/products";
import { uploadProductCoverAction } from "@/app/dashboard/products/actions";

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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
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
    <div className="font-graphik space-y-4">
      {previewUrl ? (
        <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-[#E5E5E0] bg-[#FAF8F4] shadow-2xs">
          <Image
            src={previewUrl}
            alt="Product Cover"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            unoptimized
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/80 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs backdrop-blur-xs">
            <ImageIcon className="h-3 w-3" />
            <span>Main Cover Image</span>
          </div>
        </div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E5E0] bg-[#FAF8F4]/60 p-6 text-center">
          <ImageIcon className="mb-2 h-8 w-8 text-[#8C8C85]" />
          <p className="text-xs font-bold text-[#1A1A18]">No Cover Photo Uploaded</p>
          <p className="text-[11px] text-[#73736E]">
            High-res cover photos improve buyer clicks by 40%.
          </p>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === "uploading"}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-neutral-800"
        >
          {status === "uploading" ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
              <span className="text-white">Uploading Cover...</span>
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5 text-white" />
              <span className="font-semibold text-white">
                {previewUrl ? "Change Cover Image" : "Upload Cover Image"}
              </span>
            </>
          )}
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
