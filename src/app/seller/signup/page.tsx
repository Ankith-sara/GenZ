import Link from "next/link";
import { AuthLogo } from "@/features/auth/components/logo";
import { SupportLink } from "@/features/auth/components/support-link";
import { SellerSignupForm } from "./signup-form";
import { FooterLinks } from "@/features/auth/components/footer-links";
import { AuthHero } from "@/features/auth/components/auth-hero";

export default function SellerSignupPage() {
  return (
    <main className="text-ink-black grid min-h-screen grid-cols-1 overflow-x-hidden bg-[#FAF8F4] font-sans antialiased lg:grid-cols-2">
      {/* Left Panel: Scrollable Authentication Form Area */}
      <div className="flex h-screen [scrollbar-width:none] flex-col justify-between overflow-y-auto bg-[#FAF8F4] p-6 [-ms-overflow-style:none] sm:p-10 lg:p-12 [&::-webkit-scrollbar]:hidden">
        {/* Top Header Bar */}
        <header className="mx-auto flex w-full max-w-[520px] items-center justify-between">
          <AuthLogo />
          <SupportLink />
        </header>

        {/* Form Container Card Box */}
        <div className="my-auto py-8">
          <div className="mx-auto w-full max-w-[520px] rounded-[16px] border border-[#E5E5E0] bg-white p-7 shadow-xs sm:p-9">
            {/* Tag & Title */}
            <div className="mb-6 text-left">
              <span className="font-graphik mb-1 inline-block text-[11px] font-bold tracking-[0.2em] text-[#C89D32] uppercase">
                SELLER REGISTRATION
              </span>
              <h2 className="font-graphik text-ink-black text-2xl font-bold tracking-tight sm:text-3xl">
                Register Your Business
              </h2>
              <p className="font-graphik mt-1.5 text-xs text-[#73736E] sm:text-sm">
                Connect directly with buyers, list products, and showcase your
                manufacturing capabilities.
              </p>
            </div>

            {/* Seller Registration Form */}
            <SellerSignupForm />

            {/* Buyer Switch Link */}
            <div className="mt-6 border-t border-[#E5E5E0] pt-5 text-center">
              <Link
                href="/signup"
                className="font-graphik text-xs font-semibold tracking-wider text-[#73736E] uppercase transition-colors hover:text-black hover:underline"
              >
                Looking to source products? Sign up here
              </Link>
            </div>

            {/* Sign In Link */}
            <p className="font-graphik mt-3 text-center text-xs text-[#73736E] sm:text-sm">
              Already have an account?{" "}
              <Link
                href="/seller/login"
                className="font-semibold text-black transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mx-auto w-full max-w-[520px]">
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
