"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { adminRejectSchema } from "@/lib/validation";

export interface ReviewState {
  error?: string;
}

export async function approveManufacturer(manufacturerId: string) {
  const session = await requireRole("admin");

  // Rate limit check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "approve_manufacturer",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

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

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "approve_manufacturer",
    identifier: session.userId,
  });

  if (error) {
    console.error("Approve manufacturer DB error:", error);
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

  // 1. Rate limit check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "reject_manufacturer",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  const manufacturerId = String(formData.get("manufacturerId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  // 2. Schema validation
  const validation = adminRejectSchema.safeParse({ reason });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("manufacturer_profiles")
    .update({
      status: "rejected",
      rejection_reason: validation.data.reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", manufacturerId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "reject_manufacturer",
    identifier: session.userId,
  });

  if (error) {
    console.error("Reject manufacturer DB error:", error);
    return { error: "Could not save the review. Please try again." };
  }

  revalidatePath("/admin/dashboard/verifications");
  redirect(`/admin/dashboard/verifications/${manufacturerId}`);
}
