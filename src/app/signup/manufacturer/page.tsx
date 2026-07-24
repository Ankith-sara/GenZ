import Link from "next/link";
import Image from "next/image";
import { ManufacturerSignupForm } from "./signup-form";

export default function ManufacturerSignupPage() {
  return (
    <main className="bg-cream-paper text-ink-black flex min-h-screen flex-col items-center justify-between px-6 py-12 font-sans antialiased sm:px-12 md:px-16">
      <div className="flex w-full max-w-md flex-1 flex-col justify-between md:max-w-2xl lg:max-w-4xl">
        <div>
          {/* Header Link */}
          <Link href="/" className="mb-12 inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="GenZ Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-graphik text-ink-black text-xl tracking-tight uppercase">
              GenZ
            </span>
          </Link>

          {/* Form Content Block */}
          <div className="w-full">
            <span className="text-primary font-graphik mb-2 block text-xs font-semibold tracking-[0.2em] uppercase">
              Manufacturer Registration
            </span>
            <h2 className="font-nantes text-ink-black mb-2 text-3xl font-normal">
              Register your Business.
            </h2>
            <p className="font-graphik text-charcoal mb-8 text-sm">
              Join GenZ to connect with customers, list products, and showcase your
              manufacturing capabilities.
            </p>

            <div className="bg-pure-white border-ash rounded-none border p-6 shadow-none sm:p-8">
              <ManufacturerSignupForm />

              <div className="border-ash mt-6 border-t pt-4 text-center">
                <Link
                  href="/signup"
                  className="font-graphik text-primary text-xs font-semibold tracking-wider uppercase transition-colors hover:text-black"
                >
                  Looking to source products? Sign up here
                </Link>
              </div>
            </div>

            <p className="font-graphik text-charcoal mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login/manufacturer"
                className="font-semibold text-black hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="font-graphik text-smoke mt-12 flex justify-center gap-4 text-xs">
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
