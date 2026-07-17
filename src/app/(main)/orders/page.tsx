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
    <main className="bg-cream-paper text-ink-black flex-1 pb-24 font-sans antialiased">
      {/* Banner Section */}
      <div className="bg-brand-yellow border-ash relative overflow-hidden border-b px-6 py-12 text-white sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-5" />
        <div className="relative z-10 mx-auto max-w-[1280px] text-left">
          <span className="text-brand-yellow-dark font-graphik text-caption mb-2.5 block tracking-[0.2em] uppercase">
            Delivery &amp; Logistics
          </span>
          <h1 className="font-nantes text-3xl leading-[1.15] font-normal tracking-tight sm:text-4xl">
            Track Shipments
          </h1>
        </div>
      </div>

      {/* Orders List / Stepper */}
      <div className="mx-auto max-w-[1280px] px-6 py-12 sm:px-12">
        <OrdersClient />
      </div>
    </main>
  );
}
