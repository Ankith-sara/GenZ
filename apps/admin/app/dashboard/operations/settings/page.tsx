import { requireRole } from "@/features/auth/lib/require-role";
import { OperationsSettingsClient } from "./operations-settings-client";

export const metadata = {
  title: "Operations Module Settings | Admin",
  description: "Configure fulfillment SLAs, logistics integrations, and GI craft quality assurance gates.",
};

export default async function OperationsSettingsPage() {
  await requireRole("admin");

  return <OperationsSettingsClient />;
}
