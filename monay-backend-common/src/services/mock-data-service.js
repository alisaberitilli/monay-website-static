import { faker } from '@faker-js/faker';

// Simple logger fallback
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args)
};

class MockDataService {
  constructor() {
    this.circleWallets = [];
    this.tempoWallets = [];
    this.transactions = [];
    this.initializeMockData();
  }

  initializeMockData() {
    // Generate Circle wallets
    for (let i = 0; i < 50; i++) {
      this.circleWallets.push({
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        userEmail: faker.internet.email(),
        walletId: `circle_${faker.string.alphanumeric(16)}`,
        address: `0x${faker.string.alphanumeric(40)}`,
        balance: faker.number.float({ min: 0, max: 100000, precision: 2 }),
        status: faker.helpers.arrayElement(['active', 'frozen', 'pending']),
        provider: 'circle',
        createdAt: faker.date.past(),
        lastActivity: faker.date.recent(),
        metadata: {
          kycVerified: faker.datatype.boolean(),
          riskScore: faker.number.int({ min: 0, max: 100 }),
          country: faker.location.countryCode()
        }
      });
    }

    // Generate Tempo wallets
    for (let i = 0; i < 75; i++) {
      this.tempoWallets.push({
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        userEmail: faker.internet.email(),
        walletId: `tempo_${faker.string.alphanumeric(16)}`,
        address: `tempo${faker.string.alphanumeric(32)}`,
        balance: faker.number.float({ min: 0, max: 500000, precision: 2 }),
        status: 'active', // Tempo wallets are always active in mock
        provider: 'tempo',
        createdAt: faker.date.past(),
        lastActivity: faker.date.recent(),
        supportedCurrencies: ['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB'],
        metadata: {
          tps: faker.number.int({ min: 80000, max: 120000 }),
          latency: faker.number.int({ min: 85, max: 115 }),
          batchCapable: true
        }
      });
    }

    // Generate transactions
    for (let i = 0; i < 200; i++) {
      const provider = faker.helpers.arrayElement(['circle', 'tempo']);
      const status = faker.helpers.arrayElement(['completed', 'pending', 'failed']);

      this.transactions.push({
        id: faker.string.uuid(),
        transactionId: `tx_${faker.string.alphanumeric(24)}`,
        provider,
        from: faker.helpers.arrayElement([...this.circleWallets, ...this.tempoWallets]).address,
        to: faker.helpers.arrayElement([...this.circleWallets, ...this.tempoWallets]).address,
        amount: faker.number.float({ min: 10, max: 50000, precision: 2 }),
        currency: faker.helpers.arrayElement(['USDC', 'USDT', 'PYUSD']),
        status,
        fee: provider === 'tempo' ? 0.0001 : 0.05,
        confirmationTime: provider === 'tempo'
          ? faker.number.int({ min: 85, max: 135 })
          : faker.number.int({ min: 3000, max: 5000 }),
        createdAt: faker.date.recent(7),
        completedAt: status === 'completed' ? faker.date.recent() : null,
        errorMessage: status === 'failed'
          ? faker.helpers.arrayElement([
              'Insufficient funds',
              'KYC verification required',
              'Transaction limit exceeded',
              'Network congestion',
              'Invalid recipient address'
            ])
          : null,
        metadata: {
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          deviceId: faker.string.uuid()
        }
      });
    }

    logger.info(`Mock data initialized: ${this.circleWallets.length} Circle wallets, ${this.tempoWallets.length} Tempo wallets, ${this.transactions.length} transactions`);
  }

  // Circle mock methods
  getCircleWallets(filters = {}) {
    let wallets = [...this.circleWallets];

    if (filters.status) {
      wallets = wallets.filter(w => w.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      wallets = wallets.filter(w =>
        w.userEmail.toLowerCase().includes(searchLower) ||
        w.walletId.toLowerCase().includes(searchLower)
      );
    }

    // Simulate pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paginatedWallets = wallets.slice(start, start + limit);

    return {
      wallets: paginatedWallets,
      total: wallets.length,
      page,
      totalPages: Math.ceil(wallets.length / limit)
    };
  }

  getCircleMetrics() {
    const activeWallets = this.circleWallets.filter(w => w.status === 'active');
    const totalSupply = activeWallets.reduce((sum, w) => sum + w.balance, 0);
    const recentTransactions = this.transactions.filter(t =>
      t.provider === 'circle' &&
      t.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const dailyVolume = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingOps = this.transactions.filter(t =>
      t.provider === 'circle' && t.status === 'pending'
    ).length;
    const failedTransactions = this.transactions.filter(t =>
      t.provider === 'circle' && t.status === 'failed'
    ).slice(0, 10);

    return {
      totalSupply: Math.round(totalSupply),
      walletCount: activeWallets.length,
      dailyVolume: Math.round(dailyVolume),
      pendingOperations: pendingOps,
      failedTransactions: failedTransactions.map(t => ({
        id: t.transactionId,
        userEmail: faker.internet.email(),
        amount: t.amount,
        error: t.errorMessage,
        createdAt: t.createdAt
      })),
      performance: {
        tps: faker.number.int({ min: 800, max: 1200 }),
        avgLatency: faker.number.int({ min: 3500, max: 4500 }),
        uptime: 99.95
      }
    };
  }

  freezeCircleWallet(walletId) {
    const wallet = this.circleWallets.find(w => w.walletId === walletId);
    if (wallet) {
      wallet.status = 'frozen';
      wallet.frozenAt = new Date();
      return { success: true, wallet };
    }
    return { success: false, error: 'Wallet not found' };
  }

  unfreezeCircleWallet(walletId) {
    const wallet = this.circleWallets.find(w => w.walletId === walletId);
    if (wallet) {
      wallet.status = 'active';
      delete wallet.frozenAt;
      return { success: true, wallet };
    }
    return { success: false, error: 'Wallet not found' };
  }

  // Tempo mock methods
  getTempoStatus() {
    return {
      status: 'operational',
      network: 'mainnet',
      version: '2.1.0',
      capabilities: {
        maxTps: 150000,
        currentTps: faker.number.int({ min: 85000, max: 115000 }),
        avgFinality: faker.number.int({ min: 95, max: 105 }),
        supportedCurrencies: ['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB'],
        features: {
          batchTransfers: true,
          nativeSwaps: true,
          privacyFeatures: true,
          multiSignature: true,
          smartRouting: true,
          atomicSwaps: true,
          crossChainBridge: true
        }
      },
      metrics: {
        tps: faker.number.int({ min: 95000, max: 105000 }),
        finality: faker.number.int({ min: 95, max: 105 }),
        avgFee: 0.0001,
        networkLoad: faker.number.int({ min: 25, max: 45 }),
        successRate: faker.number.float({ min: 99.95, max: 99.99, precision: 2 }),
        nodeCount: 42,
        validatorCount: 21
      },
      lastUpdate: new Date()
    };
  }

  getTempoWallets(filters = {}) {
    let wallets = [...this.tempoWallets];

    // Simulate pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paginatedWallets = wallets.slice(start, start + limit);

    return {
      wallets: paginatedWallets,
      total: wallets.length,
      page,
      totalPages: Math.ceil(wallets.length / limit)
    };
  }

  getTempoTransactions(filters = {}) {
    let transactions = this.transactions.filter(t => t.provider === 'tempo');

    if (filters.status) {
      transactions = transactions.filter(t => t.status === filters.status);
    }

    if (filters.currency) {
      transactions = transactions.filter(t => t.currency === filters.currency);
    }

    // Sort by most recent
    transactions.sort((a, b) => b.createdAt - a.createdAt);

    // Simulate pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(start, start + limit);

    return {
      transactions: paginatedTransactions,
      total: transactions.length,
      page,
      totalPages: Math.ceil(transactions.length / limit)
    };
  }

  getTempoMetrics() {
    const activeWallets = this.tempoWallets.length;
    const recentTransactions = this.transactions.filter(t =>
      t.provider === 'tempo' &&
      t.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const totalVolume = recentTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalVolume: Math.round(totalVolume),
      activeWallets,
      tps: faker.number.int({ min: 95000, max: 105000 }),
      finality: faker.number.int({ min: 95, max: 105 }),
      avgFee: 0.0001,
      networkLoad: faker.number.int({ min: 30, max: 40 }),
      successRate: faker.number.float({ min: 99.96, max: 99.99, precision: 2 }),
      volumeByHour: this.generateHourlyVolume(),
      volumeByCurrency: this.generateCurrencyVolume()
    };
  }

  processTempoBatch(transactions) {
    const results = transactions.map(tx => ({
      ...tx,
      id: faker.string.uuid(),
      status: faker.helpers.arrayElement(['completed', 'completed', 'completed', 'failed']),
      confirmationTime: faker.number.int({ min: 85, max: 115 }),
      fee: 0.0001,
      processedAt: new Date()
    }));

    // Add to transaction history
    results.forEach(tx => {
      if (tx.status === 'completed') {
        this.transactions.push({
          ...tx,
          provider: 'tempo',
          createdAt: new Date()
        });
      }
    });

    return {
      success: true,
      processed: results.length,
      successful: results.filter(r => r.status === 'completed').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    };
  }

  // Provider comparison
  getProviderComparison() {
    const circleMetrics = this.getCircleMetrics();
    const tempoMetrics = this.getTempoMetrics();

    return {
      tempo: {
        metrics: {
          tps: tempoMetrics.tps,
          finality: tempoMetrics.finality,
          fee: tempoMetrics.avgFee,
          uptime: 99.99
        },
        volume24h: tempoMetrics.totalVolume,
        activeWallets: tempoMetrics.activeWallets,
        advantages: [
          '100x faster transactions',
          '40x faster finality',
          '500x lower fees',
          'Native batch processing',
          'Privacy features'
        ]
      },
      circle: {
        metrics: {
          tps: circleMetrics.performance.tps,
          finality: circleMetrics.performance.avgLatency,
          fee: 0.05,
          uptime: circleMetrics.performance.uptime
        },
        volume24h: circleMetrics.dailyVolume,
        activeWallets: circleMetrics.walletCount,
        advantages: [
          'Established infrastructure',
          'Wide adoption',
          'Regulatory compliance',
          'Deep liquidity',
          'Bank integrations'
        ]
      },
      recommendation: {
        primary: 'tempo',
        reason: 'Superior performance and cost efficiency',
        switchThreshold: {
          tps: 50000,
          failureRate: 0.1
        }
      },
      timestamp: new Date()
    };
  }

  // Helper methods
  generateHourlyVolume() {
    const hours = [];
    for (let i = 23; i >= 0; i--) {
      hours.push({
        hour: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        volume: faker.number.float({ min: 50000, max: 250000, precision: 2 }),
        transactions: faker.number.int({ min: 1000, max: 5000 })
      });
    }
    return hours;
  }

  generateCurrencyVolume() {
    return {
      USDC: faker.number.float({ min: 1000000, max: 2000000, precision: 2 }),
      USDT: faker.number.float({ min: 800000, max: 1500000, precision: 2 }),
      PYUSD: faker.number.float({ min: 200000, max: 400000, precision: 2 }),
      EURC: faker.number.float({ min: 100000, max: 200000, precision: 2 }),
      USDB: faker.number.float({ min: 50000, max: 100000, precision: 2 })
    };
  }

  // Real-time simulation
  simulateRealTimeUpdates() {
    // Add new transactions periodically
    setInterval(() => {
      const provider = faker.helpers.arrayElement(['circle', 'tempo']);
      const newTransaction = {
        id: faker.string.uuid(),
        transactionId: `tx_${faker.string.alphanumeric(24)}`,
        provider,
        from: faker.helpers.arrayElement([...this.circleWallets, ...this.tempoWallets]).address,
        to: faker.helpers.arrayElement([...this.circleWallets, ...this.tempoWallets]).address,
        amount: faker.number.float({ min: 10, max: 5000, precision: 2 }),
        currency: faker.helpers.arrayElement(['USDC', 'USDT', 'PYUSD']),
        status: 'pending',
        fee: provider === 'tempo' ? 0.0001 : 0.05,
        createdAt: new Date()
      };

      this.transactions.unshift(newTransaction);

      // Complete transaction after delay
      setTimeout(() => {
        newTransaction.status = faker.helpers.arrayElement(['completed', 'completed', 'completed', 'failed']);
        newTransaction.completedAt = new Date();
        newTransaction.confirmationTime = provider === 'tempo'
          ? faker.number.int({ min: 85, max: 135 })
          : faker.number.int({ min: 3000, max: 5000 });
      }, faker.number.int({ min: 1000, max: 5000 }));

      // Keep transactions array manageable
      if (this.transactions.length > 500) {
        this.transactions = this.transactions.slice(0, 500);
      }
    }, faker.number.int({ min: 2000, max: 8000 }));

    // Update wallet balances
    setInterval(() => {
      [...this.circleWallets, ...this.tempoWallets].forEach(wallet => {
        if (Math.random() > 0.7) {
          const change = faker.number.float({ min: -1000, max: 1000, precision: 2 });
          wallet.balance = Math.max(0, wallet.balance + change);
          wallet.lastActivity = new Date();
        }
      });
    }, 10000);

    logger.info('Real-time simulation started');
  }

  // Analytics data
  getAnalyticsData(startDate, endDate) {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const analytics = {
      revenue: [],
      transactions: [],
      users: [],
      providers: {
        tempo: [],
        circle: []
      }
    };

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);

      analytics.revenue.push({
        date: date.toISOString().split('T')[0],
        amount: faker.number.float({ min: 5000, max: 25000, precision: 2 }),
        fees: faker.number.float({ min: 100, max: 500, precision: 2 })
      });

      analytics.transactions.push({
        date: date.toISOString().split('T')[0],
        count: faker.number.int({ min: 5000, max: 15000 }),
        volume: faker.number.float({ min: 500000, max: 2000000, precision: 2 })
      });

      analytics.users.push({
        date: date.toISOString().split('T')[0],
        new: faker.number.int({ min: 50, max: 200 }),
        active: faker.number.int({ min: 5000, max: 8000 })
      });

      analytics.providers.tempo.push({
        date: date.toISOString().split('T')[0],
        volume: faker.number.float({ min: 300000, max: 1500000, precision: 2 }),
        transactions: faker.number.int({ min: 3000, max: 10000 }),
        avgTps: faker.number.int({ min: 85000, max: 105000 })
      });

      analytics.providers.circle.push({
        date: date.toISOString().split('T')[0],
        volume: faker.number.float({ min: 200000, max: 500000, precision: 2 }),
        transactions: faker.number.int({ min: 2000, max: 5000 }),
        avgTps: faker.number.int({ min: 800, max: 1200 })
      });
    }

    return analytics;
  }
}

// Singleton instance
const mockDataService = new MockDataService();
mockDataService.simulateRealTimeUpdates();

export default mockDataService;