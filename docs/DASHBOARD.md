# Dashboard UX System

This document defines the dashboard foundation for the GenZ seller and admin portals.

## Goals

The dashboards are operational workspaces, not marketing pages.

- **Seller:** quickly understand what needs attention, store performance and the next useful action.
- **Admin:** quickly understand platform operations, pending work and operational risks.

## Information architecture

### Seller

1. Workspace — Overview
2. Manage — Orders, Products
3. Store — Storefront, Business Profile, Verification
4. Account — Settings

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

1. Action center — blockers and next actions
2. Store setup/verification — completion path when incomplete
3. Store/business metrics — revenue, orders, catalog, traffic
4. Analytics and quick actions
5. Recent orders — operational work
6. Recent products — catalog activity

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


## Day 2 — Seller UX pass

The seller dashboard now follows a task-first operational hierarchy:

- Action-required work is presented as a prioritized list instead of a grid of equal-weight cards.
- Revenue is calculated from delivered seller orders so the metric label matches the underlying value.
- Fulfillment status is visible immediately below the KPI row.
- Recent orders have a dedicated mobile list representation instead of relying on horizontal table scrolling.
- Seller navigation is grouped by the user's mental model: Workspace, Manage, Store and Account.
- Active navigation exposes `aria-current="page"` for assistive technology.
