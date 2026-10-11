import { createAdminClient } from "@genz/database/admin";
import type { Role } from "@genz/types";
import type { AuthUser } from "./auth.types";

export class AuthRepository {
  /**
   * Fetches the user profile by ID
   */
  static async getProfileById(userId: string): Promise<AuthUser | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("id, role, full_name, phone, account_status")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;

    // Fetch email from auth
    const { data: authData } = await admin.auth.admin.getUserById(userId);

    return {
      id: data.id,
      email: authData?.user?.email || "",
      role: (data.role as Role) || "buyer",
      fullName: data.full_name || undefined,
      phone: data.phone || undefined,
      accountStatus: (data.account_status as AuthUser["accountStatus"]) || "active",
    };
  }

  /**
   * Upserts the user profile
   */
  static async upsertProfile(profile: {
    id: string;
    role: Role;
    full_name?: string;
    phone?: string;
    account_status?: "active" | "pending" | "suspended";
  }): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").upsert(
      {
        id: profile.id,
        role: profile.role,
        full_name: profile.full_name,
        phone: profile.phone,
        account_status: profile.account_status || "active",
      },
      { onConflict: "id" }
    );

    if (error) {
      throw new Error(`Failed to upsert profile: ${error.message}`);
    }
  }
}

// Backward-compatibility alias
export { AuthRepository as IdentityRepository };
