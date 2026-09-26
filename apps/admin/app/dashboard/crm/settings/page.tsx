import { requireRole } from "@/features/auth/lib/require-role";
import { CRMSettingsClient } from "./crm-settings-client";

export const metadata = {
  title: "CRM Module Settings | Admin",
  description: "Configure artisan sourcing stages, commission tiers, lead scoring, and automated pipelines.",
};

export default async function CRMSettingsPage() {
  await requireRole("admin");

  return <CRMSettingsClient />;
}
