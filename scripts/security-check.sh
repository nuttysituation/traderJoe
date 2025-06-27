#!/bin/bash

# Security Check Script for Stock Tracker App
# Run this before production deployment

set -e

echo "🔒 Running Security Checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

FAILED_CHECKS=0

echo "1. Checking for required tools..."

# Check for required tools
command_exists docker && print_status 0 "Docker installed" || print_status 1 "Docker not found"
command_exists docker-compose && print_status 0 "Docker Compose installed" || print_status 1 "Docker Compose not found"
command_exists openssl && print_status 0 "OpenSSL installed" || print_status 1 "OpenSSL not found"

echo ""
echo "2. Checking environment configuration..."

# Check if production env file exists
if [ -f "env.production" ]; then
    print_status 0 "Production environment file exists"
    
    # Check for hardcoded secrets
    if grep -q "REPLACE_WITH" env.production; then
        print_status 1 "Found placeholder values in production env file"
    else
        print_status 0 "No placeholder values found in production env file"
    fi
    
    # Check for weak passwords
    if grep -q "password\|secret" env.production | grep -v "REPLACE_WITH" | grep -q "123\|admin\|test"; then
        print_status 1 "Found potentially weak passwords in production env file"
    else
        print_status 0 "No obvious weak passwords found"
    fi
else
    print_status 1 "Production environment file not found"
fi

echo ""
echo "3. Checking SSL certificates..."

# Check SSL certificates
if [ -f "ssl/server.crt" ] && [ -f "ssl/server.key" ]; then
    print_status 0 "SSL certificates found"
    
    # Check certificate expiration
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in ssl/server.crt | cut -d= -f2)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        CERT_DATE=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$CERT_EXPIRY" +%s)
    else
        # Linux
        CERT_DATE=$(date -d "$CERT_EXPIRY" +%s)
    fi
    CURRENT_DATE=$(date +%s)
    DAYS_LEFT=$(( (CERT_DATE - CURRENT_DATE) / 86400 ))
    
    if [ $DAYS_LEFT -gt 30 ]; then
        print_status 0 "SSL certificate valid for $DAYS_LEFT days"
    elif [ $DAYS_LEFT -gt 0 ]; then
        print_status 1 "SSL certificate expires in $DAYS_LEFT days"
    else
        print_status 1 "SSL certificate has expired"
    fi
else
    print_status 1 "SSL certificates not found"
fi

echo ""
echo "4. Checking Docker security..."

# Check Dockerfile security
if [ -f "server/Dockerfile.production" ]; then
    print_status 0 "Production Dockerfile found"
    
    # Check for non-root user
    if grep -q "USER nodejs" server/Dockerfile.production; then
        print_status 0 "Dockerfile uses non-root user"
    else
        print_status 1 "Dockerfile should use non-root user"
    fi
    
    # Check for security updates
    if grep -q "apk update && apk upgrade" server/Dockerfile.production; then
        print_status 0 "Dockerfile includes security updates"
    else
        print_status 1 "Dockerfile should include security updates"
    fi
else
    print_status 1 "Production Dockerfile not found"
fi

echo ""
echo "5. Checking npm vulnerabilities..."

# Check for npm vulnerabilities
if [ -d "server" ]; then
    cd server
    if npm audit --audit-level=moderate > /dev/null 2>&1; then
        print_status 0 "No moderate or higher vulnerabilities in server dependencies"
    else
        print_status 1 "Found vulnerabilities in server dependencies"
    fi
    cd ..
else
    print_status 1 "Server directory not found"
fi

if [ -d "client" ]; then
    cd client
    if npm audit --audit-level=moderate > /dev/null 2>&1; then
        print_status 0 "No moderate or higher vulnerabilities in client dependencies"
    else
        print_status 1 "Found vulnerabilities in client dependencies"
    fi
    cd ..
else
    print_status 1 "Client directory not found"
fi

echo ""
echo "6. Checking file permissions..."

# Check for sensitive file permissions
if [ -f "ssl/server.key" ]; then
    PERMS=$(stat -c %a ssl/server.key)
    if [ "$PERMS" = "600" ]; then
        print_status 0 "SSL private key has correct permissions (600)"
    else
        print_status 1 "SSL private key should have permissions 600 (current: $PERMS)"
    fi
fi

echo ""
echo "7. Checking for secrets in code..."

# Check for hardcoded secrets in code
if grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.js" --include="*.py" src/ 2>/dev/null | grep -v "process.env" | grep -v "REPLACE_WITH" | grep -v "TODO" > /dev/null; then
    print_status 1 "Found potential hardcoded secrets in source code"
else
    print_status 0 "No obvious hardcoded secrets found in source code"
fi

echo ""
echo "8. Checking database security..."

# Check database configuration
if [ -f "env.production" ]; then
    if grep -q "DB_PASSWORD" env.production; then
        DB_PASS=$(grep "DB_PASSWORD" env.production | cut -d= -f2)
        if [ "$DB_PASS" != "REPLACE_WITH_STRONG_PASSWORD" ] && [ ${#DB_PASS} -ge 12 ]; then
            print_status 0 "Database password appears to be strong"
        else
            print_status 1 "Database password should be at least 12 characters"
        fi
    fi
fi

echo ""
echo "9. Checking API security..."

# Check for API key configuration
if [ -f "env.production" ]; then
    API_KEYS=$(grep -c "API_KEY" env.production || echo "0")
    if [ $API_KEYS -gt 0 ]; then
        print_status 0 "API keys configured ($API_KEYS found)"
    else
        print_status 1 "No API keys configured"
    fi
fi

echo ""
echo "10. Checking monitoring setup..."

# Check for monitoring configuration
if [ -f "docker-compose.production.yml" ]; then
    if grep -q "prometheus\|grafana" docker-compose.production.yml; then
        print_status 0 "Monitoring services configured"
    else
        print_status 1 "Monitoring services not configured"
    fi
else
    print_status 1 "Production Docker Compose file not found"
fi

echo ""
echo "=== Security Check Summary ==="

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}All security checks passed!${NC}"
    echo "✅ Your application is ready for production deployment."
else
    echo -e "${RED}$FAILED_CHECKS security check(s) failed${NC}"
    echo -e "${YELLOW}Please address the issues above before deploying to production.${NC}"
    exit 1
fi

echo ""
echo "Additional Security Recommendations:"
echo "1. Set up automated vulnerability scanning"
echo "2. Configure log monitoring and alerting"
echo "3. Set up backup and disaster recovery"
echo "4. Implement proper access controls"
echo "5. Regular security audits and penetration testing"
echo "6. Keep all dependencies updated"
echo "7. Monitor for suspicious activities"
echo "8. Implement proper error handling without information disclosure" 