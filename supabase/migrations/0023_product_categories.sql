-- Migration: 0023_product_categories.sql
-- Purpose: Dynamic Product Categories management table for Settings addition/subtraction

CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_product_categories_name ON public.product_categories (name);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories (slug);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active categories
DO $$ BEGIN
  CREATE POLICY "Allow public read access to active product categories"
    ON public.product_categories FOR SELECT
    USING (is_active = true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Allow admin full management access
DO $$ BEGIN
  CREATE POLICY "Allow admin full access to product categories"
    ON public.product_categories FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Seed existing distinct categories from products table if any exist
INSERT INTO public.product_categories (name, slug)
SELECT DISTINCT trim(category), lower(regexp_replace(trim(category), '[^a-zA-Z0-9]+', '-', 'g'))
FROM public.products
WHERE category IS NOT NULL AND trim(category) != ''
ON CONFLICT (name) DO NOTHING;
