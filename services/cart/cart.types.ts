import type { OrderItem } from "@genz/types";

export interface CartItem extends OrderItem {
  sellerId?: string;
  seller_id?: string;
  sellerBusinessName?: string;
}

export interface SellerCartGroup {
  sellerId: string;
  sellerBusinessName: string;
  items: CartItem[];
  subtotal: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  sellerGroups: Record<string, SellerCartGroup>;
}
