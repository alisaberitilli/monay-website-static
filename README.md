# Monay Platform - Dual-Rail Blockchain Payment System

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
export PORT=3099 && npm test
```

## 📊 Port Allocation Reference

### Production Applications
| Application | Port | Description | Status |
|------------|------|-------------|--------|
| **monay-website** | 3000 | Public Marketing Website | ✅ Active |
| **monay-backend-common** | 3001 | Centralized Backend API | ✅ Running |
| **monay-admin** | 3002 | Admin Dashboard | ✅ Active |
| **monay-web** | 3003 | User Web Application | ✅ Active |
| **monay-mobile-api** | 3004 | Mobile-specific API | 🔄 Reserved |
| **monay-webhook** | 3005 | Webhook Service | 🔄 Reserved |
| **monay-caas-admin** | 3006 | CaaS Admin Portal | 🔄 Reserved |
| **monay-enterprise-wallet** | 3007 | Enterprise Wallet Management | ✅ Running |

### Testing Ports
| Application | Port | Purpose | Command |
|------------|------|---------|---------|
| **Test Backend** | 3099 | Test server instance | `PORT=3099 npm test` |
| **Test Frontend** | 3100 | Test UI server | Testing only |
| **E2E Tests** | 3101 | End-to-end testing | `npm run test:e2e` |

### Infrastructure Services
| Service | Port | Description | Databases |
|---------|------|-------------|-----------|
| **PostgreSQL** | 5432 | Primary Database | monay (prod), monay_test (test) |
| **Redis** | 6379 | Cache & Sessions | DB 0 (prod), DB 1 (test) |
| **WebSocket** | 8080 | Real-time communications | N/A |

## 🏗️ Architecture

### Dual-Rail Blockchain
- **Enterprise Rail**: EVM L2 (Base/Polygon zkEVM) - Port 8545
- **Consumer Rail**: Solana - Port 8899
- **Cross-Rail Bridge**: Treasury operations

### Core Services
- **Business Rule Framework (BRF)**: Unified compliance engine
- **Payment Rails**: TilliPay integration for on/off-ramp
- **KYC/AML**: Persona, Alloy, Onfido integrations

## 🧪 Testing Infrastructure

### Test Status (as of 2025-09-21)
- ✅ **Infrastructure**: Fully operational
- ✅ **Database**: monay_test created and connected
- ✅ **Tests Running**: 53% pass rate (8/15 tests passing)
- ✅ **CI/CD Ready**: Can be integrated into pipelines

### Running Tests

```bash
# Backend tests (avoid port conflicts)
export PORT=3099 && npm test

# Frontend tests
cd monay-caas/monay-enterprise-wallet
npm test

# Specific test suite
npm test -- --testPathPatterns="middleware"

# With coverage
npm test -- --coverage
```

## 📁 Project Structure

```
monay/
├── monay-backend-common/     # Port 3001 - Central API
├── monay-website/            # Port 3000 - Marketing site
├── monay-admin/              # Port 3002 - Admin dashboard
├── monay-cross-platform/
│   ├── web/                  # Port 3003 - User web app
│   ├── ios/                  # iOS mobile app
│   └── android/              # Android mobile app
├── monay-caas/
│   └── monay-enterprise-wallet/ # Port 3007 - Enterprise wallet
└── terraform/                # Infrastructure as code
```

## 🔧 Development Setup

### Prerequisites
- Node.js v20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Environment Variables
```bash
# Backend (.env)
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/monay
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key

# Testing (.env.test)
NODE_ENV=test
PORT=3099
DATABASE_URL=postgresql://user:pass@localhost:5432/monay_test
REDIS_URL=redis://localhost:6379/1
```

### Database Setup
```bash
# Create production database
createdb monay

# Create test database
createdb monay_test

# Run migrations
npm run migration
```

## 📚 Documentation

- [Technical Specification](./TECHNICAL_SPECIFICATION.md)
- [API Documentation](./API_ENDPOINTS_DOCUMENTATION.md)
- [Deployment Guide](./AWS_DEPLOYMENT_PLAN.md)
- [Testing Report](./COMPREHENSIVE_TEST_FIX_REPORT.md)
- [Development Setup](./DEVELOPMENT_ENVIRONMENT_SETUP.md)

## 🚢 Deployment

### Docker
```bash
docker-compose up -d
```

### AWS/GCP
See [AWS_DEPLOYMENT_STRATEGY.md](./AWS_DEPLOYMENT_STRATEGY.md)

## 📞 Support

- Technical Issues: Create an issue in this repository
- Development Questions: Refer to CLAUDE.md for AI assistant context
- Business Inquiries: support@monay.com

## 📄 License

Proprietary - All rights reserved

---

*Last updated: 2025-09-21*
*Platform Version: 1.0.0*