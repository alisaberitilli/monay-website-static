const { EventEmitter } = require('events');
const { Pool } = require('pg');
const crypto = require('crypto');
const os = require('os');

class MonitoringAlertingService extends EventEmitter {
  constructor(dbConfig) {
    super();
    this.pool = new Pool(dbConfig);
    this.metrics = new Map();
    this.alerts = new Map();
    this.thresholds = new Map();
    this.dashboards = new Map();
    this.initializeDefaultThresholds();
  }

  // Initialize Default Thresholds
  initializeDefaultThresholds() {
    // System metrics thresholds
    this.thresholds.set('cpu_usage', { warning: 70, critical: 90 });
    this.thresholds.set('memory_usage', { warning: 80, critical: 95 });
    this.thresholds.set('disk_usage', { warning: 80, critical: 90 });

    // Application metrics thresholds
    this.thresholds.set('response_time', { warning: 500, critical: 1000 });
    this.thresholds.set('error_rate', { warning: 1, critical: 5 });
    this.thresholds.set('throughput', { warning: 100, critical: 50 });

    // Database metrics thresholds
    this.thresholds.set('db_connections', { warning: 80, critical: 95 });
    this.thresholds.set('query_time', { warning: 1000, critical: 5000 });

    // Business metrics thresholds
    this.thresholds.set('transaction_failure_rate', { warning: 1, critical: 5 });
    this.thresholds.set('payment_processing_delay', { warning: 3000, critical: 10000 });
  }

  // Start Monitoring
  async startMonitoring() {
    try {
      this.emit('monitoring_started', { timestamp: new Date() });

      // Start metric collection intervals
      this.systemMetricsInterval = setInterval(() => this.collectSystemMetrics(), 10000);
      this.applicationMetricsInterval = setInterval(() => this.collectApplicationMetrics(), 30000);
      this.databaseMetricsInterval = setInterval(() => this.collectDatabaseMetrics(), 60000);
      this.businessMetricsInterval = setInterval(() => this.collectBusinessMetrics(), 60000);

      // Start alert evaluation
      this.alertEvaluationInterval = setInterval(() => this.evaluateAlerts(), 5000);

      // Start dashboard updates
      this.dashboardUpdateInterval = setInterval(() => this.updateDashboards(), 30000);

      return {
        success: true,
        message: 'Monitoring started successfully',
        intervals: {
          systemMetrics: '10s',
          applicationMetrics: '30s',
          databaseMetrics: '60s',
          businessMetrics: '60s',
          alertEvaluation: '5s'
        }
      };

    } catch (error) {
      this.emit('error', { operation: 'startMonitoring', error });
      throw error;
    }
  }

  // Collect System Metrics
  async collectSystemMetrics() {
    try {
      const timestamp = new Date();

      // CPU metrics
      const cpuUsage = process.cpuUsage();
      const cpuPercent = this.calculateCPUPercentage(cpuUsage);

      // Memory metrics
      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memPercent = ((totalMem - freeMem) / totalMem) * 100;

      // Disk metrics (simplified)
      const diskUsage = await this.getDiskUsage();

      // Network metrics
      const networkStats = await this.getNetworkStats();

      // Store metrics
      this.storeMetric('system', {
        timestamp,
        cpu: {
          usage: cpuPercent,
          cores: os.cpus().length,
          loadAvg: os.loadavg()
        },
        memory: {
          used: memUsage.heapUsed / 1024 / 1024,
          total: memUsage.heapTotal / 1024 / 1024,
          percentage: memPercent,
          rss: memUsage.rss / 1024 / 1024
        },
        disk: diskUsage,
        network: networkStats,
        uptime: os.uptime()
      });

      // Check thresholds
      this.checkThreshold('cpu_usage', cpuPercent);
      this.checkThreshold('memory_usage', memPercent);
      this.checkThreshold('disk_usage', diskUsage.percentage);

    } catch (error) {
      this.emit('error', { operation: 'collectSystemMetrics', error });
    }
  }

  // Collect Application Metrics
  async collectApplicationMetrics() {
    try {
      const timestamp = new Date();
      const client = await this.pool.connect();

      try {
        // Response time metrics
        const responseMetrics = await this.getResponseTimeMetrics(client);

        // Error rate metrics
        const errorMetrics = await this.getErrorRateMetrics(client);

        // Throughput metrics
        const throughputMetrics = await this.getThroughputMetrics(client);

        // Active users
        const activeUsers = await this.getActiveUserCount(client);

        // API usage
        const apiUsage = await this.getAPIUsageMetrics(client);

        // Store metrics
        this.storeMetric('application', {
          timestamp,
          response: responseMetrics,
          errors: errorMetrics,
          throughput: throughputMetrics,
          activeUsers,
          apiUsage
        });

        // Check thresholds
        this.checkThreshold('response_time', responseMetrics.p95);
        this.checkThreshold('error_rate', errorMetrics.rate);
        this.checkThreshold('throughput', throughputMetrics.rps);

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'collectApplicationMetrics', error });
    }
  }

  // Collect Database Metrics
  async collectDatabaseMetrics() {
    try {
      const timestamp = new Date();
      const client = await this.pool.connect();

      try {
        // Connection pool metrics
        const poolMetrics = {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount
        };

        // Query performance
        const queryMetrics = await client.query(`
          SELECT
            COUNT(*) as query_count,
            AVG(mean_exec_time) as avg_query_time,
            MAX(mean_exec_time) as max_query_time
          FROM pg_stat_statements
          WHERE query NOT LIKE '%pg_stat_statements%'
        `);

        // Table statistics
        const tableStats = await client.query(`
          SELECT
            schemaname,
            tablename,
            n_live_tup as live_rows,
            n_dead_tup as dead_rows,
            last_vacuum,
            last_autovacuum
          FROM pg_stat_user_tables
          ORDER BY n_live_tup DESC
          LIMIT 10
        `);

        // Database size
        const sizeQuery = await client.query(`
          SELECT
            pg_database_size(current_database()) as database_size,
            COUNT(*) as table_count
          FROM information_schema.tables
          WHERE table_schema = 'public'
        `);

        // Replication lag (if applicable)
        const replicationLag = await this.getReplicationLag(client);

        // Store metrics
        this.storeMetric('database', {
          timestamp,
          connections: poolMetrics,
          queries: queryMetrics.rows[0],
          tables: tableStats.rows,
          size: {
            bytes: sizeQuery.rows[0].database_size,
            mb: sizeQuery.rows[0].database_size / 1024 / 1024,
            tableCount: sizeQuery.rows[0].table_count
          },
          replication: replicationLag
        });

        // Check thresholds
        const connectionUsage = (poolMetrics.total - poolMetrics.idle) / poolMetrics.total * 100;
        this.checkThreshold('db_connections', connectionUsage);
        this.checkThreshold('query_time', queryMetrics.rows[0].avg_query_time);

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'collectDatabaseMetrics', error });
    }
  }

  // Collect Business Metrics
  async collectBusinessMetrics() {
    try {
      const timestamp = new Date();
      const client = await this.pool.connect();

      try {
        // Transaction metrics
        const transactionMetrics = await client.query(`
          SELECT
            COUNT(*) as total_transactions,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'failed') as failed,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            AVG(amount) as avg_amount,
            SUM(amount) as total_volume
          FROM transactions
          WHERE created_at > NOW() - INTERVAL '1 hour'
        `);

        // Payment processing metrics
        const paymentMetrics = await client.query(`
          SELECT
            payment_method,
            COUNT(*) as count,
            AVG(processing_time_ms) as avg_processing_time,
            MAX(processing_time_ms) as max_processing_time
          FROM payment_processing_logs
          WHERE created_at > NOW() - INTERVAL '1 hour'
          GROUP BY payment_method
        `);

        // User activity metrics
        const userMetrics = await client.query(`
          SELECT
            COUNT(DISTINCT user_id) as active_users,
            COUNT(*) FILTER (WHERE action = 'login') as logins,
            COUNT(*) FILTER (WHERE action = 'signup') as signups
          FROM user_activity_logs
          WHERE created_at > NOW() - INTERVAL '1 hour'
        `);

        // Revenue metrics
        const revenueMetrics = await client.query(`
          SELECT
            SUM(fee_amount) as total_fees,
            COUNT(DISTINCT merchant_id) as active_merchants,
            AVG(fee_amount) as avg_fee
          FROM transaction_fees
          WHERE created_at > NOW() - INTERVAL '1 hour'
        `);

        // Calculate failure rate
        const txData = transactionMetrics.rows[0];
        const failureRate = txData.total_transactions > 0
          ? (txData.failed / txData.total_transactions) * 100
          : 0;

        // Store metrics
        this.storeMetric('business', {
          timestamp,
          transactions: transactionMetrics.rows[0],
          payments: paymentMetrics.rows,
          users: userMetrics.rows[0],
          revenue: revenueMetrics.rows[0],
          kpis: {
            failureRate,
            conversionRate: this.calculateConversionRate(userMetrics.rows[0]),
            averageTransactionValue: txData.avg_amount
          }
        });

        // Check thresholds
        this.checkThreshold('transaction_failure_rate', failureRate);

        paymentMetrics.rows.forEach(pm => {
          if (pm.payment_method === 'card') {
            this.checkThreshold('payment_processing_delay', pm.avg_processing_time);
          }
        });

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'collectBusinessMetrics', error });
    }
  }

  // Evaluate Alerts
  async evaluateAlerts() {
    try {
      const activeAlerts = [];

      // Check all stored metrics against thresholds
      for (const [metricType, metricData] of this.metrics) {
        const latestData = metricData[metricData.length - 1];
        if (!latestData) continue;

        // Evaluate each metric against its thresholds
        for (const [thresholdName, thresholds] of this.thresholds) {
          const value = this.extractMetricValue(latestData, thresholdName);
          if (value === null) continue;

          const alertLevel = this.determineAlertLevel(value, thresholds);

          if (alertLevel !== 'normal') {
            const alert = {
              id: crypto.randomUUID(),
              metric: thresholdName,
              value,
              threshold: thresholds[alertLevel],
              level: alertLevel,
              timestamp: new Date(),
              message: this.generateAlertMessage(thresholdName, value, alertLevel)
            };

            activeAlerts.push(alert);
            await this.triggerAlert(alert);
          }
        }
      }

      // Update alert status
      this.updateAlertStatus(activeAlerts);

    } catch (error) {
      this.emit('error', { operation: 'evaluateAlerts', error });
    }
  }

  // Trigger Alert
  async triggerAlert(alert) {
    try {
      // Check if alert is already active
      const existingAlert = this.alerts.get(alert.metric);
      if (existingAlert && existingAlert.level === alert.level) {
        // Don't re-trigger same alert
        return;
      }

      // Store alert
      this.alerts.set(alert.metric, alert);

      // Send notifications based on alert level
      switch (alert.level) {
        case 'critical':
          await this.sendCriticalAlert(alert);
          break;
        case 'warning':
          await this.sendWarningAlert(alert);
          break;
      }

      // Log alert
      await this.logAlert(alert);

      // Emit alert event
      this.emit('alert_triggered', alert);

    } catch (error) {
      this.emit('error', { operation: 'triggerAlert', error });
    }
  }

  // Send Critical Alert
  async sendCriticalAlert(alert) {
    const channels = ['email', 'sms', 'slack', 'pagerduty'];

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailAlert(alert, 'critical');
            break;
          case 'sms':
            await this.sendSMSAlert(alert);
            break;
          case 'slack':
            await this.sendSlackAlert(alert, 'critical');
            break;
          case 'pagerduty':
            await this.sendPagerDutyAlert(alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} alert:`, error);
      }
    }
  }

  // Send Warning Alert
  async sendWarningAlert(alert) {
    const channels = ['email', 'slack'];

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailAlert(alert, 'warning');
            break;
          case 'slack':
            await this.sendSlackAlert(alert, 'warning');
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} alert:`, error);
      }
    }
  }

  // Create Dashboard
  async createDashboard(name, config) {
    try {
      const dashboardId = crypto.randomUUID();

      const dashboard = {
        id: dashboardId,
        name,
        config,
        widgets: config.widgets || [],
        refreshInterval: config.refreshInterval || 30000,
        created: new Date(),
        updated: new Date()
      };

      this.dashboards.set(dashboardId, dashboard);

      // Store dashboard configuration
      await this.storeDashboardConfig(dashboard);

      return {
        success: true,
        dashboardId,
        url: `/dashboard/${dashboardId}`
      };

    } catch (error) {
      this.emit('error', { operation: 'createDashboard', error });
      throw error;
    }
  }

  // Update Dashboards
  async updateDashboards() {
    try {
      for (const [dashboardId, dashboard] of this.dashboards) {
        const updatedWidgets = [];

        for (const widget of dashboard.widgets) {
          const widgetData = await this.getWidgetData(widget);
          updatedWidgets.push({
            ...widget,
            data: widgetData,
            lastUpdated: new Date()
          });
        }

        dashboard.widgets = updatedWidgets;
        dashboard.updated = new Date();

        // Emit dashboard update event
        this.emit('dashboard_updated', {
          dashboardId,
          widgets: updatedWidgets
        });
      }

    } catch (error) {
      this.emit('error', { operation: 'updateDashboards', error });
    }
  }

  // Get Widget Data
  async getWidgetData(widget) {
    try {
      switch (widget.type) {
        case 'line_chart':
          return this.getLineChartData(widget);
        case 'bar_chart':
          return this.getBarChartData(widget);
        case 'gauge':
          return this.getGaugeData(widget);
        case 'number':
          return this.getNumberData(widget);
        case 'table':
          return this.getTableData(widget);
        case 'heatmap':
          return this.getHeatmapData(widget);
        default:
          return null;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  // Generate Real-time Metrics Report
  async generateMetricsReport() {
    try {
      const report = {
        timestamp: new Date(),
        summary: {},
        details: {}
      };

      // System health summary
      const systemMetrics = this.metrics.get('system');
      if (systemMetrics && systemMetrics.length > 0) {
        const latest = systemMetrics[systemMetrics.length - 1];
        report.summary.system = {
          cpu: `${latest.cpu.usage.toFixed(2)}%`,
          memory: `${latest.memory.percentage.toFixed(2)}%`,
          disk: `${latest.disk.percentage.toFixed(2)}%`,
          uptime: `${(latest.uptime / 3600).toFixed(2)} hours`
        };
      }

      // Application performance summary
      const appMetrics = this.metrics.get('application');
      if (appMetrics && appMetrics.length > 0) {
        const latest = appMetrics[appMetrics.length - 1];
        report.summary.application = {
          responseTime: `${latest.response.p95}ms`,
          errorRate: `${latest.errors.rate.toFixed(2)}%`,
          throughput: `${latest.throughput.rps} req/s`,
          activeUsers: latest.activeUsers
        };
      }

      // Database performance summary
      const dbMetrics = this.metrics.get('database');
      if (dbMetrics && dbMetrics.length > 0) {
        const latest = dbMetrics[dbMetrics.length - 1];
        report.summary.database = {
          connections: `${latest.connections.total - latest.connections.idle}/${latest.connections.total}`,
          avgQueryTime: `${latest.queries.avg_query_time.toFixed(2)}ms`,
          size: `${latest.size.mb.toFixed(2)}MB`
        };
      }

      // Business metrics summary
      const bizMetrics = this.metrics.get('business');
      if (bizMetrics && bizMetrics.length > 0) {
        const latest = bizMetrics[bizMetrics.length - 1];
        report.summary.business = {
          transactions: latest.transactions.total_transactions,
          failureRate: `${latest.kpis.failureRate.toFixed(2)}%`,
          revenue: `$${(latest.revenue.total_fees || 0).toFixed(2)}`,
          activeUsers: latest.users.active_users
        };
      }

      // Active alerts
      report.alerts = Array.from(this.alerts.values());

      // Trend analysis
      report.trends = this.analyzeTrends();

      return report;

    } catch (error) {
      this.emit('error', { operation: 'generateMetricsReport', error });
      throw error;
    }
  }

  // Analyze Trends
  analyzeTrends() {
    const trends = {};

    // Analyze each metric type
    for (const [metricType, metricData] of this.metrics) {
      if (metricData.length < 2) continue;

      const recent = metricData.slice(-10); // Last 10 data points
      trends[metricType] = {};

      // Simple trend detection
      if (metricType === 'application' && recent.length > 1) {
        const firstResponseTime = recent[0].response?.p95 || 0;
        const lastResponseTime = recent[recent.length - 1].response?.p95 || 0;

        if (lastResponseTime > firstResponseTime * 1.2) {
          trends[metricType].responseTime = 'increasing';
        } else if (lastResponseTime < firstResponseTime * 0.8) {
          trends[metricType].responseTime = 'decreasing';
        } else {
          trends[metricType].responseTime = 'stable';
        }
      }
    }

    return trends;
  }

  // APM Integration
  async setupAPM(config) {
    try {
      // Configure Application Performance Monitoring
      const apmConfig = {
        serviceName: config.serviceName || 'monay-platform',
        environment: config.environment || 'production',
        serverUrl: config.serverUrl || 'http://localhost:8200',
        captureBody: 'all',
        captureHeaders: true,
        transactionSampleRate: config.sampleRate || 0.1
      };

      // Initialize APM agent (would use actual APM library in production)
      this.apmAgent = {
        config: apmConfig,
        started: true
      };

      return {
        success: true,
        config: apmConfig
      };

    } catch (error) {
      this.emit('error', { operation: 'setupAPM', error });
      throw error;
    }
  }

  // Log Aggregation Setup
  async setupLogAggregation(config) {
    try {
      // Configure log aggregation
      const logConfig = {
        sources: config.sources || ['application', 'system', 'database'],
        destination: config.destination || 'elasticsearch',
        indexPattern: config.indexPattern || 'logs-monay-*',
        retention: config.retention || '30d'
      };

      // Setup log shipping (would integrate with actual log aggregator)
      this.logAggregation = {
        config: logConfig,
        active: true
      };

      return {
        success: true,
        config: logConfig
      };

    } catch (error) {
      this.emit('error', { operation: 'setupLogAggregation', error });
      throw error;
    }
  }

  // Helper Methods
  calculateCPUPercentage(cpuUsage) {
    const totalUsage = cpuUsage.user + cpuUsage.system;
    return (totalUsage / 1000000) * 100; // Convert microseconds to percentage
  }

  async getDiskUsage() {
    // Simplified disk usage calculation
    return {
      used: 50 * 1024 * 1024 * 1024, // 50GB
      total: 100 * 1024 * 1024 * 1024, // 100GB
      percentage: 50
    };
  }

  async getNetworkStats() {
    return {
      bytesIn: Math.random() * 1000000,
      bytesOut: Math.random() * 1000000,
      packetsIn: Math.random() * 10000,
      packetsOut: Math.random() * 10000
    };
  }

  async getResponseTimeMetrics(client) {
    // Simulate response time metrics
    return {
      p50: 50 + Math.random() * 50,
      p95: 150 + Math.random() * 100,
      p99: 250 + Math.random() * 150,
      avg: 100 + Math.random() * 50
    };
  }

  async getErrorRateMetrics(client) {
    return {
      total: Math.floor(Math.random() * 1000),
      errors: Math.floor(Math.random() * 10),
      rate: Math.random() * 2
    };
  }

  async getThroughputMetrics(client) {
    return {
      requests: Math.floor(Math.random() * 10000),
      rps: 500 + Math.random() * 500
    };
  }

  async getActiveUserCount(client) {
    return Math.floor(Math.random() * 1000);
  }

  async getAPIUsageMetrics(client) {
    return {
      calls: Math.floor(Math.random() * 100000),
      uniqueUsers: Math.floor(Math.random() * 500),
      topEndpoints: [
        { endpoint: '/api/transactions', calls: 25000 },
        { endpoint: '/api/users', calls: 15000 },
        { endpoint: '/api/payments', calls: 10000 }
      ]
    };
  }

  async getReplicationLag(client) {
    // Check replication lag if configured
    try {
      const result = await client.query(`
        SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) as lag
      `);
      return result.rows[0]?.lag || 0;
    } catch {
      return null;
    }
  }

  calculateConversionRate(userMetrics) {
    if (userMetrics.active_users === 0) return 0;
    return (userMetrics.signups / userMetrics.active_users) * 100;
  }

  storeMetric(type, data) {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }

    const metrics = this.metrics.get(type);
    metrics.push(data);

    // Keep only last hour of metrics
    const oneHourAgo = new Date(Date.now() - 3600000);
    const filtered = metrics.filter(m => m.timestamp > oneHourAgo);
    this.metrics.set(type, filtered);
  }

  checkThreshold(metricName, value) {
    const threshold = this.thresholds.get(metricName);
    if (!threshold) return;

    if (value >= threshold.critical) {
      this.emit('threshold_exceeded', {
        metric: metricName,
        value,
        threshold: threshold.critical,
        level: 'critical'
      });
    } else if (value >= threshold.warning) {
      this.emit('threshold_exceeded', {
        metric: metricName,
        value,
        threshold: threshold.warning,
        level: 'warning'
      });
    }
  }

  extractMetricValue(data, metricName) {
    // Extract specific metric value from data structure
    switch (metricName) {
      case 'cpu_usage':
        return data.cpu?.usage;
      case 'memory_usage':
        return data.memory?.percentage;
      case 'disk_usage':
        return data.disk?.percentage;
      case 'response_time':
        return data.response?.p95;
      case 'error_rate':
        return data.errors?.rate;
      case 'throughput':
        return data.throughput?.rps;
      default:
        return null;
    }
  }

  determineAlertLevel(value, thresholds) {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'normal';
  }

  generateAlertMessage(metric, value, level) {
    const messages = {
      cpu_usage: `CPU usage is ${value.toFixed(2)}% (${level})`,
      memory_usage: `Memory usage is ${value.toFixed(2)}% (${level})`,
      disk_usage: `Disk usage is ${value.toFixed(2)}% (${level})`,
      response_time: `Response time is ${value}ms (${level})`,
      error_rate: `Error rate is ${value.toFixed(2)}% (${level})`,
      throughput: `Throughput is ${value} req/s (${level})`,
      transaction_failure_rate: `Transaction failure rate is ${value.toFixed(2)}% (${level})`,
      payment_processing_delay: `Payment processing delay is ${value}ms (${level})`
    };

    return messages[metric] || `${metric} is ${value} (${level})`;
  }

  updateAlertStatus(activeAlerts) {
    // Clear resolved alerts
    const activeMetrics = new Set(activeAlerts.map(a => a.metric));

    for (const [metric, alert] of this.alerts) {
      if (!activeMetrics.has(metric)) {
        this.alerts.delete(metric);
        this.emit('alert_resolved', { metric, alert });
      }
    }
  }

  async sendEmailAlert(alert, severity) {
    // Simulate email sending
    console.log(`Email alert sent: ${alert.message}`);
  }

  async sendSMSAlert(alert) {
    // Simulate SMS sending
    console.log(`SMS alert sent: ${alert.message}`);
  }

  async sendSlackAlert(alert, severity) {
    // Simulate Slack notification
    console.log(`Slack alert sent: ${alert.message}`);
  }

  async sendPagerDutyAlert(alert) {
    // Simulate PagerDuty incident creation
    console.log(`PagerDuty incident created: ${alert.message}`);
  }

  async logAlert(alert) {
    try {
      const client = await this.pool.connect();

      try {
        await client.query(`
          INSERT INTO alerts (
            alert_id, metric, value, threshold, level,
            message, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          alert.id,
          alert.metric,
          alert.value,
          alert.threshold,
          alert.level,
          alert.message,
          alert.timestamp
        ]);

      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Failed to log alert:', error);
    }
  }

  async storeDashboardConfig(dashboard) {
    try {
      const client = await this.pool.connect();

      try {
        await client.query(`
          INSERT INTO dashboards (
            dashboard_id, name, config, created_at
          ) VALUES ($1, $2, $3, $4)
        `, [
          dashboard.id,
          dashboard.name,
          JSON.stringify(dashboard.config),
          dashboard.created
        ]);

      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Failed to store dashboard:', error);
    }
  }

  async getLineChartData(widget) {
    const metricData = this.metrics.get(widget.metric);
    if (!metricData) return [];

    return metricData.slice(-20).map(d => ({
      x: d.timestamp,
      y: this.extractMetricValue(d, widget.field)
    }));
  }

  async getBarChartData(widget) {
    // Generate bar chart data
    return [
      { label: 'Category 1', value: Math.random() * 100 },
      { label: 'Category 2', value: Math.random() * 100 },
      { label: 'Category 3', value: Math.random() * 100 }
    ];
  }

  async getGaugeData(widget) {
    const metricData = this.metrics.get(widget.metric);
    if (!metricData || metricData.length === 0) return 0;

    const latest = metricData[metricData.length - 1];
    return this.extractMetricValue(latest, widget.field) || 0;
  }

  async getNumberData(widget) {
    const metricData = this.metrics.get(widget.metric);
    if (!metricData || metricData.length === 0) return 0;

    const latest = metricData[metricData.length - 1];
    return this.extractMetricValue(latest, widget.field) || 0;
  }

  async getTableData(widget) {
    // Generate table data
    return [
      { col1: 'Row 1', col2: 100, col3: 'Active' },
      { col1: 'Row 2', col2: 200, col3: 'Inactive' }
    ];
  }

  async getHeatmapData(widget) {
    // Generate heatmap data
    const data = [];
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 24; j++) {
        data.push({
          day: i,
          hour: j,
          value: Math.random() * 100
        });
      }
    }
    return data;
  }

  // Stop Monitoring
  async stopMonitoring() {
    clearInterval(this.systemMetricsInterval);
    clearInterval(this.applicationMetricsInterval);
    clearInterval(this.databaseMetricsInterval);
    clearInterval(this.businessMetricsInterval);
    clearInterval(this.alertEvaluationInterval);
    clearInterval(this.dashboardUpdateInterval);

    this.emit('monitoring_stopped', { timestamp: new Date() });

    return { success: true };
  }

  // Cleanup
  async cleanup() {
    await this.stopMonitoring();
    await this.pool.end();
  }
}

module.exports = MonitoringAlertingService;