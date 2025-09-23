/**
 * Performance Monitoring and Alerting Service
 * Tracks wallet operations performance, system health, and triggers alerts
 */

import EventEmitter from 'events'
import auditLogger from './AuditLogger'

class PerformanceMonitor extends EventEmitter {
  constructor() {
    super()

    this.metrics = {
      walletGeneration: {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        p95: 0,
        p99: 0,
        samples: []
      },
      walletDestruction: {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        p95: 0,
        p99: 0,
        samples: []
      },
      apiRequests: {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        errors: 0,
        errorRate: 0
      },
      websocketConnections: {
        current: 0,
        peak: 0,
        totalEstablished: 0,
        disconnections: 0
      },
      systemResources: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkLatency: 0
      }
    }

    this.thresholds = {
      walletGenerationTime: 3000, // 3 seconds
      walletDestructionTime: 5000, // 5 seconds
      apiResponseTime: 200, // 200ms
      errorRate: 0.01, // 1%
      cpuUsage: 80, // 80%
      memoryUsage: 85, // 85%
      diskUsage: 90 // 90%
    }

    this.alerts = []
    this.startMonitoring()
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    // Monitor system resources every 30 seconds
    this.resourceMonitorInterval = setInterval(() => {
      this.monitorSystemResources()
    }, 30000)

    // Calculate percentiles every minute
    this.percentileInterval = setInterval(() => {
      this.calculatePercentiles()
    }, 60000)

    // Check thresholds every minute
    this.thresholdInterval = setInterval(() => {
      this.checkThresholds()
    }, 60000)

    // Cleanup old samples every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldSamples()
    }, 3600000)

    console.log('Performance monitoring started')
  }

  /**
   * Record wallet generation performance
   */
  recordWalletGeneration(duration, success = true) {
    const metric = this.metrics.walletGeneration
    metric.count++
    metric.totalTime += duration
    metric.averageTime = metric.totalTime / metric.count

    // Keep last 1000 samples for percentile calculation
    metric.samples.push({ duration, timestamp: Date.now(), success })
    if (metric.samples.length > 1000) {
      metric.samples.shift()
    }

    // Check if exceeds threshold
    if (duration > this.thresholds.walletGenerationTime) {
      this.triggerAlert({
        type: 'PERFORMANCE',
        severity: 'WARNING',
        metric: 'wallet_generation_time',
        value: duration,
        threshold: this.thresholds.walletGenerationTime,
        message: `Wallet generation took ${duration}ms (threshold: ${this.thresholds.walletGenerationTime}ms)`
      })
    }

    this.emit('metric', {
      type: 'wallet_generation',
      duration,
      success,
      timestamp: Date.now()
    })
  }

  /**
   * Record wallet destruction performance
   */
  recordWalletDestruction(duration, success = true) {
    const metric = this.metrics.walletDestruction
    metric.count++
    metric.totalTime += duration
    metric.averageTime = metric.totalTime / metric.count

    metric.samples.push({ duration, timestamp: Date.now(), success })
    if (metric.samples.length > 1000) {
      metric.samples.shift()
    }

    if (duration > this.thresholds.walletDestructionTime) {
      this.triggerAlert({
        type: 'PERFORMANCE',
        severity: 'WARNING',
        metric: 'wallet_destruction_time',
        value: duration,
        threshold: this.thresholds.walletDestructionTime,
        message: `Wallet destruction took ${duration}ms (threshold: ${this.thresholds.walletDestructionTime}ms)`
      })
    }
  }

  /**
   * Record API request performance
   */
  recordApiRequest(endpoint, duration, success = true) {
    const metric = this.metrics.apiRequests
    metric.count++
    metric.totalTime += duration
    metric.averageTime = metric.totalTime / metric.count

    if (!success) {
      metric.errors++
      metric.errorRate = metric.errors / metric.count
    }

    if (duration > this.thresholds.apiResponseTime) {
      this.triggerAlert({
        type: 'PERFORMANCE',
        severity: 'INFO',
        metric: 'api_response_time',
        endpoint,
        value: duration,
        threshold: this.thresholds.apiResponseTime,
        message: `API endpoint ${endpoint} took ${duration}ms`
      })
    }

    if (metric.errorRate > this.thresholds.errorRate) {
      this.triggerAlert({
        type: 'ERROR_RATE',
        severity: 'ERROR',
        metric: 'api_error_rate',
        value: metric.errorRate,
        threshold: this.thresholds.errorRate,
        message: `API error rate is ${(metric.errorRate * 100).toFixed(2)}%`
      })
    }
  }

  /**
   * Record WebSocket connection metrics
   */
  recordWebSocketConnection(event) {
    const metric = this.metrics.websocketConnections

    switch (event) {
      case 'connect':
        metric.current++
        metric.totalEstablished++
        if (metric.current > metric.peak) {
          metric.peak = metric.current
        }
        break
      case 'disconnect':
        metric.current = Math.max(0, metric.current - 1)
        metric.disconnections++
        break
    }
  }

  /**
   * Monitor system resources
   */
  async monitorSystemResources() {
    const usage = process.cpuUsage()
    const memUsage = process.memoryUsage()

    // Calculate CPU percentage (simplified)
    const cpuPercent = (usage.user + usage.system) / 1000000 // Convert to seconds
    this.metrics.systemResources.cpuUsage = Math.min(100, cpuPercent)

    // Calculate memory percentage
    const totalMem = require('os').totalmem()
    const memPercent = (memUsage.heapUsed / totalMem) * 100
    this.metrics.systemResources.memoryUsage = memPercent

    // Check thresholds
    if (this.metrics.systemResources.cpuUsage > this.thresholds.cpuUsage) {
      this.triggerAlert({
        type: 'SYSTEM',
        severity: 'ERROR',
        metric: 'cpu_usage',
        value: this.metrics.systemResources.cpuUsage,
        threshold: this.thresholds.cpuUsage,
        message: `High CPU usage: ${this.metrics.systemResources.cpuUsage.toFixed(1)}%`
      })
    }

    if (this.metrics.systemResources.memoryUsage > this.thresholds.memoryUsage) {
      this.triggerAlert({
        type: 'SYSTEM',
        severity: 'ERROR',
        metric: 'memory_usage',
        value: this.metrics.systemResources.memoryUsage,
        threshold: this.thresholds.memoryUsage,
        message: `High memory usage: ${this.metrics.systemResources.memoryUsage.toFixed(1)}%`
      })
    }
  }

  /**
   * Calculate percentiles for performance metrics
   */
  calculatePercentiles() {
    // Calculate for wallet generation
    this.calculateMetricPercentiles(this.metrics.walletGeneration)

    // Calculate for wallet destruction
    this.calculateMetricPercentiles(this.metrics.walletDestruction)
  }

  /**
   * Calculate percentiles for a specific metric
   */
  calculateMetricPercentiles(metric) {
    if (!metric.samples || metric.samples.length === 0) return

    const durations = metric.samples
      .map(s => s.duration)
      .sort((a, b) => a - b)

    const p95Index = Math.floor(durations.length * 0.95)
    const p99Index = Math.floor(durations.length * 0.99)

    metric.p95 = durations[p95Index] || 0
    metric.p99 = durations[p99Index] || 0
  }

  /**
   * Check all thresholds and trigger alerts
   */
  checkThresholds() {
    // Check wallet generation P95
    if (this.metrics.walletGeneration.p95 > this.thresholds.walletGenerationTime) {
      this.triggerAlert({
        type: 'PERFORMANCE',
        severity: 'WARNING',
        metric: 'wallet_generation_p95',
        value: this.metrics.walletGeneration.p95,
        threshold: this.thresholds.walletGenerationTime,
        message: `Wallet generation P95 is ${this.metrics.walletGeneration.p95}ms`
      })
    }

    // Check wallet destruction P95
    if (this.metrics.walletDestruction.p95 > this.thresholds.walletDestructionTime) {
      this.triggerAlert({
        type: 'PERFORMANCE',
        severity: 'WARNING',
        metric: 'wallet_destruction_p95',
        value: this.metrics.walletDestruction.p95,
        threshold: this.thresholds.walletDestructionTime,
        message: `Wallet destruction P95 is ${this.metrics.walletDestruction.p95}ms`
      })
    }
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(alert) {
    alert.timestamp = new Date().toISOString()
    alert.id = require('crypto').randomUUID()

    // Add to alerts array
    this.alerts.push(alert)
    if (this.alerts.length > 1000) {
      this.alerts.shift() // Keep last 1000 alerts
    }

    // Emit alert event
    this.emit('alert', alert)

    // Log to audit system for critical alerts
    if (alert.severity === 'ERROR' || alert.severity === 'CRITICAL') {
      await auditLogger.logEvent({
        eventType: 'PERFORMANCE_ALERT',
        severity: alert.severity,
        description: alert.message,
        metadata: alert
      })
    }

    // In production, would also:
    // - Send to monitoring service (DataDog, Prometheus)
    // - Send notifications (PagerDuty, Slack)
    // - Trigger auto-scaling if needed

    console.log(`[ALERT] ${alert.severity}: ${alert.message}`)
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      health: this.calculateHealthScore()
    }
  }

  /**
   * Calculate overall system health score
   */
  calculateHealthScore() {
    let score = 100

    // Deduct for high response times
    if (this.metrics.walletGeneration.averageTime > this.thresholds.walletGenerationTime * 0.8) {
      score -= 10
    }
    if (this.metrics.walletDestruction.averageTime > this.thresholds.walletDestructionTime * 0.8) {
      score -= 10
    }

    // Deduct for error rate
    if (this.metrics.apiRequests.errorRate > this.thresholds.errorRate * 0.5) {
      score -= 15
    }

    // Deduct for resource usage
    if (this.metrics.systemResources.cpuUsage > this.thresholds.cpuUsage * 0.8) {
      score -= 10
    }
    if (this.metrics.systemResources.memoryUsage > this.thresholds.memoryUsage * 0.8) {
      score -= 10
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Clean up old samples
   */
  cleanupOldSamples() {
    const oneHourAgo = Date.now() - 3600000

    // Clean wallet generation samples
    this.metrics.walletGeneration.samples = this.metrics.walletGeneration.samples
      .filter(s => s.timestamp > oneHourAgo)

    // Clean wallet destruction samples
    this.metrics.walletDestruction.samples = this.metrics.walletDestruction.samples
      .filter(s => s.timestamp > oneHourAgo)

    // Clean old alerts
    this.alerts = this.alerts.filter(a =>
      new Date(a.timestamp).getTime() > oneHourAgo
    )
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics() {
    return {
      wallet_generation_avg: this.metrics.walletGeneration.averageTime,
      wallet_generation_p95: this.metrics.walletGeneration.p95,
      wallet_generation_p99: this.metrics.walletGeneration.p99,
      wallet_destruction_avg: this.metrics.walletDestruction.averageTime,
      wallet_destruction_p95: this.metrics.walletDestruction.p95,
      wallet_destruction_p99: this.metrics.walletDestruction.p99,
      api_requests_total: this.metrics.apiRequests.count,
      api_error_rate: this.metrics.apiRequests.errorRate,
      websocket_connections_current: this.metrics.websocketConnections.current,
      cpu_usage: this.metrics.systemResources.cpuUsage,
      memory_usage: this.metrics.systemResources.memoryUsage,
      health_score: this.calculateHealthScore()
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    clearInterval(this.resourceMonitorInterval)
    clearInterval(this.percentileInterval)
    clearInterval(this.thresholdInterval)
    clearInterval(this.cleanupInterval)
    console.log('Performance monitoring stopped')
  }
}

export default new PerformanceMonitor()