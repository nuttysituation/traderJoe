#!/bin/bash

echo "Building React client for production..."

# Set environment variables for HTTPS
export HTTPS=true
export SSL_CRT_FILE=./ssl/client.crt
export SSL_KEY_FILE=./ssl/client.key
export REACT_APP_API_URL=https://localhost:8766

# Navigate to client directory
cd client

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing client dependencies..."
    npm install
fi

# Build the application
echo "Building production build..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Client build successful!"
    echo "Production build available in client/build/"
else
    echo "❌ Client build failed!"
    exit 1
fi

cd .. 