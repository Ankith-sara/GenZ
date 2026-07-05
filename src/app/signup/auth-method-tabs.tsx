"use client";

import { useState } from "react";
import { SignupForm } from "./signup-form";
import { PhoneSignupForm } from "@/components/phone-signup-form";

export function SignupMethodTabs() {
  const [method, setMethod] = useState<"email" | "phone">("email");

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            className={`h-9 flex-1 rounded-[4px] border text-sm capitalize ${
              method === m
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:border-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      {method === "email" ? <SignupForm /> : <PhoneSignupForm />}
    </div>
  );
}
