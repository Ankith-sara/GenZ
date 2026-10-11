import { requirePermission } from "@genz/database/authorization";
import { RoleEditorForm } from "../role-editor-form";

export const metadata = {
  title: "Create Role | Admin",
  description:
    "Create a new administrative role and configure its granular CRUD permissions matrix.",
};

export default async function NewRolePage() {
  await requirePermission("employees:write");
  return <RoleEditorForm />;
}
