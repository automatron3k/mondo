# Etapa de construcción (si necesitas build tools en el futuro)
## Multi-stage build: use Node to build the Vite site, then serve with nginx
FROM node:20-alpine AS builder
WORKDIR /app

# copy package metadata first for better caching
COPY package.json package-lock.json ./

# install dependencies (we need dev deps for vite build)
RUN npm ci

# copy source and build
COPY . .
RUN npm run build

FROM nginx:alpine AS production
LABEL maintainer="info@mondo.org"
LABEL description="Mondo static website (multi-stage)"

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Default command
CMD ["nginx", "-g", "daemon off;"]