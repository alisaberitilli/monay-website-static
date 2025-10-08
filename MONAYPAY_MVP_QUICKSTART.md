# ⚡ MONAYPAY MVP QUICK START GUIDE
## Minimum Viable Implementation from TilliPay
**Timeline**: 5 Days to Working MVP

---

## 🎯 DAY 1: FORK & STRIP (4 hours)

### Morning (2 hours):
```bash
# 1. Fork TilliPay
git clone [tillipay-repo] monaypay
cd monaypay

# 2. Remove ALL payment provider dependencies
npm uninstall stripe plaid dwolla synapsepay @circle/circle-sdk

# 3. Delete provider files
rm -rf src/services/stripe/
rm -rf src/services/plaid/
rm -rf src/services/circle/
rm -rf src/services/dwolla/

# 4. Comment out broken imports (temporarily)
# This will break the app but that's OK for now
```

### Afternoon (2 hours):
```bash
# 5. Copy mock providers from Monay
cp -r ../monay-backend-common/src/services/providers ./src/services/

# 6. Copy Router v2
cp ../monay-backend-common/src/services/monaypay/router-v2.service.js ./src/services/

# 7. Install minimal new dependencies
npm install axios decimal.js

# 8. Fix package.json
# Add: "type": "module"
```

---

## 🎯 DAY 2: MINIMAL INTEGRATION (6 hours)

### Create Adapter Layer:
```javascript
// src/services/adapter.js
// This makes TilliPay work with new providers WITHOUT changing everything

import { getCrossRiverClient } from './providers/cross-river/client-mock.js';
import { getBitGoClient } from './providers/bitgo/client-mock.js';
import { getRouter } from './monaypay/router-v2.service.js';

export class PaymentAdapter {
  constructor() {
    this.crossRiver = getCrossRiverClient();
    this.bitgo = getBitGoClient();
    this.router = getRouter();
    this.useLegacy = false; // Can toggle for rollback
  }

  // Adapter method - works with existing TilliPay code
  async processPayment(payment) {
    if (this.useLegacy) {
      // Fallback to original TilliPay logic if needed
      throw new Error('Legacy mode not available');
    }

    // Convert TilliPay payment to MonayPay intent
    const intent = await this.router.createIntent({
      amount: payment.amount,
      currency: payment.currency || 'USD',
      source: this.mapSource(payment),
      destination: this.mapDestination(payment)
    });

    // Execute and return TilliPay-compatible response
    const result = await this.router.executeIntent(intent.id);

    return {
      id: result.transactionId,
      status: result.success ? 'succeeded' : 'failed',
      amount: payment.amount,
      provider: result.rail,
      metadata: result
    };
  }

  mapSource(payment) {
    return {
      type: payment.source_type || 'bank',
      account: payment.source_account,
      routing: payment.source_routing,
      country: 'US'
    };
  }

  mapDestination(payment) {
    return {
      type: payment.destination_type || 'bank',
      account: payment.destination_account,
      routing: payment.destination_routing,
      country: payment.destination_country || 'US'
    };
  }
}

// Replace old processor
export const paymentProcessor = new PaymentAdapter();
```

### Update Main Payment Route:
```javascript
// src/api/routes/payments.js
import { paymentProcessor } from '../../services/adapter.js';

// Keep existing endpoint, new logic
router.post('/payments', async (req, res) => {
  try {
    const result = await paymentProcessor.processPayment(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add new intent endpoints alongside
router.post('/intents/create', async (req, res) => {
  const intent = await paymentProcessor.router.createIntent(req.body);
  res.json(intent);
});
```

---

## 🎯 DAY 3: DATABASE UPDATES (4 hours)

### Minimal Schema Additions:
```sql
-- Just the essentials for MVP
-- migrations/add_monaypay_mvp.sql

-- Payment intents (minimal)
CREATE TABLE IF NOT EXISTS payment_intents (
  id VARCHAR(100) PRIMARY KEY,
  amount DECIMAL(20,2),
  selected_rail VARCHAR(50),
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider configs (minimal)
CREATE TABLE IF NOT EXISTS provider_configs (
  provider VARCHAR(50) PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  config JSONB
);

-- Insert default configs
INSERT INTO provider_configs (provider, enabled, config) VALUES
('cross-river', true, '{"mock": true}'),
('bitgo', true, '{"mock": true}'),
('tempo', true, '{"mock": true}');
```

---

## 🎯 DAY 4: INVOICE INTEGRATION (4 hours)

### Connect to Existing Invoice-First:
```javascript
// src/services/invoice-connector.js
// Minimal integration with existing Invoice-First system

export class InvoiceConnector {
  constructor(processor) {
    this.processor = processor;
  }

  async payInvoice(invoiceId, paymentMethod) {
    // Fetch invoice from Monay backend
    const invoice = await fetch(`http://localhost:3001/api/invoices/${invoiceId}`)
      .then(res => res.json());

    // Process payment
    const payment = {
      amount: invoice.amount,
      source_type: paymentMethod.type,
      source_account: paymentMethod.account,
      source_routing: paymentMethod.routing,
      destination_account: invoice.walletAddress,
      metadata: { invoiceId }
    };

    const result = await this.processor.processPayment(payment);

    // Update invoice status
    await fetch(`http://localhost:3001/api/invoices/${invoiceId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'paid', transactionId: result.id })
    });

    return result;
  }
}
```

### Add Invoice Endpoint:
```javascript
// src/api/routes/invoices.js
router.post('/invoices/:id/pay', async (req, res) => {
  const connector = new InvoiceConnector(paymentProcessor);
  const result = await connector.payInvoice(req.params.id, req.body.paymentMethod);
  res.json(result);
});
```

---

## 🎯 DAY 5: TESTING & DEPLOYMENT (6 hours)

### Basic Test Suite:
```javascript
// tests/mvp.test.js
describe('MonayPay MVP', () => {
  it('should process payment through router', async () => {
    const payment = {
      amount: 100,
      source_account: '123456789',
      source_routing: '021000021',
      destination_account: '987654321',
      destination_routing: '021000021'
    };

    const result = await paymentProcessor.processPayment(payment);

    expect(result.status).toBe('succeeded');
    expect(result.provider).toBeDefined();
  });

  it('should handle invoice payment', async () => {
    const invoiceId = 'inv_123';
    const paymentMethod = {
      type: 'bank',
      account: '123456789',
      routing: '021000021'
    };

    const connector = new InvoiceConnector(paymentProcessor);
    const result = await connector.payInvoice(invoiceId, paymentMethod);

    expect(result.status).toBe('succeeded');
  });
});
```

### Environment Setup:
```bash
# .env.mvp
NODE_ENV=development
PORT=3010  # Different from TilliPay

# Mock mode (no real providers yet)
USE_MOCK_PROVIDERS=true

# Feature flags
USE_ROUTER_V2=true
USE_LEGACY_FALLBACK=false

# Connection to Monay backend
MONAY_BACKEND_URL=http://localhost:3001
```

### Quick Start Script:
```bash
#!/bin/bash
# start-mvp.sh

echo "🚀 Starting MonayPay MVP..."

# Check dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run migrations
echo "📊 Running database migrations..."
npm run migrate

# Start in dev mode
echo "✨ Starting MonayPay on port 3010..."
USE_MOCK_PROVIDERS=true npm run dev
```

---

## ✅ MVP CHECKLIST

### What You'll Have After 5 Days:
- [x] TilliPay forked and stripped of legacy providers
- [x] Mock providers (Cross River, BitGo, Tempo) working
- [x] Router v2 with intelligent scoring
- [x] Adapter layer for backward compatibility
- [x] Basic invoice payment integration
- [x] Minimal database schema
- [x] Working test suite
- [x] Development environment

### What You WON'T Have (Phase 2):
- [ ] Real provider APIs (need registration)
- [ ] Dual-entry ledger (using simple for now)
- [ ] BRE integration (basic compliance only)
- [ ] Circuit breakers (basic retry only)
- [ ] Reconciliation (manual for now)
- [ ] Production deployment

---

## 🚦 GO/NO-GO DECISION POINTS

### After Day 1:
✅ **GO** if: TilliPay forks successfully and dependencies removed
❌ **NO-GO** if: TilliPay has hard dependencies that can't be removed

### After Day 3:
✅ **GO** if: Mock providers working and router selecting rails
❌ **NO-GO** if: Integration fails or database conflicts

### After Day 5:
✅ **GO** if: Can process payment end-to-end with mocks
❌ **NO-GO** if: Critical functionality broken

---

## 🎬 IMMEDIATE NEXT STEPS

### Today (Hour 1):
```bash
# 1. Clone TilliPay (or get the code)
git clone [tillipay-source] monaypay-mvp

# 2. Check structure
cd monaypay-mvp
ls -la src/services/

# 3. Identify payment providers to remove
grep -r "stripe\|plaid\|circle" src/
```

### Today (Hour 2):
```bash
# 4. Create feature branch
git checkout -b monaypay-transformation

# 5. Start removing dependencies
npm uninstall stripe plaid

# 6. Copy mock providers
cp -r ../monay/monay-backend-common/src/services/providers ./src/services/
```

### Today (Hour 3):
```javascript
// 7. Create adapter.js
// 8. Test basic flow
npm test
```

---

## 💡 PRO TIPS

1. **Don't try to change everything at once** - Use adapter pattern
2. **Keep TilliPay endpoints working** - Add new ones alongside
3. **Use feature flags** - Can rollback instantly
4. **Test with mocks first** - Real providers can wait
5. **Document changes** - Track what you modified

---

## 🆘 TROUBLESHOOTING

### Common Issues:

**Issue**: Import errors after removing Stripe/Plaid
```javascript
// Solution: Create stub files temporarily
// src/services/stripe.js
export default {
  charge: async () => { throw new Error('Stripe removed - use Router v2'); }
};
```

**Issue**: Database connection errors
```javascript
// Solution: Ensure models are compatible
// Update Sequelize models to match schema
```

**Issue**: Tests failing
```javascript
// Solution: Mock what you need
jest.mock('./services/providers/cross-river/client-mock.js');
```

---

## 🎉 SUCCESS CRITERIA

You have a working MVP when you can:

1. ✅ Start MonayPay on port 3010
2. ✅ Call POST /payments with TilliPay payload
3. ✅ See Router v2 select a rail
4. ✅ Get successful response with mock provider
5. ✅ Pay an invoice from Monay backend

Once these work, you can gradually:
- Replace mocks with real providers
- Add dual-entry ledger
- Implement BRE integration
- Add circuit breakers
- Build reconciliation

---

This MVP approach gets you a working MonayPay in 5 days, allowing you to test the core concept while waiting for provider registrations!