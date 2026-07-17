"use server";

import { createClient } from "@/lib/supabase/server";

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

  if (!email || !password || !fullName) {
    return {
      error: "Please fill in your email, password, and owner/authorized person name.",
    };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
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
    return { error: error.message };
  }

  return { success: true };
}
