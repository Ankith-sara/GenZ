"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupUser, verifyOtpSignup } from "@/app/login/actions";
import type { Role } from "@/types/database";
import { Eye, EyeOff } from "lucide-react";

const SIGNUP_ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "buyer",
    label: "User",
    description: "I want to discover and buy trusted Indian products.",
  },
  {
    value: "manufacturer",
    label: "Manufacturer",
    description: "I run a factory or brand and want to get verified.",
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

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        // Successfully verified! Redirect instantly
        const target =
          role === "manufacturer" ? "/dashboard/pending-verification" : "/profile";
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
      <form onSubmit={handleOtpSubmit} className="animate-fade-in text-left">
        <div className="mb-6">
          <h3 className="mb-1.5 font-serif text-xl font-normal text-black">
            Verify Your Email
          </h3>
          <p className="text-smoke text-xs leading-relaxed">
            We have sent a 6-digit verification code to{" "}
            <strong className="font-mono font-semibold text-black">{email}</strong>.
            Please enter it below to activate your account.
          </p>
        </div>

        <div className="mb-4">
          <Label htmlFor="otp">6-Digit Verification Code</Label>
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
            disabled={isPending || otpToken.length < 6}
          >
            {isPending ? "Verifying..." : "Verify & Complete Signup"}
          </Button>

          <button
            type="button"
            onClick={() => setStep("details")}
            className="text-smoke mt-1 text-center text-xs hover:text-black hover:underline"
            disabled={isPending}
          >
            Back to signup details
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleDetailsSubmit} noValidate className="text-left">
      {!defaultRole && (
        <fieldset className="mb-5 border-0 p-0">
          <legend className="text-muted-foreground mb-2.5 text-xs">
            I am signing up as a...
          </legend>
          <div
            role="group"
            aria-label="Select account type"
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {SIGNUP_ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                aria-pressed={role === r.value}
                onClick={() => setRole(r.value)}
                className={`rounded-none border p-3.5 text-left text-sm transition-colors ${
                  role === r.value
                    ? "border-black bg-black text-white"
                    : "border-ash bg-background text-foreground hover:border-black"
                }`}
              >
                <span className="block font-medium">{r.label}</span>
                <span
                  className={`mt-1 block text-xs ${
                    role === r.value ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {r.description}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mb-4">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="border-ash rounded-none focus-visible:ring-black"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-ash rounded-none focus-visible:ring-black"
        />
      </div>

      <div className="mb-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
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
        <p className="text-muted-foreground mt-1.5 text-xs">At least 8 characters.</p>
      </div>

      {error && (
        <p role="alert" className="text-destructive mt-2 mb-4 text-xs font-semibold">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="mt-6 h-11 w-full rounded-none bg-black font-medium tracking-wider text-white uppercase hover:bg-black/90"
        disabled={isPending}
      >
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
