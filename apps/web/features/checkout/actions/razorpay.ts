"use server";

import { getUserAndProfile } from "@genz/database/auth";
import { withRateLimit } from "@genz/utils/rate-limiter";
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
        console.error("[CreateRazorpayOrderAction] Fastify API error:", apiErr);
        return {
          success: false,
          keyId: "",
          amount: 0,
          currency: "INR",
          error:
            apiErr instanceof Error
              ? apiErr.message
              : "Failed to initialize payment with the server.",
        };
      }
    }
  );

  if ("success" in result) return result;
  return { success: false, keyId: "", amount: 0, currency: "INR", error: result.error };
}
