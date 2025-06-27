# Getting Started with Stock Tracker

## 🚀 Quick Start with Alpha Vantage

Your Alpha Vantage API key is already configured! Let's get the application running.

### Step 1: Configure Environment
```bash
# This will create .env with your Alpha Vantage key
./configure-env.sh
```

### Step 2: Install Dependencies
```bash
# Install all dependencies
npm run install-all
```

### Step 3: Start the Application
```bash
# Start all services with Docker
docker-compose up -d
```

### Step 4: Test the API
1. Open your browser to: http://localhost:3000
2. Navigate to: http://localhost:3000/test
3. Test the Alpha Vantage integration with stock symbols like AAPL, GOOGL, MSFT

## 📊 What's Working Now

### ✅ Alpha Vantage Integration
- Real-time stock prices
- Price changes and percentages
- Trading volume
- Automatic caching (1-minute intervals)

### ✅ Multiple Data Sources Ready
The application is configured to use multiple free data sources:

1. **Alpha Vantage** ✅ (Your key: N0ZZDWWJO60V0SMV)
2. **IEX Cloud** ⚠️ (Free tier available)
3. **Polygon.io** ⚠️ (Free tier available)
4. **Finnhub** ⚠️ (Free tier available)
5. **Financial Modeling Prep** ⚠️ (Free tier available)
6. **Open Secrets** ⚠️ (Free tier available)
7. **Yahoo Finance** ✅ (Web scraping - no API key needed)
8. **SEC EDGAR** ✅ (Web scraping - no API key needed)
9. **MarketWatch** ✅ (Web scraping - no API key needed)

## 🔑 Getting Additional Free API Keys

### IEX Cloud (Recommended)
1. Go to: https://iexcloud.io/cloud-login#/register
2. Sign up for free account
3. Get your API key
4. Add to `.env`: `IEX_CLOUD_API_KEY=your_key_here`

### Polygon.io
1. Go to: https://polygon.io/
2. Sign up for free account
3. Get your API key
4. Add to `.env`: `POLYGON_API_KEY=your_key_here`

### Finnhub
1. Go to: https://finnhub.io/
2. Sign up for free account
3. Get your API key
4. Add to `.env`: `FINNHUB_API_KEY=your_key_here`

### Financial Modeling Prep
1. Go to: https://financialmodelingprep.com/
2. Sign up for free account
3. Get your API key
4. Add to `.env`: `FMP_API_KEY=your_key_here`

### Open Secrets
1. Go to: https://www.opensecrets.org/api/admin/index.php
2. Sign up for free account
3. Get your API key
4. Add to `.env`: `OPEN_SECRETS_API_KEY=your_key_here`

## 🧪 Testing the Application

### Test Page Features
- **Data Sources Status**: Shows which APIs are configured and available
- **Stock Data Test**: Test any stock symbol (AAPL, GOOGL, MSFT, etc.)
- **Quick Test Buttons**: Pre-configured buttons for popular stocks
- **Raw JSON View**: See the exact data returned from APIs

### API Endpoints to Test
```bash
# Test Alpha Vantage stock data
curl http://localhost:5000/api/stocks/AAPL

# Check data sources status
curl http://localhost:5000/api/stocks/sources

# Test multiple stocks
curl "http://localhost:5000/api/stocks/batch?symbols=AAPL,GOOGL,MSFT"

# Health check
curl http://localhost:5000/health
```

## 📈 What You'll See

### Stock Data Response
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "price": 150.25,
    "change": 2.15,
    "changePercent": 1.45,
    "volume": 45678900,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "source": "Alpha Vantage"
  }
}
```

### Data Sources Status
```json
{
  "success": true,
  "data": [
    {
      "name": "Alpha Vantage",
      "status": "Available",
      "description": "Stock price data and technical indicators"
    },
    {
      "name": "IEX Cloud",
      "status": "Not configured",
      "description": "Real-time stock quotes and market data"
    }
  ]
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :5000
   lsof -i :8000
   ```

2. **Docker not running**
   ```bash
   # Start Docker Desktop first, then run:
   docker-compose up -d
   ```

3. **API rate limits**
   - Alpha Vantage: 5 calls/minute (free tier)
   - The app includes caching to minimize API calls

4. **Database connection issues**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # View logs
   docker-compose logs postgres
   ```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
```

## 🎯 Next Steps

1. **Test the Alpha Vantage integration** at http://localhost:3000/test
2. **Add more free API keys** for enhanced data coverage
3. **Explore the dashboard** at http://localhost:3000
4. **Check the API documentation** in the `/docs` folder

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify your API key is working
3. Check the troubleshooting section above
4. Review the full documentation in `/docs/SETUP.md`

## 🎉 Success!

Once you see stock data loading in the test page, your Alpha Vantage integration is working perfectly! The application will automatically try multiple data sources to ensure reliable data delivery. 