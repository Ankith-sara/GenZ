import type { PermissionKey } from "@genz/types";

/**
 * Which employee permission each admin route needs. Admins (and admin-level
 * employees) pass every check; `emp` staff only see and open what they hold.
 * Pages enforce this server-side with requirePermission(); the sidebar uses the
 * same map so staff are never shown links they cannot open.
 *
 * Ordered most specific first — the first matching prefix wins.
 */
export const ADMIN_ROUTE_PERMISSIONS: ReadonlyArray<readonly [string, PermissionKey]> = [
  ["/dashboard/crm/settings", "crm:admin"],
  ["/dashboard/crm", "crm:read"],
  ["/dashboard/contact", "crm:read"],
  ["/dashboard/waitlist", "crm:read"],
  ["/dashboard/tasks", "tasks:read"],
  ["/dashboard/employees", "employees:read"],
  ["/dashboard/roles", "employees:read"],
  ["/dashboard/products", "products:read"],
  ["/dashboard/operations/settings", "system:write"],
  ["/dashboard/operations", "orders:read"],
  ["/dashboard/orders", "orders:read"],
  ["/dashboard/refunds", "orders:read"],
  ["/dashboard/verifications", "verifications:read"],
  ["/dashboard/finance", "system:read"],
  ["/dashboard/reports", "system:read"],
  ["/dashboard/users", "system:read"],
  ["/dashboard/settings", "system:write"],
  ["/dashboard?view=", "system:read"],
];

/** Permission needed for an href, or null when any staff member may open it. */
export function permissionForHref(href: string): PermissionKey | null {
  for (const [prefix, permission] of ADMIN_ROUTE_PERMISSIONS) {
    const matches = prefix.endsWith("=")
      ? href.startsWith(prefix)
      : href === prefix || href.startsWith(`${prefix}/`) || href.startsWith(`${prefix}?`);
    if (matches) return permission;
  }
  return null;
}

export interface StaffAccess {
  isAdmin: boolean;
  permissions: PermissionKey[];
}

export function canOpenHref(access: StaffAccess, href: string): boolean {
  if (access.isAdmin) return true;
  const needed = permissionForHref(href);
  return needed === null || access.permissions.includes(needed);
}
