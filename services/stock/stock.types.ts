export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface StockCheckResult {
  productId: string;
  available: boolean;
  currentStock: number;
  lowStockThreshold: number;
  status: StockStatus;
}
