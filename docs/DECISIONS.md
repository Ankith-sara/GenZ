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

## How to add a decision

Use:

- Context
- Decision
- Alternatives considered
- Consequences
- Migration/rollback plan when applicable
