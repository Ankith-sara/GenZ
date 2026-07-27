-- Migration: Prevent public profile creation until user email is verified (confirmed)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only populate public database tables AFTER the user has verified their email address
  if new.email_confirmed_at is not null then
    -- Insert into public.profiles
    insert into public.profiles (id, role, full_name, phone, city)
    values (
      new.id,
      coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'buyer'),
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'phone',
      new.raw_user_meta_data ->> 'city'
    )
    on conflict (id) do update set
      full_name = excluded.full_name,
      phone = excluded.phone,
      city = excluded.city;

    -- If registered as manufacturer with initial onboarding data in metadata, populate manufacturer_profiles
    if (new.raw_user_meta_data ->> 'role') = 'manufacturer' then
      if (new.raw_user_meta_data ->> 'business_name') is not null and (new.raw_user_meta_data ->> 'gst_number') is not null then
        insert into public.manufacturer_profiles (
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

-- Drop previous triggers and attach trigger to INSERT or UPDATE of email_confirmed_at
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_or_verified on auth.users;

create trigger on_auth_user_created_or_verified
  after insert or update of email_confirmed_at on auth.users
  for each row execute procedure public.handle_new_user();
