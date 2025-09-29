# Monay Project Inventory
## Complete Directory Structure Analysis
**Generated**: September 26, 2025

---

## 📊 Service Status Summary

| Service | Port | Status | Location |
|---------|------|--------|----------|
| **monay-backend-common** | 3001 | ✅ Running | `/monay-backend-common` |
| **monay-admin** | 3002 | ✅ Running | `/monay-admin` |
| **monay-consumer-wallet** | 3003 | ✅ Running | `/monay-cross-platform/web` |
| **monay-enterprise-wallet** | 3007 | ✅ Running | `/monay-caas/monay-enterprise-wallet` |

---

## 1. 🔧 MONAY-BACKEND-COMMON
**Path**: `/Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common`
**Port**: 3001
**Type**: Node.js ES Modules Backend API

### Directory Structure:
```
monay-backend-common/
├── src/
│   ├── bootstrap.js            # Application initialization
│   ├── index.js               # Entry point
│   ├── config/                # Configuration files
│   │   └── index.js
│   ├── controllers/           # API Controllers (30+ files)
│   │   ├── account-controller.js
│   │   ├── admin-controller.js
│   │   ├── bank-controller.js
│   │   ├── card-controller.js
│   │   ├── monay-fiat-controller.js
│   │   ├── payment-request-controller.js
│   │   ├── transaction-controller.js
│   │   ├── user-controller.js
│   │   ├── wallet-controller.js
│   │   └── ... (30+ controllers)
│   ├── language/              # Localization
│   │   ├── index.js
│   │   └── en.js
│   ├── middleware/            # Express middleware
│   │   ├── audit.js
│   │   ├── mfa.js
│   │   └── tenant-isolation.js
│   ├── middlewares/           # Additional middleware
│   │   ├── auth-exports.js
│   │   ├── account-middleware.js
│   │   └── ... (10+ middleware files)
│   ├── migrations/            # Database migrations
│   │   └── ... (20+ SQL files)
│   ├── models/               # Sequelize models
│   │   └── index.js
│   ├── repositories/         # Data access layer
│   │   ├── account-repository.js
│   │   ├── user-repository.js
│   │   ├── transaction-repository.js
│   │   └── ... (15+ repositories)
│   ├── routes/              # API routes (60+ files)
│   │   ├── account.js
│   │   ├── auth.js
│   │   ├── bank.js
│   │   ├── card.js
│   │   ├── circle.js
│   │   ├── consumer.js
│   │   ├── payment-request.js
│   │   ├── transaction.js
│   │   ├── wallet.js
│   │   └── ... (60+ route files)
│   ├── services/            # Business logic (50+ files)
│   │   ├── audit-log.js
│   │   ├── circle.js
│   │   ├── consumer-wallet-service.js
│   │   ├── email.js
│   │   ├── emergency-disbursement-system.js
│   │   ├── monay-fiat.js
│   │   ├── payment-gateway.js
│   │   ├── tempo.js
│   │   ├── stripe-payment.js
│   │   └── ... (50+ service files)
│   ├── tests/              # Test files
│   │   └── tillipay.test.js
│   └── validations/        # Input validation
│       └── index.js
├── migrations/            # Root-level migrations
│   ├── DATABASE_RECOVERY_SCRIPT.sh
│   └── CONSOLIDATED_MONAY_SCHEMA.sql
├── public/               # Static assets
├── scripts/             # Utility scripts
├── package.json
├── package-lock.json
└── .env.example
```

### Key Features:
- ES Modules (native Node.js support)
- PostgreSQL with Sequelize ORM
- Redis for caching
- JWT authentication
- Socket.io for real-time
- Comprehensive API routes (60+)
- Multi-provider payment integration (Circle, Tempo, Stripe)

---

## 2. 🎨 MONAY-ADMIN
**Path**: `/Users/alisaberi/Data/0ProductBuild/monay/monay-admin`
**Port**: 3002
**Type**: Next.js 15 Admin Dashboard

### Directory Structure:
```
monay-admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   └── (dashboard)/
│   │       ├── alerts/
│   │       ├── analytics/
│   │       ├── audit/
│   │       ├── circle-management/
│   │       ├── compliance/
│   │       ├── monitoring/
│   │       ├── platform/
│   │       ├── providers/
│   │       ├── tempo-management/
│   │       ├── transactions/
│   │       ├── users-management/
│   │       └── layout.tsx
│   ├── components/
│   │   ├── super-admin/
│   │   └── ui/
│   │       ├── alert.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── progress.tsx
│   │       └── use-toast.ts
│   ├── lib/
│   ├── services/
│   │   └── super-admin.service.ts
│   └── styles/
├── public/
├── examples/
│   ├── comprehensive-comparison.md
│   ├── live-demo-setup.md
│   └── ui-comparison.md
├── next.config.js
├── package.json
├── tsconfig.json
└── .env.local
```

### Key Features:
- Super Admin Dashboard
- User management across all platforms
- Transaction monitoring
- Compliance dashboard
- Provider management (Circle, Tempo)
- Real-time analytics
- Audit logging

---

## 3. 💼 MONAY-ENTERPRISE-WALLET
**Path**: `/Users/alisaberi/Data/0ProductBuild/monay/monay-caas/monay-enterprise-wallet`
**Port**: 3007
**Type**: Next.js 14 Enterprise Wallet Dashboard

### Directory Structure:
```
monay-enterprise-wallet/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── billing/
│   │   │   ├── business-rules/
│   │   │   ├── capital-markets/
│   │   │   ├── enterprise-hierarchy/
│   │   │   ├── exports/
│   │   │   ├── groups/
│   │   │   ├── organizations/
│   │   │   ├── provider-comparison/
│   │   │   ├── rbac/
│   │   │   ├── tempo-operations/
│   │   │   ├── transactions/
│   │   │   ├── treasury/
│   │   │   ├── usdc-monitor/
│   │   │   ├── usdc-operations/
│   │   │   ├── webhooks/
│   │   │   └── page.tsx
│   │   ├── icon.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── BillingDashboard.tsx
│   │   ├── BusinessRulesFramework.tsx
│   │   ├── CapitalMarketsRulesManagement.tsx
│   │   ├── ProviderComparison.tsx
│   │   ├── TempoOperations.tsx
│   │   ├── TransactionsManagement.tsx
│   │   ├── layout/
│   │   │   └── Sidebar.tsx
│   │   └── ui/
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── use-toast.ts
│   ├── stores/
│   │   ├── useBillingStore.ts
│   │   └── useTenantStore.ts
│   └── lib/
├── public/
│   ├── favicon.png
│   └── monay-icon.svg
├── next.config.js
├── package.json
├── tsconfig.json
└── .env.local
```

### Key Features:
- Enterprise token management
- Treasury operations
- Business rules configuration
- Capital markets compliance
- Multi-provider comparison
- RBAC management
- Billing analytics
- 30+ dashboard pages

---

## 4. 📱 MONAY-CONSUMER-WALLET
**Path**: `/Users/alisaberi/Data/0ProductBuild/monay/monay-cross-platform/web`
**Port**: 3003
**Type**: Next.js 15 Consumer Super App

### Directory Structure:
```
monay-cross-platform/
└── web/
    ├── app/
    │   ├── accounts/
    │   ├── add-money/
    │   ├── analytics/
    │   ├── api/
    │   │   └── auth/
    │   ├── auth/
    │   ├── billing/
    │   ├── cards/
    │   ├── dashboard/
    │   ├── notifications/
    │   ├── p2p-transfer/
    │   ├── payment/
    │   ├── profile/
    │   ├── rewards/
    │   ├── send-money/
    │   ├── settings/
    │   ├── transactions/
    │   ├── wallet/
    │   └── layout.tsx
    ├── components/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── layout/
    │   └── ui/
    ├── contexts/
    │   └── auth-context.tsx
    ├── database/
    ├── hooks/
    ├── lib/
    │   ├── auth/
    │   ├── database/
    │   └── utils/
    ├── public/
    ├── scripts/
    ├── src/
    ├── styles/
    ├── monay.config.js
    ├── next.config.ts
    ├── package.json
    ├── tsconfig.json
    └── .env.local
```

### Key Features:
- Consumer super app (First US-centric)
- Multi-currency wallet (Fiat + Stablecoins + Crypto)
- P2P transfers
- Virtual/physical cards
- Rewards and cashback
- Bill payments
- Investment features
- Government benefits integration

---

## 📁 Additional Project Folders

### Support Directories:
```
monay/
├── monay-data/              # Database schemas and migrations
├── monay-website/           # Marketing website (port 3000)
├── monay-wallet/            # Legacy wallet components
├── terraform/               # Infrastructure as code
├── email-templates/         # Email templates
├── public/                  # Shared public assets
├── backups/                 # Database backups
└── docs/                    # Documentation
```

---

## 🔗 Service Dependencies

### Database:
- **PostgreSQL** (port 5432): Single `monay` database shared by all services
- **Redis** (port 6379): Caching and sessions

### External Services:
- **Circle API**: USDC operations
- **Tempo API**: High-speed stablecoin transactions
- **Stripe**: Payments and card issuing
- **TilliPay**: On/off ramp
- **KYC Providers**: Persona, Alloy, Onfido

---

## 📝 Environment Variables

Each application requires:
- `NEXT_PUBLIC_API_URL=http://localhost:3001`
- `DATABASE_URL=postgresql://user@localhost:5432/monay`
- `REDIS_URL=redis://localhost:6379`
- Application-specific keys and secrets

---

## 🚀 Quick Start Commands

```bash
# Start all services
npm run dev:all

# Individual services
cd monay-backend-common && npm start          # Port 3001
cd monay-admin && npm run dev                 # Port 3002
cd monay-cross-platform/web && npm run dev    # Port 3003
cd monay-caas/monay-enterprise-wallet && npm run dev  # Port 3007
```

---

*Last Updated: September 26, 2025*
*Status: All services operational*