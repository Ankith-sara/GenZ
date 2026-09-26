import { z } from "zod";

export const employeeDepartmentSchema = z.enum([
  "super_admin",
  "crm_manager",
  "operation_manager",
  "admin",
  "tech",
  "seller_acquisition",
  "catalog_operations",
  "operations",
  "support",
]);

export const departmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Department name must be at least 2 characters").max(100),
  code: z.string().min(2, "Code must be at least 2 characters").max(50),
  description: z.string().max(500).optional().default(""),
  headEmployeeName: z.string().optional().nullable(),
  headEmployeeId: z.string().optional().nullable(),
  defaultRole: z.string().optional().default("Operation Manager"),
  status: z.enum(["active", "inactive"]).default("active"),
  permissions: z.array(z.string()).default([]),
});

export const employeeStatusSchema = z.enum(["active", "inactive", "on_leave"]);

export const roleLevelSchema = z.enum(["admin", "manager", "staff"]);

export const createEmployeeSchema = z.object({
  employeeCode: z.string().min(3).max(30).trim(),
  fullName: z.string().min(2).max(150).trim(),
  email: z.string().email().max(255).trim(),
  phone: z.string().optional().nullable(),
  department: employeeDepartmentSchema,
  designation: z.string().min(2).max(100).trim(),
  status: employeeStatusSchema.default("active"),
  roleLevel: roleLevelSchema.default("staff"),
  permissions: z.array(z.string()).default([]),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
