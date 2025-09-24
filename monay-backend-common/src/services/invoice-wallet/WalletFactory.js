/**
 * Invoice-First Wallet Factory Service
 * Implements the revolutionary patent-pending Invoice-First Wallet System
 *
 * @module WalletFactory
 * @description Generates ephemeral/persistent cryptocurrency wallets from invoices
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import db from '../../models/index.js';
import logger from '../logger.js';
import evmService from '../evm.js';
import solanaService from '../solana.js';
import AIModeSelectorEngine from './AIModeSelectorEngine.js';
import QuantumCrypto from './QuantumCrypto.js';
import EphemeralManager from './EphemeralManager.js';
import blockchainIntegration from './BlockchainIntegration.js';

class WalletFactory {
  constructor() {
    this.aiSelector = new AIModeSelectorEngine();
    this.quantumCrypto = new QuantumCrypto();
    this.ephemeralManager = new EphemeralManager();
  }

  /**
   * Generate a wallet from an invoice
   * Core innovation: Invoice creates wallet, not wallet receives invoice
   *
   * @param {Object} invoice - Invoice object
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated wallet
   */
  async generateWalletFromInvoice(invoice, options = {}) {
    try {
      logger.info('Generating Invoice-First wallet', { invoiceId: invoice.id });

      // Step 1: Determine wallet mode using AI
      const mode = await this.selectWalletMode(invoice, options);

      // Step 2: Generate blockchain addresses
      const addresses = await this.generateBlockchainAddresses();

      // Step 3: Generate quantum-resistant keys
      const quantumKeys = await this.quantumCrypto.generateKeyPair();

      // Step 4: Create wallet based on mode
      let wallet;
      switch (mode) {
        case 'ephemeral':
          wallet = await this.createEphemeralWallet(invoice, addresses, quantumKeys, options);
          break;
        case 'persistent':
          wallet = await this.createPersistentWallet(invoice, addresses, quantumKeys, options);
          break;
        case 'adaptive':
          wallet = await this.createAdaptiveWallet(invoice, addresses, quantumKeys, options);
          break;
        default:
          throw new Error(`Invalid wallet mode: ${mode}`);
      }

      // Step 5: Store wallet in database
      const savedWallet = await this.saveWallet(wallet);

      // Step 6: Log lifecycle event
      await this.logLifecycleEvent(savedWallet.id, 'created', {
        mode,
        invoiceId: invoice.id,
        ttl: wallet.ttl_seconds
      });

      // Step 7: Schedule destruction if ephemeral
      if (mode === 'ephemeral' && wallet.ttl_seconds) {
        await this.ephemeralManager.scheduleDestruction(savedWallet.id, wallet.ttl_seconds);
      }

      logger.info('Invoice-First wallet generated successfully', {
        walletId: savedWallet.id,
        mode,
        invoiceId: invoice.id
      });

      return savedWallet;
    } catch (error) {
      logger.error('Failed to generate wallet from invoice', error);
      throw error;
    }
  }

  /**
   * Select optimal wallet mode using AI
   *
   * @param {Object} invoice - Invoice data
   * @param {Object} options - Override options
   * @returns {Promise<string>} Selected mode
   */
  async selectWalletMode(invoice, options = {}) {
    try {
      // Allow manual override
      if (options.mode && ['ephemeral', 'persistent', 'adaptive'].includes(options.mode)) {
        await this.recordModeDecision(invoice, options.mode, null, 'manual_override');
        return options.mode;
      }

      // Use AI to determine optimal mode
      const aiDecision = await this.aiSelector.determineMode({
        amount: invoice.amount,
        customerProfile: invoice.customer,
        transactionType: invoice.type,
        isRecurring: invoice.isRecurring || false,
        riskScore: invoice.riskScore || 50
      });

      await this.recordModeDecision(
        invoice,
        aiDecision.mode,
        aiDecision.score,
        aiDecision.reasoning
      );

      return aiDecision.mode;
    } catch (error) {
      logger.error('Mode selection failed, defaulting to ephemeral', error);
      return 'ephemeral'; // Safe default
    }
  }

  /**
   * Create ephemeral (self-destructing) wallet
   *
   * @param {Object} invoice - Invoice data
   * @param {Object} addresses - Blockchain addresses
   * @param {Object} quantumKeys - Quantum-resistant keys
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Ephemeral wallet
   */
  async createEphemeralWallet(invoice, addresses, quantumKeys, options = {}) {
    // Calculate TTL (default 24 hours)
    const ttlSeconds = options.ttl || this.calculateEphemeralTTL(invoice);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    return {
      id: uuidv4(),
      invoice_id: invoice.id,
      mode: 'ephemeral',
      base_address: addresses.base,
      solana_address: addresses.solana,
      quantum_public_key: quantumKeys.publicKey,
      quantum_encrypted_private_key: await this.encryptPrivateKey(quantumKeys.privateKey),
      expires_at: expiresAt,
      ttl_seconds: ttlSeconds,
      status: 'active',
      features: {
        selfDestruct: true,
        maxTransactions: 1,
        allowedOperations: ['receive', 'forward'],
        securityLevel: 'maximum'
      },
      ai_score: await this.aiSelector.calculatePersistenceScore(invoice)
    };
  }

  /**
   * Create persistent (permanent) wallet
   *
   * @param {Object} invoice - Invoice data
   * @param {Object} addresses - Blockchain addresses
   * @param {Object} quantumKeys - Quantum-resistant keys
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Persistent wallet
   */
  async createPersistentWallet(invoice, addresses, quantumKeys, options = {}) {
    return {
      id: uuidv4(),
      invoice_id: invoice.id,
      mode: 'persistent',
      base_address: addresses.base,
      solana_address: addresses.solana,
      quantum_public_key: quantumKeys.publicKey,
      quantum_encrypted_private_key: await this.encryptPrivateKey(quantumKeys.privateKey),
      expires_at: null, // Never expires
      ttl_seconds: null,
      status: 'active',
      features: {
        selfDestruct: false,
        maxTransactions: null, // Unlimited
        allowedOperations: ['receive', 'send', 'swap', 'stake'],
        consumerFeatures: true,
        recurringPayments: true,
        multiCurrency: true,
        defiAccess: true
      },
      ai_score: await this.aiSelector.calculatePersistenceScore(invoice)
    };
  }

  /**
   * Create adaptive wallet (can transform from ephemeral to persistent)
   *
   * @param {Object} invoice - Invoice data
   * @param {Object} addresses - Blockchain addresses
   * @param {Object} quantumKeys - Quantum-resistant keys
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Adaptive wallet
   */
  async createAdaptiveWallet(invoice, addresses, quantumKeys, options = {}) {
    // Start as ephemeral with transformation capability
    const ttlSeconds = options.ttl || this.calculateEphemeralTTL(invoice);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    return {
      id: uuidv4(),
      invoice_id: invoice.id,
      mode: 'adaptive',
      base_address: addresses.base,
      solana_address: addresses.solana,
      quantum_public_key: quantumKeys.publicKey,
      quantum_encrypted_private_key: await this.encryptPrivateKey(quantumKeys.privateKey),
      expires_at: expiresAt,
      ttl_seconds: ttlSeconds,
      status: 'active',
      features: {
        selfDestruct: true,
        transformable: true,
        maxTransactions: null,
        allowedOperations: ['receive', 'forward', 'transform'],
        adaptiveThreshold: 0.7 // Score threshold for auto-transformation
      },
      ai_score: await this.aiSelector.calculatePersistenceScore(invoice)
    };
  }

  /**
   * Generate blockchain addresses for dual-rail system
   *
   * @returns {Promise<Object>} Generated addresses
   */
  async generateBlockchainAddresses() {
    // Use the blockchain integration service for real network connections
    // This connects to actual Base L2 (Sepolia testnet) and Solana (devnet)
    return await blockchainIntegration.generateBlockchainAddresses();
  }

  /**
   * Calculate TTL for ephemeral wallet based on invoice parameters
   *
   * @param {Object} invoice - Invoice data
   * @returns {number} TTL in seconds
   */
  calculateEphemeralTTL(invoice) {
    const DEFAULT_TTL = 86400; // 24 hours
    const MIN_TTL = 3600; // 1 hour
    const MAX_TTL = 31536000; // 365 days

    let ttl = DEFAULT_TTL;

    // Adjust based on payment terms
    if (invoice.dueDate) {
      const dueInMs = new Date(invoice.dueDate) - Date.now();
      ttl = Math.max(MIN_TTL, Math.min(MAX_TTL, Math.floor(dueInMs / 1000)));
    }

    // Adjust based on amount
    if (invoice.amount > 100000) {
      ttl = Math.min(ttl, 259200); // Cap at 3 days for high-value
    }

    // Adjust based on risk
    if (invoice.riskScore > 70) {
      ttl = Math.min(ttl, 43200); // Cap at 12 hours for high-risk
    }

    return ttl;
  }

  /**
   * Encrypt private key using AES-256-GCM
   *
   * @param {string} privateKey - Private key to encrypt
   * @returns {Promise<string>} Encrypted private key
   */
  async encryptPrivateKey(privateKey) {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY || crypto.randomBytes(32));
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      encrypted,
      authTag: authTag.toString('hex'),
      iv: iv.toString('hex')
    });
  }

  /**
   * Save wallet to database
   *
   * @param {Object} wallet - Wallet data
   * @returns {Promise<Object>} Saved wallet
   */
  async saveWallet(wallet) {
    try {
      const savedWallet = await db.InvoiceWallet.create(wallet);

      // Save quantum keys separately
      if (wallet.quantum_public_key) {
        await db.QuantumKeyRegistry.create({
          wallet_id: savedWallet.id,
          algorithm: 'CRYSTALS-Kyber-1024',
          public_key: wallet.quantum_public_key,
          key_version: 1,
          is_active: true,
          security_level: 256
        });
      }

      return savedWallet;
    } catch (error) {
      logger.error('Failed to save wallet to database', error);
      throw error;
    }
  }

  /**
   * Log wallet lifecycle event
   *
   * @param {string} walletId - Wallet ID
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async logLifecycleEvent(walletId, eventType, eventData = {}) {
    try {
      await db.WalletLifecycleEvent.create({
        wallet_id: walletId,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to log lifecycle event', error);
      // Non-critical, don't throw
    }
  }

  /**
   * Record mode selection decision for analytics
   *
   * @param {Object} invoice - Invoice data
   * @param {string} mode - Selected mode
   * @param {number} aiScore - AI score
   * @param {string} reasoning - Decision reasoning
   * @returns {Promise<void>}
   */
  async recordModeDecision(invoice, mode, aiScore, reasoning) {
    try {
      await db.WalletModeDecision.create({
        invoice_id: invoice.id,
        selected_mode: mode,
        ai_score: aiScore,
        decision_factors: {
          amount: invoice.amount,
          risk_score: invoice.riskScore,
          is_recurring: invoice.isRecurring,
          reasoning
        },
        transaction_amount: invoice.amount,
        customer_risk_score: invoice.riskScore,
        is_recurring: invoice.isRecurring || false
      });
    } catch (error) {
      logger.error('Failed to record mode decision', error);
      // Non-critical, don't throw
    }
  }

  /**
   * Transform ephemeral wallet to persistent
   *
   * @param {string} walletId - Wallet ID
   * @param {Object} options - Transformation options
   * @returns {Promise<Object>} Transformed wallet
   */
  async transformToPersistent(walletId, options = {}) {
    try {
      const wallet = await db.InvoiceWallet.findByPk(walletId);

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.mode === 'persistent') {
        throw new Error('Wallet is already persistent');
      }

      if (wallet.mode !== 'adaptive' && wallet.mode !== 'ephemeral') {
        throw new Error('Only ephemeral or adaptive wallets can be transformed');
      }

      // Cancel scheduled destruction
      if (wallet.mode === 'ephemeral') {
        await this.ephemeralManager.cancelDestruction(walletId);
      }

      // Update wallet
      wallet.mode = 'persistent';
      wallet.expires_at = null;
      wallet.ttl_seconds = null;
      wallet.features = {
        ...wallet.features,
        selfDestruct: false,
        consumerFeatures: true,
        recurringPayments: true,
        multiCurrency: true,
        defiAccess: true
      };
      wallet.transformation_history = [
        ...(wallet.transformation_history || []),
        {
          from: wallet.mode,
          to: 'persistent',
          timestamp: new Date(),
          reason: options.reason || 'User requested'
        }
      ];

      await wallet.save();

      // Log transformation event
      await this.logLifecycleEvent(walletId, 'transformed', {
        from: wallet.mode,
        to: 'persistent',
        reason: options.reason
      });

      logger.info('Wallet transformed to persistent', { walletId });
      return wallet;
    } catch (error) {
      logger.error('Failed to transform wallet', error);
      throw error;
    }
  }
}

export default WalletFactory;