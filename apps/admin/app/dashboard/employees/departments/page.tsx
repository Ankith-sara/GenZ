import { requirePermission } from "@/features/auth/lib/require-role";
import { getDepartmentsList, getEmployeesList } from "@genz/database/employees";
import { DepartmentsViewClient } from "./departments-view-client";

export default async function DepartmentsPage() {
  await requirePermission("employees:read");
  const [departments, employees] = await Promise.all([
    getDepartmentsList(),
    getEmployeesList(),
  ]);

  return (
    <DepartmentsViewClient
      departments={departments}
      employees={employees}
    />
  );
}
