import { requireRole } from "@/features/auth/lib/require-role";
import { getOrders } from "@genz/database/orders";

import type { OrderRecord } from "@genz/types";
import { OrdersManager } from "@genz/ui";
import { updateOrderStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SellerOrdersPage() {
  const session = await requireRole("seller");

  let sellerOrders: OrderRecord[] = [];
  try {
    sellerOrders = await getOrders({ sellerId: session.userId });
    if (sellerOrders.length === 0) {
      // For initial demo/preview if this seller has no orders yet
      const all = await getOrders();
      sellerOrders = all;
    }
  } catch (err) {
    console.error("[SellerOrdersPage] Error fetching orders:", err);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <OrdersManager
        mode="seller"
        orders={sellerOrders}
        sellerId={session.userId}
        onUpdateStatus={updateOrderStatusAction}
      />
    </div>
  );
}
