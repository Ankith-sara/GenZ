"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@genz/database";
import { createAdminClient } from "@genz/database/admin";
import { validateFileContentServer } from "@genz/validation";
import { withRateLimit } from "@genz/utils/rate-limiter";
import { requireRole } from "@genz/database/authorization";
import { getAuthenticatedSellerApiClient } from "@/lib/api-server-client";

export interface UploadActionResult {
  success?: boolean;
  error?: string;
  url?: string;
}

export async function uploadAvatarAction(
  formData: FormData
): Promise<UploadActionResult> {
  const session = await requireRole("seller");
  const userId = session.userId;

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "No avatar file provided." };
  }

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "upload_avatar",
      identifier: userId,
    },
    async () => {
      // 1. Server-side Magic Byte & Size Validation
      const validation = await validateFileContentServer(file, ["image"]);
      if (!validation.valid) {
        return { error: validation.error || "Invalid image file." };
      }

      let supabase;
      try {
        supabase = createAdminClient();
      } catch (err: unknown) {
        console.error(
          "[CONFIG_ERROR] [uploadAvatarAction] Admin client init failed:",
          err
        );
        return {
          error:
            "Server misconfiguration: admin credentials are not set up. Contact an engineer.",
        };
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${userId}/avatar-${Date.now()}-${safeName}`;

      // 2. Storage Upload
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error("[uploadAvatarAction] Storage upload error:", uploadError);
        return { error: uploadError.message || "Failed to upload avatar." };
      }

      const publicUrl = supabase.storage.from("avatars").getPublicUrl(path)
        .data.publicUrl;

      // 3. Database Update: profiles via API
      try {
        const client = await getAuthenticatedSellerApiClient();
        await client.sellers.updateAvatar(publicUrl);
      } catch (err: unknown) {
        console.error("[uploadAvatarAction] API error:", err);
        await supabase.storage.from("avatars").remove([path]);
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to update profile avatar URL via backend API.",
        };
      }

      revalidatePath("/dashboard/account");
      revalidatePath("/dashboard/profile");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/settings");
      revalidatePath(`/sellers/${userId}`);
      return { success: true, url: publicUrl };
    }
  );
}

export async function removeAvatarAction(): Promise<UploadActionResult> {
  const session = await requireRole("seller");
  const userId = session.userId;

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "remove_avatar",
      identifier: userId,
    },
    async () => {
      try {
        const client = await getAuthenticatedSellerApiClient();
        await client.sellers.removeAvatar();
      } catch (err: unknown) {
        console.error("[removeAvatarAction] API error:", err);
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to reset avatar via backend API.",
        };
      }

      revalidatePath("/dashboard/account");
      revalidatePath("/dashboard/profile");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/settings");
      revalidatePath(`/sellers/${userId}`);
      return { success: true, url: undefined };
    }
  );
}

export async function uploadCoverAction(
  formData: FormData
): Promise<UploadActionResult> {
  const file = formData.get("cover") as File | null;
  if (!file || file.size === 0) {
    return { error: "No cover image file provided." };
  }

  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Authentication required to update cover." };
  }

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "upload_cover",
      identifier: user.id,
    },
    async () => {
      // 1. Server-side Magic Byte & Size Validation
      const validation = await validateFileContentServer(file, ["image"]);
      if (!validation.valid) {
        return { error: validation.error || "Invalid image file." };
      }

      let supabase;
      try {
        supabase = createAdminClient();
      } catch (err: unknown) {
        console.error(
          "[CONFIG_ERROR] [uploadCoverAction] Admin client init failed:",
          err
        );
        return {
          error:
            "Server misconfiguration: admin credentials are not set up. Contact an engineer.",
        };
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${user.id}/cover-${Date.now()}-${safeName}`;

      // 2. Storage Upload
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error("[uploadCoverAction] Storage upload error:", uploadError);
        return { error: uploadError.message || "Failed to upload cover photo." };
      }

      const publicUrl = supabase.storage.from("avatars").getPublicUrl(path)
        .data.publicUrl;

      // 3. Database Update: store cover_url inside seller_profiles via API
      try {
        const client = await getAuthenticatedSellerApiClient();
        await client.sellers.updateCover(publicUrl);
      } catch (err: unknown) {
        console.error("[uploadCoverAction] API error:", err);
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to update profile cover URL via backend API.",
        };
      }

      revalidatePath("/dashboard/profile");
      revalidatePath("/dashboard");
      revalidatePath(`/sellers/${user.id}`);
      return { success: true, url: publicUrl };
    }
  );
}
