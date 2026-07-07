import Link from "next/link";
import { ManufacturerSignupForm } from "./signup-form";

export default function ManufacturerSignupPage() {
  return (
    <main className="min-h-screen bg-forest-green flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-6">
          <div className="w-10 h-10 bg-gold-yellow flex items-center justify-center text-forest-green font-black text-2xl rounded-[4px] shadow-md group-hover:scale-105 transition-transform duration-300">
            Z
          </div>
          <span className="text-xl font-bold tracking-tight text-white">GenZ</span>
        </Link>
        <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-2 block">
          Manufacturer Registration Portal
        </span>
        <h2 className="text-3xl font-serif text-white font-normal px-4">Register your Business.</h2>
        <p className="mt-2 text-sm text-white/70 max-w-md mx-auto px-4">
          Join GenZ to connect with buyers, list products, and showcase your manufacturing capabilities.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10 border border-white/10">
          <ManufacturerSignupForm />

          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <Link
              href="/signup"
              className="text-xs font-semibold text-forest-green hover:text-gold-yellow transition-colors"
            >
              Looking to source products? Sign up as a Buyer
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link href="/login/manufacturer" className="font-semibold text-gold-yellow hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
