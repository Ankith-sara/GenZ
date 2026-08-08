import { redirect } from "next/navigation";

export default function LegacyDashboardSellerRedirectPage() {
  redirect("/seller/dashboard");
}
