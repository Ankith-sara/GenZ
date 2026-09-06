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

