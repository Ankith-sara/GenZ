import { requirePermission } from "@/features/auth/lib/require-role";
import { getEmployeesList } from "@genz/database/employees";
import { DepartmentEditorForm } from "../department-editor-form";

export const metadata = {
  title: "Create Department | Admin",
  description: "Create a new administrative department and configure its role permission matrix.",
};

export default async function NewDepartmentPage() {
  await requirePermission("employees:write");
  const employees = await getEmployeesList();

  return <DepartmentEditorForm employees={employees} />;
}
