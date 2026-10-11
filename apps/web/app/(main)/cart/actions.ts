"use server";

import { getUserAndProfile } from "@genz/database/auth";
import { withRateLimit } from "@genz/utils/rate-limiter";
import { CheckoutService } from "@genz/services/checkout";
import { PaymentsService } from "@genz/services/payments";
import { placeOrderSchema, type PlaceOrderInput } from "@genz/validation";
import type { OrderRecord } from "@genz/types";

export interface PlaceOrderResult {
  success: boolean;
  order?: OrderRecord;
  error?: string;
}

/**
 * Places an order. Guest checkout is supported, so a session is optional here
 * (requireRole would force sign-in): signed-in buyers are rate limited per
 * user, guests per IP.
 *
 * Trust boundaries:
 * - The customer email comes from the verified session for signed-in users;
 *   guests must supply one (validated). The client never sets it otherwise.
 * - Payment status is never taken from the client: a Razorpay payment is
 *   "paid" only after its signature is verified here, and only then is the
 *   gateway payment id stored on the order.
 */
export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const session = await getUserAndProfile();

  const result = await withRateLimit(
    {
      endpointType: session ? "user" : "public",
      actionName: "place_order",
      identifier: session?.userId,
    },
    async (): Promise<PlaceOrderResult> => {
      const parsed = placeOrderSchema.safeParse(input);
      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error.issues[0]?.message || "Please check your order details.",
        };
      }
      const data = parsed.data;

      const customerEmail = session ? session.email : data.guestEmail;
      if (!customerEmail) {
        return {
          success: false,
          error: session
            ? "Your account has no email address. Add one to your profile to place orders."
            : "Enter your email address so we can send your order updates.",
        };
      }

      let paymentStatus: "pending" | "paid" = "pending";
      let paymentGatewayId: string | null = null;
      let notes: string;

      if (data.payment.method === "razorpay") {
        const verification = PaymentsService.verifyRazorpaySignature({
          orderId: data.payment.razorpayOrderId,
          paymentId: data.payment.razorpayPaymentId,
          signature: data.payment.razorpaySignature,
        });
        if (!verification.verified) {
          console.error(
            "[PlaceOrder] Razorpay signature verification failed:",
            verification.reason
          );
          return {
            success: false,
            error:
              "We could not verify your payment. If money was debited, contact support with your Razorpay payment id.",
          };
        }
        paymentStatus = "paid";
        paymentGatewayId = data.payment.razorpayPaymentId;
        notes = `Razorpay Payment ID: ${data.payment.razorpayPaymentId} | Gateway Order: ${data.payment.razorpayOrderId}`;
      } else {
        notes = `PhonePe UPI QR | UTR: ${data.payment.utr}${
          data.payment.payerAccount ? ` | Payer: ${data.payment.payerAccount}` : ""
        }`;
      }

      try {
        return await CheckoutService.processCheckout({
          customerId: session?.userId ?? null,
          customerName: data.shippingAddress.recipientName,
          customerEmail,
          customerPhone: data.shippingAddress.phone,
          shippingAddress: data.shippingAddress,
          paymentMethod: data.payment.method,
          paymentStatus,
          paymentGatewayId,
          items: data.items,
          notes,
        });
      } catch (err: unknown) {
        console.error("[PlaceOrder] Error:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to place order",
        };
      }
    }
  );

  if ("success" in result) return result;
  return { success: false, error: result.error };
}
