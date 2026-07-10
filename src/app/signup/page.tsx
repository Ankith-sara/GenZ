import Link from "next/link";
import { SignupForm } from "./signup-form";
import { GoogleSignInButton } from "@/components/google-signin";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="min-h-screen bg-forest-green flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-6">
          <div className="w-10 h-10 bg-gold-yellow flex items-center justify-center text-forest-green font-normal text-2xl rounded-[4px]  group- transition-transform duration-300">
            Z
          </div>
          <span className="text-xl font-medium tracking-tight text-white">GenZ</span>
        </Link>
        <h2 className="text-3xl font-serif text-white font-normal">Create your buyer account.</h2>
        <p className="mt-2 text-sm text-white/70">
          Discover and buy trusted, high-quality Indian products directly from the makers.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-paper-white py-8 px-6 rounded-2xl sm:px-10 border border-black/5">
          {/* We force buyer role for this signup page */}
          <SignupForm defaultRole="buyer" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-paper-white px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton redirectTo={redirectTo ?? "/dashboard"} text="Sign up with Google" />
          
          <div className="mt-6 border-t border-black/10 pt-4 text-center">
            <Link
              href="/signup/manufacturer"
              className="text-xs font-semibold text-forest-green hover:text-gold-yellow transition-colors"
            >
              Are you a manufacturer? Register your business
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold-yellow hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
