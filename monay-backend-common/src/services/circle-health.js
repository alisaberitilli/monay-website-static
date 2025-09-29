/**
 * Circle Service Health Check Module
 * Monitors the health and performance of Circle integration
 */

import EventEmitter from 'events';

class CircleHealthMonitor extends EventEmitter {
  constructor(circleService) {
    super();
    this.circleService = circleService;
    this.healthStatus = {
      status: 'unknown',
      lastCheck: null,
      services: {},
      metrics: {
        apiCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageLatency: 0,
        peakLatency: 0,
        lastHourVolume: 0
      },
      alerts: []
    };

    this.checkInterval = null;
    this.metricsHistory = [];
    this.maxHistorySize = 1000;
    this.thresholds = {
      maxLatency: 5000, // 5 seconds
      minSuccessRate: 0.95, // 95%
      maxConsecutiveFailures: 3
    };

    this.consecutiveFailures = 0;
  }

  /**
   * Start health monitoring
   */
  start(intervalMs = 60000) { // Check every minute
    if (this.checkInterval) {
      this.stop();
    }

    console.log(`🏥 Starting Circle health monitoring (interval: ${intervalMs}ms)`);

    // Initial check
    this.performHealthCheck();

    // Schedule regular checks
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🛑 Circle health monitoring stopped');
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const startTime = Date.now();
    const results = {
      timestamp: new Date().toISOString(),
      checks: {},
      overallStatus: 'healthy'
    };

    try {
      // Check if in mock mode
      if (this.circleService.isMockMode) {
        results.checks.mockMode = {
          status: 'info',
          message: 'Running in mock mode - no real Circle API calls',
          latency: 0
        };
      }

      // Test API connectivity
      const apiCheck = await this.checkApiConnectivity();
      results.checks.api = apiCheck;

      // Test wallet operations
      const walletCheck = await this.checkWalletOperations();
      results.checks.wallets = walletCheck;

      // Check service dependencies
      const dependencyCheck = await this.checkDependencies();
      results.checks.dependencies = dependencyCheck;

      // Check rate limits
      const rateLimitCheck = this.checkRateLimits();
      results.checks.rateLimit = rateLimitCheck;

      // Determine overall status
      results.overallStatus = this.determineOverallStatus(results.checks);

      // Update health status
      this.healthStatus = {
        status: results.overallStatus,
        lastCheck: results.timestamp,
        services: results.checks,
        metrics: this.calculateMetrics(),
        alerts: this.generateAlerts(results)
      };

      // Reset consecutive failures on success
      if (results.overallStatus === 'healthy' || results.overallStatus === 'degraded') {
        this.consecutiveFailures = 0;
      }

      // Emit health check result
      this.emit('healthCheck', this.healthStatus);

      // Log if status changed
      if (this.previousStatus !== results.overallStatus) {
        console.log(`🔄 Circle health status changed: ${this.previousStatus} → ${results.overallStatus}`);
        this.emit('statusChange', {
          from: this.previousStatus,
          to: results.overallStatus,
          timestamp: results.timestamp
        });
      }
      this.previousStatus = results.overallStatus;

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.consecutiveFailures++;

      results.overallStatus = 'critical';
      results.error = error.message;

      this.healthStatus.status = 'critical';
      this.healthStatus.lastCheck = results.timestamp;
      this.healthStatus.alerts.push({
        level: 'critical',
        message: `Health check failed: ${error.message}`,
        timestamp: results.timestamp
      });

      this.emit('healthCheckError', error);
    }

    const checkDuration = Date.now() - startTime;
    this.recordMetric('healthCheckDuration', checkDuration);

    return results;
  }

  /**
   * Check API connectivity
   */
  async checkApiConnectivity() {
    const startTime = Date.now();

    try {
      // In mock mode, simulate success
      if (this.circleService.isMockMode) {
        return {
          status: 'healthy',
          message: 'Mock API connected',
          latency: Math.random() * 100
        };
      }

      // Try to get supported chains (lightweight operation)
      await this.circleService.getSupportedChains();

      const latency = Date.now() - startTime;
      this.recordMetric('apiLatency', latency);

      if (latency > this.thresholds.maxLatency) {
        return {
          status: 'degraded',
          message: `High latency detected: ${latency}ms`,
          latency
        };
      }

      return {
        status: 'healthy',
        message: 'API responding normally',
        latency
      };

    } catch (error) {
      this.recordMetric('apiFailure', 1);
      return {
        status: 'critical',
        message: `API connection failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Check wallet operations capability
   */
  async checkWalletOperations() {
    try {
      // In mock mode, always healthy
      if (this.circleService.isMockMode) {
        return {
          status: 'healthy',
          message: 'Mock wallet operations available'
        };
      }

      // Try to get a test wallet balance (non-destructive operation)
      const testUserId = 'health-check-test';
      const wallet = await this.circleService.getWalletByUserId(testUserId);

      if (wallet) {
        return {
          status: 'healthy',
          message: 'Wallet operations functional'
        };
      }

      return {
        status: 'warning',
        message: 'Wallet operations available but no test wallet found'
      };

    } catch (error) {
      return {
        status: 'degraded',
        message: `Wallet operations limited: ${error.message}`
      };
    }
  }

  /**
   * Check service dependencies
   */
  async checkDependencies() {
    const dependencies = {
      database: 'unknown',
      redis: 'unknown',
      businessRules: 'unknown'
    };

    // Check database (assuming connection exists)
    try {
      // Mock check - in real implementation, test DB connection
      dependencies.database = 'healthy';
    } catch (error) {
      dependencies.database = 'critical';
    }

    // Check Redis (if configured)
    try {
      // Mock check - in real implementation, test Redis connection
      dependencies.redis = 'healthy';
    } catch (error) {
      dependencies.redis = 'warning';
    }

    // Check business rules service
    try {
      // Mock check - in real implementation, test business rules
      dependencies.businessRules = 'healthy';
    } catch (error) {
      dependencies.businessRules = 'warning';
    }

    const allHealthy = Object.values(dependencies).every(s => s === 'healthy');
    const anyCritical = Object.values(dependencies).some(s => s === 'critical');

    return {
      status: anyCritical ? 'degraded' : allHealthy ? 'healthy' : 'warning',
      services: dependencies
    };
  }

  /**
   * Check rate limits
   */
  checkRateLimits() {
    // Calculate current request rate
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const recentCalls = this.metricsHistory.filter(m =>
      m.type === 'apiCall' && m.timestamp > oneHourAgo
    );

    const requestsPerHour = recentCalls.length;
    const maxRequestsPerHour = 10000; // Circle's typical limit

    const utilizationPercent = (requestsPerHour / maxRequestsPerHour) * 100;

    if (utilizationPercent > 90) {
      return {
        status: 'warning',
        message: `High API usage: ${utilizationPercent.toFixed(1)}% of rate limit`,
        requestsPerHour,
        limit: maxRequestsPerHour
      };
    }

    if (utilizationPercent > 95) {
      return {
        status: 'critical',
        message: `Critical API usage: ${utilizationPercent.toFixed(1)}% of rate limit`,
        requestsPerHour,
        limit: maxRequestsPerHour
      };
    }

    return {
      status: 'healthy',
      message: `Normal API usage: ${utilizationPercent.toFixed(1)}% of rate limit`,
      requestsPerHour,
      limit: maxRequestsPerHour
    };
  }

  /**
   * Determine overall health status
   */
  determineOverallStatus(checks) {
    const statuses = Object.values(checks).map(c => c.status);

    if (statuses.includes('critical')) {
      return 'critical';
    }
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    if (statuses.includes('warning')) {
      return 'warning';
    }
    return 'healthy';
  }

  /**
   * Calculate current metrics
   */
  calculateMetrics() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const recentMetrics = this.metricsHistory.filter(m => m.timestamp > oneHourAgo);

    const apiCalls = recentMetrics.filter(m => m.type === 'apiCall');
    const latencies = recentMetrics.filter(m => m.type === 'apiLatency').map(m => m.value);

    return {
      apiCalls: apiCalls.length,
      successfulCalls: apiCalls.filter(c => c.success).length,
      failedCalls: apiCalls.filter(c => !c.success).length,
      averageLatency: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      peakLatency: latencies.length ? Math.max(...latencies) : 0,
      lastHourVolume: recentMetrics.filter(m => m.type === 'transactionVolume')
        .reduce((sum, m) => sum + m.value, 0)
    };
  }

  /**
   * Generate alerts based on health check results
   */
  generateAlerts(results) {
    const alerts = [];

    // Check for critical status
    if (results.overallStatus === 'critical') {
      alerts.push({
        level: 'critical',
        message: 'Circle service is experiencing critical issues',
        timestamp: results.timestamp
      });
    }

    // Check for high latency
    if (results.checks.api?.latency > this.thresholds.maxLatency) {
      alerts.push({
        level: 'warning',
        message: `High API latency: ${results.checks.api.latency}ms`,
        timestamp: results.timestamp
      });
    }

    // Check for consecutive failures
    if (this.consecutiveFailures >= this.thresholds.maxConsecutiveFailures) {
      alerts.push({
        level: 'critical',
        message: `${this.consecutiveFailures} consecutive health check failures`,
        timestamp: results.timestamp
      });
    }

    return alerts;
  }

  /**
   * Record a metric
   */
  recordMetric(type, value, success = true) {
    const metric = {
      type,
      value,
      success,
      timestamp: Date.now()
    };

    this.metricsHistory.push(metric);

    // Trim history if too large
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
    }

    this.emit('metric', metric);
  }

  /**
   * Record an API call
   */
  recordApiCall(operation, duration, success = true, error = null) {
    this.recordMetric('apiCall', {
      operation,
      duration,
      error: error?.message
    }, success);

    this.recordMetric('apiLatency', duration);

    if (!success) {
      this.recordMetric('apiFailure', 1);
    }
  }

  /**
   * Record a transaction
   */
  recordTransaction(type, amount, success = true) {
    this.recordMetric('transaction', {
      type,
      amount,
      success
    });

    this.recordMetric('transactionVolume', amount);
  }

  /**
   * Get current health status
   */
  getStatus() {
    return this.healthStatus;
  }

  /**
   * Get health metrics
   */
  getMetrics() {
    return this.calculateMetrics();
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit = 10) {
    return this.healthStatus.alerts.slice(-limit);
  }

  /**
   * Clear alerts
   */
  clearAlerts() {
    this.healthStatus.alerts = [];
  }

  /**
   * Force a health check
   */
  async check() {
    return await this.performHealthCheck();
  }
}

export default CircleHealthMonitor;