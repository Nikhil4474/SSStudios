# Multi-stage build: compiles the frontend and backend separately, then ships a single
# lean runtime image. The Node process serves both the API and the built frontend
# (see backend/src/server.ts), so nginx only needs to reverse-proxy one port.

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Vite bakes VITE_* vars in at build time. Override with --build-arg for your real domain.
ARG VITE_API_BASE_URL=https://ssstudios.me
ARG VITE_YT_CHANNEL_ID=UCXXXXXXXXXXXXXXXXXXXXXX
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_YT_CHANNEL_ID=$VITE_YT_CHANNEL_ID
RUN npm run build

FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

EXPOSE 4000
CMD ["node", "dist/src/server.js"]
