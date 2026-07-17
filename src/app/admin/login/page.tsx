import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";
import { GoogleSignInButton } from "@/components/google-signin";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="bg-brand-yellow relative flex min-h-screen flex-col justify-center overflow-hidden py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

      <div className="relative z-10 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="group mb-6 inline-flex items-center gap-2">
          <div className="bg-brand-yellow-dark text-brand-yellow flex h-10 w-10 items-center justify-center rounded-[4px] text-2xl font-normal transition-transform duration-300">
            Z
          </div>
          <span className="text-xl font-medium tracking-tight text-white">
            GenZ Admin
          </span>
        </Link>
        <h2 className="font-serif text-3xl font-normal text-white">Control Center.</h2>
        <p className="mt-2 text-sm text-white/70">
          Sign in to your administrator account.
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-paper-white rounded-[4px] border border-black/5 px-6 py-8 sm:px-10">
          <LoginForm redirectTo={redirectTo ?? "/admin/dashboard"} />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-paper-white px-2 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Admin Google sign-in will map to /admin/dashboard */}
          <GoogleSignInButton redirectTo="/admin/dashboard?role=admin" />
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          Need an admin account?{" "}
          <Link
            href="/admin/signup"
            className="text-brand-yellow-dark font-semibold hover:underline"
          >
            Register Admin
          </Link>
        </p>
      </div>
    </main>
  );
}
