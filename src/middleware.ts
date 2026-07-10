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

  // IMPORTANT: Avoid writing logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard
  // to debug issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = path.startsWith("/dashboard") || path.startsWith("/admin/dashboard");
  const isAdminPath = path.startsWith("/admin/dashboard");
  const isAuthOnly = path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/admin/login") || path.startsWith("/admin/signup");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = path.startsWith("/admin") ? "/admin/login" : "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (user) {
    // Fetch profile role to handle proper redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "buyer";

    if (isAuthOnly) {
      const url = request.nextUrl.clone();
      if (role === "admin") {
        url.pathname = "/admin/dashboard";
      } else if (role === "buyer") {
        url.pathname = "/profile";
      } else {
        url.pathname = "/dashboard";
      }
      return NextResponse.redirect(url);
    }

    if (isAdminPath && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "buyer" ? "/profile" : "/dashboard";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/dashboard") && role === "buyer") {
      const url = request.nextUrl.clone();
      url.pathname = "/profile";
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse;
}

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

