import { describe, it, expect } from "vitest";
import { productSchema, variantSchema } from "@/lib/validation";

describe("Products Feature: Catalog & Schema Validation", () => {
  describe("productSchema", () => {
    it("validates full product catalog entry", () => {
      const payload = {
        name: "Linen Summer Blazer",
        category: "Outerwear",
        age_group: "Adults",
        description: "Breathable Italian linen blazer for B2B distributors.",
        price_inr: 1800,
        materials: ["Linen", "Cotton Lining"],
      };

      const result = productSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects product without category", () => {
      const payload = {
        name: "Casual Pants",
        price_inr: 500,
      };

      const result = productSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("variantSchema", () => {
    it("validates valid product stock variant", () => {
      const payload = {
        variant_name: "Color",
        variant_value: "Navy Blue",
        price_inr: 1850,
        stock_qty: 50,
      };

      const result = variantSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
