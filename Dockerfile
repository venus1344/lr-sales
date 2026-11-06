# syntax=docker/dockerfile:1

# Production image for welink-sales.
#
#   docker build --target runner -t welink-sales .      # app image
#   docker compose -f docker-compose.prod.yml build     # both targets
#
# The `builder` target is also used as the one-shot migration/seed image
# (it carries the full toolchain: prisma CLI, tsx, source).

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma's CLI and schema engine need OpenSSL. bookworm-slim does not ship it,
# so Prisma would fall back to the openssl-1.1.x engine binaries and fail.
# Installed before `npm ci` so the postinstall engine download detects it.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# ---- dependencies ----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build -----------------------------------------------------------------
FROM deps AS builder
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- runtime ---------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Next.js standalone output: server.js + only the traced dependencies.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Private expense receipts live on a volume; give it to the unprivileged user.
RUN mkdir -p /app/storage && chown node:node /app/storage

USER node
EXPOSE 3000
CMD ["node", "server.js"]
