# =============================================================
# Multi-stage Dockerfile for Diario Noticia Web (Portal Público)
# Build context: repository root (dockerContextPath = .)
# =============================================================

# --- Build stage ---
FROM node:20-alpine AS builder

ARG NEXT_PUBLIC_API_URL=http://diarionoticia-api-shxwvh-06deda-186-153-163-188.sslip.io:3001/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

COPY apps/web/ ./
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
