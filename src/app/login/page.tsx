import Link from "next/link";
import Image from "next/image";
import { LoginMethodTabs } from "./auth-method-tabs";
import { GoogleSignInButton } from "@/components/google-signin";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="min-h-screen bg-cream-paper grid grid-cols-1 lg:grid-cols-12 font-sans antialiased text-ink-black">
      
      {/* Left side: Auth Form */}
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
            <h2 className="text-3xl font-nantes text-ink-black font-normal mb-2">Welcome back.</h2>
            <p className="text-sm font-graphik text-charcoal mb-8">
              Sign in to your buyer or administrator account.
            </p>

            <div className="bg-pure-white p-6 sm:p-8 border border-ash rounded-none shadow-none">
              <LoginMethodTabs redirectTo={redirectTo ?? "/dashboard"} />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-ash" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-pure-white px-2 text-smoke">Or continue with</span>
                </div>
              </div>

              <GoogleSignInButton redirectTo={redirectTo ?? "/dashboard"} />
              
              <div className="mt-6 border-t border-ash pt-4 text-center">
                <Link
                  href="/login/manufacturer"
                  className="text-xs font-graphik font-semibold text-primary hover:text-black transition-colors uppercase tracking-wider"
                >
                  Are you a manufacturer? Access Portal
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-sm font-graphik text-charcoal">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-black hover:underline">
                Sign up as a Buyer
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
          src="/indian_craftsman.png"
          alt="GenZ Sourcing Community"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

        {/* Brand visual text overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-16 z-20">
          <div className="text-white/60 font-graphik text-xs uppercase tracking-[0.3em]">GenZ Marketplace</div>
          <div className="max-w-xl">
            <p className="font-nantes text-4xl italic text-white leading-tight mb-6">
              &quot;Trading imported guesswork for factory-validated trust.&quot;
            </p>
            <p className="text-white/80 font-graphik text-sm leading-relaxed">
              We connect Indian consumers directly with verified Indian manufacturers. Real-time factory reels, direct pricing, and regional capabilities.
            </p>
          </div>
          <div className="text-white/40 font-graphik text-xs">© 2026 GenZ. All rights reserved.</div>
        </div>
      </div>

    </main>
  );
}
