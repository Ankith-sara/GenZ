import "server-only";
import { redirect } from "next/navigation";
import type { Role, PermissionKey } from "@genz/types";
import { getUserAndProfile } from "./auth";
import { resolveTrustedRole, canAccessRole } from "./role-resolution";

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
  const role = session.profile?.role;
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
  const role = session.profile?.role;
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
  const role = session.profile?.role;
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
export type AuthenticatedSession = NonNullable<Awaited<ReturnType<typeof getUserAndProfile>>>;

export async function requireRole(
  allowed: Role,
  options?: { redirectOnUnauthenticated?: string; redirectOnForbidden?: string }
): Promise<AuthenticatedSession> {
  const session = await getUserAndProfile();
  if (!session) {
    redirect(options?.redirectOnUnauthenticated ?? "/login");
    throw new Error("Unauthorized: Authentication required");
  }

  const user = session.user;
  const { findActiveEmployeeForAuth } = await import("./employees");
  const employee = await findActiveEmployeeForAuth(session.userId, user?.email);

  const role: Role = resolveTrustedRole({
    profileRole: session.profile?.role,
    appMetadataRole: user?.app_metadata?.role,
    employee,
  });

  if (session.profile) {
    session.profile.role = role;
  }

  const isAllowed = canAccessRole(role, allowed);

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
  const { findActiveEmployeeForAuth } = await import("./employees");

  const userEmail = session.user?.email?.toLowerCase();
  const userId = session.userId;

  const matched = await findActiveEmployeeForAuth(userId, userEmail);
  if (matched) {
    return { session, employee: matched };
  }

  // Staff without an employee record get no module permissions. Only a real
  // admin (resolved from trusted sources by requireRole) gets the full set.
  if (session.profile?.role !== "admin") {
    return {
      session,
      employee: {
        id: userId,
        employee_code: "GZ-EMP-UNLINKED",
        full_name: session.profile?.full_name || "Staff User",
        email: userEmail || "",
        department: "admin" as const,
        designation: "Unlinked staff account",
        role: "Staff",
        status: "active" as const,
        role_level: "staff" as const,
        permissions: [] as PermissionKey[],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  return {
    session,
    employee: {
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
  const role = session.profile?.role as Role;

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

/**
 * Decides whether a freshly signed-in user may use the admin portal, using the
 * same trusted sources as requireRole(): the protected profile row,
 * service-role app_metadata and the employees table. Keeps the staff markers in
 * sync so the edge middleware (which cannot read employees) agrees with it:
 * active employees get app_metadata.role = "emp"; a stale marker is cleared.
 */
export async function resolveStaffAccessForUser(user: {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
}): Promise<{ allowed: boolean; role: Role }> {
  const { createAdminClient } = await import("./admin");
  const { findActiveEmployeeForAuth } = await import("./employees");
  const supabase = createAdminClient();

  const [{ data: profile }, employee] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    findActiveEmployeeForAuth(user.id, user.email),
  ]);

  const appRole = user.app_metadata?.role;
  const role = resolveTrustedRole({
    profileRole: profile?.role,
    appMetadataRole: appRole,
    employee,
  });
  const allowed = role === "admin" || role === "emp";

  try {
    if (employee && appRole !== "emp" && appRole !== "admin") {
      await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, role: "emp" },
      });
    } else if (!employee && appRole === "emp") {
      await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, role: null },
      });
    }
  } catch (err) {
    console.error("[authorization] Staff marker sync failed:", err);
  }

  return { allowed, role };
}
