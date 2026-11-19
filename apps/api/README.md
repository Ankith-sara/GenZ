# @genz/api — Fastify REST Backend (Mobile-Ready)

The single, authoritative, high-throughput REST API backend for the GenZ Indian Handicrafts platform. Designed for web clients, merchant seller dashboards, and React Native / Expo mobile applications.

---

## 1. Quick Start (Local Development)

From the monorepo root:

```bash
# Start Fastify API in watch mode on port 4000
pnpm dev:api

# Alternatively using filter
pnpm --filter=@genz/api dev
```

Health check and readiness endpoints:

- **Liveness:** `http://localhost:4000/health`
- **Readiness:** `http://localhost:4000/ready`
- **Interactive Swagger UI:** `http://localhost:4000/v1/docs`
- **Raw OpenAPI 3 JSON:** `http://localhost:4000/v1/docs/json`

---

## 2. Environment Variables

The API performs strict environment validation at startup using Zod (`apps/api/src/config/env.ts`). In production, missing or placeholder credentials will fail fast at boot.

Copy `.env.example` to `.env` or set the following in your deployment environment:

| Variable                        | Description                                               | Required                   | Example                                       |
| :------------------------------ | :-------------------------------------------------------- | :------------------------- | :-------------------------------------------- |
| `PORT`                          | Listening port for the Fastify server                     | No (default `4000`)        | `4000`                                        |
| `HOST`                          | Bind address                                              | No (default `0.0.0.0`)     | `0.0.0.0`                                     |
| `NODE_ENV`                      | Runtime environment (`development`, `test`, `production`) | No (default `development`) | `development`                                 |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Project URL                                      | **Yes**                    | `https://your-proj.supabase.co`               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key                                         | **Yes**                    | `eyJhbG...`                                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Service Role Key (admin mutations)               | **Yes**                    | `eyJhbG...`                                   |
| `RAZORPAY_KEY_ID`               | Razorpay Merchant Key ID                                  | **Yes**                    | `rzp_live_...`                                |
| `RAZORPAY_KEY_SECRET`           | Razorpay Merchant Secret                                  | **Yes**                    | `secret_...`                                  |
| `RAZORPAY_WEBHOOK_SECRET`       | Webhook verification secret                               | No (optional in dev)       | `whsec_...`                                   |
| `CORS_ORIGIN`                   | Comma-separated allowed origins                           | No (default `*`)           | `http://localhost:3000,http://localhost:3001` |
| `RESEND_API_KEY`                | Resend API key for transactional emails                   | No                         | `re_...`                                      |

See [.env.example](file:///c:/Users/sarav/Code%20Tutorial/Project_darkis/genz-app/.env.example) for reference.

---

## 3. Production Build & Docker

### Standalone Node Build

The API compiles via `tsup` into a self-contained bundle with source maps:

```bash
# Build with tsup
pnpm --filter=@genz/api build

# Run compiled bundle
node apps/api/dist/server.js
```

### Production Docker Container

The Dockerfile is hardened with multi-stage builds, non-root execution (`fastify:nodejs`), and container health checks:

```bash
# Build image from repository root
docker build -f apps/api/Dockerfile -t genz-api:latest .

# Run container
docker run -p 4000:4000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-proj.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-key" \
  -e RAZORPAY_KEY_ID="rzp_live_xxx" \
  -e RAZORPAY_KEY_SECRET="your-secret" \
  genz-api:latest
```

The Docker image includes a native healthcheck:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
```

---

## 4. Mobile Developer Authentication Guide (iOS & Android)

Mobile applications (React Native / Expo / Flutter) communicate directly with `@genz/api`:

### 1. Initial Authentication

Authenticate using the Supabase client library on the mobile device:

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "buyer@example.com",
  password: "secure_password",
});
const accessToken = data.session.access_token;
```

### 2. Making Authenticated Requests

Send the token in the standard HTTP `Authorization` header:

```typescript
const response = await fetch("https://api.yourdomain.com/v1/orders", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});
```

_Note: Mobile apps do not send an `Origin` header. The Fastify API's CORS plugin is explicitly configured to allow non-browser requests without `Origin` headers._

### 3. Role Security Guarantee

The backend resolves user roles (`admin`, `seller`, `buyer`) authoritatively from PostgreSQL `profiles.role`. Client-updatable `user_metadata` is **never trusted** for role authorization.

### 4. Token Refresh Pattern

When receiving a `401 UNAUTHORIZED` response:

```typescript
const { data } = await supabase.auth.refreshSession();
const newAccessToken = data.session.access_token;
// Retry the failed request with newAccessToken
```

---

## 5. API Documentation & OpenAPI Specification

- **Interactive Swagger UI:** Available in development and staging at `/v1/docs`
- **Raw OpenAPI 3.0 Spec:** Available at `/v1/docs/json`
- **Committed Spec File:** [apps/api/openapi.json](file:///c:/Users/sarav/Code%20Tutorial/Project_darkis/genz-app/apps/api/openapi.json)
