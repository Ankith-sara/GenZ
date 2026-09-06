<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GenZ Monorepo AI Agent Guidelines

All AI agents (Antigravity, Cursor, Claude Code, Copilot) working on this codebase MUST read and strictly follow [AI_AGENT_GUIDELINES.md](file:///c:/Users/sarav/Code%20Tutorial/Project_darkis/genz-app/AI_AGENT_GUIDELINES.md).

### Non-Negotiable Rules:

1. **Turborepo Package Boundaries**: Place shared UI primitives in `packages/ui` (`@genz/ui`), shared types in `packages/types` (`@genz/types`), validation schemas in `packages/validation` (`@genz/validation`), and database clients/repositories in `packages/database` (`@genz/database`). Do NOT create local re-export proxy files inside individual apps.
2. **Next.js 15 & React 19**: Server Components by default; `"use client"` only for leaf interactive components; `await params` in dynamic routes; React 19 `useActionState` for form mutations; `server-only` on secrets/admin utilities.
3. **Server Action Rate Limiting**: Every server action MUST wrap logic with `withRateLimit` from `@/lib/rate-limiter` and check authorization with `requireRole`.
4. **Seller Data Fallback**: When loading seller profiles in `apps/seller`, always use the intelligent fallback that checks `seller_applications` by email to ensure submitted signup details (`business_name`, `gst_number`, `factory_address`, `city`, `state`, `pincode`, `established_year`) are never displayed as "Not specified" or "Pending".
5. **Testing & Verification**: Always verify code changes with `pnpm test` (Vitest: 114 tests) and `npx tsc --noEmit`. Co-locate `*.spec.ts` files with domain logic only.
