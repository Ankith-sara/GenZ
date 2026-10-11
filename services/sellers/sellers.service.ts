import { AuthService } from "../auth/auth.service";
import { SellersRepository } from "./sellers.repository";
import { sendSellerApprovalEmail, sendResendEmail } from "@genz/utils/resend";
import { SITE_URL } from "@genz/utils/config";
import type { SellerProfile } from "@genz/types";
import type {
  ApproveSellerResult,
  SellerApplication,
  SubmitSellerApplicationInput,
} from "./sellers.types";

export class SellersService {
  /**
   * Submits a new seller application with verification validation
   */
  static async submitApplication(
    input: SubmitSellerApplicationInput
  ): Promise<SellerApplication> {
    const existing = await SellersRepository.getApplicationByEmail(input.email);
    if (existing && existing.status === "pending") {
      throw new Error(
        "A seller application with this email is already pending review."
      );
    }

    return SellersRepository.createApplication(input);
  }

  /**
   * Approves a seller application, provisions Auth user credentials,
   * creates/updates seller_profiles, and dispatches the welcome credential email.
   */
  static async approveApplication(
    applicationId: string,
    reviewerId: string,
    customPassword?: string
  ): Promise<ApproveSellerResult> {
    const application = await SellersRepository.getApplicationById(applicationId);
    if (!application) {
      throw new Error("Seller application not found");
    }

    // 1. Provision or update Auth credentials
    const password =
      customPassword || AuthService.generateSecurePassword(14);

    const provisionResult = await AuthService.provisionOrUpdateAuthUser({
      email: application.email,
      password,
      role: "seller",
      metadata: {
        full_name: application.full_name,
        business_name: application.business_name,
        phone: application.phone,
      },
    });

    const userId = provisionResult.userId;
    const formData = (application.form_data || {}) as Record<string, unknown>;

    // 2. Upsert seller profile with authentic schema fields
    const gstNumber = String(formData.gst_number || formData.gstin || "");
    const address = String(formData.factory_address || formData.address || "");
    const city = String(formData.city || "");
    const state = String(formData.state || "");
    const pincode = String(formData.pincode || "");
    const establishedYear = formData.years_in_business
      ? new Date().getFullYear() - Number(formData.years_in_business)
      : null;

    await SellersRepository.upsertSellerProfile({
      id: userId,
      business_name: application.business_name,
      gst_number: gstNumber,
      factory_address: address || null,
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      established_year: establishedYear,
      status: "verified",
      rejection_reason: null,
      submitted_at: application.created_at,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    });

    // 3. Mark application as approved
    await SellersRepository.updateApplicationStatus(applicationId, {
      status: "approved",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    });

    // 4. Send email notifications
    let emailSent = false;
    let emailError: string | undefined;

    try {
      const emailResult = await sendSellerApprovalEmail({
        to: application.email,
        fullName: application.full_name,
        businessName: application.business_name,
        password,
        siteUrl: `${SITE_URL}/login`,
      });
      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error;
      }
    } catch (err) {
      emailSent = false;
      emailError = err instanceof Error ? err.message : "Email dispatch failed";
    }

    return {
      applicationId,
      userId,
      email: application.email,
      password,
      emailSent,
      emailError,
    };
  }

  /**
   * Rejects a seller application with reasoned audit trail
   */
  static async rejectApplication(
    applicationId: string,
    reviewerId: string,
    reason: string
  ): Promise<void> {
    const application = await SellersRepository.getApplicationById(applicationId);
    if (!application) {
      throw new Error("Seller application not found");
    }

    await SellersRepository.updateApplicationStatus(applicationId, {
      status: "rejected",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    });

    try {
      await sendResendEmail({
        to: application.email,
        subject: "GenZ Seller Application Update",
        html: `
          <div style="font-family: sans-serif; padding: 24px; max-width: 500px; margin: 0 auto; background: #fff;">
            <h2>Seller Application Status</h2>
            <p>Dear ${application.full_name},</p>
            <p>Thank you for your interest in joining GenZ Marketplace as an artisan seller for <strong>${application.business_name}</strong>.</p>
            <p>After reviewing your submission, our team is unable to approve your application at this time.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>You may submit an updated application with complete documentation at any time.</p>
          </div>
        `,
      });
    } catch (err) {
      console.warn("[SellersService] Rejection email dispatch notice:", err);
    }
  }

  /**
   * Intelligent seller profile fallback: checks `seller_profiles`, and if missing
   * or sparse, backfills from `seller_applications` by email.
   * Enforces Monorepo Rule 4 from AGENTS.md.
   */
  static async getSellerProfileWithFallback(
    sellerId: string,
    email?: string
  ): Promise<Partial<SellerProfile> | null> {
    const profile = await SellersRepository.getSellerProfile(sellerId);
    if (profile && profile.business_name && profile.gst_number) {
      return profile;
    }

    if (!email) return profile;

    const application = await SellersRepository.getApplicationByEmail(email);
    if (!application) return profile;

    const formData = (application.form_data || {}) as Record<string, unknown>;

    return {
      id: sellerId,
      business_name: profile?.business_name || application.business_name,
      gst_number:
        profile?.gst_number ||
        String(formData.gst_number || formData.gstin || ""),
      factory_address:
        profile?.factory_address ||
        String(formData.factory_address || formData.address || "") ||
        null,
      city: profile?.city || String(formData.city || "") || null,
      state: profile?.state || String(formData.state || "") || null,
      pincode: profile?.pincode || String(formData.pincode || "") || null,
      status: profile?.status || "verified",
      rejection_reason: profile?.rejection_reason || null,
    };
  }
}

// Backward-compatibility alias
export { SellersService as SellerService };
