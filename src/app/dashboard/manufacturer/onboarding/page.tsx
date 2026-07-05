import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { OnboardingForm } from "./onboarding-form";

export default async function ManufacturerOnboardingPage() {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("*")
    .eq("id", session.userId)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-12">
      <Link
        href="/dashboard/manufacturer"
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-3xl leading-[1.27]">Factory &amp; business details</h1>
      <p className="text-muted-foreground mt-2 max-w-xl">
        This is what our admin team reviews to verify your business. Accurate details
        here get you approved faster.
      </p>

      <div className="border-border bg-card mt-8 rounded-[4px] border p-8">
        <OnboardingForm profile={profile} />
      </div>
    </div>
  );
}
