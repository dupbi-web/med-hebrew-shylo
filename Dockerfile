
# Use Node.js official image as base
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files early for dependency caching
COPY package.json package-lock.json* .

# Alpine needs a few build tools for some native modules (esbuild, swc, etc.)
# Install them, then perform a robust install: try `npm ci` (if lockfile present) or fall back to `npm install`.
RUN apk add --no-cache --virtual .build-deps python3 make g++ build-base git libc6-compat \
	&& sh -c "npm ci --prefer-offline --no-audit --progress=false || npm install --legacy-peer-deps --no-audit --progress=false" \
	&& apk del .build-deps

# Copy the rest of the source
COPY . .

# Build the application (Vite)
RUN npm run build

# Production stage: lightweight nginx to serve static files
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA fallback (if present in repo root)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx in foreground
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
