import { describe, it, expect } from "vitest";
import { CartService } from "../cart.service";

describe("CartService", () => {
  it("summarizes and partitions cart items by distinct sellers", () => {
    const items = [
      {
        productId: "p1",
        name: "Kondapalli Raja Rani",
        price: 800,
        quantity: 2,
        sellerId: "seller_polumuri",
        sellerBusinessName: "Polumuri Crafts",
      },
      {
        productId: "p2",
        name: "Channapatna Ring Stacker",
        price: 350,
        quantity: 1,
        sellerId: "seller_channa",
        sellerBusinessName: "Channa Toys",
      },
    ];

    const summary = CartService.summarizeCart(items);
    expect(summary.subtotal).toBe(800 * 2 + 350);
    expect(summary.itemCount).toBe(3);
    expect(Object.keys(summary.sellerGroups)).toHaveLength(2);
    expect(summary.sellerGroups["seller_polumuri"].subtotal).toBe(1600);
    expect(summary.sellerGroups["seller_channa"].subtotal).toBe(350);
  });

  it("throws error for empty cart", () => {
    expect(() => CartService.summarizeCart([])).toThrow("Cart is empty");
  });
});
