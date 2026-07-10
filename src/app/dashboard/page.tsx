import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const session = await getUserAndProfile();
  if (!session) {
    redirect("/login");
  }

  const role = session.profile?.role ?? "buyer";

  if (role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "manufacturer") {
    const supabase = await createClient();
    
    // Check if manufacturer profile already exists
    const { data: manufacturer } = await supabase
      .from("manufacturer_profiles")
      .select("*")
      .eq("id", session.userId)
      .maybeSingle();

    if (!manufacturer) {
      // Profile does not exist yet. Let's read it from auth user raw_user_meta_data!
      const { data: { user } } = await supabase.auth.getUser();
      const meta = user?.user_metadata;
      
      if (meta && meta.role === "manufacturer") {
        // Insert a new profile using the metadata stored during signup
        const businessName = meta.business_name || "Factory " + (meta.full_name || user.email);
        const gstNumber = meta.gst_number || meta.pan_number || "PENDING";
        const factoryAddress = meta.factory_address || "";
        const city = meta.city || meta.district || "";
        const state = meta.state || "";
        const pincode = meta.pincode || "";
        const establishedYear = meta.established_year ? Number(meta.established_year) : null;
        
        // Save everything else (the entire metadata object) in the description column
        const descriptionJson = JSON.stringify(meta);

        await supabase.from("manufacturer_profiles").insert({
          id: session.userId,
          business_name: businessName,
          gst_number: gstNumber,
          factory_address: factoryAddress || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          established_year: establishedYear,
          description: descriptionJson,
          status: "pending", // Always starts as pending review
        });
      } else {
        // Fallback placeholder profile
        await supabase.from("manufacturer_profiles").insert({
          id: session.userId,
          business_name: "Unnamed Factory",
          gst_number: "PENDING",
          status: "pending",
        });
      }
      
      redirect("/dashboard/pending-verification");
    } else if (manufacturer.status !== "verified") {
      redirect("/dashboard/pending-verification");
    } else {
      redirect("/dashboard/manufacturer");
    }
  } else {
    redirect("/profile");
  }
}
