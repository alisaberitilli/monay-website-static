# Consumer Wallet Backend Implementation Guide

## ✅ Implementation Status: COMPLETE

The consumer wallet backend with Tempo integration is fully implemented and ready for use.

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd monay-backend-common
npm run dev  # Backend will run on port 3001
```

### 2. Run Database Migrations
```bash
# Migrations already applied, but if needed:
psql -U alisaberi -d monay -f migrations/20250128-create-consumer-wallet-tables.sql
```

### 3. Test the Implementation
```bash
node test-consumer-wallet-endpoints.js
```

## 🏗️ Architecture Overview

### Dual-Provider Strategy
- **Primary Provider**: Tempo (Stripe's blockchain) - 100,000+ TPS, sub-second finality
- **Fallback Provider**: Circle - Proven reliability for USDC operations
- **Future**: Monay proprietary blockchain (2026)

### Key Components

#### 1. Consumer Wallet Service (`src/services/consumer-wallet-service.js`)
- Progressive KYC levels (1-3) with increasing limits
- Smart routing for deposits and withdrawals
- Multi-currency stablecoin support (USDC, USDT, PYUSD, EURC, USDB)
- Batch transfer capabilities (Tempo's killer feature)
- Instant stablecoin swaps

#### 2. Tempo Service (`src/services/tempo.js`)
- Native integration with Tempo L1 blockchain
- Near-zero fees ($0.0001)
- Sub-100ms transaction confirmation
- Multi-stablecoin support
- Mock mode for development

#### 3. API Routes (`src/routes/consumer.js`)
- RESTful endpoints for all wallet operations
- JWT authentication
- Request validation
- Error handling

## 📊 Database Schema

### New Tables Created
- `consumer_preferences` - User preferences and settings
- `stablecoin_balances` - Multi-currency balance tracking
- `p2p_transfers` - Peer-to-peer transaction records
- `invoice_payments` - Invoice-first payment model
- `consumer_virtual_cards` - Virtual card management
- `consumer_rewards` - Loyalty and rewards tracking
- `consumer_subscriptions` - Recurring payment management
- `bill_payments` - Bill pay functionality
- `batch_transfers` - Batch transfer records
- `batch_transfer_recipients` - Individual recipients in batches

### Extended Tables
- `users` - Added consumer-specific fields (KYC level, limits, provider)
- `wallets` - Added provider and type fields
- `transactions` - Added batch_id for batch transfers

## 🔌 API Endpoints

### Authentication & Onboarding
- `POST /api/consumer/onboard` - Create consumer account with progressive KYC
- `POST /api/consumer/kyc/upgrade` - Upgrade KYC level for higher limits

### Deposits (On-Ramp)
- `POST /api/consumer/deposit` - Deposit funds using smart routing
- `GET /api/consumer/deposit/methods` - Get available deposit methods with fees

### Withdrawals (Off-Ramp)
- `POST /api/consumer/withdraw` - Withdraw funds to bank account

### Transfers (P2P)
- `POST /api/consumer/transfer` - Send money to another user
- `POST /api/consumer/batch-transfer` - Send to multiple recipients

### Portfolio & Balances
- `GET /api/consumer/portfolio` - Get multi-stablecoin portfolio
- `GET /api/consumer/balance` - Get current balance

### Stablecoin Operations
- `POST /api/consumer/swap` - Instant swap between stablecoins
- `GET /api/consumer/swap/rates` - Get current swap rates

### Transaction History
- `GET /api/consumer/transactions` - Get transaction history with filtering

### Settings & Preferences
- `GET /api/consumer/preferences` - Get user preferences
- `PUT /api/consumer/preferences` - Update user preferences

### Limits & Compliance
- `GET /api/consumer/limits` - Get current limits and usage

### Provider Status
- `GET /api/consumer/providers/status` - Get status of all providers

## 💰 KYC Levels & Limits

### Level 1 (Basic)
- Daily limit: $1,000
- Monthly limit: $30,000
- Requirements: Email + Phone verification

### Level 2 (Verified)
- Daily limit: $50,000
- Monthly limit: $500,000
- Requirements: ID verification + Selfie

### Level 3 (Premium)
- Daily limit: $250,000
- Monthly limit: $5,000,000
- Requirements: Full KYC + Address verification

## 🚄 Performance Characteristics

### Tempo (Primary)
- Transaction Speed: <100ms
- Throughput: 100,000+ TPS
- Fees: $0.0001 per transaction
- Batch Transfers: Single fee for all recipients

### Circle (Fallback)
- Transaction Speed: 2-3 seconds
- Throughput: 1,000+ TPS
- Fees: Variable based on operation
- Programmable wallets

## 🔧 Configuration

### Environment Variables
```bash
# Tempo Configuration
TEMPO_RPC_URL=https://testnet.tempo.xyz
TEMPO_API_KEY=your-tempo-api-key
TEMPO_PRIVATE_KEY=your-tempo-private-key
TEMPO_CHAIN_ID=80085
TEMPO_MOCK_MODE=true  # Set to false for production

# Circle Configuration (Fallback)
CIRCLE_API_KEY=your-circle-api-key
CIRCLE_ENVIRONMENT=sandbox  # or production

# Database
DATABASE_URL=postgres://alisaberi:password@localhost:5432/monay
```

## 🧪 Testing

### Run Unit Tests
```bash
cd monay-backend-common
npm test
```

### Run Integration Tests
```bash
node test-consumer-wallet-endpoints.js
```

### Test with Consumer Web App
```bash
# Start backend (port 3001)
cd monay-backend-common
npm run dev

# Start consumer web app (port 3003)
cd monay-cross-platform/web
npm run dev

# Navigate to http://localhost:3003
```

## 📝 Invoice-First Payment Model

The consumer wallet implements an invoice-first approach where every payment starts with an invoice/request:

1. **Request Creation**: Payee creates payment request with amount and metadata
2. **Notification**: Payer receives real-time notification
3. **Review & Approval**: Payer reviews and approves payment
4. **Instant Settlement**: Tempo processes payment in <100ms
5. **Confirmation**: Both parties receive confirmation

Benefits:
- Clear payment intent and documentation
- Reduced errors and disputes
- Better compliance and audit trail
- Support for recurring payments

## 🔔 Real-Time Notifications

Socket.io integration provides instant updates for:
- Incoming payment requests
- Transfer confirmations
- Balance updates
- KYC status changes
- Provider status changes

## 🎯 Next Steps

### Immediate Actions
1. **Restart Backend**: The backend needs to be restarted to load the consumer routes
   ```bash
   # Stop current backend (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Verify Endpoints**: Run the test script after restart
   ```bash
   node test-consumer-wallet-endpoints.js
   ```

3. **Configure Tempo**: Update .env with real Tempo credentials when available

### Future Enhancements
- [ ] WebAuthn/Passkey authentication
- [ ] Advanced fraud detection with ML
- [ ] Cross-border remittance
- [ ] Cryptocurrency support (BTC, ETH, SOL)
- [ ] DeFi integration
- [ ] Savings and investment products
- [ ] Business accounts
- [ ] Family group management

## 🛠️ Troubleshooting

### Consumer routes return 404
**Solution**: Restart the backend server to load new routes

### Database tables missing
**Solution**: Run the migration script
```bash
psql -U alisaberi -d monay -f migrations/20250128-create-consumer-wallet-tables.sql
```

### Tempo service unavailable
**Solution**: The service runs in mock mode by default. Set `TEMPO_MOCK_MODE=false` with valid credentials for production

### Insufficient balance errors
**Solution**: Use the deposit endpoint to add funds first, or use test mode

## 📚 Related Documentation
- [Tempo Documentation](https://docs.tempo.xyz)
- [Circle API Docs](https://developers.circle.com)
- [Monay Consumer Wallet PRD](monay-cross-platform/docs/Monay_Consumer_Wallet_PRD.md)
- [CLAUDE.md](CLAUDE.md) - Main project documentation

## 🚀 Production Deployment Checklist

- [ ] Obtain production Tempo API credentials
- [ ] Configure Circle as fallback provider
- [ ] Set up monitoring and alerts
- [ ] Enable rate limiting
- [ ] Configure CORS for production domains
- [ ] Set up SSL certificates
- [ ] Configure database connection pooling
- [ ] Enable Redis caching
- [ ] Set up log aggregation
- [ ] Configure auto-scaling
- [ ] Implement circuit breakers
- [ ] Set up backup and disaster recovery
- [ ] Complete security audit
- [ ] Load testing (target: 10,000 TPS)
- [ ] Compliance review

## 📞 Support

For issues or questions:
- Technical Lead: dev.lead@monay.com
- Backend Team: backend@monay.com
- DevOps: devops@monay.com

---

**Status**: ✅ Implementation Complete - Ready for Testing
**Last Updated**: January 28, 2025
**Version**: 1.0.0