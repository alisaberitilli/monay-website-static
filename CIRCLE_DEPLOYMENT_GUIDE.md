# 🚀 Circle Integration Deployment Guide

**Date**: January 2025
**Component**: Consumer Wallet - Circle Integration
**Status**: Ready for Deployment

---

## 📋 Pre-Deployment Checklist

### Environment Requirements
- [ ] Node.js 20+ installed
- [ ] PostgreSQL 15+ running
- [ ] Redis 7+ running
- [ ] Circle API account created
- [ ] SSL certificates configured (production)

### Circle Account Setup
1. [ ] Sign up at https://app.circle.com
2. [ ] Complete KYB verification
3. [ ] Generate API keys
4. [ ] Configure webhook endpoint
5. [ ] Note Entity ID and Wallet Set ID

---

## 🔧 Deployment Steps

### Step 1: Database Migration

```bash
# Connect to your database
psql -U monay_user -d monay

# Run the migration
\i /path/to/monay-backend-common/migrations/015_circle_wallet_integration.sql

# Verify tables created
\dt *circle*
\dt *bridge*
\dt *routing*
```

Expected output: 12 new tables created

### Step 2: Environment Configuration

```bash
# Copy example configuration
cp .env.circle.example .env

# Edit with your values
vim .env

# Required variables:
CIRCLE_API_KEY=your_api_key
CIRCLE_WEBHOOK_SECRET=your_webhook_secret
CIRCLE_ENTITY_ID=your_entity_id
CIRCLE_ENCRYPTION_KEY=32_char_random_key

# For development/testing:
CIRCLE_USE_MOCK=true  # Enable mock mode
CIRCLE_API_URL=https://api-sandbox.circle.com

# For production:
CIRCLE_USE_MOCK=false
CIRCLE_API_URL=https://api.circle.com
```

### Step 3: Install Dependencies

```bash
cd monay-backend-common

# Install Circle SDK
npm install @circle-fin/circle-sdk

# Verify installation
npm list @circle-fin/circle-sdk
```

### Step 4: Deploy Backend Services

```bash
# For development
npm run dev

# For production with PM2
pm2 start ecosystem.config.js --env production

# Or with Docker
docker-compose up -d
```

### Step 5: Verify Deployment

```bash
# Check service health
curl http://localhost:3001/api/health

# Test Circle integration
node scripts/test-circle-integration.js

# Check logs
tail -f logs/application.log
```

---

## 🧪 Testing Procedures

### 1. Quick Smoke Test

```bash
# Test wallet initialization
curl -X POST http://localhost:3001/api/circle-wallets/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected: Success with wallet IDs
```

### 2. Full Integration Test

```bash
# Run comprehensive test suite
cd monay-backend-common
AUTH_TOKEN=your_token node scripts/test-circle-integration.js

# Expected: All tests pass (100% pass rate)
```

### 3. Load Testing

```bash
# Install k6 if not already installed
brew install k6

# Run load test
k6 run scripts/load-test-circle.js

# Target metrics:
# - Response time p95 < 200ms
# - Error rate < 0.1%
# - 1000+ requests/second
```

---

## 🔄 Rollback Procedures

If issues occur, follow these steps:

### 1. Immediate Rollback

```bash
# Stop services
pm2 stop all

# Revert to previous branch
git checkout main

# Restart services
pm2 start ecosystem.config.js

# Verify services running
pm2 status
```

### 2. Database Rollback

```sql
-- Connect to database
psql -U monay_user -d monay

-- Set all Circle wallets to inactive (soft disable)
UPDATE user_circle_wallets SET status = 'inactive' WHERE status = 'active';

-- Disable bridge transfers
UPDATE wallet_links SET auto_bridge_enabled = false;

-- Note: We don't DROP tables for safety
```

---

## 📊 Monitoring Setup

### 1. Application Monitoring

```bash
# Check application metrics
curl http://localhost:3001/api/metrics

# Key metrics to monitor:
# - circle_api_latency
# - bridge_transfer_count
# - routing_decisions_count
# - webhook_processing_time
```

### 2. Database Monitoring

```sql
-- Check Circle wallet status
SELECT status, COUNT(*)
FROM user_circle_wallets
GROUP BY status;

-- Monitor bridge transfers
SELECT direction, status, COUNT(*)
FROM bridge_transfers
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY direction, status;

-- Check routing decisions
SELECT selected_wallet, COUNT(*)
FROM routing_decisions
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY selected_wallet;
```

### 3. Alert Configuration

```yaml
# alerts.yml
alerts:
  - name: circle_api_error_rate
    condition: error_rate > 1%
    action: notify_oncall

  - name: bridge_transfer_failure
    condition: failed_transfers > 5
    action: page_engineering

  - name: wallet_balance_sync_delay
    condition: sync_delay > 5_minutes
    action: notify_team
```

---

## 🔒 Security Considerations

### 1. API Key Management

```bash
# Never commit API keys
echo "CIRCLE_API_KEY" >> .gitignore

# Use secrets manager in production
aws secretsmanager create-secret \
  --name circle-api-key \
  --secret-string "your-api-key"
```

### 2. Webhook Security

```javascript
// Verify webhook signatures
const signature = req.headers['circle-signature'];
const isValid = verifyCircleWebhook(signature, req.body);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### 3. Rate Limiting

```nginx
# nginx.conf
location /api/circle-wallets {
    limit_req zone=circle_api burst=20 nodelay;
    proxy_pass http://backend;
}
```

---

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### Issue: "Circle wallet not found"
**Solution:**
```bash
# Check if wallet exists
psql -d monay -c "SELECT * FROM user_circle_wallets WHERE user_id = 'USER_ID';"

# Re-initialize if needed
curl -X POST /api/circle-wallets/initialize
```

#### Issue: "Insufficient balance" for bridge
**Solution:**
```bash
# Check both wallet balances
curl /api/circle-wallets/balance

# Ensure sufficient funds in source wallet
```

#### Issue: "Circle API timeout"
**Solution:**
```bash
# Check Circle API status
curl https://status.circle.com

# Enable mock mode temporarily
export CIRCLE_USE_MOCK=true
```

#### Issue: "Webhook not processing"
**Solution:**
```bash
# Verify webhook endpoint
curl -X POST your-domain.com/api/circle-wallets/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check webhook logs
tail -f logs/webhooks.log
```

---

## 📈 Performance Tuning

### 1. Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM get_combined_balance('user-id');

-- Update statistics
ANALYZE user_circle_wallets;
ANALYZE bridge_transfers;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan;
```

### 2. Redis Caching

```javascript
// Cache wallet balances (5 minute TTL)
await redis.setex(
  `balance:${userId}`,
  300,
  JSON.stringify(balance)
);
```

### 3. Connection Pooling

```javascript
// database.js
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 📞 Support Contacts

### Internal Teams
- **Engineering**: circle-integration@monay.com
- **DevOps**: devops@monay.com
- **Security**: security@monay.com

### Circle Support
- **Technical Support**: support@circle.com
- **API Status**: https://status.circle.com
- **Documentation**: https://developers.circle.com

### Escalation Path
1. On-call engineer
2. Team lead
3. Engineering manager
4. CTO

---

## 📝 Post-Deployment Tasks

### Week 1
- [ ] Monitor error rates and performance
- [ ] Gather user feedback
- [ ] Fine-tune routing algorithms
- [ ] Document any issues encountered

### Week 2
- [ ] Performance optimization based on metrics
- [ ] Update documentation with learnings
- [ ] Plan frontend enhancements
- [ ] Security audit review

### Month 1
- [ ] Full performance report
- [ ] Cost analysis (API calls, infrastructure)
- [ ] Feature usage analytics
- [ ] Roadmap for next iterations

---

## ✅ Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | | | |
| DevOps Lead | | | |
| Security Lead | | | |
| Product Manager | | | |

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Next Review**: February 2025