import Link from "next/link";
import { AuthLogo } from "@/features/auth/components/logo";
import { SupportLink } from "@/features/auth/components/support-link";
import { SignupForm } from "./signup-form";
import { SocialLogin } from "@/features/auth/components/google-button";
import { FooterLinks } from "@/features/auth/components/footer-links";
import { AuthHero } from "@/features/auth/components/auth-hero";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="text-ink-black grid min-h-screen grid-cols-1 overflow-x-hidden bg-[#FAF8F4] font-sans antialiased lg:grid-cols-2">
      {/* Left Panel: Scrollable Registration Form Area */}
      <div className="flex h-screen [scrollbar-width:none] flex-col justify-between overflow-y-auto bg-[#FAF8F4] p-6 [-ms-overflow-style:none] sm:p-10 lg:p-12 [&::-webkit-scrollbar]:hidden">
        {/* Top Header Bar (Constrained Width) */}
        <header className="mx-auto flex w-full max-w-[460px] items-center justify-between">
          <AuthLogo />
          <SupportLink />
        </header>

        {/* Form Container Card Box */}
        <div className="my-auto py-8">
          <div className="mx-auto w-full max-w-[460px] rounded-[16px] border border-[#E5E5E0] bg-white p-7 shadow-xs sm:p-9">
            {/* Title & Description */}
            <div className="mb-6 text-left">
              <h2 className="font-graphik text-ink-black text-2xl font-bold tracking-tight sm:text-3xl">
                Create Account
              </h2>
              <p className="font-graphik mt-1.5 text-xs text-[#73736E] sm:text-sm">
                Join GenZ to connect directly with verified Indian manufacturers.
              </p>
            </div>

            {/* Registration Form */}
            <SignupForm defaultRole="buyer" />

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
            <SocialLogin redirectTo={redirectTo ?? "/dashboard"} />

            {/* Seller Link */}
            <div className="mt-6 text-center">
              <Link
                href="/seller/signup"
                className="font-graphik text-xs font-semibold tracking-wider text-black uppercase transition-colors hover:underline"
              >
                Are you a seller? Register business
              </Link>
            </div>

            {/* Sign In Link */}
            <p className="font-graphik mt-6 text-center text-xs text-[#73736E] sm:text-sm">
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

        {/* Bottom Footer (Constrained Width) */}
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
