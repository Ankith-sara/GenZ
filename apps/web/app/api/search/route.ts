import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, logRateLimitAttempt } from "@genz/utils/rate-limiter";
import { SearchService } from "@genz/services/search";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().max(100).optional().default(""),
});

export async function GET(request: NextRequest) {
  // 1. Rate Limiting Check
  const rateLimit = await checkRateLimit({
    endpointType: "public",
    actionName: "api_search_products",
  });
  if (rateLimit.blocked) {
    return NextResponse.json(
      { error: rateLimit.error || "Too many search requests. Please slow down." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get("q") ?? "";

  const validation = querySchema.safeParse({ q: rawQ });
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  const cleanQ = validation.data.q.trim();

  try {
    const searchResult = await SearchService.searchProducts({
      query: cleanQ,
      limit: 8,
    });

    await logRateLimitAttempt({
      endpointType: "public",
      actionName: "api_search_products",
    });

    return NextResponse.json(searchResult);
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Search query failed." }, { status: 500 });
  }
}
