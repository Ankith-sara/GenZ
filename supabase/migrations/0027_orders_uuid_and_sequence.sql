-- ============================================================
-- Migration 0027: Orders UUID, sequence, and indexes
-- ============================================================

-- 1. Sequence for human-readable order number
create sequence if not exists public.order_number_seq start with 100001;

-- 2. Add order_number column to orders if not exists
alter table public.orders
  add column if not exists order_number text not null default concat('GZ-', lpad(nextval('public.order_number_seq')::text, 6, '0'));

-- 3. Unique index on order_number
create unique index if not exists orders_order_number_key
  on public.orders (order_number);

-- 4. Fast lookups on customer_id, created_at desc, status
create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
