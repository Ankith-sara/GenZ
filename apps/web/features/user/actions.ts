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

      // 2. Centralized Fastify API
      try {
        const client = await getAuthenticatedApiClient();
        const apiRes = await client.customers.uploadAvatar(formData);
        revalidatePath("/profile");
        revalidatePath("/seller/dashboard");
        return { success: true, url: apiRes.avatarUrl };
      } catch (apiErr: unknown) {
        console.error("[UploadAvatarAction] Fastify API error:", apiErr);
        return {
          error:
            apiErr instanceof Error
              ? apiErr.message
              : "Failed to upload avatar via backend API.",
        };
      }
    }
  );
}
