import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const code = request.nextUrl.searchParams.get("code");
  const errorParam = request.nextUrl.searchParams.get("error");
  const path = request.nextUrl.pathname;

  // 1. If incoming request has an auth code and is not already on /auth/callback,
  // rewrite internally to /auth/callback so code is exchanged in a single request without double-redirects
  if (code && !path.startsWith("/auth/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.rewrite(url);
  }

  // Helper to resolve role from profile + user metadata
  async function resolveRole(): Promise<string> {
    if (!user) return "buyer";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const profileRole = profile?.role;
    const metaRole = user.user_metadata?.role;
    const resolved = profileRole ?? metaRole ?? "buyer";

    console.log(
      `[middleware] path=${path}, user=${user.email}, profile_role=${profileRole ?? "NULL"}, meta_role=${metaRole ?? "NULL"}, resolved=${resolved}, profile_error=${profileError?.message ?? "none"}`
    );

    return resolved;
  }

  // 2. If user is already authenticated and has error/code in URL,
  // redirect them directly to their appropriate dashboard
  if (user && (code || errorParam)) {
    const role = await resolveRole();
    const url = request.nextUrl.clone();
    url.search = ""; // clear query params
    url.pathname =
      role === "admin"
        ? "/admin/dashboard"
        : role === "manufacturer"
          ? "/dashboard"
          : "/profile";
    return NextResponse.redirect(url);
  }

  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/admin/dashboard") ||
    (path.startsWith("/admin") &&
      !path.startsWith("/admin/login") &&
      !path.startsWith("/admin/signup"));
  const isAdminPath = path.startsWith("/admin/dashboard") || path === "/admin";
  const isAuthOnly =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/admin/login") ||
    path.startsWith("/admin/signup");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = path.startsWith("/admin") ? "/admin/login" : "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (user) {
    const role = await resolveRole();

    if (isAuthOnly) {
      const url = request.nextUrl.clone();
      if (role === "admin") {
        url.pathname = "/admin/dashboard";
      } else if (role === "manufacturer") {
        url.pathname = "/dashboard";
      } else {
        url.pathname = "/profile";
      }
      return NextResponse.redirect(url);
    }

    if (isAdminPath && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "manufacturer" ? "/dashboard" : "/profile";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/dashboard") && role === "buyer") {
      const url = request.nextUrl.clone();
      url.pathname = "/profile";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
