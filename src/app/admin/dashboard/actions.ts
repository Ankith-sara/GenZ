"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";

export async function deleteWaitlistEntry(id: string) {
  const session = await requireRole("admin");

  // Rate limit check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "delete_waitlist_entry",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();
  await supabase.from("waitlist").delete().eq("id", id);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "delete_waitlist_entry",
    identifier: session.userId,
  });

  revalidatePath("/admin/dashboard");
}

export async function deleteContactMessage(id: string) {
  const session = await requireRole("admin");

  // Rate limit check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "delete_contact_message",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();
  await supabase.from("contact_messages").delete().eq("id", id);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "delete_contact_message",
    identifier: session.userId,
  });

  revalidatePath("/admin/dashboard");
}

export async function deleteProduct(id: string) {
  const session = await requireRole("admin");

  // Rate limit check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "admin_delete_product",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "admin_delete_product",
    identifier: session.userId,
  });

  revalidatePath("/admin/dashboard");
}

export async function toggleProductPublish(id: string, currentStatus: string) {
  const session = await requireRole("admin");

  // Rate limit check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "toggle_product_publish",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();
  const nextStatus = currentStatus === "published" ? "draft" : "published";
  await supabase.from("products").update({ status: nextStatus }).eq("id", id);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "toggle_product_publish",
    identifier: session.userId,
  });

  revalidatePath("/admin/dashboard");
}
