# → 1) BUILD
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos solo lo necesario para cache de deps
COPY package*.json tsconfig*.json angular.json ./
RUN npm ci --prefer-offline --no-audit

# Copiamos el resto y construimos sin sourcemaps
COPY . .
RUN npm run build -- \
    --configuration production \
    --source-map=false

# → 2) RUNTIME
FROM nginx:stable-alpine
LABEL org.opencontainers.image.source="https://tu-repo.git"

# Gzip + cache headers (incluimos dentro de default.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/apps-angular-technical-test/browser /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
