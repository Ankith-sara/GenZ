-- ============================================================
-- Products, Variants, & Reels schema
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
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type public.product_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

-- 2. Products ---------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  category text not null default 'toys',
  description text,
  price_inr numeric(10, 2),
  status public.product_status not null default 'draft',
  cover_image_path text,
  age_group text,
  materials text[] not null default '{}',
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Guard: ensure seller_id column exists if table pre-existed with manufacturer_id
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'products' and column_name = 'manufacturer_id'
  ) and not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'products' and column_name = 'seller_id'
  ) then
    alter table public.products rename column manufacturer_id to seller_id;
  elsif not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'products' and column_name = 'seller_id'
  ) then
    alter table public.products add column seller_id uuid references public.profiles (id) on delete cascade;
  end if;
end $$;

alter table public.products enable row level security;

create index if not exists products_seller_id_idx on public.products (seller_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_age_group_idx on public.products (age_group);
create index if not exists products_price_idx on public.products (price_inr);
create index if not exists products_search_vector_idx on public.products using gin (search_vector);

drop policy if exists "Published products are publicly visible" on public.products;
create policy "Published products are publicly visible"
  on public.products for select
  using (
    status = 'published'
    or auth.uid() = seller_id
    or public.is_admin()
  );

drop policy if exists "Verified sellers can create products" on public.products;
create policy "Verified sellers can create products"
  on public.products for insert
  with check (
    auth.uid() = seller_id
    and (
      exists (
        select 1 from public.seller_profiles mp
        where mp.id = auth.uid() and mp.status = 'verified'
      )
      or public.is_admin()
    )
  );

drop policy if exists "Sellers manage their own products" on public.products;
create policy "Sellers manage their own products"
  on public.products for update
  using (auth.uid() = seller_id or public.is_admin())
  with check (auth.uid() = seller_id or public.is_admin());

drop policy if exists "Sellers delete their own products" on public.products;
create policy "Sellers delete their own products"
  on public.products for delete
  using (auth.uid() = seller_id or public.is_admin());

create or replace function public.set_products_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_updated_at_trigger on public.products;
create trigger products_updated_at_trigger
  before update on public.products
  for each row execute procedure public.set_products_updated_at();

-- 3. Product variants -------------------------------------------------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  variant_name text not null,
  variant_value text not null,
  price_inr numeric(10, 2),
  stock_qty integer,
  created_at timestamptz not null default now()
);

-- Guard: ensure seller_id column exists on product_variants
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'product_variants' and column_name = 'manufacturer_id'
  ) and not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'product_variants' and column_name = 'seller_id'
  ) then
    alter table public.product_variants rename column manufacturer_id to seller_id;
  elsif not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'product_variants' and column_name = 'seller_id'
  ) then
    alter table public.product_variants add column seller_id uuid references public.profiles (id) on delete cascade;
  end if;
end $$;

alter table public.product_variants enable row level security;

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);

drop policy if exists "Variants visible where the product is visible" on public.product_variants;
create policy "Variants visible where the product is visible"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and (
          p.status = 'published'
          or auth.uid() = p.seller_id
          or public.is_admin()
        )
    )
  );

drop policy if exists "Sellers manage variants on their own products" on public.product_variants;
create policy "Sellers manage variants on their own products"
  on public.product_variants for all
  using (auth.uid() = seller_id or public.is_admin())
  with check (
    (auth.uid() = seller_id and exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid()))
    or public.is_admin()
  );

-- 4. Multiple product images --------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  image_path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Guard: ensure seller_id column exists on product_images
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'product_images' and column_name = 'manufacturer_id'
  ) and not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'product_images' and column_name = 'seller_id'
  ) then
    alter table public.product_images rename column manufacturer_id to seller_id;
  elsif not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'product_images' and column_name = 'seller_id'
  ) then
    alter table public.product_images add column seller_id uuid references public.profiles (id) on delete cascade;
  end if;
end $$;

alter table public.product_images enable row level security;

create index if not exists product_images_product_id_idx on public.product_images (product_id, position);

drop policy if exists "Product images visible where the product is visible" on public.product_images;
create policy "Product images visible where the product is visible"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and (
          p.status = 'published'
          or auth.uid() = p.seller_id
          or public.is_admin()
        )
    )
  );

drop policy if exists "Sellers manage images on their own products" on public.product_images;
create policy "Sellers manage images on their own products"
  on public.product_images for all
  using (auth.uid() = seller_id or public.is_admin())
  with check (
    (auth.uid() = seller_id and exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid()))
    or public.is_admin()
  );

-- 5. Reels ---------------------------------------------------------
create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  video_path text not null,
  thumbnail_path text,
  caption text,
  created_at timestamptz not null default now()
);

-- Guard: ensure seller_id column exists on reels
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'reels' and column_name = 'manufacturer_id'
  ) and not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'reels' and column_name = 'seller_id'
  ) then
    alter table public.reels rename column manufacturer_id to seller_id;
  elsif not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'reels' and column_name = 'seller_id'
  ) then
    alter table public.reels add column seller_id uuid references public.profiles (id) on delete cascade;
  end if;
end $$;

alter table public.reels enable row level security;

create index if not exists reels_product_id_idx on public.reels (product_id);

drop policy if exists "Reels visible where the product is visible" on public.reels;
create policy "Reels visible where the product is visible"
  on public.reels for select
  using (
    exists (
      select 1 from public.products p
      where p.id = reels.product_id
        and (
          p.status = 'published'
          or auth.uid() = p.seller_id
          or public.is_admin()
        )
    )
  );

drop policy if exists "Sellers manage reels on their own products" on public.reels;
create policy "Sellers manage reels on their own products"
  on public.reels for all
  using (auth.uid() = seller_id or public.is_admin())
  with check (
    (auth.uid() = seller_id and exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid()))
    or public.is_admin()
  );

-- 6. Storage bucket + policies -------------------------------------
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

drop policy if exists "Sellers upload to their own product-media folder" on storage.objects;
create policy "Sellers upload to their own product-media folder"
  on storage.objects for insert
  with check (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Sellers update their own product-media files" on storage.objects;
create policy "Sellers update their own product-media files"
  on storage.objects for update
  using (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Sellers delete their own product-media files" on storage.objects;
create policy "Sellers delete their own product-media files"
  on storage.objects for delete
  using (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Product media is publicly readable" on storage.objects;
create policy "Product media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-media');
