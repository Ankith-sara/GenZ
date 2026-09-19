# Task Execution

## Task format

For every non-trivial change, define:

### Goal
One sentence describing the required outcome.

### Current behavior
What the system does today, based on code inspection.

### Target behavior
What should happen after the change.

### Scope
Apps/packages/files likely affected.

### Constraints
Security, UX, architecture, performance or compatibility requirements.

### Verification
Tests and checks required to prove completion.

## Priority

Use:

- **P0** — security, payment integrity, data loss, authorization bypass, production-blocking failure
- **P1** — major workflow failure or serious regression
- **P2** — normal bug, incomplete feature or meaningful UX issue
- **P3** — polish, refactor or low-impact improvement

## Definition of done

A task is done when:

- target behavior works
- existing workflows remain intact
- security constraints are preserved
- relevant tests exist and pass
- types/lint are clean for changed code
- documentation is updated if behavior or architecture changed
- no unrelated changes are included

## Agent task output

At the end, summarize:

```
## Result
Implemented: ...

## Files
- ...

## Verification
- ...

## Notes
- ...
```
