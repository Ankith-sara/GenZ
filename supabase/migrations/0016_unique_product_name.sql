-- Migration 0016: Enforce unique product names
-- Creates a unique case-insensitive index on the products name column

CREATE UNIQUE INDEX IF NOT EXISTS products_name_unique_idx ON public.products (LOWER(name));
