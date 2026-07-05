"use server";

import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/database";

export interface SignupState {
  error?: string;
  success?: boolean;
}

const ALLOWED_SIGNUP_ROLES: Role[] = ["buyer", "manufacturer"];

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const role = String(formData.get("role") ?? "buyer") as Role;

  if (!email || !password || !fullName) {
    return { error: "Please fill in all required fields." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  // Admin accounts are never created through public signup.
  if (!ALLOWED_SIGNUP_ROLES.includes(role)) {
    return { error: "Invalid role selected." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
