"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import type { InquiryStatus } from "@/types/database";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus) {
  const session = await requireRole("manufacturer");

  // Rate limit check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "update_inquiry_status",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();

  await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId)
    .eq("manufacturer_id", session.userId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "update_inquiry_status",
    identifier: session.userId,
  });

  revalidatePath("/dashboard/manufacturer/inquiries");
}
