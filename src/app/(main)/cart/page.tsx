import { createClient } from "@/lib/supabase/server";
import { CartClient } from "./cart-client";

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialAddresses = user?.user_metadata?.addresses || [];

  return (
    <main className="flex-1 bg-cream-paper font-sans text-ink-black antialiased pb-24">
      {/* Banner Section */}
      <div className="bg-forest-green text-white py-12 px-6 sm:px-12 relative overflow-hidden border-b border-ash">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="mx-auto max-w-[1280px] relative z-10 text-left">
          <span className="text-gold-yellow font-graphik text-caption uppercase tracking-[0.2em] mb-2.5 block">
            Storefront Shopping
          </span>
          <h1 className="font-nantes text-3xl sm:text-4xl font-normal leading-[1.15] tracking-tight">
            Your Basket
          </h1>
        </div>
      </div>

      {/* Cart Container */}
      <div className="mx-auto max-w-[1280px] px-6 py-12 sm:px-12">
        <CartClient userAddresses={initialAddresses} />
      </div>
    </main>
  );
}
