import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DISCOVER_PAGE_SIZE as PAGE_SIZE } from "@/lib/products";
import { DiscoverFilters } from "./discover-filters";
import { DiscoverFeed } from "./discover-feed";
import type { ProductFilters } from "./types";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { MainHeader } from "@/components/main-header";

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

  const [session, supabase] = await Promise.all([
    getUserAndProfile(),
    createClient(),
  ]);
  const isLoggedIn = !!session;
  const role = session?.profile?.role;
  const userName = session?.profile?.full_name || session?.email || "";

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
    <div className="bg-neutral-50 flex min-h-screen flex-col font-sans">
      <MainHeader 
        isLoggedIn={isLoggedIn} 
        role={role} 
        userName={userName} 
        signOutAction={signOut} 
      />

      <main className="flex-1 pb-24">
        {/* Banner Section with Premium Grid/Background */}
        <div className="bg-forest-green text-white py-16 px-6 sm:px-12 relative overflow-hidden border-b border-white/5 shadow-inner">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="mx-auto max-w-6xl relative z-10 text-left">
            <span className="text-gold-yellow text-xs font-bold tracking-[0.25em] uppercase mb-3 block">
              B2C DISCOVERY HUB
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-[1.15] tracking-tight mb-4 max-w-3xl">
              Discover Verified Indian Manufacturers &amp; Products
            </h1>
            <p className="text-white/70 max-w-2xl text-sm sm:text-base leading-relaxed font-sans">
              Source high-quality toys, educational games, puzzles, and custom crafts directly from verified MSMEs, startups, and local artisans.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12">
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

      <footer className="bg-[#0b1b14] border-t border-white/5 py-12 text-white/50 font-sans">
        <div className="mx-auto max-w-6xl px-6 text-xs sm:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} GenZ. Made in India, for India — and the world.</span>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-gold-yellow transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-gold-yellow transition-colors">Contact Support</Link>
            <Link href="/login/manufacturer" className="hover:text-gold-yellow transition-colors">Manufacturer Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
