-- ============================================================
-- Migration 0020: Add audit (created_by, updated_by) & commerce columns to products
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS inventory_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS track_inventory boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_new_arrival boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false;

-- Clean up any legacy / unwanted columns
ALTER TABLE public.products
  DROP COLUMN IF EXISTS barcode,
  DROP COLUMN IF EXISTS gst_rate,
  DROP COLUMN IF EXISTS hsn_code,
  DROP COLUMN IF EXISTS country_of_origin;

-- Backfill created_by and updated_by for existing rows using seller_id
UPDATE public.products
SET
  created_by = COALESCE(created_by, seller_id),
  updated_by = COALESCE(updated_by, seller_id)
WHERE created_by IS NULL OR updated_by IS NULL;

-- Indexes for performance & catalog querying
CREATE INDEX IF NOT EXISTS products_created_by_idx ON public.products (created_by);
CREATE INDEX IF NOT EXISTS products_updated_by_idx ON public.products (updated_by);
CREATE INDEX IF NOT EXISTS products_sku_idx ON public.products (sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS products_is_new_arrival_idx ON public.products (is_new_arrival) WHERE is_new_arrival = true;
