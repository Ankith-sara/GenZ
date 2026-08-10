import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getRoleHost(
  currentHost: string,
  targetRole: "admin" | "seller" | "buyer"
): string {
  const hostLower = currentHost.toLowerCase();
  const isSubdomainAdmin =
    hostLower.startsWith("admin.") || hostLower.startsWith("admin-");
  const isSubdomainSeller =
    hostLower.startsWith("seller.") || hostLower.startsWith("seller-");

  if (targetRole === "admin" && isSubdomainSeller) {
    return currentHost.replace(/^seller([-.])/i, "admin$1");
  }
  if (targetRole === "seller" && isSubdomainAdmin) {
    return currentHost.replace(/^admin([-.])/i, "seller$1");
  }
  if (targetRole === "buyer" && (isSubdomainAdmin || isSubdomainSeller)) {
    return currentHost.replace(/^(admin|seller)[-.]/i, "");
  }
  return currentHost;
}

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
    const validRoles = ["buyer", "seller", "admin"];
    const safeMetaRole =
      typeof metaRole === "string" &&
      validRoles.includes(metaRole) &&
      metaRole !== "admin"
        ? metaRole
        : undefined;
    const resolved = profileRole ?? safeMetaRole ?? "buyer";

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[middleware] path=${path}, uid=${user.id}, profile_role=${profileRole ?? "NULL"}, meta_role=${safeMetaRole ?? "NULL"}, resolved=${resolved}, profile_error=${profileError?.message ?? "none"}`
      );
    }

    return resolved;
  }

  // 2. Subdomain Detection (e.g., admin.genzonline.in, seller.genzonline.in, admin.localhost:3000)
  const host = (request.headers.get("host") || "").toLowerCase();
  let subdomain: "admin" | "seller" | null = null;
  if (host.startsWith("admin.") || host.startsWith("admin-")) {
    subdomain = "admin";
  } else if (host.startsWith("seller.") || host.startsWith("seller-")) {
    subdomain = "seller";
  }

  // 3. If user is already authenticated and has error/code in URL,
  // redirect them directly to their appropriate dashboard
  if (user && (code || errorParam)) {
    const role = await resolveRole();
    const targetHost = getRoleHost(host, role as "admin" | "seller" | "buyer");
    const targetPath =
      role === "admin"
        ? "/admin/dashboard"
        : role === "seller"
          ? "/seller/dashboard"
          : "/profile";
    const protocol = request.nextUrl.protocol;
    if (targetHost !== host) {
      return NextResponse.redirect(`${protocol}//${targetHost}${targetPath}`);
    }
    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = targetPath;
    return NextResponse.redirect(url);
  }

  // 4. Subdomain Root & Path Rewrites
  if (subdomain === "admin") {
    if (path === "/") {
      const url = request.nextUrl.clone();
      if (!user) {
        url.pathname = "/login";
        url.searchParams.set("redirectTo", "/admin/dashboard");
        return NextResponse.redirect(url);
      }
      url.pathname = "/admin/dashboard";
      return NextResponse.rewrite(url);
    }
  }

  if (subdomain === "seller") {
    if (path === "/") {
      const url = request.nextUrl.clone();
      if (!user) {
        url.pathname = "/login";
        url.searchParams.set("redirectTo", "/seller/dashboard");
        return NextResponse.redirect(url);
      }
      url.pathname = "/seller/dashboard";
      return NextResponse.rewrite(url);
    }
  }

  const isAuthOnly = path.startsWith("/login") || path.startsWith("/signup");
  const isAuthCallback = path.startsWith("/auth/");

  const isProtected =
    !isAuthOnly &&
    !isAuthCallback &&
    (path.startsWith("/dashboard") ||
      path.startsWith("/admin") ||
      path.startsWith("/seller/dashboard") ||
      subdomain === "admin" ||
      subdomain === "seller");

  const isAdminPath =
    subdomain === "admin" || path.startsWith("/admin/dashboard") || path === "/admin";
  const isSellerPath =
    subdomain === "seller" ||
    path.startsWith("/seller/dashboard") ||
    path.startsWith("/dashboard");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set(
      "redirectTo",
      path === "/"
        ? subdomain === "admin"
          ? "/admin/dashboard"
          : "/seller/dashboard"
        : path
    );
    return NextResponse.redirect(url);
  }

  if (user) {
    const role = await resolveRole();

    // Redirection on Login / Signup pages
    if (isAuthOnly) {
      const redirectTo = request.nextUrl.searchParams.get("redirectTo");
      const protocol = request.nextUrl.protocol;

      if (role === "admin") {
        const targetHost = getRoleHost(host, "admin");
        const targetPath =
          redirectTo && redirectTo.startsWith("/admin")
            ? redirectTo
            : "/admin/dashboard";
        if (targetHost !== host) {
          return NextResponse.redirect(`${protocol}//${targetHost}${targetPath}`);
        }
        const url = request.nextUrl.clone();
        url.pathname = targetPath;
        url.search = "";
        return NextResponse.redirect(url);
      }

      if (role === "seller") {
        const targetHost = getRoleHost(host, "seller");
        const targetPath =
          redirectTo && redirectTo.startsWith("/seller")
            ? redirectTo
            : "/seller/dashboard";
        if (targetHost !== host) {
          return NextResponse.redirect(`${protocol}//${targetHost}${targetPath}`);
        }
        const url = request.nextUrl.clone();
        url.pathname = targetPath;
        url.search = "";
        return NextResponse.redirect(url);
      }

      // Buyer
      const targetHost = getRoleHost(host, "buyer");
      const targetPath =
        redirectTo &&
        redirectTo.startsWith("/") &&
        !redirectTo.startsWith("/admin") &&
        !redirectTo.startsWith("/seller")
          ? redirectTo
          : "/profile";
      if (targetHost !== host) {
        return NextResponse.redirect(`${protocol}//${targetHost}${targetPath}`);
      }
      const url = request.nextUrl.clone();
      url.pathname = targetPath;
      url.search = "";
      return NextResponse.redirect(url);
    }

    // 1. Admin paths / admin subdomain: strictly admin only.
    if (isAdminPath && role !== "admin") {
      const protocol = request.nextUrl.protocol;
      if (role === "seller") {
        const targetHost = getRoleHost(host, "seller");
        if (targetHost !== host) {
          return NextResponse.redirect(`${protocol}//${targetHost}/seller/dashboard`);
        }
        const url = request.nextUrl.clone();
        url.pathname = "/seller/dashboard";
        return NextResponse.redirect(url);
      } else {
        const targetHost = getRoleHost(host, "buyer");
        if (targetHost !== host) {
          return NextResponse.redirect(`${protocol}//${targetHost}/profile`);
        }
        const url = request.nextUrl.clone();
        url.pathname = "/profile";
        return NextResponse.redirect(url);
      }
    }

    // 2. Seller paths / seller subdomain: admin and seller can access. Buyers restricted.
    if (isSellerPath && role === "buyer") {
      const protocol = request.nextUrl.protocol;
      const targetHost = getRoleHost(host, "buyer");
      if (targetHost !== host) {
        return NextResponse.redirect(`${protocol}//${targetHost}/profile`);
      }
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
