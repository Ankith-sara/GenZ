"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";

export interface ReviewState {
  error?: string;
}

export async function approveManufacturer(manufacturerId: string) {
  const session = await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("manufacturer_profiles")
    .update({
      status: "verified",
      rejection_reason: null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", manufacturerId);

  if (error) {
    console.error(error);
    return;
  }

  revalidatePath("/admin/dashboard/verifications");
  redirect(`/admin/dashboard/verifications/${manufacturerId}`);
}

export async function rejectManufacturer(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await requireRole("admin");
  const manufacturerId = String(formData.get("manufacturerId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!reason) {
    return { error: "Please explain what needs to change." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("manufacturer_profiles")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", manufacturerId);

  if (error) {
    console.error(error);
    return { error: "Could not save the review. Please try again." };
  }

  revalidatePath("/admin/dashboard/verifications");
  redirect(`/admin/dashboard/verifications/${manufacturerId}`);
}
