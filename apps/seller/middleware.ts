import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: process.env.NEXT_PUBLIC_COOKIE_NAME || "sb-genz-seller-auth",
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

  const path = request.nextUrl.pathname;
  const isAuthOnly = path.startsWith("/login") || path.startsWith("/signup");
  const isAuthCallback = path.startsWith("/auth/");

  if (isAuthCallback) {
    return supabaseResponse;
  }

  if (!user && !isAuthOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || "buyer";

    if (isAuthOnly) {
      if (role === "seller" || role === "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        if (url.pathname !== path) {
          return NextResponse.redirect(url);
        }
      }
      // If user is a buyer on /login, allow them to view /login without looping
      return supabaseResponse;
    }

    if (!isAuthOnly && role !== "seller" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "forbidden_seller_only");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
