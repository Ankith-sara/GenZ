import { CartClient } from "./cart-client";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <main className="bg-[#FAF7F0] text-[#1A1A18] flex-1 pb-24 font-sans antialiased min-h-screen">
      {/* Banner Section */}
      <div className="bg-[#D97706] border-b border-[#B45309] relative overflow-hidden px-6 py-10 text-white sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="relative z-10 mx-auto max-w-5xl text-left">
          <span className="text-white/80 text-xs font-semibold tracking-[0.2em] uppercase block mb-1">
            Storefront Shopping
          </span>
          <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Shopping Basket
          </h1>
          <p className="text-white/85 text-xs sm:text-sm mt-1">
            Review your selected handcrafted Indian products before proceeding to checkout.
          </p>
        </div>
      </div>

      {/* Cart Container */}
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-12">
        <CartClient />
      </div>
    </main>
  );
}
