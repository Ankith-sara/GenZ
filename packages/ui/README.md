# @genz/ui — Shared Design System & UI Component Architecture

> **Package**: `@genz/ui`  
> **Framework**: React 19, Next.js 15 (Server Components by default, `"use client"` on leaf interactive elements)  
> **Styling**: Tailwind CSS v4, Lucide React, Radix UI Primitives  

---

## 1. Architectural Philosophy & Structure

`@genz/ui` provides a clean, 3-tier Atomic Design hierarchy designed for rapid navigation, strong encapsulation, and zero circular dependencies.

```
packages/ui/src/
├── primitives/               # Tier 1: Domain-agnostic UI building blocks (Atoms)
│   ├── button.tsx            # Button with variants (default, outline, ghost, pill, link)
│   ├── input.tsx             # Text inputs with Tailwind tokens
│   ├── label.tsx             # Radix label primitive
│   ├── textarea.tsx          # Textarea primitive
│   ├── card.tsx              # Card, CardHeader, CardContent, CardFooter
│   ├── badge.tsx             # Visual category & count tags
│   ├── status-badge.tsx      # Lifecycle status pills (Pending, Shipped, Delivered)
│   ├── verified-badge.tsx    # Gold verified maker / GI certificate seals
│   ├── user-avatar.tsx       # User avatars with fallback initials
│   ├── select.tsx            # Styled Radix select dropdown
│   ├── empty-state.tsx       # Blank canvas placeholder & illustration
│   ├── skeleton-loaders.tsx  # Shimmer loaders for tables, cards & lists
│   └── index.ts              # Re-exports all primitives
│
├── composites/               # Tier 2: Layout containers & composite widgets (Molecules & Organisms)
│   ├── page-header.tsx           # Page titles, subtitles, breadcrumb bars
│   ├── dashboard-page-header.tsx # Standard sticky workspace desk header
│   ├── dashboard-panel.tsx       # Elevated dashboard sections with actions
│   ├── dashboard-stat.tsx        # KPI metrics with delta percentages
│   ├── metric-card.tsx           # High-density summary cards
│   ├── action-dropdown.tsx       # Contextual action menus & popovers
│   ├── command-menu.tsx          # Quick search palette (Cmd+K)
│   ├── slide-over-drawer.tsx     # Slide-over sheets & side panels
│   ├── search-trigger-button.tsx # Global search trigger pill
│   ├── location-select.tsx       # Cascading Country -> State -> City selector
│   ├── phone-input.tsx           # International telephone input with country flags
│   ├── cookie-consent.tsx        # GDPR/India compliance cookie banner
│   ├── vercel-analytics-chart.tsx# Web analytics telemetry chart
│   └── index.ts                  # Re-exports all composites
│
├── features/                 # Tier 3: High-level domain-aware feature desks
│   ├── products/             # Product publishing studio & catalog desks
│   │   ├── product-editor-form.tsx      # Atomic 8-section product publishing form
│   │   ├── products-catalog-manager.tsx # Master seller & admin catalog desk
│   │   ├── media-card.tsx               # Section 1 Media dropzone & cover selector
│   │   ├── variants-card.tsx            # Section 4 Dynamic variant matrix builder
│   │   ├── product-info-cards.tsx       # Sections 2, 3, 5, 6, 7 form cards
│   │   ├── products-catalog.spec.ts     # Co-located unit tests
│   │   └── index.ts                     # Barrel export for products
│   │
│   ├── orders/               # Fulfillment & order management
│   │   ├── orders-manager.tsx           # Multi-artisan order tracker & dispatch studio
│   │   └── index.ts                     # Barrel export for orders
│   │
│   ├── seller-profile/       # Artisan provenance & maker studio
│   │   ├── seller-profile-view.tsx      # Maker bio & Instagram-style storytelling
│   │   ├── seller-profile-modal.tsx     # Quick preview modal
│   │   └── index.ts                     # Barrel export for seller profile
│   │
│   ├── security/             # Client permission boundaries
│   │   ├── permission-guard.tsx         # RBAC conditional wrapper
│   │   ├── permission-guard.spec.ts     # Permission guard unit tests
│   │   └── index.ts                     # Barrel export for security
│   │
│   └── index.ts              # Re-exports all domain features
│
└── index.ts                  # Root Package Entrypoint (exports primitives, composites, features)
```

---

## 2. How to Import Components

All components are exported from the root `@genz/ui` entrypoint for ergonomic developer experience:

```tsx
// 1. Importing Primitives & Composites
import { Button, Input, Card, StatusBadge, PageHeader, SlideOverDrawer } from "@genz/ui";

// 2. Importing Domain Feature Desks
import { ProductEditorForm, OrdersManager, SellerProfileView } from "@genz/ui";

// 3. Or use scoped subpaths if preferred:
import { Button, Card } from "@genz/ui/primitives";
import { PageHeader, SlideOverDrawer } from "@genz/ui/composites";
import { ProductEditorForm } from "@genz/ui/features";
```

---

## 3. Design Tokens & Styling Principles

- **Warm Paper Canvas**: `#FAF8F4` (Light, tactile, artisanal background).
- **Deep Ink Charcoal**: `#1A1A18` (Primary text and buttons).
- **Ash Borders**: `#E5E5E0` (Clean structural separators).
- **Craft Gold Accent**: `#C89D32` (Reserved exclusively for GI certifications, award milestones, and verified seals).
- **Zero Emerald/Green**: Avoid green color schemes; use monochromatic charcoal + craft gold tokens.
- **Single System Theme**: High-contrast, clean light theme. Dark mode classes (`dark:...`) are prohibited.

---

## 4. Contributing Rules

1. **Primitives (`src/primitives/`)**: Keep domain-agnostic. No business logic, database queries, or server action dispatches.
2. **Composites (`src/composites/`)**: Compose multiple primitives together for reusable UI patterns (headers, drawers, dropdowns).
3. **Features (`src/features/`)**: Contain complex multi-card form workflows or management desks shared across applications (`apps/seller` and `apps/admin`).
4. **Co-locate Tests (`*.spec.ts`)**: Keep unit tests directly alongside the logic they verify (e.g. `products-catalog.spec.ts`).
