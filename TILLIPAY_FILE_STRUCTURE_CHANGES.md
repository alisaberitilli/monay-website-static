# 📁 TILLIPAY FILE STRUCTURE & TRANSFORMATION MAP
## Exact File-by-File Changes for MonayPay
**Date**: October 2025

---

## 🗂️ EXPECTED TILLIPAY STRUCTURE

```
tillipay/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── payments.js        → MODIFY: Add intent-based routing
│   │   │   ├── webhooks.js        → REPLACE: Provider-specific webhooks
│   │   │   ├── accounts.js        → MODIFY: Add FBO account management
│   │   │   └── cards.js           → KEEP: Card processing
│   │   └── middleware/
│   │       ├── auth.js            → KEEP: Authentication
│   │       ├── rateLimit.js       → KEEP: Rate limiting
│   │       └── validation.js      → MODIFY: Add provider validations
│   │
│   ├── services/
│   │   ├── payments/
│   │   │   ├── processor.js       → REPLACE: With RouterV2
│   │   │   ├── stripe.js          → DELETE: Remove Stripe
│   │   │   ├── plaid.js           → DELETE: Remove Plaid
│   │   │   ├── circle.js          → DELETE: Remove Circle (if exists)
│   │   │   └── ach.js             → REPLACE: With Cross River ACH
│   │   │
│   │   ├── ledger/
│   │   │   ├── transactions.js    → REPLACE: Dual-entry ledger
│   │   │   ├── accounts.js        → MODIFY: Add multi-currency
│   │   │   └── reports.js         → ADD: Reconciliation reports
│   │   │
│   │   ├── compliance/
│   │   │   ├── kyc.js            → KEEP: KYC checks
│   │   │   ├── aml.js            → MODIFY: Integrate BRE
│   │   │   └── sanctions.js      → MODIFY: Integrate BRE
│   │   │
│   │   └── webhooks/
│   │       ├── handler.js        → REPLACE: Multi-provider handler
│   │       └── verification.js   → REPLACE: Provider-specific verification
│   │
│   ├── models/
│   │   ├── Payment.js            → MODIFY: Add intent fields
│   │   ├── Transaction.js        → REPLACE: Dual-entry model
│   │   ├── Account.js           → MODIFY: Add provider fields
│   │   └── Webhook.js           → KEEP: Webhook logs
│   │
│   ├── config/
│   │   ├── database.js          → KEEP: Database config
│   │   ├── providers.js         → ADD: Provider configurations
│   │   └── features.js          → ADD: Feature flags
│   │
│   └── utils/
│       ├── crypto.js            → KEEP: Encryption utils
│       ├── logger.js            → KEEP: Logging
│       └── metrics.js           → MODIFY: Add SLA tracking
│
├── tests/
├── migrations/
└── package.json                  → UPDATE: Dependencies
```

---

## 📝 FILE-BY-FILE TRANSFORMATION

## 1. CORE PAYMENT PROCESSOR

### DELETE: `src/services/payments/stripe.js`
```javascript
// REMOVE ENTIRELY - Replace with Cross River
```

### DELETE: `src/services/payments/plaid.js`
```javascript
// REMOVE ENTIRELY - Replace with Cross River
```

### DELETE: `src/services/payments/circle.js` (if exists)
```javascript
// REMOVE ENTIRELY - Replace with BitGo
```

### REPLACE: `src/services/payments/processor.js`
```javascript
// OLD: TilliPay processor.js
class PaymentProcessor {
  async processPayment(payment) {
    if (payment.method === 'card') {
      return await this.stripe.charge(payment);
    } else if (payment.method === 'ach') {
      return await this.plaid.transfer(payment);
    }
  }
}

// NEW: MonayPay processor.js (renamed to router-v2.js)
import { RouterV2 } from './router-v2.js';
import { CrossRiverProvider } from '../providers/cross-river/index.js';
import { BitGoProvider } from '../providers/bitgo/index.js';
import { TempoProvider } from '../providers/tempo/index.js';

class PaymentProcessor {
  constructor() {
    this.router = new RouterV2();
    this.providers = {
      crossRiver: new CrossRiverProvider(),
      bitgo: new BitGoProvider(),
      tempo: new TempoProvider()
    };
  }

  async processPayment(payment) {
    // Create intent with intelligent routing
    const intent = await this.router.createIntent({
      amount: payment.amount,
      source: payment.source,
      destination: payment.destination,
      metadata: payment.metadata
    });

    // Execute on selected rail
    return await this.router.executeIntent(intent.id);
  }
}
```

---

## 2. PROVIDER SERVICES (NEW DIRECTORY)

### CREATE: `src/services/providers/cross-river/index.js`
```javascript
// NEW FILE - Cross River Bank integration
export class CrossRiverProvider {
  constructor(config) {
    this.apiUrl = config.apiUrl || process.env.CROSS_RIVER_API_URL;
    this.apiKey = process.env.CROSS_RIVER_API_KEY;
    this.fboAccount = process.env.CROSS_RIVER_FBO_ACCOUNT;
  }

  async createACHTransfer(params) {
    // Implementation
  }

  async createFedNowTransfer(params) {
    // Implementation
  }

  async createRTPTransfer(params) {
    // Implementation
  }

  async createWireTransfer(params) {
    // Implementation
  }
}
```

### CREATE: `src/services/providers/bitgo/index.js`
```javascript
// NEW FILE - BitGo custody integration
export class BitGoProvider {
  constructor(config) {
    this.apiUrl = config.apiUrl || process.env.BITGO_API_URL;
    this.accessToken = process.env.BITGO_ACCESS_TOKEN;
    this.enterpriseId = process.env.BITGO_ENTERPRISE_ID;
  }

  async createWallet(params) {
    // Implementation
  }

  async createTransfer(params) {
    // Implementation
  }

  async mintStablecoin(params) {
    // Implementation
  }

  async redeemStablecoin(params) {
    // Implementation
  }
}
```

### CREATE: `src/services/providers/tempo/index.js`
```javascript
// NEW FILE - Tempo FX integration
export class TempoProvider {
  constructor(config) {
    this.apiUrl = config.apiUrl || process.env.TEMPO_API_URL;
    this.apiKey = process.env.TEMPO_API_KEY;
  }

  async getFXQuote(params) {
    // Implementation
  }

  async executeFXTransfer(params) {
    // Implementation
  }

  async getCorridorInfo(fromCountry, toCountry) {
    // Implementation
  }
}
```

---

## 3. LEDGER TRANSFORMATION

### REPLACE: `src/services/ledger/transactions.js`
```javascript
// OLD: Single-entry ledger
class TransactionService {
  async recordTransaction(tx) {
    return await Transaction.create({
      amount: tx.amount,
      type: tx.type,
      status: tx.status
    });
  }
}

// NEW: Dual-entry ledger
class LedgerService {
  async createPosting(posting) {
    const trx = await db.transaction();

    try {
      // Create journal entry
      const journal = await JournalEntry.create({
        description: posting.description,
        invoiceId: posting.invoiceId,
        date: posting.date
      }, { transaction: trx });

      // Create balanced entries
      for (const entry of posting.entries) {
        await LedgerEntry.create({
          journalId: journal.id,
          accountId: entry.accountId,
          debit: entry.debit || 0,
          credit: entry.credit || 0,
          currency: entry.currency,
          rail: entry.rail,
          provider: entry.provider
        }, { transaction: trx });
      }

      // Verify balance
      const debits = posting.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
      const credits = posting.entries.reduce((sum, e) => sum + (e.credit || 0), 0);

      if (debits !== credits) {
        throw new Error('Unbalanced posting');
      }

      await trx.commit();
      return journal;

    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
```

---

## 4. API ROUTES CHANGES

### MODIFY: `src/api/routes/payments.js`
```javascript
// OLD: Direct payment processing
router.post('/charge', async (req, res) => {
  const result = await processor.charge(req.body);
  res.json(result);
});

// NEW: Intent-based payment processing
router.post('/intents/create', async (req, res) => {
  const intent = await processor.createIntent(req.body);
  res.json(intent);
});

router.post('/intents/:id/execute', async (req, res) => {
  const result = await processor.executeIntent(req.params.id);
  res.json(result);
});

router.get('/intents/:id', async (req, res) => {
  const intent = await processor.getIntent(req.params.id);
  res.json(intent);
});
```

### REPLACE: `src/api/routes/webhooks.js`
```javascript
// OLD: Single provider webhook
router.post('/webhook/stripe', stripeWebhook);

// NEW: Multi-provider webhooks
router.post('/webhook/cross-river', crossRiverWebhook);
router.post('/webhook/bitgo', bitgoWebhook);
router.post('/webhook/tempo', tempoWebhook);
```

---

## 5. DATABASE MIGRATIONS

### CREATE: `migrations/001_add_monaypay_tables.sql`
```sql
-- Payment Intents
CREATE TABLE payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(20,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  source_type VARCHAR(50),
  source_details JSONB,
  destination_type VARCHAR(50),
  destination_details JSONB,
  selected_rail VARCHAR(50),
  fallback_rails JSONB,
  score_breakdown JSONB,
  status VARCHAR(20) DEFAULT 'created',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider Accounts
CREATE TABLE provider_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL,
  account_type VARCHAR(50),
  account_id VARCHAR(100),
  credentials JSONB, -- Encrypted
  metadata JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dual-Entry Ledger
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posting_date DATE NOT NULL,
  description TEXT,
  invoice_id VARCHAR(100),
  reference_type VARCHAR(50),
  reference_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID REFERENCES journal_entries(id),
  account_id VARCHAR(100) NOT NULL,
  debit DECIMAL(20,8) DEFAULT 0,
  credit DECIMAL(20,8) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  rail VARCHAR(50),
  provider VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rail Health
CREATE TABLE rail_health (
  rail_name VARCHAR(50),
  timestamp TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  p95_latency_ms INTEGER,
  p99_latency_ms INTEGER,
  circuit_state VARCHAR(20) DEFAULT 'CLOSED',
  PRIMARY KEY (rail_name, timestamp)
);
```

---

## 6. CONFIGURATION FILES

### UPDATE: `package.json`
```json
{
  "name": "monaypay",
  "version": "2.0.0",
  "type": "module",
  "dependencies": {
    // REMOVE
    - "stripe": "^x.x.x",
    - "plaid": "^x.x.x",
    - "@circle/circle-sdk": "^x.x.x",

    // ADD
    + "@bitgo/sdk": "^x.x.x",
    + "axios": "^1.x.x",
    + "jsonwebtoken": "^9.x.x",
    + "decimal.js": "^10.x.x"
  }
}
```

### CREATE: `src/config/providers.js`
```javascript
export const providerConfig = {
  crossRiver: {
    apiUrl: process.env.CROSS_RIVER_API_URL,
    webhookPath: '/api/webhook/cross-river',
    supportedRails: ['ach', 'fednow', 'rtp', 'wire'],
    limits: {
      ach: { min: 0.01, max: 100000, daily: 500000 },
      fednow: { min: 0.01, max: 100000, daily: 1000000 },
      rtp: { min: 0.01, max: 100000, daily: 1000000 },
      wire: { min: 100, max: 10000000, daily: 50000000 }
    }
  },

  bitgo: {
    apiUrl: process.env.BITGO_API_URL,
    webhookPath: '/api/webhook/bitgo',
    supportedCoins: ['usdc', 'usdt', 'pyusd', 'eurc'],
    walletTypes: ['hot', 'cold', 'trading']
  },

  tempo: {
    apiUrl: process.env.TEMPO_API_URL,
    webhookPath: '/api/webhook/tempo',
    supportedCorridors: ['US-EU', 'US-UK', 'US-IN', 'EU-IN'],
    fxSpread: 0.0035 // 35 basis points
  }
};
```

### CREATE: `src/config/features.js`
```javascript
export const features = {
  // Provider toggles
  providers: {
    crossRiver: {
      enabled: process.env.ENABLE_CROSS_RIVER === 'true',
      ach: true,
      fednow: true,
      rtp: true,
      wire: true
    },
    bitgo: {
      enabled: process.env.ENABLE_BITGO === 'true',
      custody: true,
      stablecoins: true,
      multiSig: false // Coming soon
    },
    tempo: {
      enabled: process.env.ENABLE_TEMPO === 'true',
      fx: true,
      crossBorder: true
    }
  },

  // Feature flags
  routerV2: process.env.USE_ROUTER_V2 !== 'false', // Default on
  dualLedger: process.env.USE_DUAL_LEDGER !== 'false',
  circuitBreakers: process.env.USE_CIRCUIT_BREAKERS !== 'false',
  breIntegration: process.env.USE_BRE !== 'false',

  // Gradual rollout
  routerV2Percentage: parseInt(process.env.ROUTER_V2_PERCENTAGE || '100'),

  // Emergency
  maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
};
```

---

## 7. INTEGRATION POINTS

### CREATE: `src/services/invoice-integration.js`
```javascript
// Connect to existing Invoice-First architecture
import { InvoiceFirstWallet } from '../../monay-backend-common/services/invoiceFirstWallet.js';

export class InvoiceIntegration {
  constructor(processor) {
    this.processor = processor;
    this.invoiceWallet = new InvoiceFirstWallet();
  }

  async processInvoicePayment(invoiceId, paymentMethod) {
    // Get invoice wallet
    const wallet = await this.invoiceWallet.getOrCreateWallet(invoiceId);

    // Process payment through MonayPay
    const payment = {
      amount: wallet.invoice.amount,
      source: paymentMethod,
      destination: {
        walletId: wallet.id,
        type: wallet.mode // ephemeral, persistent, adaptive
      },
      metadata: {
        invoiceId,
        ttl: wallet.ttl
      }
    };

    const result = await this.processor.processPayment(payment);

    // Handle ephemeral wallet lifecycle
    if (wallet.mode === 'ephemeral' && result.success) {
      setTimeout(() => {
        this.invoiceWallet.zeroizeWallet(wallet.id);
      }, wallet.ttl);
    }

    return result;
  }
}
```

---

## 8. TESTING UPDATES

### UPDATE: `tests/payments.test.js`
```javascript
// OLD: Test Stripe/Plaid
describe('Payments', () => {
  it('should charge card via Stripe', async () => {
    // Stripe test
  });
});

// NEW: Test multi-rail orchestration
describe('Payment Orchestration', () => {
  it('should create payment intent with routing', async () => {
    const intent = await processor.createIntent({
      amount: 100,
      source: { type: 'bank', country: 'US' },
      destination: { type: 'bank', country: 'US' }
    });

    expect(intent.selectedRail).toBeDefined();
    expect(['ach', 'fednow', 'rtp']).toContain(intent.selectedRail);
  });

  it('should fallback to secondary rail on failure', async () => {
    // Mock primary rail failure
    jest.spyOn(crossRiver, 'createFedNowTransfer').mockRejectedValue(new Error('Service unavailable'));

    const result = await processor.processPayment(payment);

    expect(result.rail).toBe('ach'); // Fallback to ACH
    expect(result.success).toBe(true);
  });

  it('should enforce circuit breaker after failures', async () => {
    // Trigger multiple failures
    for (let i = 0; i < 5; i++) {
      await processor.processPayment(payment).catch(() => {});
    }

    // Circuit should be open
    const intent = await processor.createIntent(payment);
    expect(intent.selectedRail).not.toBe('fednow'); // Should skip failed rail
  });
});
```

---

## 9. DEPLOYMENT CHECKLIST

### Pre-Deployment:
```bash
# 1. Fork TilliPay
git clone https://github.com/tillipay/core tillipay-fork
cd tillipay-fork
git remote add monaypay https://github.com/monay/monaypay
git checkout -b monaypay-transformation

# 2. Remove legacy dependencies
npm uninstall stripe plaid @circle/circle-sdk

# 3. Add new dependencies
npm install axios decimal.js jsonwebtoken

# 4. Copy MonayPay services
cp -r ../monay-backend-common/src/services/providers ./src/services/
cp ../monay-backend-common/src/services/monaypay/* ./src/services/

# 5. Run migrations
npm run migrate

# 6. Test with mocks
ENABLE_MOCKS=true npm test

# 7. Deploy with feature flags
ROUTER_V2_PERCENTAGE=10 npm run deploy # 10% rollout
```

---

## 10. ROLLBACK PROCEDURE

### If issues arise:
```javascript
// Emergency rollback in config/features.js
export const emergencyRollback = () => {
  features.routerV2 = false;
  features.providers.crossRiver.enabled = false;
  features.providers.bitgo.enabled = false;
  features.providers.tempo.enabled = false;

  // Revert to TilliPay legacy
  features.useLegacyProcessor = true;

  console.error('EMERGENCY: Rolled back to TilliPay legacy mode');
};

// Trigger via API or env variable
if (process.env.EMERGENCY_ROLLBACK === 'true') {
  emergencyRollback();
}
```

---

This detailed file structure map shows exactly what needs to be changed when forking TilliPay to create MonayPay. The key is maintaining backward compatibility while gradually introducing new capabilities through feature flags.