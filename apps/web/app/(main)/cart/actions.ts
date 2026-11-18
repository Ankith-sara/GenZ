"use server";

import { getUserAndProfile } from "@genz/database/auth";
import { withRateLimit } from "@genz/utils/rate-limiter";
import { CheckoutService } from "@genz/services/checkout";
import { PaymentsService } from "@genz/services/payments";
import { placeOrderSchema, type PlaceOrderInput } from "@genz/validation";
import type { OrderRecord } from "@genz/types";
import { getAuthenticatedApiClient } from "@/lib/api-server-client";

export interface PlaceOrderResult {
  success: boolean;
  order?: OrderRecord;
  error?: string;
}

/**
 * Places an order. Guest checkout is supported, so a session is optional here:
 * signed-in buyers are rate limited per user, guests per IP.
 *
 * Consumes the centralized Fastify API (/v1/checkout/orders) with server-side price
 * recalculation and gateway verification.
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

      // 1. Try centralized Fastify API first
      try {
        const client = await getAuthenticatedApiClient();
        const apiOrder = await client.checkout.createOrder({
          items: data.items.map((i) => ({
            productId: i.id || (i as any).productId,
            variantId: (i as any).variantId,
            quantity: i.quantity,
          })),
          shippingAddress: data.shippingAddress,
          guestEmail: data.guestEmail,
          payment: data.payment as any,
        });

        return {
          success: true,
          order: apiOrder,
        };
      } catch (apiErr: unknown) {
        console.warn("[PlaceOrderAction] Fastify API call notice, falling back to local domain handler:", apiErr);
      }

      // 2. Resilient fallback to domain services layer
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
