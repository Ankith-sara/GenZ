# Project Memory

This file contains durable technical context that an AI agent should know before making changes.

## Current platform shape

- Monorepo: Turborepo
- Package manager: pnpm
- Buyer app: `apps/web`
- Seller app: `apps/seller`
- Admin app: `apps/admin`
- Database: Supabase/PostgreSQL
- UI package: `@genz/ui`
- Shared types: `@genz/types`
- Shared validation: `@genz/validation`

## Current architectural expectations

- Server Components by default.
- Role-based access is enforced server-side and through database controls.
- Shared UI should not be duplicated between apps.
- Business logic belongs outside presentational components.
- New protected database tables require RLS.
- Security-sensitive changes require regression coverage.

## Important maintenance rule

This file is not a changelog. Record only durable facts that future agents need to make correct decisions.

When a fact becomes obsolete, update or remove it rather than appending contradictory notes.
