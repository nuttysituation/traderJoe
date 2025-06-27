FROM node:18-alpine

# Install security updates and create non-root user
RUN apk update && apk upgrade && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p ssl && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the development server
CMD ["npm", "start"] 