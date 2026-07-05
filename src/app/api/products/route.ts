import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DISCOVER_PAGE_SIZE as PAGE_SIZE } from "@/lib/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const ageGroup = searchParams.get("age_group")?.trim() ?? "";
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0);

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (q) {
    // websearch_to_tsquery handles natural phrases ("wooden puzzle") and
    // quoted/boolean input gracefully, which is what shoppers actually type.
    query = query.textSearch("search_vector", q, {
      type: "websearch",
      config: "english",
    });
  }
  if (category) query = query.eq("category", category);
  if (ageGroup) query = query.eq("age_group", ageGroup);
  if (minPrice) query = query.gte("price_inr", Number(minPrice));
  if (maxPrice) query = query.lte("price_inr", Number(maxPrice));

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }

  const products = data ?? [];
  const hasMore =
    count !== null ? from + products.length < count : products.length === PAGE_SIZE;

  return NextResponse.json({ products, count: count ?? products.length, hasMore });
}
