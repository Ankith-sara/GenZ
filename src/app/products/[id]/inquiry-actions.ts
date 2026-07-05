"use server";

import { createClient } from "@/lib/supabase/server";

export interface InquiryFormState {
  error?: string;
  success?: boolean;
}

export async function submitInquiry(
  productId: string,
  manufacturerId: string,
  _prevState: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { error: "Your name is required." };
  if (!email || !email.includes("@")) return { error: "A valid email is required." };
  if (!message) return { error: "Please add a short message." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("inquiries").insert({
    product_id: productId,
    manufacturer_id: manufacturerId,
    buyer_id: user?.id ?? null,
    name,
    email,
    phone: phone || null,
    message,
  });

  if (error) {
    console.error(error);
    return { error: "Could not send your inquiry. Please try again." };
  }

  return { success: true };
}
