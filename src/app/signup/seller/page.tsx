import Link from "next/link";
import { AuthLogo } from "@/components/auth/logo";
import { SupportLink } from "@/components/auth/support-link";
import { SellerSignupForm } from "./signup-form";
import { FooterLinks } from "@/components/auth/footer-links";

export default function SellerSignupPage() {
  return (
    <main className="text-ink-black flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#FAF8F4] p-6 font-sans antialiased sm:p-10 lg:p-12">
      {/* Top Header Bar */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <AuthLogo />
        <SupportLink />
      </header>

      {/* Form Container Card Box */}
      <div className="my-auto py-8">
        <div className="mx-auto w-full max-w-5xl rounded-[16px] border border-[#E5E5E0] bg-white p-7 shadow-xs sm:p-10 md:p-12">
          {/* Tag & Title */}
          <div className="mb-8 text-left">
            <span className="font-graphik mb-1.5 inline-block text-[11px] font-bold tracking-[0.2em] text-[#C89D32] uppercase">
              SELLER REGISTRATION
            </span>
            <h2 className="font-graphik text-ink-black text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Register Your Business
            </h2>
            <p className="font-graphik mt-2 text-xs text-[#73736E] sm:text-sm">
              Connect directly with buyers, list products, and showcase your
              manufacturing capabilities.
            </p>
          </div>

          {/* Seller Registration Form */}
          <SellerSignupForm />

          {/* Buyer Switch Link */}
          <div className="mt-8 border-t border-[#E5E5E0] pt-6 text-center">
            <Link
              href="/signup"
              className="font-graphik text-xs font-semibold tracking-wider text-[#73736E] uppercase transition-colors hover:text-black hover:underline"
            >
              Looking to source products? Sign up here
            </Link>
          </div>

          {/* Sign In Link */}
          <p className="font-graphik mt-4 text-center text-xs text-[#73736E] sm:text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-black transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mx-auto w-full max-w-5xl">
        <FooterLinks />
      </div>
    </main>
  );
}
