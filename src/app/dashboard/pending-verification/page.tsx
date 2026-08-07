import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";

export default async function PendingVerificationPage() {
  const session = await getUserAndProfile();
  if (!session) {
    redirect("/login");
  }

  const role = session.profile?.role ?? "buyer";
  if (role === "seller") {
    redirect("/dashboard/seller");
  } else {
    redirect("/dashboard");
  }

  return null;
}
