#!/bin/bash

# Alpha Vantage API Test Script
API_KEY="N0ZZDWWJO60V0SMV"
SYMBOL="AAPL"

echo "🧪 Testing Alpha Vantage API..."
echo "📊 Testing stock symbol: $SYMBOL"
echo "🔑 Using API key: $API_KEY"
echo ""

# Test the API
echo "⏳ Making API request..."
echo ""

response=$(curl -s "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=$SYMBOL&apikey=$API_KEY")

echo "📡 API Response:"
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""

# Check if we got stock data
if echo "$response" | grep -q "Global Quote"; then
    echo "✅ SUCCESS! Stock data received!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Install Node.js from https://nodejs.org/"
    echo "   2. Install Docker from https://www.docker.com/"
    echo "   3. Run: npm run install-all"
    echo "   4. Run: docker-compose up -d"
    echo "   5. Visit: http://localhost:3000/test"
elif echo "$response" | grep -q "Error Message"; then
    echo "❌ ERROR: API key might be invalid or rate limit exceeded"
elif echo "$response" | grep -q "Note"; then
    echo "⚠️  WARNING: Rate limit exceeded (5 calls/minute for free tier)"
    echo "   Wait a minute and try again."
else
    echo "❓ Unexpected response format"
fi

echo "" 