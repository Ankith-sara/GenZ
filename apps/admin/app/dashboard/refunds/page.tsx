import { requirePermission } from "@genz/database/authorization";
import { getOrders } from "@genz/database/orders";
import { PageHeader } from "@genz/ui";
import {
  RefundsService,
  getRefundableBalance,
  hasCollectedPayment,
  hasOpenRefund,
  resolveRefundMethod,
} from "@genz/services/refunds";
import type { OrderRecord, RefundRecord } from "@genz/types";
import {
  RefundsQueueClient,
  type AdminRefundRow,
  type RefundableOrderOption,
} from "./refunds-client";

export const dynamic = "force-dynamic";

export default async function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  await requirePermission("orders:read");
  const { order: preselectedOrderId } = await searchParams;

  let refunds: RefundRecord[] = [];
  let loadError: string | null = null;
  try {
    refunds = await RefundsService.listForAdmin();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load refunds.";
  }

  let orders: OrderRecord[] = [];
  try {
    orders = await getOrders();
  } catch (err) {
    console.error("[AdminRefundsPage] Error fetching orders:", err);
  }
  const ordersById = new Map(orders.map((o) => [o.id, o]));

  const rows: AdminRefundRow[] = refunds.map((r) => {
    const order = ordersById.get(r.orderId);
    return {
      refund: r,
      order: order
        ? {
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            paymentGatewayId: order.paymentGatewayId ?? null,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
          }
        : null,
      method: order ? resolveRefundMethod(order) : r.method,
    };
  });

  const refundableOrders: RefundableOrderOption[] = orders
    .filter((o) => hasCollectedPayment(o))
    .map((o) => {
      const orderRefunds = refunds.filter((r) => r.orderId === o.id);
      return {
        id: o.id,
        label: `${o.id} · ${o.customerName} · ₹${o.totalAmount.toLocaleString("en-IN")}`,
        balance: getRefundableBalance(o, orderRefunds),
        method: resolveRefundMethod(o),
        hasOpenRefund: hasOpenRefund(orderRefunds),
      };
    })
    .filter((o) => o.balance > 0 && !o.hasOpenRefund);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Refunds & Returns"
        description="Review cancellation and return refunds, send Razorpay refunds and record manual (UPI / bank) refunds."
        breadcrumbs={[
          { label: "Operations", href: "/dashboard/operations" },
          { label: "Refunds" },
        ]}
      />

      {loadError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {loadError}
        </div>
      )}

      <RefundsQueueClient
        rows={rows}
        refundableOrders={refundableOrders}
        preselectedOrderId={preselectedOrderId ?? null}
      />
    </div>
  );
}
