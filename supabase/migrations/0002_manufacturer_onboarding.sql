-- ============================================================
-- Manufacturer Onboarding & Verification schema
-- ============================================================

-- 1. Verification status enum ------------------------------------
create type public.verification_status as enum (
  'not_submitted',
  'pending',
  'verified',
  'rejected'
);

-- 2. Manufacturer profiles ----------------------------------------
-- One row per manufacturer (profiles.role = 'manufacturer'). Holds the
-- business details plus the verification workflow state.
create table public.manufacturer_profiles (
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

alter table public.manufacturer_profiles enable row level security;

create policy "Manufacturers view their own profile"
  on public.manufacturer_profiles for select
  using (auth.uid() = id);

create policy "Manufacturers can create their own profile"
  on public.manufacturer_profiles for insert
  with check (auth.uid() = id);

create policy "Manufacturers can update their own profile"
  on public.manufacturer_profiles for update
  using (auth.uid() = id);

create policy "Admins view all manufacturer profiles"
  on public.manufacturer_profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update any manufacturer profile"
  on public.manufacturer_profiles for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Manufacturers can freely edit their business details, but the
-- verification fields (status / rejection_reason / reviewed_*) can only
-- move through the "submit for review" transition on their own — every
-- other change to those fields requires an admin session. This runs
-- regardless of which policy allowed the UPDATE, so it holds even though
-- both an owner-policy and an admin-policy exist above.
create function public.protect_manufacturer_verification_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_admin boolean;
begin
  select exists(
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ) into is_admin;

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

create trigger protect_manufacturer_verification_fields_trigger
  before update on public.manufacturer_profiles
  for each row execute procedure public.protect_manufacturer_verification_fields();

-- 3. Manufacturer documents -----------------------------------------
create table public.manufacturer_documents (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null references public.profiles (id) on delete cascade,
  doc_type text not null check (
    doc_type in ('gst_certificate', 'factory_photo', 'quality_certificate', 'other')
  ),
  file_path text not null,
  file_name text not null,
  uploaded_at timestamptz not null default now()
);

alter table public.manufacturer_documents enable row level security;

create policy "Manufacturers manage their own documents"
  on public.manufacturer_documents for all
  using (auth.uid() = manufacturer_id)
  with check (auth.uid() = manufacturer_id);

create policy "Admins view all documents"
  on public.manufacturer_documents for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create index manufacturer_documents_manufacturer_id_idx
  on public.manufacturer_documents (manufacturer_id);

-- 4. Public manufacturer profile view --------------------------------
-- Expose only safe fields to users/buyers for verified manufacturers.
create view public.manufacturer_public_profiles as
select
  id,
  business_name,
  city,
  state,
  description,
  established_year
from public.manufacturer_profiles
where status = 'verified';

grant select on public.manufacturer_public_profiles to anon, authenticated;

-- 5. Storage bucket + policies ----------------------------------------
-- Private bucket. Files are stored at `${user_id}/${doc_type}/${filename}`
-- so ownership can be checked from the path alone.
insert into storage.buckets (id, name, public)
values ('manufacturer-documents', 'manufacturer-documents', false)
on conflict (id) do nothing;

create policy "Manufacturers upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'manufacturer-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Manufacturers view their own files"
  on storage.objects for select
  using (
    bucket_id = 'manufacturer-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Manufacturers delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'manufacturer-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins view all manufacturer files"
  on storage.objects for select
  using (
    bucket_id = 'manufacturer-documents'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
