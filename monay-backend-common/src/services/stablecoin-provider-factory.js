/**
 * Stablecoin Provider Factory
 * Manages multiple stablecoin providers with intelligent routing
 *
 * Provider Hierarchy:
 * 1. PRIMARY: Tempo (100,000+ TPS, multi-stablecoin, near-zero fees)
 * 2. SECONDARY: Circle (USDC-focused, proven reliability)
 * 3. FUTURE: Monay Chain (proprietary blockchain, 2026-2027)
 */

import EventEmitter from 'events';
import circleService from './circle.js';
import TempoService from './tempo.js';

// Provider priorities (lower number = higher priority)
const PROVIDER_PRIORITY = {
  'tempo': 1,    // Primary provider
  'circle': 2,   // Secondary/fallback provider
  'monay': 0     // Future: Highest priority when available
};

// Provider capabilities
const PROVIDER_CAPABILITIES = {
  'tempo': {
    currencies: ['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB'],
    maxTps: 100000,
    avgFee: 0.0001,
    finality: 100, // milliseconds
    features: ['batch_transfer', 'native_swap', 'privacy', 'compliance_hooks']
  },
  'circle': {
    currencies: ['USDC'],
    maxTps: 1000,
    avgFee: 0.05,
    finality: 15000, // milliseconds
    features: ['programmable_wallets', 'account_api']
  },
  'monay': {
    currencies: ['MUSDC', 'USDC', 'USDT', 'PYUSD', 'EURC'], // MUSDC = Monay USD Coin
    maxTps: 200000,
    avgFee: 0.00001,
    finality: 50, // milliseconds
    features: ['all'] // Future: All features
  }
};

class StablecoinProviderFactory extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      primaryProvider: process.env.PRIMARY_PROVIDER || 'tempo',
      fallbackProvider: process.env.FALLBACK_PROVIDER || 'circle',
      autoFailover: process.env.AUTO_FAILOVER !== 'false',
      healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000'),
      ...config
    };

    // Initialize providers
    this.providers = new Map();
    this.providerStatus = new Map();
    this.metrics = new Map();

    // Initialize default providers
    this.initializeProviders();

    // Start health monitoring
    if (this.config.autoFailover) {
      this.startHealthMonitoring();
    }

    console.log(`🏭 Stablecoin Provider Factory initialized`);
    console.log(`   Primary: ${this.config.primaryProvider}`);
    console.log(`   Fallback: ${this.config.fallbackProvider}`);
  }

  /**
   * Initialize stablecoin providers
   */
  initializeProviders() {
    // Initialize Tempo (Primary)
    try {
      const tempoService = new TempoService();
      this.providers.set('tempo', tempoService);
      this.providerStatus.set('tempo', { available: true, lastCheck: Date.now() });
      this.metrics.set('tempo', { calls: 0, failures: 0, totalLatency: 0 });

      // Listen to Tempo events
      tempoService.on('error', (error) => this.handleProviderError('tempo', error));
      tempoService.on('metric', (metric) => this.recordProviderMetric('tempo', metric));

      console.log('✅ Tempo provider initialized (PRIMARY)');
    } catch (error) {
      console.error('❌ Failed to initialize Tempo:', error.message);
      this.providerStatus.set('tempo', { available: false, error: error.message });
    }

    // Initialize Circle (Secondary/Fallback)
    try {
      this.providers.set('circle', circleService);
      this.providerStatus.set('circle', { available: true, lastCheck: Date.now() });
      this.metrics.set('circle', { calls: 0, failures: 0, totalLatency: 0 });

      // Listen to Circle events
      circleService.on('error', (error) => this.handleProviderError('circle', error));
      circleService.on('metric', (metric) => this.recordProviderMetric('circle', metric));

      console.log('✅ Circle provider initialized (FALLBACK)');
    } catch (error) {
      console.error('❌ Failed to initialize Circle:', error.message);
      this.providerStatus.set('circle', { available: false, error: error.message });
    }
  }

  /**
   * Get provider based on routing logic
   */
  async getProvider(options = {}) {
    const {
      currency = 'USDC',
      amount = 0,
      operation = 'transfer',
      preferredProvider = null
    } = options;

    // If preferred provider specified and available, use it
    if (preferredProvider && this.isProviderAvailable(preferredProvider)) {
      const provider = this.providers.get(preferredProvider);
      if (provider && this.providerSupports(preferredProvider, currency)) {
        console.log(`📍 Using preferred provider: ${preferredProvider}`);
        return { provider, providerName: preferredProvider };
      }
    }

    // Route based on strategy
    const route = await this.routeTransaction({
      currency,
      amount,
      operation
    });

    console.log(`🔀 Routed to: ${route.provider} (reason: ${route.reason})`);
    return {
      provider: this.providers.get(route.provider),
      providerName: route.provider,
      reason: route.reason
    };
  }

  /**
   * Intelligent routing logic
   */
  async routeTransaction(params) {
    const { currency, amount, operation } = params;

    // Check Tempo availability (Primary)
    if (await this.isProviderAvailable('tempo')) {
      // Tempo supports all currencies and operations
      if (this.providerSupports('tempo', currency)) {
        return {
          provider: 'tempo',
          reason: 'Primary provider available and supports currency'
        };
      }
    }

    // Fallback to Circle
    if (await this.isProviderAvailable('circle')) {
      // Circle only supports USDC
      if (currency === 'USDC') {
        return {
          provider: 'circle',
          reason: 'Fallback provider for USDC (Tempo unavailable)'
        };
      }
    }

    // If Tempo is down but currency is not USDC, wait for Tempo
    if (currency !== 'USDC') {
      // Try Tempo again with retry
      await this.waitForProvider('tempo', 5000); // Wait 5 seconds
      if (await this.isProviderAvailable('tempo')) {
        return {
          provider: 'tempo',
          reason: 'Primary provider recovered'
        };
      }
    }

    // Last resort: Use any available provider
    for (const [name, status] of this.providerStatus) {
      if (status.available) {
        return {
          provider: name,
          reason: 'Emergency fallback to any available provider'
        };
      }
    }

    throw new Error('No stablecoin providers available');
  }

  /**
   * Check if provider is available
   */
  async isProviderAvailable(providerName) {
    const provider = this.providers.get(providerName);
    if (!provider) return false;

    try {
      // Check provider-specific availability
      if (provider.isAvailable && typeof provider.isAvailable === 'function') {
        const available = await provider.isAvailable();
        this.providerStatus.set(providerName, {
          available,
          lastCheck: Date.now()
        });
        return available;
      }

      // Assume available if no check method
      return true;
    } catch (error) {
      this.providerStatus.set(providerName, {
        available: false,
        error: error.message,
        lastCheck: Date.now()
      });
      return false;
    }
  }

  /**
   * Check if provider supports a currency
   */
  providerSupports(providerName, currency) {
    const capabilities = PROVIDER_CAPABILITIES[providerName];
    if (!capabilities) return false;
    return capabilities.currencies.includes(currency);
  }

  /**
   * Wait for provider to become available
   */
  async waitForProvider(providerName, timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.isProviderAvailable(providerName)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }

  /**
   * Execute operation with automatic fallback
   */
  async executeWithFallback(operation, params, options = {}) {
    const maxRetries = options.maxRetries || 2;
    let lastError = null;
    let attempts = [];

    // Get ordered list of providers to try
    const providersToTry = this.getProviderOrder(options);

    for (const providerName of providersToTry) {
      if (!await this.isProviderAvailable(providerName)) {
        continue;
      }

      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        console.log(`🔄 Attempting ${operation} with ${providerName}...`);

        const startTime = Date.now();
        const result = await provider[operation](...params);
        const latency = Date.now() - startTime;

        // Record success metrics
        this.recordProviderMetric(providerName, {
          operation,
          latency,
          success: true
        });

        // Add provider info to result
        result.provider = providerName;
        result.latency = latency;

        console.log(`✅ ${operation} succeeded with ${providerName} (${latency}ms)`);

        this.emit('operationSuccess', {
          operation,
          provider: providerName,
          latency,
          result
        });

        return result;

      } catch (error) {
        lastError = error;

        // Record failure metrics
        this.recordProviderMetric(providerName, {
          operation,
          success: false,
          error: error.message
        });

        attempts.push({
          provider: providerName,
          error: error.message,
          timestamp: Date.now()
        });

        console.error(`❌ ${operation} failed with ${providerName}:`, error.message);

        // Mark provider as potentially unavailable
        if (this.shouldMarkUnavailable(error)) {
          this.providerStatus.set(providerName, {
            available: false,
            error: error.message,
            lastCheck: Date.now()
          });
        }
      }
    }

    // All providers failed
    this.emit('operationFailed', {
      operation,
      attempts,
      lastError
    });

    throw new Error(
      `Operation ${operation} failed on all providers. Last error: ${lastError?.message}`
    );
  }

  /**
   * Get ordered list of providers to try
   */
  getProviderOrder(options = {}) {
    const providers = Array.from(this.providers.keys());

    // Sort by priority
    providers.sort((a, b) => {
      const priorityA = PROVIDER_PRIORITY[a] || 999;
      const priorityB = PROVIDER_PRIORITY[b] || 999;
      return priorityA - priorityB;
    });

    // If specific provider requested, try it first
    if (options.preferredProvider) {
      const index = providers.indexOf(options.preferredProvider);
      if (index > -1) {
        providers.splice(index, 1);
        providers.unshift(options.preferredProvider);
      }
    }

    return providers;
  }

  /**
   * Check if error should mark provider as unavailable
   */
  shouldMarkUnavailable(error) {
    const criticalErrors = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'Network Error',
      'Service Unavailable'
    ];

    return criticalErrors.some(err =>
      error.message?.includes(err) || error.code === err
    );
  }

  /**
   * Start health monitoring for all providers
   */
  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(async () => {
      for (const providerName of this.providers.keys()) {
        await this.isProviderAvailable(providerName);
      }

      // Emit health status
      this.emit('healthStatus', this.getHealthStatus());
    }, this.config.healthCheckInterval);

    console.log(`🏥 Health monitoring started (interval: ${this.config.healthCheckInterval}ms)`);
  }

  /**
   * Get health status of all providers
   */
  getHealthStatus() {
    const status = {};

    for (const [name, providerStatus] of this.providerStatus) {
      const metrics = this.metrics.get(name) || {};
      const capabilities = PROVIDER_CAPABILITIES[name];

      status[name] = {
        available: providerStatus.available,
        lastCheck: providerStatus.lastCheck,
        error: providerStatus.error,
        priority: PROVIDER_PRIORITY[name],
        metrics: {
          totalCalls: metrics.calls || 0,
          failureRate: metrics.calls ?
            (metrics.failures / metrics.calls * 100).toFixed(2) + '%' : '0%',
          avgLatency: metrics.calls ?
            Math.round(metrics.totalLatency / metrics.calls) + 'ms' : 'N/A'
        },
        capabilities: capabilities || {}
      };
    }

    return status;
  }

  /**
   * Record provider metrics
   */
  recordProviderMetric(providerName, metric) {
    const metrics = this.metrics.get(providerName) || {
      calls: 0,
      failures: 0,
      totalLatency: 0
    };

    metrics.calls++;
    if (!metric.success) {
      metrics.failures++;
    }
    if (metric.latency) {
      metrics.totalLatency += metric.latency;
    }

    this.metrics.set(providerName, metrics);
  }

  /**
   * Handle provider errors
   */
  handleProviderError(providerName, error) {
    console.error(`⚠️ Provider error (${providerName}):`, error.message);

    this.emit('providerError', {
      provider: providerName,
      error: error.message,
      timestamp: Date.now()
    });
  }

  /**
   * Get provider comparison
   */
  getProviderComparison() {
    const comparison = [];

    for (const [name, capabilities] of Object.entries(PROVIDER_CAPABILITIES)) {
      const status = this.providerStatus.get(name);
      const metrics = this.metrics.get(name);

      comparison.push({
        name,
        priority: PROVIDER_PRIORITY[name],
        available: status?.available || false,
        currencies: capabilities.currencies,
        maxTps: capabilities.maxTps,
        avgFee: capabilities.avgFee,
        finality: capabilities.finality,
        features: capabilities.features,
        metrics: metrics || {}
      });
    }

    // Sort by priority
    comparison.sort((a, b) => a.priority - b.priority);

    return comparison;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    for (const provider of this.providers.values()) {
      if (provider.cleanup && typeof provider.cleanup === 'function') {
        await provider.cleanup();
      }
    }

    this.removeAllListeners();
    console.log('🧹 Provider factory cleaned up');
  }
}

// Export singleton instance
let instance = null;

export default {
  StablecoinProviderFactory,

  getInstance: (config = {}) => {
    if (!instance) {
      instance = new StablecoinProviderFactory(config);
    }
    return instance;
  },

  resetInstance: () => {
    if (instance) {
      instance.cleanup();
      instance = null;
    }
  },

  PROVIDER_PRIORITY,
  PROVIDER_CAPABILITIES
};