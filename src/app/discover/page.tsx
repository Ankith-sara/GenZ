import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DISCOVER_PAGE_SIZE as PAGE_SIZE } from "@/lib/products";
import { DiscoverFilters } from "./discover-filters";
import { DiscoverFeed } from "./discover-feed";
import type { ProductFilters } from "./types";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

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
    <div className="bg-cream-paper flex min-h-screen flex-col font-sans">
      <header className="border-ash bg-cream-paper sticky top-0 z-50 border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-light tracking-[0.22em] uppercase text-black font-sans">
            GenZ
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/discover" className="text-sm font-normal text-black underline decoration-butter-highlight decoration-2 underline-offset-4">
              Discover
            </Link>
            <Link href="/about" className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans">
              About
            </Link>
            <Link href="/contact" className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans">
              Contact
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href={role === "buyer" ? "/dashboard/account" : "/dashboard"}
                  className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans"
                >
                  {role === "buyer" ? "Account" : "Dashboard"}
                </Link>
                <form action={signOut} className="inline">
                  <Button variant="ghost" size="sm" type="submit" className="text-charcoal hover:text-black">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-charcoal hover:text-black text-sm font-sans font-normal tracking-wide transition-colors">
                  Sign in
                </Link>
                <Button asChild variant="default" size="sm" className="bg-black text-white hover:bg-black/90 rounded-[4px] font-sans font-normal text-xs tracking-wider uppercase px-4 h-9">
                  <Link href="/#waitlist">Join Waitlist</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Category Nav Bar */}
      <div className="bg-cream-paper border-b border-ash hidden sm:block">
        <div className="mx-auto max-w-6xl px-6 py-2.5 sm:px-12">
          <div className="flex items-center justify-center gap-8 overflow-x-auto text-xs uppercase tracking-[0.12em] text-charcoal font-sans">
            <Link href="/discover?category=Wooden%20Toys" className="hover:text-black transition-colors">Wooden Toys</Link>
            <Link href="/discover?category=Educational" className="hover:text-black transition-colors">Educational</Link>
            <Link href="/discover?category=Puzzles" className="hover:text-black transition-colors">Puzzles</Link>
            <Link href="/discover?category=Soft%20Toys" className="hover:text-black transition-colors">Soft Toys</Link>
            <Link href="/discover?category=Crafts" className="hover:text-black transition-colors">Crafts & Kits</Link>
            <Link href="/discover" className="hover:text-black transition-colors underline decoration-butter-highlight decoration-2 underline-offset-4">All Catalog</Link>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12">
          <p className="text-smoke text-xs uppercase tracking-widest font-sans">Discover</p>
          <h1 className="mt-3 font-serif text-3xl sm:text-5xl text-foreground font-normal tracking-normal leading-[1.2]">
            Trusted, verified, made-in-India.
          </h1>

          <div className="mt-10">
            <DiscoverFilters filters={filters} />
          </div>

          <div className="mt-10">
            <DiscoverFeed
              key={JSON.stringify(filters)}
              initialProducts={products ?? []}
              initialHasMore={hasMore}
              filters={filters}
            />
          </div>
        </div>
      </main>

      <footer className="bg-cream-paper border-t border-ash py-10 text-smoke font-sans">
        <div className="mx-auto max-w-6xl px-6 text-xs sm:px-12 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} GenZ. Made in India, for India — and the world.</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-black">About</Link>
            <Link href="/contact" className="hover:text-black">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
