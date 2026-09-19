# GenZ Architecture

## System shape

GenZ is a pnpm/Turborepo monorepo with three applications and shared packages.

```
GenZ/
├── apps/
│   ├── web/       # Buyer-facing marketplace
│   ├── seller/    # Seller portal
│   └── admin/     # Internal administration portal
├── packages/
│   ├── database/  # Supabase clients + repositories/domain persistence
│   ├── ui/        # Shared UI system
│   ├── types/     # Shared TypeScript domain types
│   ├── utils/     # Shared infrastructure utilities
│   ├── validation/# Shared Zod schemas
│   └── config/    # Shared configuration
└── supabase/
    └── migrations/
```

## Boundary rules

### apps/web
Owns buyer-facing routes and public marketplace UX.

### apps/seller
Owns seller-only workflows. Seller authorization must be enforced server-side; hiding a UI element is not authorization.

### apps/admin
Owns privileged platform operations. Admin-only operations must use server-side authorization and the privileged database client only where required.

### packages/ui
Contains reusable, domain-agnostic UI primitives and shared composites. Do not duplicate common UI primitives in apps.

### packages/types
Contains shared domain models and API-facing types.

### packages/validation
Contains reusable Zod validation schemas.

### packages/database
Contains Supabase clients, repositories and persistence logic. Keep database access out of presentational components.

## Data flow

```
UI → server component/action/route → authorization → validation → domain/data layer → Supabase/Postgres
                                                      ↓
                                                   result
```

Client components should not directly perform privileged database operations.

## Server/client boundary

- Server Components by default.
- Use `use client` only where browser state, events or browser APIs are required.
- Secrets require server-only boundaries.
- Dynamic Next.js route params must follow the version's current API contract; verify local Next.js documentation when uncertain.

## Database

Supabase/PostgreSQL is the authoritative application database.

RLS is a security boundary, not merely a convenience. New tables require RLS and explicit policies.

Supabase migrations are the source of truth for schema changes.
