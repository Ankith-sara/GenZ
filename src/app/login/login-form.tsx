"use client";

import { useState } from "react";
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Label } from "@/components/ui/atoms/label";
import {
  verifyPasswordAndSendOtp,
  verifyOtpLogin,
  directPasswordLogin,
} from "./actions";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  redirectTo: string;
  disableOtp?: boolean;
}

export function LoginForm({ redirectTo, disableOtp = true }: LoginFormProps) {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Touch tracking for real-time validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailError = touched.email
    ? !email.trim()
      ? "Email address is required."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? "Please enter a valid email address (e.g. user@example.com)."
        : null
    : null;

  const passwordError = touched.password
    ? !password
      ? "Password is required."
      : password.length < 6
        ? "Password must be at least 6 characters."
        : null
    : null;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (emailError || passwordError || !email || !password) {
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      if (disableOtp) {
        const res = await directPasswordLogin(email, password);
        if (res.error) {
          setError(res.error);
          setIsPending(false);
        } else {
          window.location.href = redirectTo;
        }
      } else {
        const res = await verifyPasswordAndSendOtp(email, password);
        if (res.error) {
          setError(res.error);
          setIsPending(false);
        } else {
          setStep("otp");
          setIsPending(false);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
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
        setIsPending(false);
      } else {
        // Successfully verified! Redirect instantly
        window.location.href = redirectTo;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsPending(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="animate-fade-in text-left">
        <div className="mb-6">
          <h3 className="mb-1.5 font-serif text-xl font-normal text-black">
            Enter Verification Code
          </h3>
          <p className="text-smoke text-xs leading-relaxed">
            We have sent a 6-digit security code to{" "}
            <strong className="font-mono font-semibold text-black">{email}</strong>.
            Please enter it below to complete your login.
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
            className="border-ash h-12 rounded-none text-center font-mono text-lg tracking-widest focus-visible:ring-black"
          />
        </div>

        {error && (
          <p role="alert" className="text-destructive mt-2 mb-4 text-xs font-semibold">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="submit"
            className="h-11 w-full rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
            disabled={isPending}
          >
            {isPending ? "Verifying..." : "Verify & Sign In"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("credentials")}
            className="text-smoke text-center text-xs hover:text-black hover:underline"
            disabled={isPending}
          >
            Back to credentials
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
          onChange={(e) => {
            setEmail(e.target.value);
            if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
          }}
          onBlur={() => handleBlur("email")}
          required
          className={`border-ash rounded-none focus-visible:ring-black ${
            emailError ? "border-red-500 ring-1 ring-red-500" : ""
          }`}
        />
        {emailError && (
          <p className="animate-fade-in mt-1 text-xs font-medium text-red-600">
            {emailError}
          </p>
        )}
      </div>

      <div className="relative mb-2">
        <div className="mb-1 flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-neutral-600 hover:text-black hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (!touched.password)
                setTouched((prev) => ({ ...prev, password: true }));
            }}
            onBlur={() => handleBlur("password")}
            required
            className={`border-ash rounded-none pr-10 focus-visible:ring-black ${
              passwordError ? "border-red-500 ring-1 ring-red-500" : ""
            }`}
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
        {passwordError && (
          <p className="animate-fade-in mt-1 text-xs font-medium text-red-600">
            {passwordError}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-destructive mt-2 mb-4 text-xs font-semibold">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="mt-6 h-11 w-full rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
        disabled={isPending || !!emailError || !!passwordError}
      >
        {isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
