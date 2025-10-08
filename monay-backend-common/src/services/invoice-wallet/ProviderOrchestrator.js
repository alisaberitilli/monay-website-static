/**
 * Provider Orchestration Service
 * Manages provider failover, health monitoring, and optimal routing
 *
 * @module ProviderOrchestrator
 */

import db from '../../models/index.js';
// import logger from '../logger.js';
import { EventEmitter } from 'events';

class ProviderOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map();
    this.healthCheckInterval = null;
    this.initializeProviders();
  }

  /**
   * Initialize provider configurations from database
   */
  async initializeProviders() {
    try {
      // Load provider configurations
      const configs = await db.sequelize.query(
        `SELECT * FROM provider_config WHERE enabled = true ORDER BY priority ASC`,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      for (const config of configs) {
        this.providers.set(config.provider, {
          ...config,
          lastHealthCheck: null,
          consecutiveFailures: 0,
          status: 'unknown'
        });
      }

      // Start health monitoring
      this.startHealthMonitoring();

      console.log('Provider orchestrator initialized', {
        providers: Array.from(this.providers.keys())
      });
    } catch (error) {
      console.error('Failed to initialize provider orchestrator', error);
      throw error;
    }
  }

  /**
   * Select optimal provider based on health and business rules
   *
   * @param {Object} context - Transaction context (amount, type, urgency)
   * @returns {Promise<Object>} Selected provider details
   */
  async selectProvider(context = {}) {
    try {
      const { amount, type, urgency = 'normal' } = context;

      // Get healthy providers sorted by priority
      const healthyProviders = await this.getHealthyProviders();

      if (healthyProviders.length === 0) {
        throw new Error('No healthy providers available');
      }

      // Apply business rules for provider selection
      let selectedProvider = null;

      // Rule 1: Use Tempo for all transactions by default (primary provider)
      if (healthyProviders.find(p => p.provider === 'tempo')) {
        selectedProvider = healthyProviders.find(p => p.provider === 'tempo');
      }

      // Rule 2: Fallback to Circle if Tempo is down
      else if (healthyProviders.find(p => p.provider === 'circle')) {
        selectedProvider = healthyProviders.find(p => p.provider === 'circle');
        console.warn('Using Circle as fallback provider (Tempo unavailable)');
      }

      // Rule 3: Last resort - Stripe for fiat rails
      else if (healthyProviders.find(p => p.provider === 'stripe')) {
        selectedProvider = healthyProviders.find(p => p.provider === 'stripe');
        console.warn('Using Stripe as last resort provider');
      }

      if (!selectedProvider) {
        throw new Error('No suitable provider found for transaction');
      }

      // Log provider selection
      await this.logProviderSelection(selectedProvider, context);

      return selectedProvider;
    } catch (error) {
      console.error('Provider selection failed', error);
      throw error;
    }
  }

  /**
   * Get list of healthy providers
   */
  async getHealthyProviders() {
    const providers = [];

    for (const [name, provider] of this.providers) {
      const health = await this.checkProviderHealth(name);
      if (health.status === 'healthy' || health.status === 'degraded') {
        providers.push({
          ...provider,
          ...health
        });
      }
    }

    return providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check health of a specific provider
   */
  async checkProviderHealth(providerName) {
    try {
      const startTime = Date.now();

      // Get latest health from database
      const health = await db.sequelize.query(
        `SELECT * FROM provider_health WHERE provider = :provider`,
        {
          replacements: { provider: providerName },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!health || health.length === 0) {
        return { status: 'unknown', latency: 0, errorRate: 0 };
      }

      const latestHealth = health[0];
      const latency = Date.now() - startTime;

      // Update latency in database
      await db.sequelize.query(
        `UPDATE provider_health
         SET latency_ms = :latency, last_check = NOW()
         WHERE provider = :provider`,
        {
          replacements: { provider: providerName, latency },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      return {
        status: latestHealth.status,
        latency: latestHealth.latency_ms,
        errorRate: latestHealth.error_rate,
        successRate: latestHealth.success_rate,
        tpsCurrent: latestHealth.tps_current,
        lastCheck: new Date()
      };
    } catch (error) {
      console.error(`Health check failed for ${providerName}`, error);
      return { status: 'down', error: error.message };
    }
  }

  /**
   * Handle provider failure and initiate failover
   */
  async handleProviderFailure(providerName, error) {
    try {
      console.error(`Provider ${providerName} failed`, error);

      // Update provider status
      await db.sequelize.query(
        `UPDATE provider_health
         SET status = 'down',
             last_error = :error,
             consecutive_failures = consecutive_failures + 1
         WHERE provider = :provider`,
        {
          replacements: {
            provider: providerName,
            error: error.message
          },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      // Emit failure event
      this.emit('provider:failure', {
        provider: providerName,
        error: error.message,
        timestamp: new Date()
      });

      // Get next available provider
      const fallbackProvider = await this.selectProvider({
        urgency: 'high',
        excludeProviders: [providerName]
      });

      console.log(`Failing over from ${providerName} to ${fallbackProvider.provider}`);

      return fallbackProvider;
    } catch (error) {
      console.error('Failover handling failed', error);
      throw error;
    }
  }

  /**
   * Start continuous health monitoring
   */
  startHealthMonitoring() {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      for (const [name] of this.providers) {
        await this.checkProviderHealth(name);
      }
    }, 30000);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Log provider selection for auditing
   */
  async logProviderSelection(provider, context) {
    try {
      await db.sequelize.query(
        `INSERT INTO audit_logs (
          action, entity_type, entity_id, details, created_at
        ) VALUES (
          'provider_selected', 'provider', :providerId, :details, NOW()
        )`,
        {
          replacements: {
            providerId: provider.id,
            details: JSON.stringify({
              provider: provider.provider,
              context,
              priority: provider.priority,
              health: provider.status
            })
          },
          type: db.sequelize.QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error('Failed to log provider selection', error);
    }
  }

  /**
   * Get provider statistics
   */
  async getProviderStats() {
    try {
      const stats = await db.sequelize.query(
        `SELECT
          provider,
          status,
          latency_ms,
          error_rate,
          success_rate,
          tps_current,
          last_check
         FROM provider_health
         ORDER BY provider`,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      return stats;
    } catch (error) {
      console.error('Failed to get provider stats', error);
      throw error;
    }
  }

  /**
   * Update provider configuration
   */
  async updateProviderConfig(provider, config) {
    try {
      await db.sequelize.query(
        `UPDATE provider_config
         SET config = :config, updated_at = NOW()
         WHERE provider = :provider`,
        {
          replacements: {
            provider,
            config: JSON.stringify(config)
          },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      // Reload provider configuration
      await this.initializeProviders();

      console.log(`Provider ${provider} configuration updated`);
    } catch (error) {
      console.error(`Failed to update provider ${provider} config`, error);
      throw error;
    }
  }
}

export default new ProviderOrchestrator();