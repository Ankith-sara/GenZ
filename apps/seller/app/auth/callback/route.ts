import { NextResponse } from "next/server";
import { createClient } from "@genz/database";
import { ensureProfileForCurrentUser } from "@genz/database/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  let next = requestedNext || "/dashboard";

  const supabase = await createClient();

  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  let user = existingUser;

  if (code && !user) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      user = data.user;
    }
  }

  if (user) {
    await ensureProfileForCurrentUser(supabase);
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const currentRole = profile?.role ?? "buyer";
    const isSupport =
      searchParams.get("support_session") === "true" ||
      requestedNext?.includes("support_session=true");

    if (currentRole === "seller" || currentRole === "admin") {
      next = requestedNext && requestedNext.startsWith("/dashboard") ? requestedNext : "/dashboard";
    } else {
      next = "/login?error=forbidden_seller_only";
    }

    const redirectPath = next;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    let targetUrl: string;
    if (isLocalEnv) {
      targetUrl = `${origin}${redirectPath}`;
    } else if (forwardedHost) {
      targetUrl = `https://${forwardedHost}${redirectPath}`;
    } else {
      targetUrl = `${origin}${redirectPath}`;
    }

    const response = NextResponse.redirect(targetUrl);
    if (isSupport) {
      response.cookies.set("support_session", "true", {
        path: "/",
        maxAge: 3600 * 2,
        httpOnly: false,
        sameSite: "lax",
      });
    }
    return response;
  }

  const authErrorParam =
    searchParams.get("error_description") ||
    searchParams.get("error") ||
    "Could not authenticate user";

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(authErrorParam)}`
  );
}
