import { redirect } from "next/navigation";
import { getUserAndProfile } from "@genz/database/auth";
import { CustomersService } from "@genz/services/customers";
import { RefundsService, getCustomerOrderActions } from "@genz/services/refunds";
import type { OrderRecord } from "@genz/types";

import { OrdersClient, type CustomerOrderView } from "./orders-client";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  // Middleware already redirects guests; this is the server-side guarantee.
  const session = await getUserAndProfile();
  if (!session) {
    redirect("/login?redirectTo=/orders");
  }

  let orders: OrderRecord[] = [];
  try {
    // Only this user's own orders, never a cross-customer fallback.
    orders = await CustomersService.getOrdersForViewer(session.userId);
  } catch (err) {
    console.warn("[OrdersPage] Fetch notice:", err);
  }

  const refunds = await RefundsService.getRefundsForOrders(orders.map((o) => o.id));
  const now = new Date();

  const views: CustomerOrderView[] = orders.map((order) => {
    const orderRefunds = refunds.filter((r) => r.orderId === order.id);
    return {
      order,
      refunds: orderRefunds.map((r) => ({
        id: r.id,
        amount: r.amount,
        type: r.type,
        status: r.status,
        method: r.method,
        adminNote: r.adminNote,
        createdAt: r.createdAt,
        processedAt: r.processedAt,
      })),
      actions: getCustomerOrderActions(order, orderRefunds, now),
    };
  });

  return (
    <main className="min-h-screen flex-1 bg-[#FAF7F0] pb-24 font-sans text-[#1A1A18] antialiased">
      {/* Banner Section */}
      <div className="relative overflow-hidden border-b border-[#B45309] bg-[#D97706] px-6 py-10 text-white sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="relative z-10 mx-auto max-w-5xl text-left">
          <span className="mb-1 block text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">
            Delivery &amp; Logistics
          </span>
          <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Track Orders &amp; Shipments
          </h1>
          <p className="mt-1 text-xs text-white/85 sm:text-sm">
            Real-time status tracking from Indian artisanal workshops to your doorstep.
          </p>
        </div>
      </div>

      {/* Orders List / Stepper */}
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-12">
        <OrdersClient initialOrders={views} />
      </div>
    </main>
  );
}
