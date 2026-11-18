"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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
  try {
    const cookieStore = await cookies();
    cookieStore.delete("support_session");
  } catch {
    // ignore cookie deletion failures if any
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function exitSupportSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("support_session");
  } catch {
    // ignore
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3003";
  redirect(`${adminUrl}/dashboard/users`);
}

async function resolveSellerEmail(
  identifier: string
): Promise<{ email?: string; error?: string }> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return { error: "Please enter your company name or email address." };
  }

  // Direct email entered
  if (trimmed.includes("@")) {
    return { email: trimmed.toLowerCase() };
  }

  // Company Name entered -> Look up registered seller by company/business name
  try {
    const { createAdminClient } = await import("@genz/database/admin");
    const adminClient = createAdminClient();

    // 1. Look up by business_name in seller_profiles
    const { data: profile } = await adminClient
      .from("seller_profiles")
      .select("id")
      .ilike("business_name", trimmed)
      .maybeSingle();

    if (profile?.id) {
      const { data: authUser } = await adminClient.auth.admin.getUserById(profile.id);
      if (authUser?.user?.email) {
        return { email: authUser.user.email };
      }
    }

    // 2. Fallback: look up in seller_applications
    const { data: appData } = await adminClient
      .from("seller_applications")
      .select("email")
      .ilike("business_name", trimmed)
      .maybeSingle();

    if (appData?.email) {
      return { email: appData.email };
    }

    return {
      error: `No registered seller account found for company "${trimmed}". Please check your company name spelling or sign in with your registered email.`,
    };
  } catch (err) {
    console.error("[resolveSellerEmail] Lookup error:", err);
    return {
      error: "Unable to verify company name at this moment. Please use your registered email address.",
    };
  }
}

export async function verifyPasswordAndSendOtp(
  identifier: string,
  password: string,
  companyName?: string
) {
  const resolved = await resolveSellerEmail(identifier);
  if (resolved.error || !resolved.email) {
    return { error: resolved.error || "Invalid company name or email." };
  }
  const email = resolved.email;

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

      const { data: authData, error: signInError } =
        await tempSupabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        });

      if (signInError) {
        console.error("Password verification failed:", signInError);
        return { error: "Invalid email or password." };
      }

      // If companyName was specified, verify that the authenticated seller belongs to that company
      if (companyName && companyName.trim() && authData?.user) {
        const trimmedCompany = companyName.trim().toLowerCase();
        try {
          const { createAdminClient } = await import("@genz/database/admin");
          const adminClient = createAdminClient();

          const { data: sProfile } = await adminClient
            .from("seller_profiles")
            .select("business_name")
            .eq("id", authData.user.id)
            .maybeSingle();

          let regName = (sProfile?.business_name || "").trim().toLowerCase();
          if (!regName || regName === "pending" || regName === "factory seller") {
            const { data: appData } = await adminClient
              .from("seller_applications")
              .select("business_name")
              .ilike("email", validation.data.email)
              .maybeSingle();
            regName = (appData?.business_name || "").trim().toLowerCase();
          }

          if (
            regName &&
            regName !== "pending" &&
            regName !== "factory seller" &&
            !regName.includes(trimmedCompany) &&
            !trimmedCompany.includes(regName)
          ) {
            return {
              error: `The entered company name "${companyName}" does not match the registered business name for this account.`,
            };
          }
        } catch (compErr) {
          console.warn("[verifyPasswordAndSendOtp] Company verification notice:", compErr);
        }
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

export async function directPasswordLogin(
  identifier: string,
  password: string,
  companyName?: string
) {
  const resolved = await resolveSellerEmail(identifier);
  if (resolved.error || !resolved.email) {
    return { error: resolved.error || "Invalid company name or email." };
  }
  const email = resolved.email;

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

      const { data: authData, error } = await withRetry(() =>
        supabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        })
      );

      if (error) {
        console.error("Direct password login failed:", error);
        return {
          error:
            "Invalid credentials. Please verify your company name, email address, and password.",
        };
      }

      if (authData?.user) {
        // If companyName was specified, verify that the authenticated seller belongs to that company
        if (companyName && companyName.trim()) {
          const trimmedCompany = companyName.trim().toLowerCase();

          try {
            const { data: sProfile } = await supabase
              .from("seller_profiles")
              .select("business_name")
              .eq("id", authData.user.id)
              .maybeSingle();

            let regName = (sProfile?.business_name || "").trim().toLowerCase();

            if (!regName || regName === "pending" || regName === "factory seller") {
              const { data: appData } = await supabase
                .from("seller_applications")
                .select("business_name")
                .ilike("email", validation.data.email)
                .maybeSingle();
              regName = (appData?.business_name || "").trim().toLowerCase();
            }

            if (
              regName &&
              regName !== "pending" &&
              regName !== "factory seller" &&
              !regName.includes(trimmedCompany) &&
              !trimmedCompany.includes(regName)
            ) {
              await supabase.auth.signOut();
              return {
                error: `The entered company name "${companyName}" does not match the registered business name for this account.`,
              };
            }
          } catch (compErr) {
            console.warn("[directPasswordLogin] Company verification notice:", compErr);
          }
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        const role = profile?.role || authData.user.app_metadata?.role || "buyer";
        if (role !== "seller" && role !== "admin") {
          await supabase.auth.signOut();
          return {
            error:
              "Access denied. This portal is for registered sellers and manufacturers only. If you are a buyer, please visit the Buyer Storefront.",
          };
        }
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
      const { data: authData, error } = await withRetry(() =>
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

      if (authData?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        const role = profile?.role || authData.user.app_metadata?.role || "buyer";
        if (role !== "seller" && role !== "admin") {
          await supabase.auth.signOut();
          return {
            error:
              "Access denied. This portal is for registered sellers and manufacturers only. If you are a buyer, please visit the Buyer Storefront.",
          };
        }
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
        const fullName = user.user_metadata?.full_name || null;

        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingProfile) {
          // Self-signup is always a buyer. Seller and admin roles are granted
          // only by an admin through the protected profile row.
          await supabase.from("profiles").insert({
            id: user.id,
            role: "buyer",
            full_name: fullName,
          });
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
