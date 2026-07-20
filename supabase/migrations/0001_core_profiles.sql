-- ============================================================
-- Core & Profiles schema: roles, profiles, waitlist, avatars
-- ============================================================

-- 1. Role enum -------------------------------------------------
create type public.app_role as enum ('buyer', 'manufacturer', 'admin');

-- 2. Profiles table --------------------------------------------
-- One row per auth.users row. Created automatically by the trigger
-- below whenever someone signs up.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'buyer',
  full_name text,
  city text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read and update their own profile only.
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can view every profile (used by the verification queue later).
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 3. Auto-create a profile row on signup ------------------------
-- Reads role + full_name out of the auth metadata passed at
-- supabase.auth.signUp({ options: { data: { role, full_name } } }).
-- Public signup only ever sends 'buyer' or 'manufacturer' (enforced
-- in src/app/signup/actions.ts); admin accounts must be created
-- manually, e.g. `update public.profiles set role = 'admin' where id = '...'`.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'buyer'),
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Waitlist table ----------------------------------------------
-- Public, anonymous signups from the homepage — not tied to auth.users.
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  city text,
  phone text,
  role text not null,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Anyone (including anon) can join the waitlist.
create policy "Anyone can join the waitlist"
  on public.waitlist for insert
  with check (true);

-- Only admins can read the list.
create policy "Admins can view the waitlist"
  on public.waitlist for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create unique index waitlist_email_unique on public.waitlist (lower(email));

-- 5. Avatars Storage Bucket & Policies ---------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Users upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users replace their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');
