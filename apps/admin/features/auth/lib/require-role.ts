import "server-only";
export {
  requireRole,
  requirePermission,
  getEmployeeForSession,
  hasPermission,
  type AuthenticatedSession,
} from "@genz/database/authorization";
