"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/lib/require-role";
import { upsertRole, deleteRole } from "@genz/database/roles";
import type { RoleLevel, PermissionKey } from "@genz/types";

export async function addRoleAction(formData: FormData) {
  await requirePermission("employees:write");

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = (formData.get("description") as string) || "";
  const roleLevel = (formData.get("roleLevel") as RoleLevel) || "staff";

  if (!name || !code) {
    return { error: "Role Name and Code are required" };
  }

  const permissionsRaw = formData.getAll("permissions") as string[];
  const permissionsJson = formData.get("permissionsJson") as string;
  let permissions: PermissionKey[] = [];
  if (permissionsJson) {
    try {
      permissions = JSON.parse(permissionsJson) as PermissionKey[];
    } catch {}
  } else if (permissionsRaw && permissionsRaw.length > 0) {
    permissions = permissionsRaw as PermissionKey[];
  }

  const role = await upsertRole({
    name,
    code: code.toUpperCase().trim(),
    description,
    role_level: roleLevel,
    permissions,
  });

  revalidatePath("/dashboard/roles");
  revalidatePath("/dashboard/employees");
  return { success: true, role };
}

export async function updateRoleAction(formData: FormData) {
  await requirePermission("employees:write");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = (formData.get("description") as string) || "";
  const roleLevel = (formData.get("roleLevel") as RoleLevel) || "staff";

  if (!id || !name || !code) {
    return { error: "ID, Role Name, and Code are required" };
  }

  const permissionsRaw = formData.getAll("permissions") as string[];
  const permissionsJson = formData.get("permissionsJson") as string;
  let permissions: PermissionKey[] = [];
  if (permissionsJson) {
    try {
      permissions = JSON.parse(permissionsJson) as PermissionKey[];
    } catch {}
  } else if (permissionsRaw && permissionsRaw.length > 0) {
    permissions = permissionsRaw as PermissionKey[];
  }

  const role = await upsertRole({
    id,
    name,
    code: code.toUpperCase().trim(),
    description,
    role_level: roleLevel,
    permissions,
  });

  revalidatePath("/dashboard/roles");
  revalidatePath("/dashboard/employees");
  return { success: true, role };
}

export async function deleteRoleAction(id: string) {
  await requirePermission("employees:delete");

  if (!id) {
    return { error: "Role ID is required" };
  }

  await deleteRole(id);

  revalidatePath("/dashboard/roles");
  revalidatePath("/dashboard/employees");
  return { success: true };
}
