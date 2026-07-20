# =============================================================
# Multi-stage Dockerfile for Diario Noticia API
# Build context: repository root (Base Directory = vacío)
# =============================================================

# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy API package files
COPY apps/api/package.json apps/api/pnpm-lock.yaml /app/

# Install pnpm + dependencies
RUN corepack enable && corepack prepare pnpm@9 --activate \
    && pnpm install --frozen-lockfile

# Copy full API source
COPY apps/api/ /app/

# Generate Prisma client & build
RUN npx prisma generate && pnpm run build

# Flatten Prisma artifacts for production stage (pnpm uses symlinks)
RUN mkdir -p /prisma-artifacts/node_modules/.prisma \
    && cp -rL /app/node_modules/.prisma/* /prisma-artifacts/node_modules/.prisma/ \
    && mkdir -p /prisma-artifacts/node_modules/@prisma/client \
    && cp -rL /app/node_modules/@prisma/client/* /prisma-artifacts/node_modules/@prisma/client/

# --- Production stage ---
FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for prod install
COPY apps/api/package.json apps/api/pnpm-lock.yaml ./

# Install pnpm + production deps only
RUN corepack enable && corepack prepare pnpm@9 --activate \
    && pnpm install --prod --frozen-lockfile

# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /prisma-artifacts/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /prisma-artifacts/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]
