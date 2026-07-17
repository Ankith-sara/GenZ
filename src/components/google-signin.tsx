"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton({
  redirectTo = "/dashboard",
  text = "Continue with Google",
}: {
  redirectTo?: string;
  text?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in w-full">
      <Button
        type="button"
        className="flex h-11 w-full items-center justify-center gap-3 rounded-none border border-[#DADCE0] bg-white text-sm font-medium text-[#3C4043] transition-all hover:bg-[#F8F9FA] hover:shadow-sm"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v9.09h12.75c-.53 2.64-2.01 4.88-4.24 6.39l7.7 5.97C44.9 36.58 46.5 30.73 46.5 24z"
            />
            <path
              fill="#34A853"
              d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"
            />
            <path
              fill="#FBBC05"
              d="M24 38.5c-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48c6.48 0 11.93-2.13 15.89-5.81l-7.7-5.97c-2.28 1.52-5.18 2.28-8.19 2.28z"
            />
          </svg>
        </div>
        <span>{loading ? "Connecting…" : text}</span>
      </Button>
      {error && (
        <p
          role="alert"
          className="text-destructive mt-2 text-center text-sm font-semibold"
        >
          {error}
        </p>
      )}
    </div>
  );
}
