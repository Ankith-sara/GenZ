import Link from "next/link";
import Image from "next/image";
import { LoginMethodTabs } from "../auth-method-tabs";
import { GoogleSignInButton } from "@/components/google-signin";

export default async function ManufacturerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="bg-cream-paper text-ink-black grid min-h-screen grid-cols-1 font-sans antialiased lg:grid-cols-12">
      {/* Left side: Auth Form */}
      <div className="bg-cream-paper flex min-h-screen flex-col justify-between p-8 sm:p-12 md:p-16 lg:col-span-5">
        <div>
          <Link href="/" className="mb-12 inline-flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="GenZ Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-graphik text-ink-black text-xl tracking-tight uppercase">
              GenZ
            </span>
          </Link>

          <div className="mx-auto max-w-md lg:mx-0">
            <span className="text-primary font-graphik mb-2 block text-xs font-semibold tracking-[0.2em] uppercase">
              Manufacturer Portal
            </span>
            <h2 className="font-nantes text-ink-black mb-2 text-3xl font-normal">
              Welcome back, Maker.
            </h2>
            <p className="font-graphik text-charcoal mb-8 text-sm">
              Sign in to manage your factory, list products, and respond to inquiries.
            </p>

            <div className="bg-pure-white border-ash rounded-none border p-6 shadow-none sm:p-8">
              <LoginMethodTabs redirectTo={redirectTo ?? "/dashboard"} />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="border-ash w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-pure-white text-smoke px-2">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleSignInButton redirectTo={redirectTo ?? "/dashboard"} />

              <div className="border-ash mt-6 border-t pt-4 text-center">
                <Link
                  href="/login"
                  className="font-graphik text-primary text-xs font-semibold tracking-wider uppercase transition-colors hover:text-black"
                >
                  Looking for products? Sign in as a Buyer →
                </Link>
              </div>
            </div>

            <p className="font-graphik text-charcoal mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup/manufacturer"
                className="font-semibold text-black hover:underline"
              >
                Register your business
              </Link>
            </p>
          </div>
        </div>

        <div className="font-graphik text-smoke mt-12 flex justify-center gap-4 text-xs lg:justify-start">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* Right side: Visual Panel */}
      <div className="bg-charcoal relative hidden overflow-hidden lg:col-span-7 lg:block">
        {/* Machine Work Background */}
        <Image
          src="/machine_work.png"
          alt="GenZ Manufacturer Studio"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Brand visual text overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-16">
          <div className="font-graphik text-xs tracking-[0.3em] text-white/60 uppercase">
            GenZ Maker Network
          </div>
          <div className="max-w-xl">
            <p className="font-nantes mb-6 text-4xl leading-tight text-white italic">
              &quot;Showcase your craftsmanship to national buyers. Connect directly,
              negotiate freely.&quot;
            </p>
            <p className="font-graphik text-sm leading-relaxed text-white/80">
              We empower Indian manufacturers to digitize their capabilities, get direct
              visibility, and eliminate distributors to secure better margins.
            </p>
          </div>
          <div className="font-graphik text-xs text-white/40">
            © 2026 GenZ. All rights reserved.
          </div>
        </div>
      </div>
    </main>
  );
}
