import { createClient } from "@genz/database";
import { requireRole } from "@/features/auth/lib/require-role";
import { SellerAccountClient } from "./account-client";

export default async function SellerAccountPage() {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const [{ data: userProfile }, { data: sellerProfile }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", session.userId)
      .single(),
    supabase.from("seller_profiles").select("*").eq("id", session.userId).maybeSingle(),
  ]);

  return (
    <SellerAccountClient
      userId={session.userId}
      userEmail={session.email || ""}
      fullName={userProfile?.full_name || "Factory Seller"}
      avatarUrl={userProfile?.avatar_url || null}
      sellerProfile={sellerProfile}
    />
  );
}
