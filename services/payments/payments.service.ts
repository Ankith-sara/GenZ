import crypto from "crypto";
import { PricingService } from "../pricing/pricing.service";
import type {
  CreatePaymentOrderInput,
  CreatePaymentOrderResult,
  CreateRazorpayRefundInput,
  CreateRazorpayRefundResult,
  VerifySignatureInput,
  VerifySignatureResult,
  WebhookVerificationResult,
} from "./payments.types";

export class PaymentsService {
  /**
   * Creates an order with Razorpay or safely simulates in test/sandbox environment
   */
  static async createRazorpayOrder(
    input: CreatePaymentOrderInput
  ): Promise<CreatePaymentOrderResult> {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_51aBCDeFGhIJkL";
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const amountInPaise = PricingService.inrToPaise(input.amountInInr);

    // If live credentials are provided, call official Razorpay API
    if (keySecret && !keyId.includes("51aBCDeFGhIJkL")) {
      try {
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: input.receipt || `rcpt_${Date.now()}`,
            notes: input.notes,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            success: true,
            gateway: "razorpay",
            keyId,
            orderId: data.id,
            amountInPaise,
            currency: "INR",
            isSimulated: false,
          };
        }
      } catch (err) {
        console.warn("[PaymentsService] Razorpay API call exception:", err);
      }
    }

    // Standard/Sandbox fallback order for dev & testing environments
    const simulatedOrderId = `order_${Date.now().toString(36)}${Math.random()
      .toString(36)
      .substring(2, 6)}`;

    return {
      success: true,
      gateway: "razorpay",
      keyId,
      orderId: simulatedOrderId,
      amountInPaise,
      currency: "INR",
      isSimulated: true,
    };
  }

  /**
   * Cryptographically verifies Razorpay payment signature
   */
  static verifyRazorpaySignature(input: VerifySignatureInput): VerifySignatureResult {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      // Never accept unverified payments in production.
      if (process.env.NODE_ENV === "production") {
        return { verified: false, reason: "RAZORPAY_KEY_SECRET is not configured" };
      }
      // In sandbox/development when RAZORPAY_KEY_SECRET is not configured
      return { verified: true, reason: "Sandbox mode: Secret not configured" };
    }

    try {
      const generated = crypto
        .createHmac("sha256", keySecret)
        .update(`${input.orderId}|${input.paymentId}`)
        .digest("hex");

      const match = timingSafeEqualHex(generated, input.signature);
      return {
        verified: match,
        reason: match ? undefined : "Signature mismatch",
      };
    } catch (err) {
      return {
        verified: false,
        reason: err instanceof Error ? err.message : "Verification error",
      };
    }
  }

  /**
   * Validates UPI UTR transaction reference format
   */
  static validateUpiUtr(utr: string): boolean {
    const cleaned = utr.trim();
    // Indian bank UPI UTR reference is typically 12 alphanumeric characters
    return /^[a-zA-Z0-9]{10,22}$/.test(cleaned);
  }

  /** Server-side Razorpay API credentials, or null when not configured. */
  static getRazorpayCredentials(): { keyId: string; keySecret: string } | null {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId.includes("51aBCDeFGhIJkL")) return null;
    return { keyId, keySecret };
  }

  /**
   * Creates a refund with the Razorpay Refunds API.
   * `receipt` carries our refund id so retries and webhooks can be matched to it.
   * Never simulates success: missing keys or API errors return success: false.
   */
  static async createRazorpayRefund(
    input: CreateRazorpayRefundInput
  ): Promise<CreateRazorpayRefundResult> {
    const credentials = this.getRazorpayCredentials();
    if (!credentials) {
      return {
        success: false,
        error:
          "Razorpay keys are not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET). The refund was not sent.",
      };
    }
    if (!/^pay_[A-Za-z0-9]+$/.test(input.paymentId)) {
      return { success: false, error: "Invalid Razorpay payment id on this order." };
    }
    if (!Number.isInteger(input.amountInPaise) || input.amountInPaise <= 0) {
      return { success: false, error: "Refund amount must be a positive number of paise." };
    }

    try {
      const authHeader = Buffer.from(
        `${credentials.keyId}:${credentials.keySecret}`
      ).toString("base64");
      const res = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(input.paymentId)}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: input.amountInPaise,
            speed: "normal",
            receipt: input.receipt.slice(0, 40),
            notes: input.notes,
          }),
          signal: AbortSignal.timeout(20000),
        }
      );

      const body = (await res.json().catch(() => null)) as {
        id?: string;
        status?: string;
        amount?: number;
        error?: { description?: string; code?: string };
      } | null;

      if (!res.ok || !body?.id) {
        return {
          success: false,
          error:
            body?.error?.description ||
            `Razorpay refund request failed (HTTP ${res.status}).`,
        };
      }

      return {
        success: true,
        refundId: body.id,
        status: body.status || "pending",
        amountInPaise: body.amount,
      };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? `Could not reach Razorpay: ${err.message}`
            : "Could not reach Razorpay.",
      };
    }
  }

  /**
   * Verifies the X-Razorpay-Signature header of a webhook: HMAC-SHA256 of the
   * raw request body with RAZORPAY_WEBHOOK_SECRET. A missing secret is a
   * misconfiguration and is never treated as verified.
   */
  static verifyRazorpayWebhookSignature(
    rawBody: string,
    signature: string | null | undefined,
    secret: string | undefined = process.env.RAZORPAY_WEBHOOK_SECRET
  ): WebhookVerificationResult {
    if (!secret) {
      return {
        verified: false,
        misconfigured: true,
        reason: "RAZORPAY_WEBHOOK_SECRET is not configured",
      };
    }
    if (!signature) {
      return { verified: false, reason: "Missing X-Razorpay-Signature header" };
    }
    const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const verified = timingSafeEqualHex(expected, signature.trim());
    return verified ? { verified } : { verified, reason: "Signature mismatch" };
  }
}

/** Constant-time comparison of two hex digests. */
function timingSafeEqualHex(expectedHex: string, receivedHex: string): boolean {
  if (typeof receivedHex !== "string" || !/^[0-9a-fA-F]+$/.test(receivedHex)) return false;
  const a = Buffer.from(expectedHex, "hex");
  const b = Buffer.from(receivedHex, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

// Backward-compatibility alias
export { PaymentsService as PaymentService };
