import Link from "next/link";
import { AuthLogo } from "./logo";
import { SupportLink } from "./support-link";
import { LoginForm } from "./login-form";
import { SocialLogin } from "./google-button";
import { FooterLinks } from "./footer-links";
import { AuthHero } from "./auth-hero";

interface AuthLayoutProps {
  redirectTo: string;
  error?: string;
}

export function AuthLayout({ redirectTo, error }: AuthLayoutProps) {
  return (
    <main className="text-ink-black grid min-h-screen grid-cols-1 overflow-x-hidden bg-[#FAF8F4] font-sans antialiased lg:grid-cols-2">
      {/* Left Panel: Scrollable Authentication Form Area (Scrollbar Hidden) */}
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
                Welcome Back
              </h2>
              <p className="font-graphik mt-1.5 text-xs text-[#73736E] sm:text-sm">
                Enter your credentials to access your enterprise dashboard.
              </p>
            </div>

            {/* Error Query Banner */}
            {error && (
              <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700">
                <p className="font-semibold">Authentication Notice</p>
                <p className="mt-0.5 opacity-90">{error}</p>
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

            {/* Signup Link */}
            <p className="font-graphik mt-6 text-center text-xs text-[#73736E] sm:text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-black transition-colors hover:underline"
              >
                Sign up here
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
