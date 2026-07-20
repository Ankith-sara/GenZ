"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Role } from "@/types/database";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import {
  loginSchema,
  otpLoginSchema,
  signupSchema,
  emailSchema,
  passwordSchema,
} from "@/lib/validation";

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
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "auth",
    actionName: "verify_password_send_otp",
    identifier: email,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema validation
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "verify_password_send_otp",
      identifier: email,
      isFailed: true,
    });
    return { error: validation.error.issues[0].message };
  }

  const tempSupabase = getTempClient();

  // 3. Verify password credentials
  const { error: signInError } = await tempSupabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (signInError) {
    console.error("Password verification failed:", signInError);
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "verify_password_send_otp",
      identifier: email,
      isFailed: true,
    });
    return { error: "Invalid email or password." }; // Safe generic message
  }

  // 4. Trigger Email OTP
  const { error: otpError } = await tempSupabase.auth.signInWithOtp({
    email: validation.data.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (otpError) {
    console.error("OTP generation failed:", otpError);
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "verify_password_send_otp",
      identifier: email,
      isFailed: true,
    });
    return { error: "Failed to send verification code. Please try again." };
  }

  // Log successful password check
  await logRateLimitAttempt({
    endpointType: "auth",
    actionName: "verify_password_send_otp",
    identifier: email,
    isFailed: false,
  });

  return { success: true };
}

export async function verifyOtpLogin(email: string, token: string) {
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "auth",
    actionName: "verify_otp_login",
    identifier: email,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema validation
  const validation = otpLoginSchema.safeParse({ email, token });
  if (!validation.success) {
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "verify_otp_login",
      identifier: email,
      isFailed: true,
    });
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: validation.data.email,
    token: validation.data.token,
    type: "email",
  });

  if (error) {
    console.error("OTP verification failed:", error);
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "verify_otp_login",
      identifier: email,
      isFailed: true,
    });
    return { error: "Invalid or expired verification code." };
  }

  // Log successful login
  await logRateLimitAttempt({
    endpointType: "auth",
    actionName: "verify_otp_login",
    identifier: email,
    isFailed: false,
  });

  return { success: true };
}

export async function signupUser(formData: {
  email: string;
  password?: string;
  fullName: string;
  role: Role;
}) {
  const { email, password, fullName, role } = formData;

  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "auth",
    actionName: "signup_user",
    identifier: email,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema validation
  const validation = signupSchema.safeParse({ email, password, fullName, role });
  if (!validation.success) {
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "signup_user",
      identifier: email,
      isFailed: true,
    });
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();

  const signUpOptions = {
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: {
        full_name: validation.data.fullName,
        role: validation.data.role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
    },
  };

  const { error } = await supabase.auth.signUp(signUpOptions);

  if (error) {
    console.error("Signup failed:", error);
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "signup_user",
      identifier: email,
      isFailed: true,
    });
    return { error: "Failed to create account. Please try again." };
  }

  // Log successful signup
  await logRateLimitAttempt({
    endpointType: "auth",
    actionName: "signup_user",
    identifier: email,
    isFailed: false,
  });

  return { success: true };
}

export async function verifyOtpSignup(email: string, token: string) {
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "auth",
    actionName: "verify_otp_signup",
    identifier: email,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema validation
  const validation = otpLoginSchema.safeParse({ email, token });
  if (!validation.success) {
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "verify_otp_signup",
      identifier: email,
      isFailed: true,
    });
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: validation.data.email,
    token: validation.data.token,
    type: "signup",
  });

  if (error) {
    console.error("Signup OTP verification failed:", error);
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "verify_otp_signup",
      identifier: email,
      isFailed: true,
    });
    return { error: "Invalid or expired verification code." };
  }

  // Log successful signup confirmation
  await logRateLimitAttempt({
    endpointType: "auth",
    actionName: "verify_otp_signup",
    identifier: email,
    isFailed: false,
  });

  return { success: true };
}

export async function sendPasswordReset(email: string) {
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "auth",
    actionName: "send_password_reset",
    identifier: email,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema validation
  const validation = emailSchema.safeParse(email);
  if (!validation.success) {
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "send_password_reset",
      identifier: email,
      isFailed: true,
    });
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(validation.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    console.error("Password reset request failed:", error);
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "send_password_reset",
      identifier: email,
      isFailed: true,
    });
    return { error: "Failed to send reset link. Please try again." };
  }

  // Log success
  await logRateLimitAttempt({
    endpointType: "auth",
    actionName: "send_password_reset",
    identifier: email,
    isFailed: false,
  });

  return { success: true };
}

export async function updatePassword(password: string) {
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "auth",
    actionName: "update_password",
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema validation
  const validation = passwordSchema.safeParse(password);
  if (!validation.success) {
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "update_password",
      isFailed: true,
    });
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validation.data,
  });

  if (error) {
    console.error("Password update failed:", error);
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "update_password",
      isFailed: true,
    });
    return { error: "Failed to update password. Please try again." };
  }

  // Log success
  await logRateLimitAttempt({
    endpointType: "auth",
    actionName: "update_password",
    isFailed: false,
  });

  return { success: true };
}
