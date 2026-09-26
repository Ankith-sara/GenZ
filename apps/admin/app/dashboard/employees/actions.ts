"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/lib/require-role";
import { upsertEmployee } from "@genz/database/employees";
import {
  type EmployeeDepartment,
  type EmployeeStatus,
  type RoleLevel,
  type PermissionKey,
  PREDEFINED_ROLES,
} from "@genz/types";

export async function addEmployeeAction(formData: FormData) {
  await requirePermission("employees:write");

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const department = (formData.get("department") as EmployeeDepartment) || "seller_acquisition";
  const rolePreset = (formData.get("rolePreset") as string) || "crm_manager";
  const designationInput = (formData.get("designation") as string) || "";
  const permissionsRaw = formData.getAll("permissions") as string[];

  if (!fullName || !email) {
    return { error: "Full Name and Email are required" };
  }

  let roleName = designationInput;
  let roleLevel: RoleLevel = "staff";
  let perms: PermissionKey[] = permissionsRaw as PermissionKey[];

  if (rolePreset === "super_admin") {
    roleName = designationInput || "Super Admin";
    roleLevel = "admin";
    if (perms.length === 0) {
      perms = [...PREDEFINED_ROLES.super_admin.permissions];
    }
  } else if (rolePreset === "crm_manager") {
    roleName = designationInput || "CRM Manager";
    roleLevel = "manager";
    if (perms.length === 0) {
      perms = [...PREDEFINED_ROLES.crm_manager.permissions];
    }
  } else if (rolePreset === "operation_manager") {
    roleName = designationInput || "Operation Manager";
    roleLevel = "manager";
    if (perms.length === 0) {
      perms = [...PREDEFINED_ROLES.operation_manager.permissions];
    }
  } else {
    roleName = designationInput || "Staff Associate";
    roleLevel = "emp";
    if (perms.length === 0) {
      perms = ["crm:read", "tasks:read"];
    }
  }

  const employee = await upsertEmployee({
    full_name: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone,
    department,
    designation: roleName,
    role: roleName,
    role_id: rolePreset,
    role_level: roleLevel,
    status: "active",
    permissions: perms,
  });

  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard/employees/departments");
  return { success: true, employee };
}

export async function updateEmployeePermissionsAction(
  employeeId: string,
  department: EmployeeDepartment,
  role: string,
  designation: string,
  status: EmployeeStatus,
  permissions: PermissionKey[]
) {
  await requirePermission("employees:write");

  let roleLevel: RoleLevel = "staff";
  if (role.toLowerCase().includes("super admin") || designation.toLowerCase().includes("super admin")) {
    roleLevel = "admin";
  } else if (
    role.toLowerCase().includes("manager") ||
    designation.toLowerCase().includes("manager")
  ) {
    roleLevel = "manager";
  } else {
    roleLevel = "emp";
  }

  const employee = await upsertEmployee({
    id: employeeId,
    full_name: "", // Will preserve existing
    email: "", // Will preserve existing
    department,
    role,
    designation: designation || role,
    status,
    role_level: roleLevel,
    permissions,
  });

  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard/employees/departments");
  return { success: true, employee };
}
