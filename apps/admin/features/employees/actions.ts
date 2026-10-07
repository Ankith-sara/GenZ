"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireRole } from "@/features/auth/lib/require-role";
import { withRateLimit } from "@/lib/rate-limiter";
import {
  upsertEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
} from "@genz/database/employees";
import {
  type EmployeeDepartment,
  type EmployeeStatus,
  type RoleLevel,
  type PermissionKey,
  PREDEFINED_ROLES,
} from "@genz/types";

export async function addEmployeeAction(formData: FormData) {
  const session = await requireRole("admin");
  await requirePermission("employees:write");

  const adminId = session.user?.id || session.profile?.id || "admin";

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "add_employee",
      identifier: adminId,
    },
    async () => {
      const fullName = (formData.get("fullName") as string)?.trim();
      const email = (formData.get("email") as string)?.toLowerCase().trim();
      const phone = (formData.get("phone") as string)?.trim() || null;
      const department =
        (formData.get("department") as EmployeeDepartment) || "seller_acquisition";
      const rolePreset = (formData.get("rolePreset") as string) || "crm_manager";
      const designationInput = (formData.get("designation") as string)?.trim() || "";
      const permissionsRaw = formData.getAll("permissions") as string[];

      if (!fullName || !email) {
        return { success: false as const, error: "Full Name and Email are required" };
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
        full_name: fullName,
        email,
        phone,
        department,
        designation: roleName,
        role: roleName,
        role_id: rolePreset,
        role_level: roleLevel,
        status: "active",
        permissions: perms,
      });

      const initialPassword =
        (formData.get("initialPassword") as string)?.trim() ||
        `GZ-${Math.floor(100000 + Math.random() * 900000)}#`;

      // Provision user account in Supabase Auth & profiles table so employee can log in immediately
      try {
        const { createAdminClient } = await import("@genz/database/admin");
        const supabaseAdmin = createAdminClient();
        const { data: authData } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: initialPassword,
          email_confirm: true,
          user_metadata: {
            role: roleLevel === "admin" ? "admin" : "emp",
            full_name: fullName,
          },
        });

        const authUserId = authData?.user?.id || employee.id;
        await supabaseAdmin.from("profiles").upsert({
          id: authUserId,
          role: roleLevel === "admin" ? "admin" : "emp",
          full_name: fullName,
        });
      } catch (authErr) {
        console.warn("[addEmployeeAction] Auth provisioning fallback:", authErr);
      }

      revalidatePath("/dashboard/employees");
      revalidatePath("/dashboard/employees/departments");
      return { success: true as const, employee, temporaryPassword: initialPassword };
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}

export async function resetEmployeePasswordAction(email: string, newPassword?: string) {
  const session = await requireRole("admin");
  await requirePermission("employees:write");

  const adminId = session.user?.id || session.profile?.id || "admin";
  const tempPass = newPassword || `GZ-${Math.floor(100000 + Math.random() * 900000)}#`;

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "reset_employee_password",
      identifier: adminId,
    },
    async () => {
      try {
        const { createAdminClient } = await import("@genz/database/admin");
        const supabaseAdmin = createAdminClient();
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: tempPass,
          });
        } else {
          await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPass,
            email_confirm: true,
            user_metadata: { role: "emp" },
          });
        }

        return { success: true as const, temporaryPassword: tempPass };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to reset password.";
        return { success: false as const, error: msg };
      }
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}

export async function updateEmployeeAction(data: {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  department: EmployeeDepartment;
  role: string;
  designation: string;
  status: EmployeeStatus;
  permissions: PermissionKey[];
}) {
  const session = await requireRole("admin");
  await requirePermission("employees:write");

  const adminId = session.user?.id || session.profile?.id || "admin";

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "update_employee",
      identifier: adminId,
    },
    async () => {
      let roleLevel: RoleLevel = "staff";
      const r = (data.role || data.designation || "").toLowerCase();
      if (r.includes("super admin") || r.includes("admin")) {
        roleLevel = "admin";
      } else if (r.includes("manager")) {
        roleLevel = "manager";
      } else {
        roleLevel = "emp";
      }

      const employee = await upsertEmployee({
        id: data.id,
        full_name: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone ?? null,
        department: data.department,
        role: data.role.trim(),
        designation: data.designation.trim() || data.role.trim(),
        status: data.status,
        role_level: roleLevel,
        permissions: data.permissions,
      });

      revalidatePath("/dashboard/employees");
      revalidatePath("/dashboard/employees/departments");
      return { success: true as const, employee };
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}

export async function updateEmployeePermissionsAction(
  employeeId: string,
  department: EmployeeDepartment,
  role: string,
  designation: string,
  status: EmployeeStatus,
  permissions: PermissionKey[]
) {
  return updateEmployeeAction({
    id: employeeId,
    fullName: "",
    email: "",
    department,
    role,
    designation,
    status,
    permissions,
  });
}

export async function toggleEmployeeStatusAction(employeeId: string) {
  const session = await requireRole("admin");
  await requirePermission("employees:write");

  const adminId = session.user?.id || session.profile?.id || "admin";

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "toggle_employee_status",
      identifier: adminId,
    },
    async () => {
      const employee = await toggleEmployeeStatus(employeeId);
      if (!employee) {
        return { success: false as const, error: "Employee not found" };
      }
      revalidatePath("/dashboard/employees");
      revalidatePath("/dashboard/employees/departments");
      return { success: true as const, employee };
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}

export async function deleteEmployeeAction(employeeId: string) {
  const session = await requireRole("admin");
  await requirePermission("employees:write");

  const adminId = session.user?.id || session.profile?.id || "admin";

  const result = await withRateLimit(
    {
      endpointType: "user",
      actionName: "delete_employee",
      identifier: adminId,
    },
    async () => {
      await deleteEmployee(employeeId);
      revalidatePath("/dashboard/employees");
      revalidatePath("/dashboard/employees/departments");
      return { success: true as const };
    }
  );

  if ("error" in result && !("success" in result)) {
    return { success: false as const, error: result.error };
  }
  return result;
}
