-- ============================================================
-- Migration 0014: Protect Profile Role & Account Status Fields
-- Prevents non-admin users from self-elevating their role or account status
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  SELECT public.is_admin() INTO caller_is_admin;

  -- If caller is not an admin, revert any attempt to alter role or account_status
  IF NOT caller_is_admin THEN
    NEW.role := OLD.role;
    IF TG_OP = 'UPDATE' AND OLD.account_status IS NOT NULL THEN
      NEW.account_status := OLD.account_status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role_trigger ON public.profiles;
CREATE TRIGGER protect_profile_role_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_role();
