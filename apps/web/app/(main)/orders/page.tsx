import { createClient } from "@genz/database";
import { getOrders } from "@genz/database/orders";
import type { OrderRecord } from "@genz/types";

import { OrdersClient } from "./orders-client";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialOrders: OrderRecord[] = [];
  try {
    if (user) {
      initialOrders = await getOrders({ customerId: user.id });
    }
    if (initialOrders.length === 0) {
      // Fetch latest orders for display/fallback
      const recent = await getOrders();
      initialOrders = recent.slice(0, 10);
    }
  } catch (err) {
    console.warn("[OrdersPage] Fetch notice:", err);
  }

  return (
    <main className="bg-[#FAF7F0] text-[#1A1A18] flex-1 pb-24 font-sans antialiased min-h-screen">
      {/* Banner Section */}
      <div className="bg-[#D97706] relative overflow-hidden px-6 py-10 text-white sm:px-12 border-b border-[#B45309]">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="relative z-10 mx-auto max-w-5xl text-left">
          <span className="text-white/80 text-xs font-semibold tracking-[0.2em] uppercase block mb-1">
            Delivery &amp; Logistics
          </span>
          <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Track Orders &amp; Shipments
          </h1>
          <p className="text-white/85 text-xs sm:text-sm mt-1">
            Real-time status tracking from Indian artisanal workshops to your doorstep.
          </p>
        </div>
      </div>

      {/* Orders List / Stepper */}
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-12">
        <OrdersClient initialOrders={initialOrders} />
      </div>
    </main>
  );
}
