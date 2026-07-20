-- ============================================================
-- rate limiting logs for security hardening
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  identifier text, -- e.g. email or user ID
  endpoint_type text NOT NULL, -- 'auth', 'public', 'user'
  action_name text NOT NULL, -- e.g. 'login', 'signup', 'waitlist'
  is_failed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserts from any client (public/anon) so rate attempts can be recorded
CREATE POLICY "Anyone can insert rate limit logs"
  ON public.rate_limit_logs FOR INSERT
  WITH CHECK (true);

-- Allow reading logs for verification checks
CREATE POLICY "Anyone can read rate limit logs"
  ON public.rate_limit_logs FOR SELECT
  USING (true);

-- Create performance indexes for rate limit queries
CREATE INDEX IF NOT EXISTS rate_limit_logs_ip_created_idx 
  ON public.rate_limit_logs (ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS rate_limit_logs_identifier_created_idx 
  ON public.rate_limit_logs (identifier, created_at DESC);
