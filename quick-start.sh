#!/bin/bash

echo "🚀 Stock Tracker App - Quick Start"
echo "=================================="

# Update .env file with correct ports
echo "📝 Updating environment configuration..."
sed -i '' 's/PORT=5000/PORT=8765/' .env
sed -i '' 's/FRONTEND_URL=http:\/\/localhost:3000/FRONTEND_URL=https:\/\/localhost:3000/' .env

# Add HTTPS_PORT if not present
if ! grep -q "HTTPS_PORT" .env; then
    echo "HTTPS_PORT=8766" >> .env
fi

echo "✅ Environment updated!"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo ""
echo "🔧 Choose your setup option:"
echo ""
echo "1. Full Docker Setup (Recommended)"
echo "2. Database + Manual Services"
echo "3. Manual Development Setup"
echo "4. Production Mode"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🐳 Starting full Docker setup..."
        docker-compose --profile development up
        ;;
    2)
        echo "🗄️ Starting databases with Docker..."
        docker-compose up postgres redis -d
        echo "✅ Databases started!"
        echo "Now run the services manually:"
        echo "  Terminal 1: cd server && npm install && npm run dev"
        echo "  Terminal 2: cd client && npm install && npm start"
        ;;
    3)
        echo "🛠️ Manual development setup..."
        echo "Starting databases..."
        docker-compose up postgres redis -d
        
        echo "Installing dependencies..."
        cd server && npm install && cd ..
        cd client && npm install && cd ..
        
        echo "✅ Ready! Now run:"
        echo "  Terminal 1: cd server && npm run dev"
        echo "  Terminal 2: cd client && npm start"
        ;;
    4)
        echo "🏭 Production mode..."
        ./build-client.sh
        docker-compose --profile production up
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete!"
echo "Access your app at: https://localhost:3000"
echo "API health check: https://localhost:8766/health" 