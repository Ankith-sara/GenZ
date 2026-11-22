"use client";

import { useState } from "react";
import { createClient } from "@genz/database";
import { GoogleAuthButton } from "@genz/ui";

export function SocialLogin({ redirectTo = "" }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const nextQuery = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${nextQuery}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <GoogleAuthButton
        onClick={handleGoogleLogin}
        loading={loading}
        loadingText="Connecting to Google..."
        text="Continue with Google"
      />
      {error && (
        <p role="alert" className="mt-2 text-center text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
