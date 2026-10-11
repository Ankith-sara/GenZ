import type { SellerProfile, SellerApplication, VerificationStatus } from "@genz/types";

export type { SellerProfile, SellerApplication, VerificationStatus };

export interface SubmitSellerApplicationInput {
  fullName: string;
  email: string;
  phone?: string;
  businessName: string;
  businessType?: string;
  formData?: Record<string, unknown>;
}

export interface ApproveSellerResult {
  applicationId: string;
  userId: string;
  email: string;
  password?: string;
  emailSent: boolean;
  emailError?: string;
}
