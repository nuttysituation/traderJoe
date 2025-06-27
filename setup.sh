#!/bin/bash

# Stock Tracker App Setup Script
# This script sets up the entire application stack

set -e

echo "🚀 Setting up Stock Tracker Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Installing via Docker instead."
        return 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION is installed"
    return 0
}

# Create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your API keys and configuration"
    else
        print_status ".env file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install server dependencies
    if [ -d "server" ]; then
        cd server
        npm install
        cd ..
    fi
    
    # Install client dependencies
    if [ -d "client" ]; then
        cd client
        npm install
        cd ..
    fi
    
    print_success "Dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start database services
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    if [ -d "server" ]; then
        cd server
        npm run migrate
        cd ..
    fi
    
    print_success "Database setup complete"
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Build all services
    docker-compose build
    
    # Start all services
    docker-compose up -d
    
    print_success "Services started successfully"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to start
    sleep 15
    
    # Check backend health
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_success "Backend API is healthy"
    else
        print_warning "Backend API health check failed"
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed"
    fi
    
    # Check AI service health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "AI Service is healthy"
    else
        print_warning "AI Service health check failed"
    fi
}

# Display final information
show_final_info() {
    echo ""
    echo "🎉 Stock Tracker Application Setup Complete!"
    echo ""
    echo "📱 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   AI Service: http://localhost:8000"
    echo ""
    echo "📊 Database:"
    echo "   PostgreSQL: localhost:5432"
    echo "   Redis: localhost:6379"
    echo ""
    echo "🔧 Management Commands:"
    echo "   Start services: docker-compose up -d"
    echo "   Stop services: docker-compose down"
    echo "   View logs: docker-compose logs -f"
    echo "   Restart services: docker-compose restart"
    echo ""
    echo "⚠️  Next Steps:"
    echo "   1. Edit .env file with your API keys"
    echo "   2. Restart services: docker-compose restart"
    echo "   3. Access the application at http://localhost:3000"
    echo ""
}

# Main setup function
main() {
    print_status "Starting Stock Tracker setup..."
    
    check_docker
    check_node
    setup_environment
    install_dependencies
    setup_database
    start_services
    check_health
    show_final_info
}

# Run main function
main "$@" 