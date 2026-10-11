import { requireRole } from "@genz/database/authorization";
import { SellerSettingsClient } from "./settings-client";

export default async function SellerSettingsDashboardPage() {
  const session = await requireRole("seller");

  return (
    <SellerSettingsClient
      userId={session.userId}
      userEmail={session.email || ""}
      fullName={session.profile?.full_name || "Factory Seller"}
      avatarUrl={session.profile?.avatar_url || null}
    />
  );
}
