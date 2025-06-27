# Stock Tracker App

A comprehensive application that tracks stock purchases and sales by famous investors and politicians using verifiable public data sources.

## Features

- **Real-time Stock Tracking**: Live price updates for tracked stocks
- **Investor/Politician Monitoring**: Track trades from US/EU politicians, famous investors, and high-net-worth individuals
- **AI-Powered Buy Suggestions**: Daily recommendations based on sentiment analysis, tracked individuals' moves, and historical data
- **Performance Analytics**: Individual and portfolio performance tracking
- **Modern Dashboard**: Clean, informative interface with interactive charts
- **Multiple Data Sources**: SEC filings, 13F reports, CapitolTrades, QuiverQuant, OpenSecrets, and more
- **Secure HTTPS**: TLS 1.3 encryption for all communications

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Chart.js
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Redis
- **Real-time**: WebSocket connections
- **AI Analysis**: Python microservice with scikit-learn
- **Security**: TLS 1.3, HTTPS, Security Headers
- **Deployment**: Docker + Kubernetes-ready

## Quick Start

### Option 1: HTTPS Setup (Recommended)
```bash
# Run the HTTPS setup script
./setup-https.sh

# Development mode with HTTPS
docker-compose --profile development up

# Production mode with HTTPS
./build-client.sh
docker-compose --profile production up
```

### Option 2: Manual Setup
1. **Install Dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database credentials
   ```

3. **Start Development Servers**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: https://localhost:3000 (HTTPS)
   - Backend API: https://localhost:8766 (HTTPS)
   - AI Service: http://localhost:8000

## Security Features

- **TLS 1.3**: Latest encryption protocol for maximum security
- **HTTPS Only**: All communications encrypted
- **Security Headers**: HSTS, CSP, X-Frame-Options, and more
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Self-signed Certificates**: For development (use trusted CA for production)

## Port Configuration

- **Backend HTTP**: 8765 (fallback)
- **Backend HTTPS**: 8766 (primary)
- **Frontend Development**: 3000 (HTTPS)
- **Production**: 443 (via Nginx)

## Data Sources

- SEC Form 4 filings (politicians and executives)
- 13F filings (institutional investors)
- CapitolTrades.com API
- QuiverQuant.com API
- OpenSecrets.org API
- Yahoo Finance API
- Alpha Vantage API
- IEX Cloud API

## Tracked Individuals

### Politicians
- US Congress members and Senators
- EU Parliament members
- Key government officials

### Investors
- Warren Buffett (Berkshire Hathaway)
- Bill Ackman (Pershing Square)
- Cathie Wood (ARK Invest)
- And many more...

### High Net Worth Individuals
- Bill Gates
- Mark Zuckerberg
- Mark Cuban
- Elon Musk
- And others...

## API Documentation

See `/docs/api.md` for detailed API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 