# =============================================================
# Multi-stage Dockerfile for Diario Noticia API
# Build context: repository root (Base Directory = vacío)
# =============================================================

# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy API package files
COPY apps/api/package.json apps/api/pnpm-lock.yaml /app/

# Install pnpm + all dependencies
RUN corepack enable && corepack prepare pnpm@9 --activate \
    && pnpm install --frozen-lockfile

# Copy full API source
COPY apps/api/ /app/

# Generate Prisma client & build
RUN npx prisma generate && pnpm run build

# Remove devDependencies after build
RUN pnpm prune --prod

# --- Production stage ---
FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy everything from builder (dist + pruned node_modules + prisma schemas)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]
