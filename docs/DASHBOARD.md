# Dashboard UX System

This document defines the dashboard foundation for the GenZ seller and admin portals.

## Goals

The dashboards are operational workspaces, not marketing pages.

- **Seller:** quickly understand what needs attention, store performance and the next useful action.
- **Admin:** quickly understand platform operations, pending work and operational risks.

## Information architecture

### Seller

1. Overview
2. Store — Products, Orders
3. Growth — Storefront and analytics
4. Account — Business Profile, Verification, Settings

Primary actions:
- Add product
- Process orders
- Complete verification/profile steps
- View storefront

### Admin

1. Main — Dashboard, Verifications, Users, Orders, Products
2. Leads — Waitlist, Messages
3. System — Analytics, Audit Logs, Settings

Primary actions:
- Review pending seller verification
- Inspect orders
- Manage catalog
- Review users
- Investigate operational issues

## Layout rules

- Persistent desktop navigation with a collapsible sidebar.
- Mobile navigation uses a drawer.
- Header contains page identity plus high-value global controls.
- Dashboard pages use a consistent page header.
- Use panels for meaningful groups of information; avoid unnecessary card-on-card layouts.
- Metrics are reserved for decisions or monitoring, not decoration.
- Tables/lists are preferred for operational records.
- Empty states explain what happened and what the user can do next.
- Loading states preserve the final layout shape.
- Errors provide a recovery action where possible.

## Metric rules

A metric must have:
- a clear label
- an authoritative value
- optional contextual detail

Never display fabricated percentage changes, fake sparklines or "live" system-health percentages unless the underlying data source actually provides them.

## Seller dashboard hierarchy

1. Action-required items
2. Store/business metrics
3. Recent orders
4. Product/catalog activity
5. Store setup/verification progress

## Admin dashboard hierarchy

1. Action-required operational queue
2. Platform-level metrics
3. Recent users/orders/products
4. Traffic/analytics
5. System/audit information

## Responsive rules

Supported layouts:
- 360px+
- tablet
- desktop

Operational tables should have an intentional mobile representation rather than causing horizontal page overflow.

## Accessibility

- Navigation uses semantic landmarks.
- Icon-only controls have accessible names.
- Focus states remain visible.
- Status is not communicated by color alone.
- Interactive controls have predictable keyboard behavior.

## Implementation

Reusable, domain-agnostic dashboard primitives belong in `packages/ui`.

Current foundation components:
- `DashboardPageHeader`
- `DashboardPanel`
- `DashboardStat`

Domain-specific dashboard sections remain inside `apps/seller` or `apps/admin`.


## Seller Orders — Fulfillment UX

The seller orders workspace is treated as an operational queue:

- Surface orders needing action before secondary order states.
- Provide a combined **Needs Action** filter for placed and processing orders.
- Keep KPI values tied to the currently scoped order set.
- Preserve mobile list representation for operational records.
- Make clickable order rows keyboard accessible.
- Use the shared dashboard header/stat primitives for consistent hierarchy.
