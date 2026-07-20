import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DISCOVER_PAGE_SIZE as PAGE_SIZE } from "@/lib/products";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().max(100).optional().default(""),
  category: z.string().max(50).optional().default(""),
  age_group: z.string().max(50).optional().default(""),
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
    age_group: searchParams.get("age_group") ?? "",
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

  const { q, category, age_group, min_price, max_price, page } = validation.data;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (q) {
    query = query.textSearch("search_vector", q, {
      type: "websearch",
      config: "english",
    });
  }
  if (category) query = query.eq("category", category);
  if (age_group) query = query.eq("age_group", age_group);
  if (min_price !== undefined) query = query.gte("price_inr", min_price);
  if (max_price !== undefined) query = query.lte("price_inr", max_price);

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  await logRateLimitAttempt({
    endpointType: "public",
    actionName: "api_get_products",
  });

  if (error) {
    console.error("GET /api/products database search error:", error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }

  const products = data ?? [];
  const hasMore =
    count !== null ? from + products.length < count : products.length === PAGE_SIZE;

  return NextResponse.json({ products, count: count ?? products.length, hasMore });
}
