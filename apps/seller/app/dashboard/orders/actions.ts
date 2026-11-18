"use server";

import { requireRole } from "@genz/database/authorization";
import { OrdersService } from "@genz/services/orders";
import { withRateLimit } from "@genz/utils/rate-limiter";
import type { OrderStatus, OrderRecord } from "@genz/types";
import { revalidatePath } from "next/cache";
import { getAuthenticatedSellerApiClient } from "@/lib/api-server-client";

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
        const client = await getAuthenticatedSellerApiClient();
        const res = await client.sellers.updateOrderStatus(orderId, {
          status,
          carrier,
          trackingNumber,
          note,
        });
        if (res.success) {
          revalidatePath("/dashboard/orders");
          revalidatePath("/dashboard");
        }
        return res;
      } catch {
        // Robust fallback to domain service
        const res = await OrdersService.transitionStatus({
          orderId,
          newStatus: status,
          actorUserId: session.userId,
          actorRole: "seller",
          carrier,
          trackingNumber,
          note,
        });

        if (res.success) {
          revalidatePath("/dashboard/orders");
          revalidatePath("/dashboard");
        }

        return res;
      }
    }
  );

  if ("error" in result && result.error && !("success" in result)) {
    return { success: false, error: result.error };
  }

  return result as { success: boolean; error?: string; order?: OrderRecord | null };
}
