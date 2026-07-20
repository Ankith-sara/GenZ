-- ============================================================
-- Products, Variants, & Reels schema
-- ============================================================

-- 1. Product status enum ------------------------------------------
create type public.product_status as enum ('draft', 'published', 'archived');

-- 2. Products ---------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null references public.profiles (id) on delete cascade,
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

alter table public.products enable row level security;

create index products_manufacturer_id_idx on public.products (manufacturer_id);
create index products_status_idx on public.products (status);
create index products_category_idx on public.products (category);
create index products_age_group_idx on public.products (age_group);
create index products_price_idx on public.products (price_inr);
create index products_search_vector_idx on public.products using gin (search_vector);

-- Anyone can browse published products; owners can always see their own
-- (drafts included); admins can see everything.
create policy "Published products are publicly visible"
  on public.products for select
  using (
    status = 'published'
    or auth.uid() = manufacturer_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Only verified manufacturers can list products — this is the whole
-- premise of the platform (verified-only), so it's enforced here rather
-- than trusted to the frontend.
create policy "Verified manufacturers can create products"
  on public.products for insert
  with check (
    auth.uid() = manufacturer_id
    and exists (
      select 1 from public.manufacturer_profiles mp
      where mp.id = auth.uid() and mp.status = 'verified'
    )
  );

create policy "Manufacturers manage their own products"
  on public.products for update
  using (auth.uid() = manufacturer_id)
  with check (auth.uid() = manufacturer_id);

create policy "Manufacturers delete their own products"
  on public.products for delete
  using (auth.uid() = manufacturer_id);

create function public.set_products_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_updated_at_trigger
  before update on public.products
  for each row execute procedure public.set_products_updated_at();

-- 3. Product variants -------------------------------------------------
-- A variant is a named axis (e.g. "Color", "Size") + a value (e.g. "Red", "Large"),
-- with its own optional price override and stock count.
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  manufacturer_id uuid not null references public.profiles (id) on delete cascade,
  variant_name text not null,
  variant_value text not null,
  price_inr numeric(10, 2),
  stock_qty integer,
  created_at timestamptz not null default now()
);

alter table public.product_variants enable row level security;

create index product_variants_product_id_idx on public.product_variants (product_id);

create policy "Variants visible where the product is visible"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and (
          p.status = 'published'
          or auth.uid() = p.manufacturer_id
          or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
        )
    )
  );

create policy "Manufacturers manage variants on their own products"
  on public.product_variants for all
  using (auth.uid() = manufacturer_id)
  with check (
    auth.uid() = manufacturer_id
    and exists (select 1 from public.products p where p.id = product_id and p.manufacturer_id = auth.uid())
  );

-- 4. Multiple product images --------------------------------------------
-- `products.cover_image_path` remains the primary/hero image; this table
-- holds any additional gallery images, ordered by `position`.
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  manufacturer_id uuid not null references public.profiles (id) on delete cascade,
  image_path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_images enable row level security;

create index product_images_product_id_idx on public.product_images (product_id, position);

create policy "Product images visible where the product is visible"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and (
          p.status = 'published'
          or auth.uid() = p.manufacturer_id
          or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
        )
    )
  );

create policy "Manufacturers manage images on their own products"
  on public.product_images for all
  using (auth.uid() = manufacturer_id)
  with check (
    auth.uid() = manufacturer_id
    and exists (select 1 from public.products p where p.id = product_id and p.manufacturer_id = auth.uid())
  );

-- 5. Reels ---------------------------------------------------------
create table public.reels (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  manufacturer_id uuid not null references public.profiles (id) on delete cascade,
  video_path text not null,
  thumbnail_path text,
  caption text,
  created_at timestamptz not null default now()
);

alter table public.reels enable row level security;

create index reels_product_id_idx on public.reels (product_id);

create policy "Reels visible where the product is visible"
  on public.reels for select
  using (
    exists (
      select 1 from public.products p
      where p.id = reels.product_id
        and (
          p.status = 'published'
          or auth.uid() = p.manufacturer_id
          or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
        )
    )
  );

create policy "Manufacturers manage reels on their own products"
  on public.reels for all
  using (auth.uid() = manufacturer_id)
  with check (
    auth.uid() = manufacturer_id
    and exists (select 1 from public.products p where p.id = product_id and p.manufacturer_id = auth.uid())
  );

-- 6. Storage bucket + policies -------------------------------------
-- Public bucket: once a product is published, its cover image and reels
-- are meant to be publicly viewable. Writes are still locked to the owning manufacturer's folder.
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

create policy "Manufacturers upload to their own product-media folder"
  on storage.objects for insert
  with check (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Manufacturers update their own product-media files"
  on storage.objects for update
  using (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Manufacturers delete their own product-media files"
  on storage.objects for delete
  using (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Product media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-media');
