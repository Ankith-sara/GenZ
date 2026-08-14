"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@genz/ui";
import { Input } from "@genz/ui";
import { Label } from "@genz/ui";
import { sendPasswordReset, resetPasswordWithOtp } from "@/app/login/actions";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSendResetCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await sendPasswordReset(email);
      if (res.error) {
        setError(res.error);
      } else {
        setStep("verify");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleVerifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await resetPasswordWithOtp({
        email,
        token: otpCode,
        password: newPassword,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="bg-cream-paper text-ink-black flex min-h-screen flex-col justify-between p-6 font-sans antialiased sm:p-10">
      {/* Top Header Logo */}
      <div className="flex justify-center sm:justify-start">
        <Link href="/" className="inline-flex items-center gap-3">
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
      </div>

      {/* Main Centered Form Card */}
      <div className="mx-auto my-auto w-full max-w-md py-8">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="font-nantes text-ink-black mb-2 text-3xl font-normal">
            Reset your password.
          </h1>
          <p className="font-graphik text-charcoal text-sm">
            {step === "request"
              ? "Enter your email address to receive a 6-digit verification code."
              : `Enter the 6-digit code sent to ${email} and your new password.`}
          </p>
        </div>

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
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-serif text-xl font-normal text-black">
                Password Reset Complete!
              </h3>
              <p className="text-smoke mb-6 text-xs leading-relaxed">
                Your password has been updated successfully. Redirecting to login...
              </p>
              <Button
                asChild
                className="h-11 w-full rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
              >
                <Link href="/login">Sign In Now</Link>
              </Button>
            </div>
          ) : step === "request" ? (
            <form onSubmit={handleSendResetCode} noValidate>
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
                {isPending ? "Sending Code..." : "Send Verification Code"}
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
          ) : (
            <form onSubmit={handleVerifyAndReset} noValidate>
              <div className="mb-4">
                <Label htmlFor="otpCode">6-Digit Code</Label>
                <Input
                  id="otpCode"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  placeholder="e.g. 434364"
                  className="border-ash rounded-none text-center font-mono text-lg tracking-widest focus-visible:ring-black"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="At least 8 characters"
                    className="border-ash rounded-none pr-10 focus-visible:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-smoke absolute top-1/2 right-3 -translate-y-1/2 hover:text-black focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
                {isPending ? "Resetting Password..." : "Update Password"}
              </Button>

              <div className="border-ash/40 mt-6 flex justify-between border-t pt-4 text-xs">
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="font-graphik text-smoke hover:text-black hover:underline"
                >
                  Resend Code
                </button>
                <Link
                  href="/login"
                  className="font-graphik text-smoke hover:text-black hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="font-graphik text-smoke flex justify-center gap-4 text-xs">
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </div>
    </main>
  );
}
