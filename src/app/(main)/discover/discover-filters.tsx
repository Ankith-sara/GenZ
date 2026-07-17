"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOY_CATEGORIES, AGE_GROUPS } from "@/lib/products";
import type { ProductFilters } from "./types";

const selectClass =
  "h-11 rounded-none border border-ash bg-pure-white px-3.5 text-sm text-ink-black focus:outline-none focus:border-ink-black focus:ring-1 focus:ring-ink-black transition-colors w-full font-graphik";

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
      className="bg-pure-white border-ash flex flex-col gap-6 rounded-none border p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-12">
        {/* Search Query */}
        <div className="lg:col-span-4">
          <label
            htmlFor="q"
            className="text-ink-black font-graphik mb-2 block text-[10px] font-medium tracking-wider uppercase"
          >
            Search Keyword
          </label>
          <div className="relative">
            <Search
              className="text-smoke absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="q"
              name="q"
              placeholder="Wooden puzzle, soft toy, DIY craft kit…"
              defaultValue={filters.q}
              className="border-ash focus-visible:ring-ink-black focus-visible:border-ink-black bg-pure-white text-ink-black font-graphik h-11 rounded-none pl-10 text-sm"
            />
          </div>
        </div>

        {/* Category select */}
        <div className="lg:col-span-3">
          <label
            htmlFor="category"
            className="text-ink-black font-graphik mb-2 block text-[10px] font-medium tracking-wider uppercase"
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
            className="text-ink-black font-graphik mb-2 block text-[10px] font-medium tracking-wider uppercase"
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
          <Button
            type="submit"
            className="bg-brand-yellow hover:bg-brand-yellow/90 font-graphik h-11 w-full rounded-none border-none text-xs font-semibold tracking-[0.05em] text-black uppercase transition-all hover:scale-[1.02]"
          >
            Filter
          </Button>
        </div>
      </div>

      {/* Expandable/Secondary price range row */}
      <div className="border-ash flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div className="flex items-center gap-3">
          <span className="text-ink-black font-graphik text-[10px] font-medium tracking-wider uppercase">
            Price Range (₹):
          </span>

          <div className="flex items-center gap-2">
            <Input
              id="min_price"
              name="min_price"
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={filters.min_price}
              className="border-ash focus-visible:ring-ink-black bg-pure-white text-ink-black font-graphik h-9 w-24 rounded-none text-xs"
            />
            <span className="text-smoke font-graphik text-xs">to</span>
            <Input
              id="max_price"
              name="max_price"
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={filters.max_price}
              className="border-ash focus-visible:ring-ink-black bg-pure-white text-ink-black font-graphik h-9 w-24 rounded-none text-xs"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/discover")}
            className="font-graphik h-9 rounded-none text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Clear Active Filters
          </Button>
        )}
      </div>
    </form>
  );
}
