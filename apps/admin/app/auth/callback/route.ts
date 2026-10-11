import { NextResponse } from "next/server";
import { createClient } from "@genz/database";
import { ensureProfileForCurrentUser } from "@genz/database/auth";
import { resolveStaffAccessForUser } from "@genz/database/authorization";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next");

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
    const { allowed } = await resolveStaffAccessForUser(user);

    if (allowed) {
      next = "/dashboard";
    } else {
      next = "/login?error=forbidden_admin_only";
    }

    const redirectPath = next;
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
