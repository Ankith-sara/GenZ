"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { manufacturerProfileSchema } from "@/lib/validation";

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function saveManufacturerProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await requireRole("manufacturer");

  // 1. Rate Limit Check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "save_manufacturer_profile",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  const business_name = String(formData.get("business_name") ?? "").trim();
  const gst_number = String(formData.get("gst_number") ?? "")
    .trim()
    .toUpperCase();
  const factory_address = String(formData.get("factory_address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const establishedYearRaw = String(formData.get("established_year") ?? "").trim();
  const established_year = establishedYearRaw ? Number(establishedYearRaw) : undefined;

  // 2. Schema Validation
  const validation = manufacturerProfileSchema.safeParse({
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

  const supabase = await createClient();
  const { error } = await supabase.from("manufacturer_profiles").upsert({
    id: session.userId,
    business_name: validation.data.business_name,
    gst_number: validation.data.gst_number,
    factory_address: validation.data.factory_address || null,
    city: validation.data.city || null,
    state: validation.data.state || null,
    pincode: validation.data.pincode || null,
    description: validation.data.description || null,
    established_year: validation.data.established_year ?? null,
  });

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "save_manufacturer_profile",
    identifier: session.userId,
  });

  if (error) {
    console.error("Save manufacturer profile DB error:", error);
    return { error: "Could not save your profile. Please try again." };
  }

  revalidatePath("/dashboard/manufacturer");
  revalidatePath("/dashboard/manufacturer/onboarding");
  return { success: true };
}

export async function submitForVerification() {
  const session = await requireRole("manufacturer");

  // Rate Limit Check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "submit_for_verification",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("manufacturer_profiles")
    .update({ status: "pending" })
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

  revalidatePath("/dashboard/manufacturer");
  redirect("/dashboard/manufacturer");
}
