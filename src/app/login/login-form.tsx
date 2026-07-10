"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyPasswordAndSendOtp, verifyOtpLogin } from "./actions";
import Link from "next/link";

interface LoginFormProps {
  redirectTo: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await verifyPasswordAndSendOtp(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        setStep("otp");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await verifyOtpLogin(email, otpToken);
      if (res.error) {
        setError(res.error);
      } else {
        // Successfully verified! Redirect
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="text-left animate-fade-in">
        <div className="mb-6">
          <h3 className="font-serif text-xl text-forest-green mb-1.5 font-normal">Enter Verification Code</h3>
          <p className="text-xs text-smoke leading-relaxed">
            We have sent a 6-digit security code to <strong className="text-forest-green font-mono">{email}</strong>. Please enter it below to complete your login.
          </p>
        </div>

        <div className="mb-4">
          <Label htmlFor="otp">6-Digit Code</Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="e.g. 123456"
            value={otpToken}
            onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
            required
            className="border-black/10 focus-visible:ring-forest-green font-mono tracking-widest text-center text-lg h-12"
          />
        </div>

        {error && (
          <p role="alert" className="text-destructive mt-2 mb-4 text-xs font-semibold">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <Button type="submit" className="w-full bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] font-medium uppercase tracking-wider h-11" disabled={isPending}>
            {isPending ? "Verifying..." : "Verify & Sign In"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("credentials")}
            className="text-xs text-smoke hover:text-forest-green text-center hover:underline"
            disabled={isPending}
          >
            ← Back to credentials
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="text-left">
      <div className="mb-4">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-black/10 focus-visible:ring-forest-green"
        />
      </div>

      <div className="mb-2 relative">
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-forest-green hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border-black/10 focus-visible:ring-forest-green"
        />
      </div>

      {error && (
        <p role="alert" className="text-destructive mt-2 mb-4 text-xs font-semibold">
          {error}
        </p>
      )}

      <Button type="submit" className="mt-6 w-full bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] font-medium uppercase tracking-wider h-11" disabled={isPending}>
        {isPending ? "Sending OTP..." : "Sign In"}
      </Button>
    </form>
  );
}
