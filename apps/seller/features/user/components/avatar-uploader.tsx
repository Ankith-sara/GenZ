"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@genz/ui";
import {
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { validateFileContent } from "@/lib/file-validation";
import { uploadAvatarAction, removeAvatarAction } from "@/features/user/actions";

interface AvatarUploaderProps {
  userId?: string;
  fullName: string | null;
  currentUrl: string | null;
  onUploaded?: (url: string) => void;
  size?: "md" | "lg";
}

export function AvatarUploader({
  fullName,
  currentUrl,
  onUploaded,
  size = "lg",
}: AvatarUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Derived preview: locally selected preview takes precedence, then currentUrl prop
  const previewUrl = selectedPreview ?? currentUrl;

  async function processUpload(file: File) {
    setError(null);
    setStatus("uploading");

    // Fast client-side check
    const validation = await validateFileContent(file, ["image"]);
    if (!validation.valid) {
      const errMsg =
        validation.error || "Please select a valid image file (under 5MB).";
      setStatus("error");
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setSelectedPreview(objectUrl);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await uploadAvatarAction(formData);

      if (result.error) {
        setStatus("error");
        setError(result.error);
        setSelectedPreview(null);
        toast.error(result.error);
        return;
      }

      setStatus("success");
      const uploadedUrl = result.url || objectUrl;
      setSelectedPreview(uploadedUrl);
      if (onUploaded) {
        onUploaded(uploadedUrl);
      }
      toast.success("Profile photo updated successfully!");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload avatar.";
      setStatus("error");
      setError(msg);
      setSelectedPreview(null);
      toast.error(msg);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processUpload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  }

  async function handleRemove() {
    if (!previewUrl) return;
    setStatus("uploading");
    setError(null);

    try {
      const result = await removeAvatarAction();
      if (result.error) {
        setStatus("error");
        setError(result.error);
        toast.error(result.error);
        return;
      }
      setSelectedPreview(null);
      if (onUploaded) {
        onUploaded("");
      }
      setStatus("idle");
      toast.success("Profile photo removed.");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove photo.";
      setStatus("error");
      setError(msg);
      toast.error(msg);
    }
  }

  const isLg = size === "lg";
  const dimensionClasses = isLg ? "h-24 w-24 sm:h-28 sm:w-28" : "h-20 w-20";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-5">
        {/* Interactive Avatar Container with Click & Drag-Drop */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload profile photo"
          className={`group relative ${dimensionClasses} focus:ring-primary shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-hidden ${
            isDragging
              ? "border-primary bg-primary/10 ring-primary/20 scale-105 ring-4"
              : "border-outline-variant/60 bg-surface-container-low hover:border-primary hover:shadow-md"
          }`}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={fullName || "Artisan profile"}
              fill
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            /* Meta-Style Default Profile DP Silhouette */
            <div className="relative flex h-full w-full items-center justify-center bg-[#E4E6EB]">
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full fill-[#8A8D91]"
                aria-hidden="true"
              >
                {/* Head circle */}
                <circle cx="50" cy="38" r="18" />
                {/* Torso / curved shoulders */}
                <path d="M 20 86 C 20 66, 32 58, 50 58 C 68 58, 80 66, 80 86 Z" />
              </svg>
            </div>
          )}

          {/* Hover Camera Overlay */}
          <div className="backdrop-blur-2xs absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white drop-shadow-sm" />
            <span className="mt-1 text-[10px] font-bold tracking-wider text-white uppercase">
              {previewUrl ? "Change" : "Upload"}
            </span>
          </div>

          {/* Uploading Overlay */}
          {status === "uploading" && (
            <div className="backdrop-blur-2xs absolute inset-0 flex flex-col items-center justify-center bg-black/65 text-white">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
              <span className="mt-1 text-[10px] font-bold">Uploading…</span>
            </div>
          )}

          {/* Camera Badge in bottom-right corner */}
          <div className="border-outline-variant/60 bg-surface text-on-surface absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-xl border shadow-xs transition-transform duration-200 group-hover:scale-110">
            <Camera className="text-primary h-3.5 w-3.5" />
          </div>
        </div>

        {/* Action Controls & Guidelines */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={status === "uploading"}
              className="border-outline-variant hover:border-primary hover:bg-primary/5 text-on-surface h-8.5 rounded-xl px-3.5 text-xs font-semibold transition-colors"
            >
              <Upload className="text-primary mr-1.5 h-3.5 w-3.5" />
              <span>{previewUrl ? "Change Photo" : "Upload Photo"}</span>
            </Button>

            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={status === "uploading"}
                className="text-on-surface-variant h-8.5 rounded-xl px-3 text-xs font-semibold transition-colors hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                <span>Remove</span>
              </Button>
            )}
          </div>

          <p className="text-on-surface-variant text-[11px] leading-relaxed">
            Click avatar or drag &amp; drop.{" "}
            <span className="text-on-surface font-semibold">JPG, PNG, or WebP</span> up
            to 5MB.
          </p>

          {status === "success" && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>Photo updated successfully</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
