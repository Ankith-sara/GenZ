import { createAdminClient } from "@genz/database/admin";
import type { SellerProfile, SellerApplication } from "@genz/types";
import type { SubmitSellerApplicationInput } from "./sellers.types";

export class SellersRepository {
  /**
   * Retrieves an application by ID
   */
  static async getApplicationById(id: string): Promise<SellerApplication | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("seller_applications")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data as SellerApplication;
  }

  /**
   * Retrieves an application by email
   */
  static async getApplicationByEmail(email: string): Promise<SellerApplication | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("seller_applications")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as SellerApplication;
  }

  /**
   * Inserts a new seller application
   */
  static async createApplication(
    input: SubmitSellerApplicationInput
  ): Promise<SellerApplication> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("seller_applications")
      .insert({
        full_name: input.fullName,
        email: input.email.trim().toLowerCase(),
        phone: input.phone || null,
        business_name: input.businessName,
        business_type: input.businessType || "individual",
        form_data: (input.formData || {}) as any,
        status: "pending",
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to submit application: ${error?.message || "Unknown error"}`);
    }

    return data as SellerApplication;
  }

  /**
   * Updates an application status
   */
  static async updateApplicationStatus(
    id: string,
    updates: {
      status: "pending" | "approved" | "rejected";
      reviewed_by?: string | null;
      reviewed_at?: string | null;
      rejection_reason?: string | null;
    }
  ): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin
      .from("seller_applications")
      .update(updates)
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }

  /**
   * Upserts a seller profile in `seller_profiles`
   */
  static async upsertSellerProfile(profile: Partial<SellerProfile> & { id: string; business_name: string; gst_number: string }): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("seller_profiles").upsert(
      {
        ...profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      throw new Error(`Failed to upsert seller profile: ${error.message}`);
    }
  }

  /**
   * Gets a seller profile from `seller_profiles`
   */
  static async getSellerProfile(sellerId: string): Promise<SellerProfile | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("seller_profiles")
      .select("*")
      .eq("id", sellerId)
      .maybeSingle();

    if (error || !data) return null;
    return data as SellerProfile;
  }

  /**
   * Lists pending seller applications for review
   */
  static async listPendingApplications(limit = 50): Promise<SellerApplication[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("seller_applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as SellerApplication[];
  }
}

// Backward-compatibility alias
export { SellersRepository as SellerRepository };
