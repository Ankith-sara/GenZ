-- Migration: Safely handle app_role casting in handle_new_user trigger to prevent 500 auth errors
alter type public.app_role add value if not exists 'seller';
alter type public.app_role add value if not exists 'buyer';
alter type public.app_role add value if not exists 'admin';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role public.app_role;
  v_role_str text;
begin
  if new.email_confirmed_at is not null then
    v_role_str := lower(coalesce(new.raw_user_meta_data ->> 'role', 'buyer'));
    begin
      v_role := v_role_str::public.app_role;
    exception when others then
      v_role := 'buyer'::public.app_role;
    end;

    -- Insert into public.profiles
    insert into public.profiles (id, role, full_name, phone, city)
    values (
      new.id,
      v_role,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'phone',
      new.raw_user_meta_data ->> 'city'
    )
    on conflict (id) do update set
      role = excluded.role,
      full_name = excluded.full_name,
      phone = excluded.phone,
      city = excluded.city;

    -- If registered as seller with initial onboarding data in metadata, populate seller_profiles
    if v_role_str = 'seller' then
      if (new.raw_user_meta_data ->> 'business_name') is not null and (new.raw_user_meta_data ->> 'gst_number') is not null then
        insert into public.seller_profiles (
          id,
          business_name,
          gst_number,
          factory_address,
          city,
          state,
          pincode,
          description,
          established_year
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
  end if;

  return new;
end;
$$;
