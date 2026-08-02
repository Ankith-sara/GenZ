-- Create the page_views table for real analytics tracking
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast date-range queries on the dashboard
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);

-- Index for fast path grouping (top pages)
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);

-- Enable RLS but allow inserts from anon (public tracking)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (tracking page views from public visitors)
CREATE POLICY "Allow public page view inserts"
  ON page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated admin users can SELECT (read analytics)
CREATE POLICY "Allow authenticated users to read page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (true);
