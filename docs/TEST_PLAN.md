# Test Plan

## Test layers

### Unit/domain tests

Test:

- validation schemas
- business rules
- order state transitions
- pricing calculations
- authorization helpers
- rate limiting
- file validation

Keep domain specs close to the logic they verify.

### Integration tests

Use for:

- database/RLS behavior
- auth + authorization boundaries
- important server actions
- multi-step workflows

### UI tests

Focus on user-visible behavior rather than implementation details.

Important states:

- loading
- success
- empty
- validation error
- server error
- unauthorized
- mobile layout

## Regression requirement

Every fixed bug should receive a regression test when practical.

Security bugs require a test that demonstrates the forbidden action fails.

## Verification commands

Use the package scripts already defined by the repository. Typical checks include:

```bash
pnpm test
npx vitest run
npx tsc --noEmit
pnpm lint
```

Do not report a command as passing unless it was actually executed.

## Before merge

- targeted tests pass
- type checking passes
- lint/format checks pass where applicable
- relevant integration/security tests pass
- no new console/runtime errors
- final diff reviewed
