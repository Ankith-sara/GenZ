import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, logRateLimitAttempt } from "@genz/utils/rate-limiter";
import { apiClient } from "@genz/api-client";
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

  // 2. Consume Centralized Fastify API
  try {
    const searchResult = await apiClient.search.searchProducts({
      q: cleanQ,
      limit: 8,
    });

    await logRateLimitAttempt({
      endpointType: "public",
      actionName: "api_search_products",
    });

    return NextResponse.json(searchResult);
  } catch (apiErr: unknown) {
    console.error("GET /api/search backend API error:", apiErr);
    return NextResponse.json(
      {
        error:
          apiErr instanceof Error
            ? apiErr.message
            : "Search query failed via backend API.",
      },
      { status: 502 }
    );
  }
}
