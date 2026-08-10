import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/features/auth/lib/require-role";
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
  } catch (err: unknown) {
    console.error(
      "[CONFIG_ERROR] [AdminVerificationsPage] Failed to initialize admin client:",
      err
    );
    throw new Error(
      "Server misconfiguration: admin credentials are not set up. Contact an engineer."
    );
  }

  // 0. Fetch real Auth emails with pagination
  const authUserEmails: Record<string, string> = {};
  try {
    let page = 1;
    while (page <= 20) {
      const { data: userListData, error: listErr } =
        await supabase.auth.admin.listUsers({
          page,
          perPage: 1000,
        });
      if (listErr || !userListData?.users || userListData.users.length === 0) break;

      userListData.users.forEach((u) => {
        if (u.id && u.email) {
          authUserEmails[u.id] = u.email;
        }
      });

      if (userListData.users.length < 1000) break;
      page++;
    }
  } catch (err) {
    console.error("[AdminVerificationsPage] Could not list auth users:", err);
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
    { full_name?: string | null; phone?: string | null }
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
  const emailToIdMap = new Map<string, string>();

  // Insert seller_applications records
  (rawApplications ?? []).forEach((app) => {
    const realEmail = (app.email || authUserEmails[app.id] || "seller@genz.in").trim();
    const appRecord: SellerAppRecord = {
      id: app.id,
      business_name: app.business_name || "Factory Seller",
      full_name: app.full_name || "Applicant",
      email: realEmail,
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
    };
    applicationsMap.set(app.id, appRecord);
    if (realEmail) {
      emailToIdMap.set(realEmail.toLowerCase(), app.id);
    }
  });

  // Insert & merge seller_profiles records
  (rawSellerProfiles ?? []).forEach((sp) => {
    const userProf = profilesMap[sp.id] || {};
    const realEmail = (authUserEmails[sp.id] || "seller@genz.in").trim();
    const emailKey = realEmail.toLowerCase();

    // Look up existing by ID or by Email
    let existingKey = sp.id;
    let existing = applicationsMap.get(sp.id);
    if (!existing && emailToIdMap.has(emailKey)) {
      existingKey = emailToIdMap.get(emailKey)!;
      existing = applicationsMap.get(existingKey);
    }

    const isApprovedInProfile =
      sp.status === "verified" || (sp.status as string) === "approved";
    const statusMapped: "pending" | "approved" | "rejected" = isApprovedInProfile
      ? "approved"
      : sp.status === "rejected"
        ? "rejected"
        : "pending";

    if (existing) {
      if (isApprovedInProfile) {
        existing.status = "approved";
      } else if (sp.status === "rejected" && existing.status !== "approved") {
        existing.status = "rejected";
      }
      if (sp.gst_number && existing.form_data) {
        existing.form_data.gst_number = sp.gst_number;
      }
    } else {
      const record: SellerAppRecord = {
        id: sp.id,
        business_name: sp.business_name || "Factory Seller",
        full_name: userProf.full_name || "Factory Owner",
        email: realEmail,
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
      };
      applicationsMap.set(sp.id, record);
      if (realEmail) {
        emailToIdMap.set(emailKey, sp.id);
      }
    }
  });

  const mergedList: SellerAppRecord[] = Array.from(applicationsMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <VerificationsSplitClient initialList={mergedList} initialStatus={activeStatus} />
  );
}
