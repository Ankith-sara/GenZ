import "server-only";
import { redirect } from "next/navigation";
import type { Role, PermissionKey } from "@genz/types";
import { getUserAndProfile } from "./auth";

/**
 * Requires an authenticated user session.
 * Throws an Error if unauthenticated.
 */
export async function requireUser() {
  const session = await getUserAndProfile();
  if (!session || !session.user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return session;
}

/**
 * Requires an authenticated seller user.
 * Throws an Error if unauthenticated or not a seller/admin.
 */
export async function requireSeller() {
  const session = await requireUser();
  const role = session.profile?.role ?? session.user.user_metadata?.role;
  if (role !== "seller" && role !== "admin") {
    throw new Error("Forbidden: Seller authorization required");
  }
  return session;
}

/**
 * Requires an authenticated admin user.
 * Throws an Error if unauthenticated or not an admin.
 */
export async function requireAdmin() {
  const session = await requireUser();
  const role = session.profile?.role ?? session.user.user_metadata?.role;
  if (role !== "admin") {
    throw new Error("Forbidden: Admin authorization required");
  }
  return session;
}

/**
 * Requires that the authenticated user owns the resource or is an admin.
 */
export async function requireSellerOwnership(resourceSellerId: string) {
  const session = await requireSeller();
  const role = session.profile?.role ?? session.user.user_metadata?.role;
  if (role === "admin") return session;
  if (session.userId !== resourceSellerId) {
    throw new Error(
      "Forbidden: You do not have permission to access or modify this seller's resources"
    );
  }
  return session;
}

/**
 * Shared RBAC guard for role-specific dashboard pages and server actions.
 * Evaluates the required role against the user profile/metadata and redirects
 * appropriately if unauthorized.
 *
 * Role hierarchy & permissions:
 * - admin: access to all roles ('admin', 'seller', 'buyer')
 * - emp: internal employee access to dashboard shell ('admin') and page-level permission checks
 * - seller: access to 'seller' and 'buyer'
 * - buyer: access to 'buyer'
 */
export async function requireRole(
  allowed: Role,
  options?: { redirectOnUnauthenticated?: string; redirectOnForbidden?: string }
) {
  const session = await getUserAndProfile();
  if (!session) {
    redirect(options?.redirectOnUnauthenticated ?? "/login");
  }

  const user = session.user;
  const role = (session.profile?.role ?? user?.user_metadata?.role ?? "buyer") as Role;

  const isAllowed =
    role === "admin" ||
    (role === "emp" && allowed === "admin") ||
    (role === "seller" && (allowed === "seller" || allowed === "buyer")) ||
    (role === "buyer" && allowed === "buyer");

  if (!isAllowed) {
    if (options?.redirectOnForbidden) {
      redirect(options.redirectOnForbidden);
    }
    if (allowed === "admin") {
      redirect("/login?error=forbidden_admin_only");
    }
    if (allowed === "seller") {
      redirect("/login?error=forbidden_seller_only");
    }
    if (role === "seller") {
      redirect("/seller/dashboard");
    }
    redirect("/profile");
  }

  return session;
}

/**
 * Checks employee record and permissions for internal admin dashboard features.
 */
export async function getEmployeeForSession() {
  const session = await requireRole("admin");
  const { getEmployeesList } = await import("./employees");
  const employees = await getEmployeesList();
  
  const userEmail = session.user?.email?.toLowerCase();
  const userId = session.userId;
  
  const matched = employees.find(
    (e) => e.id === userId || (userEmail && e.email.toLowerCase() === userEmail)
  );

  return {
    session,
    employee: matched || {
      id: userId,
      employee_code: "GZ-ADM-001",
      full_name: session.profile?.full_name || "Admin User",
      email: userEmail || "admin@genz.in",
      department: "admin" as const,
      designation: "Administrator",
      role: "Super Admin",
      status: "active" as const,
      role_level: "admin" as const,
      permissions: [
        "crm:read",
        "crm:write",
        "crm:delete",
        "crm:admin",
        "tasks:read",
        "tasks:write",
        "tasks:delete",
        "tasks:assign",
        "employees:read",
        "employees:write",
        "employees:delete",
        "products:read",
        "products:write",
        "products:delete",
        "orders:read",
        "orders:write",
        "orders:delete",
        "verifications:read",
        "verifications:write",
        "verifications:delete",
        "system:read",
        "system:write",
      ] as PermissionKey[],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

/**
 * Requires a specific module permission (e.g. "crm:read", "tasks:read", "orders:read").
 * - If user is full "admin" or has role_level "admin", granted automatically.
 * - If user is "emp", checks that the permission is present in their employee permissions array.
 */
export async function requirePermission(
  permission: PermissionKey,
  options?: { redirectOnForbidden?: string }
) {
  const { session, employee } = await getEmployeeForSession();
  const user = session.user;
  const role = (session.profile?.role ?? user?.user_metadata?.role) as Role;

  if (role === "admin" || employee.role_level === "admin") {
    return { session, employee };
  }

  if (employee.permissions && employee.permissions.includes(permission)) {
    return { session, employee };
  }

  if (options?.redirectOnForbidden) {
    redirect(options.redirectOnForbidden);
  }
  redirect("/dashboard?error=forbidden_permission");
}

/**
 * Synchronous client-safe helper to evaluate if employee has a permission.
 */
export function hasPermission(
  employee: { permissions?: PermissionKey[]; role_level?: string },
  permission: PermissionKey
): boolean {
  if (employee.role_level === "admin") return true;
  return Boolean(employee.permissions && employee.permissions.includes(permission));
}

