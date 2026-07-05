-- ============================================================
-- GenZ — Inquiries schema (buyer → manufacturer)
-- ============================================================

-- 1. Inquiry status enum -------------------------------------------
create type public.inquiry_status as enum ('new', 'responded', 'closed');

-- 2. Inquiries table ----------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  manufacturer_id uuid not null references public.profiles (id) on delete cascade,
  buyer_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

create index inquiries_manufacturer_id_idx on public.inquiries (manufacturer_id);
create index inquiries_product_id_idx on public.inquiries (product_id);

-- Anyone (including anonymous visitors) can submit an inquiry on a
-- published product — this is the whole point of the contact form — but
-- the manufacturer_id must actually match the product's owner, so a
-- caller can't misattribute an inquiry to someone else.
create policy "Anyone can submit an inquiry on a published product"
  on public.inquiries for insert
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.manufacturer_id = inquiries.manufacturer_id
        and p.status = 'published'
    )
    and (buyer_id is null or buyer_id = auth.uid())
  );

-- Manufacturers see inquiries addressed to them; admins see everything;
-- a signed-in buyer can see the inquiries they personally submitted.
create policy "Manufacturers and buyers can view relevant inquiries"
  on public.inquiries for select
  using (
    auth.uid() = manufacturer_id
    or auth.uid() = buyer_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Manufacturers can update the status of their own inquiries (e.g. mark
-- responded/closed) — nothing else about an inquiry is editable.
create policy "Manufacturers can update status on their own inquiries"
  on public.inquiries for update
  using (auth.uid() = manufacturer_id)
  with check (auth.uid() = manufacturer_id);
