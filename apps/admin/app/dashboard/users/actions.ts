"use server";

import { createAdminClient } from "@genz/database/admin";
import { getEmployeeForSession } from "@genz/database/authorization";
import { SELLER_URL, SITE_URL } from "@genz/utils";

export interface SupportLoginResult {
  success?: boolean;
  url?: string;
  error?: string;
}

/**
 * Generate a secure one-time Support Login link (Impersonation).
 *
 * Authorization rules:
 * - Superadmin (role_level === "admin" or profile.role === "admin"): Unrestricted access.
 * - Staff Employees: Must hold seller-related permissions ('verifications:*' or 'crm:*' or 'system:write')
 *   to access seller accounts. Unauthorized employees are blocked.
 */
export async function generateSupportLoginLinkAction({
  userId,
  userEmail,
  portal = "seller",
  reason = "Admin Support Navigation",
}: {
  userId?: string;
  userEmail?: string;
  portal?: "seller" | "web";
  reason?: string;
}): Promise<SupportLoginResult> {
  try {
    const { session, employee } = await getEmployeeForSession();

    const isSuperAdmin =
      session.profile?.role === "admin" || employee.role_level === "admin";

    // Staff employees must have permissions to access seller details
    const hasSellerAccess =
      isSuperAdmin ||
      (employee.permissions &&
        employee.permissions.some(
          (p) =>
            p.startsWith("verifications:") ||
            p.startsWith("crm:") ||
            p.startsWith("system:")
        ));

    if (!hasSellerAccess) {
      return {
        error:
          "Forbidden: You do not have permission to access seller accounts via Support Login.",
      };
    }

    const adminClient = createAdminClient();
    let targetEmail = userEmail?.trim().toLowerCase();

    if (!targetEmail && userId) {
      const { data: authUser, error: userError } =
        await adminClient.auth.admin.getUserById(userId);
      if (userError || !authUser?.user?.email) {
        return { error: "Could not find a valid email address for this account." };
      }
      targetEmail = authUser.user.email;
    }

    if (!targetEmail) {
      return { error: "A user ID or email is required for Support Login." };
    }

    const redirectTarget =
      portal === "seller"
        ? `${SELLER_URL}/dashboard?support_session=true`
        : `${SITE_URL}/profile?support_session=true`;

    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: targetEmail,
        options: {
          redirectTo: redirectTarget,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[SupportLogin] GenerateLink error:", linkError);
      return {
        error:
          linkError?.message || "Failed to generate support authorization link.",
      };
    }

    console.log(
      `[SupportLoginAudit] Admin ${session.userId} (${session.user?.email}) generated support login for target ${targetEmail}. Reason: ${reason}`
    );

    return {
      success: true,
      url: linkData.properties.action_link,
    };
  } catch (err: unknown) {
    console.error("[SupportLogin] Unexpected error:", err);
    return {
      error:
        err instanceof Error ? err.message : "Failed to generate support session.",
    };
  }
}

