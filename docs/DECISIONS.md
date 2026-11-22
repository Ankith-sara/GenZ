# Architecture Decisions

This file records decisions that materially affect architecture or product behavior.

## ADR-001 — Turborepo application boundaries

**Decision:** Keep buyer, seller and admin experiences as separate apps under `apps/*`.

**Reason:** Each role has different security boundaries, navigation, deployment and UX requirements.

## ADR-002 — Shared UI package

**Decision:** Reusable domain-agnostic UI belongs in `packages/ui`.

**Reason:** Prevent visual and behavioral drift between web, seller and admin applications.

## ADR-003 — Supabase/Postgres as authoritative data layer

**Decision:** Application state that represents persistent business data is backed by Supabase/Postgres.

**Reason:** PostgreSQL constraints, RLS, transactions and relational modeling provide the authoritative consistency boundary.

## ADR-004 — Server-first Next.js architecture

**Decision:** Prefer Server Components and server-side mutations, with client components limited to genuinely interactive/browser-dependent UI.

**Reason:** Reduces client JavaScript and keeps authorization/secrets on the server.

## ADR-005 — Documentation is part of the implementation contract

**Decision:** Material changes to product behavior, security rules or architecture must update the relevant document in `docs/`.

**Reason:** AI agents and human contributors need durable project context instead of relying on chat history.

## ADR-006 — Retain Fastify 4 for Phase 1; Defer Fastify 5 to Follow-Up

**Context:** The API currently runs on Fastify 4.28/4.29 with `@fastify/cors@9`, `@fastify/rate-limit@9`, `@fastify/multipart@8`, and `@fastify/sensible@5`. Upgrading to Fastify 5 requires simultaneous major-version upgrades across the entire plugin ecosystem and brings breaking lifecycle/hook changes.

**Decision:** Maintain Fastify 4.x for Phase 1 stability while upgrading Zod to 4.4.3 across the repo and configuring `tsup` bundling with `@fastify/swagger@8`. Fastify 5 upgrade is documented as a follow-up task once the API baseline and mobile clients are stabilized.

**Consequences:** Low-risk, zero-regression deployment path for mobile readiness. Existing plugin ecosystem remains fully tested and functional.

## ADR-007 — Single Fastify Backend, Postgres Exclusivity, and Mobile Security (Phase 1)

**Context:** Next.js Server Actions previously implemented resilient local database and JSON store fallback patterns when the Fastify API was unreachable. Checkout was prone to client price tampering, duplicate payment replay, and variant mismatch attacks. Local JSON files (`orders-store.json`) were tracking real order state.

**Decision:**

1. **Centralized Backend:** Direct database fallback calls in `apps/web` and `apps/seller` were eliminated; all client flows communicate exclusively with `@genz/api`.
2. **Postgres Exclusivity:** Deleted `orders-store.json` and removed all filesystem fallback reads/writes. Orders and payments reside solely in PostgreSQL backed by migrations `0027_orders_uuid_and_sequence.sql` and `0028_payments_table.sql`.
3. **Mobile-Ready Checkout Security:** The Fastify API performs authoritative database price recalculations on every checkout and order creation. The gateway payment amount is validated against authoritative cart totals before order placement. Payment rows are claimed once to prevent reuse. Webhook handlers for `payment.captured` and `order.paid` are fully idempotent.
4. **Authoritative Roles:** Authentication plugins resolve user roles directly from the PostgreSQL `profiles` table; client-modifiable `user_metadata` is never used for role authorization.

**Consequences:** The Fastify API is now a hardened, standalone, mobile-ready backend capable of serving web, seller, and future iOS/Android native clients with unified consistency.

## How to add a decision

Use:

- Context
- Decision
- Alternatives considered
- Consequences
- Migration/rollback plan when applicable
