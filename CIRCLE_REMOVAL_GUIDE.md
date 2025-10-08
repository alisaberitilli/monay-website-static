# 🔴 CIRCLE REMOVAL GUIDE
## Complete Elimination of Circle Dependencies
**Priority**: CRITICAL
**Timeline**: 3 days
**Team**: Backend Core

---

## 📍 CURRENT CIRCLE DEPENDENCIES

### Files to DELETE:
```bash
/monay-backend-common/src/services/
  ├── circle.js                    # Main Circle service
  ├── circle-wallet-service.js     # Circle wallet operations
  ├── circle-metrics.js            # Circle health metrics
  ├── circle-health.js             # Circle health monitoring
  └── circle-mock.js               # Circle mock service
```

### Files that IMPORT Circle (need refactoring):
```javascript
// wallet-orchestrator-service.js
import CircleService from './circle.js';
import CircleWalletService from './circle-wallet-service.js';

// stablecoin-provider-factory.js
import CircleService from './circle.js';

// consumer-wallet-service.js
import { CircleWalletService } from './circle-wallet-service.js';

// enterprise-treasury.js
import CircleService from './circle.js';
```

---

## 🔄 REPLACEMENT STRATEGY

### Step 1: Create Provider Abstraction
```javascript
// services/providers/provider-interface.js
export class PaymentProvider {
  async createWallet(params) { throw new Error('Not implemented'); }
  async transfer(params) { throw new Error('Not implemented'); }
  async getBalance(walletId) { throw new Error('Not implemented'); }
  async mintStablecoin(params) { throw new Error('Not implemented'); }
  async redeemStablecoin(params) { throw new Error('Not implemented'); }
  async getProviderHealth() { throw new Error('Not implemented'); }
}
```

### Step 2: Replace Circle with BitGo in Stablecoin Operations

**BEFORE (Circle)**:
```javascript
// stablecoin-provider-factory.js
import CircleService from './circle.js';

async function mintUSDC(amount) {
  return await CircleService.mintUSDC({
    amount,
    destinationAddress: walletAddress
  });
}
```

**AFTER (BitGo)**:
```javascript
// stablecoin-provider-factory.js
import BitGoService from './providers/bitgo/custody.service.js';

async function mintUSDC(amount) {
  return await BitGoService.mintStablecoin({
    coin: 'usdc',
    amount,
    destinationAddress: walletAddress,
    bankAccountId: process.env.CROSS_RIVER_FBO_ACCOUNT
  });
}
```

### Step 3: Replace Circle Wallets with BitGo Custody

**BEFORE (Circle)**:
```javascript
// wallet-orchestrator-service.js
const circleWallet = await CircleWalletService.create({
  idempotencyKey: uuid(),
  description: 'User wallet'
});
```

**AFTER (BitGo)**:
```javascript
// wallet-orchestrator-service.js
const wallet = await BitGoService.createWallet({
  coin: 'usdc',
  label: 'User wallet',
  type: 'hot',
  invoiceId: invoice.id // Invoice-First approach
});
```

### Step 4: Replace Circle Transfers with Router v2

**BEFORE (Circle)**:
```javascript
// Transfer using Circle
const transfer = await CircleService.createTransfer({
  source: { type: 'wallet', id: sourceWalletId },
  destination: { type: 'wallet', id: destWalletId },
  amount: { currency: 'USD', amount: '100.00' }
});
```

**AFTER (MonayPay Router)**:
```javascript
// Transfer using intelligent routing
const intent = await RouterV2.createIntent({
  source: sourceWallet,
  destination: destWallet,
  amount: 100.00,
  currency: 'USD'
});

const result = await RouterV2.execute(intent);
// Router automatically selects: Cross River, BitGo, or Tempo
```

---

## 📝 REFACTORING CHECKLIST

### wallet-orchestrator-service.js
```javascript
// Line 5: Remove
- import CircleService from './circle.js';
+ import BitGoService from './providers/bitgo/custody.service.js';
+ import RouterV2 from './monaypay/router-v2.service.js';

// Line 45: Replace createCircleWallet()
- const wallet = await CircleService.createWallet(params);
+ const wallet = await BitGoService.createWallet(params);

// Line 78: Replace Circle transfer
- const result = await CircleService.transfer(params);
+ const intent = await RouterV2.createIntent(params);
+ const result = await RouterV2.execute(intent);

// Line 120: Replace Circle balance check
- const balance = await CircleService.getBalance(walletId);
+ const balance = await BitGoService.getBalance(walletId);
```

### stablecoin-provider-factory.js
```javascript
// Complete rewrite focusing on BitGo
class StablecoinProviderFactory {
  constructor() {
    this.providers = {
      'bitgo': new BitGoService(),
      'tempo': new TempoService()
    };
    // NO CIRCLE
  }

  async getProvider(coin) {
    // BitGo for custody operations
    if (['usdc', 'usdt', 'pyusd', 'eurc'].includes(coin)) {
      return this.providers.bitgo;
    }
    // Tempo for cross-border
    if (this.isCrossBorder(coin)) {
      return this.providers.tempo;
    }
    return this.providers.bitgo; // Default
  }
}
```

### Environment Variables Update
```bash
# .env - REMOVE these:
- CIRCLE_API_KEY=xxx
- CIRCLE_API_URL=xxx
- CIRCLE_WEBHOOK_SECRET=xxx

# .env - ADD these:
+ BITGO_ACCESS_TOKEN=xxx
+ BITGO_ENTERPRISE_ID=xxx
+ CROSS_RIVER_API_KEY=xxx
+ CROSS_RIVER_FBO_ACCOUNT=xxx
```

---

## 🧪 TESTING STRATEGY

### 1. Unit Tests to Update
```javascript
// __tests__/services/wallet.test.js
describe('Wallet Service', () => {
  // REMOVE Circle tests
  - it('should create Circle wallet', ...);
  - it('should transfer via Circle', ...);

  // ADD BitGo/Router tests
  + it('should create BitGo wallet', ...);
  + it('should route transfer optimally', ...);
  + it('should fallback when primary rail fails', ...);
});
```

### 2. Integration Tests
```javascript
// Create new test file
// __tests__/integration/circle-removal.test.js
describe('Circle Removal Verification', () => {
  it('should have zero Circle imports', async () => {
    const files = await getAllSourceFiles();
    const circleImports = files.filter(f =>
      f.includes('circle') || f.includes('Circle')
    );
    expect(circleImports).toHaveLength(0);
  });

  it('should successfully mint USDC via BitGo', async () => {
    const result = await BitGoService.mintStablecoin({
      coin: 'usdc',
      amount: 100
    });
    expect(result.status).toBe('success');
  });
});
```

### 3. Migration Testing
```javascript
// Verify existing functionality still works
describe('Backwards Compatibility', () => {
  it('should maintain existing wallet operations', ...);
  it('should maintain existing transfer operations', ...);
  it('should maintain existing balance operations', ...);
});
```

---

## 🔄 ROLLBACK PLAN

If issues arise, use feature flags:

```javascript
// config/features.js
module.exports = {
  USE_BITGO: process.env.USE_BITGO === 'true',
  USE_CIRCLE: process.env.USE_CIRCLE === 'true' // Temporary
};

// In service code
if (features.USE_BITGO) {
  return BitGoService.createWallet(params);
} else if (features.USE_CIRCLE) {
  return CircleService.createWallet(params); // Temporary fallback
}
```

---

## ✅ VERIFICATION CHECKLIST

### Pre-Removal:
- [ ] All Circle functionality mapped to replacements
- [ ] BitGo service fully implemented
- [ ] Router v2 tested with all rails
- [ ] Integration tests passing

### During Removal:
- [ ] Delete Circle service files
- [ ] Update all imports
- [ ] Update environment variables
- [ ] Update API documentation

### Post-Removal:
- [ ] Run full test suite
- [ ] Verify zero Circle dependencies: `grep -r "circle\|Circle" src/`
- [ ] Test wallet creation via BitGo
- [ ] Test transfers via Router
- [ ] Test stablecoin operations
- [ ] Monitor for 24 hours

---

## 🚨 COMMON PITFALLS

1. **Webhook URLs**: Update all Circle webhook endpoints to BitGo/Tempo
2. **Error Codes**: Circle and BitGo have different error codes
3. **Rate Limits**: BitGo has different rate limits than Circle
4. **Wallet Addresses**: Format may differ between providers
5. **Async Operations**: BitGo uses different callback patterns

---

## 📊 SUCCESS CRITERIA

```bash
# No Circle imports remain
grep -r "circle\|Circle" src/ | wc -l
# Expected: 0

# All tests pass
npm test
# Expected: 100% pass

# Wallet operations work
curl -X POST localhost:3001/api/wallets
# Expected: 200 OK

# Transfers route correctly
curl -X POST localhost:3001/api/transfers
# Expected: Routes through Cross River/BitGo/Tempo
```

---

This guide provides a systematic approach to completely remove Circle from the codebase while maintaining all functionality through BitGo and the new MonayPay router.