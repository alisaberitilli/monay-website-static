import pool from '../models/index.js';
import EventEmitter from 'events';
import crypto from 'crypto';

class TransactionMonitoringSystem extends EventEmitter {
  constructor() {
    super();
    this.monitors = new Map();
    this.alerts = [];
    this.patterns = new Map();
    this.riskScores = new Map();
    this.watchlists = new Map();
    this.isMonitoring = false;
    this.alertThresholds = {
      LOW: 30,
      MEDIUM: 60,
      HIGH: 80,
      CRITICAL: 95
    };
  }

  /**
   * Initialize the monitoring system
   */
  async initialize() {
    console.log('Initializing Transaction Monitoring System...');

    // Load monitoring rules
    await this.loadMonitoringRules();

    // Load watchlists
    await this.loadWatchlists();

    // Load behavioral patterns
    await this.loadBehavioralPatterns();

    // Start real-time monitoring
    this.startMonitoring();

    // Schedule periodic tasks
    this.schedulePeriodicTasks();

    console.log('Transaction Monitoring System initialized');
  }

  /**
   * Monitor a transaction in real-time
   */
  async monitorTransaction(transaction) {
    const {
      transaction_id,
      benefit_id,
      user_id,
      program_type,
      amount,
      merchant_info,
      transaction_type,
      metadata = {}
    } = transaction;

    try {
      const monitoringResult = {
        transaction_id,
        timestamp: new Date(),
        checks: [],
        risk_score: 0,
        alerts: [],
        actions: []
      };

      // Step 1: Sanctions screening
      const sanctionsCheck = await this.performSanctionsScreening(
        user_id,
        merchant_info
      );
      monitoringResult.checks.push(sanctionsCheck);
      monitoringResult.risk_score += sanctionsCheck.risk_score;

      // Step 2: AML checks
      const amlCheck = await this.performAMLChecks(
        user_id,
        amount,
        transaction_type
      );
      monitoringResult.checks.push(amlCheck);
      monitoringResult.risk_score += amlCheck.risk_score;

      // Step 3: Velocity monitoring
      const velocityCheck = await this.performVelocityMonitoring(
        user_id,
        benefit_id,
        amount
      );
      monitoringResult.checks.push(velocityCheck);
      monitoringResult.risk_score += velocityCheck.risk_score;

      // Step 4: Pattern analysis
      const patternCheck = await this.performPatternAnalysis(
        user_id,
        transaction
      );
      monitoringResult.checks.push(patternCheck);
      monitoringResult.risk_score += patternCheck.risk_score;

      // Step 5: Behavioral analysis
      const behaviorCheck = await this.performBehavioralAnalysis(
        user_id,
        transaction
      );
      monitoringResult.checks.push(behaviorCheck);
      monitoringResult.risk_score += behaviorCheck.risk_score;

      // Step 6: Cross-program monitoring
      const crossProgramCheck = await this.performCrossProgramMonitoring(
        user_id,
        program_type
      );
      monitoringResult.checks.push(crossProgramCheck);
      monitoringResult.risk_score += crossProgramCheck.risk_score;

      // Step 7: Geographic analysis
      const geoCheck = await this.performGeographicAnalysis(
        user_id,
        merchant_info.location
      );
      monitoringResult.checks.push(geoCheck);
      monitoringResult.risk_score += geoCheck.risk_score;

      // Normalize risk score (0-100)
      monitoringResult.risk_score = Math.min(100, monitoringResult.risk_score);

      // Generate alerts based on risk score
      if (monitoringResult.risk_score >= this.alertThresholds.CRITICAL) {
        monitoringResult.alerts.push({
          level: 'CRITICAL',
          message: 'Critical risk detected - immediate review required',
          auto_action: 'BLOCK'
        });
        monitoringResult.actions.push('BLOCK_TRANSACTION');
      } else if (monitoringResult.risk_score >= this.alertThresholds.HIGH) {
        monitoringResult.alerts.push({
          level: 'HIGH',
          message: 'High risk transaction - manual review required',
          auto_action: 'HOLD'
        });
        monitoringResult.actions.push('HOLD_FOR_REVIEW');
      } else if (monitoringResult.risk_score >= this.alertThresholds.MEDIUM) {
        monitoringResult.alerts.push({
          level: 'MEDIUM',
          message: 'Medium risk detected - enhanced monitoring',
          auto_action: 'MONITOR'
        });
        monitoringResult.actions.push('ENHANCED_MONITORING');
      } else if (monitoringResult.risk_score >= this.alertThresholds.LOW) {
        monitoringResult.alerts.push({
          level: 'LOW',
          message: 'Low risk detected - standard monitoring',
          auto_action: 'LOG'
        });
      }

      // Store monitoring result
      await this.storeMonitoringResult(monitoringResult);

      // Process alerts
      if (monitoringResult.alerts.length > 0) {
        await this.processAlerts(monitoringResult.alerts, transaction);
      }

      // Emit monitoring event
      this.emit('transaction_monitored', monitoringResult);

      return monitoringResult;

    } catch (error) {
      console.error('Transaction monitoring error:', error);
      return {
        transaction_id,
        error: error.message,
        risk_score: 50, // Default to medium risk on error
        actions: ['MANUAL_REVIEW']
      };
    }
  }

  /**
   * Perform sanctions screening
   */
  async performSanctionsScreening(userId, merchantInfo) {
    const check = {
      type: 'SANCTIONS_SCREENING',
      status: 'PASS',
      risk_score: 0,
      details: []
    };

    try {
      // Check user against sanctions lists
      const userScreening = await this.screenAgainstWatchlists(userId, 'USER');
      if (userScreening.matches.length > 0) {
        check.status = 'FAIL';
        check.risk_score += 50;
        check.details.push({
          entity: 'USER',
          matches: userScreening.matches
        });
      }

      // Check merchant if available
      if (merchantInfo.merchant_id) {
        const merchantScreening = await this.screenAgainstWatchlists(
          merchantInfo.merchant_id,
          'MERCHANT'
        );
        if (merchantScreening.matches.length > 0) {
          check.status = 'FAIL';
          check.risk_score += 30;
          check.details.push({
            entity: 'MERCHANT',
            matches: merchantScreening.matches
          });
        }
      }

      // Check countries
      if (merchantInfo.country) {
        const countryCheck = await this.checkSanctionedCountry(merchantInfo.country);
        if (countryCheck.sanctioned) {
          check.status = 'FAIL';
          check.risk_score += 40;
          check.details.push({
            entity: 'COUNTRY',
            country: merchantInfo.country,
            reason: countryCheck.reason
          });
        }
      }

    } catch (error) {
      console.error('Sanctions screening error:', error);
      check.status = 'ERROR';
      check.risk_score = 20;
    }

    return check;
  }

  /**
   * Perform AML checks
   */
  async performAMLChecks(userId, amount, transactionType) {
    const check = {
      type: 'AML_CHECK',
      status: 'PASS',
      risk_score: 0,
      details: []
    };

    const client = await pool.connect();
    try {
      // Check for structuring (smurfing)
      const structuringCheck = await this.checkForStructuring(userId, amount, client);
      if (structuringCheck.suspicious) {
        check.risk_score += 25;
        check.details.push({
          type: 'STRUCTURING',
          pattern: structuringCheck.pattern
        });
      }

      // Check for rapid movement of funds
      const rapidMovementCheck = await this.checkRapidMovement(userId, client);
      if (rapidMovementCheck.suspicious) {
        check.risk_score += 20;
        check.details.push({
          type: 'RAPID_MOVEMENT',
          velocity: rapidMovementCheck.velocity
        });
      }

      // Check for layering
      const layeringCheck = await this.checkForLayering(userId, client);
      if (layeringCheck.suspicious) {
        check.risk_score += 30;
        check.details.push({
          type: 'LAYERING',
          complexity: layeringCheck.complexity
        });
      }

      // CTR (Currency Transaction Report) check
      if (amount >= 10000) {
        check.details.push({
          type: 'CTR_REQUIRED',
          amount: amount
        });
        check.risk_score += 10;
      }

      // SAR (Suspicious Activity Report) triggers
      const sarTriggers = await this.checkSARTriggers(userId, amount, transactionType, client);
      if (sarTriggers.length > 0) {
        check.risk_score += 35;
        check.details.push({
          type: 'SAR_TRIGGERS',
          triggers: sarTriggers
        });
      }

      if (check.risk_score > 0) {
        check.status = 'WARNING';
      }

    } finally {
      client.release();
    }

    return check;
  }

  /**
   * Perform velocity monitoring
   */
  async performVelocityMonitoring(userId, benefitId, amount) {
    const check = {
      type: 'VELOCITY_MONITORING',
      status: 'PASS',
      risk_score: 0,
      details: []
    };

    const client = await pool.connect();
    try {
      // Get velocity metrics
      const metrics = await client.query(
        `SELECT
          COUNT(*) FILTER (WHERE transaction_date >= NOW() - INTERVAL '1 hour') as hourly_count,
          COUNT(*) FILTER (WHERE transaction_date >= NOW() - INTERVAL '1 day') as daily_count,
          COUNT(*) FILTER (WHERE transaction_date >= NOW() - INTERVAL '7 days') as weekly_count,
          SUM(amount) FILTER (WHERE transaction_date >= NOW() - INTERVAL '1 day') as daily_volume,
          AVG(amount) as avg_amount,
          STDDEV(amount) as stddev_amount
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND bt.status = 'COMPLETED'`,
        [userId]
      );

      const velocity = metrics.rows[0];

      // Check for velocity spikes
      if (velocity.hourly_count > 5) {
        check.risk_score += 15;
        check.details.push({
          type: 'HIGH_HOURLY_VELOCITY',
          count: velocity.hourly_count
        });
      }

      if (velocity.daily_count > 20) {
        check.risk_score += 20;
        check.details.push({
          type: 'HIGH_DAILY_VELOCITY',
          count: velocity.daily_count
        });
      }

      // Check for unusual amount
      if (velocity.avg_amount && velocity.stddev_amount) {
        const zScore = (amount - parseFloat(velocity.avg_amount)) / parseFloat(velocity.stddev_amount);
        if (Math.abs(zScore) > 3) {
          check.risk_score += 25;
          check.details.push({
            type: 'UNUSUAL_AMOUNT',
            z_score: zScore
          });
        }
      }

      // Check for burst patterns
      const burstCheck = await this.checkForBurstPattern(userId, client);
      if (burstCheck.detected) {
        check.risk_score += 30;
        check.details.push({
          type: 'BURST_PATTERN',
          pattern: burstCheck.pattern
        });
      }

      if (check.risk_score > 0) {
        check.status = 'WARNING';
      }

    } finally {
      client.release();
    }

    return check;
  }

  /**
   * Perform pattern analysis
   */
  async performPatternAnalysis(userId, transaction) {
    const check = {
      type: 'PATTERN_ANALYSIS',
      status: 'PASS',
      risk_score: 0,
      details: []
    };

    // Check against known fraud patterns
    for (const [patternId, pattern] of this.patterns) {
      if (pattern.matcher(transaction)) {
        check.risk_score += pattern.risk_weight;
        check.details.push({
          pattern_id: patternId,
          pattern_name: pattern.name,
          confidence: pattern.confidence
        });
      }
    }

    // Check for unusual sequences
    const sequenceCheck = await this.checkTransactionSequence(userId, transaction);
    if (sequenceCheck.unusual) {
      check.risk_score += 15;
      check.details.push({
        type: 'UNUSUAL_SEQUENCE',
        sequence: sequenceCheck.sequence
      });
    }

    // Check for time-based patterns
    const timePattern = this.checkTimePattern(transaction);
    if (timePattern.suspicious) {
      check.risk_score += 10;
      check.details.push({
        type: 'TIME_PATTERN',
        pattern: timePattern.pattern
      });
    }

    if (check.risk_score > 0) {
      check.status = 'WARNING';
    }

    return check;
  }

  /**
   * Perform behavioral analysis
   */
  async performBehavioralAnalysis(userId, transaction) {
    const check = {
      type: 'BEHAVIORAL_ANALYSIS',
      status: 'PASS',
      risk_score: 0,
      details: []
    };

    const client = await pool.connect();
    try {
      // Get user's behavioral profile
      const profile = await this.getUserBehavioralProfile(userId, client);

      // Check for deviations
      const deviations = this.checkBehavioralDeviations(transaction, profile);

      if (deviations.length > 0) {
        check.risk_score += deviations.reduce((sum, d) => sum + d.severity, 0);
        check.details = deviations;
        check.status = 'WARNING';
      }

      // Update behavioral profile
      await this.updateBehavioralProfile(userId, transaction, client);

    } finally {
      client.release();
    }

    return check;
  }

  /**
   * Perform cross-program monitoring
   */
  async performCrossProgramMonitoring(userId, programType) {
    const check = {
      type: 'CROSS_PROGRAM',
      status: 'PASS',
      risk_score: 0,
      details: []
    };

    const client = await pool.connect();
    try {
      // Check for benefit stacking
      const stackingResult = await client.query(
        `SELECT program_type, COUNT(*) as tx_count, SUM(balance_amount) as total_balance
         FROM government_benefits
         WHERE user_id = $1 AND status = 'ACTIVE'
         GROUP BY program_type`,
        [userId]
      );

      if (stackingResult.rows.length > 3) {
        check.risk_score += 15;
        check.details.push({
          type: 'MULTIPLE_BENEFITS',
          count: stackingResult.rows.length
        });
      }

      // Check for cross-program velocity
      const crossVelocity = await client.query(
        `SELECT COUNT(*) as total_count, SUM(amount) as total_amount
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND bt.transaction_date >= NOW() - INTERVAL '1 day'`,
        [userId]
      );

      const totals = crossVelocity.rows[0];
      if (totals.total_count > 50 || totals.total_amount > 5000) {
        check.risk_score += 20;
        check.details.push({
          type: 'HIGH_CROSS_PROGRAM_VELOCITY',
          daily_count: totals.total_count,
          daily_amount: totals.total_amount
        });
      }

      if (check.risk_score > 0) {
        check.status = 'WARNING';
      }

    } finally {
      client.release();
    }

    return check;
  }

  /**
   * Perform geographic analysis
   */
  async performGeographicAnalysis(userId, location) {
    const check = {
      type: 'GEOGRAPHIC_ANALYSIS',
      status: 'PASS',
      risk_score: 0,
      details: []
    };

    if (!location) {
      return check;
    }

    const client = await pool.connect();
    try {
      // Get user's location history
      const locationHistory = await client.query(
        `SELECT DISTINCT merchant_info->>'location' as location,
                COUNT(*) as count,
                MAX(transaction_date) as last_seen
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND merchant_info->>'location' IS NOT NULL
           AND bt.transaction_date >= NOW() - INTERVAL '30 days'
         GROUP BY merchant_info->>'location'`,
        [userId]
      );

      // Check for impossible travel
      const impossibleTravel = await this.checkImpossibleTravel(
        location,
        locationHistory.rows
      );

      if (impossibleTravel.detected) {
        check.risk_score += 35;
        check.details.push({
          type: 'IMPOSSIBLE_TRAVEL',
          locations: impossibleTravel.locations
        });
      }

      // Check for high-risk jurisdictions
      const jurisdictionRisk = await this.checkJurisdictionRisk(location);
      if (jurisdictionRisk.high) {
        check.risk_score += jurisdictionRisk.score;
        check.details.push({
          type: 'HIGH_RISK_JURISDICTION',
          jurisdiction: jurisdictionRisk.jurisdiction
        });
      }

      if (check.risk_score > 0) {
        check.status = 'WARNING';
      }

    } finally {
      client.release();
    }

    return check;
  }

  /**
   * Check for structuring patterns
   */
  async checkForStructuring(userId, amount, client) {
    const result = await client.query(
      `SELECT COUNT(*) as count, SUM(amount) as total
       FROM benefit_transactions bt
       JOIN government_benefits gb ON bt.benefit_id = gb.id
       WHERE gb.user_id = $1
         AND bt.amount BETWEEN 9000 AND 9999
         AND bt.transaction_date >= NOW() - INTERVAL '7 days'`,
      [userId]
    );

    const data = result.rows[0];
    return {
      suspicious: data.count > 2 || (data.total > 25000 && data.count > 1),
      pattern: {
        count: data.count,
        total: data.total
      }
    };
  }

  /**
   * Check for rapid movement of funds
   */
  async checkRapidMovement(userId, client) {
    const result = await client.query(
      `WITH transfers AS (
        SELECT transaction_date, amount, transaction_type,
               LAG(transaction_date) OVER (ORDER BY transaction_date) as prev_date
        FROM benefit_transactions bt
        JOIN government_benefits gb ON bt.benefit_id = gb.id
        WHERE gb.user_id = $1
          AND bt.transaction_date >= NOW() - INTERVAL '24 hours'
      )
      SELECT COUNT(*) as rapid_count,
             AVG(EXTRACT(EPOCH FROM (transaction_date - prev_date))) as avg_seconds
      FROM transfers
      WHERE prev_date IS NOT NULL
        AND transaction_date - prev_date < INTERVAL '5 minutes'`,
      [userId]
    );

    const data = result.rows[0];
    return {
      suspicious: data.rapid_count > 3,
      velocity: {
        count: data.rapid_count,
        avg_interval_seconds: data.avg_seconds
      }
    };
  }

  /**
   * Check for layering patterns
   */
  async checkForLayering(userId, client) {
    const result = await client.query(
      `WITH transaction_chain AS (
        SELECT bt.*, gb.program_type,
               ROW_NUMBER() OVER (PARTITION BY gb.program_type ORDER BY transaction_date) as seq
        FROM benefit_transactions bt
        JOIN government_benefits gb ON bt.benefit_id = gb.id
        WHERE gb.user_id = $1
          AND bt.transaction_date >= NOW() - INTERVAL '1 day'
      )
      SELECT COUNT(DISTINCT program_type) as programs,
             COUNT(*) as total_transactions,
             COUNT(DISTINCT merchant_info->>'merchant_id') as unique_merchants
      FROM transaction_chain`,
      [userId]
    );

    const data = result.rows[0];
    return {
      suspicious: data.programs > 2 && data.total_transactions > 10 && data.unique_merchants > 5,
      complexity: {
        programs: data.programs,
        transactions: data.total_transactions,
        merchants: data.unique_merchants
      }
    };
  }

  /**
   * Check SAR triggers
   */
  async checkSARTriggers(userId, amount, transactionType, client) {
    const triggers = [];

    // Large cash transaction
    if (transactionType === 'WITHDRAWAL' && amount > 5000) {
      triggers.push('LARGE_CASH_WITHDRAWAL');
    }

    // Multiple benefits to same merchant
    const merchantConcentration = await client.query(
      `SELECT merchant_info->>'merchant_id' as merchant_id,
              COUNT(*) as count,
              SUM(amount) as total
       FROM benefit_transactions bt
       JOIN government_benefits gb ON bt.benefit_id = gb.id
       WHERE gb.user_id = $1
         AND bt.transaction_date >= NOW() - INTERVAL '30 days'
       GROUP BY merchant_info->>'merchant_id'
       HAVING COUNT(*) > 20 OR SUM(amount) > 10000`,
      [userId]
    );

    if (merchantConcentration.rows.length > 0) {
      triggers.push('MERCHANT_CONCENTRATION');
    }

    // Unusual pattern detection
    const patternResult = await client.query(
      `SELECT COUNT(*) as pattern_violations
       FROM suspicious_patterns sp
       WHERE sp.user_id = $1
         AND sp.detected_at >= NOW() - INTERVAL '7 days'`,
      [userId]
    );

    if (patternResult.rows[0].pattern_violations > 0) {
      triggers.push('PATTERN_VIOLATIONS');
    }

    return triggers;
  }

  /**
   * Check for burst patterns
   */
  async checkForBurstPattern(userId, client) {
    const result = await client.query(
      `WITH hourly_counts AS (
        SELECT DATE_TRUNC('hour', transaction_date) as hour,
               COUNT(*) as tx_count
        FROM benefit_transactions bt
        JOIN government_benefits gb ON bt.benefit_id = gb.id
        WHERE gb.user_id = $1
          AND bt.transaction_date >= NOW() - INTERVAL '24 hours'
        GROUP BY DATE_TRUNC('hour', transaction_date)
      )
      SELECT MAX(tx_count) as max_hourly,
             AVG(tx_count) as avg_hourly,
             STDDEV(tx_count) as stddev_hourly
      FROM hourly_counts`,
      [userId]
    );

    const data = result.rows[0];
    const threshold = parseFloat(data.avg_hourly) + (2 * parseFloat(data.stddev_hourly));

    return {
      detected: data.max_hourly > threshold && data.max_hourly > 10,
      pattern: {
        max: data.max_hourly,
        average: data.avg_hourly,
        threshold
      }
    };
  }

  /**
   * Check transaction sequence
   */
  async checkTransactionSequence(userId, transaction) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT transaction_type, amount, merchant_info->>'category' as category
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
         ORDER BY bt.transaction_date DESC
         LIMIT 5`,
        [userId]
      );

      const sequence = result.rows.map(r => r.category).join('-');

      // Check for known suspicious sequences
      const suspiciousSequences = [
        'ATM-ATM-ATM',
        'CASINO-ATM',
        'LIQUOR-ATM-LIQUOR'
      ];

      return {
        unusual: suspiciousSequences.some(s => sequence.includes(s)),
        sequence
      };

    } finally {
      client.release();
    }
  }

  /**
   * Check time patterns
   */
  checkTimePattern(transaction) {
    const hour = new Date(transaction.timestamp).getHours();
    const dayOfWeek = new Date(transaction.timestamp).getDay();

    // Suspicious if transaction at unusual hours
    const suspiciousHours = hour >= 2 && hour <= 5;
    const weekendLateNight = (dayOfWeek === 0 || dayOfWeek === 6) && (hour >= 23 || hour <= 4);

    return {
      suspicious: suspiciousHours || weekendLateNight,
      pattern: {
        hour,
        day_of_week: dayOfWeek,
        is_weekend: dayOfWeek === 0 || dayOfWeek === 6
      }
    };
  }

  /**
   * Get user behavioral profile
   */
  async getUserBehavioralProfile(userId, client) {
    const result = await client.query(
      `SELECT * FROM user_behavioral_profiles WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default profile
      return {
        user_id: userId,
        typical_amount_range: { min: 0, max: 500 },
        typical_merchants: [],
        typical_times: [],
        typical_locations: [],
        risk_score: 0
      };
    }

    return result.rows[0];
  }

  /**
   * Check behavioral deviations
   */
  checkBehavioralDeviations(transaction, profile) {
    const deviations = [];

    // Amount deviation
    if (transaction.amount < profile.typical_amount_range.min ||
        transaction.amount > profile.typical_amount_range.max * 2) {
      deviations.push({
        type: 'AMOUNT_DEVIATION',
        severity: 10,
        expected: profile.typical_amount_range,
        actual: transaction.amount
      });
    }

    // Merchant deviation
    if (profile.typical_merchants.length > 0 &&
        !profile.typical_merchants.includes(transaction.merchant_info.category)) {
      deviations.push({
        type: 'MERCHANT_DEVIATION',
        severity: 5,
        expected: profile.typical_merchants,
        actual: transaction.merchant_info.category
      });
    }

    // Time deviation
    const hour = new Date(transaction.timestamp).getHours();
    if (profile.typical_times.length > 0 && !profile.typical_times.includes(hour)) {
      deviations.push({
        type: 'TIME_DEVIATION',
        severity: 3,
        expected: profile.typical_times,
        actual: hour
      });
    }

    return deviations;
  }

  /**
   * Update behavioral profile
   */
  async updateBehavioralProfile(userId, transaction, client) {
    // Update profile with new transaction data (simplified)
    await client.query(
      `INSERT INTO user_behavioral_profiles
       (user_id, last_updated, transaction_count)
       VALUES ($1, NOW(), 1)
       ON CONFLICT (user_id)
       DO UPDATE SET
         last_updated = NOW(),
         transaction_count = user_behavioral_profiles.transaction_count + 1`,
      [userId]
    );
  }

  /**
   * Check impossible travel
   */
  async checkImpossibleTravel(currentLocation, locationHistory) {
    if (locationHistory.length === 0) {
      return { detected: false };
    }

    // Parse current location
    const current = JSON.parse(currentLocation);
    const now = new Date();

    for (const hist of locationHistory) {
      const historical = JSON.parse(hist.location);
      const timeDiff = (now - new Date(hist.last_seen)) / 1000 / 60; // minutes

      const distance = this.calculateDistance(
        current.lat,
        current.lng,
        historical.lat,
        historical.lng
      );

      // Assume max travel speed of 600 mph (airline)
      const maxDistance = (timeDiff / 60) * 600;

      if (distance > maxDistance && timeDiff < 120) { // Within 2 hours
        return {
          detected: true,
          locations: [currentLocation, hist.location],
          distance,
          time_minutes: timeDiff
        };
      }
    }

    return { detected: false };
  }

  /**
   * Check jurisdiction risk
   */
  async checkJurisdictionRisk(location) {
    const parsed = JSON.parse(location);

    // High-risk jurisdictions
    const highRiskCountries = [
      'IR', 'KP', 'MM', 'AL', 'BB', 'BF', 'HT', 'JM', 'ML', 'MA',
      'NI', 'PK', 'PA', 'PH', 'SN', 'SS', 'SY', 'TZ', 'UG', 'YE', 'ZW'
    ];

    const highRiskStates = ['NV', 'DE']; // Example high-risk states

    let riskScore = 0;
    let jurisdiction = '';

    if (parsed.country && highRiskCountries.includes(parsed.country)) {
      riskScore = 40;
      jurisdiction = parsed.country;
    }

    if (parsed.state && highRiskStates.includes(parsed.state)) {
      riskScore = Math.max(riskScore, 20);
      jurisdiction = parsed.state;
    }

    return {
      high: riskScore > 0,
      score: riskScore,
      jurisdiction
    };
  }

  /**
   * Screen against watchlists
   */
  async screenAgainstWatchlists(entityId, entityType) {
    const matches = [];

    // Check each watchlist
    for (const [listName, watchlist] of this.watchlists) {
      if (watchlist.has(entityId)) {
        matches.push({
          list: listName,
          entity_id: entityId,
          entity_type: entityType,
          match_confidence: 100
        });
      }
    }

    // Fuzzy matching for names (simplified)
    // In production, would use proper name matching algorithms

    return { matches };
  }

  /**
   * Check sanctioned country
   */
  async checkSanctionedCountry(countryCode) {
    const sanctionedCountries = [
      'IR', // Iran
      'KP', // North Korea
      'SY', // Syria
      'CU', // Cuba
      'RU', // Russia (partial)
      'VE'  // Venezuela (partial)
    ];

    return {
      sanctioned: sanctionedCountries.includes(countryCode),
      reason: sanctionedCountries.includes(countryCode) ?
        `${countryCode} is under sanctions` : null
    };
  }

  /**
   * Process alerts
   */
  async processAlerts(alerts, transaction) {
    const client = await pool.connect();
    try {
      for (const alert of alerts) {
        // Store alert
        await client.query(
          `INSERT INTO monitoring_alerts
           (transaction_id, alert_level, message, auto_action, created_at, status)
           VALUES ($1, $2, $3, $4, NOW(), 'OPEN')`,
          [transaction.transaction_id, alert.level, alert.message, alert.auto_action]
        );

        // Execute auto actions
        if (alert.auto_action === 'BLOCK') {
          await this.blockTransaction(transaction);
        } else if (alert.auto_action === 'HOLD') {
          await this.holdTransaction(transaction);
        }

        // Send notifications for high-priority alerts
        if (alert.level === 'CRITICAL' || alert.level === 'HIGH') {
          await this.sendAlertNotification(alert, transaction);
        }
      }

    } finally {
      client.release();
    }
  }

  /**
   * Block transaction
   */
  async blockTransaction(transaction) {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE benefit_transactions
         SET status = 'BLOCKED', blocked_at = NOW(), blocked_reason = 'MONITORING_ALERT'
         WHERE id = $1`,
        [transaction.transaction_id]
      );

      this.emit('transaction_blocked', transaction);

    } finally {
      client.release();
    }
  }

  /**
   * Hold transaction for review
   */
  async holdTransaction(transaction) {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE benefit_transactions
         SET status = 'HELD', held_at = NOW(), review_required = true
         WHERE id = $1`,
        [transaction.transaction_id]
      );

      // Create review task
      await client.query(
        `INSERT INTO review_tasks
         (transaction_id, priority, reason, created_at, status)
         VALUES ($1, 'HIGH', 'Monitoring alert triggered', NOW(), 'PENDING')`,
        [transaction.transaction_id]
      );

      this.emit('transaction_held', transaction);

    } finally {
      client.release();
    }
  }

  /**
   * Send alert notification
   */
  async sendAlertNotification(alert, transaction) {
    // In production, integrate with notification service
    console.log(`ALERT [${alert.level}]: ${alert.message} for transaction ${transaction.transaction_id}`);

    this.emit('alert_notification', {
      alert,
      transaction_id: transaction.transaction_id
    });
  }

  /**
   * Store monitoring result
   */
  async storeMonitoringResult(result) {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO transaction_monitoring_results
         (transaction_id, risk_score, checks, alerts, actions, monitored_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [result.transaction_id, result.risk_score,
         JSON.stringify(result.checks),
         JSON.stringify(result.alerts),
         JSON.stringify(result.actions)]
      );

      // Update risk scores cache
      this.riskScores.set(result.transaction_id, result.risk_score);

    } finally {
      client.release();
    }
  }

  /**
   * Load monitoring rules
   */
  async loadMonitoringRules() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM monitoring_rules WHERE active = true`
      );

      for (const rule of result.rows) {
        this.monitors.set(rule.id, {
          name: rule.name,
          type: rule.rule_type,
          conditions: rule.conditions,
          actions: rule.actions,
          risk_weight: rule.risk_weight
        });
      }

      console.log(`Loaded ${this.monitors.size} monitoring rules`);

    } catch (error) {
      console.error('Error loading monitoring rules:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Load watchlists
   */
  async loadWatchlists() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM watchlist_entries WHERE active = true`
      );

      for (const entry of result.rows) {
        if (!this.watchlists.has(entry.list_name)) {
          this.watchlists.set(entry.list_name, new Set());
        }
        this.watchlists.get(entry.list_name).add(entry.entity_id);
      }

      console.log(`Loaded ${this.watchlists.size} watchlists`);

    } catch (error) {
      console.error('Error loading watchlists:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Load behavioral patterns
   */
  async loadBehavioralPatterns() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM behavioral_patterns WHERE active = true`
      );

      for (const pattern of result.rows) {
        this.patterns.set(pattern.id, {
          name: pattern.name,
          risk_weight: pattern.risk_weight,
          confidence: pattern.confidence,
          matcher: (transaction) => {
            // Implement pattern matching logic
            try {
              const conditions = JSON.parse(pattern.conditions);
              return this.evaluatePattern(conditions, transaction);
            } catch (error) {
              console.error(`Error evaluating pattern ${pattern.id}:`, error);
              return false;
            }
          }
        });
      }

      console.log(`Loaded ${this.patterns.size} behavioral patterns`);

    } catch (error) {
      console.error('Error loading behavioral patterns:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Evaluate pattern conditions
   */
  evaluatePattern(conditions, transaction) {
    // Simple pattern evaluation (would be more sophisticated in production)
    for (const condition of conditions) {
      switch (condition.field) {
        case 'amount':
          if (condition.operator === '>' && transaction.amount <= condition.value) {
            return false;
          }
          if (condition.operator === '<' && transaction.amount >= condition.value) {
            return false;
          }
          break;

        case 'merchant_type':
          if (condition.operator === 'IN' && !condition.values.includes(transaction.merchant_info.type)) {
            return false;
          }
          break;

        case 'time_of_day':
          const hour = new Date(transaction.timestamp).getHours();
          if (condition.operator === 'BETWEEN' &&
              (hour < condition.start || hour > condition.end)) {
            return false;
          }
          break;
      }
    }

    return true;
  }

  /**
   * Calculate distance between coordinates
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring() {
    this.isMonitoring = true;
    console.log('Real-time transaction monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('Transaction monitoring stopped');
  }

  /**
   * Schedule periodic tasks
   */
  schedulePeriodicTasks() {
    // Refresh watchlists every hour
    setInterval(() => this.loadWatchlists(), 3600000);

    // Refresh patterns every 30 minutes
    setInterval(() => this.loadBehavioralPatterns(), 1800000);

    // Clean up old alerts daily
    setInterval(() => this.cleanupOldAlerts(), 86400000);

    // Generate daily reports
    setInterval(() => this.generateDailyReport(), 86400000);
  }

  /**
   * Clean up old alerts
   */
  async cleanupOldAlerts() {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE monitoring_alerts
         SET status = 'ARCHIVED'
         WHERE created_at < NOW() - INTERVAL '90 days'
           AND status = 'CLOSED'`
      );

      console.log('Old alerts cleaned up');

    } finally {
      client.release();
    }
  }

  /**
   * Generate daily report
   */
  async generateDailyReport() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
          COUNT(*) as total_transactions,
          COUNT(*) FILTER (WHERE risk_score >= 80) as high_risk_count,
          AVG(risk_score) as avg_risk_score,
          COUNT(DISTINCT transaction_id) FILTER (WHERE alerts IS NOT NULL) as alerts_generated
         FROM transaction_monitoring_results
         WHERE monitored_at >= CURRENT_DATE`
      );

      const report = result.rows[0];

      // Store or send report
      await client.query(
        `INSERT INTO daily_monitoring_reports
         (report_date, total_transactions, high_risk_count, avg_risk_score, alerts_generated)
         VALUES (CURRENT_DATE, $1, $2, $3, $4)`,
        [report.total_transactions, report.high_risk_count,
         report.avg_risk_score, report.alerts_generated]
      );

      this.emit('daily_report_generated', report);

    } finally {
      client.release();
    }
  }

  /**
   * Get monitoring statistics
   */
  async getMonitoringStats(startDate, endDate) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
          DATE_TRUNC('day', monitored_at) as date,
          COUNT(*) as transaction_count,
          AVG(risk_score) as avg_risk_score,
          MAX(risk_score) as max_risk_score,
          COUNT(*) FILTER (WHERE risk_score >= 80) as high_risk,
          COUNT(*) FILTER (WHERE alerts IS NOT NULL) as with_alerts
         FROM transaction_monitoring_results
         WHERE monitored_at BETWEEN $1 AND $2
         GROUP BY DATE_TRUNC('day', monitored_at)
         ORDER BY date`,
        [startDate, endDate]
      );

      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Shutdown the monitoring system
   */
  shutdown() {
    console.log('Shutting down Transaction Monitoring System');
    this.stopMonitoring();
    this.monitors.clear();
    this.patterns.clear();
    this.watchlists.clear();
    this.riskScores.clear();
  }
}

// Export singleton instance
export default new TransactionMonitoringSystem();