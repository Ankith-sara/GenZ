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
