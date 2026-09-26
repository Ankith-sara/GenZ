import { requirePermission } from "@/features/auth/lib/require-role";
import {
  getContactsList,
  getLeadsList,
  getDealsList,
  getSellerOnboardingList,
} from "@genz/database/crm";
import { CRMDashboardClient } from "./crm-dashboard-client";

export const metadata = {
  title: "CRM Module Dashboard | Admin",
  description: "Executive oversight of artisan sourcing, CRM leads, pipeline deals, and onboarding.",
};

export default async function CRMMainPage() {
  await requirePermission("crm:read");

  const [contacts, leads, deals, onboardings] = await Promise.all([
    getContactsList(),
    getLeadsList(),
    getDealsList(),
    getSellerOnboardingList(),
  ]);

  return (
    <CRMDashboardClient
      contacts={contacts}
      leads={leads}
      deals={deals}
      onboardings={onboardings}
    />
  );
}
