-- ============================================================
-- 0019_harden_rls_policies.sql
-- Remediate insecure RLS policies on rate_limit_logs and seller_applications
-- ============================================================

-- 1. Harden rate_limit_logs RLS
DROP POLICY IF EXISTS "Anyone can insert rate limit logs" ON public.rate_limit_logs;
DROP POLICY IF EXISTS "Anyone can read rate limit logs" ON public.rate_limit_logs;

-- Rate limit logs are read-only for admins (service_role bypasses RLS automatically)
CREATE POLICY "Admins can view rate limit logs"
  ON public.rate_limit_logs FOR SELECT
  USING (public.is_admin());

-- 2. Harden seller_applications RLS
DROP POLICY IF EXISTS "Anyone can insert seller applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Anyone can view seller applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Anyone can update seller applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Admins manage seller applications" ON public.seller_applications;

-- Prospective sellers can submit an application
CREATE POLICY "Anyone can insert seller applications"
  ON public.seller_applications FOR INSERT
  WITH CHECK (true);

-- Applicants can view their own application by email match, or Admins can view all
CREATE POLICY "Applicants and Admins can view seller applications"
  ON public.seller_applications FOR SELECT
  USING (
    public.is_admin() 
    OR (auth.jwt() ->> 'email' IS NOT NULL AND lower(auth.jwt() ->> 'email') = lower(email))
  );

-- Only Admins can update seller applications (e.g. approve/reject/review)
CREATE POLICY "Admins can update seller applications"
  ON public.seller_applications FOR UPDATE
  USING (public.is_admin());

-- Only Admins can delete seller applications
CREATE POLICY "Admins can delete seller applications"
  ON public.seller_applications FOR DELETE
  USING (public.is_admin());

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
