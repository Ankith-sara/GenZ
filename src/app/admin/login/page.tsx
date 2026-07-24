import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/app/login/login-form";
import { GoogleSignInButton } from "@/components/google-signin";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="bg-cream-paper text-ink-black flex min-h-screen flex-col justify-center px-6 py-12 font-sans antialiased sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-md">
        {/* Header Block */}
        <div className="mb-8 text-center">
          <Link href="/" className="group mb-4 inline-flex items-center gap-3">
            <div className="border-ash/30 relative h-10 w-10 overflow-hidden rounded-md border">
              <Image
                src="/logo.png"
                alt="GenZ Logo"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <span className="font-graphik text-ink-black text-2xl font-normal tracking-[0.12em] uppercase">
              Gen<span className="text-brand-yellow">Z</span>
            </span>
          </Link>

          <div>
            <span className="text-brand-yellow font-graphik mb-3 inline-block rounded-none bg-black px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
              Control Center
            </span>
          </div>

          <h1 className="text-ink-black font-serif text-3xl font-normal tracking-tight">
            Administrator Sign In
          </h1>
          <p className="text-smoke font-graphik mt-2 text-sm">
            Sign in to access the platform control center &amp; management panel.
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-pure-white border-ash rounded-none border p-6 shadow-sm sm:p-8">
          <LoginForm redirectTo={redirectTo ?? "/admin/dashboard"} />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="border-ash/30 w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-pure-white text-smoke font-graphik px-3">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleSignInButton redirectTo="/admin/dashboard?role=admin" />
        </div>

        {/* Footer info */}
        <p className="text-smoke font-graphik mt-6 text-center text-sm">
          Need an admin account?{" "}
          <Link
            href="/admin/signup"
            className="text-ink-black font-semibold hover:underline"
          >
            Register Admin
          </Link>
        </p>

        <div className="font-graphik text-smoke mt-8 flex justify-center gap-4 text-xs">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
