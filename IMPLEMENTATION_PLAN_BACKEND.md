# 🔧 Invoice-First Implementation Plan: BACKEND (monay-backend-common)
**Port**: 3001
**Role**: Central API & Business Logic
**Date**: October 2025
**Priority**: CRITICAL - Must be completed first

---

## 📋 Session Instructions for Backend Developer

You are implementing the BACKEND portion of the Invoice-First architecture. Other Claude sessions are working on:
- **Admin Dashboard** (Port 3002)
- **Enterprise Wallet** (Port 3007)
- **Consumer Wallet** (Port 3003)

Your backend MUST provide APIs for all three frontends. Coordinate through these shared contracts.

---

## 🎯 Core Responsibilities

Your backend handles:
1. **Invoice-to-Wallet Generation** (The core innovation)
2. **Token Minting/Burning** (Tempo primary, Circle fallback)
3. **Ephemeral Wallet Lifecycle** (Creation → Destruction)
4. **Fiat Reserve Management** (1:1 backing)
5. **Smart Routing Engine** (Optimal provider selection)
6. **Audit Trail & Compliance**

---

## 🏗️ Implementation Tasks

### **PHASE 1: Database Schema (Day 1 Morning)**

```sql
-- Location: /monay-backend-common/migrations/016_invoice_first_refactor.sql

-- 1. Modify invoice_wallets table
ALTER TABLE invoice_wallets
ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creation_source VARCHAR(50) CHECK (creation_source IN ('invoice', 'manual', 'api')),
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'tempo',
ADD COLUMN IF NOT EXISTS countdown_seconds INTEGER,
ADD CONSTRAINT one_wallet_per_invoice UNIQUE(invoice_id);

-- 2. Add reserve tracking
CREATE TABLE IF NOT EXISTS reserve_reconciliation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_tokens_minted DECIMAL(40, 6),
    total_fiat_reserved DECIMAL(40, 2),
    discrepancy DECIMAL(40, 2),
    status VARCHAR(50),
    reconciled_at TIMESTAMPTZ,
    UNIQUE(date)
);

-- 3. Add provider health tracking
CREATE TABLE IF NOT EXISTS provider_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'healthy',
    last_check TIMESTAMPTZ DEFAULT NOW(),
    latency_ms INTEGER,
    error_rate DECIMAL(5, 4),
    tps_current INTEGER,
    metadata JSONB
);

-- 4. Add wallet destruction logs
CREATE TABLE IF NOT EXISTS wallet_destruction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id VARCHAR(255) NOT NULL,
    destruction_method VARCHAR(100),
    keys_erased BOOLEAN DEFAULT TRUE,
    audit_preserved BOOLEAN DEFAULT TRUE,
    destroyed_at TIMESTAMPTZ DEFAULT NOW(),
    verification_hash VARCHAR(255)
);
```

Run migration:
```bash
cd /monay-backend-common
npm run migrate:latest
```

---

### **PHASE 2: Core Services (Day 1 Afternoon)**

#### **2.1 Enhanced Invoice-First Wallet Service**

```javascript
// Location: /monay-backend-common/src/services/invoice-wallet-factory.js

import { EventEmitter } from 'events';
import crypto from 'crypto';
import db from '../models/index.js';
import tempoService from './tempo.js';
import circleService from './circle.js';

class InvoiceWalletFactory extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map([
      ['tempo', tempoService],
      ['circle', circleService]
    ]);
  }

  /**
   * CRITICAL METHOD: Create wallet FROM invoice
   * This is the core innovation - wallet doesn't exist before invoice
   */
  async createWalletFromInvoice(invoiceId, options = {}) {
    const invoice = await db.Invoice.findByPk(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    // Check if wallet already exists for this invoice
    const existingWallet = await db.InvoiceWallet.findOne({
      where: { invoice_id: invoiceId }
    });

    if (existingWallet) {
      return {
        wallet: existingWallet,
        isNew: false,
        message: 'Wallet already exists for this invoice'
      };
    }

    // Determine wallet mode based on invoice characteristics
    const mode = this.determineWalletMode(invoice);

    // Generate blockchain addresses
    const addresses = await this.generateAddresses(mode);

    // Calculate TTL for ephemeral wallets
    const ttl = mode === 'ephemeral' ?
      (options.ttl || this.calculateTTL(invoice)) : null;

    // Create wallet record
    const wallet = await db.InvoiceWallet.create({
      invoice_id: invoiceId,
      customer_id: invoice.customer_id,
      wallet_id: crypto.randomUUID(),
      wallet_type: mode,
      wallet_address: addresses.base,
      solana_address: addresses.solana,
      spending_limit: invoice.amount,
      expires_at: ttl ? new Date(Date.now() + ttl * 1000) : null,
      ttl_seconds: ttl,
      status: 'active',
      auto_created: true,
      creation_source: 'invoice',
      provider: await this.selectProvider(),
      features: {
        auto_pay: invoice.recurring,
        notifications: true,
        card_auto_issued: true
      }
    });

    // Auto-issue virtual card
    const card = await this.autoIssueCard(wallet);

    // Schedule destruction for ephemeral wallets
    if (mode === 'ephemeral') {
      await this.scheduleDestruction(wallet.wallet_id, ttl);
    }

    // Emit event for other services
    this.emit('wallet:created', {
      wallet,
      card,
      invoice,
      mode
    });

    // Create audit entry
    await this.createAuditEntry('wallet_created', wallet);

    return {
      wallet,
      card,
      isNew: true,
      mode,
      expiresIn: ttl
    };
  }

  determineWalletMode(invoice) {
    // AI-driven mode selection
    const score = this.calculateModeScore(invoice);

    if (score < 0.3) return 'ephemeral';
    if (score > 0.7) return 'persistent';
    return 'adaptive';
  }

  calculateModeScore(invoice) {
    let score = 0;

    // Recurring payments favor persistent
    if (invoice.recurring) score += 0.4;

    // High amounts favor persistent
    if (invoice.amount > 1000) score += 0.2;

    // Utility bills favor ephemeral
    if (invoice.category === 'UTILITY') score -= 0.3;

    // One-time payments favor ephemeral
    if (invoice.payment_type === 'one_time') score -= 0.4;

    return Math.max(0, Math.min(1, score + 0.5));
  }

  async selectProvider() {
    // Check provider health
    const tempoHealth = await this.checkProviderHealth('tempo');
    const circleHealth = await this.checkProviderHealth('circle');

    // Tempo is primary, Circle is fallback
    if (tempoHealth.status === 'healthy') return 'tempo';
    if (circleHealth.status === 'healthy') return 'circle';

    throw new Error('No healthy providers available');
  }

  async generateAddresses(mode) {
    // Generate deterministic addresses for dual-rail
    const seed = crypto.randomBytes(32);

    return {
      base: '0x' + crypto.createHash('sha256')
        .update(seed)
        .digest('hex')
        .substring(0, 40),
      solana: crypto.createHash('sha256')
        .update(Buffer.concat([seed, Buffer.from('solana')]))
        .digest('base64')
        .substring(0, 44)
    };
  }

  async autoIssueCard(wallet) {
    // Every wallet gets a virtual card automatically
    const card = await db.Card.create({
      id: 'card_' + crypto.randomUUID(),
      wallet_id: wallet.wallet_id,
      card_number: this.generateMaskedCardNumber(),
      card_type: 'virtual',
      status: 'active',
      spending_limit: wallet.spending_limit,
      single_use: wallet.wallet_type === 'ephemeral',
      expires_at: wallet.expires_at,
      auto_issued: true
    });

    return card;
  }

  async scheduleDestruction(walletId, ttlSeconds) {
    // Use Redis for scheduling
    const redis = await this.getRedisClient();
    await redis.setex(
      `wallet:destroy:${walletId}`,
      ttlSeconds,
      JSON.stringify({
        walletId,
        scheduledAt: Date.now(),
        ttl: ttlSeconds
      })
    );
  }

  generateMaskedCardNumber() {
    const last4 = Math.floor(1000 + Math.random() * 9000);
    return `****-****-****-${last4}`;
  }
}

export default new InvoiceWalletFactory();
```

#### **2.2 Ephemeral Wallet Manager**

```javascript
// Location: /monay-backend-common/src/services/ephemeral-manager.js

class EphemeralWalletManager {
  constructor() {
    this.destructionQueue = [];
    this.startDestructionWorker();
  }

  startDestructionWorker() {
    // Check every minute for wallets to destroy
    setInterval(async () => {
      await this.processDestructions();
    }, 60000);
  }

  async processDestructions() {
    // Find expired ephemeral wallets
    const expired = await db.InvoiceWallet.findAll({
      where: {
        wallet_type: 'ephemeral',
        status: 'active',
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    });

    for (const wallet of expired) {
      await this.destroyWallet(wallet);
    }
  }

  async destroyWallet(wallet) {
    const transaction = await db.sequelize.transaction();

    try {
      // Step 1: Forward any remaining funds
      if (wallet.balance > 0) {
        await this.forwardRemainingFunds(wallet);
      }

      // Step 2: Mark as destroying
      await wallet.update({
        status: 'destroying',
        destruction_initiated_at: new Date()
      }, { transaction });

      // Step 3: Cryptographic key erasure (7-pass)
      await this.eraseKeys(wallet);

      // Step 4: Deactivate card
      await db.Card.update(
        { status: 'deactivated' },
        {
          where: { wallet_id: wallet.wallet_id },
          transaction
        }
      );

      // Step 5: Final status update
      await wallet.update({
        status: 'destroyed',
        destroyed_at: new Date(),
        destruction_method: '7-pass_overwrite'
      }, { transaction });

      // Step 6: Log destruction
      await db.WalletDestructionLog.create({
        wallet_id: wallet.wallet_id,
        destruction_method: '7-pass_overwrite',
        keys_erased: true,
        audit_preserved: true,
        verification_hash: this.generateVerificationHash(wallet)
      }, { transaction });

      await transaction.commit();

      // Emit destruction event
      this.emit('wallet:destroyed', {
        walletId: wallet.wallet_id,
        reason: wallet.balance === 0 ? 'payment_complete' : 'ttl_expired'
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async eraseKeys(wallet) {
    // NIST SP 800-88 compliant secure erasure
    // This is a placeholder - actual implementation would involve
    // secure key storage system integration

    const passes = 7;
    for (let i = 0; i < passes; i++) {
      // Overwrite with random data
      await this.overwriteKeys(wallet.wallet_address, crypto.randomBytes(32));
    }

    // Final verification
    return true;
  }

  generateVerificationHash(wallet) {
    return crypto.createHash('sha256')
      .update(JSON.stringify({
        walletId: wallet.wallet_id,
        destroyedAt: Date.now(),
        method: '7-pass_overwrite'
      }))
      .digest('hex');
  }
}

export default new EphemeralWalletManager();
```

#### **2.3 Token Lifecycle Service**

```javascript
// Location: /monay-backend-common/src/services/token-lifecycle.js

class TokenLifecycleService {
  async mintTokens(userId, amount, invoiceId) {
    const transaction = await db.sequelize.transaction();

    try {
      // Step 1: Deposit fiat to reserve
      const reserve = await this.depositToReserve(userId, amount, transaction);

      // Step 2: Select provider (Tempo primary, Circle fallback)
      const provider = await this.selectProvider();

      // Step 3: Mint tokens
      let mintResult;
      if (provider === 'tempo') {
        mintResult = await tempoService.mintToken({
          userId,
          amount,
          reserveId: reserve.id,
          metadata: { invoiceId }
        });
      } else {
        mintResult = await circleService.mintUSDC(
          amount,
          sourceAccount,
          destinationWallet,
          userId
        );
      }

      // Step 4: Update wallet balance
      const wallet = await db.InvoiceWallet.findOne({
        where: { invoice_id: invoiceId }
      });

      await wallet.update({
        balance: wallet.balance + amount,
        funded_at: new Date(),
        status: 'funded'
      }, { transaction });

      // Step 5: Record mint transaction
      await db.BlockchainTransaction.create({
        user_id: userId,
        wallet_id: wallet.wallet_id,
        type: 'mint',
        amount,
        token_symbol: 'USDC',
        chain: provider === 'tempo' ? 'base' : 'ethereum',
        transaction_hash: mintResult.transactionHash,
        status: 'confirmed',
        provider
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        amount,
        provider,
        transactionHash: mintResult.transactionHash,
        wallet: wallet
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async burnTokens(userId, amount, walletId) {
    // Similar structure for burning tokens
    // Converts USDC back to fiat for withdrawal
  }

  async depositToReserve(userId, amount, transaction) {
    return await db.FiatReserve.create({
      user_id: userId,
      amount,
      currency: 'USD',
      status: 'confirmed',
      source_type: 'deposit'
    }, { transaction });
  }

  async reconcileReserve() {
    // Daily reconciliation job
    const totalMinted = await this.getTotalMintedTokens();
    const totalReserved = await this.getTotalReservedFiat();

    const discrepancy = totalMinted - totalReserved;

    await db.ReserveReconciliation.create({
      date: new Date(),
      total_tokens_minted: totalMinted,
      total_fiat_reserved: totalReserved,
      discrepancy,
      status: discrepancy === 0 ? 'balanced' : 'discrepancy_detected'
    });

    if (discrepancy !== 0) {
      // Alert administrators
      await this.sendDiscrepancyAlert(discrepancy);
    }
  }
}

export default new TokenLifecycleService();
```

---

### **PHASE 3: API Routes (Day 2 Morning)**

#### **3.1 Invoice Wallet Routes**

```javascript
// Location: /monay-backend-common/src/routes/invoice-wallets-v2.js

import express from 'express';
import invoiceWalletFactory from '../services/invoice-wallet-factory.js';
import ephemeralManager from '../services/ephemeral-manager.js';
import tokenLifecycle from '../services/token-lifecycle.js';
import { authenticateToken } from '../middleware-app/auth-middleware.js';

const router = express.Router();

/**
 * POST /api/v2/invoice-wallets/create-from-invoice
 * Core endpoint - Creates wallet FROM invoice
 */
router.post('/create-from-invoice', authenticateToken, async (req, res) => {
  try {
    const { invoice_id, ttl, mode_override } = req.body;

    // Validate invoice exists and belongs to user's organization
    const invoice = await db.Invoice.findOne({
      where: {
        id: invoice_id,
        [Op.or]: [
          { customer_id: req.user.id },
          { tenant_id: req.user.tenant_id }
        ]
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found or access denied'
      });
    }

    // Create wallet from invoice (THE CORE INNOVATION)
    const result = await invoiceWalletFactory.createWalletFromInvoice(
      invoice_id,
      { ttl, mode_override }
    );

    // Log for audit
    await auditLogger.log({
      action: 'WALLET_CREATED_FROM_INVOICE',
      userId: req.user.id,
      invoiceId: invoice_id,
      walletId: result.wallet.wallet_id,
      mode: result.wallet.wallet_type
    });

    res.status(201).json({
      success: true,
      data: result,
      message: result.isNew ?
        'Wallet created successfully from invoice' :
        'Existing wallet returned'
    });

  } catch (error) {
    console.error('Failed to create wallet from invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v2/invoice-wallets/:walletId/fund
 * Fund the invoice wallet with exact amount
 */
router.post('/:walletId/fund', authenticateToken, async (req, res) => {
  try {
    const { walletId } = req.params;
    const { payment_method, payment_token } = req.body;

    // Get wallet
    const wallet = await db.InvoiceWallet.findOne({
      where: { wallet_id: walletId },
      include: [{ model: db.Invoice }]
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Process payment via TilliPay
    const paymentResult = await tilliPayService.processPayment({
      amount: wallet.spending_limit,
      method: payment_method,
      token: payment_token,
      description: `Invoice ${wallet.invoice_id} funding`
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Payment processing failed'
      });
    }

    // Mint tokens equal to payment amount
    const mintResult = await tokenLifecycle.mintTokens(
      req.user.id,
      wallet.spending_limit,
      wallet.invoice_id
    );

    res.json({
      success: true,
      data: {
        wallet_balance: mintResult.wallet.balance,
        transaction_hash: mintResult.transactionHash,
        provider: mintResult.provider,
        status: 'funded'
      }
    });

  } catch (error) {
    console.error('Failed to fund wallet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v2/invoice-wallets/:walletId/pay-invoice
 * Execute invoice payment from funded wallet
 */
router.post('/:walletId/pay-invoice', authenticateToken, async (req, res) => {
  try {
    const { walletId } = req.params;

    const wallet = await db.InvoiceWallet.findOne({
      where: { wallet_id: walletId },
      include: [{ model: db.Invoice }]
    });

    if (!wallet || wallet.customer_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found or unauthorized'
      });
    }

    if (wallet.balance < wallet.Invoice.amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Execute payment
    const provider = wallet.provider || 'tempo';
    const transferResult = await this.executePayment(
      wallet,
      wallet.Invoice,
      provider
    );

    // Update invoice status
    await wallet.Invoice.update({
      status: 'paid',
      paid_at: new Date(),
      transaction_id: transferResult.transactionHash
    });

    // Update wallet
    await wallet.update({
      balance: 0,
      status: 'payment_complete'
    });

    // If ephemeral, trigger destruction
    if (wallet.wallet_type === 'ephemeral') {
      await ephemeralManager.destroyWallet(wallet);
    }

    res.json({
      success: true,
      data: {
        invoice_status: 'paid',
        transaction_hash: transferResult.transactionHash,
        wallet_status: wallet.wallet_type === 'ephemeral' ?
          'destroyed' : 'active'
      }
    });

  } catch (error) {
    console.error('Failed to pay invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v2/invoice-wallets/:walletId/countdown
 * Get real-time countdown for ephemeral wallet
 */
router.get('/:walletId/countdown', async (req, res) => {
  try {
    const { walletId } = req.params;

    const wallet = await db.InvoiceWallet.findOne({
      where: {
        wallet_id: walletId,
        wallet_type: 'ephemeral'
      }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Ephemeral wallet not found'
      });
    }

    const now = Date.now();
    const expiresAt = new Date(wallet.expires_at).getTime();
    const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

    res.json({
      success: true,
      data: {
        wallet_id: walletId,
        expires_at: wallet.expires_at,
        remaining_seconds: remainingSeconds,
        status: wallet.status,
        is_expired: remainingSeconds === 0
      }
    });

  } catch (error) {
    console.error('Failed to get countdown:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v2/invoice-wallets/:walletId/transform
 * Transform ephemeral wallet to persistent (consumer adoption)
 */
router.post('/:walletId/transform', authenticateToken, async (req, res) => {
  try {
    const { walletId } = req.params;

    const wallet = await db.InvoiceWallet.findOne({
      where: {
        wallet_id: walletId,
        customer_id: req.user.id,
        wallet_type: 'ephemeral'
      }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Ephemeral wallet not found'
      });
    }

    // Transform to persistent
    await wallet.update({
      wallet_type: 'persistent',
      expires_at: null,
      ttl_seconds: null,
      features: {
        ...wallet.features,
        p2p_enabled: true,
        savings_enabled: true,
        multi_currency: true
      }
    });

    // Cancel scheduled destruction
    await ephemeralManager.cancelDestruction(walletId);

    // Create full consumer wallet features
    await this.enableConsumerFeatures(wallet);

    res.json({
      success: true,
      message: 'Wallet transformed to persistent consumer wallet',
      data: {
        wallet_id: walletId,
        new_type: 'persistent',
        features: wallet.features
      }
    });

  } catch (error) {
    console.error('Failed to transform wallet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper method for payment execution
async function executePayment(wallet, invoice, provider) {
  if (provider === 'tempo') {
    return await tempoService.transfer({
      from: wallet.wallet_address,
      to: invoice.enterprise_wallet_address,
      amount: invoice.amount,
      metadata: {
        invoiceId: invoice.id,
        type: 'invoice_payment'
      }
    });
  } else {
    return await circleService.transferUSDC(
      invoice.amount,
      wallet.circle_wallet_id,
      invoice.enterprise_wallet_address,
      wallet.customer_id
    );
  }
}

export default router;
```

#### **3.2 Provider Health Routes**

```javascript
// Location: /monay-backend-common/src/routes/provider-health.js

router.get('/health', async (req, res) => {
  const tempo = await providerHealthService.checkTempo();
  const circle = await providerHealthService.checkCircle();

  res.json({
    tempo: {
      status: tempo.status,
      latency: tempo.latency_ms,
      tps: tempo.tps_current,
      error_rate: tempo.error_rate
    },
    circle: {
      status: circle.status,
      latency: circle.latency_ms,
      tps: circle.tps_current,
      error_rate: circle.error_rate
    },
    primary: tempo.status === 'healthy' ? 'tempo' : 'circle',
    timestamp: new Date()
  });
});
```

---

### **PHASE 4: WebSocket Real-time Updates (Day 2 Afternoon)**

```javascript
// Location: /monay-backend-common/src/services/invoice-wallet-websocket.js

import { Server } from 'socket.io';

class InvoiceWalletWebSocket {
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:3002', // Admin
          'http://localhost:3003', // Consumer
          'http://localhost:3007'  // Enterprise
        ],
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      // Subscribe to wallet updates
      socket.on('subscribe:wallet', async (walletId) => {
        socket.join(`wallet:${walletId}`);

        // Send initial state
        const wallet = await db.InvoiceWallet.findByPk(walletId);
        socket.emit('wallet:state', wallet);
      });

      // Subscribe to countdown updates for ephemeral wallets
      socket.on('subscribe:countdown', async (walletId) => {
        socket.join(`countdown:${walletId}`);

        // Start sending countdown updates every second
        const interval = setInterval(async () => {
          const wallet = await db.InvoiceWallet.findByPk(walletId);
          if (!wallet || wallet.status === 'destroyed') {
            clearInterval(interval);
            socket.emit('wallet:destroyed', { walletId });
            return;
          }

          const remaining = this.calculateRemaining(wallet);
          socket.emit('countdown:update', {
            walletId,
            remaining_seconds: remaining,
            expires_at: wallet.expires_at
          });

          if (remaining <= 0) {
            clearInterval(interval);
          }
        }, 1000);

        socket.on('disconnect', () => {
          clearInterval(interval);
        });
      });
    });
  }

  // Emit events from services
  emitWalletCreated(wallet) {
    this.io.to(`invoice:${wallet.invoice_id}`).emit('wallet:created', wallet);
  }

  emitWalletFunded(wallet) {
    this.io.to(`wallet:${wallet.wallet_id}`).emit('wallet:funded', {
      walletId: wallet.wallet_id,
      balance: wallet.balance,
      status: 'funded'
    });
  }

  emitPaymentComplete(wallet, invoice) {
    this.io.to(`wallet:${wallet.wallet_id}`).emit('payment:complete', {
      walletId: wallet.wallet_id,
      invoiceId: invoice.id,
      status: 'paid'
    });
  }

  emitWalletDestroyed(walletId) {
    this.io.to(`wallet:${walletId}`).emit('wallet:destroyed', {
      walletId,
      status: 'destroyed',
      timestamp: new Date()
    });
  }

  calculateRemaining(wallet) {
    if (!wallet.expires_at) return -1;
    const now = Date.now();
    const expires = new Date(wallet.expires_at).getTime();
    return Math.max(0, Math.floor((expires - now) / 1000));
  }
}

export default new InvoiceWalletWebSocket();
```

---

### **PHASE 5: CORS & Security Configuration (Day 3 Morning)**

```javascript
// Location: /monay-backend-common/src/config/cors.js

export const corsConfig = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3002', // Admin
      'http://localhost:3003', // Consumer Web
      'http://localhost:3007', // Enterprise
      'http://localhost:3000', // Marketing
    ];

    // Allow requests with no origin (mobile apps, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Invoice-ID',
    'X-Wallet-Mode',
    'X-Provider-Preference'
  ],
  exposedHeaders: [
    'X-Wallet-ID',
    'X-Countdown-Seconds',
    'X-Provider-Used'
  ]
};
```

---

### **PHASE 6: Testing Harness (Day 3 Afternoon)**

```javascript
// Location: /monay-backend-common/tests/invoice-wallet.test.js

describe('Invoice-First Wallet System', () => {
  describe('Core Innovation: Wallet from Invoice', () => {
    it('should create ephemeral wallet from one-time invoice', async () => {
      const invoice = await createTestInvoice({
        amount: 100,
        recurring: false,
        category: 'UTILITY'
      });

      const result = await invoiceWalletFactory.createWalletFromInvoice(invoice.id);

      expect(result.wallet.wallet_type).toBe('ephemeral');
      expect(result.wallet.expires_at).toBeTruthy();
      expect(result.card.single_use).toBe(true);
    });

    it('should prevent duplicate wallet creation for same invoice', async () => {
      const invoice = await createTestInvoice();

      const result1 = await invoiceWalletFactory.createWalletFromInvoice(invoice.id);
      const result2 = await invoiceWalletFactory.createWalletFromInvoice(invoice.id);

      expect(result1.isNew).toBe(true);
      expect(result2.isNew).toBe(false);
      expect(result1.wallet.wallet_id).toBe(result2.wallet.wallet_id);
    });

    it('should auto-destruct ephemeral wallet after payment', async () => {
      const wallet = await createEphemeralWallet();
      await fundWallet(wallet, 100);
      await payInvoice(wallet);

      // Wait for destruction
      await sleep(1000);

      const destroyed = await db.InvoiceWallet.findByPk(wallet.wallet_id);
      expect(destroyed.status).toBe('destroyed');
    });
  });

  describe('Provider Failover', () => {
    it('should use Circle when Tempo is down', async () => {
      // Mock Tempo as unhealthy
      jest.spyOn(tempoService, 'isHealthy').mockResolvedValue(false);

      const result = await tokenLifecycle.mintTokens(userId, 100, invoiceId);

      expect(result.provider).toBe('circle');
    });
  });

  describe('Reserve Reconciliation', () => {
    it('should maintain 1:1 reserve ratio', async () => {
      await mintTokens(1000);
      await burnTokens(500);

      const reconciliation = await tokenLifecycle.reconcileReserve();

      expect(reconciliation.discrepancy).toBe(0);
      expect(reconciliation.status).toBe('balanced');
    });
  });
});
```

---

## 📡 Integration Points for Frontend Teams

### **For Admin Dashboard (Port 3002)**
```javascript
// Endpoints you'll consume:
GET  /api/v2/invoice-wallets/stats          // Platform-wide stats
GET  /api/v2/invoice-wallets/active         // All active wallets
GET  /api/v2/provider-health/status         // Provider health
POST /api/v2/reserve/reconcile              // Trigger reconciliation

// WebSocket events to listen for:
'wallet:created'      // New wallet created
'wallet:destroyed'    // Wallet destroyed
'provider:switched'   // Tempo/Circle failover
```

### **For Enterprise Wallet (Port 3007)**
```javascript
// Endpoints you'll consume:
POST /api/v2/invoice-wallets/create-from-invoice  // Create wallet when invoice generated
GET  /api/v2/invoice-wallets/by-invoice/:id      // Get wallet for invoice
GET  /api/v2/invoice-wallets/:id/status          // Payment status

// WebSocket events to listen for:
'payment:received'    // Invoice paid
'wallet:funded'       // Customer funded wallet
```

### **For Consumer Wallet (Port 3003)**
```javascript
// Endpoints you'll consume:
POST /api/v2/invoice-wallets/:id/fund            // Fund wallet
POST /api/v2/invoice-wallets/:id/pay-invoice     // Pay invoice
GET  /api/v2/invoice-wallets/:id/countdown       // Ephemeral countdown
POST /api/v2/invoice-wallets/:id/transform       // Convert to persistent

// WebSocket events to listen for:
'countdown:update'    // Real-time countdown
'wallet:destroyed'    // Wallet expired/destroyed
'payment:complete'    // Payment processed
```

---

## 🧪 Testing the Backend

```bash
# 1. Run database migrations
cd /monay-backend-common
npm run migrate:latest

# 2. Start backend with nodemon
npm run dev

# 3. Test core endpoint
curl -X POST http://localhost:3001/api/v2/invoice-wallets/create-from-invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "invoice_id": "INV-2025-001",
    "ttl": 86400
  }'

# 4. Monitor WebSocket events
npm run test:websocket

# 5. Check provider health
curl http://localhost:3001/api/v2/provider-health/status
```

---

## 🔄 Critical Success Factors

1. **Database Migration**: Run migration FIRST before any API changes
2. **Provider Failover**: Test Tempo → Circle failover thoroughly
3. **Ephemeral Destruction**: Ensure 7-pass erasure works correctly
4. **Reserve Reconciliation**: Must maintain 1:1 ratio at all times
5. **WebSocket Events**: Frontend teams depend on real-time updates

---

## 📊 Metrics to Monitor

```javascript
// Add these metrics to your monitoring dashboard
const metrics = {
  walletsCreated: Counter('invoice_wallets_created_total'),
  walletsDestroyed: Counter('invoice_wallets_destroyed_total'),
  providerFailovers: Counter('provider_failovers_total'),
  reserveDiscrepancies: Gauge('reserve_discrepancy_usd'),
  ephemeralAdoption: Gauge('ephemeral_wallet_percentage'),
  averageTTL: Histogram('ephemeral_wallet_ttl_seconds')
};
```

---

## ⚠️ DO NOT PROCEED WITHOUT

1. ✅ Database backup
2. ✅ Migration executed successfully
3. ✅ Redis running for ephemeral scheduling
4. ✅ WebSocket server initialized
5. ✅ Provider health checks passing

---

**Your backend is the foundation. All three frontends depend on you. Execute with precision.**

*End of Backend Implementation Plan*