"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { manufacturerSignupSchema } from "@/lib/validation";

export interface ManufacturerSignupState {
  error?: string;
  success?: boolean;
}

export async function signupManufacturer(
  _prevState: ManufacturerSignupState,
  formData: FormData
): Promise<ManufacturerSignupState> {
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
  const businessType = String(formData.get("business_type") ?? "manufacturer");

  // 1. Rate Limiting Check
  const rateLimit = await checkRateLimit({
    endpointType: "auth",
    actionName: "signup_manufacturer",
    identifier: email,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema Validation
  const validation = manufacturerSignupSchema.safeParse({
    email,
    password,
    fullName,
    businessType,
  });
  if (!validation.success) {
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "signup_manufacturer",
      identifier: email,
      isFailed: true,
    });
    return { error: validation.error.issues[0].message };
  }

  const countryCode = String(formData.get("country_code") ?? "+91");
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const phone = rawPhone ? `${countryCode} ${rawPhone}` : "";

  // Gather ALL metadata based on business type to save into Auth Metadata
  const metadata: Record<string, string> = {
    full_name: fullName,
    role: "manufacturer",
    business_type: businessType,
    phone: phone,
  };

  // Collect all fields from the form dynamically
  formData.forEach((value, key) => {
    if (["password", "role"].includes(key)) return;
    metadata[key] = String(value);
  });

  const supabase = await createClient();

  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
      },
    });

    if (error) {
      console.error("Manufacturer signup error:", error);
      await logRateLimitAttempt({
        endpointType: "auth",
        actionName: "signup_manufacturer",
        identifier: email,
        isFailed: true,
      });
      return {
        error:
          error.message || "Failed to register manufacturer account. Please try again.",
      };
    }

    // Immediately create profile rows if session is established (auto-confirm)
    if (authData?.user) {
      const userId = authData.user.id;
      await supabase.from("profiles").upsert({
        id: userId,
        role: "manufacturer",
        full_name: fullName,
      });

      await supabase.from("manufacturer_profiles").upsert({
        id: userId,
        business_name: String(formData.get("business_name") ?? "Unnamed Factory"),
        gst_number: String(formData.get("gst_number") ?? "PENDING"),
        factory_address: String(formData.get("factory_address") ?? "") || null,
        state: String(formData.get("state") ?? "") || null,
        pincode: String(formData.get("pincode") ?? "") || null,
        status: "pending",
      });
    }

    // Log successful attempt
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "signup_manufacturer",
      identifier: email,
      isFailed: false,
    });

    return { success: true };
  } catch (err: unknown) {
    const errMsg =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred during signup.";
    console.error("Manufacturer signup exception:", err);
    return { error: errMsg };
  }
}
