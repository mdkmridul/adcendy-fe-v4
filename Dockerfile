# syntax=docker/dockerfile:1.7
# Keep in step with .nvmrc; CI passes it with --build-arg NODE_VERSION.
ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/scripts/validate-runtime-config.ts ./scripts/validate-runtime-config.ts
COPY --from=builder --chown=nextjs:nodejs /app/shared/runtime-config ./shared/runtime-config

USER nextjs
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget --quiet --spider "http://127.0.0.1:${PORT}/health/ready" || exit 1

CMD ["sh", "-c", "node --experimental-strip-types scripts/validate-runtime-config.ts && exec node server.js"]
