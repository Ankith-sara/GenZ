import { requirePermission } from "@/features/auth/lib/require-role";
import {
  getContactsList,
  getLeadsList,
  getDealsList,
  getSellerOnboardingList,
} from "@genz/database/crm";
import { ContactsViewClient } from "../components/contacts-view-client";

export default async function ContactsPage() {
  await requirePermission("crm:read");

  const [contacts, leads, deals, onboardings] = await Promise.all([
    getContactsList(),
    getLeadsList(),
    getDealsList(),
    getSellerOnboardingList(),
  ]);

  return (
    <ContactsViewClient
      contacts={contacts}
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
