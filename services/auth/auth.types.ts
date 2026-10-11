import type { Role } from "@genz/types";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  fullName?: string;
  phone?: string;
  accountStatus: "active" | "pending" | "suspended";
}

// Backward-compatibility alias
export type IdentityUser = AuthUser;

export interface AuthSessionContext {
  userId: string;
  email: string;
  role: Role;
}

export interface ProvisionAuthUserInput {
  email: string;
  password?: string;
  role: Role;
  metadata?: Record<string, unknown>;
}

export interface ProvisionAuthUserResult {
  userId: string;
  email: string;
  password?: string;
  isNewUser: boolean;
}
