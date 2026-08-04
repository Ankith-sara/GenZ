"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/require-role";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { adminRejectSchema } from "@/lib/validation";

export interface ReviewState {
  error?: string;
}

/**
 * Generate a secure random password.
 */
function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

/**
 * Admin approves a manufacturer application:
 * 1. Creates a Supabase Auth user with a generated password
 * 2. Creates profile + manufacturer_profiles rows
 * 3. Sends credentials email via Supabase Edge Function or logs them
 * 4. Updates the application status to "approved"
 */
export async function approveManufacturer(applicationId: string) {
  const session = await requireRole("admin");

  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "approve_manufacturer",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();

  // 1. Fetch the application
  const { data: application, error: fetchErr } = await supabase
    .from("manufacturer_applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (fetchErr || !application) {
    console.error("Could not find application:", fetchErr);
    return;
  }

  if (application.status === "approved") {
    // Already approved, skip
    revalidatePath("/admin/dashboard/verifications");
    redirect(`/admin/dashboard/verifications`);
  }

  // 2. Generate a temporary password
  const tempPassword = generatePassword(14);

  // 3. Create the Supabase Auth user using the Admin API (service role)
  const adminClient = createAdminClient();

  const formData = (application.form_data ?? {}) as Record<string, string>;

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: application.email,
    password: tempPassword,
    email_confirm: true, // Auto-confirm the email — no OTP needed
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
    // If user already exists, try to fetch them
    if (authError?.message?.includes("already been registered")) {
      // User exists — just update the application status
      await supabase
        .from("manufacturer_applications")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: session.userId,
        })
        .eq("id", applicationId);

      revalidatePath("/admin/dashboard/verifications");
      redirect(`/admin/dashboard/verifications`);
    }
    return;
  }

  const userId = authData.user.id;

  // 4. Create profile + manufacturer_profiles rows (using admin client to bypass RLS)
  await adminClient.from("profiles").upsert({
    id: userId,
    role: "manufacturer",
    full_name: application.full_name,
    phone: application.phone,
    city: formData.city || null,
    state: formData.state || null,
    pincode: formData.pincode || null,
  });

  await adminClient.from("manufacturer_profiles").upsert({
    id: userId,
    business_name: application.business_name,
    gst_number: formData.gst_number || "PENDING",
    factory_address: formData.factory_address || null,
    city: formData.city || null,
    state: formData.state || null,
    pincode: formData.pincode || null,
    description: JSON.stringify(application.form_data),
    status: "verified",
    reviewed_at: new Date().toISOString(),
    reviewed_by: session.userId,
  });

  // 5. Update the application status to "approved"
  await supabase
    .from("manufacturer_applications")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.userId,
    })
    .eq("id", applicationId);

  // 6. Send credentials email
  // Using Supabase's built-in invite or a direct email via fetch to Resend/etc.
  // For now, we'll use Supabase Auth's admin API to send a magic link as fallback,
  // AND log the credentials for the admin to share manually if email fails.
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      // Send via Resend
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "GenZ Platform <noreply@genzonline.in>",
          to: application.email,
          subject: "Your GenZ Manufacturer Account is Approved!",
          html: `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #FAF7F0; border-radius: 16px;">
              <img src="${siteUrl}/logo.png" alt="GenZ" style="height: 40px; margin-bottom: 24px;" />
              <h1 style="font-size: 24px; color: #1A1A18; margin-bottom: 8px;">Welcome to GenZ, ${application.full_name}!</h1>
              <p style="font-size: 14px; color: #52524E; line-height: 1.6;">
                Your manufacturer application for <strong>${application.business_name}</strong> has been verified and approved by our administration team.
              </p>
              <div style="background: white; border: 1px solid #E5E5E0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 12px; color: #73736E; text-transform: uppercase; font-weight: 600; letter-spacing: 0.1em; margin-bottom: 12px;">Your Login Credentials</p>
                <p style="font-size: 14px; margin: 4px 0;"><strong>Email:</strong> ${application.email}</p>
                <p style="font-size: 14px; margin: 4px 0;"><strong>Password:</strong> <code style="background: #F0F0EC; padding: 2px 8px; border-radius: 4px; font-size: 13px;">${tempPassword}</code></p>
              </div>
              <p style="font-size: 13px; color: #8C8C85;">Please change your password after your first login for security.</p>
              <a href="${siteUrl}/login/manufacturer" style="display: inline-block; background: #C8A951; color: #1A1A18; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 8px; margin-top: 16px;">Sign In to Your Dashboard →</a>
              <p style="font-size: 11px; color: #A1A19A; margin-top: 32px;">— The GenZ Platform Team</p>
            </div>
          `,
        }),
      });
    } else {
      // Fallback: Log credentials for admin to share manually
      console.log("=================================================");
      console.log("MANUFACTURER APPROVED — LOGIN CREDENTIALS");
      console.log(`Email: ${application.email}`);
      console.log(`Password: ${tempPassword}`);
      console.log(`Business: ${application.business_name}`);
      console.log("=================================================");
    }
  } catch (emailErr) {
    console.error("Failed to send credentials email:", emailErr);
    // Still log the credentials as fallback
    console.log(
      `CREDENTIALS — Email: ${application.email} | Password: ${tempPassword}`
    );
  }

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "approve_manufacturer",
    identifier: session.userId,
  });

  revalidatePath("/admin/dashboard/verifications");
  redirect(`/admin/dashboard/verifications`);
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
