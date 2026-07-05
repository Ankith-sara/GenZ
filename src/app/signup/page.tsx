import Link from "next/link";
import { SignupMethodTabs } from "./auth-method-tabs";
import { GoogleSignInButton } from "@/components/google-signin";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="bg-background flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm tracking-[0.22em] uppercase">
          GenZ
        </Link>
        <h1 className="mt-8 text-3xl leading-[1.27]">Create your account.</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Join as a buyer looking for trusted Indian products, or a manufacturer ready
          to get verified.
        </p>

        <div className="border-border bg-card mt-8 rounded-[4px] border p-8">
          <SignupMethodTabs />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card text-muted-foreground px-2">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton redirectTo={redirectTo ?? "/dashboard"} text="Sign up with Google" />
        </div>

        <p className="text-muted-foreground mt-6 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
