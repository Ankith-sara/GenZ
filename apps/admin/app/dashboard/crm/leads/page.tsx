import { requirePermission } from "@/features/auth/lib/require-role";
import {
  getContactsList,
  getLeadsList,
  getDealsList,
  getSellerOnboardingList,
} from "@genz/database/crm";
import { LeadsViewClient } from "../components/leads-view-client";

export default async function LeadsPage() {
  await requirePermission("crm:read");

  const [contacts, leads, deals, onboardings] = await Promise.all([
    getContactsList(),
    getLeadsList(),
    getDealsList(),
    getSellerOnboardingList(),
  ]);

  return (
    <LeadsViewClient
      leads={leads}
      counts={{
        contacts: contacts.length,
        leads: leads.length,
        deals: deals.length,
        onboardings: onboardings.length,
      }}
    />
  );
}
