import { redirect } from "next/navigation";
import { SITE_URL } from "@genz/utils";

export default function SellerSignupPage() {
  redirect(`${SITE_URL}/seller/signup`);
}
