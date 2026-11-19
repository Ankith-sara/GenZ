"use server";

import { getUserAndProfile } from "@genz/database/auth";
import { withRateLimit } from "@genz/utils/rate-limiter";
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
 * recalculation and gateway verification. No local fallback.
 */
export async function placeOrderAction(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
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
        console.error("[PlaceOrderAction] Fastify API error:", apiErr);
        return {
          success: false,
          error:
            apiErr instanceof Error
              ? apiErr.message
              : "Failed to place order through backend API.",
        };
      }
    }
  );

  if ("success" in result) return result;
  return { success: false, error: result.error };
}
