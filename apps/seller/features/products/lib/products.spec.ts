import { describe, it, expect } from "vitest";
import {
  parseMaterials,
  formatInr,
  PRODUCT_STATUS_LABEL,
  TOY_CATEGORIES,
  DISCOVER_PAGE_SIZE,
  productMediaUrl,
} from "./products";

describe("Products Domain Logic Specs", () => {
  describe("parseMaterials", () => {
    it("splits comma-separated string into clean trimmed array", () => {
      const raw = " Wood, Organic Cotton , Non-toxic Paint ";
      expect(parseMaterials(raw)).toEqual([
        "Wood",
        "Organic Cotton",
        "Non-toxic Paint",
      ]);
    });

    it("filters out empty or whitespace-only elements", () => {
      expect(parseMaterials("Wood,, , Bamboo")).toEqual(["Wood", "Bamboo"]);
    });
  });

  describe("formatInr", () => {
    it("formats integer numbers to INR currency format", () => {
      const formatted = formatInr(1250);
      expect(formatted).toContain("1,250");
    });

    it("returns 'Price not set' when amount is null", () => {
      expect(formatInr(null)).toBe("Price not set");
    });
  });

  describe("PRODUCT_STATUS_LABEL", () => {
    it("maps database statuses to display labels", () => {
      expect(PRODUCT_STATUS_LABEL.draft).toBe("Draft");
      expect(PRODUCT_STATUS_LABEL.published).toBe("Published");
      expect(PRODUCT_STATUS_LABEL.archived).toBe("Archived");
    });
  });

  describe("TOY_CATEGORIES", () => {
    it("contains curated category list including Etikoppaka Wooden Toys and Handicrafts", () => {
      expect(TOY_CATEGORIES).toContain("Etikoppaka Wooden Toys");
      expect(TOY_CATEGORIES).toContain("Kondapalli Toys");
      expect(TOY_CATEGORIES).toContain("Handicrafts");
    });

    it("defines default discover page size", () => {
      expect(DISCOVER_PAGE_SIZE).toBe(12);
    });
  });

  describe("productMediaUrl", () => {
    it("returns null when path is null or empty", () => {
      expect(productMediaUrl(null)).toBeNull();
      expect(productMediaUrl("")).toBeNull();
    });

    it("constructs full public URL when path is provided", () => {
      const url = productMediaUrl("products/cover.jpg");
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        expect(url).toContain("product-media/products/cover.jpg");
      }
    });
  });
});
