import { NextResponse } from "next/server";
import { createClient } from "@genz/database";
import { ensureProfileForCurrentUser } from "@genz/database/auth";

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
    await ensureProfileForCurrentUser(supabase);
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const currentRole = profile?.role ?? "buyer";

    if (currentRole === "admin") {
      next = "/admin/dashboard";
    } else if (!next || next.startsWith("/admin")) {
      // Non-admins cannot be redirected to /admin
      next = currentRole === "seller" ? "/seller/dashboard" : "/profile";
    }

    const redirectPath = next ?? "/profile";
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
