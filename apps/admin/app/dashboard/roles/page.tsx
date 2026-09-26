import { requirePermission } from "@/features/auth/lib/require-role";
import { getRolesList } from "@genz/database/roles";
import { RolesViewClient } from "./roles-view-client";

export const metadata = {
  title: "Roles & Permissions | Admin",
  description: "Manage platform roles, access levels, and granular page CRUD permissions.",
};

export default async function RolesPage() {
  await requirePermission("employees:read");
  const roles = await getRolesList();

  return <RolesViewClient roles={roles} />;
}
