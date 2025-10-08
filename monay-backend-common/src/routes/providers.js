/**
 * Provider Management API Routes
 * Handles provider health monitoring, failover, and configuration
 *
 * @module routes/providers
 */

import express from 'express';
import providerOrchestrator from '../services/invoice-wallet/ProviderOrchestrator.js';
// import authMiddleware from '../middleware-app/auth-middleware.js';
import db from '../models/index.js';

const router = express.Router();

/**
 * GET /api/v1/providers/health
 * Get health status of all payment providers
 */
router.get('/health', async (req, res) => {
  try {
    const stats = await providerOrchestrator.getProviderStats();

    // Calculate overall system health
    const healthyProviders = stats.filter(p => p.status === 'healthy').length;
    const totalProviders = stats.length;
    const systemHealth = totalProviders > 0 ? (healthyProviders / totalProviders) * 100 : 0;

    res.json({
      success: true,
      systemHealth: `${systemHealth.toFixed(0)}%`,
      providers: stats.map(provider => ({
        name: provider.provider,
        status: provider.status,
        latency: `${provider.latency_ms}ms`,
        errorRate: `${(provider.error_rate * 100).toFixed(2)}%`,
        successRate: `${(provider.success_rate * 100).toFixed(2)}%`,
        currentTPS: provider.tps_current,
        lastCheck: provider.last_check,
        isHealthy: provider.status === 'healthy'
      }))
    });
  } catch (error) {
    console.error('Failed to get provider health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provider health status'
    });
  }
});

/**
 * GET /api/v1/providers/config
 * Get provider configurations (admin only)
 */
router.get('/config', async (req, res) => {
  try {
    const configs = await db.sequelize.query(
      `SELECT provider, priority, enabled, max_retries, timeout_ms, rate_limit_tps, config
       FROM provider_config
       ORDER BY priority ASC`,
      { type: db.sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      configurations: configs
    });
  } catch (error) {
    console.error('Failed to get provider configurations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provider configurations'
    });
  }
});

/**
 * PUT /api/v1/providers/:provider/config
 * Update provider configuration (admin only)
 */
router.put('/:provider/config', async (req, res) => {
  try {
    const { provider } = req.params;
    const config = req.body;

    await providerOrchestrator.updateProviderConfig(provider, config);

    res.json({
      success: true,
      message: `Provider ${provider} configuration updated successfully`
    });
  } catch (error) {
    console.error('Failed to update provider configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update provider configuration'
    });
  }
});

/**
 * POST /api/v1/providers/:provider/test
 * Test provider connectivity
 */
router.post('/:provider/test', async (req, res) => {
  try {
    const { provider } = req.params;
    const health = await providerOrchestrator.checkProviderHealth(provider);

    res.json({
      success: true,
      provider,
      health
    });
  } catch (error) {
    console.error('Failed to test provider:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test provider connectivity'
    });
  }
});

/**
 * GET /api/v1/providers/stats
 * Get detailed provider statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { period = '24h' } = req.query;

    // Calculate time range
    const periodMap = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };
    const interval = periodMap[period] || '24 hours';

    const stats = await db.sequelize.query(
      `SELECT
        provider,
        COUNT(*) as total_transactions,
        AVG(latency_ms) as avg_latency,
        MIN(latency_ms) as min_latency,
        MAX(latency_ms) as max_latency,
        AVG(error_rate) as avg_error_rate,
        SUM(tps_current) as total_tps
       FROM provider_health
       WHERE last_check >= NOW() - INTERVAL :interval
       GROUP BY provider`,
      {
        replacements: { interval },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      period,
      statistics: stats
    });
  } catch (error) {
    console.error('Failed to get provider statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provider statistics'
    });
  }
});

// WebSocket endpoint commented out temporarily - needs express-ws setup
// router.ws('/health/stream', ...) - Will be added after WebSocket configuration

export default router;