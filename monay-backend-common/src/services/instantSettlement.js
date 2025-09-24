const { pool } = require('../models');
const redis = require('../config/redis');
const monayFiatRailsClient = require('./monayFiatRailsClient');
const { v4: uuidv4 } = require('uuid');

class InstantSettlement {
  constructor() {
    this.paymentRails = {
      FEDNOW: { priority: 1, maxAmount: 500000, available: true },
      RTP: { priority: 2, maxAmount: 100000, available: true },
      SAME_DAY_ACH: { priority: 3, maxAmount: 1000000, available: true },
      PREPAID_CARD: { priority: 4, maxAmount: 10000, available: true }
    };

    this.settlementSLA = {
      CRITICAL: 60000,     // 1 minute
      HIGH: 300000,        // 5 minutes
      NORMAL: 3600000,     // 1 hour
      BATCH: 14400000      // 4 hours
    };

    this.healthCheckInterval = 30000; // 30 seconds
    this.failoverThreshold = 3;
    this.initializeHealthMonitoring();
  }

  async initializeHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.healthCheckInterval);

    // Initial health check
    await this.performHealthChecks();
  }

  async performHealthChecks() {
    for (const [rail, config] of Object.entries(this.paymentRails)) {
      try {
        const isHealthy = await this.checkRailHealth(rail);
        config.available = isHealthy;

        await redis.setex(
          `rail_health:${rail}`,
          60,
          JSON.stringify({
            available: isHealthy,
            lastCheck: new Date(),
            config
          })
        );
      } catch (error) {
        console.error(`Health check failed for ${rail}:`, error);
        config.available = false;
      }
    }
  }

  async processInstantSettlement(settlementRequest) {
    const startTime = Date.now();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create settlement record
      const settlement = await client.query(`
        INSERT INTO instant_settlements (
          settlement_id, transaction_id, amount,
          currency, sender_account, receiver_account,
          priority, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        uuidv4(),
        settlementRequest.transaction_id,
        settlementRequest.amount,
        settlementRequest.currency || 'USD',
        settlementRequest.sender_account,
        settlementRequest.receiver_account,
        settlementRequest.priority || 'NORMAL'
      ]);

      // Select optimal payment rail
      const selectedRail = await this.selectOptimalRail(
        settlementRequest.amount,
        settlementRequest.priority
      );

      if (!selectedRail) {
        throw new Error('No available payment rails for settlement');
      }

      // Process through selected rail
      let result;
      switch (selectedRail) {
        case 'FEDNOW':
          result = await this.processFedNowSettlement(settlement.rows[0]);
          break;
        case 'RTP':
          result = await this.processRTPSettlement(settlement.rows[0]);
          break;
        case 'SAME_DAY_ACH':
          result = await this.processSameDayACH(settlement.rows[0]);
          break;
        case 'PREPAID_CARD':
          result = await this.processPrepaidCard(settlement.rows[0]);
          break;
        default:
          throw new Error(`Unknown payment rail: ${selectedRail}`);
      }

      const processingTime = Date.now() - startTime;

      // Update settlement status
      await client.query(`
        UPDATE instant_settlements
        SET
          payment_rail = $1,
          rail_reference_id = $2,
          processing_time_ms = $3,
          status = 'completed',
          completed_at = CURRENT_TIMESTAMP
        WHERE settlement_id = $4
      `, [
        selectedRail,
        result.reference_id,
        processingTime,
        settlement.rows[0].settlement_id
      ]);

      // Create reconciliation entry
      await this.createReconciliationEntry(client, settlement.rows[0], result);

      await client.query('COMMIT');

      // Verify SLA compliance
      this.verifySLACompliance(
        settlement.rows[0].priority,
        processingTime
      );

      return {
        settlement_id: settlement.rows[0].settlement_id,
        payment_rail: selectedRail,
        reference_id: result.reference_id,
        processing_time_ms: processingTime,
        status: 'completed'
      };
    } catch (error) {
      await client.query('ROLLBACK');

      // Attempt failover
      if (this.shouldAttemptFailover(error)) {
        return await this.attemptFailover(settlementRequest);
      }

      throw error;
    } finally {
      client.release();
    }
  }

  async selectOptimalRail(amount, priority) {
    // Get current rail availability
    const availableRails = [];

    for (const [rail, config] of Object.entries(this.paymentRails)) {
      if (config.available && amount <= config.maxAmount) {
        availableRails.push({
          rail,
          priority: config.priority,
          maxAmount: config.maxAmount
        });
      }
    }

    if (availableRails.length === 0) {
      return null;
    }

    // Sort by priority (lower is better)
    availableRails.sort((a, b) => a.priority - b.priority);

    // For critical priority, use fastest available
    if (priority === 'CRITICAL') {
      return availableRails[0].rail;
    }

    // Load balance for normal priority
    if (priority === 'NORMAL') {
      return await this.loadBalanceRail(availableRails);
    }

    return availableRails[0].rail;
  }

  async loadBalanceRail(availableRails) {
    // Get current load for each rail
    const loads = await Promise.all(
      availableRails.map(async (rail) => {
        const load = await redis.get(`rail_load:${rail.rail}`);
        return {
          ...rail,
          currentLoad: parseInt(load || '0')
        };
      })
    );

    // Select rail with lowest load
    loads.sort((a, b) => a.currentLoad - b.currentLoad);

    // Increment load counter
    await redis.incr(`rail_load:${loads[0].rail}`);
    await redis.expire(`rail_load:${loads[0].rail}`, 60);

    return loads[0].rail;
  }

  async processFedNowSettlement(settlement) {
    const request = {
      messageType: 'pacs.008',
      amount: settlement.amount,
      creditorAccount: settlement.receiver_account,
      debtorAccount: settlement.sender_account,
      remittanceInfo: `Settlement ${settlement.settlement_id}`,
      instructionId: uuidv4(),
      endToEndId: settlement.transaction_id
    };

    const response = await monayFiatRailsClient.sendFedNowPayment(request);

    if (!response.success) {
      throw new Error(`FedNow settlement failed: ${response.error}`);
    }

    await this.logRailTransaction('FEDNOW', settlement, response);

    return {
      reference_id: response.transactionId,
      status: 'completed',
      timestamp: response.timestamp
    };
  }

  async processRTPSettlement(settlement) {
    const request = {
      amount: settlement.amount,
      creditorAccount: settlement.receiver_account,
      debtorAccount: settlement.sender_account,
      paymentReference: settlement.settlement_id,
      purposeCode: 'CASH'
    };

    const response = await monayFiatRailsClient.sendRTPPayment(request);

    if (!response.success) {
      throw new Error(`RTP settlement failed: ${response.error}`);
    }

    await this.logRailTransaction('RTP', settlement, response);

    return {
      reference_id: response.paymentId,
      status: 'completed',
      timestamp: response.completedAt
    };
  }

  async processSameDayACH(settlement) {
    const request = {
      amount: settlement.amount,
      accountNumber: settlement.receiver_account.account_number,
      routingNumber: settlement.receiver_account.routing_number,
      accountType: 'checking',
      secCode: 'WEB',
      companyName: 'Monay Platform',
      companyId: process.env.ACH_COMPANY_ID,
      effectiveDate: new Date(),
      description: `Settlement ${settlement.settlement_id}`
    };

    const response = await monayFiatRailsClient.createACHTransaction(request);

    if (!response.success) {
      throw new Error(`Same-day ACH failed: ${response.error}`);
    }

    await this.logRailTransaction('SAME_DAY_ACH', settlement, response);

    return {
      reference_id: response.batchId,
      status: 'completed',
      timestamp: new Date()
    };
  }

  async processPrepaidCard(settlement) {
    const client = await pool.connect();

    try {
      // Check if user has a prepaid card
      let card = await client.query(`
        SELECT * FROM cards
        WHERE user_id = $1 AND card_type = 'prepaid' AND card_status = 'active'
        LIMIT 1
      `, [settlement.receiver_account.user_id]);

      if (card.rows.length === 0) {
        // Issue new prepaid card
        card = await this.issueInstantPrepaidCard(client, settlement);
      } else {
        card = card.rows[0];
      }

      // Load funds to card
      const loadResult = await this.loadPrepaidCard(
        card.card_id || card.id,
        settlement.amount
      );

      await this.logRailTransaction('PREPAID_CARD', settlement, loadResult);

      return {
        reference_id: loadResult.transaction_id,
        status: 'completed',
        card_id: card.card_id || card.id,
        timestamp: new Date()
      };
    } finally {
      client.release();
    }
  }

  async issueInstantPrepaidCard(client, settlement) {
    const cardResult = await client.query(`
      INSERT INTO cards (
        card_id, user_id, card_type, card_status,
        card_number_encrypted, virtual_card,
        issue_date, expiry_date, daily_limit
      ) VALUES ($1, $2, 'prepaid', 'active', $3, true,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '3 years', $4)
      RETURNING *
    `, [
      uuidv4(),
      settlement.receiver_account.user_id,
      this.encryptCardNumber(this.generateVirtualCardNumber()),
      10000
    ]);

    return cardResult.rows[0];
  }

  async loadPrepaidCard(cardId, amount) {
    const transactionId = uuidv4();

    await pool.query(`
      INSERT INTO card_loads (
        transaction_id, card_id, amount,
        load_type, status, created_at
      ) VALUES ($1, $2, $3, 'instant_settlement', 'completed', CURRENT_TIMESTAMP)
    `, [transactionId, cardId, amount]);

    // Update card balance
    await pool.query(`
      UPDATE cards
      SET balance = balance + $1
      WHERE card_id = $2
    `, [amount, cardId]);

    return {
      transaction_id: transactionId,
      status: 'completed'
    };
  }

  async createReconciliationEntry(client, settlement, result) {
    await client.query(`
      INSERT INTO settlement_reconciliation (
        settlement_id, transaction_id, payment_rail,
        rail_reference_id, amount, status,
        reconciled, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, false, CURRENT_TIMESTAMP)
    `, [
      settlement.settlement_id,
      settlement.transaction_id,
      result.payment_rail || 'UNKNOWN',
      result.reference_id,
      settlement.amount,
      'pending_reconciliation'
    ]);
  }

  async reconcileSettlements(startDate, endDate) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get all settlements in date range
      const settlements = await client.query(`
        SELECT * FROM instant_settlements
        WHERE created_at BETWEEN $1 AND $2
        AND status = 'completed'
      `, [startDate, endDate]);

      const reconciliationResults = {
        total: settlements.rows.length,
        reconciled: 0,
        mismatched: 0,
        missing: 0
      };

      for (const settlement of settlements.rows) {
        const reconResult = await this.reconcileSettlement(
          client,
          settlement
        );

        if (reconResult.status === 'reconciled') {
          reconciliationResults.reconciled++;
        } else if (reconResult.status === 'mismatched') {
          reconciliationResults.mismatched++;
        } else {
          reconciliationResults.missing++;
        }
      }

      // Create reconciliation report
      await client.query(`
        INSERT INTO reconciliation_reports (
          report_id, report_type, start_date, end_date,
          total_settlements, reconciled_count,
          mismatched_count, missing_count,
          created_at
        ) VALUES ($1, 'instant_settlement', $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `, [
        uuidv4(),
        startDate,
        endDate,
        reconciliationResults.total,
        reconciliationResults.reconciled,
        reconciliationResults.mismatched,
        reconciliationResults.missing
      ]);

      await client.query('COMMIT');

      return reconciliationResults;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async reconcileSettlement(client, settlement) {
    // Get rail-specific transaction
    let railTransaction;

    switch (settlement.payment_rail) {
      case 'FEDNOW':
        railTransaction = await this.getFedNowTransaction(
          settlement.rail_reference_id
        );
        break;
      case 'RTP':
        railTransaction = await this.getRTPTransaction(
          settlement.rail_reference_id
        );
        break;
      case 'SAME_DAY_ACH':
        railTransaction = await this.getACHTransaction(
          settlement.rail_reference_id
        );
        break;
      case 'PREPAID_CARD':
        railTransaction = await this.getCardLoadTransaction(
          settlement.rail_reference_id
        );
        break;
    }

    if (!railTransaction) {
      return { status: 'missing' };
    }

    // Compare amounts
    if (Math.abs(railTransaction.amount - settlement.amount) > 0.01) {
      await client.query(`
        INSERT INTO reconciliation_discrepancies (
          settlement_id, expected_amount, actual_amount,
          discrepancy_type, created_at
        ) VALUES ($1, $2, $3, 'amount_mismatch', CURRENT_TIMESTAMP)
      `, [
        settlement.settlement_id,
        settlement.amount,
        railTransaction.amount
      ]);

      return { status: 'mismatched' };
    }

    // Mark as reconciled
    await client.query(`
      UPDATE settlement_reconciliation
      SET
        reconciled = true,
        reconciled_at = CURRENT_TIMESTAMP,
        status = 'reconciled'
      WHERE settlement_id = $1
    `, [settlement.settlement_id]);

    return { status: 'reconciled' };
  }

  async setupRedundantSystem() {
    // Configure primary and backup systems
    const systems = {
      primary: {
        fednow: process.env.FEDNOW_PRIMARY_URL,
        rtp: process.env.RTP_PRIMARY_URL,
        ach: process.env.ACH_PRIMARY_URL
      },
      secondary: {
        fednow: process.env.FEDNOW_SECONDARY_URL,
        rtp: process.env.RTP_SECONDARY_URL,
        ach: process.env.ACH_SECONDARY_URL
      },
      tertiary: {
        fednow: process.env.FEDNOW_TERTIARY_URL,
        rtp: process.env.RTP_TERTIARY_URL,
        ach: process.env.ACH_TERTIARY_URL
      }
    };

    // Store in Redis for quick access
    await redis.set('redundant_systems', JSON.stringify(systems));

    // Setup health monitoring for each system
    for (const [level, endpoints] of Object.entries(systems)) {
      for (const [rail, url] of Object.entries(endpoints)) {
        if (url) {
          await this.monitorEndpoint(level, rail, url);
        }
      }
    }

    return systems;
  }

  async monitorEndpoint(level, rail, url) {
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        timeout: 5000
      });

      const isHealthy = response.status === 200;

      await redis.setex(
        `endpoint_health:${level}:${rail}`,
        60,
        JSON.stringify({
          healthy: isHealthy,
          lastCheck: new Date(),
          responseTime: response.timing?.total
        })
      );

      return isHealthy;
    } catch (error) {
      await redis.setex(
        `endpoint_health:${level}:${rail}`,
        60,
        JSON.stringify({
          healthy: false,
          lastCheck: new Date(),
          error: error.message
        })
      );

      return false;
    }
  }

  async attemptFailover(settlementRequest) {
    const failoverAttempt = await pool.query(`
      INSERT INTO failover_attempts (
        original_request, attempt_number,
        started_at
      ) VALUES ($1, 1, CURRENT_TIMESTAMP)
      RETURNING *
    `, [JSON.stringify(settlementRequest)]);

    // Try secondary systems
    const secondarySystems = JSON.parse(await redis.get('redundant_systems')).secondary;

    try {
      // Update rails to use secondary endpoints
      monayFiatRailsClient.updateEndpoints(secondarySystems);

      // Retry settlement
      const result = await this.processInstantSettlement({
        ...settlementRequest,
        failover_attempt: failoverAttempt.rows[0].id
      });

      await pool.query(`
        UPDATE failover_attempts
        SET
          status = 'success',
          completed_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [failoverAttempt.rows[0].id]);

      return result;
    } catch (error) {
      await pool.query(`
        UPDATE failover_attempts
        SET
          status = 'failed',
          error_message = $1,
          completed_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [error.message, failoverAttempt.rows[0].id]);

      throw error;
    }
  }

  async setupLoadBalancing() {
    // Configure load balancing across payment rails
    const loadBalancerConfig = {
      algorithm: 'round_robin', // or 'least_connections', 'weighted'
      health_check_interval: 30000,
      max_connections_per_rail: 1000,
      timeout: 30000,
      retry_attempts: 3
    };

    await redis.set('load_balancer_config', JSON.stringify(loadBalancerConfig));

    // Initialize connection pools for each rail
    this.connectionPools = {
      FEDNOW: this.createConnectionPool('FEDNOW', 100),
      RTP: this.createConnectionPool('RTP', 100),
      SAME_DAY_ACH: this.createConnectionPool('SAME_DAY_ACH', 50)
    };

    return loadBalancerConfig;
  }

  createConnectionPool(rail, maxConnections) {
    return {
      rail,
      maxConnections,
      activeConnections: 0,
      queuedRequests: [],
      avgResponseTime: 0
    };
  }

  async setupDisasterRecovery() {
    const drConfig = {
      backup_regions: ['us-east-1', 'us-west-2', 'eu-west-1'],
      replication_type: 'synchronous',
      rpo_seconds: 60, // Recovery Point Objective
      rto_seconds: 300, // Recovery Time Objective
      backup_frequency_seconds: 300,
      data_retention_days: 90
    };

    // Setup cross-region replication
    for (const region of drConfig.backup_regions) {
      await this.setupRegionReplication(region);
    }

    // Store DR config
    await pool.query(`
      INSERT INTO disaster_recovery_config (
        config_id, config_data, created_at
      ) VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (config_id)
      DO UPDATE SET
        config_data = EXCLUDED.config_data,
        updated_at = CURRENT_TIMESTAMP
    `, ['primary', JSON.stringify(drConfig)]);

    return drConfig;
  }

  async setupRegionReplication(region) {
    // Setup database replication to backup region
    await pool.query(`
      CREATE PUBLICATION IF NOT EXISTS settlement_replication
      FOR TABLE instant_settlements, settlement_reconciliation
    `);

    // Configure streaming replication
    const replicationSlot = `settlement_replication_${region.replace('-', '_')}`;

    await pool.query(`
      SELECT pg_create_logical_replication_slot($1, 'pgoutput')
      WHERE NOT EXISTS (
        SELECT 1 FROM pg_replication_slots WHERE slot_name = $1
      )
    `, [replicationSlot]);

    return {
      region,
      slot: replicationSlot,
      status: 'active'
    };
  }

  verifySLACompliance(priority, processingTime) {
    const sla = this.settlementSLA[priority];

    if (processingTime > sla) {
      // Log SLA breach
      pool.query(`
        INSERT INTO sla_breaches (
          breach_type, priority, expected_ms,
          actual_ms, breach_amount, created_at
        ) VALUES ('instant_settlement', $1, $2, $3, $4, CURRENT_TIMESTAMP)
      `, [priority, sla, processingTime, processingTime - sla]);

      // Send alert
      console.error(`SLA breach: ${priority} settlement took ${processingTime}ms (expected: ${sla}ms)`);
    }
  }

  shouldAttemptFailover(error) {
    const failoverErrors = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'Service Unavailable',
      'Gateway Timeout'
    ];

    return failoverErrors.some(err => error.message.includes(err));
  }

  async checkRailHealth(rail) {
    try {
      switch (rail) {
        case 'FEDNOW':
          return await monayFiatRailsClient.checkFedNowHealth();
        case 'RTP':
          return await monayFiatRailsClient.checkRTPHealth();
        case 'SAME_DAY_ACH':
          return await monayFiatRailsClient.checkACHHealth();
        case 'PREPAID_CARD':
          return true; // Always available as fallback
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  async logRailTransaction(rail, settlement, response) {
    await pool.query(`
      INSERT INTO rail_transaction_logs (
        settlement_id, payment_rail, request_data,
        response_data, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, [
      settlement.settlement_id,
      rail,
      JSON.stringify(settlement),
      JSON.stringify(response),
      'completed'
    ]);
  }

  encryptCardNumber(cardNumber) {
    // In production, use proper encryption
    return Buffer.from(cardNumber).toString('base64');
  }

  generateVirtualCardNumber() {
    // Generate test card number (in production, use card issuer API)
    const bin = '424242'; // Test BIN
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const cardNumber = bin + random;

    // Add Luhn check digit
    const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
    return cardNumber + checkDigit;
  }

  calculateLuhnCheckDigit(cardNumber) {
    let sum = 0;
    let isEven = true;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return ((10 - (sum % 10)) % 10).toString();
  }

  async getFedNowTransaction(referenceId) {
    // In production, query FedNow API
    return { amount: 100, status: 'completed' };
  }

  async getRTPTransaction(referenceId) {
    // In production, query RTP API
    return { amount: 100, status: 'completed' };
  }

  async getACHTransaction(batchId) {
    // In production, query ACH processor
    return { amount: 100, status: 'completed' };
  }

  async getCardLoadTransaction(transactionId) {
    const result = await pool.query(`
      SELECT * FROM card_loads
      WHERE transaction_id = $1
    `, [transactionId]);

    return result.rows[0];
  }

  async getSettlementMetrics(startDate, endDate) {
    const metrics = await pool.query(`
      SELECT
        payment_rail,
        COUNT(*) as total_settlements,
        AVG(processing_time_ms) as avg_processing_time,
        MIN(processing_time_ms) as min_processing_time,
        MAX(processing_time_ms) as max_processing_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) as p95_processing_time,
        SUM(amount) as total_volume,
        COUNT(*) FILTER (WHERE status = 'completed') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM instant_settlements
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY payment_rail
    `, [startDate, endDate]);

    return metrics.rows;
  }
}

export default new InstantSettlement();