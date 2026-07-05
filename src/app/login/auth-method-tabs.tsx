"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { PhoneLoginForm } from "@/components/phone-login-form";

export function LoginMethodTabs({ redirectTo }: { redirectTo: string }) {
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
      {method === "email" ? (
        <LoginForm redirectTo={redirectTo} />
      ) : (
        <PhoneLoginForm redirectTo={redirectTo} />
      )}
    </div>
  );
}
