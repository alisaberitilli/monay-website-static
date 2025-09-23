# Monay Consumer Wallet - Super App Platform

**The First U.S.-Centric Super App** - Integrating fiat, crypto, and programmable money into one unified platform.

## 🎯 Vision
Monay Consumer Wallet is designed to be a comprehensive super app that combines financial services (payments, wallets, credit) with lifestyle services (travel, commerce, entertainment, healthcare) into one seamless experience, similar to WeChat (China) and Paytm (India) but tailored for U.S. regulatory requirements.

## Project Structure

```
monay-cross-platform/
├── mobile/                 # React Native app (iOS + Android)
├── web/                   # Next.js web application (Port 3003)
├── shared/                # Shared types and utilities
├── docs/                  # Documentation including PRD
│   ├── Monay_Consumer_Wallet_PRD.md
│   └── superApp.png       # UI/UX mockup
└── README.md             # This file
```

## 🏗️ Architecture

### Applications

#### Mobile App (React Native + Expo)
- **Platforms**: iOS and Android
- **Technology**: React Native with Expo
- **Features**:
  - Biometric authentication (Face ID, Touch ID, fingerprint)
  - NFC payments and QR code scanning
  - Push notifications for transactions
  - Apple Pay and Google Pay integration
  - Location-based services for super app features

#### Web App (Next.js) - Port 3003
- **Platform**: Web browsers
- **Technology**: Next.js 14 with TypeScript
- **Port**: **3003** (Consumer Web Application)
- **Features**:
  - Desktop-optimized wallet management
  - Advanced analytics and reporting
  - Multi-account management
  - Enterprise invoice integration
  - Complex transaction workflows

### Backend Integration

**IMPORTANT**: This project shares a common database with Monay Enterprise Wallet and other platform components.

- **Backend API**: `http://localhost:3001` (monay-backend-common)
- **Database**: PostgreSQL on port 5432 (shared across all Monay applications)
- **No separate database**: Uses the existing `monay` database
- **Authentication**: JWT tokens from monay-backend-common

### Port Allocation

| Service | Port | Description |
|---------|------|-------------|
| **monay-backend-common** | 3001 | Shared backend API (single instance) |
| **monay-web (Consumer)** | 3003 | Consumer web application |
| **PostgreSQL** | 5432 | Shared database for all services |
| **Redis** | 6379 | Shared cache and sessions |

**Note**: The consumer web app (3003) is distinct from:
- monay-website (3000) - Marketing site
- monay-admin (3002) - Admin dashboard
- monay-enterprise-wallet (3007) - Enterprise wallet

## 🚀 Core Features

### 1. Financial Services Layer
- **Multi-Currency Wallet**: Fiat (USD) + Stablecoins (USDC, USDT, PYUSD) + Crypto (BTC, ETH, SOL)
- **Virtual/Physical Cards**: Instant issuance with zero-balance start
- **Payment Rails**: ACH, FedNow, RTP, Cards, Stablecoins, Crypto
- **P2P Transfers**: KYC-compliant with Request-to-Pay tagging
- **Programmable Money**: Invoice-first model, tagged stablecoin payments

### 2. Enterprise Integration (Monay-WaaS)
- Receive and pay enterprise invoices in fiat/crypto
- Government disbursements (SNAP, unemployment, tax refunds)
- Utility, insurance, telecom, healthcare bill payments
- B2B2C bridge with full audit trails

### 3. Super App Services
- **Travel & Mobility**: Flights, buses, ride-hailing, tolls, EV charging
- **Hospitality**: Hotels, Airbnb-style stays, restaurants
- **Retail/E-commerce**: In-app shopping, QR merchant payments
- **Healthcare**: Bill pay, pharmacy, HSA/FSA wallet
- **Education**: Tuition, loan repayments, scholarships
- **Entertainment**: Event ticketing, subscriptions, gaming
- **Government Benefits**: Federal and state benefit distribution

### 4. Compliance & Security
- **Monay-ID Integration**: Multi-factor auth, biometrics, passkeys
- **KYC/AML**: SSN, passport, driver's license verification
- **Transaction Monitoring**: Real-time fraud detection
- **Regulatory Compliance**: FinCEN, OCC, PCI DSS, SOC 2

## 🔗 API Integration

### Backend Endpoints
All applications connect to the shared backend:
- **Development**: `http://localhost:3001/api/`
- **Staging**: `https://monay-staging.codiantdev.com/api/`
- **Production**: `https://api.monay.com/api/`

### Database Schema
Shares the same PostgreSQL database with:
- User management tables
- Transaction records
- Wallet balances
- Invoice data
- Compliance logs
- Enterprise configurations

## 🛠️ Getting Started

1. **Prerequisites**:
   ```bash
   # Ensure monay-backend-common is running on port 3001
   # Ensure PostgreSQL is running on port 5432
   # Ensure Redis is running on port 6379
   ```

2. **Clone and setup**:
   ```bash
   cd monay-cross-platform
   npm run setup    # Install dependencies for all projects
   ```

3. **Configure environment**:
   ```bash
   # In web/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:3003

   # In mobile/.env
   API_URL=http://localhost:3001
   ```

4. **Start development**:
   ```bash
   # Start web app on port 3003
   npm run dev:web

   # Start mobile app (separate terminal)
   npm run dev:mobile

   # Or start both
   npm run dev
   ```

## 📱 Development Workflow

1. **Database Changes**: Coordinate with backend team (changes affect all apps)
2. **API Updates**: Update shared types in `/shared/types/api.ts`
3. **Mobile Features**: Develop in `/mobile` for native capabilities
4. **Web Features**: Develop in `/web` for desktop experience
5. **Shared Logic**: Place in `/shared` for code reuse

## 🚢 Deployment

### Mobile
- **iOS**: Deploy via Expo Application Services (EAS) to App Store
- **Android**: Deploy via EAS to Google Play Store
- **Over-the-Air Updates**: Expo updates for non-native changes

### Web (Port 3003 in production)
- **Platform**: Vercel, AWS, or similar
- **Environment Variables**: Set production API endpoints
- **CDN**: CloudFront or similar for static assets

## 📊 Success Metrics (from PRD)
- KYC completion rate > 90%
- Active wallets per month > 100K (Phase 1)
- Average settlement time < 2 seconds (P2P)
- Transaction volume across all rails
- Invoice adoption rate (enterprise)
- Super app service bookings

## 🗺️ Roadmap

### Phase 1 (MVP - U.S. only)
- Wallet + Monay-ID + ACH/FedNow + stablecoins
- Virtual card issuance
- P2P + Request-to-Pay
- Enterprise invoice integration

### Phase 2 (Expansion)
- Multi-crypto support
- Treasury & reconciliation automation
- Super app functions (travel, retail, healthcare)

### Phase 3 (Global)
- Regional compliance (EU PSD3, India UPI, Brazil PIX)
- Cross-border remittances
- Multi-industry invoice adoption

## 📚 Documentation
- [Product Requirements Document](docs/Monay_Consumer_Wallet_PRD.md)
- [UI/UX Mockups](docs/superApp.png)
- [API Documentation](../monay-backend-common/API.md)
- [Database Schema](../monay-backend-common/SCHEMA.md)

## ⚠️ Important Notes
- **Shared Database**: Never create duplicate tables or migrations
- **Port Conflicts**: Always use port 3003 for consumer web
- **Backend API**: All data access through port 3001 only
- **Authentication**: Use shared JWT tokens from backend
- **Compliance**: All features must be KYC/AML compliant