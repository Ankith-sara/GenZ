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

## How to add a decision

Use:

- Context
- Decision
- Alternatives considered
- Consequences
- Migration/rollback plan when applicable
