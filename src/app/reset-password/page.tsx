"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/app/login/actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const res = await updatePassword(password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-forest-green flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center gap-2 group mb-6">
          <div className="w-10 h-10 bg-gold-yellow flex items-center justify-center text-forest-green font-normal text-2xl rounded-[4px]">
            Z
          </div>
          <span className="text-xl font-medium tracking-tight text-white">GenZ</span>
        </div>
        <h2 className="text-3xl font-serif text-white font-normal">Set New Password.</h2>
        <p className="mt-2 text-sm text-white/70">
          Choose a secure new password for your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-paper-white py-8 px-6 rounded-[4px] sm:px-10 border border-black/5">
          {success ? (
            <div className="text-center py-4">
              <h3 className="font-serif text-xl text-forest-green mb-2">Password Updated!</h3>
              <p className="text-sm text-smoke leading-relaxed">
                Your password has been successfully updated. Redirecting to login page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 8 characters"
                  className="border-black/10 focus-visible:ring-forest-green"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="border-black/10 focus-visible:ring-forest-green"
                />
              </div>

              {error && (
                <p role="alert" className="text-destructive mt-2 mb-4 text-xs font-semibold">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] font-medium uppercase tracking-wider h-11" disabled={isPending}>
                {isPending ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
