import { describe, it, expect } from "vitest";
import { productSchema, variantSchema } from "@/lib/validation";

describe("Product & Variant Schema Validation", () => {
  describe("productSchema", () => {
    it("validates a correct product payload", () => {
      const validProduct = {
        name: "Oversized Cotton Tee",
        category: "Apparel",
        age_group: "Adults",
        description:
          "Heavyweight 240 GSM organic cotton t-shirt for streetwear brands.",
        price_inr: 450,
        materials: ["100% Cotton", "French Terry"],
      };

      const result = productSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Oversized Cotton Tee");
        expect(result.data.price_inr).toBe(450);
      }
    });

    it("fails when product name is empty", () => {
      const invalidProduct = {
        name: "",
        category: "Apparel",
        price_inr: 300,
      };

      const result = productSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Product name is required");
      }
    });

    it("fails when price is negative", () => {
      const invalidProduct = {
        name: "Denim Jacket",
        category: "Outerwear",
        price_inr: -150,
      };

      const result = productSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it("defaults materials to an empty array when not provided", () => {
      const productWithoutMaterials = {
        name: "Linen Shirt",
        category: "Shirts",
        price_inr: 800,
      };

      const result = productSchema.safeParse(productWithoutMaterials);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.materials).toEqual([]);
      }
    });
  });

  describe("variantSchema", () => {
    it("validates correct variant specs (Size, Color, Stock)", () => {
      const validVariant = {
        variant_name: "Size",
        variant_value: "XL",
        price_inr: 499,
        stock_qty: 150,
      };

      const result = variantSchema.safeParse(validVariant);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stock_qty).toBe(150);
      }
    });

    it("fails when stock quantity is a negative number", () => {
      const invalidVariant = {
        variant_name: "Color",
        variant_value: "Matte Black",
        price_inr: 499,
        stock_qty: -5,
      };

      const result = variantSchema.safeParse(invalidVariant);
      expect(result.success).toBe(false);
    });

    it("fails when stock quantity is not an integer", () => {
      const invalidVariant = {
        variant_name: "Size",
        variant_value: "Medium",
        stock_qty: 12.5,
      };

      const result = variantSchema.safeParse(invalidVariant);
      expect(result.success).toBe(false);
    });
  });
});
