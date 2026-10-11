import type { CartItem, CartSummary, SellerCartGroup } from "./cart.types";

export class CartService {
  /**
   * Validates cart line items
   */
  static validateCartItems(items: CartItem[]): void {
    if (!items || items.length === 0) {
      throw new Error("Cart is empty");
    }

    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.name || "unnamed"}`);
      }
      if (item.price === undefined || item.price < 0) {
        throw new Error(`Invalid price for item ${item.name || "unnamed"}`);
      }
    }
  }

  /**
   * Summarizes cart and partitions items by seller for multi-artisan fulfillment
   */
  static summarizeCart(items: CartItem[]): CartSummary {
    this.validateCartItems(items);

    let subtotal = 0;
    let itemCount = 0;
    const sellerGroups: Record<string, SellerCartGroup> = {};

    for (const item of items) {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      itemCount += item.quantity;

      const sellerId = item.sellerId || item.seller_id || "default_artisan";
      const sellerBusinessName = item.sellerBusinessName || "Artisan Workshop";

      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = {
          sellerId,
          sellerBusinessName,
          items: [],
          subtotal: 0,
        };
      }

      sellerGroups[sellerId].items.push(item);
      sellerGroups[sellerId].subtotal += lineTotal;
    }

    return {
      items,
      itemCount,
      subtotal,
      sellerGroups,
    };
  }
}
