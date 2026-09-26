import type {
  RoleDefinition,
  RoleLevel,
  PermissionKey,
} from "@genz/types";
import { PREDEFINED_ROLES } from "@genz/types";
import { getEmployeesList } from "./employees";
import { createAdminClient } from "./admin";
import fs from "fs";
import path from "path";

function getRolesStoragePath(): string {
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST;
  const fileName = isTest ? "test-roles-store.json" : "roles-store.json";
  const primaryDir = path.resolve(process.cwd(), "packages/database/src/storage");
  if (fs.existsSync(primaryDir)) {
    return path.join(primaryDir, fileName);
  }
  const altDir = path.resolve(process.cwd(), "../../packages/database/src/storage");
  if (fs.existsSync(altDir)) {
    return path.join(altDir, fileName);
  }
  try {
    fs.mkdirSync(primaryDir, { recursive: true });
    return path.join(primaryDir, fileName);
  } catch {
    return path.resolve(process.cwd(), fileName);
  }
}

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: "role-super-admin",
    name: "Super Administrator",
    code: "SUPER_ADMIN",
    description: "Complete master administrative access across all system modules, governance, and audit trails",
    role_level: "admin",
    is_system: true,
    permissions: PREDEFINED_ROLES.super_admin.permissions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role-crm-manager",
    name: "CRM Manager",
    code: "CRM_MANAGER",
    description: "Full management over Seller Acquisition CRM, artisan sourcing, leads pipeline, and merchant KYC verification",
    role_level: "manager",
    is_system: true,
    permissions: PREDEFINED_ROLES.crm_manager.permissions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role-operation-manager",
    name: "Operation Manager",
    code: "OPERATION_MANAGER",
    description: "Full operational authority over customer Orders fulfillment, catalog Products curation, Kanban tasks, and logistics dispatches",
    role_level: "manager",
    is_system: true,
    permissions: PREDEFINED_ROLES.operation_manager.permissions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function readLocalRoles(): RoleDefinition[] {
  try {
    const filePath = getRolesStoragePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw) as RoleDefinition[];
      if (parsed && parsed.length > 0) {
        // Ensure default roles are always merged
        const list = [...parsed];
        for (const def of DEFAULT_ROLES) {
          if (!list.some((r) => r.code === def.code || r.id === def.id)) {
            list.unshift({ ...def });
          }
        }
        return list;
      }
    }
  } catch (err) {
    console.error("[RolesRepo] Local read fallback error:", err);
  }
  return DEFAULT_ROLES.map((r) => ({ ...r }));
}

function writeLocalRoles(roles: RoleDefinition[]) {
  try {
    const filePath = getRolesStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(roles, null, 2), "utf-8");
  } catch (err) {
    console.error("[RolesRepo] Local write fallback error:", err);
  }
}

export async function getRolesList(): Promise<RoleDefinition[]> {
  const employees = await getEmployeesList();
  let roles: RoleDefinition[] = [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as any)
      .from("roles")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      roles = data as RoleDefinition[];
    }
  } catch (err) {}

  if (roles.length === 0) {
    roles = readLocalRoles();
  }

  // Calculate dynamic member count from employees
  return roles.map((r) => {
    const count = employees.filter((e) => {
      const empRole = e.role?.toLowerCase() || "";
      const empRoleId = e.role_id?.toLowerCase() || "";
      const rCode = r.code?.toLowerCase();
      const rName = r.name?.toLowerCase();
      const rId = r.id?.toLowerCase();

      return (
        empRoleId === rId ||
        empRole === rCode ||
        empRole === rName ||
        (rCode === "super_admin" && (empRole.includes("super admin") || e.role_level === "admin")) ||
        (rCode === "crm_manager" && empRole.includes("crm")) ||
        (rCode === "operation_manager" && (empRole.includes("operation") || empRole.includes("ops")))
      );
    }).length;

    return {
      ...r,
      member_count: Math.max(r.member_count ?? 0, count),
    };
  });
}

export async function getRoleById(id: string): Promise<RoleDefinition | null> {
  const roles = await getRolesList();
  return roles.find((r) => r.id === id || r.code.toLowerCase() === id.toLowerCase()) || null;
}

export async function upsertRole(
  role: Partial<RoleDefinition> & { name: string; code: string; role_level?: RoleLevel }
): Promise<RoleDefinition> {
  const now = new Date().toISOString();
  const id = role.id || `role-${role.code.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

  const fullRole: RoleDefinition = {
    id,
    name: role.name.trim(),
    code: role.code.toUpperCase().trim(),
    description: role.description || "",
    role_level: role.role_level || "staff",
    permissions: role.permissions || [],
    is_system: role.is_system ?? false,
    member_count: role.member_count ?? 0,
    created_at: role.created_at || now,
    updated_at: now,
  };

  try {
    const supabase = createAdminClient();
    const { error } = await (supabase as any).from("roles").upsert(fullRole);
    if (!error) {
      return fullRole;
    }
  } catch (err) {}

  const list = readLocalRoles();
  const idx = list.findIndex((r) => r.id === fullRole.id || r.code === fullRole.code);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...fullRole, updated_at: now };
  } else {
    list.push(fullRole);
  }
  writeLocalRoles(list);
  return fullRole;
}

export async function deleteRole(id: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    await (supabase as any).from("roles").delete().eq("id", id);
  } catch (err) {}

  const list = readLocalRoles();
  const filtered = list.filter((r) => r.id !== id && r.code !== id);
  writeLocalRoles(filtered);
  return true;
}
