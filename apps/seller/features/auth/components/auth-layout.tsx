import Link from "next/link";
import Image from "next/image";
import { SITE_URL } from "@genz/utils";
import { LoginForm } from "./login-form";
import { AuthHero } from "./auth-hero";
import {
  AlertCircle,
  Building2,
  HelpCircle,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

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
      <div className="border-border bg-card relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border p-1.5 shadow-2xs">
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
          <span className="text-foreground text-lg font-bold tracking-tight uppercase">
            Gen<span className="text-amber-500">Z</span>
          </span>
          <span className="border-border bg-muted/60 text-foreground rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase">
            Seller
          </span>
        </div>
        <span className="text-muted-foreground text-[11px] font-medium">
          Seller Desk Portal
        </span>
      </div>
    </Link>
  );
}

function SupportLink() {
  return (
    <div className="flex items-center text-xs">
      <a
        href="mailto:sellers@genz.in?subject=Seller%20Desk%20Support"
        className="border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-2xs transition-all active:scale-95"
      >
        <HelpCircle className="text-muted-foreground h-3.5 w-3.5" />
        <span>Seller Helpdesk</span>
      </a>
    </div>
  );
}

function FooterLinks() {
  return (
    <footer className="border-border/80 text-muted-foreground flex flex-col gap-2 border-t pt-6 text-[11px] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Building2 className="text-muted-foreground h-3.5 w-3.5" />
        <span>GenZ Partner Network · Seller Desk</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>256-bit SSL Secure</span>
        </span>
        <a
          href="mailto:sellers@genz.in"
          className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
        >
          Compliance & Support
        </a>
      </div>
    </footer>
  );
}

export function AuthLayout({ redirectTo, error }: AuthLayoutProps) {
  return (
    <main className="bg-background text-foreground grid min-h-screen grid-cols-1 overflow-x-hidden font-sans antialiased lg:grid-cols-2">
      {/* Left Panel: Scrollable Authentication Form Area */}
      <div className="flex h-screen [scrollbar-width:none] flex-col justify-between overflow-y-auto p-6 [-ms-overflow-style:none] sm:p-10 lg:p-12 [&::-webkit-scrollbar]:hidden">
        {/* Top Header Bar */}
        <header className="mx-auto flex w-full max-w-[460px] items-center justify-between">
          <AuthLogo />
          <SupportLink />
        </header>

        {/* Form Container Card Box */}
        <div className="my-auto py-8">
          <div className="border-border bg-card mx-auto w-full max-w-[460px] rounded-3xl border p-7 shadow-xs sm:p-9">
            {/* Title & Description */}
            <div className="mb-6 text-left">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                <span>Supplier & Manufacturer Portal</span>
              </div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Seller Desk Sign In
              </h2>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed sm:text-sm">
                Access your factory dashboard to manage catalog listings, fulfill buyer
                orders, and scale production.
              </p>
            </div>

            {/* Error Query Banner */}
            {error && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                  <div>
                    <p className="font-semibold">
                      {error === "forbidden_seller_only"
                        ? "Seller Account Required"
                        : "Authentication Notice"}
                    </p>
                    <p className="mt-1 leading-relaxed text-amber-800 dark:text-amber-300">
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

            {/* Seller Registration Notice */}
            <div className="border-border bg-muted/40 mt-6 rounded-2xl border p-3.5 text-center">
              <p className="text-muted-foreground text-xs">
                Want to sell on GenZ?{" "}
                <a
                  href={`${SITE_URL}/seller/signup`}
                  className="text-foreground inline-flex items-center gap-0.5 font-semibold hover:underline"
                >
                  <span>Apply on Marketplace</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
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
