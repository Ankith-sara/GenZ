import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@genz/database";
import { apiClient } from "@genz/api-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, user_agent } = body;

    if (!path) {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }

    try {
      await apiClient.support.trackPageView({
        path,
        referrer: referrer || undefined,
        user_agent: user_agent || undefined,
      });
      return NextResponse.json({ ok: true });
    } catch {
      // Fallback to local DB insertion
      const supabase = await createClient();
      await supabase.from("page_views").insert({
        path,
        referrer: referrer || null,
        user_agent: user_agent || null,
      });
      return NextResponse.json({ ok: true });
    }
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
