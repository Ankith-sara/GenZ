import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrdersClient } from "./orders-client";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-background flex min-h-screen flex-col font-sans">
      <main className="flex-1 pb-24">
        {/* Banner Section */}
        <div className="bg-forest-green text-white py-12 px-6 sm:px-12 relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="mx-auto max-w-6xl relative z-10 text-left">
            <span className="text-gold-yellow eyebrow mb-2.5 block uppercase tracking-wider text-xs">
              Delivery &amp; Logistics
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-tight">
              Track Shipments
            </h1>
          </div>
        </div>

        {/* Orders List / Stepper */}
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12">
          <OrdersClient />
        </div>
      </main>
    </div>
  );
}
