"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { inquirySchema } from "@/lib/validation";

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Rate Limiting Check (per-user if logged in, otherwise per-IP public limit)
  const isAuth = !!user;
  const rateLimit = await checkRateLimit({
    endpointType: isAuth ? "user" : "public",
    actionName: "submit_inquiry",
    identifier: user?.id,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema Validation
  const validation = inquirySchema.safeParse({ name, email, phone, message });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // 3. Database Operation
  const { error } = await supabase.from("inquiries").insert({
    product_id: productId,
    manufacturer_id: manufacturerId,
    buyer_id: user?.id ?? null,
    name: validation.data.name,
    email: validation.data.email,
    phone: validation.data.phone || null,
    message: validation.data.message,
  });

  // Log rate limit attempt
  await logRateLimitAttempt({
    endpointType: isAuth ? "user" : "public",
    actionName: "submit_inquiry",
    identifier: user?.id,
  });

  if (error) {
    console.error("Submit inquiry DB error:", error);
    return { error: "Could not send your inquiry. Please try again." };
  }

  return { success: true };
}
