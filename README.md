# GenZ — Trust Commerce & Manufacturing Platform

A modern B2B & B2C marketplace connecting verified Indian toy sellers directly with buyers and retail businesses. Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Atomic Design UI**, and **Supabase**.

---

## 🚀 Key Features

### 🔐 Authentication & Role-Based Access Control (RBAC)

- **Role System**: Built-in support for `buyer`, `seller`, and `admin` roles stored in Postgres enums and enforced via Supabase Row Level Security (RLS).
- **Multi-Method Auth**: Supports both Email + Password and Phone (OTP) authentication flows.
- **Password Recovery**: Complete `/forgot-password` and `/reset-password` workflow with secure email tokens.
- **Dedicated Portals**: Role-aware routing with dedicated portals for Buyers, Sellers (`/dashboard/seller`), and Admin Teams (`/admin/dashboard`).

### 🏭 Seller Onboarding & Verification Workflow

- **Multi-Step Document Wizard**: Guided document submission for GST certificate, factory photos, and quality certificates.
- **GSTIN Validation**: Enforces standard 15-character GSTIN formatting and verification checks.
- **Private Document Vault**: Uploads are stored in a private Supabase Storage bucket (`seller-documents`), accessible to admins via expiring signed URLs.
- **Postgres Field Protection Trigger**: Database trigger (`protect_seller_verification_fields`) blocks non-admin users from altering `status`, `rejection_reason`, or review timestamps directly.

### 🛡️ Admin Management & Verification Dashboard

- **Admin Portal**: Accessible at `/admin/dashboard` (with independent admin auth at `/admin/login`).
- **Application Review Queue**: Filter seller submissions by verification status (`not_submitted`, `pending`, `verified`, `rejected`).
- **Document Viewer**: Inspect secure factory credentials and certificates.
- **Approval / Rejection Workflow**: Approve sellers to unlock listing capabilities or request changes with detailed rejection reasons.

### 📦 Product Catalog, Variants & Video Reels

- **Product Management**: Create, edit, and manage products with `draft`, `published`, or `archived` states.
- **Verification Gated Publishing**: Postgres RLS policies restrict product creation to verified sellers (`seller_profiles.status = 'verified'`).
- **Rich Media & Galleries**: Cover image uploader + multi-image gallery grid (up to 8 images per product) stored in the public `product-media` bucket.
- **Product Variants & Materials**: Custom variants (size, color, style, stock, price overrides) and material tagging.
- **Video Reels**: Attach vertical video showcases with thumbnails to products for immersive buyer previews.

### 🔍 Discovery, Faceted Search & Public Profiles

- **Faceted Discovery Feed**: `/discover` page featuring category filters, age-group facets, price sliders, and URL parameter sync for easy bookmarking and sharing.
- **Infinite Scrolling Feed**: Server-renders initial listings for optimal SEO and fast initial paint, with client-side `IntersectionObserver` fetching subsequent pages from `GET /api/products`.
- **Postgres Full-Text Search**: Powered by GIN-indexed `tsvector` and `websearch_to_tsquery` over product titles and descriptions.
- **Seller Public Showcase**: `/sellers/[id]` public profile displaying verified badges, factory location, established year, and published catalog via safe Postgres views (`seller_public_profiles`).

### 💬 Buyer-Seller Inquiries & Support

- **Product Inquiries**: Public inquiry form on product detail pages (`/products/[id]`) supporting both logged-in buyers and guest visitors.
- **Seller Workspace**: Dedicated inquiry inbox (`/dashboard/seller/inquiries`) to manage leads and update inquiry statuses (`new`, `responded`, `closed`).
- **Contact & Waitlist Systems**: Public support message form (`/contact`) and newsletter waitlist form (`/`) backed by dedicated database tables and rate limiters.

### 🔒 Security, Performance & Rate Limiting

- **Postgres Rate Limiting**: Centralized API and form submission rate limiting tracked in `rate_limit_logs`.
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
   - Co-located **exclusively** with business logic, validators, services, and domain utilities (e.g. `src/features/products/lib/products.spec.ts`, `src/lib/validation.spec.ts`), keeping pure UI components completely clean.

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
| **Testing**            | Vitest, React Testing Library, JSDOM                                                                          |
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
8. **`0008_only_create_profile_after_verification.sql`**: Updates auth flow triggers to enforce verification before profile initialization.

---

## 📁 Project Structure

```
genz-app/
├── src/
│   ├── app/                             # Next.js App Router routes
│   │   ├── (main)/                      # Public routes (Header + Footer layout)
│   │   │   ├── page.tsx                 # Home page (Hero, featured products, waitlist)
│   │   │   ├── discover/                # Discovery feed with infinite scroll & search
│   │   │   ├── products/[id]/           # Product detail page, video reels & inquiry form
│   │   │   ├── sellers/[id]/            # Public seller profile & catalog
│   │   │   ├── about/, contact/, faqs/  # Informational & support pages
│   │   │   └── privacy/, terms/         # Legal pages
│   │   ├── admin/                       # Admin portal routes
│   │   │   ├── login/, signup/          # Admin authentication
│   │   │   └── dashboard/               # Verification queue & seller reviews
│   │   ├── dashboard/                   # Seller dashboard routes
│   │   │   ├── seller/                  # Products, reels, inquiries workspace
│   │   │   ├── pending-verification/    # Awaiting review status page
│   │   │   └── account/                 # User profile & settings
│   │   ├── api/                         # API endpoints (e.g. GET /api/products)
│   │   ├── auth/                        # Confirmation & magic link handlers
│   │   ├── login/, signup/              # Buyer & seller auth routes
│   │   ├── forgot-password/, reset-password/ # Password recovery routes
│   │   ├── layout.tsx, globals.css      # Root layout & design tokens
│   │   ├── sitemap.ts, robots.ts        # Dynamic SEO files
│   │   └── not-found.tsx                # Custom 404 page
│   ├── components/
│   │   └── ui/                          # Atomic UI Components
│   │       ├── atoms/                   # Button, Input, Badge, Label, Textarea, Card, StatusBadge, UserAvatar, VerifiedBadge
│   │       ├── molecules/               # ActionDropdown, LocationSelectGroup, PhoneInput, SearchTriggerButton, CookieConsent
│   │       └── organisms/               # Header, Footer, PageHeader, MetricCard, CommandMenu, EmptyState, SkeletonLoaders, SlideOverDrawer, DashboardSidebar, PageViewTracker
│   ├── features/                        # Feature Domain Modules
│   │   ├── admin/                       # Admin sidebar, layout shell, analytics
│   │   ├── auth/                        # Login/signup forms, RBAC guards, auth.ts
│   │   ├── seller/                      # Seller actions & logic
│   │   ├── products/                    # Product forms, variant editor, uploaders
│   │   ├── documents/                   # Verification wizard & document list
│   │   ├── reels/                       # Reel uploaders & management list
│   │   ├── marketing/                   # Contact, newsletter, waitlist forms
│   │   └── user/                        # User settings & avatar uploader
│   ├── lib/                             # Core Infrastructure & Cross-Cutting Utilities
│   │   ├── supabase/                    # Supabase SSR client, server, & middleware
│   │   ├── rate-limiter.ts              # Database rate limiting utility
│   │   └── validation.ts, file-validation.ts # Form & upload validators
│   ├── types/
│   │   └── database.ts                  # Generated Supabase TypeScript definitions
│   └── __tests__/                       # Vitest integration & component test suite
│       ├── atomic/                      # Atomic component rendering tests
│       ├── features/                    # Feature & domain integration tests
│       └── utils/                       # Utility & rate limit tests
├── supabase/
│   └── migrations/                      # Postgres migration files (0001 to 0008)
├── TEST_GUIDELINES.md                   # Test architecture & developer rules
└── package.json
```

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

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

In `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Database Migrations & Supabase Setup

Apply all migrations from `supabase/migrations/` to your Supabase project using the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

_(Alternatively, run the SQL files in numerical order directly within the Supabase SQL Editor)._

#### Supabase Auth Configuration

Under **Authentication → URL Configuration** in your Supabase dashboard:

- Add `http://localhost:3000/auth/confirm` to the **Redirect URLs** list.
- If using Phone (OTP) authentication, configure an SMS provider (Twilio, MessageBird, etc.) under **Authentication → Providers → Phone**.

### 5. Create an Admin Account

Public registration creates `buyer` or `seller` accounts. To promote a user to `admin`, execute the following in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<USER_UUID>';
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Script                 | Action                                                    |
| :--------------------- | :-------------------------------------------------------- |
| `npm run dev`          | Starts the Next.js development server on `localhost:3000` |
| `npm run build`        | Compiles the production build                             |
| `npm run start`        | Runs the compiled production server                       |
| `npm run test`         | Runs the Vitest test suite (`src/__tests__`)              |
| `npm run lint`         | Runs ESLint checks across the codebase                    |
| `npm run format`       | Formats code with Prettier and updates files              |
| `npm run format:check` | Verifies code formatting status without modifying files   |

---

## 📄 License

Private & Proprietary. All rights reserved.
