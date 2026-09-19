# Engineering Rules

These are non-negotiable unless an explicit architecture decision changes them.

## 1. Inspect before editing

Before changing code, identify:

- affected app/package
- existing feature implementation
- related types and validation
- authorization path
- database/RLS behavior
- existing tests
- shared UI components that already solve the problem

Do not create a parallel implementation without checking the existing one.

## 2. Respect package boundaries

- Shared UI → `packages/ui`
- Shared types → `packages/types`
- Validation → `packages/validation`
- Database/domain persistence → `packages/database`

Do not create proxy re-export files inside apps just to hide the real package import.

## 3. Authorization

Authentication answers "who are you". Authorization answers "are you allowed to do this".

Every privileged server action/route must validate authorization server-side. Never trust role information supplied by the browser.

## 4. Validation

Validate untrusted input at the server boundary with the existing Zod/domain schemas. Never rely on client-side validation alone.

## 5. Rate limiting

Use the existing rate-limiting infrastructure for public, authentication and user-sensitive mutations. Do not introduce a second rate limiter without an explicit architecture decision.

## 6. Database

- Use the authenticated Supabase SSR client for normal user requests.
- Use the admin/service-role client only for genuinely privileged workflows.
- Never expose service-role credentials to the browser.
- New tables require RLS and explicit policies.
- Preserve transactional consistency for money, orders, permissions and other stateful business operations.

## 7. Next.js / React

- Server Components by default.
- Minimize `use client` boundaries.
- Follow the installed Next.js version rather than relying on remembered APIs.
- Use React 19 APIs already established by the project.
- Do not introduce deprecated APIs when a supported alternative exists.

## 8. Tests

A change is not complete because it compiles.

For business logic, add/update a focused test. For security-sensitive behavior, add a regression test that proves the forbidden behavior stays forbidden.

## 9. Minimal change

Prefer the smallest coherent change that fixes the root cause. Do not refactor unrelated code while fixing a bug.

## 10. No silent behavior changes

If a task changes a business rule, document the change in `DECISIONS.md` and update the relevant product documentation.
