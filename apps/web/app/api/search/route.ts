import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@genz/database";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import {
  DEFAULT_PRODUCT_CATEGORIES,
  productMediaUrl,
} from "@/features/products/lib/products";
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

  // If query is empty, return empty results + categories
  if (!cleanQ) {
    return NextResponse.json({
      products: [],
      categories: DEFAULT_PRODUCT_CATEGORIES,
      totalCount: 0,
    });
  }

  const supabase = await createClient();

  // Find matching categories from the curated list
  const matchingCategories = DEFAULT_PRODUCT_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(cleanQ.toLowerCase())
  );

  // Robust multi-field search: match name, category, or description
  // Sanitize ILIKE pattern to avoid wildcards abuse
  const sanitizedTerm = cleanQ.replace(/[%_]/g, "");

  const { data, count, error } = await supabase
    .from("products")
    .select(
      "id, name, category, description, price_inr, cover_image_path, status, created_at",
      {
        count: "exact",
      }
    )
    .eq("status", "published")
    .or(
      `name.ilike.%${sanitizedTerm}%,category.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%`
    )
    .order("created_at", { ascending: false })
    .limit(8);

  await logRateLimitAttempt({
    endpointType: "public",
    actionName: "api_search_products",
  });

  if (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Search query failed." }, { status: 500 });
  }

  const formattedProducts = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price_inr: p.price_inr,
    image_url: productMediaUrl(p.cover_image_path),
  }));

  return NextResponse.json({
    products: formattedProducts,
    categories: matchingCategories,
    totalCount: count ?? formattedProducts.length,
  });
}
