"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  verifyPasswordAndSendOtp,
  verifyOtpLogin,
  directPasswordLogin,
} from "@/app/login/actions";

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
  const [isSuccess, setIsSuccess] = useState(false);

  // Real-time touch validation tracking
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
          setIsSuccess(true);
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 300);
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
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 300);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsPending(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="w-full text-left">
        <div className="mb-6">
          <h3 className="font-graphik mb-1 text-lg font-semibold text-black">
            Verification Code
          </h3>
          <p className="font-graphik text-xs text-[#73736E]">
            Enter the 6-digit code sent to{" "}
            <strong className="font-mono text-black">{email}</strong>
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="otp"
            className="font-graphik mb-1.5 block text-xs font-medium text-[#262626]"
          >
            Security Code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="• • • • • •"
            value={otpToken}
            onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
            required
            className="h-12 w-full rounded-[10px] border border-[#E5E5E0] bg-white px-4 text-center font-mono text-lg tracking-widest text-black transition-all focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-[8px] border border-red-200 bg-red-50/80 p-3 text-xs font-medium text-red-600"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || otpToken.length < 6}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-black text-sm font-medium text-white shadow-2xs transition-all duration-200 hover:bg-neutral-800 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setStep("credentials")}
            className="text-xs font-medium text-[#73736E] transition-colors hover:text-black hover:underline"
            disabled={isPending}
          >
            ← Back to email sign in
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="w-full text-left" noValidate>
      {/* Email Input */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="font-graphik mb-1.5 block text-xs font-medium text-[#262626]"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
          }}
          onBlur={() => handleBlur("email")}
          required
          className={`font-graphik h-12 w-full rounded-[10px] border bg-white px-4 text-sm text-black transition-all duration-200 placeholder:text-[#A3A39D] focus:border-black focus:ring-1 focus:ring-black focus:outline-none ${
            emailError
              ? "border-red-500 bg-red-50/20"
              : "border-[#E5E5E0] hover:border-[#D4D4CE]"
          }`}
        />
        {emailError && (
          <p className="mt-1 text-xs font-medium text-red-600">{emailError}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="mb-2">
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="font-graphik text-xs font-medium text-[#262626]"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="font-graphik text-xs font-medium text-[#73736E] transition-colors hover:text-black hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (!touched.password)
                setTouched((prev) => ({ ...prev, password: true }));
            }}
            onBlur={() => handleBlur("password")}
            required
            className={`font-graphik h-12 w-full rounded-[10px] border bg-white pr-11 pl-4 text-sm text-black transition-all duration-200 placeholder:text-[#A3A39D] focus:border-black focus:ring-1 focus:ring-black focus:outline-none ${
              passwordError
                ? "border-red-500 bg-red-50/20"
                : "border-[#E5E5E0] hover:border-[#D4D4CE]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#A3A39D] transition-colors hover:text-black focus:outline-none"
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
          <p className="mt-1 text-xs font-medium text-red-600">{passwordError}</p>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div
          role="alert"
          className="mt-3 mb-1 rounded-[8px] border border-red-200 bg-red-50/80 p-3 text-xs font-medium text-red-600"
        >
          {error}
        </div>
      )}

      {/* Primary Submit Button */}
      <button
        type="submit"
        disabled={isPending || isSuccess || !!emailError || !!passwordError}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-black text-sm font-medium text-white shadow-2xs transition-all duration-200 hover:bg-neutral-800 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Signing in...</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Authenticated! Redirecting...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
