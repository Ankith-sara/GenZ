"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { validateFileContent } from "@/lib/file-validation";

export function ReelUploader({
  productId,
  manufacturerId,
}: {
  productId: string;
  manufacturerId: string;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const video = videoRef.current?.files?.[0];
    const thumb = thumbRef.current?.files?.[0];

    setStatus("uploading");
    setError(null);

    if (!video) {
      setError("Please select a video file first.");
      return;
    }

    // Validate video file
    const videoValidation = await validateFileContent(video, ["video"]);
    if (!videoValidation.valid) {
      setStatus("error");
      setError(videoValidation.error || "Invalid video file content.");
      return;
    }

    // Validate optional thumbnail image
    if (thumb) {
      const thumbValidation = await validateFileContent(thumb, ["image"]);
      if (!thumbValidation.valid) {
        setStatus("error");
        setError(thumbValidation.error || "Invalid thumbnail image content.");
        return;
      }
    }

    const supabase = createClient();
    const stamp = Date.now();
    const safeVideoName = video.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const videoPath = `${manufacturerId}/products/${productId}/reels/${stamp}-${safeVideoName}`;

    const { error: videoError } = await supabase.storage
      .from("product-media")
      .upload(videoPath, video, { upsert: false });

    if (videoError) {
      setStatus("error");
      setError(videoError.message);
      return;
    }

    let thumbnailPath: string | null = null;
    if (thumb) {
      const safeThumbName = thumb.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      thumbnailPath = `${manufacturerId}/products/${productId}/reels/${stamp}-thumb-${safeThumbName}`;
      const { error: thumbError } = await supabase.storage
        .from("product-media")
        .upload(thumbnailPath, thumb, { upsert: false });
      if (thumbError) {
        setStatus("error");
        setError(thumbError.message);
        return;
      }
    }

    const { error: insertError } = await supabase.from("reels").insert({
      product_id: productId,
      manufacturer_id: manufacturerId,
      video_path: videoPath,
      thumbnail_path: thumbnailPath,
      caption: captionRef.current?.value.trim() || null,
    });

    if (insertError) {
      setStatus("error");
      setError(insertError.message);
      return;
    }

    setStatus("idle");
    if (videoRef.current) videoRef.current.value = "";
    if (thumbRef.current) thumbRef.current.value = "";
    if (captionRef.current) captionRef.current.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={handleUpload}
      className="border-border bg-card rounded-[4px] border p-6"
    >
      <div className="mb-4">
        <Label htmlFor="video">Video</Label>
        <input
          ref={videoRef}
          id="video"
          type="file"
          accept="video/*"
          className="file:border-foreground block w-full text-sm file:mr-4 file:h-11 file:rounded-[4px] file:border file:bg-transparent file:px-4 file:text-sm"
        />
        <p className="text-muted-foreground mt-1.5 text-xs">Up to 50MB.</p>
      </div>

      <div className="mb-4">
        <Label htmlFor="thumbnail">
          Thumbnail <span className="text-muted-foreground">(optional)</span>
        </Label>
        <input
          ref={thumbRef}
          id="thumbnail"
          type="file"
          accept="image/*"
          className="file:border-foreground block w-full text-sm file:mr-4 file:h-11 file:rounded-[4px] file:border file:bg-transparent file:px-4 file:text-sm"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="caption">
          Caption <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          ref={captionRef}
          id="caption"
          name="caption"
          placeholder="Behind the scenes on the factory floor"
        />
      </div>

      {error && (
        <p role="alert" className="text-destructive mb-4 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={status === "uploading"}>
        <Upload className="h-4 w-4" aria-hidden="true" />
        {status === "uploading" ? "Uploading…" : "Upload reel"}
      </Button>
    </form>
  );
}
