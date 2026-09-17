"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@genz/database";
import { createAdminClient } from "@genz/database/admin";
import { validateFileContentServer } from "@/lib/file-validation";
import { withRateLimit } from "@/lib/rate-limiter";
import { requireRole } from "@/features/auth/lib/require-role";

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

      // 3. Database Update: profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        console.error("[uploadAvatarAction] DB update error:", updateError);
        // Rollback storage upload on DB failure
        await supabase.storage.from("avatars").remove([path]);
        return { error: "Failed to update profile avatar URL." };
      }

      // Also sync to seller_profiles description metadata
      try {
        const { data: currentSellerProf } = await supabase
          .from("seller_profiles")
          .select("description")
          .eq("id", userId)
          .maybeSingle();

        if (currentSellerProf) {
          let meta: Record<string, unknown> = {};
          if (currentSellerProf.description) {
            try {
              if (currentSellerProf.description.startsWith("{")) {
                meta = JSON.parse(currentSellerProf.description);
              } else {
                meta = { short_bio: currentSellerProf.description };
              }
            } catch {
              meta = { short_bio: currentSellerProf.description };
            }
          }
          meta.avatar_url = publicUrl;
          await supabase
            .from("seller_profiles")
            .update({ description: JSON.stringify(meta) })
            .eq("id", userId);
        }
      } catch (syncErr) {
        console.warn("[uploadAvatarAction] Seller metadata sync notice:", syncErr);
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
      let supabase;
      try {
        supabase = createAdminClient();
      } catch (err: unknown) {
        console.error("[removeAvatarAction] Admin client init failed:", err);
        return { error: "Admin credentials not configured." };
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (updateError) {
        return { error: "Failed to reset avatar." };
      }

      try {
        const { data: currentSellerProf } = await supabase
          .from("seller_profiles")
          .select("description")
          .eq("id", userId)
          .maybeSingle();

        if (currentSellerProf) {
          let meta: Record<string, unknown> = {};
          if (currentSellerProf.description) {
            try {
              if (currentSellerProf.description.startsWith("{")) {
                meta = JSON.parse(currentSellerProf.description);
              } else {
                meta = { short_bio: currentSellerProf.description };
              }
            } catch {
              meta = { short_bio: currentSellerProf.description };
            }
          }
          delete meta.avatar_url;
          await supabase
            .from("seller_profiles")
            .update({ description: JSON.stringify(meta) })
            .eq("id", userId);
        }
      } catch (syncErr) {
        console.warn("[removeAvatarAction] Seller metadata sync notice:", syncErr);
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

      // 3. Database Update: store cover_url inside seller_profiles.description JSON metadata
      const { data: currentProfile } = await supabase
        .from("seller_profiles")
        .select("description")
        .eq("id", user.id)
        .maybeSingle();

      let meta: Record<string, unknown> = {};
      if (currentProfile?.description) {
        try {
          if (currentProfile.description.startsWith("{")) {
            meta = JSON.parse(currentProfile.description);
          } else {
            meta = { short_bio: currentProfile.description };
          }
        } catch {
          meta = { short_bio: currentProfile.description };
        }
      }

      meta.cover_url = publicUrl;

      const { error: updateError } = await supabase
        .from("seller_profiles")
        .update({ description: JSON.stringify(meta) })
        .eq("id", user.id);

      if (updateError) {
        console.error("[uploadCoverAction] DB update error:", updateError);
        return { error: "Failed to update profile cover URL." };
      }

      revalidatePath("/dashboard/profile");
      revalidatePath("/dashboard");
      revalidatePath(`/sellers/${user.id}`);
      return { success: true, url: publicUrl };
    }
  );
}
