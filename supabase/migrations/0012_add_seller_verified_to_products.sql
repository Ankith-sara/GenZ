-- ============================================================
-- Migration 0012: Add seller_verified column to products & sync trigger
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller_verified BOOLEAN NOT NULL DEFAULT false;

-- Backfill seller_verified based on seller_profiles status
UPDATE public.products p
SET seller_verified = (s.status = 'verified')
FROM public.seller_profiles s
WHERE p.seller_id = s.id;

-- Trigger function to sync seller_verified on products when seller_profiles.status changes
CREATE OR REPLACE FUNCTION public.sync_seller_verified_on_products()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.products
    SET seller_verified = (NEW.status = 'verified')
    WHERE seller_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_seller_verified_on_products_trigger ON public.seller_profiles;
CREATE TRIGGER sync_seller_verified_on_products_trigger
  AFTER INSERT OR UPDATE OF status ON public.seller_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.sync_seller_verified_on_products();

-- Trigger function to set seller_verified on newly inserted or updated products
CREATE OR REPLACE FUNCTION public.set_product_seller_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  SELECT COALESCE(status = 'verified', false) INTO NEW.seller_verified
  FROM public.seller_profiles
  WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_product_seller_verified_trigger ON public.products;
CREATE TRIGGER set_product_seller_verified_trigger
  BEFORE INSERT OR UPDATE OF seller_id ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.set_product_seller_verified();
