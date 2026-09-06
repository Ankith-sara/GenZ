import { AuthLogo } from "./logo";
import { SupportLink } from "./support-link";
import { LoginForm } from "./login-form";
import { SocialLogin } from "./google-button";
import { FooterLinks } from "./footer-links";
import { AuthHero } from "./auth-hero";
import { ShieldAlert } from "lucide-react";

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
            {/* Header Badge & Title */}
            <div className="mb-6 text-left">
              <span className="font-mono text-[10px] font-bold tracking-widest text-[#8C8C85] uppercase">
                Restricted Portal
              </span>
              <h2 className="font-graphik text-ink-black mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Admin Authentication
              </h2>
              <p className="font-graphik mt-2 text-xs leading-relaxed text-[#73736E] sm:text-sm">
                Enter your authorized administrator credentials to manage platform operations, seller verifications, and marketplace governance.
              </p>
            </div>

            {/* Error Query Banner */}
            {error && (
              <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50/90 p-4 text-xs text-red-800">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <div>
                    <p className="font-semibold">
                      {error === "forbidden_admin_only"
                        ? "Administrative Clearance Required"
                        : "Authentication Notice"}
                    </p>
                    <p className="mt-1 leading-relaxed text-red-700">
                      {error === "forbidden_admin_only"
                        ? "Your account does not have administrator privileges for the Command Console. Only registered GenZ operations and admin staff can access this portal."
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
                <span className="bg-white px-3 text-[#73736E]">Or authenticate via</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <SocialLogin redirectTo={redirectTo} />

            {/* Internal Access Notice (Replaces Bogus Consumer Signup Link) */}
            <div className="mt-6 rounded-xl border border-[#EBEBE6] bg-[#FAF8F4] p-3.5 text-center">
              <p className="font-graphik text-xs text-[#73736E]">
                Restricted System · Need admin credentials?{" "}
                <a
                  href="mailto:security@genz.in?subject=Admin%20Console%20Access%20Request"
                  className="font-semibold text-black transition-colors hover:underline"
                >
                  Contact Platform Ops
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
