import { SITE_URL } from "@genz/utils";
import { AuthLogo } from "./logo";
import { SupportLink } from "./support-link";
import { LoginForm } from "./login-form";
import { SocialLogin } from "./google-button";
import { FooterLinks } from "./footer-links";
import { AuthHero } from "./auth-hero";
import { AlertCircle } from "lucide-react";

interface AuthLayoutProps {
  redirectTo: string;
  error?: string;
}

export function AuthLayout({ redirectTo, error }: AuthLayoutProps) {
  return (
    <main className="text-ink-black grid min-h-screen grid-cols-1 overflow-x-hidden bg-[#FAF8F4] font-sans antialiased lg:grid-cols-2">
      {/* Left Panel: Scrollable Authentication Form Area */}
      <div className="flex h-screen [scrollbar-width:none] flex-col justify-between overflow-y-auto bg-[#FAF8F4] p-6 [-ms-overflow-style:none] sm:p-10 lg:p-12 [&::-webkit-scrollbar]:hidden">
        {/* Top Header Bar */}
        <header className="mx-auto flex w-full max-w-[460px] items-center justify-between">
          <AuthLogo />
          <SupportLink />
        </header>

        {/* Form Container Card Box */}
        <div className="my-auto py-8">
          <div className="mx-auto w-full max-w-[460px] rounded-[16px] border border-[#E5E5E0] bg-white p-7 shadow-xs sm:p-9">
            {/* Title & Description */}
            <div className="mb-6 text-left">
              <span className="font-mono text-[10px] font-bold tracking-widest text-[#C89D32] uppercase">
                Supplier & Manufacturer Portal
              </span>
              <h2 className="font-graphik text-ink-black mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Seller Desk Sign In
              </h2>
              <p className="font-graphik mt-2 text-xs leading-relaxed text-[#73736E] sm:text-sm">
                Access your factory dashboard to manage catalog listings, respond to
                buyer RFQs, and track production.
              </p>
            </div>

            {/* Error Query Banner */}
            {error && (
              <div className="mb-6 rounded-[10px] border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div>
                    <p className="font-semibold">
                      {error === "forbidden_seller_only"
                        ? "Seller Account Required"
                        : "Authentication Notice"}
                    </p>
                    <p className="mt-1 leading-relaxed text-amber-800">
                      {error === "forbidden_seller_only"
                        ? "This portal is reserved for registered sellers and manufacturing units. If you are looking to purchase or source products as a buyer, please visit the Buyer Storefront."
                        : error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Authentication Form */}
            <LoginForm redirectTo={redirectTo} />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#E5E5E0]" />
              </div>
              <div className="relative flex justify-center text-[11px] font-medium tracking-wider uppercase">
                <span className="bg-white px-3 text-[#73736E]">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <SocialLogin redirectTo={redirectTo} />

            {/* Seller Registration Notice */}
            <div className="mt-6 rounded-xl border border-[#EBEBE6] bg-[#FAF8F4] p-3.5 text-center">
              <p className="font-graphik text-xs text-[#73736E]">
                Want to sell on GenZ?{" "}
                <a
                  href={`${SITE_URL}/seller/signup`}
                  className="font-semibold text-black transition-colors hover:underline"
                >
                  Apply on Marketplace
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mx-auto w-full max-w-[460px]">
          <FooterLinks />
        </div>
      </div>

      {/* Right Panel: Fixed 100vh Visual Hero */}
      <div className="sticky top-0 hidden h-screen w-full overflow-hidden lg:block">
        <AuthHero />
      </div>
    </main>
  );
}
