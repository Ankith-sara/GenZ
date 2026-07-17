"use client";

import { useState } from "react";
import Link from "next/link";
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
    <main className="bg-brand-yellow relative flex min-h-screen flex-col justify-center overflow-hidden py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

      <div className="relative z-10 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="group mb-6 inline-flex items-center gap-2">
          <div className="bg-brand-yellow-dark text-brand-yellow flex h-10 w-10 items-center justify-center rounded-[4px] text-2xl font-normal transition-transform duration-300">
            Z
          </div>
          <span className="text-xl font-medium tracking-tight text-white">GenZ</span>
        </Link>
        <h2 className="font-serif text-3xl font-normal text-white">Reset Password.</h2>
        <p className="mt-2 text-sm text-white/70">
          Enter your email to receive a recovery link.
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-paper-white rounded-[4px] border border-black/5 px-6 py-8 sm:px-10">
          {success ? (
            <div className="py-4 text-center">
              <h3 className="text-brand-yellow mb-2 font-serif text-xl">
                Check your email
              </h3>
              <p className="text-smoke text-sm leading-relaxed">
                We have sent a password recovery link to{" "}
                <strong className="text-brand-yellow">{email}</strong>.
              </p>
              <Button
                asChild
                className="bg-brand-yellow hover:bg-brand-yellow/90 mt-6 h-11 w-full rounded-[4px] font-medium tracking-wider text-white uppercase"
              >
                <Link href="/login">Back to Login</Link>
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
                  className="focus-visible:ring-brand-yellow border-black/10"
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
                className="bg-brand-yellow hover:bg-brand-yellow/90 h-11 w-full rounded-[4px] font-medium tracking-wider text-white uppercase"
                disabled={isPending}
              >
                {isPending ? "Sending Link..." : "Send Reset Link"}
              </Button>

              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="text-smoke hover:text-brand-yellow text-xs hover:underline"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
