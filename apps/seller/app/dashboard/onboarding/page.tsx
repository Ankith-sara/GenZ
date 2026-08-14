import { redirect } from "next/navigation";

export default function SellerOnboardingRedirect() {
  redirect("/seller/dashboard/account");
}
