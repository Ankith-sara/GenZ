"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@genz/database";
import {
  verifyPasswordAndSendOtp,
  verifyOtpLogin,
  directPasswordLogin,
} from "@/app/login/actions";

interface LoginFormProps {
  redirectTo: string;
  disableOtp?: boolean;
}

import { validateLoginEmail, validateLoginPassword } from "../lib/login-validation";

export function LoginForm({ redirectTo, disableOtp = true }: LoginFormProps) {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  // Real-time touch validation tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailError = touched.email ? validateLoginEmail(email) : null;
  const passwordError = touched.password ? validateLoginPassword(password) : null;

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

  async function handleGoogleLogin() {
    setIsGooglePending(true);
    setError(null);

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
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="w-full text-left">
        <div className="mb-6">
          <h3 className="text-foreground mb-1 text-lg font-semibold tracking-tight">
            Verification Code
          </h3>
          <p className="text-muted-foreground text-xs">
            Enter the 6-digit code sent to{" "}
            <strong className="text-foreground font-mono">{email}</strong>
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="otp"
            className="text-foreground mb-1.5 block text-xs font-medium"
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
            className="border-border bg-card text-foreground placeholder:text-muted-foreground hover:border-foreground/30 focus:border-primary focus:ring-primary/20 h-12 w-full rounded-2xl border px-4 text-center font-mono text-xl tracking-widest shadow-2xs transition-all focus:ring-2 focus:outline-none"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-medium text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || otpToken.length < 6}
          className="bg-primary text-primary-foreground flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-xs font-semibold shadow-xs transition-all duration-150 hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="text-primary-foreground h-4 w-4 animate-spin" />
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
            className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium transition-colors hover:underline"
            disabled={isPending}
          >
            ← Back to email sign in
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="w-full space-y-6 text-left">
      <form onSubmit={handleCredentialsSubmit} className="space-y-4" noValidate>
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="text-foreground mb-1.5 block text-xs font-medium"
          >
            Factory / Business Email
          </label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="factory@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
              }}
              onBlur={() => handleBlur("email")}
              required
              className={`bg-card text-foreground placeholder:text-muted-foreground hover:border-foreground/30 focus:border-primary focus:ring-primary/20 h-11 w-full rounded-2xl border pr-4 pl-10 text-xs shadow-2xs transition-all duration-150 focus:ring-2 focus:outline-none sm:text-sm ${
                emailError ? "border-rose-500 bg-rose-50/20" : "border-border"
              }`}
            />
          </div>
          {emailError && (
            <p className="mt-1 text-xs font-medium text-rose-600">{emailError}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-foreground text-xs font-medium">
              Password
            </label>
            <a
              href="mailto:sellers@genz.in?subject=Seller%20Password%20Reset%20Assistance"
              className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors hover:underline"
            >
              Reset Help
            </a>
          </div>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
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
              className={`bg-card text-foreground placeholder:text-muted-foreground hover:border-foreground/30 focus:border-primary focus:ring-primary/20 h-11 w-full rounded-2xl border pr-11 pl-10 text-xs shadow-2xs transition-all duration-150 focus:ring-2 focus:outline-none sm:text-sm ${
                passwordError ? "border-rose-500 bg-rose-50/20" : "border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer transition-colors focus:outline-none"
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
            <p className="mt-1 text-xs font-medium text-rose-600">{passwordError}</p>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-medium text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isPending || isSuccess || !!emailError || !!passwordError}
          className="bg-primary text-primary-foreground flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-xs font-semibold shadow-xs transition-all duration-150 hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="text-primary-foreground h-4 w-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              <span>Authenticated! Entering Desk...</span>
            </>
          ) : (
            <>
              <span>Sign In to Seller Desk</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-[10px] font-semibold tracking-wider uppercase">
          <span className="bg-card text-muted-foreground px-3">Or continue with</span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGooglePending}
        className="border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted/50 focus-visible:ring-primary/20 flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-full border text-xs font-medium shadow-2xs transition-all duration-150 hover:shadow-xs focus:outline-none focus-visible:ring-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
      >
        {isGooglePending ? (
          <Loader2 className="text-foreground h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
