# GenZ — Trust Commerce & Manufacturing Platform

A modern B2B & B2C marketplace connecting verified Indian toy sellers directly with buyers and retail businesses. Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Atomic Design UI**, and **Supabase**.

---

## 🚀 Key Features

### 🔐 Authentication & Role-Based Access Control (RBAC)

- **Role System**: Strict authorization model supporting `buyer`, `seller`, and `admin` roles matching Postgres `app_role` enums and enforced via Supabase Row Level Security (RLS).
- **Signup Protection**: Public signups strictly restricted to `buyer` via `publicRoleSchema` to prevent admin privilege escalation vulnerabilities.
- **Multi-Method Auth**: Supports Email + Password, Magic Links, and Phone (OTP) authentication flows.
- **Password Recovery**: Complete `/forgot-password` and `/reset-password` workflow with secure email tokens.
- **Dedicated Portals**: Role-aware routing with dedicated portals for Buyers (`/profile`), Sellers (`/seller/dashboard`), and Admin Teams (`/admin/dashboard`).

### 🏭 Seller Onboarding & Application Approval Workflow

- **Two-Tier Onboarding Flow**:
  1. Prospective sellers submit registration details via `/seller/signup`, creating a record in `seller_applications` (status: `pending`).
  2. Admin reviews application in `/admin/dashboard/verifications`.
  3. Upon approval, admin provisions credentials; credentials are emailed to the seller via Resend API.
  4. Approved sellers log in to `/seller/dashboard` to list products.
- **Verification Gating**: Default status for new seller profiles is `pending`. Product publishing RLS policies require verified seller status (`seller_profiles.status = 'verified'`).
- **Multi-Step Document Wizard**: Guided document submission for GST certificate, factory photos, and quality certificates.
- **GSTIN Formatting & Validation**: Enforces standard 15-character Indian GSTIN regex validation (`gstSchema`).
- **Private Document Vault**: Uploads stored in private Supabase Storage bucket (`seller-documents`), accessible to admins via expiring signed URLs.
- **Postgres Field Protection Trigger**: Database trigger (`protect_seller_verification_fields`) blocks non-admin users from altering `status`, `rejection_reason`, or review timestamps directly.

### 🛡️ Admin Management & Verification Dashboard

- **Admin Portal**: Accessible at `/admin/dashboard` (with admin auth safeguards).
- **Application Review Queue**: Filter seller submissions by status (`pending`, `approved`, `rejected`).
- **Credential Provisioning**: Approve applications with auto-generated secure passwords or custom passwords.
- **Document Viewer**: Inspect factory credentials and quality certificates.
- **Approval / Rejection Workflow**: Approve sellers or reject with structured reasons.

### 📦 Product Catalog, Variants & Video Reels

- **Product Management**: Create, edit, and manage products with `draft`, `published`, or `archived` states.
- **Rich Media & Galleries**: Cover image uploader + multi-image gallery grid (up to 8 images per product) stored in public `product-media` bucket.
- **Product Variants & Materials**: Custom variants (size, color, style, stock, price overrides) and material tagging.
- **Video Reels**: Attach vertical video showcases with thumbnails to products for buyer previews.

### 🔍 Discovery, Faceted Search & Public Profiles

- **Faceted Discovery Feed**: `/discover` page featuring category filters, age-group facets, price sliders, and URL parameter sync.
- **Infinite Scrolling Feed**: Server-rendered initial listings for optimal SEO and fast initial paint, with client-side `IntersectionObserver` fetching subsequent pages from `GET /api/products`.
- **Postgres Full-Text Search**: Powered by GIN-indexed `tsvector` and `websearch_to_tsquery` over product titles and descriptions.
- **Seller Public Showcase**: `/sellers/[id]` public profile displaying verified badges, factory location, established year, and catalog via safe Postgres views (`seller_public_profiles`).

### 💬 Buyer-Seller Inquiries & Support

- **Product Inquiries**: Public inquiry form on product detail pages (`/products/[id]`) supporting logged-in buyers and guests.
- **Seller Workspace**: Dedicated inquiry inbox (`/seller/dashboard/inquiries`) to manage leads and update statuses (`new`, `responded`, `closed`).
- **Contact & Waitlist Systems**: Support form (`/contact`) and newsletter waitlist form (`/`) backed by dedicated database tables and rate limiters.

### 🔒 Security, Performance & Privacy

- **Database Rate Limiting**: Centralized rate limiting tracked in `rate_limit_logs` with exponential backoff on auth endpoints and production degradation alerts (`[RATE_LIMIT_DEGRADED]`).
- **PII Protection**: Logging of sensitive user PII (emails, auth internals) gated behind `NODE_ENV !== 'production'`.
- **Strict Typing**: All database operations and rate limiting interfaces fully typed with TypeScript types.
- **Cookie Consent**: GDPR/Privacy-compliant cookie consent banner and preference management.
- **Automated SEO**: Dynamic `sitemap.ts` and `robots.ts` generation.

---

## 🏗️ Architecture Standards

The codebase strictly follows a three-pillar modular architecture:

1. **Atomic Design UI (`src/components/ui/`)**:
   - **`atoms/`**: Pure design tokens & single-element primitives (`Button`, `Input`, `Badge`, `Label`, `Textarea`, `Card`, `StatusBadge`, `UserAvatar`, `VerifiedBadge`).
   - **`molecules/`**: Multi-atom composite controls (`ActionDropdown`, `LocationSelectGroup`, `PhoneInputWithCountryCode`, `SearchTriggerButton`, `CookieConsent`).
   - **`organisms/`**: Complex layout sections (`Header`, `Footer`, `PageHeader`, `MetricCard`, `CommandMenu`, `EmptyState`, `SkeletonLoaders`, `SlideOverDrawer`, `DashboardSidebar`, `PageViewTracker`).

2. **Feature Domain Modules (`src/features/`)**:
   - Business logic, server actions, hooks, and domain UI encapsulated within dedicated folders:
     - `admin/` — Verification reviews, workspace analytics, admin layout shell
     - `auth/` — Login/signup forms, RBAC guards (`require-role.ts`), session logic (`auth.ts`)
     - `seller/` — Seller verification actions and workflow
     - `products/` — Product forms, variant editor, cover/image uploaders
     - `documents/` — Document list & verification wizard
     - `reels/` — Video reel uploaders & management list
     - `marketing/` — Contact, newsletter, waitlist forms
     - `user/` — User profile & avatar uploader

3. **Logic-Only Spec Files (`*.spec.ts`)**:
   - Co-located **exclusively** with business logic, validators, services, and domain utilities (e.g. `src/features/products/lib/products.spec.ts`, `src/lib/validation.spec.ts`), keeping pure UI components clean.

---

## 🛠️ Tech Stack

| Domain                 | Tech / Library                                                                                                |
| :--------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Framework**          | Next.js 15 (App Router, Server Actions, Dynamic API Routes)                                                   |
| **UI Architecture**    | Atomic Design (`atoms/`, `molecules/`, `organisms/`), Feature Modules (`src/features/`)                       |
| **UI & Core**          | React 19, TypeScript 5, Lucide React icons                                                                    |
| **Styling**            | Tailwind CSS v4, PostCSS, Radix UI Primitives (`Dialog`, `Select`, `Label`, `Slot`), `clsx`, `tailwind-merge` |
| **Database & Backend** | Supabase SSR (`@supabase/ssr`), PostgreSQL (RLS, Triggers, Views, Functions, Storage Buckets)                 |
| **Validation & Data**  | Zod (`zod`), `country-state-city`                                                                             |
| **Testing**            | Vitest, React Testing Library, JSDOM (111 passing unit & integration tests)                                   |
| **Code Quality**       | ESLint 9, Prettier, Husky, lint-staged                                                                        |
| **Analytics**          | Vercel Analytics (`@vercel/analytics`)                                                                        |

---

## 🗄️ Database Migrations

All database schemas, RLS policies, triggers, and storage buckets are managed via Supabase SQL migrations located in `supabase/migrations/`:

1. **`0001_core_profiles.sql`**: Defines `app_role` enum (`buyer`, `seller`, `admin`), `profiles` table, auto-profile creation trigger, and base RLS policies.
2. **`0002_seller_onboarding.sql`**: Defines `verification_status` enum, `seller_profiles` table, GSTIN protection trigger, and private `seller-documents` storage bucket + RLS.
3. **`0003_products_reels.sql`**: Defines `product_status` enum, `products` table (RLS gated to verified sellers), `reels` table, and public `product-media` storage bucket.
4. **`0004_inquiries.sql`**: Defines `inquiry_status` enum and `inquiries` table connecting buyers with sellers.
5. **`0005_contact_messages.sql`**: Defines `contact_messages` table for general site support inquiries.
6. **`0006_newsletter.sql`**: Defines `newsletter_subscribers` table for waitlist/newsletter signups.
7. **`0007_rate_limit_logs.sql`**: Defines `rate_limit_logs` table for database-backed rate limiting.
8. **`0008_only_create_profile_after_verification.sql`**: Enforces verification state checks before profile initialization.
9. **`0010_seller_applications.sql`**: Defines `seller_applications` review queue for prospective seller onboarding.

---

## ⚡ Getting Started

### 1. Prerequisites

- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later
- **Supabase Account**: An active project on [supabase.com](https://supabase.com) (or local Supabase CLI setup).

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and fill in your Supabase & Resend credentials:

```bash
cp .env.local.example .env.local
```

In `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL="GenZ Online <onboarding@genzonline.in>"
```

### 4. Database Migrations & Supabase Setup

Apply all migrations from `supabase/migrations/` to your Supabase project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 5. Create an Admin Account

To promote a user to `admin`, execute the following in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<USER_UUID>';
```

### 6. Run the Development Server & Tests

```bash
# Run dev server
npm run dev

# Run Vitest test suite
npm run test
```

---

## 📜 Available Scripts

| Script                 | Action                                                    |
| :--------------------- | :-------------------------------------------------------- |
| `npm run dev`          | Starts the Next.js development server on `localhost:3000` |
| `npm run build`        | Compiles the production build                             |
| `npm run start`        | Runs the compiled production server                       |
| `npm run test`         | Runs the Vitest test suite (`111 passed`)                 |
| `npm run lint`         | Runs ESLint checks across the codebase                    |
| `npm run format`       | Formats code with Prettier and updates files              |
| `npm run format:check` | Verifies code formatting status without modifying files   |

---

## 📄 License

Private & Proprietary. All rights reserved.
