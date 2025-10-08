# 📋 COMPREHENSIVE REDESIGN CHECKLIST
## Complete Analysis of monay_wallet_redesign.md Requirements
**Date**: October 2025
**Purpose**: Ensure nothing is missed in the MonayPay transformation

---

## 🏦 PROVIDER REGISTRATION REQUIREMENTS

### 1. CROSS RIVER BANK
**Status**: ❌ NOT REGISTERED
**Registration URL**: https://www.crossriver.com/partnerships
**What You Need**:
```
1. Business Entity Information
2. EIN/Tax ID
3. Projected transaction volumes
4. Business bank statements (3 months)
5. Certificate of Good Standing
6. Beneficial ownership information (25%+ owners)

Contact: partnerships@crossriver.com
Phone: 1-877-55-CROSS

API Access Requirements:
- Sandbox API keys (immediate after approval)
- Production API keys (after compliance review)
- FBO Account setup (for fund segregation)
- Webhook endpoints configuration
```

### 2. BITGO TRUST
**Status**: ❌ NOT REGISTERED
**Registration URL**: https://www.bitgo.com/contact-sales
**What You Need**:
```
1. Business verification documents
2. AML/KYC program documentation
3. Expected custody volumes
4. Security questionnaire
5. SOC 2 compliance (if available)

Contact: sales@bitgo.com
Phone: 1-650-265-2435

API Access Requirements:
- Test environment access (immediate)
- Enterprise ID assignment
- HSM key ceremony scheduling
- Multi-sig wallet configuration
- Webhook security setup
```

### 3. TEMPO (Already Integrated)
**Status**: ✅ PARTIALLY IMPLEMENTED (as blockchain, needs FX refactor)
**Additional Setup Needed**:
```
- Convert from blockchain to FX provider config
- Update API endpoints from testnet to FX API
- Configure corridor-specific settings
- Setup liquidity pool access
```

---

## 🔍 COMPLETE REQUIREMENT ANALYSIS

## 1. BACKEND COMMON (Port 3001)

### ✅ ALREADY DONE
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| Invoice-First Core | `/services/invoiceFirstWallet.js` | ✅ Complete | Ephemeral/persistent/adaptive modes working |
| Business Rule Engine | `/services/business-rule-engine/` | ✅ Complete | Compiler, evaluator, attestation ready |
| WebSocket Service | `/services/websocket-service.js` | ✅ Complete | Real-time events functional |
| Cross-Rail Bridge | `/services/crossRailBridge.js` | ✅ Basic | Foundation exists |
| Invoice Wallet Routes | `/routes/invoiceWallets.js` | ✅ Complete | CRUD operations working |
| Audit Logger | `/services/invoice-wallet/AuditLogger.js` | ✅ Basic | Needs Merkle DAG enhancement |
| Quantum Crypto | `/services/invoice-wallet/QuantumCrypto.js` | ✅ Complete | ML-KEM + ML-DSA implemented |

### ⚠️ NEEDS ENHANCEMENT
| Component | Current State | Required Enhancement | Priority | Effort |
|-----------|--------------|---------------------|----------|--------|
| **Tempo Service** | Blockchain L1 mock | Convert to FX provider | 🔴 High | 2 days |
| **Dual-Entry Ledger** | Basic PostgreSQL | Add atomic multi-leg postings | 🔴 High | 1 week |
| **Router** | Simple routing | Add scoring algorithm + fallbacks | 🔴 High | 1 week |
| **Audit Layer** | Basic logging | Add Merkle DAG + chain anchoring | 🟡 Medium | 3 days |
| **CORS Configuration** | Basic setup | Add provider-specific headers | 🟡 Medium | 1 day |

### ❌ NEEDS COMPLETE BUILD
| Component | Description | Priority | Effort |
|-----------|-------------|----------|--------|
| **Cross River Client** | Full integration (see section below) | 🔴 Critical | 2 weeks |
| **BitGo Custody Service** | Full integration (see section below) | 🔴 Critical | 2 weeks |
| **MonayPay Core (TilliPay Fork)** | Orchestration engine | 🔴 Critical | 1 week |
| **Circuit Breakers** | Per-rail health monitoring | 🔴 High | 3 days |
| **Idempotency Service** | Payment intent reservations | 🟡 Medium | 2 days |
| **HSM/KMS Integration** | Key management for BitGo | 🔴 High | 1 week |
| **ERP Connectors** | SAP/Oracle/Dynamics OAuth | 🟡 Medium | 1 week |

### 📝 CROSS RIVER BANK INTEGRATION DETAILS
```javascript
// NEW FILES NEEDED:
/services/providers/cross-river/
├── client.js                    // Main API client with HMAC signing
├── authentication.js             // OAuth2 + API key management
├── fbo-account.js              // FBO account operations
├── ach.service.js              // ACH transfers (same-day, standard)
├── fednow.service.js           // FedNow instant payments
├── rtp.service.js              // Real-Time Payments
├── swift.service.js            // SWIFT wire transfers
├── webhooks.js                 // Webhook verification
├── reconciliation.js           // Daily reconciliation
└── compliance.js               // KYC/AML checks

// ROUTES NEEDED:
/routes/cross-river/
├── transfers.js                // Transfer endpoints
├── accounts.js                 // Account management
├── webhooks.js                 // Webhook handler
└── reports.js                  // Reconciliation reports

// CORS UPDATES:
- Add Cross River webhook IPs to whitelist
- Add specific headers: X-CR-API-KEY, X-CR-Signature
```

### 📝 BITGO INTEGRATION DETAILS
```javascript
// NEW FILES NEEDED:
/services/providers/bitgo/
├── client.js                    // BitGo SDK wrapper
├── authentication.js            // Access token management
├── custody.service.js          // Wallet custody operations
├── wallet-factory.js           // Deterministic wallet creation
├── hsm-keys.js                 // HSM key management
├── multi-sig.js                // Multi-signature setup
├── stablecoin-ops.js          // USDC/PYUSD mint/redeem
├── webhooks.js                 // Webhook processing
├── reporting.js                // Custody reports
└── compliance.js               // Travel rule implementation

// ROUTES NEEDED:
/routes/bitgo/
├── wallets.js                  // Wallet management
├── transfers.js                // Transfer operations
├── stablecoins.js             // Mint/redeem operations
└── webhooks.js                 // Webhook handler

// CORS UPDATES:
- Add BitGo webhook URLs
- Add headers: Authorization, X-BitGo-Signature
```

---

## 2. SUPER ADMIN (Port 3002)

### ✅ ALREADY DONE
| Component | Location | Status |
|-----------|----------|--------|
| User Management | `/app/(dashboard)/users-management/` | ✅ Complete |
| Tenant Management | `/app/(dashboard)/tenants/` | ✅ Complete |
| Transaction Monitoring | `/app/(dashboard)/transactions/` | ✅ Complete |
| Basic Dashboard | `/app/(dashboard)/dashboard/` | ✅ Complete |

### ❌ NEEDS COMPLETE BUILD
| Component | Description | Priority | Effort |
|-----------|-------------|----------|--------|
| **Provider Management UI** | Cross River, BitGo, Tempo config screens | 🔴 Critical | 3 days |
| **BRE Rule Editor** | Visual rule builder with deployment | 🔴 High | 1 week |
| **Pricing Matrix UI** | Per corridor/segment pricing | 🟡 Medium | 3 days |
| **Attestation Explorer** | BRE attestation viewer | 🟡 Medium | 2 days |
| **Rail Health Dashboard** | Real-time provider monitoring | 🔴 Critical | 3 days |
| **Reconciliation UI** | Cross River FBO reconciliation | 🔴 High | 3 days |
| **Asset Allowlist Manager** | Stablecoin whitelist config | 🔴 High | 2 days |
| **Router Weights Config** | Scoring weight adjustment | 🟡 Medium | 2 days |

### 📝 NEW PAGES NEEDED
```typescript
/app/(dashboard)/
├── providers/
│   ├── page.tsx                // Provider overview
│   ├── cross-river/
│   │   ├── page.tsx            // Cross River config
│   │   ├── fbo/page.tsx        // FBO account management
│   │   └── webhooks/page.tsx   // Webhook config
│   ├── bitgo/
│   │   ├── page.tsx            // BitGo config
│   │   ├── wallets/page.tsx    // Custody wallet management
│   │   └── hsm/page.tsx        // HSM key management
│   └── tempo/
│       ├── page.tsx            // Tempo FX config
│       └── corridors/page.tsx  // Corridor settings
├── bre-rules/
│   ├── page.tsx                // Rule management
│   ├── editor/page.tsx         // Visual editor
│   ├── test/page.tsx           // Rule testing
│   └── deploy/page.tsx         // Cross-chain deployment
├── pricing-matrix/
│   ├── page.tsx                // Pricing configuration
│   ├── corridors/page.tsx      // Corridor-specific pricing
│   └── simulator/page.tsx      // Pricing simulator
└── reconciliation/
    ├── page.tsx                // Reconciliation dashboard
    ├── cross-river/page.tsx    // FBO reconciliation
    └── reports/page.tsx        // Daily reports
```

---

## 3. ENTERPRISE WALLET (Port 3007)

### ✅ ALREADY DONE
| Component | Location | Status |
|-----------|----------|--------|
| Invoice Management | `/app/(dashboard)/invoices/` | ✅ Complete |
| Basic Wallet UI | `/app/(dashboard)/wallets/` | ✅ Complete |
| Dashboard | `/app/(dashboard)/dashboard/` | ✅ Complete |

### ⚠️ NEEDS ENHANCEMENT
| Component | Current State | Required Enhancement | Priority | Effort |
|-----------|--------------|---------------------|----------|--------|
| **Invoice Creation** | Basic form | Add wallet mode selector, TTL config | 🔴 High | 2 days |
| **Payment Flow** | Simple transfer | Add rail selection display | 🟡 Medium | 2 days |
| **Wallet Display** | Basic info | Show provider (BitGo/Cross River) | 🟡 Medium | 1 day |

### ❌ NEEDS COMPLETE BUILD
| Component | Description | Priority | Effort |
|-----------|-------------|----------|--------|
| **Smart Escrow UI** | Oracle-based milestone release | 🟡 Medium | 1 week |
| **Bulk Invoice Processing** | CSV upload with wallet creation | 🔴 High | 3 days |
| **ERP Integration UI** | SAP/Oracle connector setup | 🔴 High | 1 week |
| **Multi-sig Approvals** | BitGo multi-sig workflow | 🟡 Medium | 3 days |
| **Rail Visibility** | Show which provider handles payment | 🔴 High | 2 days |
| **FBO Account View** | Cross River FBO balance display | 🟡 Medium | 2 days |

---

## 4. CONSUMER WALLET (Port 3003)

### ✅ ALREADY DONE
| Component | Location | Status |
|-----------|----------|--------|
| Dashboard | `/app/dashboard/` | ✅ Complete |
| Send Money | `/app/send/` | ✅ Complete |
| Payment Methods | `/app/payment-methods/` | ✅ Complete |
| Services | `/app/services/` | ✅ Complete |

### ⚠️ NEEDS ENHANCEMENT
| Component | Current State | Required Enhancement | Priority | Effort |
|-----------|--------------|---------------------|----------|--------|
| **Send Money** | Basic P2P | Add rail selection (ACH/FedNow/RTP) | 🔴 High | 2 days |
| **Payment Methods** | Cards only | Add bank account via Cross River | 🔴 High | 3 days |
| **Dashboard** | Basic metrics | Add unified fiat+crypto balance | 🟡 Medium | 2 days |

### ❌ NEEDS COMPLETE BUILD
| Component | Description | Priority | Effort |
|-----------|-------------|----------|--------|
| **Request-to-Pay UI** | Invoice-based payment requests | 🔴 High | 3 days |
| **Self-Custody Setup** | BitGo wallet creation flow | 🔴 High | 1 week |
| **Bank Account Linking** | Cross River ACH verification | 🔴 High | 3 days |
| **Stablecoin Management** | USDC/PYUSD via BitGo | 🔴 High | 3 days |
| **On/Off Ramp UI** | Fiat↔Crypto via Cross River/BitGo | 🔴 High | 3 days |

---

## 5. CROSS-CUTTING CONCERNS

### 🔐 SECURITY & COMPLIANCE

#### ❌ NEEDS COMPLETE BUILD
| Component | Description | Priority | Effort |
|-----------|-------------|----------|--------|
| **KYB for Cross River** | Business verification flow | 🔴 Critical | 1 week |
| **Travel Rule (BitGo)** | FATF compliance for crypto | 🔴 Critical | 3 days |
| **PCI DSS Scope** | Review with new providers | 🔴 Critical | 1 week |
| **SOC 2 Updates** | Document new integrations | 🟡 Medium | 2 weeks |

### 📊 DATABASE CHANGES

```sql
-- NEW TABLES NEEDED:

-- Cross River Integration
CREATE TABLE cross_river_accounts (
    id UUID PRIMARY KEY,
    account_type VARCHAR(50), -- 'fbo', 'operating'
    account_number VARCHAR(50),
    routing_number VARCHAR(50),
    balance DECIMAL(20,2),
    currency VARCHAR(3),
    status VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cross_river_transfers (
    id UUID PRIMARY KEY,
    external_id VARCHAR(100), -- Cross River transaction ID
    type VARCHAR(20), -- 'ach', 'fednow', 'rtp', 'wire'
    direction VARCHAR(10), -- 'debit', 'credit'
    amount DECIMAL(20,2),
    status VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BitGo Integration
CREATE TABLE bitgo_wallets (
    id UUID PRIMARY KEY,
    wallet_id VARCHAR(100), -- BitGo wallet ID
    enterprise_id VARCHAR(100),
    coin VARCHAR(10), -- 'usdc', 'pyusd', etc
    type VARCHAR(20), -- 'hot', 'cold'
    address VARCHAR(100),
    balance DECIMAL(20,8),
    status VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bitgo_transactions (
    id UUID PRIMARY KEY,
    tx_id VARCHAR(100), -- BitGo transaction ID
    wallet_id VARCHAR(100),
    type VARCHAR(20), -- 'send', 'receive', 'mint', 'redeem'
    amount DECIMAL(20,8),
    fee DECIMAL(20,8),
    status VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider Health Metrics
CREATE TABLE provider_health (
    provider VARCHAR(50),
    status VARCHAR(20),
    latency_ms INTEGER,
    success_rate DECIMAL(5,2),
    last_check TIMESTAMPTZ,
    metadata JSONB,
    PRIMARY KEY (provider, last_check)
);

-- Routing Decisions
CREATE TABLE routing_decisions (
    id UUID PRIMARY KEY,
    invoice_id VARCHAR(100),
    selected_rail VARCHAR(50),
    fallback_rails JSONB,
    score_breakdown JSONB,
    decision_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 🌐 API ROUTES SUMMARY

```javascript
// BACKEND COMMON - NEW ROUTES NEEDED:

// Cross River Routes
POST   /api/cross-river/transfer/ach
POST   /api/cross-river/transfer/fednow
POST   /api/cross-river/transfer/rtp
POST   /api/cross-river/transfer/wire
GET    /api/cross-river/account/balance
POST   /api/cross-river/webhook
GET    /api/cross-river/reconciliation

// BitGo Routes
POST   /api/bitgo/wallet/create
GET    /api/bitgo/wallet/:id
POST   /api/bitgo/transfer
POST   /api/bitgo/stablecoin/mint
POST   /api/bitgo/stablecoin/redeem
POST   /api/bitgo/webhook
GET    /api/bitgo/custody/report

// MonayPay Router Routes
POST   /api/router/intent           // Create payment intent
POST   /api/router/execute          // Execute with best rail
GET    /api/router/status/:id       // Check routing decision
GET    /api/router/health           // Rail health status

// Updated Invoice Routes
POST   /api/invoices/create         // Now includes wallet config
GET    /api/invoices/:id/wallet     // Get associated wallet
POST   /api/invoices/:id/escrow     // Setup smart escrow
```

### 🔧 CORS CONFIGURATION

```javascript
// backend-common/src/config/cors.js
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      'http://localhost:3002', // Admin
      'http://localhost:3003', // Consumer
      'http://localhost:3007', // Enterprise

      // NEW: Provider webhooks
      'https://api.crossriver.com',
      'https://webhooks.crossriver.com',
      'https://api.bitgo.com',
      'https://webhooks.bitgo.com',
      'https://api.tempo.eu',

      // Production domains
      process.env.ADMIN_URL,
      process.env.CONSUMER_URL,
      process.env.ENTERPRISE_URL
    ];

    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  // NEW: Custom headers for providers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CR-API-KEY',        // Cross River
    'X-CR-Signature',      // Cross River
    'X-BitGo-Signature',   // BitGo
    'X-Tempo-Key',         // Tempo
    'X-Idempotency-Key'    // Idempotency
  ],

  credentials: true
};
```

---

## 📈 PERFORMANCE REQUIREMENTS (FROM REDESIGN)

### Must Meet These SLAs:
| Operation | Target | Current | Gap |
|-----------|--------|---------|-----|
| Payment Intent Decision | <250ms P95 | Not implemented | ❌ Build Router v2 |
| ACH Transfer Initiation | <500ms | Not implemented | ❌ Build Cross River |
| FedNow/RTP Transfer | <1s | Not implemented | ❌ Build Cross River |
| BitGo Wallet Creation | <200ms | Not implemented | ❌ Build BitGo |
| Stablecoin Transfer | <5s | Not implemented | ❌ Build BitGo |
| ERP Sync | <5s | Not implemented | ❌ Build ERP connectors |
| Key Zeroization | <2s | ✅ Implemented | ✅ Done |

---

## 🚨 CRITICAL MISSING PIECES

### 1. **Provider Credentials** (BLOCKING)
- ❌ Cross River API keys not obtained
- ❌ BitGo Enterprise ID not obtained
- ❌ FBO Account not setup with Cross River
- ❌ HSM not configured for BitGo

### 2. **Compliance Requirements** (BLOCKING)
- ❌ MSB registration for Cross River
- ❌ BitGo KYB not completed
- ❌ Travel Rule implementation missing
- ❌ AML program documentation needed

### 3. **Infrastructure** (HIGH PRIORITY)
- ❌ HSM/KMS for key management
- ❌ Dedicated IPs for webhooks
- ❌ SSL certificates for webhook endpoints
- ❌ Rate limiting per provider

---

## 📋 COMPLETE TASK LIST BY PRIORITY

### 🔴 WEEK 1: CRITICAL PATH
1. **Register with Cross River Bank** (Day 1)
2. **Register with BitGo** (Day 1)
3. **Remove Circle completely** (Days 1-3)
4. **Build Cross River client** (Days 2-5)
5. **Build BitGo client** (Days 2-5)

### 🟡 WEEK 2: CORE INTEGRATION
1. **Build Router v2 with scoring**
2. **Implement Dual-Entry Ledger v2**
3. **Add Circuit Breakers**
4. **Build Provider Management UI (Admin)**
5. **Update Invoice Creation UI (Enterprise)**

### 🟢 WEEK 3: ENHANCEMENT
1. **Add ERP connectors**
2. **Build BRE Rule Editor**
3. **Add Pricing Matrix**
4. **Implement Reconciliation**
5. **Add Request-to-Pay (Consumer)**

### 🔵 WEEK 4: TESTING & POLISH
1. **End-to-end testing**
2. **Provider failover testing**
3. **Performance optimization**
4. **Security audit**
5. **Documentation**

---

## ✅ VERIFICATION CHECKLIST

Before going live, ensure:

### Provider Setup
- [ ] Cross River API keys obtained and tested
- [ ] BitGo Enterprise ID configured
- [ ] FBO Account active with Cross River
- [ ] HSM keys generated for BitGo
- [ ] Webhook endpoints configured for all providers

### Code Complete
- [ ] All Circle code removed (grep verification)
- [ ] Cross River client fully implemented
- [ ] BitGo client fully implemented
- [ ] Router v2 with scoring operational
- [ ] Dual-Entry Ledger v2 working

### UI Complete
- [ ] Admin: Provider management screens
- [ ] Admin: BRE rule editor
- [ ] Enterprise: Enhanced invoice creation
- [ ] Consumer: Request-to-Pay flow
- [ ] All apps: Rail visibility

### Testing
- [ ] Unit tests >80% coverage
- [ ] Integration tests passing
- [ ] Provider failover tested
- [ ] Performance SLAs met
- [ ] Security audit completed

---

## 🎯 CONCLUSION

The redesign document requirements are **comprehensive and ambitious**. The main gaps are:

1. **Provider Registrations** - Must be done immediately
2. **Core Integrations** - Cross River and BitGo are completely missing
3. **UI Updates** - Significant work needed across all frontends
4. **Compliance** - KYB, Travel Rule, AML documentation needed

**Recommended approach**: Start provider registrations TODAY, then follow the week-by-week plan with all teams working in parallel. The Invoice-First architecture is solid, but the provider layer needs complete implementation.

**Time estimate**: 4-5 weeks with proper parallel execution and no blockers on provider registration.