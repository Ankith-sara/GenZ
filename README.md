# GenZ — Week 1: Foundation & Auth

Next.js 15 + TypeScript + Tailwind v4 + shadcn/ui + Supabase, scaffolding the
Trust Commerce & Manufacturing Platform.

## What's in this build

- **Project setup** — Next.js 15 (App Router), TypeScript, Tailwind v4, ESLint
- **shadcn/ui** — `Button`, `Input`, `Label`, `Card` primitives hand-wired into
  `src/components/ui` (the `shadcn` CLI registry at `ui.shadcn.com` wasn't
  reachable from the build sandbox, so these were written by hand in the same
  style/API the CLI generates — `npx shadcn add <component>` will still work
  normally on your machine and slot right in)
- **Supabase integration** — browser client, server client, and middleware
  session refresh (`src/lib/supabase/*`)
- **Role system** — `buyer | manufacturer | admin` enum in Postgres, a
  `profiles` table, and an `on_auth_user_created` trigger that reads the role
  out of signup metadata (`supabase/migrations/0001_init.sql`)
- **Login / Signup** — `/login` and `/signup`, with role selection (buyer or
  manufacturer) baked into signup. Admin accounts are never created through
  public signup — see "Creating an admin" below.
- **Home page** — Hero + waitlist section, writing directly to a public
  `waitlist` table
- **Protected routes** — `src/middleware.ts` redirects unauthenticated users
  away from `/dashboard/**`, and each role-specific dashboard page
  (`/dashboard/buyer`, `/dashboard/manufacturer`, `/dashboard/admin`)
  double-checks the role server-side via `requireRole()`

Design tokens (cream canvas, achromatic UI, serif/sans pairing) carry over
from the earlier Faire-styled landing page prototype — see
`src/app/globals.css`.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, then run the
migration in `supabase/migrations/0001_init.sql` against it — either paste it
into the SQL Editor in the dashboard, or with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates the `app_role` enum, `profiles` table (with RLS + the
auto-profile trigger), and the public `waitlist` table.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
your Supabase project's **Settings → API** page.

### 4. Configure the email redirect (Supabase dashboard)

Under **Authentication → URL Configuration**, add:

```
http://localhost:3000/auth/confirm
```

to the Redirect URLs allow-list (and your production URL once deployed).

### 5. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Creating an admin

Public signup only ever creates `buyer` or `manufacturer` accounts. To
promote someone to admin, run in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where id = '<user-uuid>';
```

## Project structure

```
src/
  app/
    page.tsx                 Home (hero + waitlist)
    login/                   Sign in
    signup/                  Sign up with role selection
    auth/confirm/route.ts    Email confirmation handler
    dashboard/
      layout.tsx             Shared shell + sign out
      page.tsx                Redirects to the right role dashboard
      buyer/ manufacturer/ admin/   Role-specific pages
  components/
    ui/                      shadcn/ui primitives
    waitlist-form.tsx        Client-side waitlist form (writes to Supabase)
  lib/
    supabase/
      client.ts              Browser client
      server.ts               Server Component / Server Action client
      middleware.ts            Session refresh + route guarding
    auth.ts                  getUserAndProfile() helper
    require-role.ts          requireRole() guard for dashboard pages
  middleware.ts               Wires updateSession() into Next's middleware
  types/database.ts          Role, Profile, WaitlistEntry, Database generics
supabase/migrations/0001_init.sql
```

## Week 2 — Manufacturer Onboarding & Verification

- **Manufacturer profile creation** — `/dashboard/manufacturer/onboarding`.
  Business name, GSTIN (validated against the standard 15-character GSTIN
  pattern), factory address, city/state/pincode, established year, and a
  free-text description. Saved to `manufacturer_profiles`
  (`supabase/migrations/0002_manufacturer_onboarding.sql`).
- **Document upload** — `/dashboard/manufacturer/documents`. Uploads go to a
  private Supabase Storage bucket (`manufacturer-documents`), scoped per user
  by folder path (`${user_id}/${doc_type}/...`), with a
  `manufacturer_documents` row tracking each file. Covers GST certificate,
  factory photos, and quality certificates (10MB cap, PDF/JPG/PNG/WebP).
- **Verification status workflow** — `not_submitted → pending → verified` or
  `rejected`. A manufacturer can freely edit their own business details, but
  a Postgres trigger (`protect_manufacturer_verification_fields`) blocks
  anyone who isn't an admin from touching `status`, `rejection_reason`, or
  `reviewed_*` directly — the only transition a manufacturer can make
  themselves is `not_submitted`/`rejected` → `pending`, via the "Submit for
  Verification" button. Only an authenticated admin session can approve or
  reject.
- **Admin verification panel** — `/dashboard/admin/verifications`, tabbed by
  status, with a detail view per manufacturer
  (`/dashboard/admin/verifications/[id]`) showing business details, signed
  URLs for each uploaded document (10-minute expiry), and Approve /
  Request Changes actions. Rejecting requires a reason, which the
  manufacturer sees on their own dashboard.

### One more migration to run

If you already ran `0001_init.sql` from Week 1, apply the new one too:

```bash
supabase db push
```

(or paste `supabase/migrations/0002_manufacturer_onboarding.sql` into the SQL
Editor). It adds the `verification_status` enum, `manufacturer_profiles` and
`manufacturer_documents` tables with RLS, the verification-field-protection
trigger, and the `manufacturer-documents` storage bucket + policies.

## Week 3 — Product & Reel System

- **Product CRUD** — `/dashboard/manufacturer/products`. Create/edit/delete,
  with a draft → published → archived status. Listing a product is gated at
  the database level: the RLS insert policy on `products` requires
  `manufacturer_profiles.status = 'verified'`, so an unverified manufacturer
  can't create one even by calling the API directly — the "Get verified to
  list products" prompt in the UI is a courtesy, not the actual gate.
- **Reel upload & management** — video + optional thumbnail per reel,
  attached to a product (`/dashboard/manufacturer/products/[id]/reels`).
  Files live in the public `product-media` bucket (`supabase/migrations/
  0003_products_reels.sql`), folder-scoped to the manufacturer for writes;
  reads are public since published listings are meant to be browsable
  without auth. Video capped at 50MB, thumbnail at 5MB.
- **Product detail page with reels** — `/products/[id]`, a public page (no
  login required) showing the cover image, price, description, the
  manufacturer's business name/location, and every reel as an inline video
  player with its caption. Only reachable for `published` products — drafts
  404 for anyone who isn't the owner or an admin (enforced by the same RLS
  policy that powers the manufacturer's own product list).

### Migration

```bash
supabase db push
```

applies `0003_products_reels.sql` — adds `product_status`, the `products`
and `reels` tables with RLS, and the public `product-media` storage bucket.

## Week 4 — Discovery & Consumer Experience

- **Discover feed with infinite scroll** — `/discover`, public, no login.
  Server-renders the first page of published products (12 at a time) for
  fast first paint and SEO, then a client component
  (`src/app/discover/discover-feed.tsx`) loads more via
  `IntersectionObserver` as you scroll, hitting `GET /api/products` for
  each subsequent page.
- **Filters** — category (curated toy subcategories, not freeform text, so
  they're actually usable as facets), age group, and min/max price. Filters
  live in the URL (`/discover?category=...&age_group=...`), so results are
  shareable/bookmarkable and survive a refresh.
- **Search** — full-text search over product name + description using
  Postgres `tsvector`/`websearch_to_tsquery` (name weighted higher than
  description), not a plain `ILIKE` — handles natural phrases like "wooden
  puzzle" sensibly and scales with a GIN index as the catalog grows.
- **Manufacturer public profile page** — `/manufacturers/[id]`, public.
  Shows business name, location, established year, description, and a grid
  of their published products. Backed by a new
  `manufacturer_public_profiles` view rather than querying
  `manufacturer_profiles` directly — that table is RLS-locked to the owner
  and admins (it carries GST numbers and internal review notes), so the
  view exposes only the safe, public-facing fields, and only for
  manufacturers who are actually verified.

While wiring this up I also caught and fixed a bug from Week 3: the public
product detail page (`/products/[id]`) was querying `manufacturer_profiles`
directly for the "Made by ___" byline, which — being RLS-locked — would've
silently shown nothing to anyone who wasn't the manufacturer themselves.
It now uses the same public view.

### Migration

```bash
supabase db push
```

applies `0004_discovery.sql` — adds `age_group` and a generated
`search_vector` column (+ GIN index) to `products`, plus the
`manufacturer_public_profiles` view.

## Week 1 gap-fill (against the fuller 5-week spec)

A more detailed spec came in after Weeks 1–4 were already built. Most of its
substance already existed (auth, roles, RLS, manufacturer verification,
products, reels, discovery/search) — this pass filled in what Week 1
specifically was still missing:

- **Prettier + Husky + lint-staged** — `npm run format` / `format:check`;
  a pre-commit hook runs `eslint --fix` + `prettier --write` on staged
  files. Prettier is configured with `prettier-plugin-tailwindcss` for
  class sorting, and `eslint-config-prettier` disables any ESLint
  formatting rules that would fight with it.
- **Lucide icons** — was installed but unused; now wired into the sidebar
  nav, uploaders, product/verification actions, and the discover search
  field.
- **Sidebar dashboard layout** — replaced the flat top header with a
  proper role-aware sidebar (`src/components/dashboard-sidebar.tsx`),
  collapsible into a slide-over on mobile, plus a topbar with avatar +
  sign out.
- **Avatars** — `profiles.avatar_url` column, an `avatars` storage bucket,
  a `UserAvatar` component (initials fallback when there's no photo), and
  an upload flow at `/dashboard/account`.
- **Manufacturer → straight to onboarding** — signing up as a manufacturer
  and landing on `/dashboard` now redirects straight to
  `/dashboard/manufacturer/onboarding` if they haven't started their
  business profile yet, instead of an empty dashboard overview.
- **Phone (OTP) authentication** — email/phone tabs on both `/login` and
  `/signup`. Phone signup still goes through the same role selection as
  email signup. This needs an SMS provider (Twilio, MessageBird, etc.)
  configured under **Authentication → Providers → Phone** in your
  Supabase project — it won't send real codes without one.

### Migration

`supabase/migrations/0005_avatars.sql` adds `avatar_url` and the `avatars`
bucket.

### One-time local setup

```bash
npm install   # also runs `husky` via the prepare script
git init      # if you haven't already — husky needs a git repo to hook into
```

## Week 2/3/4 gap-fill (closes out the audit below)

`supabase/migrations/0006_gapfill_week2_3_4.sql` adds:
- `products.materials` (`text[]`)
- `product_variants` table (named axis + value, optional price override and
  stock, RLS scoped to the owning manufacturer for writes / product
  visibility for reads)
- `product_images` table for gallery images beyond the single cover image,
  same RLS shape
- `inquiries` table + `inquiry_status` enum for the buyer → manufacturer
  contact form (public insert on published products only, manufacturer/buyer
  read, manufacturer status updates)

New/changed UI:
- **Document upload wizard** (`components/document-upload-wizard.tsx`) —
  GST certificate → factory photos → quality certificates (optional) →
  review & submit, replacing the single-step dropdown form on
  `/dashboard/manufacturer/documents`. The old single-step uploader is still
  used underneath for the "Other documents" section.
- **Trust badge threaded through surfaces** — `components/verified-badge.tsx`
  now renders on product cards (discover grid + manufacturer profile grid),
  the product detail page, and the manufacturer profile page.
- **Materials & variants** — materials is a comma-separated field on the
  product form; variants get their own inline add/remove editor on the
  manufacturer's product edit page, and both render on the public product
  page.
- **Multi-image upload** — `components/product-image-uploader.tsx` adds a
  gallery grid (up to 8 images) alongside the existing single cover uploader;
  the public product page renders the gallery beneath the cover image.
- **Inquiry/contact form** — public form on the product page
  (`app/products/[id]/inquiry-form.tsx`), works for signed-in buyers and
  anonymous visitors alike. Manufacturers manage replies status
  (new/responded/closed) at `/dashboard/manufacturer/inquiries`, with a
  count of new inquiries surfaced on the manufacturer dashboard.
- **"Who Made This" section** — pulled out of the inline byline into its own
  labeled block on the product page, with the verified badge and
  established year.

### Audit vs. the fuller 5-week spec — what's left

**Week 2, 3, 4** — all closed out above.

**Week 5** (polish & launch) — not started:
- Manufacturer analytics placeholder
- Admin panel improvements beyond the verification queue
- Mobile responsiveness/performance pass, SEO meta + Open Graph tags
- Testing, Vercel deployment + custom domain, handover docs
