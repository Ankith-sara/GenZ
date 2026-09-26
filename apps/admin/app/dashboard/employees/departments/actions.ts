"use server";

import { revalidatePath } from "next/cache";
import type { PermissionKey } from "@genz/types";
import { requirePermission } from "@/features/auth/lib/require-role";
import { upsertDepartment, deleteDepartment } from "@genz/database/employees";

export async function addDepartmentAction(formData: FormData) {
  await requirePermission("employees:write");

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = (formData.get("description") as string) || "";
  const defaultRole = (formData.get("defaultRole") as string) || "CRM Manager";
  const headName = (formData.get("headEmployeeName") as string) || null;
  const headId = (formData.get("headEmployeeId") as string) || null;
  const status = (formData.get("status") as "active" | "inactive") || "active";

  if (!name || !code) {
    return { error: "Department Name and Code are required" };
  }

  const permissionsRaw = formData.getAll("permissions") as PermissionKey[];
  const permissionsJson = formData.get("permissionsJson") as string;
  let permissions: PermissionKey[] = [];
  if (permissionsJson) {
    try {
      permissions = JSON.parse(permissionsJson) as PermissionKey[];
    } catch {}
  } else if (permissionsRaw && permissionsRaw.length > 0) {
    permissions = permissionsRaw;
  }

  const dept = await upsertDepartment({
    name,
    code: code.toUpperCase().trim(),
    description,
    default_role: defaultRole,
    head_employee_name: headName,
    head_employee_id: headId,
    permissions,
    status,
  });

  revalidatePath("/dashboard/employees/departments");
  revalidatePath("/dashboard/employees");
  return { success: true, department: dept };
}

export async function updateDepartmentAction(formData: FormData) {
  await requirePermission("employees:write");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = (formData.get("description") as string) || "";
  const defaultRole = (formData.get("defaultRole") as string) || "Operation Manager";
  const headName = (formData.get("headEmployeeName") as string) || null;
  const headId = (formData.get("headEmployeeId") as string) || null;
  const status = (formData.get("status") as "active" | "inactive") || "active";

  if (!id || !name || !code) {
    return { error: "ID, Name, and Code are required" };
  }

  const permissionsRaw = formData.getAll("permissions") as PermissionKey[];
  const permissionsJson = formData.get("permissionsJson") as string;
  let permissions: PermissionKey[] = [];
  if (permissionsJson) {
    try {
      permissions = JSON.parse(permissionsJson) as PermissionKey[];
    } catch {}
  } else if (permissionsRaw && permissionsRaw.length > 0) {
    permissions = permissionsRaw;
  }

  const dept = await upsertDepartment({
    id,
    name,
    code: code.toUpperCase().trim(),
    description,
    default_role: defaultRole,
    head_employee_name: headName,
    head_employee_id: headId,
    permissions,
    status,
  });

  revalidatePath("/dashboard/employees/departments");
  revalidatePath("/dashboard/employees");
  return { success: true, department: dept };
}

export async function deleteDepartmentAction(id: string) {
  await requirePermission("employees:delete");

  if (!id) {
    return { error: "Department ID is required" };
  }

  await deleteDepartment(id);

  revalidatePath("/dashboard/employees/departments");
  revalidatePath("/dashboard/employees");
  return { success: true };
}
