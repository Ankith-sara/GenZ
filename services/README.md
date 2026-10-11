# GenZ Modular Services Layer (`@genz/services`)

This directory houses the unified, modular backend domain services layer for the GenZ marketplace.

All services are clean TypeScript modules running within the application runtime and accessing Supabase/PostgreSQL directly. No standalone microservice deployments, Docker containers, or extra infrastructure required.

## Service Inventory (User-Friendly Names)

| Service Folder | Public Import Subpath | Domain Responsibility |
| :--- | :--- | :--- |
| **`auth`** | `@genz/services/auth` | User account provisioning, password hashing/generation, RBAC role verification |
| **`products`** | `@genz/services/products` | Product listings, categories, slugification, materials parsing, and ownership |
| **`orders`** | `@genz/services/orders` | Order creation, query filters, and state machine status transitions |
| **`shipping`** | `@genz/services/shipping` | Logistics carriers (India Post, Blue Dart, Delhivery, etc.) & tracking URLs |
| **`stock`** | `@genz/services/stock` | Real-time inventory evaluation (`in_stock`, `low_stock`, `out_of_stock`) |
| **`payments`** | `@genz/services/payments` | Razorpay order creation, HMAC-SHA256 signature verification & UPI UTR |
| **`pricing`** | `@genz/services/pricing` | Subtotal calculation, GST tax computation (5%, 12%, 18%), commission |
| **`cart`** | `@genz/services/cart` | Cart line-item validation & multi-artisan seller item partitioning |
| **`checkout`** | `@genz/services/checkout` | End-to-end checkout orchestration & asynchronous seller notification dispatch |
| **`customers`** | `@genz/services/customers` | Customer profiles, saved addresses, and customer order history |
| **`sellers`** | `@genz/services/sellers` | Seller onboarding applications, approvals, and intelligent profile fallback |
| **`notifications`** | `@genz/services/notifications` | Transactional email delivery via Resend & seller order notifications |
| **`search`** | `@genz/services/search` | Multi-field search querying `name`, `category`, and `description` |
| **`analytics`** | `@genz/services/analytics` | Telemetry tracking for domain events (`order_placed`, `seller_verified`) |
