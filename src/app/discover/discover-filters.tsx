"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOY_CATEGORIES, AGE_GROUPS } from "@/lib/products";
import type { ProductFilters } from "./types";

const selectClass =
  "h-11 rounded-[4px] border border-input bg-card px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground";

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
      className="border-border bg-card rounded-[4px] border p-5"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="q" className="text-muted-foreground mb-1.5 block text-xs">
            Search
          </label>
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="q"
              name="q"
              placeholder="Wooden puzzle, soft toy…"
              defaultValue={filters.q}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="text-muted-foreground mb-1.5 block text-xs"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category}
            className={selectClass}
          >
            <option value="">All categories</option>
            {TOY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="age_group"
            className="text-muted-foreground mb-1.5 block text-xs"
          >
            Age group
          </label>
          <select
            id="age_group"
            name="age_group"
            defaultValue={filters.age_group}
            className={selectClass}
          >
            <option value="">Any age</option>
            {AGE_GROUPS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="w-24">
          <label
            htmlFor="min_price"
            className="text-muted-foreground mb-1.5 block text-xs"
          >
            Min ₹
          </label>
          <Input
            id="min_price"
            name="min_price"
            type="number"
            min={0}
            defaultValue={filters.min_price}
          />
        </div>
        <div className="w-24">
          <label
            htmlFor="max_price"
            className="text-muted-foreground mb-1.5 block text-xs"
          >
            Max ₹
          </label>
          <Input
            id="max_price"
            name="max_price"
            type="number"
            min={0}
            defaultValue={filters.max_price}
          />
        </div>

        <Button type="submit">Apply</Button>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/discover")}
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}
