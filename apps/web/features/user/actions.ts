"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@genz/database";
import { createAdminClient } from "@genz/database/admin";
import { validateFileContentServer } from "@genz/validation";
import { withRateLimit } from "@genz/utils/rate-limiter";
import { getAuthenticatedApiClient } from "@/lib/api-server-client";

export interface UploadActionResult {
  success?: boolean;
  error?: string;
  url?: string;
}

export async function uploadAvatarAction(
  formData: FormData
): Promise<UploadActionResult> {
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "No avatar file provided." };
  }

  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Authentication required to update avatar." };
  }

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "upload_avatar",
      identifier: user.id,
    },
    async () => {
      // 1. Server-side Magic Byte & Size Validation
      const validation = await validateFileContentServer(file, ["image"]);
      if (!validation.valid) {
        return { error: validation.error || "Invalid image file." };
      }

      // 2. Try centralized Fastify API first
      try {
        const client = await getAuthenticatedApiClient();
        const apiRes = await client.customers.uploadAvatar(formData);
        revalidatePath("/profile");
        revalidatePath("/seller/dashboard");
        return { success: true, url: apiRes.avatarUrl };
      } catch (apiErr: unknown) {
        console.warn("[UploadAvatarAction] Fastify API notice, using local storage fallback:", apiErr);
      }

      // 3. Resilient storage fallback
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
      const path = `${user.id}/avatar-${Date.now()}-${safeName}`;

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

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("[uploadAvatarAction] DB update error:", updateError);
        await supabase.storage.from("avatars").remove([path]);
        return { error: "Failed to update profile avatar URL." };
      }

      revalidatePath("/profile");
      revalidatePath("/seller/dashboard");
      return { success: true, url: publicUrl };
    }
  );
}
