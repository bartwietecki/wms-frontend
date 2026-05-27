# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# nginx proxies /api → wms-backend; empty base URL makes all API calls relative
ENV VITE_API_BASE_URL=""
RUN npm run build

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
