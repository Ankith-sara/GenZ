import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserAndProfile } from "@/features/auth/lib/auth";

export default async function DashboardPage() {
  const session = await getUserAndProfile();
  if (!session) {
    redirect("/login");
  }

  const role = session.profile?.role ?? "buyer";

  if (role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "seller") {
    const supabase = await createClient();

    // Check if seller profile already exists
    const { data: seller } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("id", session.userId)
      .maybeSingle();

    if (!seller) {
      console.log(
        `[auth] Auto-creating missing seller_profile for ${session.user.email}`
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const meta = user?.user_metadata;

      if (meta && meta.role === "seller") {
        const businessName =
          meta.business_name || "Factory " + (meta.full_name || user.email);
        const gstNumber = meta.gst_number || meta.pan_number || "PENDING";
        const factoryAddress = meta.factory_address || "";
        const city = meta.city || meta.district || "";
        const state = meta.state || "";
        const pincode = meta.pincode || "";
        const establishedYear = meta.established_year
          ? Number(meta.established_year)
          : null;

        const descriptionJson = JSON.stringify(meta);

        await supabase.from("seller_profiles").insert({
          id: session.userId,
          business_name: businessName,
          gst_number: gstNumber,
          factory_address: factoryAddress || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          established_year: establishedYear,
          description: descriptionJson,
          status: "verified",
        });
      } else {
        await supabase.from("seller_profiles").insert({
          id: session.userId,
          business_name: "Unnamed Factory",
          gst_number: "PENDING",
          status: "verified",
        });
      }
    }

    // Always redirect directly to /seller/dashboard to avoid rewrite loops
    redirect("/seller/dashboard");
  } else {
    redirect("/profile");
  }
}
