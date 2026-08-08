import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/lib/require-role";
import { OnboardingForm } from "./onboarding-form";
import { PageHeader } from "@/components/ui/organisms/page-header";

export default async function SellerOnboardingPage() {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("id", session.userId)
    .maybeSingle();

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Business & Manufacturing Profile"
        description="Specify your legal registration, manufacturing capacities, factory location, and GSTIN details."
        breadcrumbs={[
          { label: "Seller Desk", href: "/dashboard/seller" },
          { label: "Business Profile" },
        ]}
      />

      <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <OnboardingForm profile={profile} />
      </div>
    </div>
  );
}
