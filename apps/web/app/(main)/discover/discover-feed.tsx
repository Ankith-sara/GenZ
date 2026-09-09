"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/features/products/components/product-card";
import type { Product } from "@genz/types";
import type { ProductFilters } from "./types";

export function ProductCardSkeleton() {
  return (
    <div className="bg-paper-white animate-pulse rounded-[4px] border border-black/10 p-2.5">
      <div className="aspect-square w-full rounded-[4px] bg-neutral-100" />
      <div className="space-y-2 px-1.5 pt-3 pb-1.5">
        <div className="h-3.5 w-1/3 rounded bg-neutral-100" />
        <div className="h-4.5 w-3/4 rounded bg-neutral-100" />
        <div className="h-4.5 w-1/4 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

export function DiscoverFeed({
  initialProducts,
  initialHasMore,
  filters,
}: {
  initialProducts: Product[];
  initialHasMore: boolean;
  filters: ProductFilters;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(0); // page 0 already loaded server-side
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    const nextPage = pageRef.current + 1;
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.min_price) params.set("min_price", filters.min_price);
    if (filters.max_price) params.set("max_price", filters.max_price);
    params.set("page", String(nextPage));

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed.");
      const data = await res.json();
      setProducts((prev) => [...prev, ...data.products]);
      setHasMore(data.hasMore);
      pageRef.current = nextPage;
    } catch {
      setError("Couldn't load more products. Try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, filters]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (products.length === 0) {
    return (
      <div className="border-ash/40 flex flex-col items-center justify-center rounded-3xl border bg-white px-6 py-20 text-center shadow-xs">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-800">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          <span>Artisan Cluster Onboarding</span>
        </div>
        <h3 className="text-ink-black font-nantes text-3xl font-normal tracking-tight sm:text-4xl">
          Coming Soon
        </h3>
        <p className="font-graphik mt-3 max-w-md text-sm leading-relaxed text-[#73736E]">
          {filters.category ? (
            <>
              Authentic products for &ldquo;
              <strong className="font-semibold text-[#1A1A18]">
                {filters.category}
              </strong>
              &rdquo; are currently being curated and onboarded from verified master
              artisans. Check back shortly!
            </>
          ) : filters.q ? (
            <>
              We couldn&apos;t find an active listing matching &ldquo;
              <strong className="font-semibold text-[#1A1A18]">{filters.q}</strong>
              &rdquo;. Our craft team is adding new verified Indian makers daily!
            </>
          ) : (
            "We are actively cataloging verified Indian craft items for this selection. New artisan inventory will be available soon."
          )}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => {
              window.location.href = "/discover";
            }}
            className="font-graphik h-11 cursor-pointer rounded-xl border-none bg-[#D97706] px-6 text-xs font-semibold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-[#B45309]"
          >
            Explore All Products
          </button>
          <Link
            href="/"
            className="font-graphik flex h-11 items-center justify-center rounded-xl border border-[#E5E5E0] bg-white px-6 text-xs font-semibold tracking-wider text-[#1A1A18] uppercase transition-all hover:bg-[#FAF8F4]"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            sellerVerified={product.seller_verified ?? false}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      )}
      {error && (
        <div className="py-8 text-center">
          <p className="text-destructive text-sm">{error}</p>
          <button
            type="button"
            onClick={loadMore}
            className="mt-2 text-sm underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}
      {!hasMore && !loading && (
        <p className="text-muted-foreground font-graphik py-8 text-center text-sm">
          You&apos;ve seen everything that matches.
        </p>
      )}
    </div>
  );
}
