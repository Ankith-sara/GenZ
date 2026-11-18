import { getSupabaseClient, getSupabaseAdminClient } from "../../integrations/supabase";
import { UnauthorizedError, ValidationError } from "../../common/errors";

export class AuthService {
  static async loginWithPassword(email: string, pass: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error || !data.session) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // Resolve authoritative role from profiles table
    let role = "buyer";
    try {
      const admin = getSupabaseAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.role) role = profile.role;
    } catch {
      role = (data.user.user_metadata?.role as string) || "buyer";
    }

    return {
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
        expiresAt: data.session.expires_at,
        tokenType: data.session.token_type,
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        role,
        fullName: data.user.user_metadata?.full_name || null,
      },
    };
  }

  static async sendOtp(email: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      throw new ValidationError(error.message || "Failed to send verification code.");
    }

    return { message: "Verification code sent to your email." };
  }

  static async verifyLoginOtp(email: string, token: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedError("Invalid or expired verification code.");
    }

    const authUser = data.user;

    let role = "buyer";
    try {
      const admin = getSupabaseAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .maybeSingle();
      if (profile?.role) role = profile.role;
    } catch {
      role = (authUser.user_metadata?.role as string) || "buyer";
    }

    return {
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
        expiresAt: data.session.expires_at,
      },
      user: {
        id: authUser.id,
        email: authUser.email,
        role,
        fullName: authUser.user_metadata?.full_name || null,
      },
    };
  }

  static async signup(email: string, fullName: string, password?: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || "",
      options: {
        data: {
          full_name: fullName,
          role: "buyer",
        },
      },
    });

    if (error) {
      throw new ValidationError(error.message || "Failed to create account.");
    }

    if (data.user) {
      const admin = getSupabaseAdminClient();
      await admin.from("profiles").upsert({
        id: data.user.id,
        role: "buyer",
        full_name: fullName,
      });
    }

    return {
      message: "Account created successfully.",
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            fullName,
            role: "buyer",
          }
        : null,
    };
  }

  static async verifySignupOtp(email: string, token: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error || !data.user) {
      throw new UnauthorizedError("Invalid or expired verification code.");
    }

    const admin = getSupabaseAdminClient();
    const fullName = data.user.user_metadata?.full_name || null;

    // Self-signup is always a buyer. Seller and admin roles are granted only by an admin.
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!existingProfile) {
      await admin.from("profiles").insert({
        id: data.user.id,
        role: "buyer",
        full_name: fullName,
      });
    }

    return {
      session: data.session
        ? {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
          }
        : null,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: existingProfile?.full_name || fullName,
        role: existingProfile?.role || "buyer",
      },
    };
  }

  static async sendPasswordReset(email: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new ValidationError(error.message || "Failed to initiate password reset.");
    }
    return { message: "Password reset instructions sent." };
  }

  static async resetPasswordWithOtp(email: string, token: string, newPass: string) {
    const supabase = getSupabaseClient();
    const { data, error: otpError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });

    if (otpError || !data.user) {
      throw new UnauthorizedError("Invalid or expired recovery code.");
    }

    const admin = getSupabaseAdminClient();
    const { error: updateError } = await admin.auth.admin.updateUserById(data.user.id, {
      password: newPass,
    });

    if (updateError) {
      throw new ValidationError(updateError.message || "Failed to update password.");
    }

    return { message: "Password reset successfully." };
  }

  static async updatePassword(userId: string, newPass: string) {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: newPass,
    });

    if (error) {
      throw new ValidationError(error.message || "Failed to update password.");
    }

    return { message: "Password updated successfully." };
  }

  static async getCurrentUser(userId: string) {
    const admin = getSupabaseAdminClient();
    const [authRes, profileRes] = await Promise.all([
      admin.auth.admin.getUserById(userId),
      admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);

    if (!authRes.data?.user) {
      throw new UnauthorizedError("User session not found");
    }

    const user = authRes.data.user;
    const profile = profileRes.data || null;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || (user.user_metadata?.role as string) || "buyer",
        fullName:
          profile?.full_name || (user.user_metadata?.full_name as string) || null,
        phone: profile?.phone || (user.user_metadata?.phone as string) || null,
        city: profile?.city || null,
        avatarUrl:
          profile?.avatar_url || (user.user_metadata?.avatar_url as string) || null,
        createdAt: profile?.created_at || user.created_at,
      },
      profile,
    };
  }
}
