-- 1. Ensure 'seller' enum value is present in public.app_role enum
alter type public.app_role add value if not exists 'seller';
alter type public.app_role add value if not exists 'buyer';
alter type public.app_role add value if not exists 'admin';

-- 2. Update existing approved sellers in public.profiles to have role = 'seller'
update public.profiles
set role = 'seller'::public.app_role
where id in (
  select id from public.seller_profiles
  union
  select auth.users.id from auth.users where lower(email) in (select lower(email) from public.seller_applications)
);

-- 3. Sync auth.users metadata role to 'seller' for approved sellers
update auth.users
set raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', '"seller"')
where lower(email) in (select lower(email) from public.seller_applications);
