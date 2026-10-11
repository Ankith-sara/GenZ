import { describe, it, expect } from "vitest";
import { ProductsService } from "../products.service";

describe("ProductsService", () => {
  it("slugifies product names properly", () => {
    expect(ProductsService.slugify("Handcrafted Channapatna Toy Car")).toBe(
      "handcrafted-channapatna-toy-car"
    );
    expect(ProductsService.slugify("Special   Offer! 100% Cotton")).toBe(
      "special-offer-100-cotton"
    );
    expect(ProductsService.slugify("")).toBe("product");
  });

  it("parses comma-separated materials cleanly", () => {
    const raw = "Teakwood, Organic Lacquer, Natural Vegetable Dye ";
    const parsed = ProductsService.parseMaterials(raw);
    expect(parsed).toEqual(["Teakwood", "Organic Lacquer", "Natural Vegetable Dye"]);
  });

  it("rejects invalid product prices during creation", async () => {
    await expect(
      ProductsService.createProduct({
        name: "Invalid Item",
        category: "toys",
        description: "Test",
        price_inr: -50,
        seller_id: "seller-123",
      })
    ).rejects.toThrow("cannot be negative");
  });
});
