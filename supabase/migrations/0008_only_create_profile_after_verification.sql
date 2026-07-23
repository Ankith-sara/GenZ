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

    -- If registered as manufacturer, also populate public.manufacturer_profiles
    if (new.raw_user_meta_data ->> 'role') = 'manufacturer' then
      insert into public.manufacturer_profiles (
        id,
        business_name,
        owner_name,
        business_type,
        factory_address,
        state,
        district,
        pincode,
        established_year,
        google_maps_location,
        employee_count,
        product_categories,
        products_manufactured,
        manufacturing_capacity,
        moq,
        pan_number,
        cin_number,
        walkthrough_video_url,
        status
      )
      values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'business_name', 'Unnamed Business'),
        coalesce(new.raw_user_meta_data ->> 'owner_name', new.raw_user_meta_data ->> 'full_name', 'Owner'),
        coalesce(new.raw_user_meta_data ->> 'business_type', 'manufacturer'),
        new.raw_user_meta_data ->> 'factory_address',
        new.raw_user_meta_data ->> 'state',
        new.raw_user_meta_data ->> 'district',
        new.raw_user_meta_data ->> 'pincode',
        nullif(new.raw_user_meta_data ->> 'established_year', '')::integer,
        new.raw_user_meta_data ->> 'google_maps_location',
        nullif(new.raw_user_meta_data ->> 'employee_count', '')::integer,
        new.raw_user_meta_data ->> 'product_categories',
        new.raw_user_meta_data ->> 'products_manufactured',
        new.raw_user_meta_data ->> 'manufacturing_capacity',
        new.raw_user_meta_data ->> 'moq',
        new.raw_user_meta_data ->> 'pan_number',
        new.raw_user_meta_data ->> 'cin_number',
        new.raw_user_meta_data ->> 'walkthrough_video',
        'pending'
      )
      on conflict (id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

-- Drop previous trigger and attach trigger to INSERT or UPDATE of email_confirmed_at
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_or_verified on auth.users;

create trigger on_auth_user_created_or_verified
  after insert or update of email_confirmed_at on auth.users
  for each row execute procedure public.handle_new_user();
