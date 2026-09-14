"use server";

import { requireRole } from "@/features/auth/lib/require-role";
import { getOrderById, updateOrderStatus } from "@genz/database/orders";
import { withRateLimit } from "@/lib/rate-limiter";
import type { OrderStatus, OrderRecord } from "@genz/types";
import { revalidatePath } from "next/cache";

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  carrier?: string,
  trackingNumber?: string,
  note?: string
): Promise<{ success: boolean; error?: string; order?: OrderRecord | null }> {
  const session = await requireRole("seller");

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "update_order_status",
      identifier: session.userId,
    },
    async () => {
      try {
        const order = await getOrderById(orderId);
        if (!order) {
          return { success: false, error: "Order not found." };
        }

        // Verify seller ownership of this order
        const hasSellerItem =
          (order.sellerIds && order.sellerIds.includes(session.userId)) ||
          (order.items || []).some(
            (item) => (item.sellerId || item.seller_id) === session.userId
          );

        if (!hasSellerItem && session.profile?.role !== "admin") {
          return {
            success: false,
            error: "Unauthorized: You do not have permission to modify this order.",
          };
        }

        // Validate allowed state transitions
        const currentStatus = order.status;
        const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];
        if (!allowedNext || !allowedNext.includes(status)) {
          return {
            success: false,
            error: `Invalid transition: Cannot change order status from "${currentStatus}" to "${status}".`,
          };
        }

        // Validate required tracking info when moving to shipped
        if (status === "shipped") {
          if (!carrier?.trim() || !trackingNumber?.trim()) {
            return {
              success: false,
              error:
                "Carrier partner and tracking number are required when marking an order as shipped.",
            };
          }
        }

        const updated = await updateOrderStatus(orderId, {
          status,
          carrier: carrier?.trim(),
          trackingNumber: trackingNumber?.trim(),
          note: note?.trim(),
        });

        revalidatePath("/dashboard/orders");
        revalidatePath("/dashboard");
        return { success: true, order: updated };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to update order status";
        return { success: false, error: msg };
      }
    }
  );

  if ("error" in result && result.error && !("success" in result)) {
    return { success: false, error: result.error };
  }

  return result as { success: boolean; error?: string; order?: OrderRecord | null };
}
