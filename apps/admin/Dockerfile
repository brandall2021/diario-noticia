# =============================================================
# Multi-stage Dockerfile for Diario Noticia Admin Panel
# Build context: repository root (dockerContextPath = .)
# =============================================================

# --- Build stage ---
FROM node:20-alpine AS builder

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY apps/admin/package.json apps/admin/package-lock.json ./
RUN npm ci

COPY apps/admin/ ./
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY apps/admin/package.json apps/admin/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["npm", "start"]
