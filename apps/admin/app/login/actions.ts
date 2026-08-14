"use server";

import { redirect } from "next/navigation";
import { createClient } from "@genz/database/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Role } from "@genz/types";
import { withRateLimit } from "@genz/utils/rate-limiter";
import {
  loginSchema,
  otpLoginSchema,
  signupSchema,
  emailSchema,
  passwordSchema,
} from "@genz/validation";
import { SITE_URL } from "@genz/utils";

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
  return withRateLimit(
    {
      endpointType: "auth",
      actionName: "verify_password_send_otp",
      identifier: email,
    },
    async () => {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        return { error: validation.error.issues[0].message };
      }

      const tempSupabase = getTempClient();

      const { error: signInError } = await tempSupabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (signInError) {
        console.error("Password verification failed:", signInError);
        return { error: "Invalid email or password." };
      }

      const { error: otpError } = await tempSupabase.auth.signInWithOtp({
        email: validation.data.email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        console.error("OTP generation failed:", otpError);
        return { error: "Failed to send verification code. Please try again." };
      }

      return { success: true };
    }
  );
}

export async function directPasswordLogin(email: string, password: string) {
  return withRateLimit(
    {
      endpointType: "auth",
      actionName: "direct_password_login",
      identifier: email,
    },
    async () => {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
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
        return { error: "Invalid email or password." };
      }

      return { success: true };
    }
  );
}

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
  return withRateLimit(
    {
      endpointType: "auth",
      actionName: "verify_otp_login",
      identifier: email,
    },
    async () => {
      const validation = otpLoginSchema.safeParse({ email, token });
      if (!validation.success) {
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
        return { error: "Invalid or expired verification code." };
      }

      return { success: true };
    }
  );
}

export async function signupUser(formData: {
  email: string;
  password?: string;
  fullName: string;
  role: Role;
}) {
  const { email, password, fullName, role } = formData;

  return withRateLimit(
    {
      endpointType: "auth",
      actionName: "signup_user",
      identifier: email,
    },
    async () => {
      const validation = signupSchema.safeParse({ email, password, fullName, role });
      if (!validation.success) {
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
          emailRedirectTo: `${SITE_URL}/auth/confirm`,
        },
      };

      try {
        const { data: authData, error } = await withRetry(() =>
          supabase.auth.signUp(signUpOptions)
        );

        if (error) {
          console.error("Signup failed:", error);
          return {
            error: error.message || "Failed to create account. Please try again.",
          };
        }

        if (authData?.user) {
          const userId = authData.user.id;
          await supabase.from("profiles").upsert({
            id: userId,
            role: validation.data.role,
            full_name: validation.data.fullName,
          });
        }

        return { success: true };
      } catch (err: unknown) {
        const errMsg =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("Signup exception:", err);
        return { error: errMsg };
      }
    }
  );
}

export async function verifyOtpSignup(email: string, token: string) {
  return withRateLimit(
    {
      endpointType: "auth",
      actionName: "verify_otp_signup",
      identifier: email,
    },
    async () => {
      const validation = otpLoginSchema.safeParse({ email, token });
      if (!validation.success) {
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
        return { error: "Invalid or expired verification code." };
      }

      return { success: true };
    }
  );
}

export async function sendPasswordReset(email: string) {
  return withRateLimit(
    {
      endpointType: "auth",
      actionName: "send_password_reset",
      identifier: email,
    },
    async () => {
      const validation = emailSchema.safeParse(email);
      if (!validation.success) {
        return { error: validation.error.issues[0].message };
      }

      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(validation.data, {
        redirectTo: `${SITE_URL}/reset-password`,
      });

      if (error) {
        console.error("Password reset request failed:", error);
        return { error: "Failed to send reset link. Please try again." };
      }

      return { success: true };
    }
  );
}

export async function updatePassword(password: string) {
  return withRateLimit(
    {
      endpointType: "auth",
      actionName: "update_password",
    },
    async () => {
      const validation = passwordSchema.safeParse(password);
      if (!validation.success) {
        return { error: validation.error.issues[0].message };
      }

      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({
        password: validation.data,
      });

      if (error) {
        console.error("Password update failed:", error);
        return { error: "Failed to update password. Please try again." };
      }

      return { success: true };
    }
  );
}
