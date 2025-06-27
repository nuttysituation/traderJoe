# 🚀 Stock Tracker App - Running Checklist

## ✅ Prerequisites (Already Installed)

- ✅ **Node.js** v24.3.0
- ✅ **npm** v11.4.2  
- ✅ **Python** 3.9.6
- ✅ **Docker** v28.2.2
- ✅ **Docker Compose** v2.37.1
- ✅ **SSL Certificates** (generated)

## 🔧 Required Setup Steps

### 1. Environment Configuration
```bash
# Update your .env file with these values:
PORT=8765
HTTPS_PORT=8766
FRONTEND_URL=https://localhost:3000
```

### 2. Database Setup
You need PostgreSQL and Redis running. Options:

**Option A: Using Docker (Recommended)**
```bash
# Start just the database services
docker-compose up postgres redis -d
```

**Option B: Local Installation**
```bash
# Install PostgreSQL
brew install postgresql
brew services start postgresql

# Install Redis
brew install redis
brew services start redis

# Create database
createdb stock_tracker
```

### 3. API Keys (Optional but Recommended)
Get free API keys for enhanced data:
- **IEX Cloud**: https://iexcloud.io/ (free tier available)
- **Polygon.io**: https://polygon.io/ (free tier available)
- **Finnhub**: https://finnhub.io/ (free tier available)

Update your `.env` file with the keys.

## 🚀 Running the Application

### Option 1: Full Docker Setup (Recommended)
```bash
# Development mode with HTTPS
docker-compose --profile development up

# Production mode with HTTPS
./build-client.sh
docker-compose --profile production up
```

### Option 2: Manual Development Setup
```bash
# Terminal 1: Backend
cd server
npm install
npm run dev
# Backend will be at: https://localhost:8766

# Terminal 2: Frontend
cd client
npm install
npm start
# Frontend will be at: https://localhost:3000

# Terminal 3: AI Service (Optional)
cd ai-service
pip install -r requirements.txt
python main.py
# AI Service will be at: http://localhost:8000
```

### Option 3: Database + Manual Services
```bash
# Start databases with Docker
docker-compose up postgres redis -d

# Then run services manually (see Option 2)
```

## 🔍 Access Points

- **Frontend (Development)**: https://localhost:3000
- **Backend API (HTTPS)**: https://localhost:8766
- **Backend API (HTTP)**: http://localhost:8765
- **AI Service**: http://localhost:8000
- **Production**: https://localhost (via Nginx)

## 🛠️ Troubleshooting

### SSL Certificate Warnings
- **Problem**: Browser shows security warnings
- **Solution**: This is normal for self-signed certificates
- **Fix**: Click "Advanced" → "Proceed to localhost"

### Port Already in Use
```bash
# Check what's using the ports
lsof -i :8765
lsof -i :8766
lsof -i :3000

# Kill processes if needed
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Check if Redis is running
brew services list | grep redis

# Restart services
brew services restart postgresql
brew services restart redis
```

### Docker Issues
```bash
# Clean up Docker
docker system prune -a

# Rebuild containers
docker-compose build --no-cache
```

### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📊 Verification Steps

1. **Backend Health Check**:
   ```bash
   curl -k https://localhost:8766/health
   # Should return: {"status":"OK","timestamp":"..."}
   ```

2. **Frontend Load**: Visit https://localhost:3000

3. **API Test**: Visit https://localhost:3000/test-api

4. **Database Connection**: Check server logs for "Database connected successfully"

## 🔐 Security Notes

- Self-signed certificates are used for development
- For production, use certificates from a trusted CA
- All communications use TLS 1.3 encryption
- Security headers are configured for maximum protection

## 📝 Next Steps

1. **Add Real API Keys**: Get free API keys for enhanced data
2. **Configure Database**: Set up proper database credentials
3. **Add Test Data**: Populate with sample investor/trade data
4. **Production Deployment**: Use proper SSL certificates and domain

## 🆘 Getting Help

- Check the logs: `docker-compose logs -f`
- Verify environment: `echo $NODE_ENV`
- Test API endpoints: Use the test page at https://localhost:3000/test-api
- Check database: `psql -d stock_tracker -c "SELECT version();"`

---

**🎉 You're ready to run the Stock Tracker App!** 