-- ============================================================
-- GenZ — Newsletter Subscribers
-- ============================================================

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone (including anon) can subscribe to the newsletter
create policy "Anyone can subscribe to the newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only admins can read subscribers
create policy "Admins can view newsletter subscribers"
  on public.newsletter_subscribers for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create unique index newsletter_email_unique on public.newsletter_subscribers (lower(email));
