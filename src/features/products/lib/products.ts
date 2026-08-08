import type { ProductStatus } from "@/types/database";

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

// Toys-first, per the platform's category roadmap — kept as a curated list
// (rather than freeform text) so discovery filters have a fixed, sane set
// of values to facet on.
export const TOY_CATEGORIES = [
  "Wooden Toys",
  "Educational Toys",
  "Soft Toys",
  "Outdoor & Ride-ons",
  "Puzzles & Games",
  "Building Blocks",
  "Arts & Crafts",
  "Other",
] as const;

export const AGE_GROUPS = [
  "0-2 years",
  "3-5 years",
  "6-8 years",
  "9-12 years",
  "13+ years",
  "All ages",
] as const;

export const DISCOVER_PAGE_SIZE = 12;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * `product-media` is a public bucket, so files can be linked directly by
 * path without a signed URL. Returns null if no path is set.
 */
export function productMediaUrl(path: string | null): string | null {
  if (!path || !SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/product-media/${path}`;
}

/** Parses the comma-separated materials input from the product form into a clean string array. */
export function parseMaterials(raw: string): string[] {
  return raw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

export function formatInr(amount: number | null): string {
  if (amount === null) return "Price not set";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
