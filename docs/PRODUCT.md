# GenZ Product Specification

## Product

GenZ is a trust-commerce marketplace connecting verified Indian toy, handicraft and manufacturing sellers with buyers and business customers.

The platform has three roles:

- **Buyer** — discovers products, manages a cart, checks out and tracks orders.
- **Seller** — completes verification, manages a maker profile, publishes products and fulfills orders.
- **Admin** — verifies sellers, oversees the catalog, users, orders and platform operations.

## Core workflows

### Buyer
1. Browse home/discovery.
2. Search and filter products.
3. Open a product and inspect seller/provenance information.
4. Add products to cart.
5. Checkout using supported payment/delivery options.
6. View order history and tracking.

### Seller
1. Submit seller application.
2. Wait for admin verification.
3. Sign in after approval.
4. Complete business/profile information.
5. Create product drafts.
6. Add media, variants, pricing and compliance information.
7. Publish approved products.
8. Receive and fulfill orders through valid status transitions.
9. Manage inquiries and account/session information.

### Admin
1. Authenticate through the admin portal.
2. Review seller applications and documents.
3. Approve/reject sellers using the authorized workflow.
4. Manage platform catalog and orders.
5. Monitor users and operational data.
6. Perform privileged actions through server-side authorization.

## Product principles

- Trust and seller provenance are first-class product concepts.
- Public buyer experiences should be fast, discoverable and SEO-friendly.
- Seller workflows should minimize repetitive data entry.
- Admin workflows should optimize for review, verification and operational clarity.
- Destructive or privileged actions require explicit authorization and validation.
- Business state must be represented by the database/domain model, not by UI assumptions.

## Important invariants

- Public signup cannot create an admin or seller account directly.
- Seller publishing is gated by seller verification.
- Buyers, sellers and admins only access data permitted by their role and RLS policies.
- Order transitions must follow the defined state machine.
- Sensitive credentials and service keys never reach client bundles.
