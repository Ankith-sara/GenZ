import { requirePermission } from "@/features/auth/lib/require-role";
import {
  getContactsList,
  getLeadsList,
  getDealsList,
  getSellerOnboardingList,
} from "@genz/database/crm";
import { OnboardingViewClient } from "../components/onboarding-view-client";

export default async function OnboardingPage() {
  await requirePermission("crm:read");

  const [contacts, leads, deals, onboardings] = await Promise.all([
    getContactsList(),
    getLeadsList(),
    getDealsList(),
    getSellerOnboardingList(),
  ]);

  return (
    <OnboardingViewClient
      onboardings={onboardings}
      counts={{
        contacts: contacts.length,
        leads: leads.length,
        deals: deals.length,
        onboardings: onboardings.length,
      }}
    />
  );
}
