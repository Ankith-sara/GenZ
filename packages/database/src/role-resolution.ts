import type { Role, RoleLevel } from "@genz/types";

/**
 * Trusted role resolution.
 *
 * `user_metadata` is writable by the signed-in user from the browser
 * (`supabase.auth.updateUser({ data })`), so it must NEVER grant a role.
 * Roles may only come from sources a user cannot write themselves:
 *
 * - `profiles.role` — protected by the `protect_profile_role` trigger and the
 *   signup trigger, which only accepts roles from `raw_app_meta_data`.
 * - `app_metadata.role` — writable only with the service-role key.
 * - An active row in the `employees` table — admin-only RLS.
 *
 * Staff are stored as `profiles.role = 'emp'`, but that alone grants nothing:
 * the `employees` row must be active, so deactivating an employee revokes
 * access immediately even if their profile still says "emp".
 */

export interface TrustedRoleInput {
  profileRole?: Role | string | null;
  appMetadataRole?: unknown;
  employee?: { status?: string | null; role_level?: RoleLevel | string | null } | null;
}

function asRole(value: unknown): Role | null {
  return value === "admin" ||
    value === "emp" ||
    value === "seller" ||
    value === "buyer" ||
    value === "customer"
    ? value
    : null;
}

export function resolveTrustedRole({
  profileRole,
  appMetadataRole,
  employee,
}: TrustedRoleInput): Role {
  const fromProfile = asRole(profileRole);
  const fromAppMeta = asRole(appMetadataRole);

  if (fromProfile === "admin" || fromAppMeta === "admin") return "admin";

  if (employee && employee.status === "active") {
    return employee.role_level === "admin" ? "admin" : "emp";
  }

  if (fromProfile === "seller" || fromAppMeta === "seller") return "seller";

  return "buyer";
}

/** Lightweight check for middleware, where the employees table is not readable. */
export function isStaffRole(role: Role): boolean {
  return role === "admin" || role === "emp";
}

export function canAccessRole(role: Role, allowed: Role): boolean {
  return (
    role === "admin" ||
    (role === "emp" && allowed === "admin") ||
    (role === "seller" && (allowed === "seller" || allowed === "buyer")) ||
    ((role === "buyer" || role === "customer") && allowed === "buyer")
  );
}
