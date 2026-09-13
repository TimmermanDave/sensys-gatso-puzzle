# Build image
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.server.json vite.config.ts ./
COPY server ./server
COPY client ./client
RUN npm run build
RUN npm run build:api

FROM node:22-alpine AS api
WORKDIR /app
COPY package.json ./
COPY --from=build /app/.server ./.server
USER node
EXPOSE 3001
CMD ["node", ".server/server/index.js"]

# Runtime image
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Set the user to non-root (101)
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
