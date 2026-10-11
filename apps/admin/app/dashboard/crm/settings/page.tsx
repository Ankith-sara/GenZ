import { requirePermission } from "@genz/database/authorization";
import { CRMSettingsClient } from "./crm-settings-client";

export const metadata = {
  title: "CRM Module Settings | Admin",
  description:
    "Configure artisan sourcing stages, commission tiers, lead scoring, and automated pipelines.",
};

export default async function CRMSettingsPage() {
  await requirePermission("crm:admin");

  return <CRMSettingsClient />;
}
