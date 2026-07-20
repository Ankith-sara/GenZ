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
    formData.get("owner_name") ?? formData.get("fullName") ?? ""
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

  // Gather ALL metadata based on business type to save into Auth Metadata
  const metadata: Record<string, string> = {
    full_name: fullName,
    role: "manufacturer",
    business_type: businessType,
  };

  // Collect all fields from the form dynamically
  formData.forEach((value, key) => {
    if (["password", "role"].includes(key)) return;
    metadata[key] = String(value);
  });

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
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
    return { error: "Failed to register manufacturer account. Please try again." };
  }

  // Log successful attempt
  await logRateLimitAttempt({
    endpointType: "auth",
    actionName: "signup_manufacturer",
    identifier: email,
    isFailed: false,
  });

  return { success: true };
}
