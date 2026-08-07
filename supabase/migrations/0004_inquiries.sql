-- ============================================================
-- Inquiries schema (buyer → seller)
-- ============================================================

-- Helper function: check if caller is an admin (SECURITY DEFINER to prevent RLS infinite recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'inquiry_status') then
    create type public.inquiry_status as enum ('new', 'responded', 'closed');
  end if;
end $$;

-- 2. Inquiries table ----------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  buyer_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

-- Guard: ensure seller_id column exists on inquiries
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'inquiries' and column_name = 'manufacturer_id'
  ) and not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'inquiries' and column_name = 'seller_id'
  ) then
    alter table public.inquiries rename column manufacturer_id to seller_id;
  elsif not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'inquiries' and column_name = 'seller_id'
  ) then
    alter table public.inquiries add column seller_id uuid references public.profiles (id) on delete cascade;
  end if;
end $$;

alter table public.inquiries enable row level security;

create index if not exists inquiries_seller_id_idx on public.inquiries (seller_id);
create index if not exists inquiries_product_id_idx on public.inquiries (product_id);

drop policy if exists "Anyone can submit an inquiry on a published product" on public.inquiries;
create policy "Anyone can submit an inquiry on a published product"
  on public.inquiries for insert
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.seller_id = inquiries.seller_id
        and p.status = 'published'
    )
    and (buyer_id is null or buyer_id = auth.uid())
  );

drop policy if exists "Sellers and buyers can view relevant inquiries" on public.inquiries;
create policy "Sellers and buyers can view relevant inquiries"
  on public.inquiries for select
  using (
    auth.uid() = seller_id
    or auth.uid() = buyer_id
    or public.is_admin()
  );

drop policy if exists "Sellers can update status on their own inquiries" on public.inquiries;
create policy "Sellers can update status on their own inquiries"
  on public.inquiries for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);
