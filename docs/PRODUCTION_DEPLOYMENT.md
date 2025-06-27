# Production Deployment Guide

## 🔒 Security-First Production Deployment

This guide covers the secure deployment of the Stock Tracker application to production.

## Prerequisites

- Docker and Docker Compose installed
- SSL certificates (Let's Encrypt or commercial)
- Domain name configured
- Production server with sufficient resources
- Database backup strategy

## 1. Environment Setup

### 1.1 Generate Strong Secrets

```bash
# Generate JWT secret (64 characters)
openssl rand -base64 48

# Generate encryption key (32 characters)
openssl rand -base64 24

# Generate database password (16 characters)
openssl rand -base64 12

# Generate Redis password (16 characters)
openssl rand -base64 12
```

### 1.2 Configure Production Environment

1. Copy `env.production` to `.env.production`
2. Replace all `REPLACE_WITH_*` placeholders with real values
3. Set strong passwords and secrets
4. Configure real API keys for data sources

```bash
cp env.production .env.production
nano .env.production
```

### 1.3 SSL Certificate Setup

For Let's Encrypt (recommended):

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/server.key

# Set proper permissions
sudo chmod 600 ssl/server.key
sudo chown $USER:$USER ssl/server.key
```

## 2. Security Validation

### 2.1 Run Security Checks

```bash
./scripts/security-check.sh
```

This script will check:
- Environment configuration
- SSL certificates
- Docker security
- NPM vulnerabilities
- File permissions
- Hardcoded secrets
- Database security
- API configuration
- Monitoring setup

### 2.2 Manual Security Review

1. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Restrict network access
   - Regular backups

2. **API Security**
   - Use real API keys
   - Implement rate limiting
   - Monitor API usage
   - Rotate keys regularly

3. **Network Security**
   - Configure firewall rules
   - Use VPN for admin access
   - Monitor network traffic
   - Regular security updates

## 3. Production Deployment

### 3.1 Build and Deploy

```bash
# Build production images
docker-compose -f docker-compose.production.yml build

# Deploy with production configuration
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps
```

### 3.2 Database Migration

```bash
# Run database migrations
docker-compose -f docker-compose.production.yml exec backend npm run migrate

# Seed initial data (if needed)
docker-compose -f docker-compose.production.yml exec backend npm run seed
```

### 3.3 Health Checks

```bash
# Check all services
curl -k https://yourdomain.com/health

# Check API endpoints
curl -k https://yourdomain.com/api/dashboard/stats

# Check monitoring
curl -k https://yourdomain.com:9090/-/healthy  # Prometheus
curl -k https://yourdomain.com:3000/api/health # Grafana
```

## 4. Monitoring and Alerting

### 4.1 Prometheus Configuration

Create `monitoring/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'stock-tracker-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'

  - job_name: 'stock-tracker-ai'
    static_configs:
      - targets: ['ai-service:5000']
    metrics_path: '/metrics'

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
```

### 4.2 Grafana Dashboards

Set up dashboards for:
- Application performance
- Error rates
- API response times
- Database performance
- System resources

### 4.3 Log Monitoring

Configure log aggregation:
- Application logs
- Access logs
- Error logs
- Security events

## 5. Backup Strategy

### 5.1 Database Backups

```bash
# Create backup script
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"

mkdir -p $BACKUP_DIR

docker-compose -f docker-compose.production.yml exec -T postgres \
  pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x scripts/backup.sh
```

### 5.2 Automated Backups

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/app/scripts/backup.sh

# Weekly full backup
0 2 * * 0 /path/to/app/scripts/full-backup.sh
```

## 6. Security Maintenance

### 6.1 Regular Updates

```bash
# Update base images
docker-compose -f docker-compose.production.yml pull

# Update dependencies
docker-compose -f docker-compose.production.yml exec backend npm audit fix
docker-compose -f docker-compose.production.yml exec client npm audit fix

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```

### 6.2 Security Monitoring

1. **Vulnerability Scanning**
   - Regular dependency audits
   - Container image scanning
   - Infrastructure scanning

2. **Access Monitoring**
   - Failed login attempts
   - Unusual API usage
   - Database access patterns

3. **Performance Monitoring**
   - Response time alerts
   - Error rate thresholds
   - Resource utilization

### 6.3 Incident Response

1. **Security Incident Plan**
   - Contact information
   - Escalation procedures
   - Communication plan

2. **Recovery Procedures**
   - Service restoration
   - Data recovery
   - Security remediation

## 7. Compliance and Auditing

### 7.1 Data Protection

- GDPR compliance (if applicable)
- Data retention policies
- User consent management
- Data encryption at rest and in transit

### 7.2 Audit Logging

- All API requests logged
- Database access logged
- Admin actions logged
- Security events logged

### 7.3 Regular Audits

- Monthly security reviews
- Quarterly penetration testing
- Annual compliance audits
- Continuous monitoring

## 8. Performance Optimization

### 8.1 Caching Strategy

- Redis for session storage
- API response caching
- Static asset caching
- Database query caching

### 8.2 Load Balancing

- Multiple backend instances
- Database read replicas
- CDN for static assets
- Geographic distribution

## 9. Troubleshooting

### 9.1 Common Issues

1. **SSL Certificate Expiry**
   ```bash
   # Renew Let's Encrypt certificates
   sudo certbot renew
   sudo systemctl reload nginx
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose -f docker-compose.production.yml exec postgres pg_isready
   ```

3. **Memory Issues**
   ```bash
   # Monitor resource usage
   docker stats
   ```

### 9.2 Emergency Procedures

1. **Service Outage**
   - Check service logs
   - Restart affected services
   - Rollback if necessary

2. **Security Breach**
   - Isolate affected systems
   - Preserve evidence
   - Notify stakeholders
   - Implement fixes

## 10. Support and Maintenance

### 10.1 Documentation

- Keep deployment docs updated
- Document configuration changes
- Maintain runbooks
- Update security procedures

### 10.2 Team Training

- Security awareness training
- Incident response drills
- Tool proficiency
- Best practices

---

## Quick Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Security checks passed
- [ ] Database migrated
- [ ] Services deployed
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Team notified
- [ ] Documentation updated

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular monitoring, updates, and audits are essential for maintaining a secure production environment. 