# Security Rules

## Trust boundaries

Treat these as untrusted:

- browser input
- query parameters
- request bodies
- cookies/tokens from the client
- uploaded filenames and MIME metadata
- seller/product/order IDs supplied by clients
- analytics events

## Authentication

Use the existing Supabase authentication flow. Do not build a second token/session system unless explicitly required and documented.

## Authorization

Authorization must be enforced on the server and database layer.

For protected resources verify both:

1. authenticated identity
2. permission/ownership for the requested resource

Never authorize an operation only because an ID was supplied by the caller.

## RLS

RLS must remain enabled for protected tables.

Policies should enforce least privilege. Administrative operations must not accidentally become available through normal user sessions.

## Secrets

Never commit:

- Supabase service-role keys
- API keys
- signing secrets
- passwords
- private tokens

Server-only secrets must stay behind server-only modules.

## Orders and payments

Order/payment state is security-sensitive.

- Validate state transitions server-side.
- Do not trust client-provided totals or payment status.
- Prevent duplicate/replayed mutation requests where relevant.
- Recalculate authoritative monetary values from trusted server data.
- Verify ownership before exposing order details.

## Uploads

Validate file type, extension and size on the server. Do not trust the browser's MIME type.

## Logging

Do not log passwords, tokens, service credentials or unnecessary PII.

## Security change checklist

For security-sensitive changes, verify:

- authentication
- authorization
- ownership
- input validation
- RLS
- rate limiting
- error leakage
- replay/duplicate behavior
- auditability
- regression tests
