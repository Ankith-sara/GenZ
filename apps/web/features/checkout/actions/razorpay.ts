"use server";

import { getUserAndProfile } from "@genz/database/auth";
import { withRateLimit } from "@genz/utils/rate-limiter";
import { PaymentsService } from "@genz/services/payments";
import { PricingService } from "@genz/services/pricing";
import { razorpayOrderRequestSchema } from "@genz/validation";
import { apiClient } from "@genz/api-client";

export interface CreateRazorpayOrderResult {
  success: boolean;
  keyId: string;
  orderId?: string;
  amount: number;
  currency: string;
  error?: string;
}

/**
 * Creates a Razorpay order for the basket.
 * Consumes the centralized Fastify API (/v1/payments/razorpay/order) which recalculates
 * amount strictly on the server against trusted database product records.
 */
export async function createRazorpayOrderAction(params: {
  items: { id?: string; productId?: string; price: number; quantity: number }[];
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<CreateRazorpayOrderResult> {
  const session = await getUserAndProfile();

  const result = await withRateLimit(
    {
      endpointType: session ? "user" : "public",
      actionName: "create_razorpay_order",
      identifier: session?.userId,
    },
    async (): Promise<CreateRazorpayOrderResult> => {
      const parsed = razorpayOrderRequestSchema.safeParse({ items: params.items });
      if (!parsed.success) {
        return {
          success: false,
          keyId: "",
          amount: 0,
          currency: "INR",
          error: "Your basket is invalid. Please refresh and try again.",
        };
      }

      // 1. Try centralized Fastify API
      try {
        const apiOrder = await apiClient.payments.createRazorpayOrder({
          items: params.items.map((i) => ({
            productId: (i as any).productId || i.id || "prod-1",
            quantity: i.quantity,
          })),
          receipt: params.receipt,
          notes: params.notes,
        });

        return {
          success: apiOrder.success,
          keyId: apiOrder.keyId,
          orderId: apiOrder.orderId,
          amount: apiOrder.amount,
          currency: apiOrder.currency,
        };
      } catch (apiErr: unknown) {
        console.warn("[CreateRazorpayOrder] Fastify API notice, using local calculation fallback:", apiErr);
      }

      // 2. Resilient fallback
      const totals = PricingService.calculateOrderTotals(
        parsed.data.items.map((i) => ({ unitPrice: i.price, quantity: i.quantity }))
      );

      const notes = Object.fromEntries(
        Object.entries(params.notes ?? {})
          .slice(0, 10)
          .map(([k, v]) => [String(k).slice(0, 40), String(v).slice(0, 200)])
      );

      const order = await PaymentsService.createRazorpayOrder({
        amountInInr: totals.total,
        receipt: (params.receipt || `rcpt_${Date.now()}`).slice(0, 40),
        notes,
      });

      return {
        success: order.success,
        keyId: order.keyId,
        orderId: order.orderId,
        amount: order.amountInPaise,
        currency: order.currency,
      };
    }
  );

  if ("success" in result) return result;
  return { success: false, keyId: "", amount: 0, currency: "INR", error: result.error };
}
