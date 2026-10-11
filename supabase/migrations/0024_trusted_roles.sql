-- ============================================================
-- Migration 0024: Trusted role sources
--
-- raw_user_meta_data (user_metadata) is writable by the signed-in user via
-- supabase.auth.updateUser({ data }). It must never decide a role.
-- Roles now come only from:
--   * public.profiles.role       (protected by triggers below)
--   * raw_app_meta_data ->> role (service-role only)
--   * public.employees           (admin-only RLS)
-- ============================================================

-- 0. Rebuild app_role as ('buyer', 'seller', 'emp', 'admin').
--    'manufacturer' is a legacy value from before manufacturers were renamed
--    to sellers, so those rows become 'seller'. 'emp' makes internal staff
--    visible on their profile row. Postgres cannot drop an enum value, so the
--    type is swapped. Only policies that actually depend on profiles.role
--    (per pg_depend) block ALTER COLUMN TYPE; those are saved, dropped and
--    recreated verbatim in the same transaction. Storage policies are never
--    touched, because the SQL editor role does not own storage.objects.
do $$
declare
  pol record;
  saved text[] := '{}';
  stmt text;
begin
  for pol in
    select distinct pp.*
    from pg_policy p
    join pg_depend d
      on d.classid = 'pg_policy'::regclass and d.objid = p.oid
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_policies pp
      on pp.schemaname = n.nspname and pp.tablename = c.relname and pp.policyname = p.polname
    where d.refobjid = 'public.profiles'::regclass
      and d.refobjsubid = (
        select attnum from pg_attribute
        where attrelid = 'public.profiles'::regclass and attname = 'role'
      )
  loop
    stmt := format(
      'create policy %I on %I.%I as %s for %s to %s',
      pol.policyname, pol.schemaname, pol.tablename, pol.permissive, pol.cmd,
      array_to_string(array(select quote_ident(r) from unnest(pol.roles) as r), ', ')
    );
    if pol.qual is not null then
      stmt := stmt || format(' using (%s)', pol.qual);
    end if;
    if pol.with_check is not null then
      stmt := stmt || format(' with check (%s)', pol.with_check);
    end if;
    saved := saved || stmt;
    execute format('drop policy %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;

  alter type public.app_role rename to app_role_old;
  create type public.app_role as enum ('buyer', 'seller', 'emp', 'admin');
  alter table public.profiles alter column role drop default;
  alter table public.profiles
    alter column role type public.app_role using (
      case
        when role::text = 'manufacturer' then 'seller'
        when role::text in ('buyer', 'seller', 'emp', 'admin') then role::text
        else 'buyer'
      end
    )::public.app_role;
  alter table public.profiles alter column role set default 'buyer';
  drop type public.app_role_old;

  foreach stmt in array saved loop
    execute stmt;
  end loop;
end $$;

-- 1. Signup trigger: take the role from raw_app_meta_data only.
--    A browser signUp() can set raw_user_meta_data but not raw_app_meta_data,
--    so self-registered users always become buyers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role public.app_role := 'buyer';
  v_app_role text;
begin
  if new.email_confirmed_at is not null then
    v_app_role := lower(coalesce(new.raw_app_meta_data ->> 'role', ''));
    if v_app_role in ('seller', 'emp', 'admin') then
      v_role := v_app_role::public.app_role;
    end if;

    insert into public.profiles (id, role, full_name, phone, city)
    values (
      new.id,
      v_role,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'phone',
      new.raw_user_meta_data ->> 'city'
    )
    on conflict (id) do update set
      -- Never change an existing role from the signup/verification path.
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      phone = coalesce(public.profiles.phone, excluded.phone),
      city = coalesce(public.profiles.city, excluded.city);

    -- Seller onboarding rows are only created for sellers provisioned by an admin.
    if v_role = 'seller'
      and (new.raw_user_meta_data ->> 'business_name') is not null
      and (new.raw_user_meta_data ->> 'gst_number') is not null then
      insert into public.seller_profiles (
        id, business_name, gst_number, factory_address, city, state, pincode,
        description, established_year
      )
      values (
        new.id,
        new.raw_user_meta_data ->> 'business_name',
        new.raw_user_meta_data ->> 'gst_number',
        new.raw_user_meta_data ->> 'factory_address',
        new.raw_user_meta_data ->> 'city',
        new.raw_user_meta_data ->> 'state',
        new.raw_user_meta_data ->> 'pincode',
        new.raw_user_meta_data ->> 'description',
        nullif(new.raw_user_meta_data ->> 'established_year', '')::integer
      )
      on conflict (id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

-- 2. Role protection on profiles, for INSERT and UPDATE.
--    End users (auth.uid() is set) who are not admins can neither insert a
--    privileged role nor change one. Server-side callers without an end-user
--    JWT (service role, auth triggers) are trusted; 0014 wrongly reverted
--    their changes too, which silently undid admin seller approvals.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'buyer';
    new.account_status := 'active';
  else
    new.role := old.role;
    if old.account_status is not null then
      new.account_status := old.account_status;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role_trigger on public.profiles;
create trigger protect_profile_role_trigger
  before insert or update on public.profiles
  for each row execute procedure public.protect_profile_role();

-- 3. Backfill: verified sellers get the seller role on their protected profile.
update public.profiles p
set role = 'seller'
where p.role = 'buyer'
  and (
    exists (
      select 1 from public.seller_profiles sp
      where sp.id = p.id and sp.status = 'verified'
    )
    or exists (
      select 1
      from auth.users u
      join public.seller_applications sa on lower(sa.email) = lower(u.email)
      where u.id = p.id and sa.status = 'approved'
    )
  );

-- 3b. The app stores an employee's role name and role template id on every
--     save (packages/database/src/employees.ts). These columns were missing,
--     so every employee upsert failed and silently fell back to a JSON file.
alter table public.employees
  add column if not exists role varchar(100),
  add column if not exists role_id varchar(100);

-- 4. Backfill: active employees are shown as 'emp' on their profile row, and
--    get the same service-role app_metadata marker. Their permissions and admin
--    level still come live from public.employees (requireRole re-checks it).
update public.profiles p
set role = 'emp'
where p.role = 'buyer'
  and exists (
    select 1 from public.employees e
    where e.id = p.id and e.status = 'active'
  );

update auth.users u
set raw_app_meta_data =
  jsonb_set(coalesce(u.raw_app_meta_data, '{}'::jsonb), '{role}', '"emp"')
where exists (
    select 1 from public.employees e
    where e.status = 'active'
      and (e.id = u.id or lower(e.email) = lower(u.email))
  )
  and coalesce(u.raw_app_meta_data ->> 'role', '') <> 'admin';

-- 5. Review before deploying: accounts that were admin ONLY through the
--    user-writable metadata. They lose admin access after this migration.
--    Promote legitimate ones explicitly with:
--      update public.profiles set role = 'admin' where id = '<user id>';
--
--   select u.id, u.email
--   from auth.users u
--   left join public.profiles p on p.id = u.id
--   where u.raw_user_meta_data ->> 'role' = 'admin'
--     and coalesce(p.role::text, '') <> 'admin';
