import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, Role } from "@/types/database";
import type { User } from "@supabase/supabase-js";

const IS_DEV = process.env.NODE_ENV !== "production";

/** Dev-only debug log — suppressed in production to avoid PII leakage. */
function authDebug(...args: unknown[]) {
  if (IS_DEV) console.log("[auth]", ...args);
}

/**
 * Fetches the current authenticated user along with their profile row
 * (which carries the role). Returns null if there is no session.
 *
 * If the profile query fails (e.g. RLS error) or no row exists,
 * a synthetic profile object is returned using auth user_metadata
 * so that role-based routing still works.
 */
export async function getUserAndProfile(): Promise<{
  userId: string;
  email: string | undefined;
  profile: Profile | null;
  avatarUrl: string | null;
  user: User;
} | null> {
  let user: User | null = null;
  let supabase;
  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    user = data.user;
  } catch (err) {
    console.error("[auth] Failed to fetch authenticated user:", err);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    authDebug(`Profile query error for user ${user.id}: ${profileError.message}`);
  }

  // If no profile row exists, try to create one from auth metadata
  let resolvedProfile = profile;
  if (!resolvedProfile) {
    const metaRole = (user.user_metadata?.role as Role) ?? "buyer";
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;

    authDebug(`No profile row for user ${user.id}. Creating with role="${metaRole}".`);

    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      adminClient = supabase;
    }

    const { data: newProfile, error: insertError } = await adminClient
      .from("profiles")
      .upsert({
        id: user.id,
        role: metaRole,
        full_name: fullName,
      })
      .select("*")
      .single();

    if (insertError) {
      authDebug(
        `Profile insert also failed for user ${user.id}: ${insertError.message}. Using synthetic profile.`
      );
      // Return a synthetic profile from user_metadata so routing still works
      resolvedProfile = {
        id: user.id,
        role: metaRole,
        full_name: fullName,
        city: null,
        phone: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      } as Profile;
    } else {
      resolvedProfile = newProfile;
    }
  }

  // If user is a seller, ensure a seller_profiles row exists
  if (resolvedProfile?.role === "seller") {
    try {
      let adminClient;
      try {
        adminClient = createAdminClient();
      } catch {
        adminClient = supabase;
      }

      const { data: sellerProfile } = await adminClient
        .from("seller_profiles")
        .select("id, status")
        .eq("id", user.id)
        .maybeSingle();

      if (!sellerProfile) {
        authDebug(`Auto-creating missing seller_profile for user ${user.id}`);
        const bName =
          user.user_metadata?.business_name ||
          user.user_metadata?.full_name ||
          "Unnamed Business";
        const gst = user.user_metadata?.gst_number || "PENDING";
        const addr = user.user_metadata?.factory_address || null;
        const state = user.user_metadata?.state || null;
        const pincode = user.user_metadata?.pincode || null;
        const descriptionStr = JSON.stringify(user.user_metadata || {});

        // Default auto-created seller_profiles to 'pending' verification status
        await adminClient.from("seller_profiles").upsert({
          id: user.id,
          business_name: bName,
          gst_number: gst,
          factory_address: addr,
          state: state,
          pincode: pincode,
          description: descriptionStr,
          status: "pending",
          submitted_at: new Date().toISOString(),
        });
      }
    } catch (mfgErr) {
      console.error("[auth] Error auto-creating seller_profile:", mfgErr);
    }
  }

  const avatarUrl =
    resolvedProfile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;

  return {
    userId: user.id,
    email: user.email,
    profile: resolvedProfile ?? null,
    avatarUrl,
    user,
  };
}
