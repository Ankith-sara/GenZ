"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: { fullName: string; phone: string; city: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("profiles").update({
    full_name: formData.fullName,
    phone: formData.phone,
    city: formData.city
  }).eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { success: true };
}

interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export async function saveAddresses(addresses: Address[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.auth.updateUser({
    data: { addresses }
  });

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { success: true };
}
