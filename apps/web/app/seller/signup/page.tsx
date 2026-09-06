import Link from "next/link";
import { AuthLogo } from "@/features/auth/components/logo";
import { FooterLinks } from "@/features/auth/components/footer-links";
import { SellerSignupForm } from "./signup-form";
import { CheckCircle2, Factory, ShieldCheck, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Sell on GenZ — Apply as a Verified Indian Manufacturer",
  description:
    "Connect directly with national and global buyers. Register your factory, workshop, or artisan studio on GenZ.",
};

export default function WebSellerSignupPage() {
  const sellerPerks = [
    {
      icon: Factory,
      title: "Direct-from-Source Commerce",
      desc: "Sell directly to retail buyers and corporate procurement teams with zero middleman margin stacking.",
    },
    {
      icon: ShieldCheck,
      title: "Factory & GST Validation",
      desc: "Stand out with a verified manufacturer badge that builds immediate buyer trust across India.",
    },
    {
      icon: TrendingUp,
      title: "Direct Customer Order Pipeline",
      desc: "Receive customer orders, manage fulfillments, and track payouts straight from your dashboard.",
    },
  ];

  return (
    <main className="text-ink-black min-h-screen bg-[#FAF8F4] font-sans antialiased">
      {/* Top Header */}
      <header className="border-b border-[#E5E5E0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <AuthLogo />
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Benefits & Value Prop (5 cols) */}
          <div className="space-y-8 lg:col-span-5">
            <div>
              <span className="font-mono text-xs font-bold tracking-widest text-[#C89D32] uppercase">
                Manufacturer Onboarding
              </span>
              <h1 className="font-nantes text-ink-black mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Sell Directly on GenZ
              </h1>
              <p className="font-graphik mt-3 text-sm leading-relaxed text-[#52524E]">
                Empowering authentic Indian manufacturers, craft clusters, and innovative startups with direct buyer access.
              </p>
            </div>

            {/* Perks Cards */}
            <div className="space-y-4">
              {sellerPerks.map((perk, idx) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-xl border border-[#E5E5E0] bg-white p-4.5 shadow-2xs"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FAF8F4] text-[#C89D32]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-graphik text-sm font-bold text-black">
                        {perk.title}
                      </h3>
                      <p className="font-graphik mt-1 text-xs leading-relaxed text-[#73736E]">
                        {perk.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust Highlights */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-100/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Aligned with Make in India, MSME &amp; DPIIT standards</span>
              </div>
            </div>
          </div>

          {/* Right Column: Seller Registration Form Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-10">
              <div className="mb-6 border-b border-[#F0F0EC] pb-4">
                <h2 className="font-graphik text-xl font-bold text-black">
                  Business Registration Form
                </h2>
                <p className="font-graphik mt-1 text-xs text-[#73736E]">
                  Complete this short application to get your seller profile reviewed and approved.
                </p>
              </div>

              {/* Form Component */}
              <SellerSignupForm />

              {/* Buyer Switcher */}
              <div className="mt-8 border-t border-[#F0F0EC] pt-5 text-center">
                <p className="text-xs text-[#73736E]">
                  Looking to buy or source products as a customer?{" "}
                  <Link href="/signup" className="font-semibold text-black hover:underline">
                    Create Buyer Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E0] bg-white py-8">
        <div className="mx-auto max-w-6xl px-6">
          <FooterLinks />
        </div>
      </footer>
    </main>
  );
}
