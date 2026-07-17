import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/**
 * Fetches the current authenticated user along with their profile row
 * (which carries the role). Returns null if there is no session.
 * Call this from Server Components / Route Handlers only — the
 * middleware already guarantees /dashboard/** requires a session, but
 * pages should still fetch the role themselves to branch UI safely.
 */
export async function getUserAndProfile(): Promise<{
  userId: string;
  email: string | undefined;
  profile: Profile | null;
  avatarUrl: string | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const avatarUrl =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;

  return { userId: user.id, email: user.email, profile: profile ?? null, avatarUrl };
}
