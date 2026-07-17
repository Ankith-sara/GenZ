import Link from "next/link";
import Image from "next/image";
import { SignupForm } from "./signup-form";
import { GoogleSignInButton } from "@/components/google-signin";

export default async function SignupPage({
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
            <h2 className="font-nantes text-ink-black mb-2 text-3xl font-normal">
              Create your buyer account.
            </h2>
            <p className="font-graphik text-charcoal mb-8 text-sm">
              Discover and buy trusted, high-quality Indian products directly from the
              makers.
            </p>

            <div className="bg-pure-white border-ash rounded-none border p-6 shadow-none sm:p-8">
              <SignupForm defaultRole="buyer" />

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

              <GoogleSignInButton
                redirectTo={redirectTo ?? "/dashboard"}
                text="Sign up with Google"
              />

              <div className="border-ash mt-6 border-t pt-4 text-center">
                <Link
                  href="/signup/manufacturer"
                  className="font-graphik text-primary text-xs font-semibold tracking-wider uppercase transition-colors hover:text-black"
                >
                  Are you a manufacturer? Register business
                </Link>
              </div>
            </div>

            <p className="font-graphik text-charcoal mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-black hover:underline">
                Sign in
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
        <Image
          src="/female_worker.png"
          alt="GenZ Sourcing Community"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Brand visual text overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-16">
          <div className="font-graphik text-xs tracking-[0.3em] text-white/60 uppercase">
            GenZ Buyers
          </div>
          <div className="max-w-xl">
            <p className="font-nantes mb-6 text-4xl leading-tight text-white italic">
              &quot;Discover and buy trusted, high-quality Indian products directly from
              the makers.&quot;
            </p>
            <p className="font-graphik text-sm leading-relaxed text-white/80">
              Gain transparent pricing, direct communication with factories, and peace
              of mind with 100% verified GST and physical inspection checks.
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
