"use server";

import { requireRole } from "@/features/auth/lib/require-role";
import { OrdersService } from "@genz/services/orders";
import { withRateLimit } from "@genz/utils/rate-limiter";
import type { OrderStatus } from "@genz/types";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  carrier?: string,
  trackingNumber?: string,
  note?: string
) {
  const session = await requireRole("admin");

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "admin_update_order_status",
      identifier: session.userId,
    },
    async () => {
      // Customer status emails and cancellation refunds are triggered inside
      // OrdersService.transitionStatus.
      const res = await OrdersService.transitionStatus({
        orderId,
        newStatus: status,
        actorUserId: session.userId,
        actorRole: "admin",
        carrier,
        trackingNumber,
        note,
      });

      if (res.success) {
        revalidatePath("/dashboard/orders");
        revalidatePath("/dashboard/refunds");
        revalidatePath("/dashboard");
      }

      return res;
    }
  );

  if (!("success" in result)) {
    return { success: false, error: result.error };
  }
  return result;
}
