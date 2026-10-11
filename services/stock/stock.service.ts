import { ProductsRepository } from "../products/products.repository";
import type { StockCheckResult, StockStatus } from "./stock.types";

export class StockService {
  /**
   * Evaluates inventory status for a given product
   */
  static evaluateStock(
    currentStock: number,
    threshold = 5,
    trackInventory = true
  ): { status: StockStatus; available: boolean } {
    if (!trackInventory) {
      return { status: "in_stock", available: true };
    }

    if (currentStock <= 0) {
      return { status: "out_of_stock", available: false };
    }

    if (currentStock <= threshold) {
      return { status: "low_stock", available: true };
    }

    return { status: "in_stock", available: true };
  }

  /**
   * Checks real-time stock for a product from the database
   */
  static async checkProductStock(productId: string): Promise<StockCheckResult | null> {
    const product = await ProductsRepository.getById(productId);
    if (!product) return null;

    const stock = Number((product as any).inventory_count ?? 10);
    const threshold = Number((product as any).low_stock_threshold ?? 5);
    const track = Boolean((product as any).track_inventory ?? false);

    const { status, available } = this.evaluateStock(stock, threshold, track);

    return {
      productId,
      available,
      currentStock: stock,
      lowStockThreshold: threshold,
      status,
    };
  }
}

// Backward-compatibility alias
export { StockService as InventoryService };
