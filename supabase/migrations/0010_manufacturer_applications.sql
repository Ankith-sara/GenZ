-- ============================================================
-- 0010_manufacturer_applications.sql
-- Create manufacturer_applications table for verification queue
-- ============================================================

CREATE TABLE IF NOT EXISTS public.manufacturer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  business_name text NOT NULL,
  business_type text NOT NULL DEFAULT 'manufacturer',
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS manufacturer_applications_email_idx ON public.manufacturer_applications (lower(email));
CREATE INDEX IF NOT EXISTS manufacturer_applications_status_idx ON public.manufacturer_applications (status);
CREATE INDEX IF NOT EXISTS manufacturer_applications_created_at_idx ON public.manufacturer_applications (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.manufacturer_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can insert manufacturer applications" ON public.manufacturer_applications;
DROP POLICY IF EXISTS "Anyone can view manufacturer applications" ON public.manufacturer_applications;
DROP POLICY IF EXISTS "Anyone can update manufacturer applications" ON public.manufacturer_applications;
DROP POLICY IF EXISTS "Admins manage manufacturer applications" ON public.manufacturer_applications;

-- Policy: Allow prospective manufacturers to submit applications
CREATE POLICY "Anyone can insert manufacturer applications"
  ON public.manufacturer_applications FOR INSERT
  WITH CHECK (true);

-- Policy: Allow reading applications for duplicate checking or review
CREATE POLICY "Anyone can view manufacturer applications"
  ON public.manufacturer_applications FOR SELECT
  USING (true);

-- Policy: Allow updating applications for re-submission
CREATE POLICY "Anyone can update manufacturer applications"
  ON public.manufacturer_applications FOR UPDATE
  USING (true);

-- Policy: Full admin permissions
CREATE POLICY "Admins manage manufacturer applications"
  ON public.manufacturer_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
