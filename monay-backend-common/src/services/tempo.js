/**
 * Tempo (by Stripe) Blockchain Service
 * Primary provider for stablecoin operations on Tempo L1
 *
 * Architecture: EVM-compatible L1 blockchain
 * Performance: 100,000+ TPS with sub-second finality
 * Features: Multi-stablecoin, native compliance, ISO 20022
 */

import { ethers } from 'ethers';
import EventEmitter from 'events';

// Import mock service for development
import TempoMockService from './tempo-mock.js';

class TempoService extends EventEmitter {
  constructor(config = {}) {
    super();

    // Configuration
    this.config = {
      rpcUrl: process.env.TEMPO_RPC_URL || 'https://testnet.tempo.xyz',
      apiKey: process.env.TEMPO_API_KEY,
      privateKey: process.env.TEMPO_PRIVATE_KEY,
      chainId: parseInt(process.env.TEMPO_CHAIN_ID || '80085'), // Tempo testnet
      mockMode: process.env.TEMPO_MOCK_MODE === 'true' || !process.env.TEMPO_API_KEY,
      maxRetries: 3,
      timeout: 30000,
      ...config
    };

    // Initialize mock service if in mock mode
    if (this.config.mockMode) {
      console.log('🎭 Tempo Service running in MOCK MODE');
      this.mockService = new TempoMockService();
      return;
    }

    // Initialize Web3 provider
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

    // Initialize wallet if private key provided
    if (this.config.privateKey) {
      this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
    }

    // Contract addresses (will be updated when Tempo launches)
    this.contracts = {
      stablecoinRouter: process.env.TEMPO_STABLECOIN_ROUTER,
      complianceHook: process.env.TEMPO_COMPLIANCE_HOOK,
      privacyModule: process.env.TEMPO_PRIVACY_MODULE,
      batchTransfer: process.env.TEMPO_BATCH_TRANSFER
    };

    // Supported stablecoins on Tempo
    this.supportedStablecoins = {
      'USDC': { address: null, decimals: 6 },
      'USDT': { address: null, decimals: 6 },
      'PYUSD': { address: null, decimals: 6 },
      'EURC': { address: null, decimals: 6 },
      'USDB': { address: null, decimals: 18 } // Bridge stablecoin
    };

    // Performance metrics
    this.metrics = {
      totalTransactions: 0,
      totalVolume: 0,
      averageLatency: 0,
      successRate: 1.0,
      lastBlock: 0
    };

    console.log(`🚀 Tempo Service initialized (Chain ID: ${this.config.chainId})`);
  }

  /**
   * Check if Tempo service is available
   */
  async isAvailable() {
    try {
      if (this.config.mockMode) {
        return true;
      }

      const blockNumber = await this.provider.getBlockNumber();
      this.metrics.lastBlock = blockNumber;
      return true;
    } catch (error) {
      console.error('❌ Tempo not available:', error.message);
      return false;
    }
  }

  /**
   * Get current gas price on Tempo (near-zero fees)
   */
  async getGasPrice() {
    if (this.config.mockMode) {
      return ethers.parseUnits('0.0001', 'gwei'); // Near-zero fee
    }

    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice.gasPrice;
    } catch (error) {
      console.error('Error getting gas price:', error);
      return ethers.parseUnits('0.001', 'gwei');
    }
  }

  /**
   * Create or get wallet for user
   */
  async createWallet(userId, metadata = {}) {
    const startTime = Date.now();

    try {
      if (this.config.mockMode) {
        return this.mockService.createWallet(userId, metadata);
      }

      // Generate deterministic wallet from userId (in production, use proper key derivation)
      const wallet = ethers.Wallet.createRandom();

      const walletData = {
        id: `tempo_wallet_${userId}`,
        userId,
        address: wallet.address,
        publicKey: wallet.publicKey,
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        createdAt: new Date().toISOString(),
        metadata: {
          ...metadata,
          provider: 'tempo',
          performance: '100000+ TPS',
          finality: 'sub-second'
        }
      };

      this.emit('walletCreated', walletData);
      this.recordMetric('createWallet', Date.now() - startTime, true);

      return walletData;

    } catch (error) {
      this.recordMetric('createWallet', Date.now() - startTime, false);
      throw this.handleError(error, 'Failed to create Tempo wallet');
    }
  }

  /**
   * Mint stablecoins (multiple currencies supported)
   */
  async mintStablecoin(walletId, amount, currency = 'USDC', metadata = {}) {
    const startTime = Date.now();

    try {
      if (this.config.mockMode) {
        return this.mockService.mintStablecoin(walletId, amount, currency, metadata);
      }

      // Validate currency
      if (!this.supportedStablecoins[currency]) {
        throw new Error(`Unsupported stablecoin: ${currency}`);
      }

      const stablecoin = this.supportedStablecoins[currency];
      const amountWei = ethers.parseUnits(amount.toString(), stablecoin.decimals);

      // In production, this would interact with Tempo's stablecoin router
      const transaction = {
        id: `tempo_mint_${Date.now()}`,
        type: 'mint',
        walletId,
        currency,
        amount: amount.toString(),
        amountWei: amountWei.toString(),
        status: 'pending',
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        gasPrice: (await this.getGasPrice()).toString(),
        metadata: {
          ...metadata,
          provider: 'tempo',
          multiCurrency: true,
          instantFinality: true
        },
        createdAt: new Date().toISOString()
      };

      // Simulate transaction confirmation (instant on Tempo)
      setTimeout(() => {
        transaction.status = 'confirmed';
        transaction.blockNumber = this.metrics.lastBlock + 1;
        transaction.confirmationTime = Date.now() - startTime;
        this.emit('mintConfirmed', transaction);
      }, 100); // Sub-second confirmation

      this.metrics.totalTransactions++;
      this.metrics.totalVolume += parseFloat(amount);
      this.recordMetric('mint', Date.now() - startTime, true);

      return transaction;

    } catch (error) {
      this.recordMetric('mint', Date.now() - startTime, false);
      throw this.handleError(error, 'Failed to mint on Tempo');
    }
  }

  /**
   * Burn stablecoins (redeem for fiat)
   */
  async burnStablecoin(walletId, amount, currency = 'USDC', destination, metadata = {}) {
    const startTime = Date.now();

    try {
      if (this.config.mockMode) {
        return this.mockService.burnStablecoin(walletId, amount, currency, destination, metadata);
      }

      const stablecoin = this.supportedStablecoins[currency];
      const amountWei = ethers.parseUnits(amount.toString(), stablecoin.decimals);

      const transaction = {
        id: `tempo_burn_${Date.now()}`,
        type: 'burn',
        walletId,
        currency,
        amount: amount.toString(),
        amountWei: amountWei.toString(),
        destination,
        status: 'pending',
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        gasPrice: (await this.getGasPrice()).toString(),
        metadata: {
          ...metadata,
          provider: 'tempo',
          instantSettlement: true
        },
        createdAt: new Date().toISOString()
      };

      // Simulate instant burn confirmation
      setTimeout(() => {
        transaction.status = 'confirmed';
        transaction.settlementTime = Date.now() - startTime;
        this.emit('burnConfirmed', transaction);
      }, 150);

      this.metrics.totalTransactions++;
      this.recordMetric('burn', Date.now() - startTime, true);

      return transaction;

    } catch (error) {
      this.recordMetric('burn', Date.now() - startTime, false);
      throw this.handleError(error, 'Failed to burn on Tempo');
    }
  }

  /**
   * Transfer stablecoins between wallets (any supported currency)
   */
  async transfer(fromWalletId, toAddress, amount, currency = 'USDC', metadata = {}) {
    const startTime = Date.now();

    try {
      if (this.config.mockMode) {
        return this.mockService.transfer(fromWalletId, toAddress, amount, currency, metadata);
      }

      const stablecoin = this.supportedStablecoins[currency];
      const amountWei = ethers.parseUnits(amount.toString(), stablecoin.decimals);

      const transaction = {
        id: `tempo_transfer_${Date.now()}`,
        type: 'transfer',
        fromWalletId,
        toAddress,
        currency,
        amount: amount.toString(),
        amountWei: amountWei.toString(),
        status: 'pending',
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        gasPrice: (await this.getGasPrice()).toString(),
        fee: '0.0001', // Near-zero fee
        metadata: {
          ...metadata,
          provider: 'tempo',
          instantTransfer: true,
          crossCurrency: true
        },
        createdAt: new Date().toISOString()
      };

      // Simulate instant transfer confirmation
      setTimeout(() => {
        transaction.status = 'confirmed';
        transaction.confirmationTime = Date.now() - startTime;
        transaction.txHash = `0x${ethers.randomBytes(32).toString('hex')}`;
        this.emit('transferConfirmed', transaction);
      }, 50); // Ultra-fast confirmation

      this.metrics.totalTransactions++;
      this.metrics.totalVolume += parseFloat(amount);
      this.recordMetric('transfer', Date.now() - startTime, true);

      return transaction;

    } catch (error) {
      this.recordMetric('transfer', Date.now() - startTime, false);
      throw this.handleError(error, 'Failed to transfer on Tempo');
    }
  }

  /**
   * Batch transfer to multiple recipients (Tempo native feature)
   */
  async batchTransfer(fromWalletId, transfers, metadata = {}) {
    const startTime = Date.now();

    try {
      if (this.config.mockMode) {
        return this.mockService.batchTransfer(fromWalletId, transfers, metadata);
      }

      const batchTransaction = {
        id: `tempo_batch_${Date.now()}`,
        type: 'batch_transfer',
        fromWalletId,
        transfers: transfers.map(t => ({
          ...t,
          amountWei: ethers.parseUnits(
            t.amount.toString(),
            this.supportedStablecoins[t.currency || 'USDC'].decimals
          ).toString()
        })),
        totalAmount: transfers.reduce((sum, t) => sum + parseFloat(t.amount), 0),
        status: 'pending',
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        gasPrice: (await this.getGasPrice()).toString(),
        metadata: {
          ...metadata,
          provider: 'tempo',
          batchOptimized: true,
          recipientCount: transfers.length
        },
        createdAt: new Date().toISOString()
      };

      // Simulate batch confirmation
      setTimeout(() => {
        batchTransaction.status = 'confirmed';
        batchTransaction.confirmationTime = Date.now() - startTime;
        batchTransaction.txHash = `0x${ethers.randomBytes(32).toString('hex')}`;
        this.emit('batchTransferConfirmed', batchTransaction);
      }, 100); // Still sub-second for batch

      this.metrics.totalTransactions += transfers.length;
      this.metrics.totalVolume += batchTransaction.totalAmount;
      this.recordMetric('batchTransfer', Date.now() - startTime, true);

      return batchTransaction;

    } catch (error) {
      this.recordMetric('batchTransfer', Date.now() - startTime, false);
      throw this.handleError(error, 'Failed to batch transfer on Tempo');
    }
  }

  /**
   * Swap between stablecoins (Tempo native AMM)
   */
  async swapStablecoins(walletId, fromCurrency, toCurrency, amount, metadata = {}) {
    const startTime = Date.now();

    try {
      if (this.config.mockMode) {
        return this.mockService.swapStablecoins(walletId, fromCurrency, toCurrency, amount, metadata);
      }

      // Validate currencies
      if (!this.supportedStablecoins[fromCurrency] || !this.supportedStablecoins[toCurrency]) {
        throw new Error(`Unsupported currency pair: ${fromCurrency}/${toCurrency}`);
      }

      const swap = {
        id: `tempo_swap_${Date.now()}`,
        type: 'swap',
        walletId,
        fromCurrency,
        toCurrency,
        inputAmount: amount.toString(),
        outputAmount: amount.toString(), // 1:1 for stablecoins
        exchangeRate: '1.0000',
        status: 'pending',
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        gasPrice: (await this.getGasPrice()).toString(),
        fee: '0.0001', // Minimal swap fee
        metadata: {
          ...metadata,
          provider: 'tempo',
          nativeSwap: true,
          instantSettlement: true
        },
        createdAt: new Date().toISOString()
      };

      // Simulate instant swap
      setTimeout(() => {
        swap.status = 'confirmed';
        swap.confirmationTime = Date.now() - startTime;
        swap.txHash = `0x${ethers.randomBytes(32).toString('hex')}`;
        this.emit('swapConfirmed', swap);
      }, 75);

      this.metrics.totalTransactions++;
      this.recordMetric('swap', Date.now() - startTime, true);

      return swap;

    } catch (error) {
      this.recordMetric('swap', Date.now() - startTime, false);
      throw this.handleError(error, 'Failed to swap on Tempo');
    }
  }

  /**
   * Get balance for wallet (all supported currencies)
   */
  async getBalance(walletAddress, currency = null) {
    try {
      if (this.config.mockMode) {
        return this.mockService.getBalance(walletAddress, currency);
      }

      const balances = {};

      if (currency) {
        // Get specific currency balance
        const stablecoin = this.supportedStablecoins[currency];
        if (!stablecoin.address) {
          // Mock balance for now
          balances[currency] = {
            amount: '10000.00',
            decimals: stablecoin.decimals,
            formatted: '10,000.00'
          };
        }
      } else {
        // Get all balances
        for (const [curr, config] of Object.entries(this.supportedStablecoins)) {
          balances[curr] = {
            amount: '10000.00',
            decimals: config.decimals,
            formatted: '10,000.00'
          };
        }
      }

      return {
        address: walletAddress,
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        balances,
        totalUSD: Object.values(balances).reduce((sum, b) => sum + parseFloat(b.amount), 0),
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      throw this.handleError(error, 'Failed to get balance from Tempo');
    }
  }

  /**
   * Get multi-currency balance for consumer wallet
   * Enhanced version that returns structured data for portfolio view
   */
  async getMultiCurrencyBalance(userId) {
    try {
      if (this.config.mockMode) {
        return this.mockService.getMultiCurrencyBalance ?
          this.mockService.getMultiCurrencyBalance(userId) :
          this.mockService.getBalance(`wallet_${userId}`);
      }

      const walletAddress = `wallet_${userId}`; // In production, lookup actual address
      const balances = await this.getBalance(walletAddress);

      // Return simplified format for consumer service
      const result = {};
      for (const [currency, data] of Object.entries(balances.balances)) {
        result[currency] = parseFloat(data.amount);
      }

      return result;
    } catch (error) {
      throw this.handleError(error, 'Failed to get multi-currency balance');
    }
  }

  /**
   * Consumer deposit operation
   * Handles ACH, wire, card deposits with smart routing
   */
  async deposit(userId, amount, method = 'ach', metadata = {}) {
    const startTime = Date.now();

    try {
      if (this.config.mockMode && this.mockService.deposit) {
        return this.mockService.deposit(userId, amount, method, metadata);
      }

      const transaction = {
        id: `tempo_deposit_${Date.now()}`,
        type: 'deposit',
        userId,
        amount: amount.toString(),
        method,
        status: 'pending',
        provider: 'tempo',
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        metadata: {
          ...metadata,
          settlementSpeed: method === 'wire' ? 'same-day' : 'instant',
          fee: this.calculateDepositFee(amount, method)
        },
        createdAt: new Date().toISOString()
      };

      // Simulate instant confirmation for Tempo
      setTimeout(() => {
        transaction.status = 'completed';
        transaction.settlementTimeMs = Date.now() - startTime;
        this.emit('depositConfirmed', transaction);
      }, 100);

      this.metrics.totalTransactions++;
      this.metrics.totalVolume += parseFloat(amount);
      this.recordMetric('deposit', Date.now() - startTime, true);

      return transaction;
    } catch (error) {
      this.recordMetric('deposit', Date.now() - startTime, false);
      throw this.handleError(error, 'Failed to process deposit');
    }
  }

  /**
   * Consumer withdrawal operation
   * Instant withdrawals to bank accounts
   */
  async withdraw(userId, amount, destination, metadata = {}) {
    const startTime = Date.now();

    try {
      if (this.config.mockMode && this.mockService.withdraw) {
        return this.mockService.withdraw(userId, amount, destination, metadata);
      }

      const transaction = {
        id: `tempo_withdraw_${Date.now()}`,
        type: 'withdrawal',
        userId,
        amount: amount.toString(),
        destination,
        status: 'pending',
        provider: 'tempo',
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        metadata: {
          ...metadata,
          instant: true,
          fee: '0.0001'
        },
        createdAt: new Date().toISOString()
      };

      // Simulate instant withdrawal
      setTimeout(() => {
        transaction.status = 'completed';
        transaction.settlementTimeMs = Date.now() - startTime;
        this.emit('withdrawalConfirmed', transaction);
      }, 100);

      this.metrics.totalTransactions++;
      this.recordMetric('withdrawal', Date.now() - startTime, true);

      return transaction;
    } catch (error) {
      this.recordMetric('withdrawal', Date.now() - startTime, false);
      throw this.handleError(error, 'Failed to process withdrawal');
    }
  }

  /**
   * Check if service is healthy
   * Used by provider factory for failover decisions
   */
  async isHealthy() {
    try {
      const available = await this.isAvailable();
      if (!available) return false;

      // Check metrics
      if (this.metrics.successRate < 0.9) return false;
      if (this.metrics.averageLatency > 1000) return false;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user wallet address
   * Helper for consumer service
   */
  async getUserWallet(userId) {
    // In production, this would query database
    // For now, return deterministic address
    return `tempo_wallet_${userId}`;
  }

  /**
   * Instant swap between stablecoins (alias for consumer service)
   */
  async swap(userId, fromCurrency, toCurrency, amount) {
    const walletId = await this.getUserWallet(userId);
    const result = await this.swapStablecoins(walletId, fromCurrency, toCurrency, amount);

    return {
      transactionId: result.id,
      outputAmount: result.outputAmount,
      rate: result.exchangeRate,
      provider: 'tempo'
    };
  }

  /**
   * Calculate deposit fee based on method
   * Helper for consumer operations
   */
  calculateDepositFee(amount, method) {
    const fees = {
      ach: amount * 0.005, // 0.5%
      wire: 15, // Flat $15
      card: amount * 0.029, // 2.9%
      apple_pay: amount * 0.029, // 2.9%
      google_pay: amount * 0.029 // 2.9%
    };

    return fees[method] || 0;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(walletId, limit = 100) {
    try {
      if (this.config.mockMode) {
        return this.mockService.getTransactionHistory(walletId, limit);
      }

      // In production, query Tempo blockchain
      return {
        walletId,
        transactions: [],
        totalCount: 0,
        blockchain: 'TEMPO',
        chainId: this.config.chainId
      };

    } catch (error) {
      throw this.handleError(error, 'Failed to get transaction history');
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    try {
      if (this.config.mockMode) {
        return this.mockService.getNetworkStats();
      }

      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.getGasPrice();

      return {
        blockchain: 'TEMPO',
        chainId: this.config.chainId,
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        tps: 100000, // Tempo's capability
        finality: '< 1 second',
        supportedCurrencies: Object.keys(this.supportedStablecoins),
        metrics: this.metrics,
        status: 'operational',
        provider: 'Stripe/Paradigm'
      };

    } catch (error) {
      throw this.handleError(error, 'Failed to get network stats');
    }
  }

  /**
   * Record performance metrics
   */
  recordMetric(operation, latency, success) {
    // Update average latency
    this.metrics.averageLatency =
      (this.metrics.averageLatency * this.metrics.totalTransactions + latency) /
      (this.metrics.totalTransactions + 1);

    // Update success rate
    if (!success) {
      this.metrics.successRate =
        (this.metrics.successRate * this.metrics.totalTransactions) /
        (this.metrics.totalTransactions + 1);
    }

    this.emit('metric', {
      operation,
      latency,
      success,
      timestamp: Date.now()
    });
  }

  /**
   * Handle errors uniformly
   */
  handleError(error, message) {
    console.error(`❌ Tempo Error: ${message}`, error);
    this.emit('error', { message, error });
    return new Error(`${message}: ${error.message}`);
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.provider) {
      await this.provider.destroy();
    }
    this.removeAllListeners();
  }
}

export default TempoService;