# GenZ Project Documentation

This folder is the working documentation source of truth for the GenZ monorepo.

## Documents

| Document | Purpose |
|---|---|
| [PRODUCT.md](./PRODUCT.md) | Product vision, users, roles, core workflows and business rules |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Monorepo structure, app boundaries, data flow and shared packages |
| [DESIGN.md](./DESIGN.md) | UI/UX system, responsive behavior and design constraints |
| [RULES.md](./RULES.md) | Non-negotiable engineering and coding rules |
| [AI_AGENT.md](./AI_AGENT.md) | How an AI coding agent must inspect, plan, implement, test and report work |
| [SECURITY.md](./SECURITY.md) | Authentication, authorization, RLS, secrets and security checklist |
| [TEST_PLAN.md](./TEST_PLAN.md) | Testing strategy, verification gates and regression checklist |
| [TASKS.md](./TASKS.md) | Task execution format and definition of done |
| [DECISIONS.md](./DECISIONS.md) | Important architecture decisions and their rationale |
| [MEMORY.md](./MEMORY.md) | Durable project context that agents should retain between tasks |

## Reading order for an AI agent

1. `PRODUCT.md`
2. `ARCHITECTURE.md`
3. `RULES.md`
4. `AI_AGENT.md`
5. Read only the feature-specific documents needed for the task.

**Important:** The repository code is the implementation. These documents describe the intended behavior and constraints. If documentation and code disagree, the agent must flag the mismatch and verify the current implementation before changing behavior.
