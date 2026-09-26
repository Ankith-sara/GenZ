import type { Role } from "./database";
export * from "./database";
export * from "./employees";
export * from "./tasks";
export * from "./crm";

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
  role: Role;
  full_name?: string | null;
  avatar_url?: string | null;
}

export const DEFAULT_PRODUCT_CATEGORIES = [
  "Etikoppaka Wooden Toys",
  "Kondapalli Toys",
] as const;

export type ProductCategory = (typeof DEFAULT_PRODUCT_CATEGORIES)[number];
