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

export const DEFAULT_PRODUCT_CATEGORIES = [
  "Etikoppaka Wooden Toys",
  "Kondapalli Toys",
  "Wooden Toys & Crafts",
  "Home & Furniture",
  "Handicrafts",
] as const;

export type ProductCategory = (typeof DEFAULT_PRODUCT_CATEGORIES)[number];


