/**
 * Tempo Mock Service
 * Simulates Tempo blockchain operations for development and testing
 * Mimics 100,000+ TPS performance characteristics
 */

import crypto from 'crypto';
import { ethers } from 'ethers';

class TempoMockService {
  constructor() {
    // In-memory storage for mock data
    this.wallets = new Map();
    this.transactions = [];
    this.balances = new Map();
    this.swaps = [];

    // Performance simulation
    this.simulatedTPS = 100000;
    this.simulatedLatency = { min: 10, max: 100 }; // milliseconds

    // Supported stablecoins
    this.supportedStablecoins = ['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB'];

    console.log('🎭 Tempo Mock Service initialized (100,000+ TPS simulation)');
  }

  /**
   * Simulate network latency
   */
  async simulateLatency() {
    const latency = Math.random() *
      (this.simulatedLatency.max - this.simulatedLatency.min) +
      this.simulatedLatency.min;

    return new Promise(resolve => setTimeout(resolve, latency));
  }

  /**
   * Create mock wallet
   */
  async createWallet(userId, metadata = {}) {
    await this.simulateLatency();

    const wallet = ethers.Wallet.createRandom();
    const walletData = {
      id: `tempo_mock_wallet_${userId}`,
      userId,
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey, // Only in mock!
      blockchain: 'TEMPO',
      chainId: 80085, // Tempo testnet
      createdAt: new Date().toISOString(),
      metadata: {
        ...metadata,
        mock: true,
        provider: 'tempo',
        performance: '100,000+ TPS (simulated)'
      }
    };

    this.wallets.set(walletData.id, walletData);

    // Initialize balances for all supported currencies
    const balanceKey = `${walletData.address}`;
    this.balances.set(balanceKey, {
      USDC: 10000,
      USDT: 10000,
      PYUSD: 5000,
      EURC: 5000,
      USDB: 1000
    });

    console.log(`✅ Mock Tempo wallet created: ${walletData.address}`);
    return walletData;
  }

  /**
   * Mock mint stablecoins
   */
  async mintStablecoin(walletId, amount, currency = 'USDC', metadata = {}) {
    await this.simulateLatency();

    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    if (!this.supportedStablecoins.includes(currency)) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    // Update balance
    const balanceKey = wallet.address;
    const balances = this.balances.get(balanceKey) || {};
    balances[currency] = (balances[currency] || 0) + parseFloat(amount);
    this.balances.set(balanceKey, balances);

    const transaction = {
      id: `tempo_mock_mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'mint',
      walletId,
      walletAddress: wallet.address,
      currency,
      amount: amount.toString(),
      status: 'confirmed',
      blockchain: 'TEMPO',
      chainId: 80085,
      blockNumber: Math.floor(Math.random() * 1000000),
      txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
      gasUsed: '21000',
      gasPrice: '0.0001 gwei',
      fee: '0.0001',
      confirmationTime: Math.random() * 100, // Sub-second
      metadata: {
        ...metadata,
        mock: true,
        instantMint: true,
        provider: 'tempo'
      },
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString()
    };

    this.transactions.push(transaction);
    console.log(`💰 Mock minted ${amount} ${currency} on Tempo`);

    return transaction;
  }

  /**
   * Mock burn stablecoins
   */
  async burnStablecoin(walletId, amount, currency = 'USDC', destination, metadata = {}) {
    await this.simulateLatency();

    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    // Check balance
    const balanceKey = wallet.address;
    const balances = this.balances.get(balanceKey) || {};

    if (!balances[currency] || balances[currency] < parseFloat(amount)) {
      throw new Error(`Insufficient ${currency} balance`);
    }

    // Update balance
    balances[currency] -= parseFloat(amount);
    this.balances.set(balanceKey, balances);

    const transaction = {
      id: `tempo_mock_burn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'burn',
      walletId,
      walletAddress: wallet.address,
      currency,
      amount: amount.toString(),
      destination,
      status: 'confirmed',
      blockchain: 'TEMPO',
      chainId: 80085,
      blockNumber: Math.floor(Math.random() * 1000000),
      txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
      gasUsed: '25000',
      gasPrice: '0.0001 gwei',
      fee: '0.0001',
      settlementTime: Math.random() * 150, // Near-instant settlement
      metadata: {
        ...metadata,
        mock: true,
        instantBurn: true,
        provider: 'tempo'
      },
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString()
    };

    this.transactions.push(transaction);
    console.log(`🔥 Mock burned ${amount} ${currency} on Tempo`);

    return transaction;
  }

  /**
   * Mock transfer
   */
  async transfer(fromWalletId, toAddress, amount, currency = 'USDC', metadata = {}) {
    await this.simulateLatency();

    const wallet = this.wallets.get(fromWalletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${fromWalletId}`);
    }

    // Check balance
    const fromBalanceKey = wallet.address;
    const fromBalances = this.balances.get(fromBalanceKey) || {};

    if (!fromBalances[currency] || fromBalances[currency] < parseFloat(amount)) {
      throw new Error(`Insufficient ${currency} balance`);
    }

    // Update sender balance
    fromBalances[currency] -= parseFloat(amount);
    this.balances.set(fromBalanceKey, fromBalances);

    // Update receiver balance
    const toBalances = this.balances.get(toAddress) || {};
    toBalances[currency] = (toBalances[currency] || 0) + parseFloat(amount);
    this.balances.set(toAddress, toBalances);

    const transaction = {
      id: `tempo_mock_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'transfer',
      fromWalletId,
      fromAddress: wallet.address,
      toAddress,
      currency,
      amount: amount.toString(),
      status: 'confirmed',
      blockchain: 'TEMPO',
      chainId: 80085,
      blockNumber: Math.floor(Math.random() * 1000000),
      txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
      gasUsed: '21000',
      gasPrice: '0.0001 gwei',
      fee: '0.0001',
      confirmationTime: Math.random() * 50, // Ultra-fast
      metadata: {
        ...metadata,
        mock: true,
        instantTransfer: true,
        provider: 'tempo'
      },
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString()
    };

    this.transactions.push(transaction);
    console.log(`📤 Mock transferred ${amount} ${currency} on Tempo`);

    return transaction;
  }

  /**
   * Mock batch transfer
   */
  async batchTransfer(fromWalletId, transfers, metadata = {}) {
    await this.simulateLatency();

    const wallet = this.wallets.get(fromWalletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${fromWalletId}`);
    }

    // Check total amounts needed per currency
    const totalNeeded = {};
    for (const transfer of transfers) {
      const currency = transfer.currency || 'USDC';
      totalNeeded[currency] = (totalNeeded[currency] || 0) + parseFloat(transfer.amount);
    }

    // Check balances
    const fromBalances = this.balances.get(wallet.address) || {};
    for (const [currency, needed] of Object.entries(totalNeeded)) {
      if (!fromBalances[currency] || fromBalances[currency] < needed) {
        throw new Error(`Insufficient ${currency} balance for batch transfer`);
      }
    }

    // Process transfers
    const processedTransfers = [];
    for (const transfer of transfers) {
      const currency = transfer.currency || 'USDC';

      // Update sender balance
      fromBalances[currency] -= parseFloat(transfer.amount);

      // Update receiver balance
      const toBalances = this.balances.get(transfer.toAddress) || {};
      toBalances[currency] = (toBalances[currency] || 0) + parseFloat(transfer.amount);
      this.balances.set(transfer.toAddress, toBalances);

      processedTransfers.push({
        ...transfer,
        status: 'confirmed',
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`
      });
    }

    // Update sender's final balance
    this.balances.set(wallet.address, fromBalances);

    const batchTransaction = {
      id: `tempo_mock_batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'batch_transfer',
      fromWalletId,
      fromAddress: wallet.address,
      transfers: processedTransfers,
      totalTransfers: transfers.length,
      status: 'confirmed',
      blockchain: 'TEMPO',
      chainId: 80085,
      blockNumber: Math.floor(Math.random() * 1000000),
      txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
      gasUsed: (21000 * transfers.length).toString(),
      gasPrice: '0.0001 gwei',
      fee: (0.0001 * transfers.length).toString(),
      confirmationTime: Math.random() * 100, // Still sub-second for batch
      metadata: {
        ...metadata,
        mock: true,
        batchOptimized: true,
        provider: 'tempo'
      },
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString()
    };

    this.transactions.push(batchTransaction);
    console.log(`📦 Mock batch transferred ${transfers.length} transactions on Tempo`);

    return batchTransaction;
  }

  /**
   * Mock swap between stablecoins
   */
  async swapStablecoins(walletId, fromCurrency, toCurrency, amount, metadata = {}) {
    await this.simulateLatency();

    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    // Check balance
    const balances = this.balances.get(wallet.address) || {};
    if (!balances[fromCurrency] || balances[fromCurrency] < parseFloat(amount)) {
      throw new Error(`Insufficient ${fromCurrency} balance`);
    }

    // Simulate exchange rate (1:1 for stablecoins with small variance)
    const exchangeRate = 1 + (Math.random() - 0.5) * 0.002; // ±0.1% variance
    const outputAmount = parseFloat(amount) * exchangeRate;

    // Update balances
    balances[fromCurrency] -= parseFloat(amount);
    balances[toCurrency] = (balances[toCurrency] || 0) + outputAmount;
    this.balances.set(wallet.address, balances);

    const swap = {
      id: `tempo_mock_swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'swap',
      walletId,
      walletAddress: wallet.address,
      fromCurrency,
      toCurrency,
      inputAmount: amount.toString(),
      outputAmount: outputAmount.toFixed(6),
      exchangeRate: exchangeRate.toFixed(6),
      status: 'confirmed',
      blockchain: 'TEMPO',
      chainId: 80085,
      blockNumber: Math.floor(Math.random() * 1000000),
      txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
      gasUsed: '30000',
      gasPrice: '0.0001 gwei',
      fee: '0.0001',
      confirmationTime: Math.random() * 75, // Near-instant swap
      metadata: {
        ...metadata,
        mock: true,
        nativeSwap: true,
        provider: 'tempo'
      },
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString()
    };

    this.swaps.push(swap);
    this.transactions.push(swap);
    console.log(`🔄 Mock swapped ${amount} ${fromCurrency} to ${outputAmount.toFixed(2)} ${toCurrency} on Tempo`);

    return swap;
  }

  /**
   * Get mock balance
   */
  async getBalance(walletAddress, currency = null) {
    await this.simulateLatency();

    const balances = this.balances.get(walletAddress) || {
      USDC: 0,
      USDT: 0,
      PYUSD: 0,
      EURC: 0,
      USDB: 0
    };

    if (currency) {
      return {
        address: walletAddress,
        blockchain: 'TEMPO',
        chainId: 80085,
        balances: {
          [currency]: {
            amount: balances[currency]?.toFixed(2) || '0.00',
            decimals: 6,
            formatted: balances[currency]?.toLocaleString() || '0.00'
          }
        },
        totalUSD: balances[currency] || 0,
        lastUpdated: new Date().toISOString()
      };
    }

    // Return all balances
    const formattedBalances = {};
    let totalUSD = 0;

    for (const [curr, amount] of Object.entries(balances)) {
      formattedBalances[curr] = {
        amount: amount.toFixed(2),
        decimals: curr === 'USDB' ? 18 : 6,
        formatted: amount.toLocaleString()
      };
      totalUSD += amount;
    }

    return {
      address: walletAddress,
      blockchain: 'TEMPO',
      chainId: 80085,
      balances: formattedBalances,
      totalUSD,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get mock transaction history
   */
  async getTransactionHistory(walletId, limit = 100) {
    await this.simulateLatency();

    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      return {
        walletId,
        transactions: [],
        totalCount: 0,
        blockchain: 'TEMPO',
        chainId: 80085
      };
    }

    // Filter transactions for this wallet
    const walletTransactions = this.transactions.filter(tx =>
      tx.walletId === walletId ||
      tx.fromWalletId === walletId ||
      tx.toAddress === wallet.address ||
      tx.fromAddress === wallet.address
    );

    return {
      walletId,
      address: wallet.address,
      transactions: walletTransactions.slice(-limit).reverse(),
      totalCount: walletTransactions.length,
      blockchain: 'TEMPO',
      chainId: 80085
    };
  }

  /**
   * Get mock network statistics
   */
  async getNetworkStats() {
    await this.simulateLatency();

    // Simulate realistic network stats
    const mockStats = {
      blockchain: 'TEMPO',
      chainId: 80085,
      blockNumber: Math.floor(Math.random() * 10000000),
      gasPrice: '0.0001 gwei',
      tps: Math.floor(Math.random() * 50000) + 50000, // 50k-100k TPS
      currentTps: Math.floor(Math.random() * 10000) + 1000,
      peakTps: 125000,
      finality: `${Math.random() * 500 + 100} ms`, // 100-600ms
      supportedCurrencies: this.supportedStablecoins,
      totalTransactions: this.transactions.length,
      totalWallets: this.wallets.size,
      totalSwaps: this.swaps.length,
      networkUtilization: `${(Math.random() * 30 + 10).toFixed(1)}%`,
      status: 'operational',
      provider: 'Stripe/Paradigm (Mock)',
      features: [
        'Multi-stablecoin support',
        'Native AMM for swaps',
        'Batch transfers',
        'Sub-second finality',
        'Near-zero fees',
        'ISO 20022 compliance',
        'Privacy features'
      ]
    };

    return mockStats;
  }

  /**
   * Clear all mock data
   */
  reset() {
    this.wallets.clear();
    this.transactions = [];
    this.balances.clear();
    this.swaps = [];
    console.log('🔄 Tempo mock service reset');
  }
}

export default TempoMockService;