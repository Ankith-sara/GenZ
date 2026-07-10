"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOY_CATEGORIES, AGE_GROUPS } from "@/lib/products";
import type { ProductFilters } from "./types";

const selectClass =
  "h-11 rounded-[4px] border border-black/10 bg-paper-white px-3.5 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-green transition-all duration-300 w-full";

export function DiscoverFilters({ filters }: { filters: ProductFilters }) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const key of [
      "q",
      "category",
      "age_group",
      "min_price",
      "max_price",
    ] as const) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    router.push(`/discover?${params.toString()}`);
  }

  const hasActiveFilters =
    filters.q ||
    filters.category ||
    filters.age_group ||
    filters.min_price ||
    filters.max_price;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper-white rounded-2xl border border-black/10 p-6 sm:p-8  flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Search Query */}
        <div className="lg:col-span-4">
          <label htmlFor="q" className="text-black font-sans text-xs font-semibold uppercase tracking-wider mb-2 block">
            Search Keyword
          </label>
          <div className="relative">
            <Search
              className="text-neutral-400 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="q"
              name="q"
              placeholder="Wooden puzzle, soft toy, DIY craft kit…"
              defaultValue={filters.q}
              className="pl-10 h-11 rounded-[4px] border-black/10 focus-visible:ring-forest-green"
            />
          </div>
        </div>

        {/* Category select */}
        <div className="lg:col-span-3">
          <label
            htmlFor="category"
            className="text-black font-sans text-xs font-semibold uppercase tracking-wider mb-2 block"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category}
            className={selectClass}
          >
            <option value="">All Categories</option>
            {TOY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Age group select */}
        <div className="lg:col-span-3">
          <label
            htmlFor="age_group"
            className="text-black font-sans text-xs font-semibold uppercase tracking-wider mb-2 block"
          >
            Age Group
          </label>
          <select
            id="age_group"
            name="age_group"
            defaultValue={filters.age_group}
            className={selectClass}
          >
            <option value="">Any Age Group</option>
            {AGE_GROUPS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Action button */}
        <div className="lg:col-span-2">
          <Button type="submit" className="w-full h-11 bg-forest-green hover:bg-forest-green/90 text-white rounded-[4px] font-semibold  transition-all hover:scale-[1.02]">
            Filter
          </Button>
        </div>
      </div>

      {/* Expandable/Secondary price range row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-black">Price Range (₹):</span>
          
          <div className="flex items-center gap-2">
            <Input
              id="min_price"
              name="min_price"
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={filters.min_price}
              className="w-24 h-9 rounded-[4px] border-black/10 text-xs focus-visible:ring-forest-green"
            />
            <span className="text-neutral-400 text-xs">to</span>
            <Input
              id="max_price"
              name="max_price"
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={filters.max_price}
              className="w-24 h-9 rounded-[4px] border-black/10 text-xs focus-visible:ring-forest-green"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/discover")}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-[4px] h-9 font-semibold"
          >
            Clear Active Filters
          </Button>
        )}
      </div>
    </form>
  );
}
