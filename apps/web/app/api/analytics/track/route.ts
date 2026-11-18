import { NextRequest, NextResponse } from "next/server";
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
    } catch (apiErr: unknown) {
      console.error("[trackPageView] Backend API error:", apiErr);
      return NextResponse.json(
        { error: apiErr instanceof Error ? apiErr.message : "Tracking failed" },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
