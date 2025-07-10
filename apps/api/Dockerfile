# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY packages packages
COPY apps/api apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
WORKDIR /app/apps/api
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files for production install
COPY package.json pnpm-lock.yaml* ./
COPY packages packages
COPY apps/api/package.json apps/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/apps/api/dist apps/api/dist

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Change ownership
RUN chown -R fastify:nodejs /app
USER fastify

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http.get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "apps/api/dist/app.js"]