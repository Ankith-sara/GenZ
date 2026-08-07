"use client";

import { useState } from "react";
import { signupUser, verifyOtpSignup } from "@/app/login/actions";
import type { Role } from "@/types/database";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

const SIGNUP_ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "buyer",
    label: "Buyer / Consumer",
    description: "Discover and purchase directly from verified makers.",
  },
  {
    value: "seller",
    label: "Seller / Manufacturer",
    description: "Showcase products and connect with regional buyers.",
  },
];

interface SignupFormProps {
  defaultRole?: Role;
}

export function SignupForm({ defaultRole }: SignupFormProps) {
  const [role, setRole] = useState<Role>(defaultRole ?? "buyer");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const nameError =
    touched.fullName && !fullName.trim() ? "Full name is required." : null;

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
      : password.length < 8
        ? "Password must be at least 8 characters."
        : null
    : null;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true });

    if (nameError || emailError || passwordError || !fullName || !email || !password) {
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const res = await signupUser({ email, password, fullName, role });
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
      const res = await verifyOtpSignup(email, otpToken);
      if (res.error) {
        setError(res.error);
        setIsPending(false);
      } else {
        const target =
          role === "admin"
            ? "/admin/dashboard"
            : role === "seller"
              ? "/dashboard/pending-verification"
              : "/profile";
        window.location.href = target;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="w-full text-left">
        <div className="mb-6">
          <h3 className="font-graphik mb-1 text-lg font-semibold text-black">
            Verify Your Email
          </h3>
          <p className="font-graphik text-xs text-[#73736E]">
            We sent a 6-digit code to{" "}
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
              <span>Verify & Activate Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setStep("details")}
            className="text-xs font-medium text-[#73736E] transition-colors hover:text-black hover:underline"
            disabled={isPending}
          >
            ← Back to signup details
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleDetailsSubmit} noValidate className="w-full text-left">
      {!defaultRole && (
        <fieldset className="mb-5 border-0 p-0">
          <legend className="font-graphik mb-2 block text-xs font-medium text-[#262626]">
            Account Type
          </legend>
          <div
            role="group"
            aria-label="Select account type"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          >
            {SIGNUP_ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                aria-pressed={role === r.value}
                onClick={() => setRole(r.value)}
                className={`rounded-[10px] border p-3 text-left transition-all duration-200 ${
                  role === r.value
                    ? "border-black bg-black text-white shadow-2xs"
                    : "border-[#E5E5E0] bg-white text-[#262626] hover:border-[#D4D4CE]"
                }`}
              >
                <span className="font-graphik block text-xs font-semibold">
                  {r.label}
                </span>
                <span
                  className={`font-graphik mt-0.5 block text-[11px] ${
                    role === r.value ? "text-white/70" : "text-[#73736E]"
                  }`}
                >
                  {r.description}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Full Name */}
      <div className="mb-4">
        <label
          htmlFor="fullName"
          className="font-graphik mb-1.5 block text-xs font-medium text-[#262626]"
        >
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="e.g. Sara Sharma"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (!touched.fullName) setTouched((prev) => ({ ...prev, fullName: true }));
          }}
          onBlur={() => handleBlur("fullName")}
          required
          className={`font-graphik h-12 w-full rounded-[10px] border bg-white px-4 text-sm text-black transition-all duration-200 placeholder:text-[#A3A39D] focus:border-black focus:ring-1 focus:ring-black focus:outline-none ${
            nameError
              ? "border-red-500 bg-red-50/20"
              : "border-[#E5E5E0] hover:border-[#D4D4CE]"
          }`}
        />
        {nameError && (
          <p className="mt-1 text-xs font-medium text-red-600">{nameError}</p>
        )}
      </div>

      {/* Email */}
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

      {/* Password */}
      <div className="mb-2">
        <label
          htmlFor="password"
          className="font-graphik mb-1.5 block text-xs font-medium text-[#262626]"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (!touched.password)
                setTouched((prev) => ({ ...prev, password: true }));
            }}
            onBlur={() => handleBlur("password")}
            minLength={8}
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
        {passwordError ? (
          <p className="mt-1 text-xs font-medium text-red-600">{passwordError}</p>
        ) : (
          <p className="mt-1 text-[11px] text-[#A3A39D]">
            At least 8 characters required.
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 mb-1 rounded-[8px] border border-red-200 bg-red-50/80 p-3 text-xs font-medium text-red-600"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !!nameError || !!emailError || !!passwordError}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-black text-sm font-medium text-white shadow-2xs transition-all duration-200 hover:bg-neutral-800 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Creating account…</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
