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

export async function directPasswordLogin(email: string, password: string) {
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "auth",
    actionName: "direct_password_login",
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
      actionName: "direct_password_login",
      identifier: email,
      isFailed: true,
    });
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await withRetry(() =>
    supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    })
  );

  if (error) {
    console.error("Direct password login failed:", error);
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "direct_password_login",
      identifier: email,
      isFailed: true,
    });
    return { error: "Invalid email or password." };
  }

  await logRateLimitAttempt({
    endpointType: "auth",
    actionName: "direct_password_login",
    identifier: email,
    isFailed: false,
  });

  return { success: true };
}

// Helper to retry transient network socket drops (ECONNRESET / AuthRetryableFetchError)
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const errorObj = err as {
      name?: string;
      message?: string;
      cause?: { code?: string };
    };
    if (
      errorObj?.name === "AuthRetryableFetchError" ||
      errorObj?.cause?.code === "ECONNRESET" ||
      errorObj?.message?.includes("fetch failed")
    ) {
      console.warn("Retrying Supabase auth request due to transient ECONNRESET...");
      return await fn();
    }
    throw err;
  }
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
  const { error } = await withRetry(() =>
    supabase.auth.verifyOtp({
      email: validation.data.email,
      token: validation.data.token,
      type: "email",
    })
  );

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

  // Log successful login non-blocking
  logRateLimitAttempt({
    endpointType: "auth",
    actionName: "verify_otp_login",
    identifier: email,
    isFailed: false,
  }).catch(() => {});

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

  try {
    const { data: authData, error } = await withRetry(() =>
      supabase.auth.signUp(signUpOptions)
    );

    if (error) {
      console.error("Signup failed:", error);
      await logRateLimitAttempt({
        endpointType: "auth",
        actionName: "signup_user",
        identifier: email,
        isFailed: true,
      });
      return { error: error.message || "Failed to create account. Please try again." };
    }

    if (authData?.user) {
      const userId = authData.user.id;
      await supabase.from("profiles").upsert({
        id: userId,
        role: validation.data.role,
        full_name: validation.data.fullName,
      });

      if (validation.data.role === "manufacturer") {
        await supabase.from("manufacturer_profiles").upsert({
          id: userId,
          business_name: validation.data.fullName + "'s Business",
          gst_number: "PENDING",
          status: "pending",
        });
      }
    }

    // Log successful signup
    await logRateLimitAttempt({
      endpointType: "auth",
      actionName: "signup_user",
      identifier: email,
      isFailed: false,
    });

    return { success: true };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("Signup exception:", err);
    return { error: errMsg };
  }
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
  const { data, error } = await supabase.auth.verifyOtp({
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

  // Ensure profile row exists in DB now that user is verified
  if (data?.user) {
    const user = data.user;
    const role =
      (user.user_metadata?.role as "buyer" | "manufacturer" | "admin") || "buyer";
    const fullName = user.user_metadata?.full_name || null;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      await supabase.from("profiles").insert({
        id: user.id,
        role,
        full_name: fullName,
      });

      if (role === "manufacturer") {
        await supabase.from("manufacturer_profiles").insert({
          id: user.id,
          business_name: user.user_metadata?.business_name || "Unnamed Business",
          gst_number: user.user_metadata?.gst_number || "PENDING",
          factory_address: user.user_metadata?.factory_address || null,
          state: user.user_metadata?.state || null,
          pincode: user.user_metadata?.pincode || null,
          status: "pending",
        });
      }
    }
  }

  // Log successful signup confirmation non-blocking
  logRateLimitAttempt({
    endpointType: "auth",
    actionName: "verify_otp_signup",
    identifier: email,
    isFailed: false,
  }).catch(() => {});

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

export async function resetPasswordWithOtp(formData: {
  email: string;
  token: string;
  password: string;
}) {
  const { email, token, password } = formData;

  const emailVal = emailSchema.safeParse(email);
  if (!emailVal.success) return { error: "Invalid email address." };

  const passVal = passwordSchema.safeParse(password);
  if (!passVal.success) return { error: passVal.error.issues[0].message };

  if (!token || token.trim().length < 6) {
    return { error: "Please enter a valid 6-digit verification code." };
  }

  const supabase = await createClient();

  // 1. Verify 6-digit recovery OTP code
  const { error: otpError } = await supabase.auth.verifyOtp({
    email: emailVal.data,
    token: token.trim(),
    type: "recovery",
  });

  if (otpError) {
    console.error("Recovery OTP verification failed:", otpError);
    return { error: "Invalid or expired 6-digit verification code." };
  }

  // 2. Update user password
  const { error: updateError } = await supabase.auth.updateUser({
    password: passVal.data,
  });

  if (updateError) {
    console.error("Password update failed:", updateError);
    return { error: "Failed to update password. Please try again." };
  }

  return { success: true };
}
