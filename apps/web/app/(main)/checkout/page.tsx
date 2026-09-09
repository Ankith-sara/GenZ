import { createClient } from "@genz/database";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialAddresses = user?.user_metadata?.addresses || [];

  return (
    <main className="min-h-screen flex-1 bg-[#FAF7F0] pb-24 font-sans text-[#1A1A18] antialiased">
      {/* Header Banner */}
      <div className="relative overflow-hidden border-b border-[#B45309] bg-[#D97706] px-4 py-8 text-white sm:px-6 sm:py-10 md:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="relative z-10 mx-auto max-w-5xl text-left">
          <span className="mb-1 block text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">
            Express Order
          </span>
          <h1 className="font-serif text-2xl font-normal tracking-tight sm:text-4xl">
            UPI QR Payment &amp; Checkout
          </h1>
          <p className="mt-1 text-xs text-white/85 sm:text-sm">
            Scan the official UPI QR code and provide your delivery details to confirm
            your artisan shipment.
          </p>
        </div>
      </div>

      {/* Checkout Container */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 md:px-12">
        <CheckoutClient userAddresses={initialAddresses} />
      </div>
    </main>
  );
}
