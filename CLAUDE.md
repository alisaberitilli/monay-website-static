# Project: Monay - Dual-Rail Blockchain Payment Platform

## Overview
Monay is a comprehensive fintech platform implementing a dual-rail blockchain architecture that combines enterprise-grade stablecoin issuance with consumer-facing payment services. The platform offers Coin-as-a-Service (CaaS) and Wallet-as-a-Service (WaaS) solutions with integrated compliance and payment infrastructure.

## Architecture
- **Enterprise Rail (EVM L2)**: Stablecoin issuance, compliance, and institutional features using ERC-3643 compliant tokens
- **Consumer Rail (Solana)**: Fast payments, consumer transactions with Token-2022 extensions
- **Business Rule Framework (BRF)**: Unified compliance and policy enforcement across all rails
- **Payment Infrastructure**: Cards, POS, ATM, and mobile wallet integration via TilliPay

## Key Requirements

### Technical Specifications
- **Dual-Rail Blockchain**: EVM L2 (Base/Polygon zkEVM) + Solana
- **Smart Contracts**: ERC-3643 for enterprise, Token-2022 for consumer
- **Cross-Rail Integration**: Treasury swap model for seamless value movement
- **Performance**: <1 second consumer payments, <5 seconds enterprise transactions
- **Throughput**: 1,000 TPS (Enterprise), 10,000 TPS (Consumer)
- **Availability**: 99.95% system uptime

### Compliance & Security
- **KYC/AML Integration**: Persona, Alloy, Onfido providers
- **Transaction Monitoring**: Real-time fraud detection and velocity checks
- **Data Security**: AES-256 encryption, HSM key management, PCI-DSS compliance
- **Regulatory**: FinCEN MSB registration, state money transmission licenses

### Payment Features
- **On-Ramp/Off-Ramp**: ACH, wire transfers, card payments via TilliPay
- **Card Issuance**: Virtual and physical cards with Apple/Google Wallet
- **ATM Integration**: Cardless withdrawals via QR/NFC with AllPoint network
- **POS Processing**: Real-time authorization engine with MCC filtering

## Development Stack

### Frontend
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Wallet Integration**: WalletConnect, Phantom

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js/Fastify
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Queue**: Apache Kafka
- **Monitoring**: DataDog/Prometheus

### Blockchain
- **EVM**: Solidity 0.8.20+, Hardhat, Ethers.js v6
- **Solana**: Rust, Anchor Framework, @solana/web3.js

### Infrastructure
- **Cloud**: AWS/GCP multi-region
- **Container**: Docker + Kubernetes
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Secrets**: HashiCorp Vault

## Port Allocation

### Production Ports (Fixed)
| Application | Port | Description |
|------------|------|-------------|
| **monay-website** | 3000 | Public Marketing Website |
| **monay-backend-common** | 3001 | Centralized Backend API |
| **monay-admin** | 3002 | Admin Dashboard (formerly monay-frontend) |
| **monay-web** | 3003 | User Web Application |
| **monay-mobile-api** | 3004 | Mobile-specific API (Reserved) |
| **monay-webhook** | 3005 | Webhook Service (Reserved) |
| **monay-enterprise-wallet** | 3007 | Enterprise Wallet Management |

### Database & Cache
| Service | Port | Description |
|---------|------|-------------|
| **PostgreSQL** | 5432 | Primary Database |
| **Redis** | 6379 | Cache & Sessions |

## 🚀 Active Applications & Services (UPDATED: 2025-08-26)

| Application | Location | Port | Status | Description |
|------------|----------|------|--------|-------------|
| **monay-website** | `/monay-website/` | 3000 | ✅ Active | Public Marketing Website |
| **monay-backend-common** | `/monay-backend-common/` | 3001 | ✅ Active | Centralized Backend API |
| **monay-admin** | `/monay-admin/` | 3002 | ✅ Active | Admin Dashboard (Next.js 14) |
| **monay-cross-platform/web** | `/monay-cross-platform/web/` | 3003 | ✅ Active | End-User Web Application |
| **monay-enterprise-wallet** | `/monay-caas/monay-enterprise-wallet/` | 3007 | ✅ Active | Enterprise Wallet Management (Next.js 14) |
| **monay-ios** | `/monay-cross-platform/ios/` | - | 🔄 Pending | iOS Mobile App |
| **monay-android** | `/monay-cross-platform/android/` | - | 🔄 Pending | Android Mobile App |

### Migration Completed (2025-08-25)
✅ **Backend Migration**: `/monay-wallet/backend/` → `/monay-backend-common/` (Port: 5000 → 3001)
✅ **Admin Migration**: `/monay-wallet/web/monay-frontend-next/` → `/monay-admin/` (Port: 3002)
✅ **Database Updated**: Application configurations updated in PostgreSQL
✅ **API Endpoints**: All frontend apps now point to port 3001
✅ **Archive Created**: Old components backed up to `/monay/old/archive/`

### Application Details

#### 1. Monay-Website (Port 3000)
- Public marketing and onboarding website
- Nudge CRM integration for lead tracking
- Teams integration for meeting scheduling
- Stripe integration for payments

#### 2. Monay-Backend-Common (Port 3001)
- Centralized API for all frontend applications
- Database: PostgreSQL (monay) - ONLY the backend has direct database access
- Cache: Redis
- Auth: JWT-based authentication
- Real-time: Socket.io support
- Note: All frontend apps access data ONLY through this API

#### 3. Monay-Admin (Port 3002)
- Administrative dashboard (v2.0.0)
- User and transaction management
- Compliance monitoring
- Business rules configuration
- Analytics and reporting

#### 4. Monay-Cross-Platform/Web (Port 3003)
- User web application for wallet management
- Transaction history and card management
- Payment processing and account settings
- Mobile responsive design

### 5. Monay-RNiOS
- Native iOS mobile application
- Biometric authentication and NFC support
- Apple Pay and Apple Wallet integration
- Push notifications

### 6. Monay-RNAndroid
- Native Android mobile application
- Fingerprint authentication and NFC support
- Google Pay and Google Wallet integration
- Push notifications

### 7. Monay-Enterprise-Wallet (Port 3007)
- Enterprise wallet management dashboard
- Token creation and management interface
- Treasury operations and cross-rail transfers
- Multi-signature wallet support
- Real-time balance tracking and reporting
- Compliance controls and audit trails
- Integration with dual-rail blockchain (Base EVM L2 + Solana)
- Advanced analytics and transaction monitoring
- Built with Next.js 14, React 18, and TailwindCSS
- Features: Chart.js for analytics, Framer Motion animations, Zustand state management

### 8. Monay-CaaS (Coin-as-a-Service Platform)
Enterprise Coin-as-a-Service (CaaS) platform for deploying and operating compliant tokens with dual-rail blockchain architecture (Base EVM L2 for enterprise, Solana for consumer), integrated treasury management, KYC/AML, and payment rails.

#### Architecture Overview
- **Dual-Rail Design**: Base EVM L2 (Enterprise) + Solana (Consumer)
- **Smart Contracts**: ERC-3643 compliant tokens on Base, Token Extensions on Solana
- **Cross-Rail Operations**: Treasury bridge for seamless value movement
- **Consumer Integration**: Leverages existing wallet at port 3003 + iOS/Android apps
- **Enterprise Features**: Token issuance, supply management, compliance controls

#### Port Allocation
| Application | Port | Description |
|------------|------|-------------|
| **CaaS Admin Dashboard** | 3005 | Platform administration |
| **Enterprise Console** | 3006 | Self-service enterprise portal |
| **Enterprise Wallet** | 3007 | Enterprise wallet management |
| **Consumer Wallet** | 3003 | Existing wallet (unchanged) |
| **Backend API** | 3001 | Extended monay-backend-common |

#### Documentation
- **Implementation Specification**: `monay-caas/CAAS_IMPLEMENTATION_SPEC.md`
- **Requirements Document**: `monay-caas/CAAS_REQUIREMENTS.md`
- **UI/UX Design Guide**: `monay-caas/CAAS_DESIGN_GUIDE.md`
- **Claude Prompts**: `monay-caas/claude.yaml`

#### Key Features
1. **Enterprise Token Management**
   - Token creation wizard with compliance setup
   - Mint/burn operations with multi-sig controls
   - Real-time supply tracking and reporting

2. **Cross-Rail Operations**
   - Atomic swaps between Base and Solana
   - Treasury reconciliation and monitoring
   - Sub-60 second completion time

3. **Compliance Framework**
   - Business Rules Framework (BRF) integration
   - KYB verification for enterprises
   - Real-time transaction monitoring
   - Immutable audit trails

4. **Wallet Integration**
   - Seamless integration with consumer wallet (port 3003)
   - Enterprise-branded token display
   - Mobile app support (iOS/Android)
   - Cross-rail transfer UI

#### Development Setup
```bash
# Clone and install
cd monay-caas
npm install

# Configure environment
export NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
export DATABASE_URL=postgres://user:pass@localhost:5432/monay
export BASE_RPC_URL=https://sepolia.base.org
export SOLANA_RPC_URL=https://api.devnet.solana.com

# Start services
npm run dev:admin     # Port 3005 - Admin Dashboard
npm run dev:console   # Port 3006 - Enterprise Console
npm run dev:api       # Port 3001 - Backend API (if not running)

# Deploy contracts (testnet)
npm run deploy:testnet
```

#### Testing
```bash
# Run all tests
npm test

# Smart contract tests
npm run test:contracts

# Integration tests
npm run test:integration

# Load testing
npm run test:load
```

#### Implementation Timeline
- **Phase 1 (Weeks 1-4)**: Foundation & Database Schema
- **Phase 2 (Weeks 5-8)**: Token Management & Smart Contracts
- **Phase 3 (Weeks 9-12)**: Wallet Integration & Treasury
- **Phase 4 (Weeks 13-16)**: Compliance & BRF
- **Phase 5 (Weeks 17-20)**: Testing & Security Audits
- **Phase 6 (Weeks 21-24)**: Production Deployment

#### Success Metrics
- API response time < 200ms (P95)
- System uptime > 99.95%
- Cross-rail swap < 60 seconds
- 10,000 TPS capability

#### Notes
- Leverages existing Beacon codebase for UI components
- Shares PostgreSQL database with monay-backend-common
- Maintains compatibility with existing consumer wallet and mobile apps
- For production: Enable HSM key management, complete security audit, configure multi-region deployment

## User Types & Permissions

### System Users
- **Platform Admin**: Full system control, unlimited transactions
- **Compliance Officer**: KYC/AML management, transaction monitoring
- **Treasury Manager**: Liquidity management, token minting/burning

### Enterprise Users (CaaS)
- **Enterprise Admin**: Company token deployment, employee wallet management
- **Enterprise Finance**: Payroll processing, vendor payments ($10M daily limit)
- **Enterprise Developer**: Smart contract deployment, API integration

### Consumer Users (WaaS)
- **Premium Consumer**: $250K daily limit, DeFi access, metal card
- **Verified Consumer**: $50K daily limit, full wallet features
- **Basic Consumer**: $1K daily limit, prepaid card access
- **Secondary User**: $500 daily limit, linked to primary account

### Business Users
- **Merchant**: Payment acceptance, POS integration
- **Payment Processor**: Gateway integration, bulk processing

## Code Conventions

### TypeScript/JavaScript
- Use TypeScript for all new code
- Async/await over promises
- Functional components with hooks in React
- Proper error handling with try/catch blocks

### Solidity
- Follow OpenZeppelin standards
- Comprehensive unit tests required
- Gas optimization prioritized
- Formal verification for critical contracts

### API Design
- RESTful endpoints with clear naming
- JWT authentication with short expiration
- Rate limiting on all public endpoints
- Comprehensive request/response validation

### Database
- PostgreSQL for primary data storage
- Redis for caching and sessions
- Proper indexing for performance
- Row-level security where applicable

## Commands

### Development
```bash
# Install dependencies
npm install

# Start development servers
npm run dev        # Port 3000 (website), 3001 (backend), 3002 (admin), 3003 (web app)

# Run tests
npm test
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Database
```bash
# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate

# Seed database
npm run seed
```

### Mobile Development
```bash
# iOS
cd monay-rn-ios
npx expo start

# Android
cd monay-rn-android
npx expo start
```

## Implementation Roadmap

### Phase 0: Foundation (Weeks 1-3)
- Finalize architecture and select EVM L2
- Set up development environment
- Establish vendor partnerships

### Phase 1: Core Development (Weeks 4-9)
- Deploy smart contracts on testnet
- Implement Solana programs
- Build BRF foundation and wallet orchestrator

### Phase 2: Compliance Integration (Weeks 10-14)
- Complete BRF engine
- Integrate KYC/AML providers
- Build admin portal

### Phase 3: Payment Rails (Weeks 15-18)
- TilliPay integration
- Cross-rail swap functionality
- Payment reconciliation

### Phase 4: Card & POS (Weeks 19-23)
- Virtual/physical card issuance
- Mobile wallet integration
- POS transaction processing

### Phase 5: ATM & Advanced Features (Weeks 24-27)
- Cardless ATM withdrawals
- Multi-signature wallets
- Advanced security features

### Phase 6: Testing & Launch (Weeks 28-34)
- Security audits and performance testing
- Pilot launch with beta users
- Production deployment

## Testing Strategy
- **Unit Tests**: 80% coverage minimum
- **Integration Tests**: API endpoints, database operations
- **Smart Contract Tests**: Comprehensive Solidity/Rust testing
- **E2E Tests**: Complete user flows
- **Performance Tests**: Load testing for 10,000 TPS target
- **Security Audits**: Multiple firms for smart contracts

## External Integrations

### Payment Partners
- **TilliPay**: Primary on/off-ramp provider
- **Circle, MoonPay, Wyre**: Secondary payment options
- **Banking**: ACH, FedNow, wire transfers
- **Card Networks**: Visa/Mastercard integration

### KYC/Compliance
- **Persona**: Primary KYC provider
- **Alloy, Onfido**: Alternative providers
- **ComplyAdvantage**: Sanctions screening
- **Transaction Monitoring**: Custom rule engine

### Blockchain Infrastructure
- **EVM RPCs**: Dedicated nodes + Alchemy/Infura backup
- **Solana RPCs**: Dedicated RPC + Helius/QuickNode backup
- **Oracles**: Chainlink for price feeds

## Security Guidelines
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Follow OWASP security best practices
- Regular security audits and penetration testing
- Monitor for suspicious activities

## Support & Resources

### Documentation
- Technical Specification: `TECHNICAL_SPECIFICATION.md`
- Implementation Roadmap: `IMPLEMENTATION_ROADMAP.md`
- Blockchain Dual-Rail Spec: `BLOCKCHAIN_DUAL_RAIL_SPEC.md`
- User Types Documentation: `USER_TYPES_DOCUMENTATION.md`
- Development Setup: `DEVELOPMENT_ENVIRONMENT_SETUP.md`
- **Migration Plan**: `UPDATEDMIGRATIONCODEPLAN.md` - Active backend consolidation and admin reorganization plan

### Team Contacts
- Technical Lead: dev.lead@monay.com
- Compliance: compliance@monay.com
- DevOps: devops.engineer@monay.com
- Support: support@monay.com

## Important Notes
- This is a financial platform requiring strict compliance
- All code changes must be reviewed and tested
- Security and compliance take priority over features
- Performance targets are critical for user experience
- Documentation must be kept up-to-date

## Active Migration Status
- **Migration Plan**: See `UPDATEDMIGRATIONCODEPLAN.md` for ongoing backend consolidation
- **Archive Policy**: All replaced components are archived in `/monay/old/archive/` - nothing is deleted
- **Rollback**: Complete rollback instructions available in archive directory

## Version
- **Platform Version**: 1.0
- **Last Updated**: January 2025
- **Status**: Active Development