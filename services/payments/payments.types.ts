export interface CreatePaymentOrderInput {
  amountInInr: number;
  receipt?: string;
  notes?: Record<string, string>;
  customerEmail?: string;
  customerPhone?: string;
}

export interface CreatePaymentOrderResult {
  success: boolean;
  gateway: "razorpay" | "upi_qr" | "cod";
  keyId: string;
  orderId: string;
  amountInPaise: number;
  currency: string;
  isSimulated?: boolean;
}

export interface VerifySignatureInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifySignatureResult {
  verified: boolean;
  reason?: string;
}

export interface CreateRazorpayRefundInput {
  /** Razorpay payment id (`pay_...`). */
  paymentId: string;
  amountInPaise: number;
  /** Our refund id; Razorpay stores it as the refund receipt (max 40 chars). */
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateRazorpayRefundResult {
  success: boolean;
  refundId?: string;
  /** Razorpay refund status: "pending" | "processed" | "failed". */
  status?: string;
  amountInPaise?: number;
  error?: string;
}

export interface WebhookVerificationResult {
  verified: boolean;
  /** True when the webhook secret is not configured (respond 5xx, never trust). */
  misconfigured?: boolean;
  reason?: string;
}
