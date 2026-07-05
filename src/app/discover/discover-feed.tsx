"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/database";
import type { ProductFilters } from "./types";

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
    if (filters.age_group) params.set("age_group", filters.age_group);
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
      <p className="text-muted-foreground py-16 text-center text-sm">
        No products match those filters yet.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <p className="text-muted-foreground py-8 text-center text-sm">Loading more…</p>
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
        <p className="text-muted-foreground py-8 text-center text-sm">
          You&apos;ve seen everything that matches.
        </p>
      )}
    </div>
  );
}
