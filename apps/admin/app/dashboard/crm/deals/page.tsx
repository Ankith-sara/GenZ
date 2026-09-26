import { requirePermission } from "@/features/auth/lib/require-role";
import {
  getContactsList,
  getLeadsList,
  getDealsList,
  getSellerOnboardingList,
} from "@genz/database/crm";
import { DealsViewClient } from "../components/deals-view-client";

export default async function DealsPage() {
  await requirePermission("crm:read");

  const [contacts, leads, deals, onboardings] = await Promise.all([
    getContactsList(),
    getLeadsList(),
    getDealsList(),
    getSellerOnboardingList(),
  ]);

  return (
    <DealsViewClient
      deals={deals}
      counts={{
        contacts: contacts.length,
        leads: leads.length,
        deals: deals.length,
        onboardings: onboardings.length,
      }}
    />
  );
}
