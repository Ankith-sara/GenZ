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
    const rawOrders = await getOrders({ sellerId: session.userId });
    // Scope order items to this seller and adjust totals for multi-seller orders
    sellerOrders = rawOrders.map((order) => {
      const sellerItems = (order.items || []).filter(
        (item) => (item.sellerId || item.seller_id) === session.userId
      );
      const sellerSubtotal = sellerItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );
      return {
        ...order,
        items: sellerItems.length > 0 ? sellerItems : order.items,
        totalAmount: sellerItems.length > 0 ? sellerSubtotal : order.totalAmount,
      };
    });
  } catch (err) {
    console.error("[SellerOrdersPage] Error fetching orders:", err);
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <OrdersManager
        mode="seller"
        orders={sellerOrders}
        sellerId={session.userId}
        onUpdateStatus={updateOrderStatusAction}
      />
    </div>
  );
}
