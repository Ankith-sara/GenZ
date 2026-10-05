import { requirePermission } from "@/features/auth/lib/require-role";
import { getTasksList } from "@genz/database/tasks";
import { getEmployeesList } from "@genz/database/employees";
import { TasksViewClient } from "@/features/tasks";

export default async function TasksPage() {
  await requirePermission("tasks:read");

  const [tasks, employees] = await Promise.all([getTasksList(), getEmployeesList()]);

  return <TasksViewClient tasks={tasks} employees={employees} />;
}
