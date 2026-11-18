import Link from "next/link";
import Image from "next/image";
import { SITE_URL } from "@genz/utils";
import { COMPANY } from "@genz/utils/company";
import { LoginForm } from "./login-form";
import { AuthHero } from "./auth-hero";
import { AlertCircle, ArrowUpRight, HelpCircle } from "lucide-react";

interface AuthLayoutProps {
  redirectTo: string;
  error?: string;
}

// Same safety-tape motif as the hero, shown on mobile where the hero is hidden
const HAZARD_TAPE =
  "bg-[repeating-linear-gradient(135deg,#f59e0b_0_10px,transparent_10px_20px)]";

function AuthLogo() {
  return (
    <Link
      href="/dashboard"
      className="group inline-flex items-center gap-3 transition-opacity hover:opacity-90"
    >
      <div className="border-border bg-card relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border p-1.5 shadow-2xs">
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
          <span className="text-foreground text-lg font-extrabold tracking-tight uppercase">
            Gen<span className="text-amber-500">Z</span>
          </span>
          <span className="border-foreground/40 text-foreground rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase">
            Seller
          </span>
        </div>
        <span className="text-muted-foreground text-xs font-medium">
          Supplier & Manufacturer Portal
        </span>
      </div>
    </Link>
  );
}

function SupportLink() {
  return (
    <a
      href={`mailto:${COMPANY.supportEmail}?subject=Seller%20Desk%20Support`}
      className="border-foreground/30 text-foreground hover:border-foreground/60 hover:bg-muted/50 inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:outline-none"
    >
      <HelpCircle className="h-4 w-4" aria-hidden="true" />
      <span>
        <span className="hidden sm:inline">Seller </span>Helpdesk
      </span>
    </a>
  );
}

// Policy pages live on the web storefront (SITE_URL = NEXT_PUBLIC_WEB_URL).
const SELLER_LEGAL_LINKS = [
  { label: "Terms", path: "/terms" },
  { label: "Grievance Officer", path: "/grievance" },
];

function FooterLinks() {
  return (
    <footer className="border-border text-muted-foreground flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
      <span>GenZ Partner Network</span>
      <div className="flex flex-wrap items-center gap-4">
        {SELLER_LEGAL_LINKS.map((link) => (
          <a
            key={link.path}
            href={`${SITE_URL}${link.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors hover:underline"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}

export function AuthLayout({ redirectTo, error }: AuthLayoutProps) {
  return (
    <main className="bg-background text-foreground min-h-dvh font-sans antialiased">
      {/* Left: form column. Takes the left half on desktop; the page scrolls under the fixed hero. */}
      <div className="flex min-h-dvh flex-col lg:w-1/2">
        <div aria-hidden="true" className={`h-2 lg:hidden ${HAZARD_TAPE}`} />

        <div className="flex flex-1 flex-col p-6 sm:p-10 lg:p-12">
          <header className="mx-auto flex w-full max-w-[440px] items-center justify-between gap-4">
            <AuthLogo />
            <SupportLink />
          </header>

          <div className="my-auto py-8">
            <div className="mx-auto w-full max-w-[440px]">
              <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
                Seller Desk Sign In
              </h1>
              <p className="text-muted-foreground mt-3 text-base leading-relaxed">
                Manage listings, fulfill orders, and scale production.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">
                      {error === "forbidden_seller_only"
                        ? "Seller Account Required"
                        : "Authentication Notice"}
                    </p>
                    <p className="mt-1 leading-relaxed">
                      {error === "forbidden_seller_only" ? (
                        <>
                          This portal is reserved for registered sellers and manufacturing
                          units. If you are looking to purchase or source products as a
                          buyer, please visit the{" "}
                          <a href={SITE_URL} className="font-semibold underline underline-offset-2">
                            Buyer Storefront
                          </a>
                          .
                        </>
                      ) : (
                        error
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <LoginForm redirectTo={redirectTo} />
              </div>

              <p className="border-border text-muted-foreground mt-8 border-t pt-6 text-sm">
                Want to sell on GenZ?{" "}
                <a
                  href={`${SITE_URL}/seller/signup`}
                  className="text-foreground inline-flex items-center gap-0.5 font-semibold underline decoration-amber-500 decoration-2 underline-offset-4"
                >
                  <span>Apply on Marketplace</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[440px]">
            <FooterLinks />
          </div>
        </div>
      </div>

      {/* Right: hero is fixed to the viewport and never scrolls. */}
      <div className="fixed inset-y-0 right-0 hidden w-1/2 lg:block">
        <AuthHero />
      </div>
    </main>
  );
}