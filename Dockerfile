# Stage 1: Build frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Install backend deps
FROM node:20-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Stage 3: Runtime with Playwright
FROM node:20-slim
RUN npx playwright install --with-deps chromium
WORKDIR /app
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY backend/package.json ./
COPY backend/src ./src
COPY --from=frontend-builder /app/frontend/dist ./public
RUN mkdir -p downloads
EXPOSE 3500
CMD ["node", "src/server.js"]
