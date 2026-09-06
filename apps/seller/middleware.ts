import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: process.env.NEXT_PUBLIC_COOKIE_NAME || "sb-genz-auth-token",
      },
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

  const redirectWithCookies = (url: URL) => {
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
      });
    });
    return response;
  };

  const path = request.nextUrl.pathname;

  // Seller portal is strictly LOGIN ONLY. All registrations happen through the web marketplace.
  if (path.startsWith("/signup")) {
    const webUrl =
      process.env.NEXT_PUBLIC_WEB_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:4151");
    return NextResponse.redirect(new URL("/seller/signup", webUrl));
  }

  const isAuthOnly = path.startsWith("/login");
  const isAuthCallback = path.startsWith("/auth/");

  if (isAuthCallback) {
    return supabaseResponse;
  }

  if (!user && !isAuthOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return redirectWithCookies(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAuthorized =
      profile?.role === "seller" ||
      profile?.role === "admin" ||
      user.user_metadata?.role === "seller" ||
      user.user_metadata?.role === "admin";

    if (isAuthOnly) {
      if (isAuthorized) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        if (url.pathname !== path) {
          return redirectWithCookies(url);
        }
      }
      // If user is a buyer on /login, allow them to view /login without looping
      return supabaseResponse;
    }

    if (!isAuthOnly && !isAuthorized) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "forbidden_seller_only");
      return redirectWithCookies(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
