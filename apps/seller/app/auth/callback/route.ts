import { NextResponse } from "next/server";
import { createClient } from "@genz/database";
import type { Role } from "@genz/types";

async function ensureProfileCreated(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const meta = user.user_metadata ?? {};
      const rawRole = (meta.role as Role) || "buyer";
      const role: Role = rawRole === "admin" ? "buyer" : rawRole;
      const fullName = meta.full_name || meta.fullName || null;

      await supabase.from("profiles").upsert({
        id: user.id,
        role,
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
    if (process.env.NODE_ENV !== "production") {
      console.error("Error creating profile in callback:", err);
    }
  }
}

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
    await ensureProfileCreated(supabase);
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const currentRole = profile?.role ?? "buyer";

    if (currentRole === "seller" || currentRole === "admin") {
      next = "/dashboard";
    } else {
      next = "/login?error=forbidden_seller_only";
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
