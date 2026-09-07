"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { sellerProfileSchema } from "@/lib/validation";

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function saveSellerProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await requireRole("seller");

  // 1. Rate Limit Check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "save_seller_profile",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  const business_name = String(formData.get("business_name") ?? "").trim();
  const rawGst = String(formData.get("gst_number") ?? "")
    .trim()
    .toUpperCase();
  // If GST is empty or marked as Pending/PENDING, default to "PENDING"
  const gst_number = !rawGst || rawGst === "PENDING" ? "PENDING" : rawGst;

  const factory_address = String(formData.get("factory_address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const establishedYearRaw = String(formData.get("established_year") ?? "").trim();
  const established_year =
    establishedYearRaw && !isNaN(Number(establishedYearRaw))
      ? Number(establishedYearRaw)
      : undefined;

  // 2. Schema Validation
  const validation = sellerProfileSchema.safeParse({
    business_name,
    gst_number,
    factory_address,
    city,
    state,
    pincode,
    description,
    established_year,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    const adminSupabase = createAdminClient();

    // 3. Upsert seller profile bypassing RLS restriction issues
    const { error: dbError } = await adminSupabase.from("seller_profiles").upsert(
      {
        id: session.userId,
        business_name: validation.data.business_name,
        gst_number: validation.data.gst_number || "PENDING",
        factory_address: validation.data.factory_address || null,
        city: validation.data.city || null,
        state: validation.data.state || null,
        pincode: validation.data.pincode || null,
        description: validation.data.description || null,
        established_year: validation.data.established_year ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    await logRateLimitAttempt({
      endpointType: "user",
      actionName: "save_seller_profile",
      identifier: session.userId,
    });

    if (dbError) {
      console.error("[saveSellerProfile] Database upsert error:", dbError);
      return { error: dbError.message || "Could not save your profile. Please try again." };
    }

    // 4. Keep profiles table full_name in sync with business_name
    if (validation.data.business_name) {
      await adminSupabase
        .from("profiles")
        .update({
          full_name: validation.data.business_name,
        })
        .eq("id", session.userId);
    }

    // 5. Revalidate correct seller dashboard paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/onboarding");

    return { success: true };
  } catch (err) {
    console.error("[saveSellerProfile] Unexpected exception:", err);
    return {
      error: err instanceof Error ? err.message : "An unexpected error occurred while saving profile.",
    };
  }
}

export async function submitForVerification() {
  const session = await requireRole("seller");

  // Rate Limit Check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "submit_for_verification",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("seller_profiles")
    .update({
      status: "pending",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.userId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "submit_for_verification",
    identifier: session.userId,
  });

  if (error) {
    console.error("Submit for verification DB error:", error);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account");
  redirect("/dashboard/account");
}
