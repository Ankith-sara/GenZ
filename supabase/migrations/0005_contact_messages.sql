-- ============================================================
-- public marketing "Contact" page submissions
-- Distinct from `inquiries` (buyer → manufacturer, product-scoped):
-- this is the general "Email / Contact Us" form on the About/Contact
-- pages — press, partnerships, general questions, etc.
-- ============================================================

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  reason text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone can submit — it's a public "contact us" form.
create policy "Anyone can send a contact message"
  on public.contact_messages for insert
  with check (true);

-- Only admins can read submissions.
create policy "Admins can view contact messages"
  on public.contact_messages for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
