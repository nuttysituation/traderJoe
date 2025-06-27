#!/bin/bash

# Configure environment file with Alpha Vantage API key
echo "Configuring environment file..."

# Create .env file from template
cp env.example .env

# Update Alpha Vantage API key
sed -i '' 's/your_alpha_vantage_key/N0ZZDWWJO60V0SMV/g' .env

echo "✅ Environment configured with Alpha Vantage API key"
echo "📝 You can now edit .env to add other API keys as needed"
echo ""
echo "🔑 Current API Keys:"
echo "   Alpha Vantage: ✅ Configured"
echo "   IEX Cloud: ⚠️  Not configured (optional)"
echo "   Open Secrets: ⚠️  Not configured (optional)"
echo "   Polygon.io: ⚠️  Not configured (optional)"
echo "   Finnhub: ⚠️  Not configured (optional)"
echo "   FMP: ⚠️  Not configured (optional)"
echo ""
echo "🚀 Ready to run: ./setup.sh" 