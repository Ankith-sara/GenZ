import type { Role } from "./database";
export * from "./database";
export * from "./employees";
export * from "./tasks";
export * from "./crm";
export * from "./accounting";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  full_name?: string | null;
  avatar_url?: string | null;
}

export type ProductCategory = string;
