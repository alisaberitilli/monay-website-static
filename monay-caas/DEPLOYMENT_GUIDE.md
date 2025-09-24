# Enterprise Wallet Deployment Guide
## Complete Production Deployment Documentation

---

## Prerequisites

### Required Tools
- Node.js 20.x LTS
- npm 10.x or yarn 1.22+
- Git 2.x
- Docker 24.x (optional)
- Vercel CLI (for Vercel deployment)
- AWS CLI (for AWS deployment)

### Required Accounts
- GitHub account with repo access
- Vercel account (for Vercel deployment)
- AWS account (for AWS deployment)
- Domain registrar account
- SSL certificate provider

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.monay.com
NEXT_PUBLIC_APP_NAME="Monay Enterprise Wallet"
NEXT_PUBLIC_APP_VERSION=1.0.0

# Authentication
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# Database
DATABASE_URL=postgresql://user:password@host:5432/monay

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_DATADOG_APPLICATION_ID=your-datadog-id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your-datadog-token

# Security
IP_WHITELIST=ip1,ip2,ip3
ALLOWED_ORIGINS=https://enterprise-wallet.monay.com
```

---

## Local Development

### 1. Clone Repository
```bash
git clone https://github.com/monay/enterprise-wallet.git
cd enterprise-wallet
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 4. Run Development Server
```bash
npm run dev
# Application available at http://localhost:3007
```

### 5. Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## Production Build

### 1. Build Application
```bash
# Production build
npm run build

# Analyze bundle
npm run analyze
```

### 2. Test Production Build
```bash
# Start production server locally
npm run start
```

### 3. Verify Build
- Check bundle sizes in `.next/analyze/`
- Verify all routes work
- Test critical user flows
- Check performance metrics

---

## Deployment Options

## Option 1: Vercel Deployment (Recommended)

### Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

### Deploy to Staging
```bash
# Deploy to preview
vercel

# Deploy to staging with custom domain
vercel --prod --scope=monay --alias=staging.enterprise-wallet.monay.com
```

### Deploy to Production
```bash
# Deploy to production
vercel --prod

# Or using GitHub integration
git push origin main  # Triggers automatic deployment
```

### Environment Variables in Vercel
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all required environment variables
3. Set different values for Development, Preview, and Production

### Custom Domain Setup
1. Add domain in Vercel Dashboard → Settings → Domains
2. Update DNS records:
   ```
   A Record: @ → 76.76.21.21
   CNAME: www → cname.vercel-dns.com
   ```

---

## Option 2: AWS Deployment

### Prerequisites
```bash
# Install AWS CLI
brew install awscli

# Configure AWS credentials
aws configure
```

### S3 + CloudFront Setup
```bash
# Build and export static site
npm run build
npm run export

# Create S3 bucket
aws s3 mb s3://monay-enterprise-wallet

# Enable static website hosting
aws s3 website s3://monay-enterprise-wallet \
  --index-document index.html \
  --error-document 404.html

# Upload build files
aws s3 sync out/ s3://monay-enterprise-wallet \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name monay-enterprise-wallet.s3.amazonaws.com
```

### EC2 Deployment
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Clone repository
git clone https://github.com/monay/enterprise-wallet.git
cd enterprise-wallet

# Install dependencies and build
npm install
npm run build

# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start npm --name "enterprise-wallet" -- start
pm2 save
pm2 startup
```

### Load Balancer Configuration
1. Create Application Load Balancer in AWS Console
2. Configure target groups pointing to EC2 instances
3. Set up health checks on `/api/health`
4. Configure SSL certificate from ACM

---

## Option 3: Docker Deployment

### Build Docker Image
```bash
# Build image
docker build -t monay-enterprise-wallet:latest .

# Run container
docker run -p 3007:3007 \
  --env-file .env.production \
  monay-enterprise-wallet:latest
```

### Docker Compose
```yaml
version: '3.8'
services:
  enterprise-wallet:
    image: monay-enterprise-wallet:latest
    ports:
      - "3007:3007"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
```

### Deploy to Container Registry
```bash
# Tag image
docker tag monay-enterprise-wallet:latest registry.monay.com/enterprise-wallet:latest

# Push to registry
docker push registry.monay.com/enterprise-wallet:latest
```

---

## Database Migrations

### Run Migrations
```bash
# Production migrations
NODE_ENV=production npm run migration:run

# Rollback if needed
NODE_ENV=production npm run migration:rollback
```

### Database Backup
```bash
# Backup production database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240123.sql
```

---

## Monitoring Setup

### 1. Health Checks
```bash
# API health endpoint
curl https://api.monay.com/health

# Application health
curl https://enterprise-wallet.monay.com/api/health
```

### 2. Uptime Monitoring
- Configure monitoring in UptimeRobot/Pingdom
- Set up alerts for downtime
- Monitor response times

### 3. Error Tracking
```javascript
// Sentry configuration
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

### 4. Performance Monitoring
- Set up Web Vitals tracking
- Configure custom metrics
- Monitor API response times

---

## SSL/TLS Configuration

### Vercel (Automatic)
- SSL certificates are automatically provisioned
- Supports custom domains with automatic renewal

### AWS Certificate Manager
```bash
# Request certificate
aws acm request-certificate \
  --domain-name enterprise-wallet.monay.com \
  --validation-method DNS

# Validate via DNS
# Add CNAME records provided by ACM to your DNS
```

### Let's Encrypt (Self-Hosted)
```bash
# Install Certbot
sudo snap install --classic certbot

# Obtain certificate
sudo certbot certonly \
  --webroot \
  -w /var/www/html \
  -d enterprise-wallet.monay.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## CDN Configuration

### CloudFlare Setup
1. Add site to CloudFlare
2. Update nameservers at registrar
3. Configure caching rules:
   ```
   Cache Level: Standard
   Browser Cache TTL: 1 year
   Edge Cache TTL: 1 month
   ```
4. Enable optimizations:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/3 support
   - Image optimization

### AWS CloudFront
```bash
# Create distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

---

## Rollback Procedures

### Vercel Rollback
```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Git-Based Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard [commit-hash]
git push --force origin main
```

### Database Rollback
```bash
# Rollback last migration
npm run migration:rollback

# Restore from backup
psql $DATABASE_URL < backup-previous.sql
```

---

## Security Checklist

### Pre-Deployment
- [ ] All dependencies updated
- [ ] Security vulnerabilities fixed (`npm audit`)
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Post-Deployment
- [ ] SSL certificate valid
- [ ] Security headers configured
- [ ] CSP policy active
- [ ] HSTS enabled
- [ ] Monitoring active
- [ ] Backup strategy in place
- [ ] Incident response plan ready

---

## Performance Optimization

### Build Optimizations
```bash
# Enable optimizations
NODE_ENV=production npm run build

# Check bundle size
npm run analyze
```

### Runtime Optimizations
- Enable gzip/brotli compression
- Configure cache headers
- Optimize images
- Lazy load components
- Use CDN for static assets

---

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Memory Issues
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Port Conflicts
```bash
# Find process using port
lsof -i :3007

# Kill process
kill -9 [PID]
```

#### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool settings
DATABASE_URL="postgresql://...?connection_limit=10"
```

---

## Maintenance Mode

### Enable Maintenance Mode
```bash
# Create maintenance page
touch public/maintenance.html

# Update Vercel/Nginx config to serve maintenance page
```

### Disable Maintenance Mode
```bash
# Remove maintenance page
rm public/maintenance.html

# Restore normal routing
```

---

## Backup Strategy

### Daily Backups
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > backup-$DATE.sql
aws s3 cp backup-$DATE.sql s3://monay-backups/
```

### Backup Verification
```bash
# Test restore process
pg_dump $DATABASE_URL > test-backup.sql
createdb test_restore
psql test_restore < test-backup.sql
dropdb test_restore
```

---

## Scaling Strategies

### Horizontal Scaling
- Add more instances behind load balancer
- Configure auto-scaling groups
- Set up database read replicas

### Vertical Scaling
- Increase instance sizes
- Optimize database performance
- Add more cache layers

---

## Contact & Support

### Emergency Contacts
- DevOps Team: devops@monay.com
- On-Call Engineer: +1-XXX-XXX-XXXX
- Security Team: security@monay.com

### Documentation
- API Documentation: https://api.monay.com/docs
- Internal Wiki: https://wiki.monay.com
- Runbook: https://runbook.monay.com

### Monitoring Dashboards
- Application: https://monitoring.monay.com/enterprise-wallet
- Infrastructure: https://aws.monay.com/cloudwatch
- Logs: https://logs.monay.com

---

**Document Version**: 1.0
**Last Updated**: 2025-01-23
**Status**: PRODUCTION READY