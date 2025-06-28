#!/bin/bash

# Configure environment file with Alpha Vantage API key
echo "Configuring environment file..."

# Check if API key is provided
if [ -z "$ALPHA_VANTAGE_API_KEY" ]; then
    echo "❌ ERROR: ALPHA_VANTAGE_API_KEY environment variable not set"
    echo "   Please set your Alpha Vantage API key:"
    echo "   export ALPHA_VANTAGE_API_KEY='your-api-key-here'"
    echo "   Get a free API key at: https://www.alphavantage.co/support/#api-key"
    exit 1
fi

# Create .env file from template
cp env.example .env

# Update Alpha Vantage API key
sed -i '' "s/your_alpha_vantage_key_here/$ALPHA_VANTAGE_API_KEY/g" .env

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