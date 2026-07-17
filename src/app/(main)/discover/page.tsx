import { createClient } from "@/lib/supabase/server";
import { DISCOVER_PAGE_SIZE as PAGE_SIZE } from "@/lib/products";
import { DiscoverFilters } from "./discover-filters";
import { DiscoverFeed } from "./discover-feed";
import type { ProductFilters } from "./types";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    age_group?: string;
    min_price?: string;
    max_price?: string;
  }>;
}) {
  const params = await searchParams;
  const filters: ProductFilters = {
    q: params.q ?? "",
    category: params.category ?? "",
    age_group: params.age_group ?? "",
    min_price: params.min_price ?? "",
    max_price: params.max_price ?? "",
  };

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (filters.q) {
    query = query.textSearch("search_vector", filters.q, {
      type: "websearch",
      config: "english",
    });
  }
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.age_group) query = query.eq("age_group", filters.age_group);
  if (filters.min_price) query = query.gte("price_inr", Number(filters.min_price));
  if (filters.max_price) query = query.lte("price_inr", Number(filters.max_price));

  const { data: products, count } = await query
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  const hasMore = count !== null ? (products?.length ?? 0) < count : false;

  return (
    <main className="bg-cream-paper text-ink-black flex-1 pb-24 font-sans antialiased">
      {/* Banner Section */}
      <div className="relative overflow-hidden border-b border-white/5 bg-black px-6 py-16 text-white sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-5" />
        <div className="relative z-10 mx-auto max-w-[1280px] text-left">
          <span className="text-brand-yellow font-graphik text-caption mb-3 block tracking-[0.2em] uppercase">
            B2C DISCOVERY HUB
          </span>
          <h1 className="font-nantes mb-4 max-w-3xl text-3xl leading-[1.15] font-normal tracking-tight sm:text-5xl">
            Discover Verified Indian Manufacturers &amp; Products
          </h1>
          <p className="text-body font-graphik max-w-2xl leading-relaxed text-white/70">
            Source high-quality toys, educational games, puzzles, and custom crafts
            directly from verified MSMEs, startups, and local artisans.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 py-12 sm:px-12">
        {/* Filters & Search Block */}
        <div className="mb-10">
          <DiscoverFilters filters={filters} />
        </div>

        {/* Product Feed */}
        <div>
          <DiscoverFeed
            key={JSON.stringify(filters)}
            initialProducts={products ?? []}
            initialHasMore={hasMore}
            filters={filters}
          />
        </div>
      </div>
    </main>
  );
}
