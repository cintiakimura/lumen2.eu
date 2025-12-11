# Build stage
FROM node:20-bullseye AS builder

WORKDIR /app

# Copy package files (use glob so build doesn't fail if lockfile is out of sync)
COPY package*.json ./

# Install dependencies (use npm install to avoid strict lockfile validation in Cloud Build)
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-bullseye

WORKDIR /app

# Copy package metadata and install production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy the server file
COPY server.js .

# Expose port 8080 (standard for Cloud Run)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "server.js"]
