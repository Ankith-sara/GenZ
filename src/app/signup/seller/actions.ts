"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { sellerSignupSchema } from "@/lib/validation";

export interface SellerSignupState {
  error?: string;
  success?: boolean;
}

export async function signupSeller(
  _prevState: SellerSignupState,
  formData: FormData
): Promise<SellerSignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(
    formData.get("owner_name") ||
      formData.get("founder_name") ||
      formData.get("artisan_name") ||
      formData.get("fullName") ||
      formData.get("full_name") ||
      formData.get("business_name") ||
      ""
  ).trim();
  const businessType = String(formData.get("business_type") ?? "seller");

  // 1. Rate Limiting Check
  const rateLimit = await checkRateLimit({
    endpointType: "auth",
    actionName: "signup_seller",
    identifier: email,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema Validation
  const validation = sellerSignupSchema.safeParse({
    email,
    password,
    fullName,
    businessType,
  });
  if (!validation.success) {
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "signup_seller",
      identifier: email,
      isFailed: true,
    });
    return { error: validation.error.issues[0].message };
  }

  const countryCode = String(formData.get("country_code") ?? "+91");
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const phone = rawPhone ? `${countryCode} ${rawPhone}` : null;

  // Collect ALL form fields into a JSON object for admin review
  const formDataObj: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key === "password") return; // Never store password
    formDataObj[key] = String(value);
  });

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    // Check if application with same email already exists
    const { data: existing } = await supabase
      .from("seller_applications")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (existing.status === "approved") {
        return {
          error:
            "This email has already been approved. Please check your email for login credentials.",
        };
      }
      if (existing.status === "pending") {
        return {
          error:
            "An application with this email is already under review. Please wait for admin approval.",
        };
      }
      // If rejected, allow re-submission by updating the existing row
      await supabase
        .from("seller_applications")
        .update({
          full_name: fullName,
          phone,
          business_name: String(formData.get("business_name") ?? "Unnamed Business"),
          business_type: businessType,
          form_data: formDataObj,
          status: "pending" as const,
          rejection_reason: null,
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq("id", existing.id);

      await logRateLimitAttempt({
        endpointType: "auth",
        actionName: "signup_seller",
        identifier: email,
        isFailed: false,
      });

      return { success: true };
    }

    // Insert new application
    const { error: insertError } = await supabase.from("seller_applications").insert({
      email,
      full_name: fullName,
      phone,
      business_name: String(formData.get("business_name") ?? "Unnamed Business"),
      business_type: businessType,
      form_data: formDataObj,
      status: "pending",
    });

    if (insertError) {
      console.error("Seller application insert error:", insertError);
      return { error: "Failed to submit application. Please try again." };
    }

    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "signup_seller",
      identifier: email,
      isFailed: false,
    });

    return { success: true };
  } catch (err: unknown) {
    const errMsg =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred during signup.";
    console.error("Seller signup exception:", err);
    return { error: errMsg };
  }
}
