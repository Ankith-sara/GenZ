import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // 3. If user is authenticated, direct them to their target dashboard based on role
  if (user) {
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
        currentRole === "manufacturer"
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

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
