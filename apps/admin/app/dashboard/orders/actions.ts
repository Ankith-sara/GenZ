"use server";

import { requireRole } from "@/features/auth/lib/require-role";
import { updateOrderStatus } from "@genz/database/orders";

import type { OrderStatus } from "@genz/types";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  carrier?: string,
  trackingNumber?: string,
  note?: string
) {
  await requireRole("admin");

  try {
    const updated = await updateOrderStatus(orderId, {
      status,
      carrier,
      trackingNumber,
      note,
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    return { success: true, order: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update order status";
    return { success: false, error: msg };
  }
}
