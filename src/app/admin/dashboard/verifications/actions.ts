"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/features/auth/lib/require-role";
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
 * Admin approves a seller application and provisions credentials:
 * Supports records from both seller_applications and seller_profiles tables.
 */
export async function approveSeller(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await requireRole("admin");

  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "approve_seller",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  const applicationId = String(formData.get("applicationId") ?? "").trim();
  const inputEmail = String(formData.get("email") ?? "").trim();
  const inputPassword = String(formData.get("password") ?? "").trim();
  const sendEmailOption = formData.get("sendEmail") === "on";

  if (!applicationId) {
    return { error: "Application ID missing." };
  }

  // 1. Initialize Supabase Admin Client to bypass RLS
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (err: unknown) {
    console.error(
      "[approveSeller] Admin client init failed, falling back to server client:",
      err
    );
    adminClient = await createClient();
  }

  // 2. Fetch application details (Try seller_applications first, then seller_profiles)
  let application: {
    id: string;
    business_name: string;
    full_name: string;
    email: string;
    phone: string | null;
    business_type?: string | null;
    form_data?: Record<string, unknown> | null;
  } | null = null;

  const { data: appRow } = await adminClient
    .from("seller_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (appRow) {
    application = {
      id: appRow.id,
      business_name: appRow.business_name,
      full_name: appRow.full_name,
      email: appRow.email,
      phone: appRow.phone,
      business_type: appRow.business_type,
      form_data: appRow.form_data as Record<string, unknown> | null,
    };
  } else {
    // Check seller_profiles
    const { data: profRow } = await adminClient
      .from("seller_profiles")
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();

    if (profRow) {
      const { data: userProf } = await adminClient
        .from("profiles")
        .select("full_name, phone")
        .eq("id", applicationId)
        .maybeSingle();

      application = {
        id: profRow.id,
        business_name: profRow.business_name || "Factory Seller",
        full_name: userProf?.full_name || "Factory Owner",
        email: inputEmail || "seller@genz.in",
        phone: userProf?.phone || null,
        business_type: "Manufacturer",
        form_data: {
          gst_number: profRow.gst_number,
          factory_address: profRow.factory_address,
          city: profRow.city,
          state: profRow.state,
          pincode: profRow.pincode,
          description: profRow.description,
        },
      };
    }
  }

  if (!application) {
    console.error(
      "[approveSeller] Application not found in seller_applications or seller_profiles:",
      applicationId
    );
    return { error: "Application not found." };
  }

  const emailToUse = inputEmail || application.email;
  const passwordToUse = inputPassword || generatePassword(14);
  const applicationFormData = (application.form_data ?? {}) as Record<string, string>;

  // 3. Check if user account already exists in Supabase Auth
  let userId: string = application.id;

  try {
    const { data: userListData } = await adminClient.auth.admin.listUsers();
    const existingAuthUser = userListData?.users?.find(
      (u) =>
        u.id === application.id || u.email?.toLowerCase() === emailToUse.toLowerCase()
    );

    if (existingAuthUser) {
      userId = existingAuthUser.id;
      await adminClient.auth.admin.updateUserById(userId, {
        password: passwordToUse,
        email_confirm: true,
        user_metadata: {
          full_name: application.full_name,
          role: "seller",
          business_type: application.business_type || "Manufacturer",
          phone: application.phone,
          business_name: application.business_name,
        },
      });
    } else {
      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email: emailToUse,
          password: passwordToUse,
          email_confirm: true,
          user_metadata: {
            full_name: application.full_name,
            role: "seller",
            business_type: application.business_type || "Manufacturer",
            phone: application.phone,
            business_name: application.business_name,
          },
        });

      if (authError || !authData?.user) {
        console.error("Failed to create auth user:", authError);
      } else {
        userId = authData.user.id;
      }
    }
  } catch (authErr) {
    console.error("[approveSeller] Auth admin call notice:", authErr);
  }

  // 4. Update profile + seller_profiles rows to "verified"
  await adminClient.from("profiles").upsert({
    id: userId,
    role: "seller",
    full_name: application.full_name,
    phone: application.phone,
    city: applicationFormData.city || null,
    state: applicationFormData.state || null,
    pincode: applicationFormData.pincode || null,
  });

  if (applicationId && applicationId !== userId) {
    await adminClient
      .from("profiles")
      .update({ role: "seller" })
      .eq("id", applicationId);
  }

  await adminClient.from("seller_profiles").upsert({
    id: userId,
    business_name: application.business_name,
    gst_number: applicationFormData.gst_number || "PENDING",
    factory_address: applicationFormData.factory_address || null,
    city: applicationFormData.city || null,
    state: applicationFormData.state || null,
    pincode: applicationFormData.pincode || null,
    description:
      typeof application.form_data === "string"
        ? application.form_data
        : JSON.stringify(application.form_data),
    status: "verified",
    reviewed_at: new Date().toISOString(),
    reviewed_by: session.userId,
  });

  if (applicationId && applicationId !== userId) {
    await adminClient
      .from("seller_profiles")
      .update({
        status: "verified",
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.userId,
      })
      .eq("id", applicationId);
  }

  // 5. Update seller_applications if present
  await adminClient
    .from("seller_applications")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .or(`id.eq.${applicationId},id.eq.${userId}`);

  // 6. Dispatch login credentials email if enabled
  let emailSent = false;
  try {
    const siteUrl = SITE_URL;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "GenZ Platform <onboarding@resend.dev>";

    if (sendEmailOption && resendApiKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: emailToUse,
          subject: "Your GenZ Seller Account Approved!",
          html: `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #FAF7F0; border-radius: 16px;">
              <h1 style="font-size: 24px; color: #1A1A18; margin-bottom: 8px;">Welcome to GenZ, ${application.full_name}!</h1>
              <p style="font-size: 14px; color: #52524E; line-height: 1.6;">
                Your seller registration application for <strong>${application.business_name}</strong> has been approved.
              </p>
              <div style="background: white; border: 1px solid #E5E5E0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 12px; color: #73736E; text-transform: uppercase; font-weight: 600; letter-spacing: 0.1em; margin-bottom: 12px;">Your Account Login Credentials</p>
                <p style="font-size: 14px; margin: 4px 0;"><strong>Login URL:</strong> <a href="${siteUrl}/login">${siteUrl}/login</a></p>
                <p style="font-size: 14px; margin: 4px 0;"><strong>Email:</strong> ${emailToUse}</p>
                <p style="font-size: 14px; margin: 4px 0;"><strong>Password:</strong> <code style="background: #F0F0EC; padding: 2px 8px; border-radius: 4px; font-size: 13px;">${passwordToUse}</code></p>
              </div>
              <p style="font-size: 13px; color: #8C8C85;">Please change your password after logging in for security.</p>
              <a href="${siteUrl}/login" style="display: inline-block; background: #1A1A18; color: #FFFFFF; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 8px; margin-top: 16px;">Sign In to Dashboard</a>
            </div>
          `,
        }),
      });

      if (resendRes.ok) {
        emailSent = true;
      }
    }
  } catch (emailErr) {
    console.error("[approveSeller] Exception during email dispatch:", emailErr);
  }

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "approve_seller",
    identifier: session.userId,
  });

  revalidatePath("/admin/dashboard/verifications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard/seller");

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
 * Admin rejects a seller application with a reason.
 */
export async function rejectSeller(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await requireRole("admin");

  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "reject_seller",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  const applicationId = String(formData.get("sellerId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const validation = adminRejectSchema.safeParse({ reason });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    adminClient = await createClient();
  }

  // Update seller_applications
  await adminClient
    .from("seller_applications")
    .update({
      status: "rejected",
      rejection_reason: validation.data.reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", applicationId);

  // Update seller_profiles
  await adminClient
    .from("seller_profiles")
    .update({
      status: "rejected",
      rejection_reason: validation.data.reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", applicationId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "reject_seller",
    identifier: session.userId,
  });

  revalidatePath("/admin/dashboard/verifications");
  return { success: true };
}

/**
 * Directly update application status via status dropdown select.
 */
export async function updateApplicationStatusDirectly(
  applicationId: string,
  newStatus: "pending" | "approved" | "rejected"
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole("admin");

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    adminClient = await createClient();
  }

  const targetStatusSellerProfile = newStatus === "approved" ? "verified" : newStatus;

  await adminClient
    .from("seller_applications")
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", applicationId);

  await adminClient
    .from("seller_profiles")
    .update({
      status: targetStatusSellerProfile,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", applicationId);

  revalidatePath("/admin/dashboard/verifications");
  return { success: true };
}
