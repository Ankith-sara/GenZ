"use client";

import React, { type ReactNode } from "react";
import type { Role } from "@genz/types";

export interface PermissionGuardProps {
  currentRole: Role;
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditional UI renderer based on user authorization roles (admin, seller, buyer, customer).
 */
export function PermissionGuard({
  currentRole,
  allowedRoles,
  children,
  fallback = null,
}: PermissionGuardProps) {
  if (!allowedRoles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Helper to check role permissions in client components.
 */
export function hasRolePermission(
  currentRole: Role,
  allowedRoles: Role[]
): boolean {
  return allowedRoles.includes(currentRole);
}
