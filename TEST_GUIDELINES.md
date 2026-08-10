# GenZ Platform Architecture & Test Guidelines

## 1. Codebase & Test Architecture

The codebase and test architecture are organized into **Atomic UI**, **Feature-Based Domains**, and **Spec Files**:

```
src/
├── components/
│   └── ui/                            # Pure UI Component Design Tokens & Primitives
│       ├── atoms/                     # Button, Input, Badge, Label, Textarea, Card, StatusBadge, UserAvatar, VerifiedBadge
│       ├── molecules/                 # ActionDropdown, LocationSelectGroup, PhoneInput, SearchTriggerButton, CookieConsent
│       └── organisms/                 # Header, Footer, PageHeader, MetricCard, CommandMenu, EmptyState, SkeletonLoaders, SlideOverDrawer, DashboardSidebar, PageViewTracker
│
├── features/                          # Domain Business Logic & Feature Modules
│   ├── admin/                         # Admin Dashboard, Layout Shell, Vercel Analytics (vercel-analytics.spec.ts)
│   ├── auth/                          # Authentication, Login/Signup, Role Auth (require-role.spec.ts)
│   ├── seller/                        # Seller Verification & Actions (seller-actions.spec.ts)
│   ├── products/                      # Product Catalog, Cover/Image Uploaders, Variant Editor (products.spec.ts)
│   ├── documents/                     # Document List, Upload Wizard, Verification Logic (verification.spec.ts)
│   ├── reels/                         # Reel Uploader & Video Management List
│   ├── marketing/                     # Contact Form, Newsletter Form, Waitlist Form
│   └── user/                          # User Profile & Avatar Uploader
│
├── lib/                               # Core Infrastructure & Cross-Cutting Utilities
│   ├── validation.ts & validation.spec.ts
│   ├── file-validation.ts & file-validation.spec.ts
│   └── rate-limiter.ts & rate-limiter.spec.ts
│
└── __tests__/                         # Integration & Structural Test Suites
    ├── atomic/                        # Atomic Component UI rendering tests (atoms, molecules, organisms)
    ├── features/                      # Feature & Domain integration tests (admin, auth, products, orders)
    └── utils/                         # System utility & rate limiting tests
```

---

## 2. Logic-Only Spec File Strategy (`*.spec.ts`)

- **Exclusively for Code & Business Domain Logic**: `*.spec.ts` files are co-located directly with core domain services, validation rules, authorization guards, and shared infrastructure utilities (e.g. `src/features/products/lib/products.spec.ts`, `src/lib/validation.spec.ts`).
- **Pure UI Component Rule**: Pure UI components (`src/components/ui/`) remain clean, lightweight, and unburdened by component-level spec files. Rendering behavior for UI primitives is tested via `src/__tests__/atomic/`.

---

## 3. Pre-Commit Targeted Testing & Execution

Pre-commit hooks (**Husky** + **lint-staged**) execute **ONLY** on modified/staged files:

- `git commit` runs `vitest related --run --passWithNoTests` exclusively on staged files.
- Full test suite run: `npx vitest run` or `npm test`
- Targeted changed test run: `npm run test:changed`
- Interactive TDD watch mode: `npm run test:watch`
- Full TypeScript build validation: `npx tsc --noEmit`

---

## 4. Architectural Rules for Engineers

1. **Atomic UI Hierarchy**: Place reusable, domain-agnostic components into their respective atomic level inside `src/components/ui/` (`atoms/`, `molecules/`, or `organisms/`). Do not create loose files directly under `src/components/` or `src/components/ui/`.
2. **Feature Encapsulation**: Domain-specific UI forms, cards, drawers, hooks, and actions must live in their dedicated feature folder (`src/features/<feature-name>/`).
3. **Logic Co-location**: When adding business algorithms or domain utilities, co-locate a corresponding `*.spec.ts` file in the same directory.
4. **Import Path Standard**: Import components and libraries directly from their new atomic or feature path (e.g., `@/components/ui/atoms/button`, `@/features/auth/lib/require-role`).
5. **Type Safety & Build Verification**: Always verify clean compilation with `npx tsc --noEmit` and run `npx vitest run` before committing changes.

---

## 5. Server Action Rate Limiting Standard (`withRateLimit`)

All Server Actions must wrap their execution logic using the `withRateLimit` higher-order function exported from `@/lib/rate-limiter` to standardize rate limiting pre-checks, error responses, and audit attempt logging.

### Implementation Pattern

```ts
import { withRateLimit } from "@/lib/rate-limiter";

export async function myServerAction(input: string) {
  const session = await requireRole("seller");

  return withRateLimit(
    {
      endpointType: "user", // "auth" | "public" | "user"
      actionName: "my_action_name",
      identifier: session.userId,
    },
    async () => {
      // 1. Validation & Business logic
      // 2. Return { error: "..." } on validation or DB errors (automatically logged as failure)
      // 3. Return { success: true } or data payload on success (automatically logged as success)
    }
  );
}
```

### Key Architectural Guidelines

1. **Automatic Audit Logging**: `withRateLimit` inspects returned `{ error: ... }` objects or thrown errors to record failure vs success in `rate_limit_logs` automatically without boilerplate.
2. **Next.js Redirect Safety**: `withRateLimit` distinguishes Next.js `redirect()` control flow exceptions from application errors, logging successful attempts before rethrowing the redirect.
3. **Unit Testing Server Actions**: In unit tests for server actions, mock `withRateLimit` with a pass-through: `withRateLimit: vi.fn().mockImplementation(async (_options, fn) => fn())`.

---

## 6. Postgres Row Level Security (RLS) & Trigger Testing

Postgres defense-in-depth triggers safeguard sensitive administrative columns (`profiles.role`, `profiles.account_status`, `seller_profiles.status`, `seller_profiles.rejection_reason`).

### Automated Test Execution

- Vitest RLS Integration Test Suite: `npx vitest run src/__tests__/integration/rls-policies.test.ts`
- Supabase pgTAP SQL Suite: `supabase db test` (uses `supabase/tests/rls_policies.sql`)

### Manual SQL Verification Query

To test `protect_profile_role_trigger` manually in Supabase SQL Editor as a non-admin user:

```sql
-- 1. As a non-admin user (e.g. role = 'buyer')
UPDATE public.profiles
SET
  role = 'admin',               -- Attempted privilege escalation (will be reverted to 'buyer')
  account_status = 'suspended',  -- Attempted status change (will be reverted to 'active')
  full_name = 'Updated Name',   -- Permitted field (will update)
  phone = '9876543210',          -- Permitted field (will update)
  city = 'Bangalore'            -- Permitted field (will update)
WHERE id = auth.uid();

-- 2. Verify result
SELECT role, account_status, full_name, phone, city
FROM public.profiles
WHERE id = auth.uid();
-- Expected result:
-- role = 'buyer' (reverted)
-- account_status = 'active' (reverted)
-- full_name = 'Updated Name' (updated)
-- phone = '9876543210' (updated)
-- city = 'Bangalore' (updated)
```
