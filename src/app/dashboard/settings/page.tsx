import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/lib/require-role";
import { SellerSettingsClient } from "./settings-client";

export default async function SellerSettingsPage() {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const [{ data: profile }, { data: sellerProfile }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", session.userId)
      .single(),
    supabase
      .from("seller_profiles")
      .select("business_name, gst_number, city, state, status")
      .eq("id", session.userId)
      .maybeSingle(),
  ]);

  return (
    <SellerSettingsClient
      userId={session.userId}
      userEmail={session.email || ""}
      fullName={profile?.full_name || "Factory Seller"}
      avatarUrl={profile?.avatar_url || null}
      businessProfile={sellerProfile}
    />
  );
}
