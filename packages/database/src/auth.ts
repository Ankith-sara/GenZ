import "server-only";
import { createClient } from "./server";
import { createAdminClient } from "./admin";
import type { Profile, Role } from "@genz/types";
import type { User } from "@supabase/supabase-js";

const IS_DEV = process.env.NODE_ENV !== "production";

function authDebug(...args: unknown[]) {
  if (IS_DEV) console.log("[auth]", ...args);
}

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
