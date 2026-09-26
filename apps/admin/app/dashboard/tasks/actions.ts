"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@genz/database/authorization";
import { createInternalTask, updateInternalTaskStatus } from "@genz/database/tasks";
import type { EmployeeDepartment, TaskPriority, TaskStatus, TaskEntityType } from "@genz/types";

export async function createTaskAction(formData: FormData) {
  const session = await requireRole("admin");
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const department = (formData.get("department") as EmployeeDepartment) || "tech";
  const assignedTo = (formData.get("assignedTo") as string) || null;
  const priority = (formData.get("priority") as TaskPriority) || "medium";
  const dueDate = (formData.get("dueDate") as string) || null;
  const relatedEntityType = (formData.get("relatedEntityType") as TaskEntityType) || "general";
  const relatedEntityId = (formData.get("relatedEntityId") as string) || null;

  if (!title) {
    return { error: "Task title is required" };
  }

  const task = await createInternalTask({
    title,
    description,
    department,
    assigned_to: assignedTo,
    created_by: session.userId,
    priority,
    status: "todo",
    due_date: dueDate,
    related_entity_type: relatedEntityType,
    related_entity_id: relatedEntityId,
    completed_at: null,
  });

  revalidatePath("/dashboard/tasks");
  return { success: true, task };
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
  await requireRole("admin");
  const task = await updateInternalTaskStatus(taskId, status);
  revalidatePath("/dashboard/tasks");
  return { success: true, task };
}
