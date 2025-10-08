# 🔄 TILLIPAY TO MONAYPAY TRANSFORMATION GUIDE
## Complete Refactoring Requirements for Orchestration Core
**Date**: October 2025
**Purpose**: Transform TilliPay into MonayPay with Cross River, BitGo, and Tempo integration

---

## 📊 TILLIPAY CURRENT STATE ANALYSIS

### What TilliPay Currently Does:
1. **Payment Orchestration** - Routes payments through various processors
2. **Card Processing** - Visa/Mastercard integration
3. **ACH Processing** - Basic ACH transfers
4. **Compliance** - KYC/AML checks
5. **Ledger** - Basic transaction recording
6. **Webhooks** - Payment status updates

### What TilliPay Likely Uses (to be replaced):
- **Stripe/Plaid** for bank connections
- **Circle APIs** for USDC operations (if present)
- **Traditional processors** (First Data, TSYS, etc.)
- **Single-entry ledger** system
- **Basic routing** without scoring

---

## 🎯 MONAYPAY TARGET STATE

### Core Transformation Requirements:

```
TilliPay (Current)          →  MonayPay (Target)
├── Stripe/Plaid           →  Cross River Bank (Direct)
├── Circle (if present)    →  BitGo Custody
├── Basic Router           →  Router v2 with Scoring
├── Single Ledger          →  Dual-Entry Ledger v2
├── Basic Compliance       →  BRE Integration
├── Card-focused           →  Multi-Rail Orchestration
└── Webhook-based          →  Event-Driven + WebSocket
```

---

## 📝 DETAILED COMPONENT CHANGES

## 1. PAYMENT PROVIDER LAYER

### REMOVE/REPLACE:
```javascript
// OLD: TilliPay providers (to remove)
- /services/stripe/
- /services/plaid/
- /services/circle/     // If exists
- /services/dwolla/     // If exists
- /services/synapsepay/ // If exists

// NEW: MonayPay providers (to add)
+ /services/providers/
  + cross-river/
    - client.js           // Main API client
    - ach.service.js      // ACH rails
    - fednow.service.js   // Instant payments
    - rtp.service.js      // Real-time payments
    - swift.service.js    // International wires
    - fbo-manager.js      // FBO account management
    - reconciliation.js   // Daily settlement

  + bitgo/
    - client.js           // BitGo SDK wrapper
    - custody.service.js  // Wallet management
    - stablecoin.js      // USDC/PYUSD operations
    - hsm-signer.js      // HSM signing service
    - multisig.js        // Multi-signature flows

  + tempo/
    - client.js           // Tempo FX client
    - fx-quote.js        // Real-time FX quotes
    - corridors.js       // International corridors
    - liquidity.js       // Liquidity management
```

### Provider Adapter Pattern:
```javascript
// Create unified interface for all providers
// /services/providers/provider-interface.js

export class PaymentProvider {
  async createTransfer(params) { throw new Error('Not implemented'); }
  async getBalance(accountId) { throw new Error('Not implemented'); }
  async getTransactionStatus(txId) { throw new Error('Not implemented'); }
  async validateWebhook(payload, signature) { throw new Error('Not implemented'); }
}

// Each provider implements this interface
export class CrossRiverProvider extends PaymentProvider {
  async createTransfer(params) {
    // Cross River specific implementation
    if (params.type === 'ach') return this.createACH(params);
    if (params.type === 'fednow') return this.createFedNow(params);
    // ... etc
  }
}
```

---

## 2. ROUTER TRANSFORMATION

### OLD: TilliPay Router
```javascript
// Likely simple routing based on:
class SimpleRouter {
  route(payment) {
    if (payment.type === 'card') return 'stripe';
    if (payment.type === 'ach') return 'dwolla';
    if (payment.type === 'crypto') return 'circle';
    return 'default';
  }
}
```

### NEW: MonayPay Router v2
```javascript
// Intelligent routing with scoring algorithm
class RouterV2 {
  constructor() {
    this.weights = {
      cost: 0.30,
      time: 0.25,
      fx: 0.15,
      liquidity: 0.10,
      policy: 0.15,
      reliability: 0.05
    };
  }

  async createIntent(params) {
    // 1. Get eligible rails
    const eligibleRails = await this.getEligibleRails(params);

    // 2. Score each rail
    const scores = await this.scoreRails(eligibleRails, params);

    // 3. Select optimal rail
    const selectedRail = this.selectBestRail(scores);

    // 4. Create fallback chain
    const fallbacks = this.createFallbackChain(scores);

    // 5. Generate intent with reservation
    return this.generateIntent(selectedRail, fallbacks, params);
  }

  // Scoring algorithm from spec
  score(rail, params) {
    return this.weights.cost * this.scoreCost(rail, params) +
           this.weights.time * this.scoreTime(rail) +
           this.weights.fx * this.scoreFx(rail, params) +
           this.weights.liquidity * this.scoreLiquidity(rail) +
           this.weights.policy * this.scorePolicy(rail) +
           this.weights.reliability * this.scoreReliability(rail);
  }
}
```

### Circuit Breakers (NEW):
```javascript
// Add per-rail circuit breakers
class CircuitBreaker {
  constructor(railName, options = {}) {
    this.railName = railName;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit breaker OPEN for ${this.railName}`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

---

## 3. LEDGER TRANSFORMATION

### OLD: TilliPay Single-Entry Ledger
```javascript
// Likely structure
class SimpleLedger {
  async recordTransaction(tx) {
    await db.transactions.create({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      status: tx.status,
      metadata: tx.metadata
    });
  }
}
```

### NEW: MonayPay Dual-Entry Ledger v2
```javascript
// Double-entry bookkeeping with atomic multi-leg postings
class DualEntryLedgerV2 {
  async createPosting(posting) {
    const transaction = await db.transaction(async (trx) => {
      // Create journal entry
      const journal = await trx('journal_entries').insert({
        id: generateUUID(),
        posting_date: posting.date,
        description: posting.description,
        invoice_id: posting.invoiceId,
        status: 'pending'
      }).returning('*');

      // Create atomic entries (must balance)
      const entries = [];
      let totalDebits = 0;
      let totalCredits = 0;

      for (const entry of posting.entries) {
        const ledgerEntry = await trx('ledger_entries').insert({
          journal_id: journal.id,
          account_id: entry.accountId,
          debit: entry.type === 'debit' ? entry.amount : 0,
          credit: entry.type === 'credit' ? entry.amount : 0,
          currency: entry.currency,
          rail: entry.rail, // NEW: Track which rail
          provider: entry.provider // NEW: Track provider
        }).returning('*');

        entries.push(ledgerEntry);
        totalDebits += ledgerEntry.debit;
        totalCredits += ledgerEntry.credit;
      }

      // Ensure balanced posting
      if (totalDebits !== totalCredits) {
        throw new Error('Unbalanced posting');
      }

      // Update journal status
      await trx('journal_entries')
        .where({ id: journal.id })
        .update({ status: 'posted' });

      return { journal, entries };
    });

    return transaction;
  }

  // Support for multi-leg atomic postings (fiat + crypto)
  async createMultiLegPosting(params) {
    // Example: Fiat ACH debit + Stablecoin credit
    return this.createPosting({
      description: params.description,
      invoiceId: params.invoiceId,
      entries: [
        // Fiat leg
        {
          accountId: params.fiatAccountId,
          type: 'debit',
          amount: params.amount,
          currency: 'USD',
          rail: 'ach',
          provider: 'cross-river'
        },
        // Crypto leg
        {
          accountId: params.cryptoAccountId,
          type: 'credit',
          amount: params.amount,
          currency: 'USDC',
          rail: 'ethereum',
          provider: 'bitgo'
        }
      ]
    });
  }
}
```

### Add Reconciliation Service:
```javascript
// NEW: Automated reconciliation
class ReconciliationService {
  async reconcileDailySettlement() {
    // 1. Get Cross River FBO transactions
    const crossRiverTxs = await crossRiver.getSettlementReport();

    // 2. Get BitGo custody transactions
    const bitgoTxs = await bitgo.getCustodyReport();

    // 3. Get Tempo FX settlements
    const tempoTxs = await tempo.getSettlementReport();

    // 4. Match with ledger entries
    const ledgerEntries = await ledger.getEntriesForDate(today);

    // 5. Identify discrepancies
    const discrepancies = this.findDiscrepancies(
      ledgerEntries,
      [...crossRiverTxs, ...bitgoTxs, ...tempoTxs]
    );

    // 6. Auto-resolve or flag for review
    return this.processDiscrepancies(discrepancies);
  }
}
```

---

## 4. INVOICE-FIRST INTEGRATION

### NEW: Connect TilliPay to Invoice-First Architecture
```javascript
// /services/monaypay/invoice-integration.js

import { InvoiceFirstWallet } from '../invoiceFirstWallet.js';
import { RouterV2 } from './router-v2.service.js';

export class InvoicePaymentOrchestrator {
  constructor() {
    this.invoiceWallet = new InvoiceFirstWallet();
    this.router = new RouterV2();
  }

  async processInvoicePayment(invoiceId, paymentMethod) {
    // 1. Get or create wallet from invoice
    const wallet = await this.invoiceWallet.getOrCreateWallet(invoiceId);

    // 2. Create payment intent
    const intent = await this.router.createIntent({
      amount: wallet.invoice.amount,
      source: paymentMethod,
      destination: wallet,
      type: 'invoice',
      metadata: {
        invoiceId,
        walletMode: wallet.mode, // ephemeral, persistent, adaptive
        ttl: wallet.ttl
      }
    });

    // 3. Execute payment
    const result = await this.router.executeIntent(intent.id);

    // 4. Update invoice status
    await this.updateInvoiceStatus(invoiceId, result);

    // 5. Handle ephemeral wallet lifecycle
    if (wallet.mode === 'ephemeral' && result.success) {
      await this.scheduleWalletZeroization(wallet, wallet.ttl);
    }

    return result;
  }

  async scheduleWalletZeroization(wallet, ttl) {
    // Schedule key destruction after TTL
    setTimeout(async () => {
      await this.invoiceWallet.zeroizeWallet(wallet.id);
    }, ttl);
  }
}
```

---

## 5. BRE (BUSINESS RULE ENGINE) INTEGRATION

### NEW: Add BRE hooks throughout TilliPay
```javascript
// /services/monaypay/bre-integration.js

export class BREIntegration {
  async checkCompliance(transaction) {
    const rules = [
      'AML_CHECK',
      'SANCTIONS_CHECK',
      'VELOCITY_CHECK',
      'JURISDICTION_CHECK',
      'ASSET_ALLOWLIST'
    ];

    for (const rule of rules) {
      const result = await this.bre.evaluate(rule, transaction);
      if (!result.passed) {
        throw new ComplianceError(result.reason, rule);
      }
    }

    // Generate attestation
    const attestation = await this.bre.createAttestation(transaction, rules);

    // Anchor on-chain (async)
    this.anchorAttestation(attestation);

    return attestation;
  }

  async anchorAttestation(attestation) {
    // Merkle tree construction
    const merkleRoot = this.buildMerkleTree(attestation);

    // Anchor to blockchain (Polygon or Base)
    await this.blockchain.anchorHash(merkleRoot);
  }
}
```

---

## 6. API CHANGES

### OLD: TilliPay API Endpoints
```javascript
// Likely endpoints
POST   /api/payments/charge      // Card charge
POST   /api/payments/ach         // ACH transfer
POST   /api/payments/refund      // Refund
GET    /api/payments/:id         // Get status
POST   /api/webhooks/stripe      // Stripe webhook
```

### NEW: MonayPay API Endpoints
```javascript
// Enhanced endpoints
// Payment Intents (NEW)
POST   /api/intents/create       // Create payment intent with routing
POST   /api/intents/:id/execute  // Execute intent
GET    /api/intents/:id          // Get intent status

// Multi-Rail Transfers
POST   /api/transfers/domestic   // ACH/FedNow/RTP via Cross River
POST   /api/transfers/cross-border // SWIFT/SEPA via Tempo
POST   /api/transfers/crypto     // Stablecoin via BitGo

// Invoice Integration
POST   /api/invoices/:id/pay     // Pay invoice with best rail
GET    /api/invoices/:id/wallet  // Get invoice wallet

// Provider-Specific
POST   /api/cross-river/webhook
POST   /api/bitgo/webhook
POST   /api/tempo/webhook

// Reconciliation
GET    /api/reconciliation/daily
POST   /api/reconciliation/resolve

// BRE Integration
POST   /api/compliance/check
GET    /api/attestations/:id
```

---

## 7. DATABASE SCHEMA CHANGES

### NEW Tables for MonayPay:
```sql
-- Payment Intents
CREATE TABLE payment_intents (
  id UUID PRIMARY KEY,
  amount DECIMAL(20,2),
  currency VARCHAR(3),
  source_type VARCHAR(50),
  source_details JSONB,
  destination_type VARCHAR(50),
  destination_details JSONB,
  selected_rail VARCHAR(50),
  fallback_rails JSONB,
  score_breakdown JSONB,
  status VARCHAR(20),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rail Health Metrics
CREATE TABLE rail_health (
  rail_name VARCHAR(50),
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  last_success TIMESTAMPTZ,
  last_failure TIMESTAMPTZ,
  circuit_state VARCHAR(20) DEFAULT 'CLOSED',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (rail_name, updated_at)
);

-- Dual-Entry Ledger Tables
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  posting_date DATE NOT NULL,
  description TEXT,
  invoice_id VARCHAR(100),
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY,
  journal_id UUID REFERENCES journal_entries(id),
  account_id VARCHAR(100),
  debit DECIMAL(20,8) DEFAULT 0,
  credit DECIMAL(20,8) DEFAULT 0,
  currency VARCHAR(10),
  rail VARCHAR(50),
  provider VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconciliation
CREATE TABLE reconciliation_reports (
  id UUID PRIMARY KEY,
  report_date DATE,
  provider VARCHAR(50),
  total_transactions INTEGER,
  total_amount DECIMAL(20,2),
  matched_count INTEGER,
  discrepancy_count INTEGER,
  status VARCHAR(20),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. CONFIGURATION CHANGES

### Environment Variables:
```bash
# REMOVE these TilliPay configs
- STRIPE_API_KEY
- STRIPE_WEBHOOK_SECRET
- PLAID_CLIENT_ID
- PLAID_SECRET
- DWOLLA_KEY
- DWOLLA_SECRET

# ADD these MonayPay configs
+ CROSS_RIVER_API_KEY
+ CROSS_RIVER_API_SECRET
+ CROSS_RIVER_FBO_ACCOUNT
+ BITGO_ACCESS_TOKEN
+ BITGO_ENTERPRISE_ID
+ TEMPO_API_KEY
+ TEMPO_API_SECRET

# Router Configuration
+ ROUTER_WEIGHT_COST=0.30
+ ROUTER_WEIGHT_TIME=0.25
+ ROUTER_WEIGHT_FX=0.15
+ ROUTER_WEIGHT_LIQUIDITY=0.10
+ ROUTER_WEIGHT_POLICY=0.15
+ ROUTER_WEIGHT_RELIABILITY=0.05

# Circuit Breaker Settings
+ CIRCUIT_FAILURE_THRESHOLD=5
+ CIRCUIT_RESET_TIMEOUT=60000
+ CIRCUIT_HALF_OPEN_REQUESTS=3
```

---

## 9. WEBSOCKET EVENTS

### OLD: TilliPay Events
```javascript
// Basic payment events
- payment.created
- payment.succeeded
- payment.failed
- refund.created
```

### NEW: MonayPay Events
```javascript
// Enhanced event system
- intent.created
- intent.routed
- intent.executed
- intent.failed

// Rail-specific events
- rail.selected
- rail.fallback
- rail.circuit_open
- rail.circuit_closed

// Provider events
- cross_river.transfer_initiated
- cross_river.transfer_completed
- bitgo.wallet_created
- bitgo.transfer_signed
- tempo.fx_quoted
- tempo.settlement_complete

// Reconciliation events
- reconciliation.started
- reconciliation.discrepancy_found
- reconciliation.completed

// BRE events
- compliance.check_passed
- compliance.check_failed
- attestation.created
- attestation.anchored
```

---

## 10. ERROR HANDLING & FALLBACKS

### Enhanced Error Handling:
```javascript
class MonayPayError extends Error {
  constructor(message, code, provider, rail) {
    super(message);
    this.code = code;
    this.provider = provider;
    this.rail = rail;
    this.timestamp = new Date();
  }
}

class PaymentFailureHandler {
  async handle(error, intent) {
    // 1. Log failure
    await this.logFailure(error, intent);

    // 2. Update circuit breaker
    this.circuitBreaker.recordFailure(intent.selectedRail);

    // 3. Try fallback rails
    for (const fallbackRail of intent.fallbackRails) {
      try {
        const result = await this.router.executeOnRail(fallbackRail, intent);
        if (result.success) {
          return result;
        }
      } catch (fallbackError) {
        continue;
      }
    }

    // 4. All rails failed - implement graceful degradation
    return this.gracefulDegradation(intent);
  }

  async gracefulDegradation(intent) {
    // Queue for retry
    await this.retryQueue.add(intent);

    // Notify user
    await this.notifyUser(intent, 'PAYMENT_DELAYED');

    // Return pending status
    return {
      success: false,
      status: 'queued_for_retry',
      retryAfter: '5 minutes'
    };
  }
}
```

---

## 11. TESTING STRATEGY

### Unit Tests for New Components:
```javascript
// __tests__/router-v2.test.js
describe('RouterV2', () => {
  it('should select optimal rail based on scoring', async () => {
    const router = new RouterV2();
    const intent = await router.createIntent({
      amount: 100,
      source: { country: 'US' },
      destination: { country: 'US' }
    });

    expect(intent.selectedRail).toBeDefined();
    expect(intent.scoreBreakdown).toBeDefined();
    expect(intent.fallbackRails.length).toBeGreaterThan(0);
  });

  it('should fallback when primary rail fails', async () => {
    // Test fallback logic
  });

  it('should open circuit after threshold failures', async () => {
    // Test circuit breaker
  });
});

// __tests__/providers/cross-river.test.js
describe('CrossRiverProvider', () => {
  it('should create ACH transfer', async () => {
    // Test ACH
  });

  it('should create FedNow transfer', async () => {
    // Test FedNow
  });
});
```

### Integration Tests:
```javascript
// __tests__/integration/invoice-payment-flow.test.js
describe('Invoice Payment Flow', () => {
  it('should process invoice payment end-to-end', async () => {
    // 1. Create invoice
    const invoice = await createInvoice({ amount: 100 });

    // 2. Create payment intent
    const intent = await router.createIntent({
      invoiceId: invoice.id,
      amount: invoice.amount
    });

    // 3. Execute payment
    const result = await router.executeIntent(intent.id);

    // 4. Verify ledger entries
    const ledgerEntries = await ledger.getEntriesForInvoice(invoice.id);

    expect(result.success).toBe(true);
    expect(ledgerEntries).toHaveLength(2); // Debit and credit
  });
});
```

---

## 12. MIGRATION CHECKLIST

### Week 1: Foundation
- [ ] Fork TilliPay to MonayPay repository
- [ ] Remove Stripe/Plaid/Circle dependencies
- [ ] Create provider adapter interface
- [ ] Implement mock providers for testing
- [ ] Setup new database schema

### Week 2: Core Services
- [ ] Build Cross River integration
- [ ] Build BitGo integration
- [ ] Refactor Tempo from blockchain to FX
- [ ] Implement Router v2 with scoring
- [ ] Build Dual-Entry Ledger v2

### Week 3: Integration
- [ ] Connect Invoice-First architecture
- [ ] Integrate BRE throughout system
- [ ] Implement reconciliation service
- [ ] Add circuit breakers
- [ ] Build idempotency layer

### Week 4: Testing & Polish
- [ ] Unit test coverage >80%
- [ ] Integration tests for all flows
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation

---

## 13. PERFORMANCE REQUIREMENTS

### Must Meet These SLAs:
```javascript
const requiredSLAs = {
  // From monay_wallet_redesign.md
  intentCreation: 250,        // ms @ P95
  railSelection: 50,          // ms
  achInitiation: 500,         // ms
  fedNowExecution: 1000,      // ms
  cryptoTransfer: 5000,       // ms
  webhookProcessing: 100,     // ms
  ledgerPosting: 200,         // ms
  reconciliation: 30000       // ms (30s for daily)
};

// Performance monitoring
class PerformanceMonitor {
  async measureLatency(operation, fn) {
    const start = Date.now();
    const result = await fn();
    const latency = Date.now() - start;

    // Log to metrics
    await this.metrics.record(operation, latency);

    // Alert if SLA breached
    if (latency > requiredSLAs[operation]) {
      await this.alerting.slaBreached(operation, latency);
    }

    return result;
  }
}
```

---

## 14. ROLLBACK PLAN

### Feature Flags for Safe Migration:
```javascript
// config/features.js
module.exports = {
  // Provider flags
  USE_CROSS_RIVER: process.env.USE_CROSS_RIVER === 'true',
  USE_BITGO: process.env.USE_BITGO === 'true',
  USE_TEMPO_FX: process.env.USE_TEMPO_FX === 'true',

  // Feature flags
  USE_ROUTER_V2: process.env.USE_ROUTER_V2 === 'true',
  USE_DUAL_LEDGER: process.env.USE_DUAL_LEDGER === 'true',
  USE_CIRCUIT_BREAKERS: process.env.USE_CIRCUIT_BREAKERS === 'true',

  // Gradual rollout
  ROUTER_V2_PERCENTAGE: parseInt(process.env.ROUTER_V2_PERCENTAGE || '0'),

  // Emergency killswitch
  EMERGENCY_MODE: process.env.EMERGENCY_MODE === 'true'
};

// Usage in code
if (features.USE_ROUTER_V2) {
  return await routerV2.createIntent(params);
} else {
  return await legacyRouter.route(params); // TilliPay original
}
```

---

## 15. SUCCESS CRITERIA

### Before declaring MonayPay ready:
```bash
# 1. No TilliPay legacy dependencies
grep -r "stripe\|plaid\|circle" src/ | wc -l
# Expected: 0

# 2. All providers integrated
curl -X POST localhost:3001/api/health/providers
# Expected: { crossRiver: 'healthy', bitgo: 'healthy', tempo: 'healthy' }

# 3. Router v2 operational
curl -X POST localhost:3001/api/intents/create -d '{"amount": 100}'
# Expected: Intent with scoring and rail selection

# 4. Dual ledger balanced
psql -c "SELECT COUNT(*) FROM journal_entries WHERE status != 'balanced'"
# Expected: 0

# 5. All tests passing
npm test
# Expected: 100% pass rate

# 6. Performance SLAs met
npm run perf:test
# Expected: All operations within SLA limits
```

---

This transformation guide provides a complete roadmap for converting TilliPay into MonayPay with all the required integrations and enhancements. The key is to maintain backward compatibility during migration using feature flags while gradually rolling out new capabilities.