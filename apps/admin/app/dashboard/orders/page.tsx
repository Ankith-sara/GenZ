import { requirePermission } from "@/features/auth/lib/require-role";
import { getOrders } from "@genz/database/orders";

import type { OrderRecord } from "@genz/types";
import { OrdersManager } from "@genz/ui";
import { updateOrderStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requirePermission("orders:read");

  let allOrders: OrderRecord[] = [];
  try {
    allOrders = await getOrders();
  } catch (err) {
    console.error("[AdminOrdersPage] Error fetching orders:", err);
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <OrdersManager
        mode="admin"
        orders={allOrders}
        onUpdateStatus={updateOrderStatusAction}
      />
    </div>
  );
}
