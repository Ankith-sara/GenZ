"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@genz/ui";
import { Upload, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { validateFileContent } from "@/lib/file-validation";
import { uploadCoverAction } from "@/features/user/actions";

export function CoverUploader({
  currentUrl,
  onUploaded,
}: {
  currentUrl: string | null;
  onUploaded?: (url: string) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  async function handleUpload(e?: React.FormEvent | React.MouseEvent) {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    setStatus("uploading");
    setError(null);

    const validation = await validateFileContent(selectedFile, ["image"]);
    if (!validation.valid) {
      setStatus("error");
      setError(validation.error || "Invalid image file content.");
      return;
    }

    const formData = new FormData();
    formData.append("cover", selectedFile);

    const result = await uploadCoverAction(formData);

    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setStatus("success");
    if (result.url) {
      setPreviewUrl(result.url);
      if (onUploaded) onUploaded(result.url);
    }
    setSelectedFile(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Cover Banner Preview Box */}
      <div className="relative h-32 sm:h-40 w-full overflow-hidden rounded-2xl border border-[#E5E5E0] bg-neutral-900 shadow-xs">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Cover banner preview"
            fill
            className="object-cover object-center"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900">
            <div className="text-center text-white/70">
              <ImageIcon className="mx-auto h-8 w-8 text-white/50 mb-1" />
              <p className="text-xs">No cover photo set. Default artisan banner will be used.</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3 text-white text-[11px] font-mono bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
          Storefront Cover Preview
        </div>
      </div>

      {/* File Upload Box */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file:border-[#1A1A18] file:bg-white text-xs file:mr-3 file:h-9 file:rounded-lg file:border file:px-3 file:font-medium file:cursor-pointer text-neutral-600"
        />

        {selectedFile && (
          <Button
            type="button"
            onClick={handleUpload}
            size="sm"
            disabled={status === "uploading"}
            className="bg-black hover:bg-neutral-850 text-white text-xs h-9 rounded-lg font-semibold px-4 shadow-sm"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {status === "uploading" ? "Uploading Cover…" : "Save Cover Banner"}
          </Button>
        )}
      </div>

      {status === "success" && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Cover banner updated and published!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
