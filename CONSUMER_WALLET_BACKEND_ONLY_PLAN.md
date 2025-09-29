# 🎯 Monay Consumer Wallet - Backend Enhancement Plan
## Using ONLY monay-backend-common (No Database Drops)

**Date**: January 24, 2025
**Constraint**: Use ONLY monay-backend-common, NO database drops
**Approach**: Enhance existing infrastructure with Tempo → Circle → Monay hierarchy

---

## ✅ Current Infrastructure Assessment

### What We Already Have in monay-backend-common
```javascript
✅ /src/services/tempo.js           // Tempo service ready
✅ /src/services/tempo-mock.js      // Mock for testing
✅ /src/services/circle-wallet-service.js  // Circle fallback
✅ /src/services/stablecoin-provider-factory.js  // Provider management
✅ /src/routes/stablecoin.js        // Stablecoin routes
✅ /src/routes/circle-wallets.js    // Circle routes
✅ Database tables (no drops, only enhance)
```

---

## 📋 Implementation Tasks (Backend Only)

### Task 1: Enhance Provider Factory for Consumer Priority
```javascript
// File: /src/services/stablecoin-provider-factory.js
// MODIFY existing factory - don't replace

class StablecoinProviderFactory {
  // ADD consumer-specific provider selection
  async getConsumerProvider(operation) {
    // Priority: Tempo → Circle → Monay (future)
    const providers = ['tempo', 'circle', 'monay'];

    for (const provider of providers) {
      if (await this.isProviderHealthy(provider)) {
        return this.providers[provider];
      }
    }
    throw new Error('No providers available');
  }
}
```

### Task 2: Add Consumer Service Layer
```javascript
// NEW FILE: /src/services/consumer-wallet-service.js
// Wraps existing services for consumer use

import { TempoService } from './tempo.js';
import { CircleWalletService } from './circle-wallet-service.js';
import { StablecoinProviderFactory } from './stablecoin-provider-factory.js';

class ConsumerWalletService {
  constructor() {
    this.factory = StablecoinProviderFactory.getInstance();
  }

  async createConsumerWallet(userId) {
    // Use existing user table, add consumer metadata
    const wallet = await this.factory.executeWithFallback(
      'createWallet',
      [userId, 'consumer']
    );

    // Store in existing wallets table with type='consumer'
    await db.query(
      `UPDATE wallets
       SET type = 'consumer',
           metadata = metadata || $1
       WHERE user_id = $2`,
      [{ consumer: true, provider: 'tempo' }, userId]
    );

    return wallet;
  }

  async deposit(userId, amount, method) {
    // Smart routing based on amount and urgency
    const provider = await this.selectOptimalProvider(amount, method);
    return await provider.deposit(userId, amount, method);
  }

  async withdraw(userId, amount, destination) {
    // Use Tempo for instant, Circle as fallback
    return await this.factory.executeWithFallback(
      'withdraw',
      [userId, amount, destination]
    );
  }

  async transfer(fromUserId, toAddress, amount, currency = 'USDC') {
    // Leverage Tempo's speed
    return await this.factory.executeWithFallback(
      'transfer',
      [fromUserId, toAddress, amount, currency],
      { preferredProvider: 'tempo' }
    );
  }

  async batchTransfer(fromUserId, recipients) {
    // Tempo's killer feature - batch in single tx
    const tempo = this.factory.getProvider('tempo');
    if (tempo && await tempo.isHealthy()) {
      return await tempo.batchTransfer(fromUserId, recipients);
    }

    // Fallback to individual transfers
    const results = [];
    for (const recipient of recipients) {
      results.push(await this.transfer(
        fromUserId,
        recipient.address,
        recipient.amount,
        recipient.currency
      ));
    }
    return results;
  }
}

export default ConsumerWalletService;
```

### Task 3: Enhance Database (NO DROPS)
```sql
-- ADD columns to existing tables (safe operations only)

-- Enhance users table for consumer features
ALTER TABLE users
ADD COLUMN IF NOT EXISTS consumer_kyc_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS consumer_daily_limit DECIMAL(15,2) DEFAULT 1000,
ADD COLUMN IF NOT EXISTS consumer_monthly_limit DECIMAL(15,2) DEFAULT 30000,
ADD COLUMN IF NOT EXISTS preferred_provider VARCHAR(20) DEFAULT 'tempo';

-- Enhance wallets table
ALTER TABLE wallets
ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'tempo',
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_convert BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS batch_enabled BOOLEAN DEFAULT false;

-- Enhance transactions table for provider tracking
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS provider VARCHAR(20),
ADD COLUMN IF NOT EXISTS batch_id UUID,
ADD COLUMN IF NOT EXISTS settlement_time_ms INTEGER;

-- CREATE new table for consumer preferences (safe - no drops)
CREATE TABLE IF NOT EXISTS consumer_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  preferred_currency VARCHAR(10) DEFAULT 'USDC',
  auto_balance BOOLEAN DEFAULT false,
  smart_routing BOOLEAN DEFAULT true,
  instant_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE table for multi-stablecoin balances
CREATE TABLE IF NOT EXISTS stablecoin_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  currency VARCHAR(10) NOT NULL,
  amount DECIMAL(15,8) DEFAULT 0,
  provider VARCHAR(20) NOT NULL,
  last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, currency, provider)
);
```

### Task 4: Consumer API Routes
```javascript
// NEW FILE: /src/routes/consumer.js
// Consumer-specific endpoints

import express from 'express';
import ConsumerWalletService from '../services/consumer-wallet-service.js';

const router = express.Router();
const consumerService = new ConsumerWalletService();

// Progressive KYC
router.post('/consumer/onboard', async (req, res) => {
  try {
    const { email, phone, kycLevel = 1 } = req.body;

    // Create user with consumer defaults
    const user = await db.query(
      `INSERT INTO users (email, phone, consumer_kyc_level)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [email, phone, kycLevel]
    );

    // Create wallets via Tempo (primary) and Circle (backup)
    const wallet = await consumerService.createConsumerWallet(user.id);

    res.json({
      success: true,
      user,
      wallet,
      limits: getKYCLimits(kycLevel)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smart deposit routing
router.post('/consumer/deposit', async (req, res) => {
  try {
    const { amount, method, urgency = 'standard' } = req.body;
    const userId = req.user.id;

    const result = await consumerService.deposit(userId, amount, {
      method,
      urgency,
      preferTempo: true // Always try Tempo first
    });

    res.json({
      success: true,
      ...result,
      provider: result.provider || 'tempo',
      settlementTime: result.provider === 'tempo' ? '<100ms' : '2-3s'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Instant withdrawal
router.post('/consumer/withdraw', async (req, res) => {
  try {
    const { amount, destination, speed = 'instant' } = req.body;
    const userId = req.user.id;

    const result = await consumerService.withdraw(
      userId,
      amount,
      destination,
      { speed }
    );

    res.json({
      success: true,
      ...result,
      arrivalTime: speed === 'instant' ? 'Instant' : '1-3 days'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// P2P transfer with Tempo speed
router.post('/consumer/transfer', async (req, res) => {
  try {
    const { to, amount, currency = 'USDC' } = req.body;
    const userId = req.user.id;

    const result = await consumerService.transfer(
      userId,
      to,
      amount,
      currency
    );

    res.json({
      success: true,
      ...result,
      fee: 0.0001, // Tempo fee
      settlementTime: '<100ms'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch transfer (Tempo advantage)
router.post('/consumer/batch-transfer', async (req, res) => {
  try {
    const { recipients } = req.body;
    const userId = req.user.id;

    const results = await consumerService.batchTransfer(
      userId,
      recipients
    );

    res.json({
      success: true,
      transfers: results,
      totalFee: 0.0001, // Single fee for all!
      provider: 'tempo'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multi-stablecoin balance
router.get('/consumer/portfolio', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get balances from all supported stablecoins
    const balances = await db.query(
      `SELECT currency, SUM(amount) as total, provider
       FROM stablecoin_balances
       WHERE user_id = $1
       GROUP BY currency, provider`,
      [userId]
    );

    res.json({
      success: true,
      totalUSD: calculateTotalUSD(balances.rows),
      breakdown: balances.rows,
      primaryProvider: 'tempo'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Instant swap between stablecoins
router.post('/consumer/swap', async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const userId = req.user.id;

    // Tempo native swap
    const tempo = await factory.getProvider('tempo');
    const result = await tempo.swap(userId, from, to, amount);

    res.json({
      success: true,
      ...result,
      fee: 0.0001,
      executionTime: '<100ms'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Task 5: Update Routes Index
```javascript
// MODIFY: /src/routes/index.js
// ADD consumer routes to existing file

import consumer from './consumer.js';

// ADD to the routes array
router.use('/api', [
  // ... existing routes ...
  consumer,  // ADD consumer routes
  // ... rest of routes ...
]);
```

### Task 6: Enhanced Tempo Service
```javascript
// ENHANCE: /src/services/tempo.js
// ADD consumer-specific methods

class TempoService {
  // ... existing methods ...

  // ADD batch transfer support
  async batchTransfer(fromUserId, recipients) {
    const payload = {
      from: await this.getUserWallet(fromUserId),
      transfers: recipients.map(r => ({
        to: r.address,
        amount: r.amount,
        currency: r.currency || 'USDC'
      })),
      batchId: uuidv4()
    };

    const result = await this.client.post('/batch-transfer', payload);

    // Record in database
    await db.query(
      `INSERT INTO transactions (user_id, type, amount, batch_id, provider)
       VALUES ($1, 'batch', $2, $3, 'tempo')`,
      [fromUserId, this.sumAmounts(recipients), result.batchId]
    );

    return {
      batchId: result.batchId,
      transfers: result.transfers,
      totalFee: 0.0001,
      settlementTime: result.settlementTime
    };
  }

  // ADD multi-currency support
  async getMultiCurrencyBalance(userId) {
    const wallet = await this.getUserWallet(userId);
    const balances = await this.client.get(`/wallet/${wallet}/balances`);

    // Update local cache
    for (const [currency, amount] of Object.entries(balances)) {
      await db.query(
        `INSERT INTO stablecoin_balances (user_id, currency, amount, provider)
         VALUES ($1, $2, $3, 'tempo')
         ON CONFLICT (user_id, currency, provider)
         DO UPDATE SET amount = $3, last_synced = CURRENT_TIMESTAMP`,
        [userId, currency, amount]
      );
    }

    return balances;
  }

  // ADD instant swap
  async swap(userId, from, to, amount) {
    const wallet = await this.getUserWallet(userId);

    const result = await this.client.post('/swap', {
      wallet,
      from,
      to,
      amount
    });

    // Record transaction
    await db.query(
      `INSERT INTO transactions (user_id, type, amount, metadata, provider)
       VALUES ($1, 'swap', $2, $3, 'tempo')`,
      [userId, amount, { from, to, rate: result.rate }]
    );

    return result;
  }
}
```

---

## 📅 Implementation Timeline

### Week 1: Foundation
- ✅ Review existing Tempo/Circle services
- 🔧 Enhance provider factory for consumer priority
- 🔧 Add database columns (no drops)
- 🔧 Create consumer service wrapper

### Week 2: Core Features
- 🔧 Implement consumer onboarding
- 🔧 Build deposit/withdrawal flows
- 🔧 Add P2P transfer endpoints
- 🔧 Enable batch transfers

### Week 3: Advanced Features
- 🔧 Multi-stablecoin portfolio
- 🔧 Instant swaps via Tempo
- 🔧 Smart routing logic
- 🔧 Auto-balance features

### Week 4: Testing & Optimization
- 🔧 Integration testing
- 🔧 Performance tuning
- 🔧 Documentation
- 🔧 Deployment preparation

---

## 🚀 Immediate Next Steps

1. **Update Provider Factory**
   - Add consumer-specific provider selection
   - Ensure Tempo is always tried first

2. **Create Consumer Service**
   - New file: consumer-wallet-service.js
   - Wraps existing services with consumer logic

3. **Safe Database Updates**
   - Run ALTER TABLE commands (no drops)
   - Add new tables for consumer features

4. **Add Consumer Routes**
   - New file: routes/consumer.js
   - Register in routes/index.js

5. **Test Integration**
   - Use tempo-mock.js for testing
   - Verify fallback to Circle works

---

## ✅ Safety Guarantees

- **NO database drops** - only ALTER and CREATE IF NOT EXISTS
- **NO service replacements** - only enhancements
- **NO breaking changes** - all additions are backward compatible
- **Uses ONLY monay-backend-common** - no other services

---

## 📝 Key Benefits

### Why This Approach Works
1. **Leverages existing infrastructure** - No rewrites needed
2. **Safe database operations** - No data loss risk
3. **Progressive enhancement** - Add features incrementally
4. **Provider flexibility** - Easy to switch between Tempo/Circle/Monay
5. **Consumer-optimized** - Simplified UX on robust backend

### Performance Advantages (via Tempo)
- 100,000+ TPS capacity
- $0.0001 transaction fees
- <100ms settlement times
- Native multi-stablecoin support
- Batch operations in single transaction

---

**Ready to implement using ONLY monay-backend-common with NO database drops!**