import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/features/auth/lib/auth";

export default async function PendingVerificationPage() {
  const session = await getUserAndProfile();
  if (!session) {
    redirect("/login");
  }

  const role = session.profile?.role ?? "buyer";
  if (role === "seller") {
    redirect("/seller/dashboard");
  } else {
    redirect("/dashboard");
  }

  return null;
}
