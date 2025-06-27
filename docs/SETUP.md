# Stock Tracker Application Setup Guide

This guide will help you set up the complete Stock Tracker application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Node.js** (version 18 or higher) - Optional, for local development
- **Git** (for cloning the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stock-tracker-app
```

### 2. Run the Setup Script

```bash
./setup.sh
```

This script will:
- Check for required dependencies
- Set up environment configuration
- Install all dependencies
- Start the database services
- Build and start all application services
- Verify the setup

### 3. Configure API Keys

Edit the `.env` file and add your API keys:

```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your API keys
nano .env
```

Required API Keys:
- **Alpha Vantage**: For stock price data
- **Yahoo Finance**: For additional market data
- **IEX Cloud**: For real-time stock data
- **Capitol Trades**: For politician trading data
- **Quiver Quant**: For institutional trading data
- **Open Secrets**: For political contribution data

### 4. Restart Services

After adding your API keys, restart the services:

```bash
docker-compose restart
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## Manual Setup (Alternative)

If you prefer to set up manually or the setup script fails:

### 1. Environment Setup

```bash
cp env.example .env
# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Start database services
docker-compose up -d postgres redis

# Wait for database to be ready
sleep 10

# Run migrations
cd server
npm install
npm run migrate
cd ..
```

### 3. Install Dependencies

```bash
# Root dependencies
npm install

# Server dependencies
cd server && npm install && cd ..

# Client dependencies
cd client && npm install && cd ..
```

### 4. Start Services

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d
```

## Development Mode

For development with hot reloading:

```bash
# Start in development mode
npm run dev
```

This will start:
- Frontend on http://localhost:3000 (with hot reload)
- Backend on http://localhost:5000 (with hot reload)
- AI Service on http://localhost:8000 (with hot reload)

## Project Structure

```
stock-tracker-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── migrations/        # Database migrations
├── ai-service/            # Python AI service
│   ├── services/          # AI analysis services
│   └── main.py           # FastAPI application
├── docs/                  # Documentation
├── docker-compose.yml     # Docker services
└── setup.sh              # Setup script
```

## API Endpoints

### Backend API (Port 5000)

- `GET /health` - Health check
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:symbol` - Get stock details
- `GET /api/investors` - Get all investors
- `GET /api/investors/:id` - Get investor details
- `GET /api/trades` - Get all trades
- `GET /api/analysis` - Get analysis data
- `GET /api/dashboard/stats` - Get dashboard statistics

### AI Service (Port 8000)

- `GET /health` - Health check
- `POST /analyze-stock` - Analyze a stock
- `POST /generate-buy-suggestions` - Generate buy suggestions
- `GET /suggestions/:symbol` - Get stock suggestion
- `GET /market-sentiment` - Get market sentiment

## Database Schema

The application uses PostgreSQL with the following main tables:

- **stocks** - Stock information and current prices
- **investors** - Investor/politician profiles
- **trades** - Individual trade records
- **portfolios** - Current portfolio holdings
- **buy_suggestions** - AI-generated buy suggestions
- **stock_prices** - Historical price data

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5000
   lsof -i :8000
   
   # Kill the process or change ports in .env
   ```

2. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # View logs
   docker-compose logs postgres
   ```

3. **API keys not working**
   - Verify API keys are correctly set in `.env`
   - Check API service limits
   - Review service logs: `docker-compose logs server`

4. **Frontend not loading**
   ```bash
   # Check if React app is building
   docker-compose logs client
   
   # Rebuild if needed
   docker-compose build client
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f ai-service

# Access database directly
docker-compose exec postgres psql -U postgres -d stock_tracker
```

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove all data
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## Production Deployment

For production deployment:

1. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Use production database credentials
   - Configure SSL certificates
   - Set up proper logging

2. **Security**
   - Change default passwords
   - Use strong JWT secrets
   - Enable rate limiting
   - Configure CORS properly

3. **Monitoring**
   - Set up health checks
   - Configure logging aggregation
   - Monitor resource usage
   - Set up alerts

4. **Scaling**
   - Use load balancers
   - Configure database replication
   - Set up Redis clustering
   - Use CDN for static assets

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs: `docker-compose logs -f`
3. Verify your configuration in `.env`
4. Check the documentation in `/docs`
5. Open an issue with detailed error information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License. 