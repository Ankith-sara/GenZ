import { requirePermission } from "@/features/auth/lib/require-role";
import { getEmployeesList, getDepartmentsList } from "@genz/database/employees";
import { EmployeesViewClient } from "./employees-view-client";

export default async function EmployeesPage() {
  await requirePermission("employees:read");
  const [employees, departments] = await Promise.all([
    getEmployeesList(),
    getDepartmentsList(),
  ]);

  return <EmployeesViewClient employees={employees} departments={departments} />;
}
