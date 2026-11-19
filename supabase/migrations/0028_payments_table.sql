-- ============================================================
-- Migration 0028: Payments Table
-- ============================================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_ref text references public.orders(id) on delete set null,
  gateway_order_id text not null,
  amount_paise bigint not null,
  status text not null default 'created' check (status in ('created', 'captured', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payments_gateway_order_id_key on public.payments (gateway_order_id);
create index if not exists payments_order_ref_idx on public.payments (order_ref);
create index if not exists payments_status_idx on public.payments (status);

alter table public.payments enable row level security;

-- Admin / service role full access
drop policy if exists "Full access on payments for admin and service" on public.payments;
create policy "Full access on payments for admin and service"
  on public.payments
  using (true)
  with check (true);
