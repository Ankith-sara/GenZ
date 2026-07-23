import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function ensureProfileCreated(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const role =
        (user.user_metadata?.role as "buyer" | "manufacturer" | "admin") || "buyer";
      const fullName = user.user_metadata?.full_name || null;

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          role,
          full_name: fullName,
        });

        if (role === "manufacturer") {
          await supabase.from("manufacturer_profiles").insert({
            id: user.id,
            business_name: user.user_metadata?.business_name || "Unnamed Business",
            gst_number: user.user_metadata?.gst_number || "PENDING",
            factory_address: user.user_metadata?.factory_address || null,
            state: user.user_metadata?.state || null,
            pincode: user.user_metadata?.pincode || null,
            status: "pending",
          });
        }
      }
    }
  } catch (err) {
    console.error("Error creating profile upon email verification:", err);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as EmailOtpType | null) ?? "signup";
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  // 1. PKCE Authorization Code Exchange (most common for Supabase SSR)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await ensureProfileCreated(supabase);
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // 2. Token Hash Verification (OTP / magic link token_hash)
  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      await ensureProfileCreated(supabase);
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // 3. Raw Token + Email Verification fallback
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  if (token && email) {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    if (!error) {
      await ensureProfileCreated(supabase);
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // 4. Fallback for Client-Side Hash Fragment (#access_token=...)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Confirming Email...</title>
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #faf9f6; color: #111;">
        <div style="text-align: center; max-width: 400px; padding: 24px;">
          <h2 style="font-weight: 500; margin-bottom: 8px;">Verifying your email...</h2>
          <p style="color: #666; font-size: 14px;">Please wait while we log you into your account.</p>
        </div>
        <script>
          (async function() {
            try {
              const hash = window.location.hash;
              if (hash && hash.includes('access_token')) {
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                if (accessToken && refreshToken) {
                  const supabaseUrl = "${process.env.NEXT_PUBLIC_SUPABASE_URL || ""}";
                  const supabaseKey = "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}";
                  if (supabaseUrl && supabaseKey) {
                    const client = window.supabase.createClient(supabaseUrl, supabaseKey);
                    const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
                    if (!error) {
                      window.location.href = "${next}";
                      return;
                    }
                  }
                }
              }
            } catch (e) {
              console.error(e);
            }
            window.location.href = "/login?error=Could+not+verify+email+link";
          })();
        </script>
      </body>
    </html>
  `;

  return new NextResponse(htmlContent, {
    headers: { "Content-Type": "text/html" },
  });
}
