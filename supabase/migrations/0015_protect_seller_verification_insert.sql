-- ============================================================
-- Migration 0015: Extend protect_seller_verification_fields trigger to BEFORE INSERT
-- Prevents non-admin users from setting status: 'verified' on insertion
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_seller_verification_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  SELECT public.is_admin() INTO caller_is_admin;

  IF NOT caller_is_admin THEN
    IF TG_OP = 'INSERT' THEN
      -- Non-admins cannot insert a verified or rejected profile directly
      IF NEW.status NOT IN ('not_submitted', 'pending') THEN
        NEW.status := 'pending';
      END IF;
      NEW.rejection_reason := NULL;
      NEW.reviewed_at := NULL;
      NEW.reviewed_by := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.status IS DISTINCT FROM OLD.status THEN
        IF NEW.status = 'pending' AND OLD.status IN ('not_submitted', 'rejected') THEN
          NEW.submitted_at := now();
        ELSE
          NEW.status := OLD.status;
        END IF;
      END IF;
      NEW.rejection_reason := OLD.rejection_reason;
      NEW.reviewed_at := OLD.reviewed_at;
      NEW.reviewed_by := OLD.reviewed_by;
      NEW.updated_at := now();
    END IF;
  ELSE
    NEW.updated_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_seller_verification_fields_trigger ON public.seller_profiles;
CREATE TRIGGER protect_seller_verification_fields_trigger
  BEFORE INSERT OR UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_seller_verification_fields();
