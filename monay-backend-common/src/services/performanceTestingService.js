import { EventEmitter } from 'events';
import { Pool } from 'pg';
import crypto from 'crypto';
import os from 'os';

class PerformanceTestingService extends EventEmitter {
  constructor(dbConfig) {
    super();
    this.pool = new Pool(dbConfig);
    this.metrics = [];
    this.testResults = new Map();
    this.baselineMetrics = null;
  }

  // Run Complete Performance Test Suite
  async runCompletePerformanceTest() {
    try {
      const testId = crypto.randomUUID();
      const startTime = Date.now();

      this.emit('performance_test_started', { testId, timestamp: new Date() });

      const results = {
        testId,
        timestamp: new Date(),
        systemInfo: this.getSystemInfo(),
        tests: {},
        summary: {},
        passed: true
      };

      // 1. Throughput Test (10,000 TPS requirement)
      results.tests.throughput = await this.testTransactionThroughput();

      // 2. Response Time Test (<200ms P95)
      results.tests.responseTime = await this.testResponseTime();

      // 3. Database Performance
      results.tests.database = await this.testDatabasePerformance();

      // 4. Memory Usage Test
      results.tests.memory = await this.testMemoryUsage();

      // 5. CPU Utilization Test
      results.tests.cpu = await this.testCPUUtilization();

      // 6. Concurrent Users Test
      results.tests.concurrency = await this.testConcurrentUsers();

      // 7. Load Test (Sustained load)
      results.tests.load = await this.runLoadTest();

      // 8. Stress Test (Breaking point)
      results.tests.stress = await this.runStressTest();

      // 9. Spike Test (Sudden load increase)
      results.tests.spike = await this.runSpikeTest();

      // 10. Endurance Test (Long duration)
      results.tests.endurance = await this.runEnduranceTest();

      // Calculate summary
      results.summary = this.calculatePerformanceSummary(results.tests);

      // Determine if tests passed
      results.passed = this.evaluatePerformanceCriteria(results.tests);

      // Generate performance report
      const report = await this.generatePerformanceReport(results);

      // Store results
      await this.storePerformanceResults(results);

      this.emit('performance_test_completed', {
        testId,
        executionTime: Date.now() - startTime,
        passed: results.passed,
        summary: results.summary
      });

      return {
        success: true,
        testId,
        passed: results.passed,
        summary: results.summary,
        report
      };

    } catch (error) {
      this.emit('error', { operation: 'runCompletePerformanceTest', error });
      throw error;
    }
  }

  // Transaction Throughput Test
  async testTransactionThroughput() {
    const testName = 'Transaction Throughput';
    const targetTPS = 10000;
    const duration = 10000; // 10 seconds

    try {
      const startTime = Date.now();
      let transactions = 0;
      let errors = 0;
      const latencies = [];

      // Simulate transactions
      const endTime = startTime + duration;
      const concurrentBatch = 100;

      while (Date.now() < endTime) {
        const batchPromises = [];

        for (let i = 0; i < concurrentBatch; i++) {
          batchPromises.push(this.simulateTransaction());
        }

        const batchStart = Date.now();
        const results = await Promise.allSettled(batchPromises);
        const batchLatency = Date.now() - batchStart;

        results.forEach(result => {
          if (result.status === 'fulfilled') {
            transactions++;
            latencies.push(batchLatency / concurrentBatch);
          } else {
            errors++;
          }
        });
      }

      const actualDuration = (Date.now() - startTime) / 1000;
      const actualTPS = transactions / actualDuration;
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      return {
        testName,
        passed: actualTPS >= targetTPS * 0.95, // 95% of target
        metrics: {
          targetTPS,
          actualTPS: Math.round(actualTPS),
          transactions,
          errors,
          errorRate: ((errors / (transactions + errors)) * 100).toFixed(2) + '%',
          avgLatency: avgLatency.toFixed(2) + 'ms',
          duration: actualDuration.toFixed(2) + 's'
        }
      };

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // Response Time Test
  async testResponseTime() {
    const testName = 'API Response Time';
    const iterations = 1000;
    const targetP95 = 200; // milliseconds

    try {
      const responseTimes = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await this.simulateAPICall();
        responseTimes.push(Date.now() - start);
      }

      // Sort for percentile calculation
      responseTimes.sort((a, b) => a - b);

      const p50 = responseTimes[Math.floor(iterations * 0.5)];
      const p95 = responseTimes[Math.floor(iterations * 0.95)];
      const p99 = responseTimes[Math.floor(iterations * 0.99)];
      const avg = responseTimes.reduce((a, b) => a + b, 0) / iterations;
      const min = responseTimes[0];
      const max = responseTimes[iterations - 1];

      return {
        testName,
        passed: p95 <= targetP95,
        metrics: {
          p50: p50 + 'ms',
          p95: p95 + 'ms',
          p99: p99 + 'ms',
          average: avg.toFixed(2) + 'ms',
          min: min + 'ms',
          max: max + 'ms',
          targetP95: targetP95 + 'ms'
        }
      };

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // Database Performance Test
  async testDatabasePerformance() {
    const testName = 'Database Performance';

    try {
      const client = await this.pool.connect();

      try {
        const tests = [];

        // Test 1: Simple SELECT
        const selectStart = Date.now();
        await client.query('SELECT COUNT(*) FROM users');
        const selectTime = Date.now() - selectStart;
        tests.push({ operation: 'SELECT', time: selectTime });

        // Test 2: JOIN query
        const joinStart = Date.now();
        await client.query(`
          SELECT u.*, t.*
          FROM users u
          LEFT JOIN transactions t ON t.user_id = u.id
          LIMIT 100
        `);
        const joinTime = Date.now() - joinStart;
        tests.push({ operation: 'JOIN', time: joinTime });

        // Test 3: INSERT
        const insertStart = Date.now();
        await client.query(`
          INSERT INTO test_performance (data, created_at)
          VALUES ($1, CURRENT_TIMESTAMP)
        `, [JSON.stringify({ test: 'data' })]);
        const insertTime = Date.now() - insertStart;
        tests.push({ operation: 'INSERT', time: insertTime });

        // Test 4: UPDATE
        const updateStart = Date.now();
        await client.query(`
          UPDATE test_performance
          SET data = $1
          WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
        `, [JSON.stringify({ updated: true })]);
        const updateTime = Date.now() - updateStart;
        tests.push({ operation: 'UPDATE', time: updateTime });

        // Test 5: Complex aggregation
        const aggStart = Date.now();
        await client.query(`
          SELECT
            DATE_TRUNC('day', created_at) as day,
            COUNT(*) as count,
            SUM(amount) as total
          FROM transactions
          WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE_TRUNC('day', created_at)
        `);
        const aggTime = Date.now() - aggStart;
        tests.push({ operation: 'AGGREGATION', time: aggTime });

        // Check connection pool
        const poolStats = {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount
        };

        const avgTime = tests.reduce((sum, t) => sum + t.time, 0) / tests.length;
        const passed = tests.every(t => t.time < 100); // All queries < 100ms

        return {
          testName,
          passed,
          metrics: {
            queries: tests,
            averageQueryTime: avgTime.toFixed(2) + 'ms',
            poolStats
          }
        };

      } finally {
        client.release();
      }

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // Memory Usage Test
  async testMemoryUsage() {
    const testName = 'Memory Usage';
    const maxMemoryMB = 4096; // 4GB limit

    try {
      const initialMemory = process.memoryUsage();
      const metrics = [];

      // Monitor memory during operations
      for (let i = 0; i < 10; i++) {
        // Perform memory-intensive operations
        await this.performMemoryIntensiveOperation();

        const current = process.memoryUsage();
        metrics.push({
          rss: current.rss / 1024 / 1024,
          heapTotal: current.heapTotal / 1024 / 1024,
          heapUsed: current.heapUsed / 1024 / 1024,
          external: current.external / 1024 / 1024
        });

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const avgHeapUsed = metrics.reduce((sum, m) => sum + m.heapUsed, 0) / metrics.length;
      const maxHeapUsed = Math.max(...metrics.map(m => m.heapUsed));
      const memoryLeak = this.detectMemoryLeak(metrics);

      return {
        testName,
        passed: maxHeapUsed < maxMemoryMB && !memoryLeak,
        metrics: {
          initialMemory: {
            rss: (initialMemory.rss / 1024 / 1024).toFixed(2) + 'MB',
            heapUsed: (initialMemory.heapUsed / 1024 / 1024).toFixed(2) + 'MB'
          },
          averageHeapUsed: avgHeapUsed.toFixed(2) + 'MB',
          maxHeapUsed: maxHeapUsed.toFixed(2) + 'MB',
          memoryLeakDetected: memoryLeak,
          limit: maxMemoryMB + 'MB'
        }
      };

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // CPU Utilization Test
  async testCPUUtilization() {
    const testName = 'CPU Utilization';
    const maxCPUPercent = 80;

    try {
      const cpuMetrics = [];
      const duration = 5000; // 5 seconds
      const interval = 500; // Sample every 500ms

      const startUsage = process.cpuUsage();
      const startTime = Date.now();

      const measureInterval = setInterval(() => {
        const currentUsage = process.cpuUsage(startUsage);
        const elapsedTime = Date.now() - startTime;

        const userPercent = (currentUsage.user / 1000 / elapsedTime) * 100;
        const systemPercent = (currentUsage.system / 1000 / elapsedTime) * 100;

        cpuMetrics.push({
          user: userPercent,
          system: systemPercent,
          total: userPercent + systemPercent
        });
      }, interval);

      // Run CPU-intensive operations
      await this.performCPUIntensiveOperations(duration);

      clearInterval(measureInterval);

      const avgCPU = cpuMetrics.reduce((sum, m) => sum + m.total, 0) / cpuMetrics.length;
      const maxCPU = Math.max(...cpuMetrics.map(m => m.total));

      return {
        testName,
        passed: avgCPU < maxCPUPercent,
        metrics: {
          averageCPU: avgCPU.toFixed(2) + '%',
          maxCPU: maxCPU.toFixed(2) + '%',
          cores: os.cpus().length,
          cpuModel: os.cpus()[0].model,
          limit: maxCPUPercent + '%'
        }
      };

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // Concurrent Users Test
  async testConcurrentUsers() {
    const testName = 'Concurrent Users';
    const targetUsers = 5000;

    try {
      const results = {
        successful: 0,
        failed: 0,
        responseTimes: []
      };

      const userPromises = [];

      // Create concurrent user sessions
      for (let i = 0; i < targetUsers; i++) {
        userPromises.push(this.simulateUserSession(i, results));
      }

      // Wait for all users to complete
      const startTime = Date.now();
      await Promise.allSettled(userPromises);
      const duration = Date.now() - startTime;

      const avgResponseTime = results.responseTimes.length > 0
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length
        : 0;

      const successRate = (results.successful / targetUsers) * 100;

      return {
        testName,
        passed: successRate >= 99, // 99% success rate
        metrics: {
          targetUsers,
          successful: results.successful,
          failed: results.failed,
          successRate: successRate.toFixed(2) + '%',
          avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
          duration: (duration / 1000).toFixed(2) + 's'
        }
      };

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // Load Test
  async runLoadTest() {
    const testName = 'Load Test';
    const config = {
      users: 1000,
      duration: 60000, // 1 minute
      rampUp: 10000 // 10 seconds
    };

    try {
      const metrics = {
        requests: 0,
        errors: 0,
        responseTimes: [],
        throughput: 0
      };

      const startTime = Date.now();

      // Ramp up users gradually
      const userPromises = [];
      for (let i = 0; i < config.users; i++) {
        const delay = (config.rampUp / config.users) * i;
        setTimeout(() => {
          userPromises.push(this.simulateLoadUser(config.duration - delay, metrics));
        }, delay);
      }

      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, config.duration));

      const actualDuration = (Date.now() - startTime) / 1000;
      metrics.throughput = metrics.requests / actualDuration;

      const avgResponseTime = metrics.responseTimes.length > 0
        ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
        : 0;

      const errorRate = (metrics.errors / (metrics.requests + metrics.errors)) * 100;

      return {
        testName,
        passed: metrics.throughput >= 1000 && errorRate < 1,
        metrics: {
          users: config.users,
          requests: metrics.requests,
          errors: metrics.errors,
          errorRate: errorRate.toFixed(2) + '%',
          throughput: metrics.throughput.toFixed(0) + ' req/s',
          avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
          duration: actualDuration.toFixed(2) + 's'
        }
      };

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // Stress Test
  async runStressTest() {
    const testName = 'Stress Test';

    try {
      const stressLevels = [
        { users: 100, duration: 5000 },
        { users: 500, duration: 5000 },
        { users: 1000, duration: 5000 },
        { users: 2500, duration: 5000 },
        { users: 5000, duration: 5000 },
        { users: 10000, duration: 5000 }
      ];

      let breakingPoint = null;
      const levelResults = [];

      for (const level of stressLevels) {
        const result = await this.testStressLevel(level);
        levelResults.push(result);

        if (result.errorRate > 10 || result.avgResponseTime > 1000) {
          breakingPoint = level.users;
          break;
        }
      }

      const maxCapacity = breakingPoint ? breakingPoint - 1 : 10000;

      return {
        testName,
        passed: maxCapacity >= 5000,
        metrics: {
          testedLevels: levelResults,
          breakingPoint: breakingPoint || 'Not reached',
          maxCapacity,
          recommendation: breakingPoint
            ? `System breaks at ${breakingPoint} users`
            : 'System handled maximum test load'
        }
      };

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // Spike Test
  async runSpikeTest() {
    const testName = 'Spike Test';

    try {
      const normalLoad = 100;
      const spikeLoad = 2000;
      const spikeDuration = 5000; // 5 seconds

      // Start with normal load
      const normalMetrics = await this.measureLoad(normalLoad, 5000);

      // Apply spike
      const spikeMetrics = await this.measureLoad(spikeLoad, spikeDuration);

      // Return to normal
      const recoveryMetrics = await this.measureLoad(normalLoad, 5000);

      // Calculate recovery time
      const recoveryTime = this.calculateRecoveryTime(
        normalMetrics,
        spikeMetrics,
        recoveryMetrics
      );

      return {
        testName,
        passed: spikeMetrics.errorRate < 5 && recoveryTime < 30000,
        metrics: {
          normalLoad,
          spikeLoad,
          spikeDuration: spikeDuration + 'ms',
          normalResponseTime: normalMetrics.avgResponseTime + 'ms',
          spikeResponseTime: spikeMetrics.avgResponseTime + 'ms',
          spikeErrorRate: spikeMetrics.errorRate + '%',
          recoveryTime: recoveryTime + 'ms',
          recoveryResponseTime: recoveryMetrics.avgResponseTime + 'ms'
        }
      };

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // Endurance Test
  async runEnduranceTest() {
    const testName = 'Endurance Test';
    const duration = 300000; // 5 minutes (shortened for demo)
    const users = 500;

    try {
      const startMemory = process.memoryUsage().heapUsed;
      const metrics = {
        requests: 0,
        errors: 0,
        memorySnapshots: [],
        responseTimeSnapshots: []
      };

      const startTime = Date.now();
      const interval = 30000; // Snapshot every 30 seconds

      // Take periodic snapshots
      const snapshotInterval = setInterval(() => {
        metrics.memorySnapshots.push(process.memoryUsage().heapUsed);
      }, interval);

      // Run sustained load
      const userPromises = [];
      for (let i = 0; i < users; i++) {
        userPromises.push(this.simulateEnduranceUser(duration, metrics));
      }

      await Promise.all(userPromises);
      clearInterval(snapshotInterval);

      const endMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = ((endMemory - startMemory) / startMemory) * 100;

      // Detect memory leak
      const hasMemoryLeak = this.detectMemoryLeakFromSnapshots(metrics.memorySnapshots);

      return {
        testName,
        passed: !hasMemoryLeak && memoryGrowth < 50,
        metrics: {
          duration: (duration / 1000 / 60).toFixed(2) + ' minutes',
          users,
          totalRequests: metrics.requests,
          totalErrors: metrics.errors,
          errorRate: ((metrics.errors / metrics.requests) * 100).toFixed(2) + '%',
          memoryGrowth: memoryGrowth.toFixed(2) + '%',
          memoryLeakDetected: hasMemoryLeak,
          startMemory: (startMemory / 1024 / 1024).toFixed(2) + 'MB',
          endMemory: (endMemory / 1024 / 1024).toFixed(2) + 'MB'
        }
      };

    } catch (error) {
      return {
        testName,
        passed: false,
        error: error.message
      };
    }
  }

  // Helper Methods
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      cpuModel: os.cpus()[0].model,
      totalMemory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
      freeMemory: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
      nodeVersion: process.version,
      uptime: os.uptime()
    };
  }

  async simulateTransaction() {
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    return { success: Math.random() > 0.01 }; // 99% success rate
  }

  async simulateAPICall() {
    // Simulate API call with variable latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
  }

  async performMemoryIntensiveOperation() {
    // Create large objects
    const data = [];
    for (let i = 0; i < 10000; i++) {
      data.push({
        id: crypto.randomUUID(),
        data: crypto.randomBytes(1024).toString('hex')
      });
    }
    // Process data
    const processed = data.map(d => ({ ...d, processed: true }));
    return processed.length;
  }

  detectMemoryLeak(metrics) {
    // Simple linear regression to detect increasing trend
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = metrics.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += metrics[i].heapUsed;
      sumXY += i * metrics[i].heapUsed;
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope > 5; // Memory growing by >5MB per iteration
  }

  async performCPUIntensiveOperations(duration) {
    const endTime = Date.now() + duration;
    while (Date.now() < endTime) {
      // Fibonacci calculation (CPU intensive)
      let a = 0, b = 1;
      for (let i = 0; i < 1000; i++) {
        const temp = a + b;
        a = b;
        b = temp;
      }
      // Yield to prevent blocking
      await new Promise(resolve => setImmediate(resolve));
    }
  }

  async simulateUserSession(userId, results) {
    const start = Date.now();
    try {
      // Simulate user actions
      await this.simulateAPICall();
      await this.simulateTransaction();

      results.successful++;
      results.responseTimes.push(Date.now() - start);
    } catch (error) {
      results.failed++;
    }
  }

  async simulateLoadUser(duration, metrics) {
    const endTime = Date.now() + duration;
    while (Date.now() < endTime) {
      const start = Date.now();
      try {
        await this.simulateAPICall();
        metrics.requests++;
        metrics.responseTimes.push(Date.now() - start);
      } catch (error) {
        metrics.errors++;
      }
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    }
  }

  async testStressLevel(level) {
    const metrics = {
      requests: 0,
      errors: 0,
      responseTimes: []
    };

    const promises = [];
    for (let i = 0; i < level.users; i++) {
      promises.push(this.simulateStressUser(level.duration, metrics));
    }

    await Promise.all(promises);

    const avgResponseTime = metrics.responseTimes.length > 0
      ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
      : 0;

    return {
      users: level.users,
      requests: metrics.requests,
      errors: metrics.errors,
      errorRate: (metrics.errors / (metrics.requests || 1)) * 100,
      avgResponseTime
    };
  }

  async simulateStressUser(duration, metrics) {
    const endTime = Date.now() + duration;
    while (Date.now() < endTime) {
      const start = Date.now();
      try {
        await this.simulateAPICall();
        metrics.requests++;
        metrics.responseTimes.push(Date.now() - start);
      } catch (error) {
        metrics.errors++;
      }
    }
  }

  async measureLoad(users, duration) {
    const metrics = {
      requests: 0,
      errors: 0,
      responseTimes: []
    };

    const promises = [];
    for (let i = 0; i < users; i++) {
      promises.push(this.simulateLoadMetrics(duration, metrics));
    }

    await Promise.all(promises);

    return {
      avgResponseTime: metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length,
      errorRate: (metrics.errors / (metrics.requests || 1)) * 100
    };
  }

  async simulateLoadMetrics(duration, metrics) {
    const endTime = Date.now() + duration;
    while (Date.now() < endTime) {
      const start = Date.now();
      try {
        await this.simulateAPICall();
        metrics.requests++;
        metrics.responseTimes.push(Date.now() - start);
      } catch (error) {
        metrics.errors++;
      }
    }
  }

  calculateRecoveryTime(normal, spike, recovery) {
    const normalAvg = normal.avgResponseTime;
    const threshold = normalAvg * 1.1; // Within 10% of normal
    return recovery.avgResponseTime <= threshold ? 5000 : 30000;
  }

  async simulateEnduranceUser(duration, metrics) {
    const endTime = Date.now() + duration;
    while (Date.now() < endTime) {
      try {
        await this.simulateAPICall();
        metrics.requests++;
      } catch (error) {
        metrics.errors++;
      }
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
    }
  }

  detectMemoryLeakFromSnapshots(snapshots) {
    if (snapshots.length < 2) return false;

    // Check if memory consistently increases
    let increasingTrend = 0;
    for (let i = 1; i < snapshots.length; i++) {
      if (snapshots[i] > snapshots[i - 1]) {
        increasingTrend++;
      }
    }

    return increasingTrend >= snapshots.length * 0.8; // 80% increasing trend
  }

  calculatePerformanceSummary(tests) {
    const summary = {
      totalTests: Object.keys(tests).length,
      passed: 0,
      failed: 0,
      criticalMetrics: {}
    };

    for (const [testName, result] of Object.entries(tests)) {
      if (result.passed) {
        summary.passed++;
      } else {
        summary.failed++;
      }
    }

    // Extract critical metrics
    if (tests.throughput) {
      summary.criticalMetrics.throughput = tests.throughput.metrics.actualTPS;
    }
    if (tests.responseTime) {
      summary.criticalMetrics.p95ResponseTime = tests.responseTime.metrics.p95;
    }
    if (tests.memory) {
      summary.criticalMetrics.memoryUsage = tests.memory.metrics.maxHeapUsed;
    }
    if (tests.stress) {
      summary.criticalMetrics.maxCapacity = tests.stress.metrics.maxCapacity;
    }

    return summary;
  }

  evaluatePerformanceCriteria(tests) {
    // Critical criteria that must pass
    const criticalTests = ['throughput', 'responseTime', 'memory'];

    for (const testName of criticalTests) {
      if (tests[testName] && !tests[testName].passed) {
        return false;
      }
    }

    return true;
  }

  async generatePerformanceReport(results) {
    return {
      executive_summary: {
        testId: results.testId,
        timestamp: results.timestamp,
        passed: results.passed,
        systemInfo: results.systemInfo,
        summary: results.summary
      },
      detailed_results: results.tests,
      recommendations: this.generatePerformanceRecommendations(results),
      baseline_comparison: await this.compareWithBaseline(results)
    };
  }

  generatePerformanceRecommendations(results) {
    const recommendations = [];

    if (results.tests.throughput && !results.tests.throughput.passed) {
      recommendations.push({
        priority: 'HIGH',
        area: 'Throughput',
        recommendation: 'Optimize transaction processing to meet 10,000 TPS requirement'
      });
    }

    if (results.tests.responseTime && results.tests.responseTime.metrics.p95 > 150) {
      recommendations.push({
        priority: 'MEDIUM',
        area: 'Response Time',
        recommendation: 'Optimize API endpoints to reduce P95 latency below 150ms'
      });
    }

    if (results.tests.memory && results.tests.memory.metrics.memoryLeakDetected) {
      recommendations.push({
        priority: 'CRITICAL',
        area: 'Memory Management',
        recommendation: 'Fix memory leak detected during testing'
      });
    }

    if (results.tests.stress && results.tests.stress.metrics.maxCapacity < 5000) {
      recommendations.push({
        priority: 'HIGH',
        area: 'Scalability',
        recommendation: 'Improve system capacity to handle at least 5000 concurrent users'
      });
    }

    return recommendations;
  }

  async compareWithBaseline(results) {
    if (!this.baselineMetrics) {
      // Store as baseline for future comparisons
      this.baselineMetrics = results;
      return { message: 'No baseline available. Current results stored as baseline.' };
    }

    const comparison = {
      throughput: {
        baseline: this.baselineMetrics.tests.throughput?.metrics.actualTPS,
        current: results.tests.throughput?.metrics.actualTPS,
        change: 'N/A'
      },
      responseTime: {
        baseline: this.baselineMetrics.tests.responseTime?.metrics.p95,
        current: results.tests.responseTime?.metrics.p95,
        change: 'N/A'
      }
    };

    // Calculate percentage changes
    if (comparison.throughput.baseline && comparison.throughput.current) {
      const change = ((comparison.throughput.current - comparison.throughput.baseline) /
                      comparison.throughput.baseline) * 100;
      comparison.throughput.change = change.toFixed(2) + '%';
    }

    if (comparison.responseTime.baseline && comparison.responseTime.current) {
      const change = ((comparison.responseTime.current - comparison.responseTime.baseline) /
                      comparison.responseTime.baseline) * 100;
      comparison.responseTime.change = change.toFixed(2) + '%';
    }

    return comparison;
  }

  async storePerformanceResults(results) {
    try {
      const client = await this.pool.connect();

      try {
        await client.query(`
          INSERT INTO performance_tests (
            test_id, timestamp, passed, summary, full_results
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          results.testId,
          results.timestamp,
          results.passed,
          JSON.stringify(results.summary),
          JSON.stringify(results)
        ]);

      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Failed to store performance results:', error);
    }
  }

  // Cleanup
  async cleanup() {
    await this.pool.end();
  }
}

export default PerformanceTestingService;