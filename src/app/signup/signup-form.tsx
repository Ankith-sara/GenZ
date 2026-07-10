"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup, type SignupState } from "./actions";
import type { Role } from "@/types/database";

const SIGNUP_ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "buyer",
    label: "Buyer",
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
  const [state, formAction, isPending] = useActionState<SignupState, FormData>(
    signup,
    {}
  );

  if (state?.success) {
    return (
      <div role="status" aria-live="polite" className="py-5 text-center">
        <h3 className="font-serif text-2xl text-forest-green">Check your inbox.</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          We&apos;ve sent a confirmation link to finish setting up your account.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="text-left">
      <input type="hidden" name="role" value={role} />

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
                className={`rounded-[4px] border p-3.5 text-left text-sm transition-colors ${
                  role === r.value
                    ? "border-forest-green bg-forest-green text-white"
                    : "border-border bg-background text-foreground hover:border-forest-green"
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
        <Input id="fullName" name="fullName" autoComplete="name" required className="border-black/10 focus-visible:ring-forest-green" />
      </div>

      <div className="mb-4">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="border-black/10 focus-visible:ring-forest-green" />
      </div>

      <div className="mb-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="border-black/10 focus-visible:ring-forest-green"
        />
        <p className="text-muted-foreground mt-1.5 text-xs">At least 8 characters.</p>
      </div>

      {state?.error && (
        <p role="alert" className="text-destructive mt-2 mb-4 text-sm font-medium">
          {state.error}
        </p>
      )}

      <Button type="submit" className="mt-4 w-full bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] font-medium uppercase tracking-wider h-11" disabled={isPending}>
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
