import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/require-role";
import {
  VerificationsSplitClient,
  type SellerAppRecord,
} from "./verifications-split-client";

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status: statusParam } = await searchParams;
  const activeStatus = statusParam || "pending";

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  // 1. Fetch from seller_applications
  const { data: rawApplications } = await supabase
    .from("seller_applications")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Fetch from seller_profiles
  const { data: rawSellerProfiles } = await supabase
    .from("seller_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch associated user profiles for seller_profiles
  const sellerIds = (rawSellerProfiles ?? []).map((s) => s.id);
  const profilesMap: Record<
    string,
    { full_name?: string | null; email?: string | null; phone?: string | null }
  > = {};

  if (sellerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", sellerIds);

    (profiles ?? []).forEach((p) => {
      profilesMap[p.id] = {
        full_name: p.full_name,
        phone: p.phone,
      };
    });
  }

  const applicationsMap = new Map<string, SellerAppRecord>();

  // Insert seller_applications records
  (rawApplications ?? []).forEach((app) => {
    applicationsMap.set(app.id, {
      id: app.id,
      business_name: app.business_name || "Factory Seller",
      full_name: app.full_name || "Applicant",
      email: app.email || "seller@genz.in",
      phone: app.phone || null,
      status:
        app.status === "approved"
          ? "approved"
          : app.status === "rejected"
            ? "rejected"
            : "pending",
      created_at: app.created_at,
      form_data: app.form_data as Record<string, unknown> | null,
      business_type: app.business_type || "Manufacturer",
      rejection_reason: app.rejection_reason || null,
    });
  });

  // Insert seller_profiles records (merging / taking precedence if not in seller_applications)
  (rawSellerProfiles ?? []).forEach((sp) => {
    if (!applicationsMap.has(sp.id)) {
      const userProf = profilesMap[sp.id] || {};
      const statusMapped: "pending" | "approved" | "rejected" =
        sp.status === "verified"
          ? "approved"
          : sp.status === "rejected"
            ? "rejected"
            : "pending";

      applicationsMap.set(sp.id, {
        id: sp.id,
        business_name: sp.business_name || "Factory Seller",
        full_name: userProf.full_name || "Factory Owner",
        email: "seller@genz.in",
        phone: userProf.phone || null,
        status: statusMapped,
        created_at: sp.created_at || sp.submitted_at || new Date().toISOString(),
        form_data: {
          gst_number: sp.gst_number,
          factory_address: sp.factory_address,
          city: sp.city,
          state: sp.state,
          pincode: sp.pincode,
          description: sp.description,
          established_year: sp.established_year,
        },
        business_type: "Manufacturer",
        rejection_reason: sp.rejection_reason || null,
      });
    }
  });

  const mergedList: SellerAppRecord[] = Array.from(applicationsMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <VerificationsSplitClient initialList={mergedList} initialStatus={activeStatus} />
  );
}
