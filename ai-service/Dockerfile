FROM python:3.11-slim

# Install security updates and create non-root user
RUN apt-get update && apt-get upgrade -y && \
    groupadd -g 1001 pythonuser && \
    useradd -u 1001 -g pythonuser -s /bin/bash pythonuser

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p logs && \
    chown -R pythonuser:pythonuser /app

# Switch to non-root user
USER pythonuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] 