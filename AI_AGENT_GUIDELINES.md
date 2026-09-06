# GenZ Platform — Architecture, Feature Inventory & AI Agent Coding Rules

> **Target Audience**: AI Agents (Antigravity, Claude Code, Cursor, Copilot) & Human Engineers.  
> **Repository Type**: Turborepo Monorepo (`apps/*`, `packages/*`).  
> **Tech Stack**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Supabase (SSR & RLS), Vitest.

---

## 1. Executive Summary & Monorepo Architecture

GenZ is a B2C trust-commerce and manufacturing marketplace connecting verified Indian toy and handicraft manufacturers, artisan clusters, and innovative startups directly with retail buyers and corporate procurement teams.

### Monorepo Structure

```
genz-app/
├── apps/
│   ├── web/                     # Port 3000: Buyer-facing marketplace & discovery feed
│   │   ├── app/(main)/          # Catalog, /products/[id], /cart, /checkout, /orders, /sellers/[id]
│   │   ├── app/seller/signup/   # Public seller application form (registers to seller_applications)
│   │   └── features/            # Feature modules (home, products, seller, auth, marketing)
│   │
│   ├── seller/                  # Port 3001: Verified manufacturer & artisan portal
│   │   ├── app/dashboard/       # Desk overview, metrics, quick actions
│   │   ├── app/dashboard/products/  # Catalog management & publishing studio (/products/new)
│   │   ├── app/dashboard/profile/   # Instagram-style Maker Profile Studio
│   │   ├── app/dashboard/account/   # Factory & Business Profile Details + Active Session
│   │   ├── app/dashboard/orders/    # Order fulfillment & dispatch tracker
│   │   └── app/login/           # Seller authentication (Magic Link / Credentials)
│   │
│   └── admin/                   # Port 3002: Internal platform administration
│       ├── app/dashboard/verifications/ # Seller application review queue & credential provisioning
│       ├── app/dashboard/products/      # Platform-wide catalog review & creation
│       ├── app/dashboard/orders/        # Platform master orders & shipping overview
│       ├── app/dashboard/users/         # User roles & account status oversight
│       └── app/login/           # Admin authentication
│
├── packages/
│   ├── database/                # Supabase SSR clients (client, server, admin), orders repository, auth
│   │   └── src/storage/         # Resilient JSON fallback store for real-time monorepo sync (orders-store.json)
│   ├── ui/                      # Shared Atomic Design system (@genz/ui)
│   │   ├── atoms/               # Button, Input, Badge, Label, Textarea, Card, StatusBadge, UserAvatar
│   │   ├── molecules/           # ActionDropdown, LocationSelectGroup, PhoneInput, CookieConsent
│   │   ├── organisms/           # Header, Footer, PageHeader, MetricCard, CommandMenu, SlideOverDrawer
│   │   ├── orders/              # Shared OrdersManager & tracking UI
│   │   └── product-form/        # Shared MediaCard, VariantsCard
│   ├── types/                   # Shared TypeScript models (database, orders, products, sellers, users)
│   ├── utils/                   # Rate limiting (withRateLimit), Resend API, site config
│   ├── validation/              # Zod schemas (GSTIN regex, seller signup, auth, product forms)
│   └── config/                  # Shared base tsconfig and configurations
│
└── supabase/
    └── migrations/              # Database SQL migrations (0001 to 0020)
```

---

## 2. Complete Inventory of What Is Done Till Now

### 🔐 1. Authentication & Role-Based Access Control (RBAC)

- **Role Tiering**: Strict three-role system (`buyer`, `seller`, `admin`) enforced in PostgreSQL enums, Supabase RLS, and TypeScript types.
- **Server Guard (`requireRole`)**: Co-located in `features/auth/lib/require-role.ts`. Inspects authenticated session, queries `profiles.role`, verifies `account_status === 'active'`, and throws/redirects unauthorized access.
- **Privilege Escalation Defense Trigger**: Database trigger `protect_profile_role_trigger` silently reverts unauthorized attempts to escalate `role` or tamper with `account_status`.
- **Dedicated Portals**: Port-isolated or route-isolated entry points for Buyers, Sellers, and Admin teams with dedicated middleware route protection.

### 🏭 2. Seller Application, Verification & Credential Provisioning

- **Two-Tier Onboarding Flow**:
  1. Prospective sellers submit applications at `/seller/signup` (`apps/web`). Data is validated against `sellerSignupSchema` (enforcing Indian GSTIN or Trade ID format) and inserted into `seller_applications` table with status `pending`.
  2. Admin reviews application queue in `/dashboard/verifications` (`apps/admin`).
  3. On approval, admin triggers `approveSeller`. The server action creates/updates auth credentials in Supabase Auth, upserts records in `profiles` and `seller_profiles`, sets status to `verified`, and automatically dispatches login credentials to the seller via Resend transactional email.
- **Automatic Signup Data Pre-Population**:
  - In both `/dashboard/account` and `/dashboard/profile` (`apps/seller`), the application queries `seller_applications` by the seller's email as an intelligent fallback to ensure:
    - **Business Name**: Pre-filled from signup.
    - **GSTIN Identification**: Pre-filled from signup.
    - **Factory Address & Location**: Pre-filled (`address`, `city`, `state`, `pincode`).
    - **Established Year & Capacity Bio**: Pre-filled from application form data.
  - Automatically backfills and synchronizes these details to `seller_profiles` so the seller never encounters empty `"Not specified"` or `"Pending"` states.

### 📦 3. Product Catalog & Publishing Studio

- **Atomic Product Form**: Unified publishing studio (`apps/seller/app/dashboard/products/new` and `apps/admin/app/dashboard/products/new`).
- **Media Gallery**: Unified 8-image drag-and-drop uploader with live thumbnail preview, primary cover badge, re-ordering, and Supabase `product-media` storage integration.
- **Variants Engine**: Dynamic attribute configuration (Size, Color, Material, Price override, SKU suffix, and inventory limits).
- **Compliance & Merchandising**: HSN/SAC code inputs, GST tax slab selector, age group tags, materials selection, and catalog status controls (`draft`, `published`, `archived`).
- **Shared UI**: `MediaCard` and `VariantsCard` are exported directly from `@genz/ui` (`packages/ui/src/components/product-form`), eliminating duplicate local implementations.

### 🛒 4. Orders, Fulfillment & Real-Time Tracking

- **Complete Lifecycle**: Status transitions from `placed` ➔ `processing` ➔ `shipped` ➔ `delivered` (or `cancelled`).
- **Multi-Seller Splitting**: An order containing items from multiple distinct artisans correctly tags and partitions `sellerIds`.
- **Automated Tracking Timeline**: Each status update records a structured `OrderTrackingEvent` (`timestamp`, `status`, `title`, `description`, `carrier`, `trackingNumber`).
- **Resilient Dual Storage**:
  - Integrates with Supabase `orders` table.
  - Features local JSON fallback (`packages/database/src/storage/orders-store.json`) ensuring uninterrupted local development, zero downtime, and real-time state synchronization across all apps in the monorepo.
- **Dedicated Order Dashboards**:
  - `apps/web/app/(main)/orders`: Buyer order history and interactive visual tracking modal.
  - `apps/seller/app/dashboard/orders`: Maker fulfillment desk with 1-click status updates, courier carrier selection, and AWB tracking input.
  - `apps/admin/app/dashboard/orders`: Master platform order ledger with revenue metrics and filtering.

### 🔍 5. Buyer Discovery & Artisan Showcase

- **Faceted Discovery Feed (`/discover`)**: Category filters, age-range facets, price sliders, and URL state synchronisation.
- **Maker Instagram-Style Studio (`/dashboard/profile`)**: Live preview of artisan workshop story, GI craft custody, materials, master artisan background, and contact links.
- **Product Details & Cart**: Rich carousel, artisan badge, direct Cash on Delivery or Online order placement, and seamless checkout.

### 🗄️ 6. Database Migrations Summary

- `0001_core_profiles.sql`: App roles (`buyer`, `seller`, `admin`), `profiles` table, auto-profile trigger.
- `0002_seller_onboarding.sql`: `seller_profiles` table, verification status enum, private `seller-documents` storage bucket.
- `0003_products_reels.sql`: `products` table (gated to verified sellers), `reels` table, public `product-media` bucket.
- `0004_orders_and_tracking.sql`: Orders table, shipping addresses, line items, and tracking events.
- `0005_contact_messages.sql`: General contact & support inquiry tracking.
- `0006_newsletter.sql`: Newsletter & waitlist subscribers.
- `0007_rate_limit_logs.sql`: Database-backed rate limiting & audit logs.
- `0010_seller_applications.sql`: Seller review queue table and RLS policies.
- `0011_create_page_views.sql`: Platform traffic and pageview telemetry.
- `0017_sync_seller_profiles_role.sql`: Bidirectional role synchronization between profiles and auth.
- `0019_harden_rls_policies.sql`: Strict column-level protection on roles and verification status.

---

## 3. Rules to Follow for AI Agents Coding in This Project

When writing, editing, or refactoring code in this repository, AI agents **MUST** strictly adhere to the following architectural rules:

### Rule 1: Respect Turborepo Package Boundaries

- **Shared UI Primitives**: ALWAYS place domain-agnostic UI tokens, atoms, and composites in `packages/ui`. NEVER duplicate button, input, modal, drawer, or badge primitives inside individual app directories.
- **No Proxy Re-export Files**: Do not create 1-line wrapper files inside apps that merely do `export * from "@genz/ui"`. Import directly from `@genz/ui`.
- **Shared Types**: Put shared database models, order entities, product structures, and API types into `packages/types`.
- **Validation Schemas**: Put all Zod validation schemas into `packages/validation`.

### Rule 2: Next.js 15 & React 19 Architectural Rules

- **Server Components by Default**: All page and layout components are React Server Components unless client-side state, DOM event listeners, or browser APIs are required.
- **`"use client"` Boundary Minimization**: Push `"use client"` down to leaf interactive components (e.g., forms, toggles, dropdowns) to maximize server rendering and SEO.
- **Async Dynamic Route Params**: In Next.js 15, route parameters are Promises. Always await them:
  ```ts
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // ...
  }
  ```
- **React 19 Form Handling**: Use `useActionState` (NOT the deprecated `useFormState`) and React 19 transition patterns for form submissions.
- **Server Guard (`server-only`)**: Any backend utility using secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) must import `server-only` to guarantee it cannot be bundled into client builds.

### Rule 3: Server Action Standards & Rate Limiting

- **Every Server Action Must Use `withRateLimit`**:
  ```ts
  import { withRateLimit } from "@/lib/rate-limiter";
  import { requireRole } from "@/features/auth/lib/require-role";

  export async function myAction(input: MyInput) {
    const session = await requireRole("seller");

    return withRateLimit(
      {
        endpointType: "user", // "auth" | "public" | "user"
        actionName: "my_action_name",
        identifier: session.userId,
      },
      async () => {
        // Business logic here
        return { success: true };
      }
    );
  }
  ```
- **Consistent Response State**: Server actions must return structured objects `{ error?: string; success?: boolean; [key: string]: any }`.
- **Next.js Redirect Safety**: Do not catch and swallow `NEXT_REDIRECT` errors inside try/catch blocks; let `withRateLimit` handle them.

### Rule 4: Data Layer, Supabase SSR & Fallback Storage

- **SSR Client for User Requests**: Use `createClient()` from `@genz/database` in server components and actions to execute queries under the authenticated user's session and RLS policies.
- **Admin Client Only for Privileged Workflows**: Use `createAdminClient()` from `@genz/database/admin` ONLY in privileged workflows (e.g., admin credential provisioning, background sync, verification overrides).
- **Fallback Store Consistency**: When updating the `orders` domain, always use functions from `packages/database/src/orders.ts` to ensure data persists to both Supabase and the resilient local JSON store (`packages/database/src/storage/orders-store.json`).
- **Null Safety on Seller Data**: Always perform fallback resolution from `seller_applications` whenever querying `seller_profiles` to guarantee that fresh signups display their submitted details immediately.

### Rule 5: Styling, Design Tokens & Aesthetics

- **Tailwind CSS v4**: The project uses modern Tailwind CSS v4. Use existing design tokens and color palettes (`#FAF8F4` warm background, `#1A1A18` deep charcoal/black, `#E5E5E0` borders, `#C89D32` warm gold accents, `#52524E` neutral body text).
- **No Generic Color Chaos**: Avoid unstyled browser defaults or arbitrary random color hexes. Maintain warm artisan craftsmanship aesthetics.
- **Mobile First & Responsive**: Every view must look polished on mobile (360px+), tablet, and desktop viewports.

### Rule 6: Code Integrity & Zero Breaking Changes

- **Preserve Existing Comments**: Do not strip or alter explanatory comments in code you touch.
- **Run Tests Before Committing**: Always verify that `pnpm test` (or `npx vitest run`) passes and `npx tsc --noEmit` compiles cleanly before finalizing changes.

---

## 4. Testing Architecture & Execution Guide

### Test Architecture

- **Co-located Logic Spec Files (`*.spec.ts`)**: Co-located directly alongside domain logic, validators, rate limiters, and service utilities (e.g., `packages/database/src/orders.spec.ts`, `apps/admin/lib/validation.spec.ts`).
- **Pure UI Remains Clean**: Primitives in `@genz/ui` remain clean and lightweight; UI testing is isolated in integration suites.
- **Vitest Test Runner**: Configured with `vitest.setup.ts` mocking `server-only` to allow server utilities to execute in fast JSDOM environments.

### Running Tests

| Command                | Purpose                                                                  |
| :--------------------- | :----------------------------------------------------------------------- |
| `pnpm test`            | Run full test suite across monorepo (`28 test files, 114 tests passing`) |
| `npm run test:changed` | Run tests only on files modified in git                                  |
| `npm run test:watch`   | Interactive TDD watch mode during development                            |
| `npx tsc --noEmit`     | Validate strict TypeScript compilation across all apps and packages      |

### Test Suite Status (114 Passed)

- `packages/database/src/orders.spec.ts`: Order generation with `GZ-ORD-` prefix, multi-seller item splitting, tracking status transitions (`placed`, `processing`, `shipped`, `delivered`), automatic COD-to-paid transitions, and query filtering.
- `apps/admin/lib/validation.spec.ts`: Email, password, Indian GSTIN (15-char regex) and Trade ID format validation.
- `apps/seller/lib/file-validation.spec.ts`: MIME-type, file extension, and upload size validation.
- `apps/admin/lib/resend.spec.ts`: Transactional email dispatch, API key validation, and network error handling.
- `apps/admin/lib/rate-limiter.spec.ts`: Rate limiting thresholds, identifier scoping, and audit logs.
- `apps/*/features/auth/lib/require-role.spec.ts`: Role-based access control guards and redirection.
- `apps/*/features/products/lib/products.spec.ts`: INR currency formatting, category definitions, and pricing math.
- `apps/*/features/documents/lib/verification.spec.ts`: Document upload verification state checks.

---

## 5. Quick Reference: Common Development Workflows

### 1. Launching Local Development Servers

```bash
# Start all apps simultaneously via Turborepo
pnpm dev

# Or start individual applications:
pnpm --filter=@genz/web dev     # http://localhost:3000
pnpm --filter=@genz/seller dev  # http://localhost:3001
pnpm --filter=@genz/admin dev   # http://localhost:3002
```

### 2. Creating a New Shared UI Component

1. Create primitive in `packages/ui/src/components/<component-name>.tsx`.
2. Re-export in `packages/ui/src/index.ts`.
3. Import directly via `import { MyComponent } from "@genz/ui";` in any app.

### 3. Adding a New Database Migration

1. Create a numbered SQL file in `supabase/migrations/` (e.g., `0021_my_feature.sql`).
2. Always enable RLS on newly created tables: `ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;`.
3. Add defensive policies for user access and administrative overrides.
4. Update `packages/types/src/database.ts` with corresponding TypeScript types.
