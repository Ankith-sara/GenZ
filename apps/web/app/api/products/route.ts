import { NextResponse, type NextRequest } from "next/server";
import { DISCOVER_PAGE_SIZE as PAGE_SIZE } from "@genz/utils/products";
import { checkRateLimit, logRateLimitAttempt } from "@genz/utils/rate-limiter";
import { apiClient } from "@genz/api-client";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().max(100).optional().default(""),
  category: z.string().max(50).optional().default(""),
  min_price: z.preprocess(
    (val) => (val === null || val === "" ? undefined : Number(val)),
    z.number().nonnegative().optional()
  ),
  max_price: z.preprocess(
    (val) => (val === null || val === "" ? undefined : Number(val)),
    z.number().nonnegative().optional()
  ),
  page: z.preprocess(
    (val) => (val === null || val === "" ? 0 : Number(val)),
    z.number().int().nonnegative().default(0)
  ),
});

export async function GET(request: NextRequest) {
  // 1. Rate Limiting Check
  const rateLimit = await checkRateLimit({
    endpointType: "public",
    actionName: "api_get_products",
  });
  if (rateLimit.blocked) {
    return NextResponse.json(
      { error: rateLimit.error || "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  // 2. Parse and Validate Query Parameters
  const { searchParams } = new URL(request.url);
  const rawParams = {
    q: searchParams.get("q") ?? "",
    category: searchParams.get("category") ?? "",
    min_price: searchParams.get("min_price"),
    max_price: searchParams.get("max_price"),
    page: searchParams.get("page") ?? "0",
  };

  const validation = querySchema.safeParse(rawParams);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  const { q, category, min_price, max_price, page } = validation.data;

  // 3. Consume Centralized Fastify API
  try {
    const catalogResult = await apiClient.catalog.listProducts({
      q,
      category,
      minPrice: min_price,
      maxPrice: max_price,
      page,
      limit: PAGE_SIZE,
    });

    await logRateLimitAttempt({
      endpointType: "public",
      actionName: "api_get_products",
    });

    return NextResponse.json({
      products: catalogResult.products,
      count: catalogResult.totalCount,
      hasMore: catalogResult.hasMore,
    });
  } catch (apiErr: unknown) {
    console.error("GET /api/products backend API error:", apiErr);
    return NextResponse.json(
      {
        error:
          apiErr instanceof Error
            ? apiErr.message
            : "Failed to fetch products from backend API.",
      },
      { status: 502 }
    );
  }
}
