-- ============================================================
-- Orders and Order Tracking schema
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'placed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    );
  end if;
end $$;

-- 1. Orders table
create table if not exists public.orders (
  id text primary key, -- e.g. 'GZ-ORD-2026-10492' or uuid
  customer_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb not null default '{}'::jsonb,
  payment_method text not null default 'cod',
  payment_status text not null default 'pending',
  status public.order_status not null default 'placed',
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  shipping_fee numeric not null default 0,
  total_amount numeric not null default 0,
  items jsonb not null default '[]'::jsonb,
  seller_ids text[] not null default '{}',
  carrier text,
  tracking_number text,
  tracking_events jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- RLS Policies:
-- 1. Anyone can insert an order (Guest & logged in buyers checkout)
drop policy if exists "Buyers can create orders" on public.orders;
create policy "Buyers can create orders"
  on public.orders for insert
  with check (true);

-- 2. Buyers can view their own orders
drop policy if exists "Buyers can view own orders" on public.orders;
create policy "Buyers can view own orders"
  on public.orders for select
  using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or auth.uid()::text = any(seller_ids)
  );

-- 3. Admins and sellers can update orders
drop policy if exists "Sellers and Admins can update orders" on public.orders;
create policy "Sellers and Admins can update orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or auth.uid()::text = any(seller_ids)
  );
