import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, user_agent } = body;

    if (!path) {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }

    const supabase = await createClient();

    await supabase.from("page_views").insert({
      path,
      referrer: referrer || null,
      user_agent: user_agent || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
