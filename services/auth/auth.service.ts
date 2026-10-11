import { createAdminClient } from "@genz/database/admin";
import type { Role } from "@genz/types";
import { AuthRepository } from "./auth.repository";
import type {
  AuthUser,
  ProvisionAuthUserInput,
  ProvisionAuthUserResult,
} from "./auth.types";

export class AuthService {
  /**
   * Generates a cryptographically strong random password for provisioning.
   */
  static generateSecurePassword(length = 14): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => chars[byte % chars.length]).join("");
  }

  /**
   * Safely searches for an existing auth user by email across pages
   * or creates a new auth user, and sets role metadata and profile.
   */
  static async provisionOrUpdateAuthUser(
    input: ProvisionAuthUserInput
  ): Promise<ProvisionAuthUserResult> {
    const admin = createAdminClient();
    const normalizedEmail = input.email.trim().toLowerCase();
    const password = input.password || this.generateSecurePassword(14);

    let existingId: string | null = null;
    let existingMeta: Record<string, unknown> = {};

    let page = 1;
    while (page <= 10) {
      const { data: pageData, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (error || !pageData?.users || pageData.users.length === 0) break;

      const found = pageData.users.find(
        (u: { email?: string }) => u.email?.toLowerCase() === normalizedEmail
      );
      if (found) {
        existingId = found.id;
        existingMeta = (found.user_metadata as Record<string, unknown>) || {};
        break;
      }
      if (pageData.users.length < 1000) break;
      page++;
    }

    let userId: string;
    let isNewUser = false;

    if (existingId) {
      const { data: updateData, error: updateError } =
        await admin.auth.admin.updateUserById(existingId, {
          password,
          user_metadata: {
            ...existingMeta,
            ...input.metadata,
            role: input.role,
          },
        });

      if (updateError || !updateData?.user) {
        throw new Error(
          `Failed to update auth credentials: ${updateError?.message || "Unknown error"}`
        );
      }
      userId = updateData.user.id;
    } else {
      const { data: createData, error: createError } =
        await admin.auth.admin.createUser({
          email: normalizedEmail,
          password,
          email_confirm: true,
          user_metadata: {
            ...input.metadata,
            role: input.role,
          },
        });

      if (createError || !createData?.user) {
        throw new Error(
          `Failed to create auth user: ${createError?.message || "Unknown error"}`
        );
      }
      userId = createData.user.id;
      isNewUser = true;
    }

    // Ensure database profile is synchronized
    await AuthRepository.upsertProfile({
      id: userId,
      role: input.role,
      full_name: (input.metadata?.full_name as string) || undefined,
      phone: (input.metadata?.phone as string) || undefined,
      account_status: "active",
    });

    return {
      userId,
      email: normalizedEmail,
      password,
      isNewUser,
    };
  }

  /**
   * Verifies if a user has the expected role and active account status.
   */
  static async verifyUserAccess(
    userId: string,
    allowedRoles: Role[]
  ): Promise<{ authorized: boolean; user?: AuthUser; reason?: string }> {
    const user = await AuthRepository.getProfileById(userId);
    if (!user) {
      return { authorized: false, reason: "User profile not found" };
    }

    if (user.accountStatus !== "active") {
      return {
        authorized: false,
        user,
        reason: `Account is ${user.accountStatus}`,
      };
    }

    if (!allowedRoles.includes(user.role)) {
      return {
        authorized: false,
        user,
        reason: `Unauthorized: User role is ${user.role}`,
      };
    }

    return { authorized: true, user };
  }
}

// Backward-compatibility alias
export { AuthService as IdentityService };
