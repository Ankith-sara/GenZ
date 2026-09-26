import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/lib/require-role";
import { getDepartmentById, getEmployeesList } from "@genz/database/employees";
import { DepartmentEditorForm } from "../../department-editor-form";

interface EditDepartmentPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Department | Admin",
  description: "Edit department settings and manage granular role permissions.",
};

export default async function EditDepartmentPage({ params }: EditDepartmentPageProps) {
  await requirePermission("employees:write");
  const { id } = await params;

  const [dept, employees] = await Promise.all([
    getDepartmentById(id),
    getEmployeesList(),
  ]);

  if (!dept) {
    notFound();
  }

  return <DepartmentEditorForm initialDepartment={dept} employees={employees} />;
}
