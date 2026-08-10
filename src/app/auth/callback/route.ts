import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/database";

async function ensureProfileCreated(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const meta = user.user_metadata ?? {};
      const role = (meta.role as "buyer" | "seller" | "admin") || "buyer";
      const dbRole = role === "seller" ? "manufacturer" : role;
      const fullName = meta.full_name || meta.fullName || null;

      await supabase.from("profiles").upsert({
        id: user.id,
        role: dbRole as Role,
        full_name: fullName,
        phone: meta.phone || null,
        city: meta.city || null,
        state: meta.state || null,
        pincode: meta.pincode || null,
      });

      if (role === "seller") {
        await supabase.from("seller_profiles").upsert({
          id: user.id,
          business_name: meta.business_name || meta.full_name || "Unnamed Business",
          gst_number: meta.gst_number || "PENDING",
          factory_address: meta.factory_address || null,
          state: meta.state || null,
          pincode: meta.pincode || null,
          status: "pending",
        });
      }
    }
  } catch (err) {
    console.error("Error creating profile in callback:", err);
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next");

  const supabase = await createClient();

  // 1. Check if user already has an active session from an earlier exchange
  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  let user = existingUser;

  // 2. If not logged in yet and code is present, exchange PKCE code for session
  if (code && !user) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      user = data.user;
    }
  }

  // 3. Ensure profile rows exist after successful authentication
  if (user) {
    await ensureProfileCreated(supabase);
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const roleParam = searchParams.get("role");
    const currentRole = profile?.role ?? user.user_metadata?.role;

    if (
      roleParam === "admin" ||
      currentRole === "admin" ||
      (next && next.startsWith("/admin"))
    ) {
      if (profile?.role !== "admin") {
        await supabase.from("profiles").upsert({ id: user.id, role: "admin" });
      }
      next = "/admin/dashboard";
    } else if (!next) {
      next =
        currentRole === "seller"
          ? "/dashboard"
          : currentRole === "buyer"
            ? "/profile"
            : "/dashboard";
    }

    const redirectPath = next ?? "/dashboard";
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
    } else {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  const authErrorParam =
    searchParams.get("error_description") ||
    searchParams.get("error") ||
    "Could not authenticate user";

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(authErrorParam)}`
  );
}
