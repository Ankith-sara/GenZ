import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/types/database";

/**
 * Fetches the current authenticated user along with their profile row
 * (which carries the role). Returns null if there is no session.
 *
 * If the profile query fails (e.g. RLS error) or no row exists,
 * a synthetic profile object is returned using auth user_metadata
 * so that role-based routing still works.
 */
import type { User } from "@supabase/supabase-js";

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
    console.log(
      `[auth] Profile query error for ${user.email}: ${profileError.message}`
    );
  }

  // If no profile row exists, try to create one from auth metadata
  let resolvedProfile = profile;
  if (!resolvedProfile) {
    const metaRole = (user.user_metadata?.role as Role) ?? "buyer";
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;

    console.log(
      `[auth] No profile row for ${user.email} (${user.id}). Creating with role="${metaRole}".`
    );

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        role: metaRole,
        full_name: fullName,
      })
      .select("*")
      .single();

    if (insertError) {
      console.log(
        `[auth] Profile insert also failed for ${user.email}: ${insertError.message}. Using synthetic profile.`
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

  // If user is a manufacturer, ensure a manufacturer_profiles row exists
  if (resolvedProfile?.role === "manufacturer") {
    try {
      const { data: mfg } = await supabase
        .from("manufacturer_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!mfg) {
        console.log(
          `[auth] Auto-creating missing manufacturer_profile for ${user.email}`
        );
        const bName =
          user.user_metadata?.business_name ||
          user.user_metadata?.full_name ||
          "Unnamed Business";
        const gst = user.user_metadata?.gst_number || "PENDING";
        const addr = user.user_metadata?.factory_address || null;
        const state = user.user_metadata?.state || null;
        const pincode = user.user_metadata?.pincode || null;
        const descriptionStr = JSON.stringify(user.user_metadata || {});

        await supabase.from("manufacturer_profiles").upsert({
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
      console.error("[auth] Error auto-creating manufacturer_profile:", mfgErr);
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
