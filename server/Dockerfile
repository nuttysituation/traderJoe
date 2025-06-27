FROM node:18-alpine

# Install security updates and create non-root user
RUN apk update && apk upgrade && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for development)
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p logs ssl && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application in development mode
CMD ["npm", "run", "dev"] 