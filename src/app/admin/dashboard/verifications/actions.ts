"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/require-role";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { adminRejectSchema } from "@/lib/validation";
import { SITE_URL } from "@/lib/config";

export interface ReviewState {
  error?: string;
  success?: boolean;
  credentials?: {
    email: string;
    password: string;
    emailSent: boolean;
  };
}

/**
 * Generate a secure random password.
 */
export async function generatePasswordAction(): Promise<string> {
  return generatePassword(14);
}

function generatePassword(length = 14): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

/**
 * Admin approves a manufacturer application and provisions credentials:
 * 1. Takes application ID, custom/auto-generated email and password
 * 2. Creates/updates Supabase Auth user & user_metadata
 * 3. Upserts profile + manufacturer_profiles rows
 * 4. Sends credential notification email (if Resend key available)
 * 5. Updates manufacturer_applications table status to "approved"
 */
export async function approveManufacturer(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await requireRole("admin");

  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "approve_manufacturer",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 0. Verify required environment variables
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "[approveManufacturer] CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local"
    );
    return {
      error: "Service role key is not configured. Please check server logs.",
    };
  }

  const applicationId = String(formData.get("applicationId") ?? "").trim();
  const inputEmail = String(formData.get("email") ?? "").trim();
  const inputPassword = String(formData.get("password") ?? "").trim();
  const sendEmailOption = formData.get("sendEmail") === "on";

  if (!applicationId) {
    return { error: "Application ID missing." };
  }

  const supabase = await createClient();

  // 1. Fetch the application
  const { data: application, error: fetchErr } = await supabase
    .from("manufacturer_applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (fetchErr || !application) {
    console.error("[approveManufacturer] Could not find application:", fetchErr);
    return { error: "Application not found." };
  }

  const emailToUse = inputEmail || application.email;
  const passwordToUse = inputPassword || generatePassword(14);

  // 2. Initialize Supabase Admin Client
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (err: unknown) {
    console.error("[approveManufacturer] Admin client init failed:", err);
    return { error: "Failed to initialize administrative service. Please try again." };
  }

  const applicationFormData = (application.form_data ?? {}) as Record<string, string>;

  // Check if user account already exists in Supabase Auth
  const { data: userListData } = await adminClient.auth.admin.listUsers();
  const existingAuthUser = userListData?.users?.find(
    (u) => u.email?.toLowerCase() === emailToUse.toLowerCase()
  );

  let userId: string;

  if (existingAuthUser) {
    userId = existingAuthUser.id;
    // Update existing user password and metadata
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(userId, {
      password: passwordToUse,
      email_confirm: true,
      user_metadata: {
        full_name: application.full_name,
        role: "manufacturer",
        business_type: application.business_type,
        phone: application.phone,
        business_name: application.business_name,
      },
    });

    if (updateErr) {
      console.error("Failed to update user account:", updateErr);
      return { error: `Failed to update user account: ${updateErr.message}` };
    }
  } else {
    // Create new Supabase Auth user
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: emailToUse,
        password: passwordToUse,
        email_confirm: true,
        user_metadata: {
          full_name: application.full_name,
          role: "manufacturer",
          business_type: application.business_type,
          phone: application.phone,
          business_name: application.business_name,
        },
      });

    if (authError || !authData?.user) {
      console.error("Failed to create auth user:", authError);
      return { error: authError?.message || "Failed to create user account." };
    }

    userId = authData.user.id;
  }

  // 3. Create profile + manufacturer_profiles rows (using admin client to bypass RLS)
  await adminClient.from("profiles").upsert({
    id: userId,
    role: "manufacturer",
    full_name: application.full_name,
    phone: application.phone,
    city: applicationFormData.city || null,
    state: applicationFormData.state || null,
    pincode: applicationFormData.pincode || null,
  });

  await adminClient.from("manufacturer_profiles").upsert({
    id: userId,
    business_name: application.business_name,
    gst_number: applicationFormData.gst_number || "PENDING",
    factory_address: applicationFormData.factory_address || null,
    city: applicationFormData.city || null,
    state: applicationFormData.state || null,
    pincode: applicationFormData.pincode || null,
    description: JSON.stringify(application.form_data),
    status: "verified",
    reviewed_at: new Date().toISOString(),
    reviewed_by: session.userId,
  });

  // 4. Update the application status to "approved"
  await supabase
    .from("manufacturer_applications")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", applicationId);

  // 5. Dispatch login credentials email if enabled
  let emailSent = false;
  try {
    const siteUrl = SITE_URL;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "GenZ Platform <onboarding@resend.dev>";

    if (!sendEmailOption) {
      console.log("[approveManufacturer] Send email option was unchecked by admin.");
    } else if (!resendApiKey) {
      console.error(
        "[approveManufacturer] RESEND_API_KEY is not configured in .env.local. Skipping email dispatch."
      );
    } else {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: emailToUse,
          subject: "Your GenZ Manufacturer Account Approved!",
          html: `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #FAF7F0; border-radius: 16px;">
              <h1 style="font-size: 24px; color: #1A1A18; margin-bottom: 8px;">Welcome to GenZ, ${application.full_name}!</h1>
              <p style="font-size: 14px; color: #52524E; line-height: 1.6;">
                Your manufacturer registration application for <strong>${application.business_name}</strong> has been approved.
              </p>
              <div style="background: white; border: 1px solid #E5E5E0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 12px; color: #73736E; text-transform: uppercase; font-weight: 600; letter-spacing: 0.1em; margin-bottom: 12px;">Your Account Login Credentials</p>
                <p style="font-size: 14px; margin: 4px 0;"><strong>Login URL:</strong> <a href="${siteUrl}/login">${siteUrl}/login</a></p>
                <p style="font-size: 14px; margin: 4px 0;"><strong>Email:</strong> ${emailToUse}</p>
                <p style="font-size: 14px; margin: 4px 0;"><strong>Password:</strong> <code style="background: #F0F0EC; padding: 2px 8px; border-radius: 4px; font-size: 13px;">${passwordToUse}</code></p>
              </div>
              <p style="font-size: 13px; color: #8C8C85;">Please change your password after logging in for security.</p>
              <a href="${siteUrl}/login" style="display: inline-block; background: #1A1A18; color: #FFFFFF; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 8px; margin-top: 16px;">Sign In to Dashboard →</a>
            </div>
          `,
        }),
      });

      const resendData = await resendRes.json();
      if (!resendRes.ok) {
        console.error("[approveManufacturer] Resend API Error:", resendData);
      } else {
        console.log(
          "[approveManufacturer] Resend email dispatched successfully:",
          resendData
        );
        emailSent = true;
      }
    }
  } catch (emailErr) {
    console.error("[approveManufacturer] Exception during email dispatch:", emailErr);
  }

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "approve_manufacturer",
    identifier: session.userId,
  });

  revalidatePath("/admin/dashboard/verifications");
  revalidatePath(`/admin/dashboard/verifications/${applicationId}`);

  return {
    success: true,
    credentials: {
      email: emailToUse,
      password: passwordToUse,
      emailSent,
    },
  };
}

/**
 * Admin rejects a manufacturer application with a reason.
 */
export async function rejectManufacturer(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await requireRole("admin");

  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "reject_manufacturer",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  const applicationId = String(formData.get("manufacturerId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const validation = adminRejectSchema.safeParse({ reason });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("manufacturer_applications")
    .update({
      status: "rejected",
      rejection_reason: validation.data.reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", applicationId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "reject_manufacturer",
    identifier: session.userId,
  });

  if (error) {
    console.error("Reject manufacturer DB error:", error);
    return { error: "Could not save the review. Please try again." };
  }

  revalidatePath("/admin/dashboard/verifications");
  redirect(`/admin/dashboard/verifications`);
}

/**
 * Directly update application status via status dropdown select.
 */
export async function updateApplicationStatusDirectly(
  applicationId: string,
  newStatus: "pending" | "approved" | "rejected"
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("manufacturer_applications")
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", applicationId);

  if (error) {
    console.error("[updateApplicationStatusDirectly] DB Error:", error);
    return { error: "Failed to update status in database." };
  }

  revalidatePath("/admin/dashboard/verifications");
  revalidatePath(`/admin/dashboard/verifications/${applicationId}`);
  return { success: true };
}
