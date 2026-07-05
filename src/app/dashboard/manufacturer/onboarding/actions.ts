"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

const GST_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export async function saveManufacturerProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await requireRole("manufacturer");

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

  if (!business_name) return { error: "Business name is required." };
  if (!GST_PATTERN.test(gst_number)) {
    return { error: "That doesn't look like a valid 15-character GSTIN." };
  }

  const established_year = establishedYearRaw ? Number(establishedYearRaw) : null;
  if (established_year !== null && Number.isNaN(established_year)) {
    return { error: "Established year must be a number." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("manufacturer_profiles").upsert({
    id: session.userId,
    business_name,
    gst_number,
    factory_address: factory_address || null,
    city: city || null,
    state: state || null,
    pincode: pincode || null,
    description: description || null,
    established_year,
  });

  if (error) {
    console.error(error);
    return { error: "Could not save your profile. Please try again." };
  }

  revalidatePath("/dashboard/manufacturer");
  revalidatePath("/dashboard/manufacturer/onboarding");
  return { success: true };
}

export async function submitForVerification() {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  const { error } = await supabase
    .from("manufacturer_profiles")
    .update({ status: "pending" })
    .eq("id", session.userId);

  if (error) {
    console.error(error);
    return;
  }

  revalidatePath("/dashboard/manufacturer");
  redirect("/dashboard/manufacturer");
}
