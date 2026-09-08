"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@genz/ui";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { validateFileContent } from "@/lib/file-validation";
import { uploadAvatarAction } from "@/features/user/actions";

export function AvatarUploader({
  fullName,
  currentUrl,
  onUploaded,
}: {
  userId?: string;
  fullName: string | null;
  currentUrl: string | null;
  onUploaded?: (url: string) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
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

    // Fast client-side check
    const validation = await validateFileContent(selectedFile, ["image"]);
    if (!validation.valid) {
      setStatus("error");
      setError(validation.error || "Invalid file content.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    const result = await uploadAvatarAction(formData);

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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        {/* Avatar Circle with live preview */}
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-[#E5E5E0] bg-neutral-100 shadow-xs ring-2 ring-amber-500/20">
          <Image
            src={previewUrl || "/indian_craftsman.png"}
            alt={fullName || "Artisan avatar"}
            fill
            className="object-cover object-center"
            unoptimized
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-xs text-neutral-600 file:mr-3 file:h-9 file:cursor-pointer file:rounded-lg file:border file:border-[#1A1A18] file:bg-white file:px-3 file:font-medium"
          />

          {selectedFile && (
            <Button
              type="button"
              onClick={handleUpload}
              size="sm"
              disabled={status === "uploading"}
              className="hover:bg-neutral-850 h-9 rounded-lg bg-black px-4 text-xs font-semibold text-white shadow-sm"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {status === "uploading" ? "Uploading…" : "Save Photo"}
            </Button>
          )}
        </div>
      </div>

      {status === "success" && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Profile photo updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
