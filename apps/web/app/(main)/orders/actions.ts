"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@genz/database/authorization";
import { withRateLimit } from "@genz/utils/rate-limiter";
import { cancelOrderSchema, requestReturnSchema } from "@genz/validation";
import { getAuthenticatedApiClient } from "@/lib/api-server-client";

export interface OrderActionState {
  success?: boolean;
  error?: string;
  message?: string;
}

function readField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

/** Customer cancels their own order before it ships (opens a refund if paid). */
export async function cancelOrderAction(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await requireRole("buyer", {
    redirectOnUnauthenticated: "/login?redirectTo=/orders",
  });

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "customer_cancel_order",
      identifier: session.userId,
    },
    async (): Promise<OrderActionState> => {
      const parsed = cancelOrderSchema.safeParse({
        orderId: readField(formData, "orderId"),
        reason: readField(formData, "reason") || undefined,
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Invalid request." };
      }

      try {
        const client = await getAuthenticatedApiClient();
        const res = await client.orders.cancel(parsed.data.orderId, parsed.data.reason);
        revalidatePath("/orders");
        return {
          success: true,
          message: res.message,
        };
      } catch (apiErr: unknown) {
        console.error("[CancelOrderAction] Fastify API error:", apiErr);
        return {
          error:
            apiErr instanceof Error
              ? apiErr.message
              : "Could not cancel the order via backend API.",
        };
      }
    }
  );
}

/** Customer requests a return within the return window after delivery. */
export async function requestReturnAction(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await requireRole("buyer", {
    redirectOnUnauthenticated: "/login?redirectTo=/orders",
  });

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "customer_request_return",
      identifier: session.userId,
    },
    async (): Promise<OrderActionState> => {
      const parsed = requestReturnSchema.safeParse({
        orderId: readField(formData, "orderId"),
        reason: readField(formData, "reason") ?? "",
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Invalid request." };
      }

      try {
        const client = await getAuthenticatedApiClient();
        const res = await client.orders.requestReturn(
          parsed.data.orderId,
          parsed.data.reason
        );
        revalidatePath("/orders");
        return {
          success: true,
          message: res.message,
        };
      } catch (apiErr: unknown) {
        console.error("[RequestReturnAction] Fastify API error:", apiErr);
        return {
          error:
            apiErr instanceof Error
              ? apiErr.message
              : "Could not request the return via backend API.",
        };
      }
    }
  );
}
