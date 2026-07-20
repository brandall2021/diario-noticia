# =============================================================
# Multi-stage Dockerfile for Diario Noticia Web (Portal Público)
# Build context: repository root
# =============================================================

# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy web package files
COPY apps/web/package.json apps/web/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy full web source
COPY apps/web/ ./

# Build Next.js app
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY apps/web/package.json apps/web/package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy build artifacts from builder
COPY --from=builder /app/.next ./.next

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
