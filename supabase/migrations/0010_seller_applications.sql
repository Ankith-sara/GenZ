-- ============================================================
-- 0010_seller_applications.sql
-- Create seller_applications table for verification queue
-- ============================================================

CREATE TABLE IF NOT EXISTS public.seller_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  business_name text NOT NULL,
  business_type text NOT NULL DEFAULT 'seller',
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS seller_applications_email_idx ON public.seller_applications (lower(email));
CREATE INDEX IF NOT EXISTS seller_applications_status_idx ON public.seller_applications (status);
CREATE INDEX IF NOT EXISTS seller_applications_created_at_idx ON public.seller_applications (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can insert seller applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Anyone can view seller applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Anyone can update seller applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Admins manage seller applications" ON public.seller_applications;

-- Policy: Allow prospective sellers to submit applications
CREATE POLICY "Anyone can insert seller applications"
  ON public.seller_applications FOR INSERT
  WITH CHECK (true);

-- Policy: Allow reading applications for duplicate checking or review
CREATE POLICY "Anyone can view seller applications"
  ON public.seller_applications FOR SELECT
  USING (true);

-- Policy: Allow updating applications for re-submission
CREATE POLICY "Anyone can update seller applications"
  ON public.seller_applications FOR UPDATE
  USING (true);

-- Policy: Full admin permissions
CREATE POLICY "Admins manage seller applications"
  ON public.seller_applications FOR ALL
  USING (public.is_admin());

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
