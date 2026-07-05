import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getUserAndProfile();
  if (!session) {
    redirect("/login");
  }

  const role = session.profile?.role ?? "buyer";

  if (role === "admin") {
    redirect("/dashboard/admin");
  } else if (role === "manufacturer") {
    redirect("/dashboard/manufacturer");
  } else {
    redirect("/discover");
  }
}
