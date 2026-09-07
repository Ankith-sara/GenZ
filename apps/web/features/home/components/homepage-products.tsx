"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";
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

export function HomepageProducts({
  initialProducts = [],
  sellerMap = {},
}: HomepageProductsProps) {
  const [activeTab, setActiveTab] = useState<string>("All");

  // Products published from seller dashboard
  const liveProductsMapped: CuratedProduct[] = initialProducts.map((p) => {
    const coverUrl = productMediaUrl(p.cover_image_path);
    const seller = p.seller_id ? sellerMap[p.seller_id] : undefined;
    const artisan = seller?.business_name || "Verified Indian Maker";
    const isEtikoppaka =
      p.category?.toLowerCase().includes("etikoppaka") ||
      p.name?.toLowerCase().includes("etikoppaka") ||
      false;

    return {
      id: p.id,
      name: p.name,
      category: p.category || "General",
      description: p.description,
      price_inr: p.price_inr ?? 0,
      image: coverUrl || "/cat_toys.png",
      artisan,
      isGI: isEtikoppaka,
      rawProduct: p,
    };
  });

  // published products
  const allProducts: CuratedProduct[] = liveProductsMapped;

  // Category filter tabs
  const uniqueCategories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  );
  const filterTabs = uniqueCategories.length > 1 ? ["All", ...uniqueCategories] : ["All"];

  const filteredProducts =
    activeTab === "All"
      ? allProducts
      : allProducts.filter(
          (p) => p.category.toLowerCase() === activeTab.toLowerCase()
        );

  return (
    <section
      id="featured-products"
      className="border-b border-[#E5E5E0] bg-white px-4 py-16 sm:px-8 md:px-12 md:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="font-nantes text-ink-black text-3xl font-normal sm:text-4xl md:text-5xl">
              Trending Made in India Products
            </h2>
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

        {/* Dynamic Category Pill Filters */}
        {filterTabs.length > 1 && (
          <div className="no-scrollbar mt-8 flex items-center gap-2 overflow-x-auto pb-2 sm:mt-10 sm:gap-2.5">
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`font-graphik shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 sm:px-5 sm:py-2.5 ${
                    isActive
                      ? "bg-[#1A1A18] text-white shadow-sm"
                      : "border border-neutral-200 bg-[#FAF7F0] text-neutral-700 hover:border-black/30 hover:bg-white"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}

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
              Verified Indian artisans, cooperatives, and manufacturing units are currently cataloguing their latest batches. Once published from their seller dashboards, listings will appear here live.
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
          /* Product Cards Grid: 2 columns on small screens, 5 columns on large screens */
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 md:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product.rawProduct}
                artisanName={product.artisan}
                isGI={product.isGI}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
