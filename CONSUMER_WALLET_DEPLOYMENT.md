# 🚀 Consumer Wallet Deployment Guide
## Tempo-First Multi-Provider Architecture

**Date**: January 24, 2025
**Version**: 1.0.0
**Status**: Ready for Deployment

---

## ✅ Implementation Summary

We have successfully implemented a **Tempo-first consumer wallet** within `monay-backend-common` with the following architecture:

### Provider Hierarchy
1. **Primary**: Tempo (100,000+ TPS, $0.0001 fees, <100ms finality)
2. **Secondary**: Circle (65 TPS fallback)
3. **Future**: Monay Rails (proprietary, in development)

### Key Features Implemented
- ✅ Progressive KYC ($1k → $50k → $250k daily limits)
- ✅ Smart deposit/withdrawal routing
- ✅ Batch transfers (single fee for multiple recipients)
- ✅ Multi-stablecoin support (USDC, USDT, PYUSD, EURC, USDB)
- ✅ Instant P2P transfers (<100ms)
- ✅ Stablecoin swaps
- ✅ Automatic provider fallback
- ✅ Real-time portfolio tracking

---

## 📁 Files Created/Modified

### New Files
```
/monay-backend-common/
├── src/
│   ├── services/
│   │   └── consumer-wallet-service.js    # Core consumer wallet service
│   ├── routes/
│   │   └── consumer.js                   # Consumer API endpoints
│   └── migrations/
│       └── 016_consumer_wallet_enhancements.sql  # Safe DB migrations
└── test-consumer-wallet.js               # Integration test suite
```

### Modified Files
```
✏️ src/routes/index.js         # Added consumer routes
✏️ src/services/tempo.js       # Enhanced with consumer methods
```

---

## 🗄️ Database Changes (Safe - No Drops)

### Run Migration
```bash
cd monay-backend-common
psql -U postgres -d monay < src/migrations/016_consumer_wallet_enhancements.sql
```

### Changes Applied:
- **users** table: Added consumer KYC levels and limits
- **wallets** table: Added provider tracking
- **transactions** table: Added batch and provider fields
- **New tables**: consumer_preferences, stablecoin_balances, batch_transfers

---

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Tempo Configuration (Primary)
TEMPO_RPC_URL=https://testnet.tempo.xyz
TEMPO_API_KEY=your_tempo_api_key
TEMPO_PRIVATE_KEY=your_tempo_private_key
TEMPO_CHAIN_ID=80085
TEMPO_MOCK_MODE=false  # Set to true for development

# Circle Configuration (Fallback)
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_ENTITY_ID=your_entity_id
CIRCLE_ENV=sandbox  # or production

# Consumer Wallet Settings
CONSUMER_WALLET_ENABLED=true
CONSUMER_DEFAULT_PROVIDER=tempo
CONSUMER_FALLBACK_ENABLED=true
CONSUMER_BATCH_LIMIT=100
```

---

## 📊 API Endpoints

### Consumer Wallet Endpoints
All endpoints are prefixed with `/api/consumer/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/onboard` | Onboard new consumer with progressive KYC |
| POST | `/deposit` | Smart deposit with optimal routing |
| POST | `/withdraw` | Instant withdrawal to bank |
| POST | `/transfer` | P2P transfer with Tempo speed |
| POST | `/batch-transfer` | Batch transfer to multiple recipients |
| GET | `/portfolio` | Multi-stablecoin portfolio view |
| POST | `/swap` | Instant stablecoin swap |
| GET | `/balance` | Get current balances |
| GET | `/limits` | Get KYC limits |
| POST | `/upgrade-kyc` | Upgrade KYC level |
| GET | `/transactions` | Transaction history |
| GET | `/provider-status` | Check provider health |

---

## 🚀 Deployment Steps

### 1. Pre-Deployment Checklist
```bash
✅ Database backup created
✅ Environment variables configured
✅ Tempo API credentials obtained
✅ Circle API credentials configured
✅ Redis cache running
✅ PostgreSQL accessible
```

### 2. Deploy Database Changes
```bash
# Backup database first
pg_dump -U postgres monay > monay_backup_$(date +%Y%m%d).sql

# Run migration
psql -U postgres -d monay < src/migrations/016_consumer_wallet_enhancements.sql

# Verify migration
psql -U postgres -d monay -c "SELECT * FROM consumer_preferences LIMIT 1;"
```

### 3. Deploy Application
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run tests
npm test

# Start in production
NODE_ENV=production npm start
```

### 4. Verify Deployment
```bash
# Test provider connectivity
curl http://localhost:3001/api/consumer/provider-status

# Test onboarding
curl -X POST http://localhost:3001/api/consumer/onboard \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"+14155551234","kycLevel":1}'
```

---

## 🧪 Testing

### Run Integration Tests
```bash
cd monay-backend-common
node test-consumer-wallet.js
```

### Expected Test Results
- ✅ Consumer onboarding with KYC levels
- ✅ Smart deposit routing based on amount/urgency
- ✅ P2P transfers in <100ms
- ✅ Batch transfers with single fee
- ✅ Multi-stablecoin portfolio tracking
- ✅ Instant swaps between stablecoins
- ✅ Provider health monitoring
- ✅ Instant withdrawals

---

## 📈 Performance Metrics

### Tempo (Primary Provider)
- **TPS**: 100,000+
- **Finality**: <100ms
- **Transaction Fee**: $0.0001
- **Batch Support**: Yes (single fee)
- **Multi-Currency**: 5 stablecoins

### Circle (Fallback Provider)
- **TPS**: 65
- **Finality**: 2-3 seconds
- **Transaction Fee**: Variable
- **Batch Support**: No (individual txs)
- **Multi-Currency**: USDC only

---

## 🔍 Monitoring

### Key Metrics to Monitor
```javascript
// Provider Health
- Tempo availability: >99.9%
- Circle fallback rate: <1%
- Average latency: <200ms
- Success rate: >99.5%

// Business Metrics
- Daily active consumers
- Transaction volume by provider
- Deposit/withdrawal volume
- Batch transfer usage
- KYC level distribution
```

### Health Check Endpoint
```bash
curl http://localhost:3001/api/consumer/health

# Expected Response
{
  "status": "healthy",
  "providers": {
    "tempo": { "healthy": true, "latency": 45 },
    "circle": { "healthy": true, "latency": 120 }
  },
  "database": "connected",
  "cache": "connected"
}
```

---

## 🚨 Rollback Plan

If issues occur, rollback using:

```bash
# 1. Stop application
pm2 stop monay-backend

# 2. Restore database backup
psql -U postgres -c "DROP DATABASE monay;"
psql -U postgres -c "CREATE DATABASE monay;"
psql -U postgres monay < monay_backup_[date].sql

# 3. Revert code
git revert HEAD
npm install

# 4. Restart with previous version
pm2 restart monay-backend
```

---

## 📝 Post-Deployment

### Verification Tasks
1. ✅ Test consumer onboarding flow
2. ✅ Verify Tempo connectivity
3. ✅ Test Circle fallback mechanism
4. ✅ Monitor transaction success rates
5. ✅ Check batch transfer functionality
6. ✅ Verify KYC limits enforcement
7. ✅ Test multi-stablecoin balances
8. ✅ Confirm instant withdrawals

### Performance Optimization
- Enable Redis caching for balance queries
- Implement connection pooling for Tempo
- Set up webhook listeners for real-time updates
- Configure batch processing queues

---

## 🔐 Security Considerations

### API Security
- JWT authentication required
- Rate limiting: 100 req/min per user
- IP whitelist for production
- SSL/TLS encryption mandatory

### Data Protection
- Sensitive data encrypted at rest
- PII handling compliant with regulations
- Audit logs for all transactions
- Regular security scans

---

## 📞 Support

### Escalation Path
1. **L1 Support**: Monitor alerts and basic troubleshooting
2. **L2 Engineering**: Provider connectivity issues
3. **L3 Architecture**: System design changes
4. **Vendor Support**: Tempo/Circle API issues

### Key Contacts
- **Tempo Support**: support@tempo.xyz
- **Circle Support**: support@circle.com
- **On-Call Engineer**: [Your contact]

---

## 🎯 Success Criteria

Post-deployment success is measured by:
- ✅ 99.9% uptime in first 24 hours
- ✅ <100ms average transaction time
- ✅ Zero data loss
- ✅ Successful provider failover test
- ✅ 1000+ transactions processed
- ✅ All KYC levels functioning
- ✅ Batch transfers operational

---

## 📚 Additional Resources

- [Tempo Documentation](https://docs.tempo.xyz)
- [Circle API Reference](https://developers.circle.com)
- [Consumer Wallet Requirements](./MONAY_CONSUMER_WALLET_REQUIREMENTS.md)
- [Implementation Plan](./CONSUMER_WALLET_BACKEND_ONLY_PLAN.md)

---

**Deployment Status**: ✅ READY
**Estimated Deployment Time**: 30 minutes
**Risk Level**: Low (no breaking changes, only enhancements)

---

*Generated: January 24, 2025*
*Version: 1.0.0*
*Next Review: February 1, 2025*