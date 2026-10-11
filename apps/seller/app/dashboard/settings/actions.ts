"use server";

import { createClient } from "@genz/database/server";
import { requireRole } from "@genz/database/authorization";
import { withRateLimit } from "@genz/utils/rate-limiter";
import { SITE_URL } from "@genz/utils";

export type PasswordResetResult = { success: true; email: string } | { error: string };

/**
 * Sends a Supabase password-reset email to the signed-in seller's own login
 * email. The address is taken from the session, never from the client.
 */
export async function requestSellerPasswordReset(): Promise<PasswordResetResult> {
  const session = await requireRole("seller");
  const email = session.email;

  if (!email) {
    return {
      error: "Your account has no login email on file. Please contact support.",
    };
  }

  return withRateLimit(
    {
      endpointType: "auth",
      actionName: "seller_settings_password_reset",
      identifier: email,
    },
    async (): Promise<PasswordResetResult> => {
      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/reset-password`,
      });

      if (error) {
        console.error("[seller settings] Password reset request failed:", error);
        return { error: "We couldn't send the reset link. Please try again." };
      }

      return { success: true, email };
    }
  );
}
