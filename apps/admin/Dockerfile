# =============================================================
# Multi-stage Dockerfile for Diario Noticia Admin Panel
# Build context: repository root
# =============================================================

# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy admin package files
COPY apps/admin/package.json apps/admin/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy full admin source
COPY apps/admin/ ./

# Build Next.js app
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY apps/admin/package.json apps/admin/package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy build artifacts from builder
COPY --from=builder /app/.next ./.next

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["npm", "start"]
