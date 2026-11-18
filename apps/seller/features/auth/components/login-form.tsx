"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { createClient } from "@genz/database";
import {
  verifyPasswordAndSendOtp,
  verifyOtpLogin,
  directPasswordLogin,
} from "@/app/login/actions";
import {
  validateLoginCompanyName,
  validateLoginEmail,
  validateLoginPassword,
} from "../lib/login-validation";

interface LoginFormProps {
  redirectTo: string;
  disableOtp?: boolean;
}

// in factory lighting. Amber is the only accent (focus rings); rose is for errors.
const labelClass = "text-foreground mb-2 block text-sm font-semibold";
const inputBase =
  "bg-card text-foreground placeholder:text-muted-foreground/70 dark:placeholder:text-muted-foreground/60 h-12 w-full rounded-lg border text-base shadow-2xs transition-colors duration-150 focus:ring-4 focus:outline-none";
const inputOk =
  "border-foreground/45 hover:border-foreground/70 focus:border-foreground focus:ring-amber-500/25";
const inputError =
  "border-rose-500 focus:border-rose-500 focus:ring-rose-500/25";
const primaryBtn =
  "bg-primary text-primary-foreground flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-base font-bold shadow-xs transition-all duration-150 hover:opacity-95 focus-visible:ring-4 focus-visible:ring-amber-500/40 focus-visible:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";
const errorText = "mt-1.5 text-sm font-medium text-rose-600 dark:text-rose-400";
const errorBanner =
  "flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-sm font-medium text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400";

export function LoginForm({ redirectTo, disableOtp = true }: LoginFormProps) {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  // Validate on blur, then live-update once a field has been touched
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const companyNameError = touched.companyName
    ? validateLoginCompanyName(companyName)
    : null;
  const emailError = touched.email ? validateLoginEmail(email) : null;
  const passwordError = touched.password
    ? validateLoginPassword(password)
    : null;

  const isBusy = isPending || isSuccess || isGooglePending;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  function finishLogin() {
    setIsPending(false);
    setIsSuccess(true);
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 300);
  }

  async function handleCredentialsSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ companyName: true, email: true, password: true });

    // Validate against current values, not the (possibly stale) touched-gated errors
    const hasErrors =
      validateLoginCompanyName(companyName) ||
      validateLoginEmail(email) ||
      validateLoginPassword(password);
    if (hasErrors) return;

    setError(null);
    setIsPending(true);

    try {
      if (disableOtp) {
        const res = await directPasswordLogin(email, password, companyName);
        if (res.error) {
          setError(res.error);
          setIsPending(false);
        } else {
          finishLogin();
        }
      } else {
        const res = await verifyPasswordAndSendOtp(email, password, companyName);
        if (res.error) {
          setError(res.error);
        } else {
          setStep("otp");
        }
        setIsPending(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsPending(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await verifyOtpLogin(email, otpToken);
      if (res.error) {
        setError(res.error);
        setIsPending(false);
      } else {
        finishLogin();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsPending(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGooglePending(true);
    setError(null);

    try {
      const supabase = createClient();
      const nextQuery = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${nextQuery}`,
        },
      });

      if (googleError) {
        setError(googleError.message);
        setIsGooglePending(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setIsGooglePending(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="w-full text-left">
        <div className="mb-6">
          <h2 className="text-foreground mb-1 text-xl font-bold tracking-tight">
            Verification Code
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code sent to{" "}
            <strong className="text-foreground font-mono break-all">{email}</strong>
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="otp" className={labelClass}>
            Security Code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="• • • • • •"
            value={otpToken}
            onChange={(e) => {
              setOtpToken(e.target.value.replace(/\D/g, ""));
              if (error) setError(null);
            }}
            autoFocus
            required
            disabled={isSuccess}
            aria-invalid={!!error}
            className={`${inputBase} h-14 px-4 text-center font-mono text-2xl tracking-widest ${
              error ? inputError : inputOk
            }`}
          />
        </div>

        {error && (
          <div role="alert" className={`mb-4 ${errorBanner}`}>
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isSuccess || otpToken.length < 6}
          className={primaryBtn}
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-amber-500" aria-hidden="true" />
              <span>Authenticated! Entering Desk...</span>
            </>
          ) : isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="h-5 w-5 text-amber-400 dark:text-amber-700" aria-hidden="true" />
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setStep("credentials");
              setOtpToken("");
              setError(null);
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md px-2 py-1 text-sm font-semibold transition-colors hover:underline focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || isSuccess}
          >
            ← Back to email sign in
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="w-full space-y-6 text-left">
      <form onSubmit={handleCredentialsSubmit} className="space-y-5" noValidate>
        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className={labelClass}>
            Company / Business Name
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            placeholder="e.g. Kondapalli Crafts"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              if (error) setError(null);
            }}
            onBlur={() => handleBlur("companyName")}
            required
            aria-invalid={!!companyNameError}
            aria-describedby={companyNameError ? "companyName-error" : undefined}
            className={`${inputBase} px-4 ${companyNameError ? inputError : inputOk}`}
          />
          {companyNameError && (
            <p id="companyName-error" className={errorText}>
              {companyNameError}
            </p>
          )}
        </div>

        {/* Registered Email */}
        <div>
          <label htmlFor="email" className={labelClass}>
            Registered Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="factory@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            onBlur={() => handleBlur("email")}
            required
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
            className={`${inputBase} px-4 ${emailError ? inputError : inputOk}`}
          />
          {emailError && (
            <p id="email-error" className={errorText}>
              {emailError}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-foreground text-sm font-semibold">
              Password
            </label>
            <a
              href="mailto:sellers@genz.in?subject=Seller%20Password%20Reset%20Assistance"
              className="text-muted-foreground hover:text-foreground rounded-md px-1 text-sm font-semibold transition-colors hover:underline focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:outline-none"
            >
              Reset Help
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => handleBlur("password")}
              required
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              className={`${inputBase} pr-16 pl-4 ${passwordError ? inputError : inputOk}`}
            />
            {/* Text label instead of an eye icon: unmistakable for every user */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-md px-2 py-1 text-sm font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className={errorText}>
              {passwordError}
            </p>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div role="alert" className={errorBanner}>
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Submit */}
        <button type="submit" disabled={isBusy} className={primaryBtn}>
          {isSuccess ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-amber-500" aria-hidden="true" />
              <span>Authenticated! Entering Desk...</span>
            </>
          ) : isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Seller Desk</span>
              <ArrowRight className="h-5 w-5 text-amber-400 dark:text-amber-700" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <span aria-hidden="true" className="bg-border h-px flex-1" />
        <span>or</span>
        <span aria-hidden="true" className="bg-border h-px flex-1" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isBusy}
        className="border-foreground/45 bg-card text-foreground hover:border-foreground/70 hover:bg-muted/50 flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border text-base font-semibold shadow-2xs transition-colors duration-150 focus-visible:ring-4 focus-visible:ring-amber-500/25 focus-visible:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGooglePending ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>
          {isGooglePending ? "Connecting to Google..." : "Continue with Google"}
        </span>
      </button>
    </div>
  );
}