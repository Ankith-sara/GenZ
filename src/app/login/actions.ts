"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Role } from "@/types/database";

// Temporary client for password verification that does NOT write cookies
function getTempClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function verifyPasswordAndSendOtp(email: string, password: string) {
  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const tempSupabase = getTempClient();

  // 1. Verify password credentials
  const { error: signInError } = await tempSupabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  // 2. Trigger Email OTP
  const { error: otpError } = await tempSupabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (otpError) {
    return { error: otpError.message };
  }

  return { success: true };
}

export async function verifyOtpLogin(email: string, token: string) {
  if (!email || !token) {
    return { error: "Please enter the verification code." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signupUser(formData: {
  email: string;
  password?: string;
  fullName: string;
  role: Role;
}) {
  const { email, password, fullName, role } = formData;

  if (!email || !fullName || !password) {
    return { error: "Please fill in all required fields." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  const signUpOptions = {
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
    },
  };

  const { error } = await supabase.auth.signUp(signUpOptions);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function verifyOtpSignup(email: string, token: string) {
  if (!email || !token) {
    return { error: "Please enter the verification code." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function sendPasswordReset(email: string) {
  if (!email) {
    return { error: "Please enter your email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(password: string) {
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
