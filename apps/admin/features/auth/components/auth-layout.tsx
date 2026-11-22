"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HelpCircle, Shield, ShieldAlert } from "lucide-react";
import { GoogleAuthButton } from "@genz/ui";
import { createClient } from "@genz/database";
import { LoginForm } from "./login-form";
import { AuthHero } from "./auth-hero";

interface AuthLayoutProps {
  redirectTo: string;
  error?: string;
}

function AuthLogo() {
  return (
    <Link
      href="/dashboard"
      className="group inline-flex items-center gap-3 transition-opacity hover:opacity-90"
    >
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#E5E5E0] bg-white p-1.5 shadow-2xs">
        <Image
          src="/logo.png"
          alt="GenZ Logo"
          width={28}
          height={28}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-graphik text-ink-black text-lg font-bold tracking-tight uppercase">
            Gen<span className="text-[#C89D32]">Z</span>
          </span>
          <span className="rounded-md border border-[#E5E5E0] bg-[#F4F4F0] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#52524E] uppercase">
            Admin
          </span>
        </div>
        <span className="font-graphik text-[10px] font-medium text-[#73736E]">
          Command Console
        </span>
      </div>
    </Link>
  );
}

function SupportLink() {
  return (
    <div className="flex items-center text-xs text-[#73736E]">
      <a
        href="mailto:support@genz.in?subject=Admin%20Console%20Access%20Assistance"
        className="inline-flex items-center gap-1.5 font-medium text-[#52524E] transition-colors hover:text-black hover:underline"
      >
        <HelpCircle className="h-4 w-4 text-[#73736E]" />
        <span>Operations Helpdesk</span>
      </a>
    </div>
  );
}

function FooterLinks() {
  return (
    <footer className="font-graphik flex flex-col gap-2 border-t border-[#E5E5E0]/70 pt-6 text-[11px] text-[#73736E] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 text-[#8C8C85]" />
        <span>Confidential & Proprietary · GenZ Platform Ops</span>
      </div>
      <span className="text-[#8C8C85]">Restricted to Authorized Personnel</span>
    </footer>
  );
}

function SocialLogin({ redirectTo = "" }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const nextQuery = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${nextQuery}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <GoogleAuthButton
        onClick={handleGoogleLogin}
        loading={loading}
        loadingText="Connecting to Google Workspace..."
        text="Sign in with Google Workspace"
      />
      {error && (
        <p role="alert" className="mt-2 text-center text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
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
                Enter your authorized administrator credentials to manage platform
                operations, seller verifications, and marketplace governance.
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
                <span className="bg-white px-3 text-[#73736E]">
                  Or authenticate via
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <SocialLogin redirectTo={redirectTo} />

            {/* Internal Access Notice */}
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
