"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@genz/ui";
import { Label } from "@genz/ui";
import { Input } from "@genz/ui";
import { validateFileContent } from "@/lib/file-validation";
import { uploadReelAction } from "@/features/reels/actions";

export function ReelUploader({
  productId,
  onUploaded,
}: {
  productId: string;
  sellerId?: string;
  onUploaded?: () => void;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  // Live client-side previews
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoFileInfo, setVideoFileInfo] = useState<{
    name: string;
    sizeMb: string;
  } | null>(null);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null);

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setVideoPreviewUrl(null);
      setVideoFileInfo(null);
      return;
    }

    setError(null);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setVideoFileInfo({ name: file.name, sizeMb: `${sizeMb} MB` });
    setVideoPreviewUrl(URL.createObjectURL(file));
  }

  function handleThumbSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setThumbPreviewUrl(null);
      return;
    }

    setError(null);
    setThumbPreviewUrl(URL.createObjectURL(file));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const video = videoRef.current?.files?.[0];
    const thumb = thumbRef.current?.files?.[0];

    setStatus("uploading");
    setError(null);

    if (!video) {
      setError("Please select a video file first.");
      setStatus("error");
      return;
    }

    // Validate video file on client side first
    const videoValidation = await validateFileContent(video, ["video"]);
    if (!videoValidation.valid) {
      setStatus("error");
      setError(videoValidation.error || "Invalid video file content.");
      return;
    }

    // Validate optional thumbnail image on client side first
    if (thumb) {
      const thumbValidation = await validateFileContent(thumb, ["image"]);
      if (!thumbValidation.valid) {
        setStatus("error");
        setError(thumbValidation.error || "Invalid thumbnail image content.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("video", video);
    if (thumb) formData.append("thumbnail", thumb);
    if (captionRef.current?.value) {
      formData.append("caption", captionRef.current.value);
    }

    const result = await uploadReelAction(productId, formData);

    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setStatus("success");
    if (videoRef.current) videoRef.current.value = "";
    if (thumbRef.current) thumbRef.current.value = "";
    if (captionRef.current) captionRef.current.value = "";
    setVideoPreviewUrl(null);
    setVideoFileInfo(null);
    setThumbPreviewUrl(null);
    if (onUploaded) onUploaded();
    router.refresh();
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {/* 1. Video File Input with Live Player Preview */}
      <div>
        <Label
          htmlFor="video"
          className="flex items-center justify-between text-xs font-semibold text-neutral-800"
        >
          <span>1. Workshop Video File *</span>
          <span className="font-mono text-[10px] text-neutral-500">
            MP4, WebM, MOV (Up to 50MB)
          </span>
        </Label>

        <div className="mt-1.5">
          <input
            ref={videoRef}
            id="video"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/*"
            onChange={handleVideoSelect}
            className="block w-full text-xs text-neutral-600 file:mr-3 file:h-9 file:cursor-pointer file:rounded-lg file:border file:border-[#1A1A18] file:bg-white file:px-3 file:font-medium"
          />
        </div>

        {/* Video Preview Box */}
        {videoPreviewUrl && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-black p-1 shadow-xs">
            <div className="relative mx-auto flex aspect-[9/16] max-h-56 items-center justify-center overflow-hidden rounded-xl bg-neutral-900">
              <video
                src={videoPreviewUrl}
                controls
                playsInline
                className="h-full w-full object-contain"
              />
            </div>
            {videoFileInfo && (
              <div className="flex items-center justify-between p-2 px-3 text-center font-mono text-[11px] text-white">
                <span className="max-w-[200px] truncate">{videoFileInfo.name}</span>
                <span className="font-bold text-amber-400">{videoFileInfo.sizeMb}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Optional Thumbnail Image */}
      <div>
        <Label
          htmlFor="thumbnail"
          className="flex items-center justify-between text-xs font-semibold text-neutral-800"
        >
          <span>
            2. Poster Thumbnail{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </span>
          <span className="font-mono text-[10px] text-neutral-500">JPG, PNG, WebP</span>
        </Label>

        <div className="mt-1.5 flex items-center gap-3">
          <input
            ref={thumbRef}
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbSelect}
            className="block w-full text-xs text-neutral-600 file:mr-3 file:h-9 file:cursor-pointer file:rounded-lg file:border file:border-[#1A1A18] file:bg-white file:px-3 file:font-medium"
          />

          {thumbPreviewUrl && (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#E5E5E0]">
              <Image
                src={thumbPreviewUrl}
                alt="Thumbnail preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Caption Input */}
      <div>
        <Label htmlFor="caption" className="text-xs font-semibold text-neutral-800">
          3. Caption / Process Story{" "}
          <span className="font-normal text-neutral-400">(optional)</span>
        </Label>
        <Input
          ref={captionRef}
          id="caption"
          name="caption"
          placeholder="e.g. Turning Ankudi Karra wood on the hand-lathe & applying natural lacquer"
          className="mt-1.5 h-10 rounded-lg text-xs"
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Workshop reel uploaded and published to your storefront!</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={status === "uploading"}
        className="hover:bg-neutral-850 h-11 w-full rounded-xl bg-black text-xs font-semibold text-white shadow-md"
      >
        <Upload className="mr-2 h-4 w-4" />
        <span>
          {status === "uploading"
            ? "Uploading Video Reel (Please wait)…"
            : "Upload Video Reel"}
        </span>
      </Button>
    </form>
  );
}
