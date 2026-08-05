import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <div className="max-w-3xl space-y-6">
      {/* Header and Back Link Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-nantes text-3xl font-bold text-[#1A1A18]">
            Business Profile
          </h1>
          <p className="font-graphik mt-1 text-xs text-[#73736E]">
            Specify your legal registration, manufacturing facilities, factory address,
            and GSTIN details.
          </p>
        </div>
        <Link
          href="/dashboard/manufacturer"
          className="font-graphik flex items-center gap-1.5 text-xs font-semibold text-[#52524E] hover:text-black sm:order-first"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Onboarding Form Card */}
      <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <OnboardingForm profile={profile} />
      </div>
    </div>
  );
}
