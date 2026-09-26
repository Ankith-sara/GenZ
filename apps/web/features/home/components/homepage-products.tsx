"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Sparkles,
} from "lucide-react";
import { Button } from "@genz/ui";
import { ProductCard } from "@/features/products/components/product-card";
import { productMediaUrl } from "@/features/products/lib/products";
import type { Product } from "@genz/types";

interface CuratedProduct {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  price_inr: number;
  original_mrp?: number;
  image: string;
  artisan: string;
  isGI?: boolean;
  rawProduct: Product;
}

interface HomepageProductsProps {
  initialProducts?: Product[];
  sellerMap?: Record<string, { business_name?: string; city?: string; state?: string }>;
}

interface CategoryRunwayProps {
  category: string;
  products: CuratedProduct[];
  index: number;
}

function CategoryRunway({ category, products, index }: CategoryRunwayProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState, products.length]);

  const scroll = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const isGI =
    category.toLowerCase().includes("etikoppaka") ||
    category.toLowerCase().includes("kondapalli");

  const craftBadge = isGI
    ? "GI Certified Heritage Craft"
    : category.toLowerCase().includes("wood")
      ? "Hand-Carved Woodwork"
      : category.toLowerCase().includes("brass") ||
          category.toLowerCase().includes("metal")
        ? "Heritage Metal Casting"
        : category.toLowerCase().includes("pottery") ||
            category.toLowerCase().includes("terracotta")
          ? "Clay & Terracotta Guild"
          : "Artisanal Craft Guild";

  return (
    <div className="relative">
      {/* Runway Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-graphik text-[11px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
              RUNWAY {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="font-graphik rounded-full bg-amber-100/70 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-900">
              {craftBadge}
            </span>
          </div>

          <h3 className="font-nantes text-2xl font-normal tracking-tight text-[#1A1A18] sm:text-3xl md:text-4xl">
            {category}
          </h3>

          <p className="font-graphik mt-1 text-xs text-neutral-500 sm:text-sm">
            {products.length} {products.length === 1 ? "design" : "designs"} • Direct
            from master workshops
          </p>
        </div>

        {/* Runway Navigation & Direct Discover Link */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link
            href={`/discover?category=${encodeURIComponent(category)}`}
            className="font-graphik group hidden items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black sm:inline-flex"
          >
            <span>Explore Collection</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          {/* Runway Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${category} runway left`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 transition-all duration-200 ${
                canScrollLeft
                  ? "cursor-pointer shadow-2xs hover:border-black hover:bg-black hover:text-white active:scale-95"
                  : "cursor-not-allowed opacity-30"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label={`Scroll ${category} runway right`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 transition-all duration-200 ${
                canScrollRight
                  ? "cursor-pointer shadow-2xs hover:border-black hover:bg-black hover:text-white active:scale-95"
                  : "cursor-not-allowed opacity-30"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Runway Track */}
      <div
        ref={trackRef}
        onScroll={updateScrollState}
        className="no-scrollbar mt-6 flex snap-x snap-mandatory [scrollbar-width:none] items-stretch gap-4 overflow-x-auto scroll-smooth py-2 [-ms-overflow-style:none] sm:gap-5 md:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[220px] shrink-0 snap-start select-none sm:w-[250px] md:w-[270px] lg:w-[290px]"
          >
            <ProductCard
              product={product.rawProduct}
              artisanName={product.artisan}
              isGI={product.isGI}
            />
          </div>
        ))}

        {/* Runway Finale Card */}
        <Link
          href={`/discover?category=${encodeURIComponent(category)}`}
          className="group relative flex w-[200px] shrink-0 snap-start flex-col justify-between rounded-xl border border-dashed border-[#D4D4CE] bg-[#FAF8F4] p-5 text-left transition-all duration-300 hover:border-black hover:bg-white hover:shadow-lg sm:w-[230px] sm:p-6 md:w-[250px]"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/70 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900">
              <Sparkles className="h-3 w-3" />
              <span>Full Guild</span>
            </div>
            <h4 className="font-nantes mt-4 text-lg font-normal text-neutral-900 transition-colors group-hover:text-black sm:text-xl">
              Explore all {category}
            </h4>
            <p className="font-graphik mt-2 text-xs leading-relaxed text-neutral-500">
              Discover all verified pieces crafted under this heritage craft tradition.
            </p>
          </div>

          <div className="font-graphik mt-6 flex items-center justify-between border-t border-neutral-200/60 pt-4 text-xs font-bold text-neutral-900 group-hover:text-amber-700">
            <span>View Full Catalog</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-amber-600">
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>
      </div>

      {/* Runway Indicator Line & Interaction Hint */}
      <div className="mt-3 flex items-center justify-between">
        <div className="h-0.5 w-24 overflow-hidden rounded-full bg-neutral-200 sm:w-36">
          <div
            className="h-full rounded-full bg-[#1A1A18] transition-all duration-150 ease-out"
            style={{ width: `${Math.max(15, Math.min(100, scrollProgress * 100))}%` }}
          />
        </div>
        <span className="font-graphik text-[11px] text-neutral-400">
          Swipe or use arrows to view runway
        </span>
      </div>
    </div>
  );
}

export function HomepageProducts({
  initialProducts = [],
  sellerMap = {},
}: HomepageProductsProps) {
  // Products published from seller dashboard
  const liveProductsMapped: CuratedProduct[] = initialProducts.map((p) => {
    const coverUrl = productMediaUrl(p.cover_image_path);
    const seller = p.seller_id ? sellerMap[p.seller_id] : undefined;
    const artisan = seller?.business_name || "Verified Indian Maker";
    const isGI =
      p.category?.toLowerCase().includes("etikoppaka") ||
      p.name?.toLowerCase().includes("etikoppaka") ||
      p.category?.toLowerCase().includes("kondapalli") ||
      p.name?.toLowerCase().includes("kondapalli") ||
      false;

    return {
      id: p.id,
      name: p.name,
      category: p.category?.trim() || "General Crafts",
      description: p.description,
      price_inr: p.price_inr ?? 0,
      image: coverUrl || "/etikoppaka_toys.png",
      artisan,
      isGI,
      rawProduct: p,
    };
  });

  const allProducts: CuratedProduct[] = liveProductsMapped;

  // Group products by category
  const categoryMap = new Map<string, CuratedProduct[]>();
  for (const p of allProducts) {
    const cat = p.category || "General Crafts";
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    categoryMap.get(cat)!.push(p);
  }

  // Prioritize heritage/GI categories first
  const priorityOrder = [
    "Etikoppaka Wooden Toys",
    "Kondapalli Toys",
  ];

  const sortedCategories = Array.from(categoryMap.keys()).sort((a, b) => {
    const idxA = priorityOrder.indexOf(a);
    const idxB = priorityOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <section
      id="featured-products"
      className="border-b border-[#E5E5E0] bg-white px-4 py-16 sm:px-8 md:px-12 md:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100/70 px-3 py-0.5 text-[11px] font-semibold text-amber-900">
              <Sparkles className="h-3 w-3" />
              <span>Craft Guild Runways</span>
            </div>
            <h2 className="font-nantes text-ink-black text-3xl font-normal sm:text-4xl md:text-5xl">
              Trending Made in India Products
            </h2>
            <p className="font-graphik mt-2 max-w-xl text-xs leading-relaxed text-neutral-600 sm:text-sm">
              Discover authentic GI-certified crafts, traditional toys, and regional
              masterworks presented across dedicated guild runways.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="font-graphik self-start rounded-full border-black px-6 text-xs font-bold text-black transition-all duration-300 hover:bg-black hover:text-white md:self-auto"
          >
            <Link href="/discover" className="flex items-center gap-2">
              <span>View Full Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty State */}
        {allProducts.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D4D4CE] bg-[#FAF8F4] p-12 text-center sm:p-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 shadow-xs">
              <PackageSearch className="h-8 w-8" />
            </div>
            <h3 className="font-nantes mt-5 text-2xl font-normal text-neutral-900 sm:text-3xl">
              Makers Cataloguing New Workshop Batches
            </h3>
            <p className="font-graphik mt-2 max-w-lg text-xs leading-relaxed text-neutral-600 sm:text-sm">
              Verified Indian artisans, cooperatives, and manufacturing units are
              currently cataloguing their latest batches. Once published from their
              seller dashboards, listings will appear here live.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                variant="outline"
                className="font-graphik rounded-full border-black px-6 text-xs font-bold text-black transition-all hover:bg-black hover:text-white"
              >
                <Link href="/discover">Explore Categories</Link>
              </Button>
              <Button
                asChild
                className="font-graphik rounded-full bg-[#1A1A18] px-6 text-xs font-bold text-white transition-all hover:bg-neutral-800"
              >
                <Link href="/seller/signup">Sell on GenZ</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Runway Rows separated by category */
          <div className="mt-12 space-y-16 sm:mt-16 sm:space-y-20">
            {sortedCategories.map((category, index) => (
              <CategoryRunway
                key={category}
                category={category}
                products={categoryMap.get(category) || []}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
