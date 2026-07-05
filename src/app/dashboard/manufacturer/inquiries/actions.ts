"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import type { InquiryStatus } from "@/types/database";

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus) {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId)
    .eq("manufacturer_id", session.userId);

  revalidatePath("/dashboard/manufacturer/inquiries");
}
