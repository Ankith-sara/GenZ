import Link from "next/link";
import Image from "next/image";
import { ManufacturerSignupForm } from "./signup-form";

export default function ManufacturerSignupPage() {
  return (
    <main className="min-h-screen bg-cream-paper grid grid-cols-1 lg:grid-cols-12 font-sans antialiased text-ink-black">
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-cream-paper min-h-screen">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <Image
              src="/logo.jpeg"
              alt="GenZ Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-graphik text-xl tracking-tight text-ink-black uppercase">GenZ</span>
          </Link>

          <div className="max-w-md mx-auto lg:mx-0">
            <span className="text-primary text-xs font-graphik font-semibold tracking-[0.2em] uppercase mb-2 block">
              Manufacturer Registration
            </span>
            <h2 className="text-3xl font-nantes text-ink-black font-normal mb-2">Register your Business.</h2>
            <p className="text-sm font-graphik text-charcoal mb-8">
              Join GenZ to connect with buyers, list products, and showcase your manufacturing capabilities.
            </p>

            <div className="bg-pure-white p-6 sm:p-8 border border-ash rounded-none shadow-none">
              <ManufacturerSignupForm />

              <div className="mt-6 border-t border-ash pt-4 text-center">
                <Link
                  href="/signup"
                  className="text-xs font-graphik font-semibold text-primary hover:text-black transition-colors uppercase tracking-wider"
                >
                  Looking to source products? Sign up as a Buyer
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-sm font-graphik text-charcoal">
              Already have an account?{" "}
              <Link href="/login/manufacturer" className="font-semibold text-black hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 text-xs font-graphik text-smoke flex gap-4 justify-center lg:justify-start">
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
      </div>

      {/* Right side: Visual Panel */}
      <div className="lg:col-span-7 relative hidden lg:block overflow-hidden bg-charcoal">
        <Image
          src="/manufacturers.jpeg"
          alt="GenZ Manufacturer Community"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

        {/* Brand visual text overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-16 z-20">
          <div className="text-white/60 font-graphik text-xs uppercase tracking-[0.3em]">GenZ Partners</div>
          <div className="max-w-xl">
            <p className="font-nantes text-4xl italic text-white leading-tight mb-6">
              &quot;Visibility, demand insights, and a direct line to regional and national buyers.&quot;
            </p>
            <p className="text-white/80 font-graphik text-sm leading-relaxed">
              We provide you with digital tooling, logistics integrations, and verified buyer leads to expand your reach beyond geographic boundaries.
            </p>
          </div>
          <div className="text-white/40 font-graphik text-xs">© 2026 GenZ. All rights reserved.</div>
        </div>
      </div>

    </main>
  );
}
