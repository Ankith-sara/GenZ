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

          if (validation.data.role === "seller") {
            await supabase.from("seller_profiles").upsert({
              id: userId,
              business_name: validation.data.fullName + "'s Business",
              gst_number: "PENDING",
              status: "pending",
            });
          }
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

      if (data?.user) {
        const user = data.user;
        const role =
          (user.user_metadata?.role as "buyer" | "seller" | "admin") || "buyer";
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

          if (role === "seller") {
            await supabase.from("seller_profiles").insert({
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

  const { error: otpError } = await supabase.auth.verifyOtp({
    email: emailVal.data,
    token: token.trim(),
    type: "recovery",
  });

  if (otpError) {
    console.error("Recovery OTP verification failed:", otpError);
    return { error: "Invalid or expired 6-digit verification code." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: passVal.data,
  });

  if (updateError) {
    console.error("Password update failed:", updateError);
    return { error: "Failed to update password. Please try again." };
  }

  return { success: true };
}
