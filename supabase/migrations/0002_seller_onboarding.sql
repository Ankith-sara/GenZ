-- ============================================================
-- Seller Onboarding & Verification schema
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
  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type public.verification_status as enum (
      'not_submitted',
      'pending',
      'verified',
      'rejected'
    );
  end if;
end $$;

-- 2. Seller profiles ----------------------------------------
create table if not exists public.seller_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null,
  gst_number text not null,
  factory_address text,
  city text,
  state text,
  pincode text,
  description text,
  established_year int,

  status public.verification_status not null default 'not_submitted',
  rejection_reason text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seller_profiles enable row level security;

drop policy if exists "Sellers view their own profile" on public.seller_profiles;
create policy "Sellers view their own profile"
  on public.seller_profiles for select
  using (auth.uid() = id);

drop policy if exists "Sellers can create their own profile" on public.seller_profiles;
create policy "Sellers can create their own profile"
  on public.seller_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Sellers can update their own profile" on public.seller_profiles;
create policy "Sellers can update their own profile"
  on public.seller_profiles for update
  using (auth.uid() = id);

drop policy if exists "Admins view all seller profiles" on public.seller_profiles;
create policy "Admins view all seller profiles"
  on public.seller_profiles for select
  using (public.is_admin());

drop policy if exists "Admins can update any seller profile" on public.seller_profiles;
create policy "Admins can update any seller profile"
  on public.seller_profiles for update
  using (public.is_admin());

create or replace function public.protect_seller_verification_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_admin boolean;
begin
  select public.is_admin() into is_admin;

  if not is_admin then
    if new.status is distinct from old.status then
      if new.status = 'pending' and old.status in ('not_submitted', 'rejected') then
        new.submitted_at := now();
      else
        new.status := old.status;
      end if;
    end if;
    new.rejection_reason := old.rejection_reason;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_seller_verification_fields_trigger on public.seller_profiles;
create trigger protect_seller_verification_fields_trigger
  before update on public.seller_profiles
  for each row execute procedure public.protect_seller_verification_fields();

-- 3. Seller documents -----------------------------------------
create table if not exists public.seller_documents (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  doc_type text not null check (
    doc_type in ('gst_certificate', 'factory_photo', 'quality_certificate', 'other')
  ),
  file_path text not null,
  file_name text not null,
  uploaded_at timestamptz not null default now()
);

-- Guard: ensure seller_id column exists on seller_documents
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'seller_documents' and column_name = 'manufacturer_id'
  ) and not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'seller_documents' and column_name = 'seller_id'
  ) then
    alter table public.seller_documents rename column manufacturer_id to seller_id;
  elsif not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'seller_documents' and column_name = 'seller_id'
  ) then
    alter table public.seller_documents add column seller_id uuid references public.profiles (id) on delete cascade;
  end if;
end $$;

alter table public.seller_documents enable row level security;

drop policy if exists "Sellers manage their own documents" on public.seller_documents;
create policy "Sellers manage their own documents"
  on public.seller_documents for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "Admins view all documents" on public.seller_documents;
create policy "Admins view all documents"
  on public.seller_documents for select
  using (public.is_admin());

create index if not exists seller_documents_seller_id_idx
  on public.seller_documents (seller_id);

-- 4. Public seller profile view --------------------------------
create or replace view public.seller_public_profiles as
select
  id,
  business_name,
  city,
  state,
  description,
  established_year
from public.seller_profiles
where status = 'verified';

grant select on public.seller_public_profiles to anon, authenticated;

-- 5. Storage bucket + policies ----------------------------------------
insert into storage.buckets (id, name, public)
values ('seller-documents', 'seller-documents', false)
on conflict (id) do nothing;

drop policy if exists "Sellers upload to their own folder" on storage.objects;
create policy "Sellers upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'seller-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Sellers view their own files" on storage.objects;
create policy "Sellers view their own files"
  on storage.objects for select
  using (
    bucket_id = 'seller-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Sellers delete their own files" on storage.objects;
create policy "Sellers delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'seller-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admins view all seller files" on storage.objects;
create policy "Admins view all seller files"
  on storage.objects for select
  using (
    bucket_id = 'seller-documents'
    and public.is_admin()
  );
