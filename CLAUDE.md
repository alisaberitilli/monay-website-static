# Project: Monay - Dual-Rail Blockchain Payment Platform

## 🛑 CRITICAL DATABASE SAFETY RULES - ABSOLUTELY FORBIDDEN ACTIONS 🛑

### ⚠️ NEVER EXECUTE THESE COMMANDS - DATABASE INTEGRITY IS PARAMOUNT ⚠️
1. **DROP** - NEVER use DROP TABLE, DROP DATABASE, DROP SCHEMA, DROP INDEX, DROP COLUMN
2. **DELETE** - NEVER use DELETE FROM without WHERE clause, avoid DELETE operations
3. **TRUNCATE** - NEVER use TRUNCATE TABLE
4. **PURGE** - NEVER use any PURGE operations
5. **ALTER DROP** - NEVER use ALTER TABLE ... DROP COLUMN
6. **CASCADE DELETE** - NEVER use CASCADE DELETE operations

### ✅ DATABASE SAFETY PRACTICES
- **SINGLE DATABASE**: All applications (Admin, CaaS, Consumer Wallet) share ONE 'monay' PostgreSQL database
- **NO CHANGES**: Database schema is FROZEN - no structural changes allowed
- **READ-ONLY PREFERENCE**: Prefer SELECT queries over modifications
- **BACKUP FIRST**: Always backup before any data operations
- **USE TRANSACTIONS**: Wrap modifications in transactions with ROLLBACK capability
- **TEST ENVIRONMENT**: Test all queries in development first
- **RECOVERY SCRIPT**: Use `/monay-backend-common/migrations/DATABASE_RECOVERY_SCRIPT.sh` if needed

## 🔧 CRITICAL DEVELOPMENT PRINCIPLES

### ⚠️ NEVER REMOVE FUNCTIONALITY TO PASS TESTS ⚠️
**Established: January 2025**

1. **FIX, DON'T REMOVE**: When encountering errors, we ALWAYS fix the underlying issue rather than commenting out or removing functionality
2. **DATABASE ALIGNMENT**: If a model field doesn't match the database, we either:
   - Add the missing column to the database (preferred for new features)
   - Map the field to the correct database column name
   - Make it a VIRTUAL field if it's computed/derived
3. **NO SHORTCUTS**: We explicitly fix errors and move forward - no temporary workarounds
4. **MAINTAIN FEATURES**: All existing functionality must be preserved and working
5. **DOCUMENT FIXES**: All fixes should be properly documented in code comments and commit messages

**Example**: When the `mpin` field was missing from the database, we added the column rather than removing the field from the model.

### 🎨 MANDATORY ICON REQUIREMENTS - USE MODERN LUCIDE ICONS
**Established: January 2025**

#### ⚠️ CRITICAL: ALWAYS USE LUCIDE ICONS - NO SHORTCUTS ⚠️
1. **EXCLUSIVE ICON LIBRARY**: Use ONLY Lucide icons via our optimized @monay/icons library - NO other icon libraries
2. **MODERN & CONTEMPORARY**: Always select modern, clean, contemporary icon designs
3. **PERFORMANCE FIRST**: Use local SVG components (@monay/icons) for optimal performance
4. **NO SHORTCUTS**: Never use placeholder text, emojis, or alternative icons as substitutes
5. **CONSISTENCY**: Maintain consistent icon usage across all applications

#### Icon Library Location & Setup:
- **Library Location**: `/shared/icons/` - Optimized local SVG components (75+ icons)
- **Package Name**: `@monay/icons`
- **Installation**: Add to package.json: `"@monay/icons": "file:../../shared/icons"`
- **Performance**: 85% smaller than lucide-react, full tree-shaking support

#### Icon Implementation Standards:
- **Import Method**: Use `import { IconName } from '@monay/icons'` (optimized local SVGs from `/shared/icons/`)
- **Fallback**: If @monay/icons not available, use `import { IconName } from 'lucide-react'` (temporary only)
- **Size Standards**: Default 24px, Small 16px, Large 32px
- **Color**: Use `currentColor` for automatic theme adaptation
- **Stroke Width**: Default 2px for consistency

#### Forbidden Practices:
- ❌ **NO** FontAwesome, Material Icons, Heroicons, or other libraries
- ❌ **NO** inline SVG code unless creating new icon components
- ❌ **NO** icon fonts or bitmap images as icons
- ❌ **NO** mixing different icon libraries
- ❌ **NO** text placeholders like "[icon]" or "•" as icons

#### Example Usage:
```typescript
// ✅ CORRECT - Using optimized local SVG icons
import { Shield, Users, TrendingUp } from '@monay/icons';

// ✅ CORRECT - Consistent sizing and styling
<Shield size={24} className="text-blue-500" />
<Users className="w-5 h-5" />

// ❌ WRONG - Never do this
import { FaShield } from 'react-icons/fa';  // Wrong library
<span>🛡️</span>  // No emojis as icons
<div>[user icon]</div>  // No placeholders
```

**Remember**: Icons are a critical part of the UI/UX. Never take shortcuts. Always use proper Lucide icons to maintain professional quality and performance.

### 🎯 Monay-Admin Role
**Monay-Admin (Port 3002)** is the SUPER ADMIN MANAGER that controls:
- **Monay-CaaS**: Enterprise Coin-as-a-Service platform management
- **Monay Consumer Wallet**: Consumer wallet and super app management
- **Shared Infrastructure**: Single backend (3001) and database for all apps

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

### 🚨 CRITICAL MODULE SYSTEM REQUIREMENT 🚨
**⚠️ ES MODULES ONLY - HARD RULE ⚠️**
- **ALL projects MUST use ES Modules** (`"type": "module"` in package.json)
- **NEVER use CommonJS** (no `require()`, no `module.exports`)
- **ALWAYS use ES Module syntax** (`import`/`export`)
- **Config files**: Use `.cjs` extension if CommonJS needed (e.g., `next.config.cjs`)
- **This is NON-NEGOTIABLE**: ES Modules are mandatory across ALL projects
- **Enforcement Date**: September 28, 2025
- **Applies to**: Backend, Frontend, Scripts, Tests, ALL CODE

### Frontend
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Module System**: ES Modules ONLY (`"type": "module"` required)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Wallet Integration**: WalletConnect, Phantom

### Backend
- **Runtime**: Node.js 20+ (Native ES Modules - NO BABEL)
- **Framework**: Express.js/Fastify
- **Module System**: ES Modules ONLY (`"type": "module"` required)
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Queue**: Apache Kafka
- **Monitoring**: DataDog/Prometheus
- **Important**: Do NOT use Babel for transpilation - use native Node.js ES module support

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
| **monay-backend-common** | 3001 | Centralized Backend API (SINGLE INSTANCE) |
| **monay-admin** | 3002 | Admin Dashboard (formerly monay-frontend) |
| **monay-consumer-web** | 3003 | Consumer Super App Web Application |
| **monay-mobile-api** | 3004 | Mobile-specific API (Reserved) |
| **monay-webhook** | 3005 | Webhook Service (Reserved) |
| **monay-enterprise-wallet** | 3007 | Enterprise Wallet Management |

### Database & Cache (SHARED - DO NOT DUPLICATE)
| Service | Port | Description |
|---------|------|-------------|
| **PostgreSQL** | 5432 | Primary Database (SHARED by all applications) |
| **Redis** | 6379 | Cache & Sessions (SHARED by all applications) |

**CRITICAL**:
- Only ONE instance of monay-backend-common should run on port 3001
- ALL applications share the same PostgreSQL database on port 5432
- Consumer wallet and Enterprise wallet use the SAME database
- Never create duplicate databases or run multiple backend instances

## 🚀 Active Applications & Services (UPDATED: 2025-09-22)

| Application | Location | Port | Status | Description |
|------------|----------|------|--------|-------------|
| **monay-website** | `/monay-website/` | 3000 | ✅ Active | Public Marketing Website |
| **monay-backend-common** | `/monay-backend-common/` | 3001 | ✅ Active | Centralized Backend API (SHARED) |
| **monay-admin** | `/monay-admin/` | 3002 | ✅ Active | Admin Dashboard (Next.js 14) |
| **monay-consumer-web** | `/monay-cross-platform/web/` | 3003 | ✅ Active | Consumer Super App Web |
| **monay-consumer-mobile** | `/monay-cross-platform/mobile/` | - | ✅ Active | Consumer Super App Mobile (iOS/Android) |
| **monay-enterprise-wallet** | `/monay-caas/monay-enterprise-wallet/` | 3007 | ✅ Active | Enterprise Wallet Management |

**Database Architecture:**
- Single PostgreSQL instance (port 5432) shared by ALL applications
- Single Redis instance (port 6379) shared for caching/sessions
- Backend API (port 3001) is the ONLY service with database access
- All frontend apps communicate through the backend API

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

#### 3. Monay-Admin (Port 3002) - SUPER ADMIN MANAGER
**Critical Role**: Central administrative control for BOTH Monay-CaaS and Monay Consumer Wallet
- Administrative dashboard (v2.0.0) - Master control panel for entire platform
- User and transaction management across all applications
- Compliance monitoring for both enterprise and consumer operations
- Business rules configuration for dual-rail blockchain
- Analytics and reporting for CaaS and WaaS platforms
- Tenant management for multi-tenant operations
- Billing analytics with USDXM support
- **USES**: Same monay-backend-common (port 3001) as all other applications
- **DATABASE**: Shares single PostgreSQL 'monay' database with ALL applications

#### 4. Monay Consumer Wallet - Super App (Port 3003)
**The First U.S.-Centric Super App** - Consumer wallet combining financial services with lifestyle features.

##### Location & Architecture
- **Web Application**: `/monay-cross-platform/web/` (Port 3003)
- **Mobile iOS**: `/monay-cross-platform/mobile/` (React Native + Expo)
- **Mobile Android**: `/monay-cross-platform/mobile/` (React Native + Expo)
- **Shared Components**: `/monay-cross-platform/shared/`
- **Documentation**: `/monay-cross-platform/docs/`
  - PRD: `Monay_Consumer_Wallet_PRD.md`
  - UI Mockups: `superApp.png`

##### Core Features
**Financial Services:**
- Multi-currency wallet (Fiat USD + Stablecoins USDC/USDT/PYUSD + Crypto BTC/ETH/SOL)
- Virtual/physical card with instant issuance (zero-balance start)
- P2P transfers with Request-to-Pay tagging (invoice-first model)
- Multi-rail payments: ACH, FedNow, RTP, Cards, Stablecoins, Crypto
- Enterprise invoice payments via Monay-WaaS integration

**Super App Services:**
- **Travel & Mobility**: Flights, buses, ride-hailing, tolls, EV charging
- **Hospitality**: Hotels, Airbnb-style stays, restaurants
- **Retail/E-commerce**: In-app shopping, QR merchant payments
- **Healthcare**: Bill pay, pharmacy, HSA/FSA wallet
- **Education**: Tuition, loan repayments, scholarships
- **Entertainment**: Event ticketing, subscriptions, gaming
- **Government Benefits**: SNAP, unemployment, tax refunds, Social Security

##### Technical Stack
- **Web**: Next.js 14 with TypeScript, TailwindCSS
- **Mobile**: React Native with Expo
- **Backend**: Shared monay-backend-common (Port 3001)
- **Database**: Shared PostgreSQL (Port 5432) - NO separate database
- **Authentication**: JWT from monay-backend-common

##### Compliance & Security
- Monay-ID integration for KYC/AML
- Biometric authentication (Face ID, Touch ID, fingerprint)
- Real-time fraud detection
- FinCEN, OCC, PCI DSS, SOC 2 compliance

##### Important Notes
- **Shared Database**: Uses existing `monay` PostgreSQL database
- **Single Backend**: All data access through port 3001 only
- **Port Conflicts**: Always use port 3003 for consumer web
- **No Database Creation**: Never create duplicate tables or migrations

### 5. Monay-RNiOS (Legacy - Being Replaced)
- Being replaced by React Native app in `/monay-cross-platform/mobile/`
- Biometric authentication and NFC support
- Apple Pay and Apple Wallet integration
- Push notifications

### 6. Monay-RNAndroid (Legacy - Being Replaced)
- Being replaced by React Native app in `/monay-cross-platform/mobile/`
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

## Database Field Naming Convention (camelCase vs snake_case)

### Global Sequelize Configuration for Field Names
To handle the mismatch between JavaScript camelCase and database snake_case conventions, we use Sequelize's global configuration:

```javascript
// In src/models/index.js
const sequelize = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'postgres',
  define: {
    // Global settings for all models
    underscored: true,              // Automatically convert camelCase to snake_case
    timestamps: true,                // Enable timestamps
    createdAt: 'created_at',         // Map createdAt to created_at
    updatedAt: 'updated_at',         // Map updatedAt to updated_at
    // This makes all model attributes use snake_case in the database
    // while keeping camelCase in JavaScript
  }
});
```

**Key Points:**
- JavaScript code uses `camelCase`: `userId`, `phoneNumber`, `createdAt`
- Database automatically uses `snake_case`: `user_id`, `phone_number`, `created_at`
- No manual conversion needed - Sequelize handles it automatically
- Apply this configuration globally to avoid per-model settings
- See `SEQUELIZE_NAMING_CONVENTION.md` for detailed implementation guide

## Code Conventions

### 🔴 MANDATORY: TYPESCRIPT ONLY - NO JAVASCRIPT 🔴
**⚠️ CRITICAL REQUIREMENT - EFFECTIVE IMMEDIATELY ⚠️**
- **ALL code MUST be written in TypeScript** (`.ts` or `.tsx` files only)
- **NO JavaScript files allowed** (`.js` or `.jsx` are FORBIDDEN)
- **This applies to ALL code**:
  - ✅ Components: `.tsx` files only
  - ✅ Utilities/Hooks: `.ts` files (or `.tsx` if containing JSX)
  - ✅ API routes: `.ts` files only
  - ✅ Configuration: `.ts` files (or `.cjs` for CommonJS configs)
  - ✅ Tests: `.test.ts` or `.test.tsx` only
- **Type Safety Requirements**:
  - ✅ All variables must have explicit or inferred types
  - ✅ All function parameters must be typed
  - ✅ All function return types should be explicit
  - ✅ No `any` types without explicit justification
  - ✅ Strict mode enabled in tsconfig.json
- **Build will FAIL if**:
  - Any `.js` or `.jsx` files are found in src directories
  - TypeScript compilation errors exist
  - Type coverage is below 95%
- **Enforcement Date**: January 2025
- **NO EXCEPTIONS**: This is a hard requirement for code quality and maintainability

### 🔴 MANDATORY: ES MODULES ONLY 🔴
**CRITICAL REQUIREMENT - NO EXCEPTIONS:**
- **ALL projects MUST have `"type": "module"` in package.json**
- **NEVER use CommonJS syntax:**
  - ❌ `const x = require('module')`
  - ❌ `module.exports = {}`
  - ❌ `exports.function = {}`
- **ALWAYS use ES Module syntax:**
  - ✅ `import x from 'module'`
  - ✅ `export default {}`
  - ✅ `export { function }`
- **Config files needing CommonJS**: Rename to `.cjs` extension
- **This applies to ALL code**: Frontend, Backend, Tests, Scripts, Everything
- **Violation = Build Failure**: CI/CD will reject CommonJS code

### TypeScript Standards
- **TypeScript ONLY** - NO JavaScript files allowed in any project
- **Strict TypeScript configuration** - All strict flags enabled
- **Type all function parameters and return types explicitly**
- **No implicit `any` types** - Must be explicitly typed if needed
- **Use interfaces over type aliases** for object shapes
- **Use enums for constants** with multiple related values
- **Generic types** for reusable components and utilities
- Use ES Modules EXCLUSIVELY (native Node.js support) - NO BABEL TRANSPILATION
- Always include .js file extensions in imports for ES modules
- Async/await over promises
- Functional components with hooks in React (using `.tsx` extension)
- Proper error handling with try/catch blocks
- ALL projects use `"type": "module"` in package.json for native ES module support

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

## 🚨 CRITICAL: Database Recovery & Management

### Database Recovery Instructions
**In case of database loss or corruption, use the recovery script immediately:**
```bash
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common/migrations
./DATABASE_RECOVERY_SCRIPT.sh
```

### Key Recovery Files (NEVER DELETE THESE)
- **`/monay-backend-common/migrations/CONSOLIDATED_MONAY_SCHEMA.sql`** - Complete schema (70 tables)
- **`/monay-backend-common/migrations/DATABASE_RECOVERY_SCRIPT.sh`** - Automated recovery
- **`/COMPREHENSIVE_DATABASE_RECOVERY_ANALYSIS.md`** - Full documentation

### ⚠️ IMPORTANT: When Making Database Changes
1. **ALWAYS update CONSOLIDATED_MONAY_SCHEMA.sql** after adding new tables/changes
2. **NEVER use DROP TABLE statements** in any migration
3. **Use CREATE TABLE IF NOT EXISTS** for safety
4. **Test migrations on a backup database first**
5. **Update the recovery script if schema changes significantly**

### Database Commands
```bash
# Check database status (should show 70+ tables)
psql -U alisaberi -d monay -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Create manual backup
pg_dump -U alisaberi monay > monay_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U alisaberi monay < backup_file.sql

# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate

# Seed database
npm run seed
```

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