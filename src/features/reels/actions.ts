"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateFileContentServer } from "@/lib/file-validation";
import { requireRole } from "@/features/auth/lib/require-role";
import { withRateLimit } from "@/lib/rate-limiter";

export interface ReelUploadResult {
  success?: boolean;
  error?: string;
  reelId?: string;
}

export async function uploadReelAction(
  productId: string,
  formData: FormData
): Promise<ReelUploadResult> {
  const session = await requireRole("seller");
  const video = formData.get("video") as File | null;
  const thumb = formData.get("thumbnail") as File | null;
  const caption = (formData.get("caption") as string | null)?.trim() || null;

  if (!video || video.size === 0) {
    return { error: "Please select a video file." };
  }

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "upload_reel",
      identifier: session.userId,
    },
    async () => {
      // 1. Validate video magic bytes server-side
      const videoValidation = await validateFileContentServer(video, ["video"]);
      if (!videoValidation.valid) {
        return { error: videoValidation.error || "Invalid video file." };
      }

      // 2. Validate optional thumbnail magic bytes server-side
      if (thumb && thumb.size > 0) {
        const thumbValidation = await validateFileContentServer(thumb, ["image"]);
        if (!thumbValidation.valid) {
          return { error: thumbValidation.error || "Invalid thumbnail image file." };
        }
      }

      let supabase;
      try {
        supabase = createAdminClient();
      } catch (err: unknown) {
        console.error(
          "[CONFIG_ERROR] [uploadReelAction] Admin client init failed:",
          err
        );
        return {
          error:
            "Server misconfiguration: admin credentials are not set up. Contact an engineer.",
        };
      }

      // Verify product ownership or admin
      const { data: product } = await supabase
        .from("products")
        .select("seller_id")
        .eq("id", productId)
        .single();

      if (
        !product ||
        (product.seller_id !== session.userId && session.profile?.role !== "admin")
      ) {
        return { error: "Permission denied: Product not found or unauthorized." };
      }

      const stamp = Date.now();
      const safeVideoName = video.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const videoPath = `${product.seller_id}/products/${productId}/reels/${stamp}-${safeVideoName}`;

      const videoBuffer = Buffer.from(await video.arrayBuffer());
      const { error: videoUploadError } = await supabase.storage
        .from("product-media")
        .upload(videoPath, videoBuffer, { contentType: video.type, upsert: false });

      if (videoUploadError) {
        return { error: videoUploadError.message || "Failed to upload video reel." };
      }

      let thumbnailPath: string | null = null;
      if (thumb && thumb.size > 0) {
        const safeThumbName = thumb.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        thumbnailPath = `${product.seller_id}/products/${productId}/reels/${stamp}-thumb-${safeThumbName}`;

        const thumbBuffer = Buffer.from(await thumb.arrayBuffer());
        const { error: thumbError } = await supabase.storage
          .from("product-media")
          .upload(thumbnailPath, thumbBuffer, {
            contentType: thumb.type,
            upsert: false,
          });

        if (thumbError) {
          await supabase.storage.from("product-media").remove([videoPath]);
          return { error: thumbError.message || "Failed to upload thumbnail." };
        }
      }

      // 3. Record in database
      const { data: reel, error: insertError } = await supabase
        .from("reels")
        .insert({
          product_id: productId,
          seller_id: product.seller_id,
          video_path: videoPath,
          thumbnail_path: thumbnailPath,
          caption,
        })
        .select("id")
        .single();

      if (insertError) {
        // Rollback uploaded files
        const pathsToRemove = [videoPath];
        if (thumbnailPath) pathsToRemove.push(thumbnailPath);
        await supabase.storage.from("product-media").remove(pathsToRemove);
        return { error: "Failed to record reel in database." };
      }

      revalidatePath(`/seller/dashboard/products/${productId}`);
      return { success: true, reelId: reel.id };
    }
  );
}
