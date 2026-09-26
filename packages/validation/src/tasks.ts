import { z } from "zod";
import { employeeDepartmentSchema } from "./employees";

export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export const taskStatusSchema = z.enum(["todo", "in_progress", "in_review", "done", "cancelled"]);
export const taskEntityTypeSchema = z.enum([
  "crm_contact",
  "crm_lead",
  "crm_deal",
  "seller_onboarding",
  "seller_application",
  "product",
  "order",
  "tech_feature",
  "general",
]);

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(250).trim(),
  description: z.string().optional().nullable(),
  department: employeeDepartmentSchema.default("tech"),
  assignedTo: z.string().uuid().optional().nullable(),
  priority: taskPrioritySchema.default("medium"),
  status: taskStatusSchema.default("todo"),
  dueDate: z.string().optional().nullable(),
  relatedEntityType: taskEntityTypeSchema.optional().nullable(),
  relatedEntityId: z.string().uuid().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: taskStatusSchema,
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
