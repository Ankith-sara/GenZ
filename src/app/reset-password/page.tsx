"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/app/login/actions";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const res = await updatePassword(password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2500);
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
            Set new password.
          </h1>
          <p className="font-graphik text-charcoal text-sm">
            Please enter and confirm your new password below.
          </p>
        </div>

        <div className="bg-pure-white border-ash rounded-none border p-6 shadow-none sm:p-8">
          {success ? (
            <div className="py-4 text-left">
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
                Password Updated!
              </h3>
              <p className="text-smoke text-xs leading-relaxed">
                Your password has been successfully reset. Redirecting you to the sign
                in page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="mb-4">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className="border-ash rounded-none pr-10 focus-visible:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="text-smoke absolute top-1/2 right-3 -translate-y-1/2 hover:text-black focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
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
                {isPending ? "Updating Password..." : "Update Password"}
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
