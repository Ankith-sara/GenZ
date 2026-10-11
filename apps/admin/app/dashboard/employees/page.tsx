import { requirePermission } from "@genz/database/authorization";
import { getEmployeesList, getDepartmentsList } from "@genz/database/employees";
import { EmployeesViewClient } from "@/features/employees";

export default async function EmployeesPage() {
  await requirePermission("employees:read");
  const [employees, departments] = await Promise.all([
    getEmployeesList(),
    getDepartmentsList(),
  ]);

  return <EmployeesViewClient employees={employees} departments={departments} />;
}
