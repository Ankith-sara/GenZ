export * from "./database";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  email: string;
  role: "buyer" | "seller" | "admin" | "customer";
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface Order {
  id: string;
  customer_id: string;
  seller_id?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name?: string;
}
