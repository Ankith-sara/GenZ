"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@genz/database/authorization";
import { getAuthenticatedSellerApiClient } from "@/lib/api-server-client";

export interface ProfileUpdateState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function updateSellerProfileStudio(
  _prevState: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const session = await requireRole("seller");
  const userId = session.userId;

  const business_name = String(formData.get("business_name") ?? "").trim();
  const maker_name = String(formData.get("maker_name") ?? "").trim();
  const handle = String(formData.get("handle") ?? "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
  const craft_category = String(formData.get("craft_category") ?? "").trim();
  const craft_title = String(formData.get("craft_title") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const factory_address = String(formData.get("factory_address") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const establishedYearRaw = String(formData.get("established_year") ?? "").trim();
  const established_year = establishedYearRaw ? Number(establishedYearRaw) : null;
  const gst_number = String(formData.get("gst_number") ?? "")
    .trim()
    .toUpperCase();
  const cover_url = String(formData.get("cover_url") ?? "").trim();
  const avatar_url = String(formData.get("avatar_url") ?? "").trim();

  // Social & Contact Channels
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "")
    .trim()
    .replace(/^@/, "");
  const website = String(formData.get("website") ?? "").trim();

  // Story & Journey narrative fields
  const short_bio = String(formData.get("short_bio") ?? "").trim();
  const how_it_started = String(formData.get("how_it_started") ?? "").trim();
  const materials_and_technique = String(
    formData.get("materials_and_technique") ?? ""
  ).trim();
  const vision = String(formData.get("vision") ?? "").trim();

  if (!business_name) {
    return { error: "Business name or Artisan Studio name is required." };
  }

  try {
    const adminSupabase = createAdminClient();

    // Fetch existing profile metadata to preserve cover_url, avatar_url, or other fields
    const { data: existingProf } = await adminSupabase
      .from("seller_profiles")
      .select("description")
      .eq("id", userId)
      .maybeSingle();

    let existingMeta: Record<string, unknown> = {};
    if (existingProf?.description) {
      try {
        if (existingProf.description.startsWith("{")) {
          existingMeta = JSON.parse(existingProf.description);
        }
      } catch {}
    }

    const effectiveCoverUrl =
      cover_url ||
      (typeof existingMeta.cover_url === "string" ? existingMeta.cover_url : null);
    const effectiveAvatarUrl =
      avatar_url ||
      (typeof existingMeta.avatar_url === "string" ? existingMeta.avatar_url : null);

    // Construct structured metadata JSON to store inside description column
    const profileMetadata = {
      short_bio:
        short_bio || `Authentic Indian craft studio based in ${city || "India"}.`,
      maker_name: maker_name || business_name,
      handle: handle || business_name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      craft_category: craft_category || "Wooden Toys & Crafts",
      craft_title: craft_title || "Master Artisan & Manufacturer",
      cover_url: effectiveCoverUrl,
      avatar_url: effectiveAvatarUrl,
      how_it_started,
      materials_and_technique,
      vision,
      whatsapp,
      instagram,
      website,
      updated_at: new Date().toISOString(),
    };

    const description = JSON.stringify(profileMetadata);

    try {
      const client = await getAuthenticatedSellerApiClient();
      await client.sellers.updateProfile({
        business_name,
        gst_number: gst_number || "PENDING",
        factory_address: factory_address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        established_year: established_year || null,
        description,
      });
      await client.sellers.updateStudio({
        maker_name: maker_name || business_name,
        craft_title: craft_title || "Master Artisan & Manufacturer",
        bio: short_bio || `Authentic Indian craft studio based in ${city || "India"}.`,
        how_it_started,
        materials_and_technique,
        vision,
      });
    } catch (err: unknown) {
      console.error("[updateSellerProfileStudio] API error:", err);
      return {
        error:
          err instanceof Error
            ? err.message
            : "Failed to update seller profile studio via backend API.",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard/settings");
    revalidatePath(`/sellers/${userId}`);

    return {
      success: true,
      message: "Your artisan maker profile has been successfully updated!",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[updateSellerProfileStudio] Exception:", err);
    return { error: msg };
  }
}

export const updateSellerInstagramProfile = updateSellerProfileStudio;
