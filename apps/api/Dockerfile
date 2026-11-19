# Production Dockerfile for @genz/api (Fastify Standalone Backend)
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/ ./packages/
COPY services/ ./services/
COPY apps/api/ ./apps/api/

# Install dependencies and compile with tsup
RUN pnpm install --frozen-lockfile
RUN pnpm --filter=@genz/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify

COPY --from=builder --chown=fastify:nodejs /app/package.json ./package.json
COPY --from=builder --chown=fastify:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=fastify:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=fastify:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/packages ./packages
COPY --from=builder --chown=fastify:nodejs /app/services ./services
COPY --from=builder --chown=fastify:nodejs /app/apps/api ./apps/api

USER fastify

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "apps/api/dist/server.js"]
