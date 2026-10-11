"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@genz/database/authorization";
import { withRateLimit } from "@genz/utils/rate-limiter";
import { RefundsService } from "@genz/services/refunds";
import { cancelOrderSchema, requestReturnSchema } from "@genz/validation";

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
  const session = await requireRole("buyer", { redirectOnUnauthenticated: "/login?redirectTo=/orders" });

  return withRateLimit(
    { endpointType: "user", actionName: "customer_cancel_order", identifier: session.userId },
    async (): Promise<OrderActionState> => {
      const parsed = cancelOrderSchema.safeParse({
        orderId: readField(formData, "orderId"),
        reason: readField(formData, "reason") || undefined,
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Invalid request." };
      }

      // Ownership (order.customerId === session.userId) is enforced in the service.
      const res = await RefundsService.cancelOrderByCustomer({
        orderId: parsed.data.orderId,
        userId: session.userId,
        reason: parsed.data.reason || null,
      });
      if (!res.success) return { error: res.error || "Could not cancel the order." };

      revalidatePath("/orders");
      return {
        success: true,
        message: res.refund
          ? "Order cancelled. Your refund request has been created and we will email you when it is initiated."
          : "Order cancelled.",
      };
    }
  );
}

/** Customer requests a return within the return window after delivery. */
export async function requestReturnAction(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await requireRole("buyer", { redirectOnUnauthenticated: "/login?redirectTo=/orders" });

  return withRateLimit(
    { endpointType: "user", actionName: "customer_request_return", identifier: session.userId },
    async (): Promise<OrderActionState> => {
      const parsed = requestReturnSchema.safeParse({
        orderId: readField(formData, "orderId"),
        reason: readField(formData, "reason") ?? "",
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Invalid request." };
      }

      const res = await RefundsService.requestReturn({
        orderId: parsed.data.orderId,
        userId: session.userId,
        reason: parsed.data.reason,
      });
      if (!res.success) return { error: res.error || "Could not request the return." };

      revalidatePath("/orders");
      return {
        success: true,
        message: "Return requested. Our team will contact you to arrange the pickup.",
      };
    }
  );
}
