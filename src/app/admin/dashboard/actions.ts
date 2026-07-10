"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";

export async function deleteWaitlistEntry(id: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("waitlist").delete().eq("id", id);
  revalidatePath("/admin/dashboard");
}

export async function deleteContactMessage(id: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("contact_messages").delete().eq("id", id);
  revalidatePath("/admin/dashboard");
}

export async function deleteProduct(id: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/dashboard");
}

export async function toggleProductPublish(id: string, currentStatus: string) {
  await requireRole("admin");
  const supabase = await createClient();
  const nextStatus = currentStatus === "published" ? "draft" : "published";
  await supabase.from("products").update({ status: nextStatus }).eq("id", id);
  revalidatePath("/admin/dashboard");
}
