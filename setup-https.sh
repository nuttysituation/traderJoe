#!/bin/bash

echo "🔒 Setting up HTTPS with TLS 1.3 for Stock Tracker App"
echo "=================================================="

# Check if SSL directory exists
if [ ! -d "ssl" ]; then
    echo "Creating SSL directory..."
    mkdir -p ssl
fi

# Generate SSL certificates if they don't exist
if [ ! -f "ssl/server.crt" ] || [ ! -f "ssl/server.key" ]; then
    echo "🔐 Generating SSL certificates..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/server.key -out ssl/server.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=StockTracker/CN=localhost"
    echo "✅ Server certificates generated"
fi

if [ ! -f "ssl/client.crt" ] || [ ! -f "ssl/client.key" ]; then
    echo "🔐 Generating client SSL certificates..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/client.key -out ssl/client.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=StockTracker/CN=localhost"
    echo "✅ Client certificates generated"
fi

# Set proper permissions
chmod 600 ssl/*.key
chmod 644 ssl/*.crt

echo ""
echo "📋 Configuration Summary:"
echo "========================="
echo "• Backend HTTP Port: 8765"
echo "• Backend HTTPS Port: 8766"
echo "• Frontend Port: 3000 (HTTPS in development)"
echo "• Production Port: 443 (via Nginx)"
echo ""
echo "🔧 Available Commands:"
echo "======================"
echo ""
echo "Development Mode:"
echo "  docker-compose --profile development up"
echo "  # Access at: https://localhost:3000"
echo ""
echo "Production Mode:"
echo "  ./build-client.sh"
echo "  docker-compose --profile production up"
echo "  # Access at: https://localhost"
echo ""
echo "Manual Development:"
echo "  # Terminal 1 - Backend:"
echo "  cd server && npm install && npm run dev"
echo "  # Backend will be at: https://localhost:8766"
echo ""
echo "  # Terminal 2 - Frontend:"
echo "  cd client && npm install && npm start"
echo "  # Frontend will be at: https://localhost:3000"
echo ""
echo "🔒 Security Features:"
echo "===================="
echo "• TLS 1.3 only (most secure)"
echo "• Strong cipher suites"
echo "• Security headers (HSTS, CSP, etc.)"
echo "• Rate limiting"
echo "• CORS configured for HTTPS"
echo ""
echo "⚠️  Important Notes:"
echo "==================="
echo "• These are self-signed certificates for development"
echo "• Your browser will show security warnings - this is normal"
echo "• For production, use certificates from a trusted CA"
echo "• Add certificates to your system trust store to avoid warnings"
echo ""
echo "🎉 HTTPS setup complete! Your app is now configured for TLS 1.3" 