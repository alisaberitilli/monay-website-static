# Implementation Plan: MonayPay Orchestration Core
## Forked TilliPay Engine with Cross River Bank, BitGo & Tempo Integration

**Date**: October 2025
**Component**: MonayPay Core (Forked TilliPay)
**Architecture**: Microservices
**Dependencies**: Cross River Bank APIs, BitGo Custody, Tempo FX
**Session Type**: Core Platform Team

---

## 🚨 CRITICAL: This is the HEART of Monay Platform 🚨

MonayPay is the unified orchestration engine that intelligently routes payments across:
- **Cross River Bank** - Domestic fiat rails (ACH, FedNow, RTP, SWIFT)
- **BitGo Trust** - Multi-chain custody (USDC, PYUSD, EURC)
- **Tempo** - Cross-border settlements and FX

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌────────────────────────────────────────────────┐
│              MonayPay Core Engine              │
├────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐           │
│  │ Ledger v2    │  │ Router v2    │           │
│  │ Dual-Entry   │  │ Rail Scoring │           │
│  └──────────────┘  └──────────────┘           │
│                                                │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ Compliance   │  │ FX Service   │           │
│  │ Engine (BRE) │  │ Quote Engine │           │
│  └──────────────┘  └──────────────┘           │
│                                                │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ Audit Layer  │  │ ERP Connect  │           │
│  │ Attestation  │  │ SAP/Oracle   │           │
│  └──────────────┘  └──────────────┘           │
└────────────────┬───────────────────────────────┘
     ┌───────────┼───────────┬──────────┐
     ▼           ▼           ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Cross    │ │ BitGo   │ │ Tempo   │ │Blockchain│
│River    │ │ Custody │ │ FX/SEPA │ │Networks │
│Bank API │ │ API     │ │ API     │ │(EVM/Sol)│
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 📁 PROJECT STRUCTURE

```
monay-backend-common/
├── src/
│   ├── monaypay/                      # NEW: MonayPay Core
│   │   ├── core/
│   │   │   ├── ledger/
│   │   │   │   ├── dual-entry.service.js
│   │   │   │   ├── reconciliation.service.js
│   │   │   │   ├── posting-engine.js
│   │   │   │   └── balance-tracker.js
│   │   │   ├── router/
│   │   │   │   ├── router-v2.service.js
│   │   │   │   ├── rail-scorer.js
│   │   │   │   ├── fallback-manager.js
│   │   │   │   └── circuit-breaker.js
│   │   │   ├── compliance/
│   │   │   │   ├── bre-engine.js
│   │   │   │   ├── rule-compiler.js
│   │   │   │   ├── attestation-dag.js
│   │   │   │   └── policy-enforcer.js
│   │   │   └── audit/
│   │   │       ├── merkle-dag.js
│   │   │       ├── chain-anchor.js
│   │   │       └── audit-logger.js
│   │   ├── providers/
│   │   │   ├── cross-river/
│   │   │   │   ├── client.js
│   │   │   │   ├── ach.service.js
│   │   │   │   ├── fednow.service.js
│   │   │   │   ├── rtp.service.js
│   │   │   │   └── swift.service.js
│   │   │   ├── bitgo/
│   │   │   │   ├── client.js
│   │   │   │   ├── custody.service.js
│   │   │   │   ├── wallet-manager.js
│   │   │   │   └── hsm-keys.js
│   │   │   └── tempo/
│   │   │       ├── client.js
│   │   │       ├── fx-quote.service.js
│   │   │       ├── settlement.service.js
│   │   │       └── liquidity-pool.js
│   │   ├── connectors/
│   │   │   ├── erp/
│   │   │   │   ├── sap-connector.js
│   │   │   │   ├── oracle-connector.js
│   │   │   │   └── dynamics-connector.js
│   │   │   └── blockchain/
│   │   │       ├── evm-connector.js
│   │   │       ├── solana-connector.js
│   │   │       └── multi-chain.js
│   │   └── orchestration/
│   │       ├── payment-intent.service.js
│   │       ├── transaction-manager.js
│   │       ├── idempotency.service.js
│   │       └── telemetry.service.js
│   ├── config/
│   │   ├── monaypay.config.js
│   │   ├── providers.config.js
│   │   └── corridors.config.js
│   └── migrations/
│       └── monaypay/
│           ├── 001_dual_ledger_schema.sql
│           ├── 002_routing_tables.sql
│           └── 003_audit_tables.sql
```

---

## 📋 IMPLEMENTATION PHASES

### Phase 1: Core Infrastructure & Provider Integration (Week 1-2)

#### 1.1 Cross River Bank Integration

```javascript
// src/monaypay/providers/cross-river/client.js
import crypto from 'crypto';
import axios from 'axios';

class CrossRiverClient {
  constructor() {
    this.baseURL = process.env.CROSS_RIVER_API_URL;
    this.apiKey = process.env.CROSS_RIVER_API_KEY;
    this.apiSecret = process.env.CROSS_RIVER_SECRET;
    this.fboAccountId = process.env.CROSS_RIVER_FBO_ACCOUNT;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'X-CR-API-KEY': this.apiKey
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request signing
    this.client.interceptors.request.use((config) => {
      const timestamp = Date.now();
      const payload = config.data ? JSON.stringify(config.data) : '';
      const signature = this.generateSignature(
        config.method.toUpperCase(),
        config.url,
        payload,
        timestamp
      );

      config.headers['X-CR-Signature'] = signature;
      config.headers['X-CR-Timestamp'] = timestamp;

      return config;
    });
  }

  generateSignature(method, path, payload, timestamp) {
    const message = `${method}${path}${payload}${timestamp}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  // ACH Transfer
  async sendACH(params) {
    const transfer = {
      account_id: this.fboAccountId,
      type: 'ACH',
      direction: params.direction, // 'debit' or 'credit'
      amount: params.amount,
      currency: 'USD',
      counterparty: {
        name: params.recipientName,
        account_number: params.accountNumber,
        routing_number: params.routingNumber,
        account_type: params.accountType || 'checking'
      },
      description: params.description,
      metadata: {
        invoice_id: params.invoiceId,
        wallet_address: params.walletAddress,
        monay_tx_id: params.transactionId
      }
    };

    const response = await this.client.post('/v1/transfers/ach', transfer);
    return response.data;
  }

  // FedNow Instant Payment
  async sendFedNow(params) {
    const transfer = {
      account_id: this.fboAccountId,
      type: 'FEDNOW',
      amount: params.amount,
      currency: 'USD',
      counterparty: {
        name: params.recipientName,
        account_number: params.accountNumber,
        routing_number: params.routingNumber
      },
      request_for_payment: params.isRFP || false,
      metadata: {
        invoice_id: params.invoiceId,
        wallet_address: params.walletAddress
      }
    };

    const response = await this.client.post('/v1/transfers/fednow', transfer);
    return response.data;
  }

  // Real-Time Payments (RTP)
  async sendRTP(params) {
    const transfer = {
      account_id: this.fboAccountId,
      type: 'RTP',
      amount: params.amount,
      currency: 'USD',
      counterparty: {
        name: params.recipientName,
        account_number: params.accountNumber,
        routing_number: params.routingNumber
      },
      purpose_code: params.purposeCode || 'P2P',
      metadata: {
        invoice_id: params.invoiceId,
        wallet_address: params.walletAddress
      }
    };

    const response = await this.client.post('/v1/transfers/rtp', transfer);
    return response.data;
  }

  // SWIFT Wire Transfer
  async sendSWIFT(params) {
    const transfer = {
      account_id: this.fboAccountId,
      type: 'WIRE',
      amount: params.amount,
      currency: params.currency || 'USD',
      counterparty: {
        name: params.recipientName,
        account_number: params.iban || params.accountNumber,
        swift_code: params.swiftCode,
        bank_name: params.bankName,
        bank_address: params.bankAddress
      },
      purpose_of_payment: params.purpose,
      charge_bearer: params.chargeBearer || 'SHARED', // OUR, BEN, SHARED
      metadata: {
        invoice_id: params.invoiceId,
        wallet_address: params.walletAddress
      }
    };

    const response = await this.client.post('/v1/transfers/wire', transfer);
    return response.data;
  }

  // Get FBO Account Balance
  async getBalance() {
    const response = await this.client.get(`/v1/accounts/${this.fboAccountId}/balance`);
    return response.data;
  }

  // Webhook verification
  verifyWebhook(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export default new CrossRiverClient();
```

#### 1.2 BitGo Custody Integration

```javascript
// src/monaypay/providers/bitgo/custody.service.js
import { BitGoJS } from 'bitgo';
import crypto from 'crypto';

class BitGoCustodyService {
  constructor() {
    this.bitgo = new BitGoJS({
      env: process.env.BITGO_ENV || 'test', // 'test' or 'prod'
      accessToken: process.env.BITGO_ACCESS_TOKEN
    });

    this.enterpriseId = process.env.BITGO_ENTERPRISE_ID;
    this.walletPassphrase = process.env.BITGO_WALLET_PASSPHRASE;

    // Initialize HSM connection for key management
    this.hsmConfig = {
      url: process.env.HSM_URL,
      credentials: process.env.HSM_CREDENTIALS
    };

    this.supportedAssets = [
      'usdc', 'usdt', 'pyusd', 'eurc',
      'btc', 'eth', 'sol'
    ];
  }

  // Create deterministic wallet from invoice
  async createInvoiceWallet(invoiceId, options = {}) {
    // Derive deterministic seed from invoice ID + HSM salt
    const seed = await this.deriveWalletSeed(invoiceId);

    const walletParams = {
      label: `invoice-${invoiceId}`,
      enterprise: this.enterpriseId,
      type: options.type || 'hot',
      coin: options.coin || 'usdc',
      stellarUsername: options.stellarUsername,
      keys: await this.generateKeys(seed),
      m: options.multisigM || 2,
      n: options.multisigN || 3,
      tags: {
        invoice_id: invoiceId,
        mode: options.mode || 'ephemeral',
        ttl_hours: options.ttlHours,
        created_at: new Date().toISOString()
      }
    };

    const wallet = await this.bitgo.coin(walletParams.coin)
      .wallets()
      .generateWallet(walletParams);

    // Store wallet info with encryption
    await this.storeWalletKeys(invoiceId, wallet);

    return {
      walletId: wallet.wallet.id(),
      address: wallet.wallet.receiveAddress(),
      coin: walletParams.coin,
      invoiceId,
      mode: walletParams.tags.mode
    };
  }

  // Multi-chain transfer
  async transfer(params) {
    const wallet = await this.getWallet(params.walletId, params.coin);

    const transferParams = {
      amount: params.amount,
      address: params.toAddress,
      walletPassphrase: this.walletPassphrase,
      memo: params.memo,

      // BitGo specific params
      feeRate: params.feeRate,
      maxFeeRate: params.maxFeeRate,
      minConfirmations: params.minConfirmations || 0,
      enforceMinConfirmations: true,

      // Compliance data
      travelRule: params.travelRule,
      sequenceId: params.invoiceId,

      // Multi-sig approval
      otp: params.otp // If 2FA enabled
    };

    // Pre-build for multi-sig review if needed
    if (params.requireApproval) {
      const prebuild = await wallet.prebuildTransaction(transferParams);
      return {
        status: 'pending_approval',
        prebuild,
        approvalUrl: `https://app.bitgo.com/enterprise/${this.enterpriseId}/pending`
      };
    }

    // Execute transfer
    const result = await wallet.send(transferParams);

    return {
      txId: result.txid,
      status: result.status,
      fee: result.fee,
      transfer: result.transfer
    };
  }

  // Mint stablecoins (via issuer integration)
  async mintStablecoin(params) {
    // BitGo handles the mint request to Circle/Paxos/etc
    const mintRequest = {
      coin: params.coin, // 'usdc', 'pyusd', etc
      amount: params.amount,
      destinationAddress: params.walletAddress,
      bankAccountId: params.bankAccountId, // Cross River FBO
      reference: params.invoiceId
    };

    const response = await this.bitgo.coin(params.coin)
      .issuance()
      .create(mintRequest);

    return {
      mintId: response.id,
      status: response.status,
      amount: response.amount,
      estimatedCompletion: response.estimatedCompletion
    };
  }

  // Redeem stablecoins to fiat
  async redeemStablecoin(params) {
    const redeemRequest = {
      coin: params.coin,
      amount: params.amount,
      sourceWalletId: params.walletId,
      bankAccountId: params.bankAccountId, // Cross River FBO
      reference: params.invoiceId
    };

    const response = await this.bitgo.coin(params.coin)
      .redemption()
      .create(redeemRequest);

    return {
      redemptionId: response.id,
      status: response.status,
      amount: response.amount,
      estimatedCompletion: response.estimatedCompletion
    };
  }

  // Post-quantum secure key derivation
  async deriveWalletSeed(invoiceId) {
    // ML-KEM (Kyber) for post-quantum security
    const kyberKey = await this.hsmGenerateKyberKey();

    // Combine with classical ECDSA for hybrid security
    const classicalSeed = crypto
      .createHash('sha512')
      .update(invoiceId)
      .update(process.env.HSM_MASTER_SALT)
      .digest();

    // XOR quantum and classical for hybrid seed
    const hybridSeed = Buffer.alloc(64);
    for (let i = 0; i < 64; i++) {
      hybridSeed[i] = kyberKey[i] ^ classicalSeed[i];
    }

    return hybridSeed;
  }

  // Zeroize ephemeral wallet keys after settlement
  async zeroizeWallet(walletId) {
    // Secure key erasure
    const wallet = await this.getWallet(walletId);

    // Transfer any remaining balance to treasury
    const balance = await wallet.getBalance();
    if (balance > 0) {
      await this.transfer({
        walletId,
        toAddress: process.env.TREASURY_WALLET,
        amount: balance,
        memo: 'Ephemeral wallet cleanup'
      });
    }

    // Cryptographic zeroization
    await this.hsmZeroizeKeys(walletId);

    // Mark wallet as destroyed in BitGo
    await wallet.freeze({ type: 'destroyed' });

    return {
      walletId,
      zeroizedAt: new Date().toISOString(),
      finalBalance: balance
    };
  }

  // Get wallet balance across all chains
  async getBalance(walletId, coin = 'usdc') {
    const wallet = await this.getWallet(walletId, coin);
    const balance = await wallet.getBalance();

    return {
      walletId,
      coin,
      balance: balance.balance,
      confirmedBalance: balance.confirmedBalance,
      spendableBalance: balance.spendableBalance
    };
  }

  async getWallet(walletId, coin = 'usdc') {
    return await this.bitgo.coin(coin).wallets().get({ id: walletId });
  }
}

export default new BitGoCustodyService();
```

#### 1.3 Tempo FX Integration

```javascript
// src/monaypay/providers/tempo/fx-quote.service.js
import axios from 'axios';
import crypto from 'crypto';

class TempoFXService {
  constructor() {
    this.baseURL = process.env.TEMPO_API_URL;
    this.apiKey = process.env.TEMPO_API_KEY;
    this.apiSecret = process.env.TEMPO_SECRET;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'X-Tempo-Key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    this.corridors = new Map([
      ['USD-EUR', { spread: 0.002, sla: 30 }],
      ['USD-GBP', { spread: 0.003, sla: 30 }],
      ['USD-INR', { spread: 0.004, sla: 60 }],
      ['USD-AED', { spread: 0.003, sla: 45 }],
      ['USD-SGD', { spread: 0.003, sla: 45 }]
    ]);
  }

  // Get real-time FX quote
  async getQuote(params) {
    const quoteRequest = {
      source_currency: params.sourceCurrency,
      destination_currency: params.destinationCurrency,
      source_amount: params.amount,
      payment_method: params.paymentMethod || 'SWIFT',
      delivery_time: params.deliveryTime || 'standard', // 'instant', 'standard', 'slow'
      quote_type: params.quoteType || 'firm', // 'indicative' or 'firm'
      valid_for_seconds: params.validFor || 30
    };

    const response = await this.client.post('/v1/fx/quote', quoteRequest);

    const quote = response.data;

    // Calculate effective rate including Tempo spread
    const corridor = `${params.sourceCurrency}-${params.destinationCurrency}`;
    const corridorConfig = this.corridors.get(corridor) || { spread: 0.005, sla: 60 };

    return {
      quoteId: quote.quote_id,
      sourceCurrency: quote.source_currency,
      destinationCurrency: quote.destination_currency,
      sourceAmount: quote.source_amount,
      destinationAmount: quote.destination_amount,
      exchangeRate: quote.exchange_rate,
      spread: corridorConfig.spread,
      effectiveRate: quote.exchange_rate * (1 - corridorConfig.spread),
      fee: quote.fee || 0,
      validUntil: new Date(Date.now() + quote.valid_for_seconds * 1000),
      estimatedDelivery: new Date(Date.now() + corridorConfig.sla * 60 * 1000)
    };
  }

  // Execute FX conversion with settlement
  async executeConversion(quoteId, params) {
    const execution = {
      quote_id: quoteId,
      source_account: params.sourceAccount, // Cross River FBO or BitGo wallet
      destination_account: params.destinationAccount,
      beneficiary: {
        name: params.beneficiaryName,
        address: params.beneficiaryAddress,
        bank_details: params.bankDetails
      },
      reference: params.invoiceId,
      purpose_code: params.purposeCode || 'TRADE',
      compliance: {
        source_of_funds: params.sourceOfFunds,
        travel_rule: params.travelRule
      }
    };

    const response = await this.client.post('/v1/fx/execute', execution);

    return {
      conversionId: response.data.conversion_id,
      status: response.data.status,
      trackingNumber: response.data.tracking_number,
      estimatedSettlement: response.data.estimated_settlement
    };
  }

  // Cross-border payment via SEPA/SWIFT
  async sendCrossBorder(params) {
    const payment = {
      amount: params.amount,
      source_currency: params.sourceCurrency,
      destination_currency: params.destinationCurrency,
      payment_rail: params.rail || 'SWIFT', // 'SWIFT', 'SEPA', 'SEPA_INSTANT', 'UPI'

      sender: {
        account: params.senderAccount,
        name: params.senderName,
        address: params.senderAddress
      },

      beneficiary: {
        account: params.beneficiaryAccount,
        name: params.beneficiaryName,
        address: params.beneficiaryAddress,
        bank: {
          swift_code: params.swiftCode,
          name: params.bankName,
          address: params.bankAddress
        }
      },

      purpose: params.purpose,
      reference: params.invoiceId,

      // Stablecoin settlement option
      settlement_method: params.settlementMethod || 'fiat', // 'fiat', 'stablecoin', 'hybrid'
      stablecoin_address: params.stablecoinAddress
    };

    const response = await this.client.post('/v1/payments/send', payment);

    return {
      paymentId: response.data.payment_id,
      status: response.data.status,
      exchangeRate: response.data.exchange_rate,
      fees: response.data.fees,
      trackingUrl: response.data.tracking_url,
      estimatedArrival: response.data.estimated_arrival
    };
  }

  // Stablecoin to fiat off-ramp
  async offRamp(params) {
    const request = {
      stablecoin: params.stablecoin, // 'USDC', 'USDT', 'PYUSD'
      amount: params.amount,
      source_address: params.walletAddress,
      destination: {
        type: params.destinationType, // 'bank_account', 'card', 'mobile_money'
        details: params.destinationDetails
      },
      reference: params.invoiceId
    };

    const response = await this.client.post('/v1/offramp/convert', request);

    return {
      conversionId: response.data.conversion_id,
      fiatAmount: response.data.fiat_amount,
      exchangeRate: response.data.exchange_rate,
      fee: response.data.fee,
      status: response.data.status
    };
  }

  // Liquidity pool status
  async getLiquidity(currency) {
    const response = await this.client.get(`/v1/liquidity/${currency}`);

    return {
      currency,
      available: response.data.available_balance,
      reserved: response.data.reserved_balance,
      dailyLimit: response.data.daily_limit,
      utilizationRate: response.data.utilization_rate
    };
  }
}

export default new TempoFXService();
```

---

### Phase 2: Router v2 & Scoring Engine (Week 3)

#### 2.1 Intelligent Rail Router

```javascript
// src/monaypay/core/router/router-v2.service.js
import CrossRiverClient from '../../providers/cross-river/client.js';
import BitGoCustody from '../../providers/bitgo/custody.service.js';
import TempoFX from '../../providers/tempo/fx-quote.service.js';
import { BREEngine } from '../compliance/bre-engine.js';
import { CircuitBreaker } from './circuit-breaker.js';

class RouterV2Service {
  constructor() {
    this.rails = new Map([
      ['cross_river_ach', { provider: CrossRiverClient, type: 'fiat', domestic: true }],
      ['cross_river_fednow', { provider: CrossRiverClient, type: 'fiat', domestic: true }],
      ['cross_river_rtp', { provider: CrossRiverClient, type: 'fiat', domestic: true }],
      ['cross_river_swift', { provider: CrossRiverClient, type: 'fiat', domestic: false }],
      ['bitgo_usdc', { provider: BitGoCustody, type: 'crypto', domestic: null }],
      ['bitgo_pyusd', { provider: BitGoCustody, type: 'crypto', domestic: null }],
      ['tempo_fx', { provider: TempoFX, type: 'fx', domestic: false }],
      ['tempo_sepa', { provider: TempoFX, type: 'fiat', domestic: false }]
    ]);

    // Scoring weights (configurable)
    this.weights = {
      cost: 0.3,
      time: 0.25,
      reliability: 0.2,
      liquidity: 0.15,
      compliance: 0.1
    };

    // Circuit breakers for each rail
    this.circuitBreakers = new Map();
    this.rails.forEach((rail, key) => {
      this.circuitBreakers.set(key, new CircuitBreaker({
        failureThreshold: 5,
        timeout: 60000,
        resetTimeout: 300000
      }));
    });
  }

  // Main routing decision function
  async route(paymentIntent) {
    // Step 1: Get eligible rails based on intent
    const eligibleRails = await this.getEligibleRails(paymentIntent);

    if (eligibleRails.length === 0) {
      throw new Error('No eligible payment rails for this transaction');
    }

    // Step 2: Score each rail
    const scoredRails = await Promise.all(
      eligibleRails.map(rail => this.scoreRail(rail, paymentIntent))
    );

    // Step 3: Sort by score and select best
    scoredRails.sort((a, b) => b.totalScore - a.totalScore);
    const selectedRail = scoredRails[0];

    // Step 4: Create fallback chain
    const fallbackChain = scoredRails.slice(1, 4); // Top 3 alternatives

    return {
      primary: selectedRail,
      fallbacks: fallbackChain,
      intent: paymentIntent,
      decision: {
        timestamp: new Date(),
        factors: selectedRail.scoreBreakdown,
        complianceCheck: selectedRail.complianceResult
      }
    };
  }

  async getEligibleRails(intent) {
    const eligible = [];

    // Domestic USD payment options
    if (intent.sourceCurrency === 'USD' && intent.destinationCurrency === 'USD') {
      if (intent.amount < 100000) {
        eligible.push('cross_river_ach');
      }
      if (intent.priority === 'instant') {
        eligible.push('cross_river_fednow', 'cross_river_rtp');
      }
      eligible.push('bitgo_usdc'); // Always available as option
    }

    // Cross-border payment options
    if (intent.sourceCurrency !== intent.destinationCurrency) {
      eligible.push('tempo_fx');
      if (intent.destinationCurrency === 'EUR') {
        eligible.push('tempo_sepa');
      }
      eligible.push('cross_river_swift');
    }

    // Filter by circuit breaker status
    const activeRails = eligible.filter(rail =>
      this.circuitBreakers.get(rail).getState() !== 'OPEN'
    );

    // Apply BRE compliance pre-check
    const compliantRails = [];
    for (const rail of activeRails) {
      const compliant = await BREEngine.preCheck({
        rail,
        intent,
        jurisdiction: intent.jurisdiction
      });
      if (compliant.allowed) {
        compliantRails.push(rail);
      }
    }

    return compliantRails;
  }

  async scoreRail(railId, intent) {
    const rail = this.rails.get(railId);
    const scores = {};

    // Cost scoring (0-1, lower is better)
    scores.cost = await this.scoreCost(railId, intent);

    // Time scoring (0-1, faster is better)
    scores.time = await this.scoreTime(railId, intent);

    // Reliability scoring (0-1, higher success rate is better)
    scores.reliability = await this.scoreReliability(railId);

    // Liquidity scoring (0-1, more available liquidity is better)
    scores.liquidity = await this.scoreLiquidity(railId, intent);

    // Compliance scoring (0-1, fewer restrictions is better)
    scores.compliance = await this.scoreCompliance(railId, intent);

    // Calculate weighted total
    const totalScore = Object.entries(scores).reduce((total, [factor, score]) => {
      return total + (score * this.weights[factor]);
    }, 0);

    return {
      railId,
      provider: rail.provider,
      totalScore,
      scoreBreakdown: scores,
      estimatedCost: await this.estimateCost(railId, intent),
      estimatedTime: await this.estimateTime(railId, intent),
      complianceResult: await BREEngine.evaluate({ railId, intent })
    };
  }

  async scoreCost(railId, intent) {
    const cost = await this.estimateCost(railId, intent);
    const maxAcceptableCost = intent.amount * 0.03; // 3% max

    if (cost >= maxAcceptableCost) return 0;
    if (cost === 0) return 1;

    // Linear scoring
    return 1 - (cost / maxAcceptableCost);
  }

  async estimateCost(railId, intent) {
    const amount = intent.amount;

    switch (railId) {
      case 'cross_river_ach':
        return 0.25; // $0.25 flat

      case 'cross_river_fednow':
      case 'cross_river_rtp':
        return 0.50; // $0.50 flat

      case 'cross_river_swift':
        return Math.max(15, amount * 0.001); // $15 min or 0.1%

      case 'bitgo_usdc':
      case 'bitgo_pyusd':
        // Gas + custody fees
        const gasEstimate = await this.estimateGas(intent.destinationChain);
        const custodyFee = amount * 0.0002; // 2 bps
        return gasEstimate + custodyFee;

      case 'tempo_fx':
        // FX spread + fee
        const quote = await TempoFX.getQuote({
          sourceCurrency: intent.sourceCurrency,
          destinationCurrency: intent.destinationCurrency,
          amount: amount
        });
        return amount * quote.spread + quote.fee;

      case 'tempo_sepa':
        return 1.50; // €1.50 flat

      default:
        return amount * 0.01; // 1% fallback
    }
  }

  async scoreTime(railId, intent) {
    const estimatedMinutes = await this.estimateTime(railId, intent);
    const maxAcceptableMinutes = intent.sla || 60;

    if (estimatedMinutes >= maxAcceptableMinutes) return 0;
    if (estimatedMinutes <= 1) return 1;

    // Exponential decay scoring
    return Math.exp(-estimatedMinutes / maxAcceptableMinutes);
  }

  async estimateTime(railId, intent) {
    switch (railId) {
      case 'cross_river_fednow':
      case 'cross_river_rtp':
        return 0.5; // 30 seconds

      case 'cross_river_ach':
        return intent.priority === 'same_day' ? 240 : 1440; // 4 hrs or 1 day

      case 'cross_river_swift':
        return 2880; // 2 days

      case 'bitgo_usdc':
      case 'bitgo_pyusd':
        const confirmations = intent.requiredConfirmations || 1;
        return confirmations * 2; // ~2 min per confirmation

      case 'tempo_fx':
      case 'tempo_sepa':
        return 30; // 30 minutes

      default:
        return 60; // 1 hour fallback
    }
  }

  async scoreReliability(railId) {
    // Get recent success rate from telemetry
    const stats = await this.getReliabilityStats(railId);
    return stats.successRate;
  }

  async scoreLiquidity(railId, intent) {
    if (railId.startsWith('cross_river')) {
      // Check FBO account balance
      const balance = await CrossRiverClient.getBalance();
      const utilization = intent.amount / balance.available;
      return utilization < 0.1 ? 1 : 1 - utilization;
    }

    if (railId.startsWith('tempo')) {
      // Check Tempo liquidity
      const liquidity = await TempoFX.getLiquidity(intent.destinationCurrency);
      const utilization = intent.amount / liquidity.available;
      return utilization < 0.1 ? 1 : 1 - utilization;
    }

    if (railId.startsWith('bitgo')) {
      // Check wallet balance
      const balance = await BitGoCustody.getBalance(
        intent.sourceWallet,
        railId.split('_')[1]
      );
      return balance.spendableBalance >= intent.amount ? 1 : 0;
    }

    return 0.5; // Unknown liquidity
  }

  async scoreCompliance(railId, intent) {
    const result = await BREEngine.evaluate({
      railId,
      intent,
      enhanced: true
    });

    if (!result.allowed) return 0;
    if (result.warnings.length === 0) return 1;

    // Reduce score based on warning severity
    const severityReduction = {
      'low': 0.9,
      'medium': 0.7,
      'high': 0.3
    };

    const worstSeverity = Math.max(
      ...result.warnings.map(w => severityReduction[w.severity] || 0.5)
    );

    return worstSeverity;
  }

  // Execute payment on selected rail with automatic fallback
  async execute(routingDecision, paymentData) {
    let lastError;
    const rails = [routingDecision.primary, ...routingDecision.fallbacks];

    for (const rail of rails) {
      try {
        const breaker = this.circuitBreakers.get(rail.railId);

        // Execute through circuit breaker
        const result = await breaker.execute(async () => {
          return await this.executeOnRail(rail, paymentData);
        });

        // Success - update metrics
        await this.recordSuccess(rail.railId, result);
        return result;

      } catch (error) {
        lastError = error;
        await this.recordFailure(rail.railId, error);

        // Continue to next rail
        console.log(`Rail ${rail.railId} failed, trying fallback...`, error);
      }
    }

    // All rails failed
    throw new Error(`All payment rails failed. Last error: ${lastError.message}`);
  }

  async executeOnRail(rail, paymentData) {
    const { railId, provider } = rail;

    switch (railId) {
      case 'cross_river_ach':
        return await CrossRiverClient.sendACH(paymentData);

      case 'cross_river_fednow':
        return await CrossRiverClient.sendFedNow(paymentData);

      case 'cross_river_rtp':
        return await CrossRiverClient.sendRTP(paymentData);

      case 'cross_river_swift':
        return await CrossRiverClient.sendSWIFT(paymentData);

      case 'bitgo_usdc':
      case 'bitgo_pyusd':
        return await BitGoCustody.transfer({
          ...paymentData,
          coin: railId.split('_')[1]
        });

      case 'tempo_fx':
        const quote = await TempoFX.getQuote(paymentData);
        return await TempoFX.executeConversion(quote.quoteId, paymentData);

      case 'tempo_sepa':
        return await TempoFX.sendCrossBorder({
          ...paymentData,
          rail: 'SEPA'
        });

      default:
        throw new Error(`Unknown rail: ${railId}`);
    }
  }

  async getReliabilityStats(railId) {
    // Query from telemetry service
    const stats = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
        AVG(latency_ms) as avg_latency,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency
      FROM rail_metrics
      WHERE rail_id = $1
        AND timestamp > NOW() - INTERVAL '1 hour'
    `, [railId]);

    return {
      successRate: stats.successes / stats.total,
      avgLatency: stats.avg_latency,
      p95Latency: stats.p95_latency
    };
  }

  async recordSuccess(railId, result) {
    await db.insert('rail_metrics', {
      rail_id: railId,
      status: 'success',
      latency_ms: result.latency,
      timestamp: new Date()
    });
  }

  async recordFailure(railId, error) {
    await db.insert('rail_metrics', {
      rail_id: railId,
      status: 'failure',
      error_message: error.message,
      timestamp: new Date()
    });
  }
}

export default new RouterV2Service();
```

---

### Phase 3: Dual-Entry Ledger System (Week 4)

#### 3.1 Unified Fiat + Crypto Ledger

```javascript
// src/monaypay/core/ledger/dual-entry.service.js
import { Pool } from 'pg';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

class DualEntryLedgerService {
  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    });

    // Account types
    this.accountTypes = {
      ASSET: 'asset',
      LIABILITY: 'liability',
      EQUITY: 'equity',
      REVENUE: 'revenue',
      EXPENSE: 'expense'
    };

    // Initialize chart of accounts
    this.initializeChartOfAccounts();
  }

  async initializeChartOfAccounts() {
    // Standard accounts for MonayPay
    this.chartOfAccounts = {
      // Assets
      '1000': { name: 'Cross River FBO Account', type: 'ASSET', currency: 'USD' },
      '1100': { name: 'BitGo USDC Custody', type: 'ASSET', currency: 'USDC' },
      '1101': { name: 'BitGo PYUSD Custody', type: 'ASSET', currency: 'PYUSD' },
      '1102': { name: 'BitGo EURC Custody', type: 'ASSET', currency: 'EURC' },
      '1200': { name: 'Tempo Liquidity Pool', type: 'ASSET', currency: 'MULTI' },

      // Liabilities
      '2000': { name: 'User Fiat Balances', type: 'LIABILITY', currency: 'USD' },
      '2100': { name: 'User USDC Balances', type: 'LIABILITY', currency: 'USDC' },
      '2200': { name: 'Pending Settlements', type: 'LIABILITY', currency: 'MULTI' },
      '2300': { name: 'Invoice Escrows', type: 'LIABILITY', currency: 'MULTI' },

      // Revenue
      '3000': { name: 'Transaction Fees', type: 'REVENUE', currency: 'USD' },
      '3100': { name: 'FX Spread Revenue', type: 'REVENUE', currency: 'USD' },
      '3200': { name: 'Custody Fees', type: 'REVENUE', currency: 'USD' },

      // Expenses
      '4000': { name: 'Bank Fees', type: 'EXPENSE', currency: 'USD' },
      '4100': { name: 'Network Gas Fees', type: 'EXPENSE', currency: 'MULTI' },
      '4200': { name: 'Provider Fees', type: 'EXPENSE', currency: 'USD' }
    };
  }

  // Create atomic multi-leg posting
  async createTransaction(entries, metadata = {}) {
    const transactionId = uuidv4();
    const timestamp = new Date();

    // Validate double-entry balance
    const totalDebits = entries
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCredits = entries
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error(`Unbalanced transaction: debits=${totalDebits}, credits=${totalCredits}`);
    }

    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Create transaction header
      await client.query(`
        INSERT INTO ledger_transactions (
          id, timestamp, description, metadata, status
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        transactionId,
        timestamp,
        metadata.description || 'Payment transaction',
        JSON.stringify(metadata),
        'pending'
      ]);

      // Create journal entries
      for (const entry of entries) {
        // Get account details
        const account = this.chartOfAccounts[entry.accountId];
        if (!account) {
          throw new Error(`Invalid account: ${entry.accountId}`);
        }

        // Determine debit/credit amounts
        const debitAmount = entry.type === 'debit' ? entry.amount : 0;
        const creditAmount = entry.type === 'credit' ? entry.amount : 0;

        // Insert journal entry
        await client.query(`
          INSERT INTO journal_entries (
            id, transaction_id, account_id, account_name,
            debit_amount, credit_amount, currency,
            description, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          uuidv4(),
          transactionId,
          entry.accountId,
          account.name,
          debitAmount,
          creditAmount,
          entry.currency || account.currency,
          entry.description,
          JSON.stringify(entry.metadata || {})
        ]);

        // Update account balance
        const balanceChange = entry.type === 'debit'
          ? (account.type === 'ASSET' || account.type === 'EXPENSE' ? entry.amount : -entry.amount)
          : (account.type === 'ASSET' || account.type === 'EXPENSE' ? -entry.amount : entry.amount);

        await client.query(`
          INSERT INTO account_balances (
            account_id, currency, balance, last_transaction_id, updated_at
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (account_id, currency) DO UPDATE
          SET balance = account_balances.balance + $3,
              last_transaction_id = $4,
              updated_at = $5
        `, [
          entry.accountId,
          entry.currency || account.currency,
          balanceChange,
          transactionId,
          timestamp
        ]);
      }

      // Update transaction status
      await client.query(`
        UPDATE ledger_transactions
        SET status = 'completed'
        WHERE id = $1
      `, [transactionId]);

      await client.query('COMMIT');

      // Publish to Redis stream for real-time processing
      await this.redis.xadd(
        'ledger:transactions',
        '*',
        'transaction_id', transactionId,
        'timestamp', timestamp.toISOString(),
        'type', metadata.type || 'payment',
        'amount', totalDebits.toString()
      );

      return {
        transactionId,
        timestamp,
        entries: entries.length,
        status: 'completed'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Invoice payment with automatic wallet creation
  async recordInvoicePayment(invoice, payment) {
    const entries = [];

    // Debit: User's source account
    entries.push({
      accountId: '2000', // User Fiat Balances
      type: 'debit',
      amount: payment.amount,
      currency: payment.currency,
      description: `Payment for invoice ${invoice.id}`,
      metadata: {
        userId: payment.userId,
        invoiceId: invoice.id
      }
    });

    // Credit: Invoice escrow (temporary holding)
    entries.push({
      accountId: '2300', // Invoice Escrows
      type: 'credit',
      amount: payment.amount,
      currency: payment.currency,
      description: `Escrow for invoice ${invoice.id}`,
      metadata: {
        invoiceId: invoice.id,
        walletAddress: invoice.walletAddress
      }
    });

    // If cross-rail transfer needed
    if (payment.rail !== invoice.settlementRail) {
      // Debit: Source rail
      entries.push({
        accountId: this.getRailAccount(payment.rail),
        type: 'debit',
        amount: payment.amount,
        currency: payment.currency,
        metadata: { rail: payment.rail }
      });

      // Credit: Destination rail
      entries.push({
        accountId: this.getRailAccount(invoice.settlementRail),
        type: 'credit',
        amount: payment.settlementAmount,
        currency: invoice.settlementCurrency,
        metadata: { rail: invoice.settlementRail }
      });

      // Record FX spread if applicable
      if (payment.currency !== invoice.settlementCurrency) {
        const fxSpread = payment.amount * payment.fxRate - payment.settlementAmount;
        entries.push({
          accountId: '3100', // FX Spread Revenue
          type: 'credit',
          amount: Math.abs(fxSpread),
          currency: 'USD',
          description: 'FX spread revenue'
        });
      }
    }

    // Transaction fee
    entries.push({
      accountId: '3000', // Transaction Fees
      type: 'credit',
      amount: payment.fee,
      currency: 'USD',
      description: 'Transaction fee'
    });

    // Provider fee (expense)
    entries.push({
      accountId: '4000', // Bank Fees
      type: 'debit',
      amount: payment.providerFee,
      currency: 'USD',
      description: 'Provider processing fee'
    });

    return await this.createTransaction(entries, {
      type: 'invoice_payment',
      invoiceId: invoice.id,
      paymentId: payment.id,
      userId: payment.userId,
      rail: payment.rail,
      description: `Invoice payment: ${invoice.id}`
    });
  }

  // Reconciliation snapshot
  async createReconciliationSnapshot() {
    const snapshot = {
      timestamp: new Date(),
      accounts: {},
      discrepancies: []
    };

    // Get all account balances from ledger
    const ledgerBalances = await this.db.query(`
      SELECT account_id, currency, SUM(balance) as balance
      FROM account_balances
      GROUP BY account_id, currency
    `);

    // Compare with external sources
    for (const account of ledgerBalances.rows) {
      const externalBalance = await this.getExternalBalance(account.account_id);

      snapshot.accounts[account.account_id] = {
        ledger: account.balance,
        external: externalBalance,
        difference: Math.abs(account.balance - externalBalance)
      };

      if (snapshot.accounts[account.account_id].difference > 0.01) {
        snapshot.discrepancies.push({
          account: account.account_id,
          ledgerBalance: account.balance,
          externalBalance: externalBalance,
          difference: account.balance - externalBalance
        });
      }
    }

    // Store snapshot
    await this.db.query(`
      INSERT INTO reconciliation_snapshots (
        id, timestamp, snapshot_data, discrepancy_count
      ) VALUES ($1, $2, $3, $4)
    `, [
      uuidv4(),
      snapshot.timestamp,
      JSON.stringify(snapshot),
      snapshot.discrepancies.length
    ]);

    return snapshot;
  }

  async getExternalBalance(accountId) {
    switch (accountId) {
      case '1000': // Cross River FBO
        const crBalance = await CrossRiverClient.getBalance();
        return crBalance.available;

      case '1100': // BitGo USDC
        const bgBalance = await BitGoCustody.getBalance(
          process.env.BITGO_MASTER_WALLET,
          'usdc'
        );
        return bgBalance.spendableBalance;

      case '1200': // Tempo Liquidity
        const tempoBalance = await TempoFX.getLiquidity('USD');
        return tempoBalance.available;

      default:
        return 0;
    }
  }

  getRailAccount(rail) {
    const railAccounts = {
      'cross_river_ach': '1000',
      'cross_river_fednow': '1000',
      'cross_river_rtp': '1000',
      'cross_river_swift': '1000',
      'bitgo_usdc': '1100',
      'bitgo_pyusd': '1101',
      'bitgo_eurc': '1102',
      'tempo_fx': '1200',
      'tempo_sepa': '1200'
    };

    return railAccounts[rail] || '1000';
  }

  // Get account balance
  async getBalance(accountId, currency = null) {
    const query = currency
      ? 'SELECT * FROM account_balances WHERE account_id = $1 AND currency = $2'
      : 'SELECT * FROM account_balances WHERE account_id = $1';

    const params = currency ? [accountId, currency] : [accountId];
    const result = await this.db.query(query, params);

    return result.rows;
  }

  // Get transaction history
  async getTransactionHistory(filters = {}) {
    let query = `
      SELECT
        t.id, t.timestamp, t.description, t.metadata, t.status,
        json_agg(
          json_build_object(
            'account_id', je.account_id,
            'account_name', je.account_name,
            'debit', je.debit_amount,
            'credit', je.credit_amount,
            'currency', je.currency
          )
        ) as entries
      FROM ledger_transactions t
      JOIN journal_entries je ON je.transaction_id = t.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.startDate) {
      query += ` AND t.timestamp >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND t.timestamp <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    if (filters.accountId) {
      query += ` AND EXISTS (
        SELECT 1 FROM journal_entries je2
        WHERE je2.transaction_id = t.id
        AND je2.account_id = $${paramIndex++}
      )`;
      params.push(filters.accountId);
    }

    query += ` GROUP BY t.id ORDER BY t.timestamp DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    const result = await this.db.query(query, params);
    return result.rows;
  }
}

export default new DualEntryLedgerService();
```

---

### Phase 4: Business Rule Engine (BRE) (Week 5)

#### 4.1 BRE Compliance Engine

```javascript
// src/monaypay/core/compliance/bre-engine.js
import { compile } from './rule-compiler.js';
import { AttestationDAG } from './attestation-dag.js';
import { PolicyEnforcer } from './policy-enforcer.js';

class BREEngine {
  constructor() {
    this.rules = new Map();
    this.attestationDAG = new AttestationDAG();
    this.policyEnforcer = new PolicyEnforcer();

    // Load default rules
    this.loadDefaultRules();
  }

  async loadDefaultRules() {
    // Sanctions screening rule
    this.addRule({
      id: 'sanctions-check',
      name: 'OFAC Sanctions Screening',
      condition: {
        type: 'not_in_list',
        field: 'beneficiary.country',
        list: ['IR', 'KP', 'SY', 'CU'] // Sanctioned countries
      },
      action: 'deny',
      message: 'Transaction blocked: Sanctioned jurisdiction'
    });

    // Amount limits by user type
    this.addRule({
      id: 'amount-limit',
      name: 'Transaction Amount Limits',
      condition: {
        type: 'conditional',
        rules: [
          {
            if: { field: 'user.type', equals: 'consumer' },
            then: { field: 'amount', max: 50000 }
          },
          {
            if: { field: 'user.type', equals: 'enterprise' },
            then: { field: 'amount', max: 10000000 }
          }
        ]
      },
      action: 'require_approval',
      message: 'Transaction exceeds limit for user type'
    });

    // Cross-border compliance
    this.addRule({
      id: 'travel-rule',
      name: 'FATF Travel Rule',
      condition: {
        type: 'and',
        conditions: [
          { field: 'type', equals: 'cross_border' },
          { field: 'amount', greater_than: 1000 }
        ]
      },
      action: 'require_travel_rule',
      message: 'Travel rule information required'
    });

    // Velocity checks
    this.addRule({
      id: 'velocity-check',
      name: 'Transaction Velocity Limits',
      condition: {
        type: 'velocity',
        window: '24h',
        limits: {
          count: 100,
          volume: 100000
        }
      },
      action: 'flag_review',
      message: 'Unusual transaction velocity detected'
    });
  }

  async evaluate(context) {
    const results = {
      allowed: true,
      denied: false,
      warnings: [],
      requirements: [],
      attestation: null
    };

    // Run all applicable rules
    for (const [ruleId, rule] of this.rules) {
      const ruleResult = await this.evaluateRule(rule, context);

      if (ruleResult.triggered) {
        switch (rule.action) {
          case 'deny':
            results.allowed = false;
            results.denied = true;
            results.denialReason = rule.message;
            break;

          case 'require_approval':
            results.requirements.push({
              type: 'approval',
              rule: ruleId,
              message: rule.message
            });
            break;

          case 'require_travel_rule':
            results.requirements.push({
              type: 'travel_rule',
              rule: ruleId,
              fields: ['originator', 'beneficiary']
            });
            break;

          case 'flag_review':
            results.warnings.push({
              severity: 'medium',
              rule: ruleId,
              message: rule.message
            });
            break;
        }
      }
    }

    // Generate attestation
    if (!results.denied) {
      results.attestation = await this.attestationDAG.create({
        context,
        results,
        rules: Array.from(this.rules.keys()),
        timestamp: new Date()
      });
    }

    return results;
  }

  async evaluateRule(rule, context) {
    const compiled = compile(rule.condition);
    const result = await compiled(context);

    return {
      triggered: result,
      ruleId: rule.id,
      timestamp: new Date()
    };
  }

  async preCheck(context) {
    // Quick pre-flight check for obvious denials
    const criticalRules = ['sanctions-check', 'amount-limit'];

    for (const ruleId of criticalRules) {
      const rule = this.rules.get(ruleId);
      if (!rule) continue;

      const result = await this.evaluateRule(rule, context);
      if (result.triggered && rule.action === 'deny') {
        return {
          allowed: false,
          reason: rule.message
        };
      }
    }

    return { allowed: true };
  }

  addRule(rule) {
    this.rules.set(rule.id, rule);
  }

  async deployToChain(ruleId, chain) {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`Rule not found: ${ruleId}`);

    // Compile to chain-specific code
    let chainCode;
    switch (chain) {
      case 'evm':
        chainCode = await this.compileToSolidity(rule);
        break;
      case 'solana':
        chainCode = await this.compileToRust(rule);
        break;
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }

    // Deploy via appropriate connector
    const deployment = await this.deployContract(chain, chainCode);

    // Record deployment in attestation DAG
    await this.attestationDAG.recordDeployment({
      ruleId,
      chain,
      address: deployment.address,
      timestamp: new Date()
    });

    return deployment;
  }

  async compileToSolidity(rule) {
    // Generate Solidity contract for rule
    return `
      pragma solidity ^0.8.0;

      contract Rule_${rule.id} {
        function evaluate(
          address sender,
          address recipient,
          uint256 amount,
          bytes32 invoiceId
        ) public view returns (bool allowed, string memory reason) {
          // Rule logic here
          ${this.generateSolidityLogic(rule)}
        }
      }
    `;
  }

  async synchronizeAcrossChains() {
    // Ensure rule versions are consistent across all chains
    const chains = ['evm', 'solana'];
    const syncReport = {};

    for (const chain of chains) {
      const deployedRules = await this.getDeployedRules(chain);
      syncReport[chain] = {
        deployed: deployedRules.length,
        versions: deployedRules.map(r => ({ id: r.id, version: r.version }))
      };
    }

    return syncReport;
  }
}

export default new BREEngine();
```

---

### Phase 5: ERP Connectors & Integration (Week 6)

#### 5.1 SAP Integration Connector

```javascript
// src/monaypay/connectors/erp/sap-connector.js
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

class SAPConnector {
  constructor() {
    this.baseURL = process.env.SAP_API_URL;
    this.clientId = process.env.SAP_CLIENT_ID;
    this.clientSecret = process.env.SAP_CLIENT_SECRET;

    this.oauth2Client = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      `${this.baseURL}/oauth/callback`
    );

    this.syncInterval = 5 * 60 * 1000; // 5 minutes
    this.startSync();
  }

  async connect(credentials) {
    // OAuth2 flow for SAP
    const { tokens } = await this.oauth2Client.getToken(credentials.code);
    this.oauth2Client.setCredentials(tokens);

    // Test connection
    const test = await this.testConnection();
    if (!test.success) {
      throw new Error('SAP connection failed');
    }

    return {
      connected: true,
      company: test.company,
      version: test.version
    };
  }

  async syncInvoices() {
    // Pull invoices from SAP
    const response = await this.apiCall('/api/v1/invoices', {
      params: {
        status: ['open', 'pending'],
        modified_since: this.lastSyncTime
      }
    });

    const invoices = response.data.items;
    const processed = [];

    for (const sapInvoice of invoices) {
      // Create MonayPay invoice with wallet
      const monayInvoice = await this.createMonayInvoice(sapInvoice);

      // Update SAP with wallet address
      await this.updateSAPInvoice(sapInvoice.id, {
        external_wallet: monayInvoice.walletAddress,
        payment_link: monayInvoice.paymentLink
      });

      processed.push(monayInvoice);
    }

    this.lastSyncTime = new Date();
    return processed;
  }

  async createMonayInvoice(sapInvoice) {
    // Map SAP invoice to MonayPay format
    const invoice = {
      externalId: sapInvoice.id,
      vendorId: sapInvoice.vendor_id,
      amount: sapInvoice.net_amount,
      currency: sapInvoice.currency,
      dueDate: sapInvoice.due_date,
      description: sapInvoice.description,
      lineItems: sapInvoice.items,

      // Invoice-First wallet configuration
      createWallet: true,
      walletMode: sapInvoice.payment_terms === 'NET30' ? 'persistent' : 'ephemeral',
      ttlHours: this.calculateTTL(sapInvoice),

      // ERP metadata
      erpSystem: 'SAP',
      erpCompany: sapInvoice.company_code,
      costCenter: sapInvoice.cost_center,
      glAccount: sapInvoice.gl_account
    };

    // Create invoice and wallet via MonayPay
    const result = await InvoiceWalletFactory.createFromERP(invoice);

    return result;
  }

  async onPaymentComplete(invoiceId, payment) {
    // Update SAP when payment received
    const sapUpdate = {
      payment_status: 'paid',
      payment_date: payment.timestamp,
      payment_reference: payment.transactionId,
      payment_method: payment.rail,

      // Accounting entries
      journal_entries: [
        {
          account: payment.glAccount || '1000',
          debit: payment.amount,
          credit: 0,
          description: `Payment received: ${invoiceId}`
        },
        {
          account: '2000', // Accounts Receivable
          debit: 0,
          credit: payment.amount,
          description: `Invoice cleared: ${invoiceId}`
        }
      ]
    };

    await this.apiCall(`/api/v1/invoices/${invoiceId}/payment`, {
      method: 'POST',
      data: sapUpdate
    });

    // Post to SAP FI module
    await this.postToFI(sapUpdate.journal_entries);
  }

  async postToFI(entries) {
    // Post journal entries to SAP Financial Accounting
    const fiDocument = {
      document_type: 'SA', // G/L account document
      posting_date: new Date(),
      entries: entries.map(entry => ({
        gl_account: entry.account,
        amount: entry.debit - entry.credit,
        cost_center: entry.cost_center,
        profit_center: entry.profit_center,
        text: entry.description
      }))
    };

    const response = await this.apiCall('/api/v1/fi/documents', {
      method: 'POST',
      data: fiDocument
    });

    return response.data.document_number;
  }

  async apiCall(endpoint, options = {}) {
    const token = await this.oauth2Client.getAccessToken();

    return await axios({
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-SAP-Client': this.clientId
      },
      ...options
    });
  }

  calculateTTL(invoice) {
    const dueDate = new Date(invoice.due_date);
    const now = new Date();
    const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

    // Add 24 hour buffer after due date
    return Math.max(hoursUntilDue + 24, 24);
  }

  startSync() {
    // Periodic sync with SAP
    setInterval(async () => {
      try {
        await this.syncInvoices();
        await this.syncPayments();
        await this.reconcile();
      } catch (error) {
        console.error('SAP sync error:', error);
      }
    }, this.syncInterval);
  }

  async reconcile() {
    // Compare MonayPay ledger with SAP
    const sapBalances = await this.getSAPBalances();
    const monayBalances = await DualEntryLedger.getBalances();

    const discrepancies = [];

    for (const account of sapBalances) {
      const monayAccount = monayBalances.find(m => m.externalId === account.id);

      if (!monayAccount) continue;

      const diff = Math.abs(account.balance - monayAccount.balance);
      if (diff > 0.01) {
        discrepancies.push({
          account: account.id,
          sapBalance: account.balance,
          monayBalance: monayAccount.balance,
          difference: diff
        });
      }
    }

    if (discrepancies.length > 0) {
      await this.notifyDiscrepancies(discrepancies);
    }

    return {
      reconciled: discrepancies.length === 0,
      discrepancies
    };
  }
}

export default new SAPConnector();
```

---

## 🔄 DATABASE SCHEMA

```sql
-- MonayPay Core Tables

-- Dual-entry ledger
CREATE TABLE ledger_transactions (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  description TEXT,
  metadata JSONB,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES ledger_transactions(id),
  account_id VARCHAR(10) NOT NULL,
  account_name VARCHAR(100),
  debit_amount DECIMAL(20, 8) DEFAULT 0,
  credit_amount DECIMAL(20, 8) DEFAULT 0,
  currency VARCHAR(10) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE account_balances (
  account_id VARCHAR(10),
  currency VARCHAR(10),
  balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
  last_transaction_id UUID,
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (account_id, currency)
);

-- Rail routing
CREATE TABLE routing_decisions (
  id UUID PRIMARY KEY,
  invoice_id VARCHAR(100),
  intent JSONB NOT NULL,
  selected_rail VARCHAR(50),
  fallback_rails JSONB,
  score_breakdown JSONB,
  compliance_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rail_metrics (
  rail_id VARCHAR(50),
  status VARCHAR(20),
  latency_ms INTEGER,
  error_message TEXT,
  timestamp TIMESTAMPTZ,
  metadata JSONB
);

-- Provider integrations
CREATE TABLE provider_credentials (
  provider VARCHAR(50) PRIMARY KEY,
  credentials JSONB, -- Encrypted
  status VARCHAR(20),
  last_health_check TIMESTAMPTZ,
  metadata JSONB
);

-- BRE Rules
CREATE TABLE bre_rules (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200),
  condition JSONB NOT NULL,
  action VARCHAR(50),
  message TEXT,
  version INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bre_attestations (
  id UUID PRIMARY KEY,
  context JSONB,
  results JSONB,
  rules TEXT[],
  hash VARCHAR(64), -- SHA256
  merkle_root VARCHAR(64),
  chain_anchors JSONB,
  created_at TIMESTAMPTZ
);

-- ERP synchronization
CREATE TABLE erp_sync_log (
  id UUID PRIMARY KEY,
  erp_system VARCHAR(50),
  sync_type VARCHAR(50),
  records_synced INTEGER,
  discrepancies JSONB,
  status VARCHAR(20),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_journal_transaction ON journal_entries(transaction_id);
CREATE INDEX idx_journal_account ON journal_entries(account_id);
CREATE INDEX idx_rail_metrics_rail ON rail_metrics(rail_id, timestamp);
CREATE INDEX idx_routing_invoice ON routing_decisions(invoice_id);
CREATE INDEX idx_attestation_hash ON bre_attestations(hash);
```

---

## 🚀 DEPLOYMENT & CONFIGURATION

### Environment Variables

```env
# Cross River Bank
CROSS_RIVER_API_URL=https://api.crossriver.com
CROSS_RIVER_API_KEY=your-api-key
CROSS_RIVER_SECRET=your-secret
CROSS_RIVER_FBO_ACCOUNT=your-fbo-account-id

# BitGo Custody
BITGO_ENV=prod
BITGO_ACCESS_TOKEN=your-access-token
BITGO_ENTERPRISE_ID=your-enterprise-id
BITGO_WALLET_PASSPHRASE=your-secure-passphrase
BITGO_MASTER_WALLET=your-master-wallet-id

# Tempo FX
TEMPO_API_URL=https://api.tempo.eu
TEMPO_API_KEY=your-api-key
TEMPO_SECRET=your-secret

# HSM Configuration
HSM_URL=https://hsm.monay.internal
HSM_CREDENTIALS=encrypted-credentials

# ERP Systems
SAP_API_URL=https://sap.company.com/api
SAP_CLIENT_ID=your-client-id
SAP_CLIENT_SECRET=your-client-secret

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/monay
REDIS_URL=redis://localhost:6379
```

---

## 📊 SUCCESS METRICS

- Rail selection accuracy: > 95%
- Payment success rate: > 99.5%
- Average routing decision: < 100ms
- Ledger reconciliation accuracy: 100%
- Cross-border settlement: < 30 minutes
- Domestic settlement: < 1 minute
- Cost per transaction: < $0.50 (ACH), < $0.05 (on-chain)

---

This MonayPay orchestration core is what powers the entire platform, intelligently routing between Cross River Bank, BitGo custody, and Tempo FX based on optimal cost, speed, and compliance requirements!