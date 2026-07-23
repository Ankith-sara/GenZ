"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordReset } from "@/app/login/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await sendPasswordReset(email);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="bg-cream-paper text-ink-black grid min-h-screen grid-cols-1 font-sans antialiased lg:grid-cols-12">
      {/* Left side: Form Panel */}
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
              Reset your password.
            </h2>
            <p className="font-graphik text-charcoal mb-8 text-sm">
              Enter your email address and we&apos;ll send you a link to reset your
              password.
            </p>

            <div className="bg-pure-white border-ash rounded-none border p-6 shadow-none sm:p-8">
              {success ? (
                <div className="py-2 text-left">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-normal text-black">
                    Check your email
                  </h3>
                  <p className="text-smoke mb-6 text-xs leading-relaxed">
                    We have sent a password recovery link to{" "}
                    <strong className="font-mono text-black">{email}</strong>. Please
                    check your inbox and follow the instructions.
                  </p>
                  <Button
                    asChild
                    className="h-11 w-full rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
                  >
                    <Link href="/login">Back to Sign In</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="border-ash rounded-none focus-visible:ring-black"
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="text-destructive mt-2 mb-4 text-xs font-semibold"
                    >
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="mt-4 h-11 w-full rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
                    disabled={isPending}
                  >
                    {isPending ? "Sending Link..." : "Send Reset Link"}
                  </Button>

                  <div className="border-ash/40 mt-6 border-t pt-4 text-center">
                    <Link
                      href="/login"
                      className="font-graphik text-smoke text-xs transition-colors hover:text-black hover:underline"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              )}
            </div>
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
          src="/indian_craftsman.png"
          alt="GenZ Sourcing Community"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Brand visual text overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-16">
          <div className="font-graphik text-xs tracking-[0.3em] text-white/60 uppercase">
            GenZ Account Recovery
          </div>
          <div className="max-w-xl">
            <p className="font-nantes mb-6 text-4xl leading-tight text-white italic">
              &quot;Secure, seamless account restoration for buyers and verified
              manufacturers.&quot;
            </p>
            <p className="font-graphik text-sm leading-relaxed text-white/80">
              Your account security is paramount. Resetting your password keeps your
              factory inquiries, saved items, and verified profile safe.
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
