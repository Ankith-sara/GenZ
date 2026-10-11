-- ============================================================
-- Migration 0025: Rate limiter query indexes and retention
-- The limiter (packages/utils/src/rate-limiter.ts) now writes through the
-- service-role client, so this table grows with real traffic.
-- ============================================================

create index if not exists rate_limit_logs_type_ip_created_idx
  on public.rate_limit_logs (endpoint_type, ip_address, created_at desc);

create index if not exists rate_limit_logs_type_identifier_created_idx
  on public.rate_limit_logs (endpoint_type, identifier, created_at desc);

create index if not exists rate_limit_logs_action_created_idx
  on public.rate_limit_logs (endpoint_type, action_name, created_at desc);

-- Rows older than the longest window (10 minutes) are never read again.
-- Schedule daily, e.g. with pg_cron:
--   select cron.schedule('purge-rate-limit-logs', '15 3 * * *',
--     $$ select public.purge_rate_limit_logs(); $$);
create or replace function public.purge_rate_limit_logs()
returns void
language sql
security definer set search_path = public
as $$
  delete from public.rate_limit_logs where created_at < now() - interval '1 day';
$$;

revoke all on function public.purge_rate_limit_logs() from public, anon, authenticated;
