const pool = require('../models');
const EventEmitter = require('events');
const crypto = require('crypto');

class FraudDetectionPatterns extends EventEmitter {
  constructor() {
    super();
    this.patterns = new Map();
    this.models = new Map();
    this.detectedFrauds = new Map();
    this.userProfiles = new Map();
    this.merchantProfiles = new Map();
    this.networkAnalysis = new Map();
    this.isActive = false;
  }

  /**
   * Initialize Fraud Detection Patterns Engine
   */
  async initialize() {
    console.log('Initializing Fraud Detection Patterns Engine...');

    // Load fraud patterns
    await this.loadFraudPatterns();

    // Load ML models
    await this.loadMLModels();

    // Load historical fraud data
    await this.loadHistoricalData();

    // Initialize real-time detection
    this.startRealTimeDetection();

    // Schedule pattern updates
    this.schedulePatternUpdates();

    console.log('Fraud Detection Patterns Engine initialized');
  }

  /**
   * Detect fraud in transaction
   */
  async detectFraud(transaction) {
    const {
      transaction_id,
      user_id,
      benefit_id,
      program_type,
      amount,
      merchant_info,
      metadata = {}
    } = transaction;

    const detectionResult = {
      transaction_id,
      timestamp: new Date(),
      fraud_score: 0,
      patterns_matched: [],
      ml_predictions: [],
      risk_factors: [],
      recommended_action: 'APPROVE'
    };

    try {
      // Step 1: Rule-based pattern detection
      const rulePatterns = await this.detectRuleBasedPatterns(transaction);
      detectionResult.patterns_matched.push(...rulePatterns);
      detectionResult.fraud_score += this.calculatePatternScore(rulePatterns);

      // Step 2: Statistical anomaly detection
      const anomalies = await this.detectStatisticalAnomalies(transaction);
      if (anomalies.length > 0) {
        detectionResult.risk_factors.push(...anomalies);
        detectionResult.fraud_score += anomalies.reduce((sum, a) => sum + a.score, 0);
      }

      // Step 3: Behavioral pattern detection
      const behavioralPatterns = await this.detectBehavioralPatterns(user_id, transaction);
      if (behavioralPatterns.suspicious) {
        detectionResult.patterns_matched.push(...behavioralPatterns.patterns);
        detectionResult.fraud_score += behavioralPatterns.score;
      }

      // Step 4: Network analysis
      const networkAnalysis = await this.performNetworkAnalysis(user_id, merchant_info);
      if (networkAnalysis.suspicious) {
        detectionResult.risk_factors.push({
          type: 'NETWORK_RISK',
          details: networkAnalysis.details,
          score: networkAnalysis.score
        });
        detectionResult.fraud_score += networkAnalysis.score;
      }

      // Step 5: Machine learning prediction
      const mlPrediction = await this.predictWithML(transaction);
      detectionResult.ml_predictions.push(mlPrediction);
      detectionResult.fraud_score += mlPrediction.fraud_probability * 50;

      // Step 6: Cross-reference with known frauds
      const knownFraudMatch = await this.checkKnownFrauds(transaction);
      if (knownFraudMatch.matched) {
        detectionResult.patterns_matched.push({
          type: 'KNOWN_FRAUD',
          confidence: knownFraudMatch.confidence,
          details: knownFraudMatch.details
        });
        detectionResult.fraud_score += 40;
      }

      // Step 7: Velocity and burst detection
      const velocityAnalysis = await this.analyzeVelocity(user_id, benefit_id);
      if (velocityAnalysis.anomalous) {
        detectionResult.risk_factors.push({
          type: 'VELOCITY_ANOMALY',
          details: velocityAnalysis.details,
          score: velocityAnalysis.score
        });
        detectionResult.fraud_score += velocityAnalysis.score;
      }

      // Normalize fraud score (0-100)
      detectionResult.fraud_score = Math.min(100, detectionResult.fraud_score);

      // Determine recommended action
      if (detectionResult.fraud_score >= 80) {
        detectionResult.recommended_action = 'BLOCK';
      } else if (detectionResult.fraud_score >= 60) {
        detectionResult.recommended_action = 'REVIEW';
      } else if (detectionResult.fraud_score >= 40) {
        detectionResult.recommended_action = 'MONITOR';
      }

      // Store detection result
      await this.storeDetectionResult(detectionResult);

      // Update user profile
      await this.updateUserProfile(user_id, detectionResult);

      // Emit detection event
      this.emit('fraud_detected', detectionResult);

      return detectionResult;

    } catch (error) {
      console.error('Fraud detection error:', error);
      return {
        ...detectionResult,
        error: error.message,
        fraud_score: 30, // Default medium risk on error
        recommended_action: 'REVIEW'
      };
    }
  }

  /**
   * Detect rule-based patterns
   */
  async detectRuleBasedPatterns(transaction) {
    const matchedPatterns = [];

    for (const [patternId, pattern] of this.patterns) {
      if (pattern.type === 'RULE_BASED') {
        const match = await this.evaluateRulePattern(pattern, transaction);
        if (match.matched) {
          matchedPatterns.push({
            pattern_id: patternId,
            pattern_name: pattern.name,
            confidence: match.confidence,
            risk_level: pattern.risk_level
          });
        }
      }
    }

    return matchedPatterns;
  }

  /**
   * Evaluate rule pattern
   */
  async evaluateRulePattern(pattern, transaction) {
    const rules = pattern.rules;
    let matchCount = 0;
    let totalRules = rules.length;

    for (const rule of rules) {
      switch (rule.type) {
        case 'AMOUNT_RANGE':
          if (transaction.amount >= rule.min && transaction.amount <= rule.max) {
            matchCount++;
          }
          break;

        case 'MERCHANT_TYPE':
          if (rule.values.includes(transaction.merchant_info.type)) {
            matchCount++;
          }
          break;

        case 'TIME_OF_DAY':
          const hour = new Date(transaction.timestamp).getHours();
          if (hour >= rule.start_hour && hour <= rule.end_hour) {
            matchCount++;
          }
          break;

        case 'FREQUENCY':
          const frequency = await this.getTransactionFrequency(
            transaction.user_id,
            rule.time_window
          );
          if (frequency > rule.threshold) {
            matchCount++;
          }
          break;

        case 'LOCATION':
          if (await this.checkLocationRule(rule, transaction.merchant_info.location)) {
            matchCount++;
          }
          break;

        case 'SEQUENCE':
          if (await this.checkSequenceRule(rule, transaction)) {
            matchCount++;
          }
          break;
      }
    }

    const confidence = (matchCount / totalRules) * 100;
    return {
      matched: confidence >= pattern.threshold,
      confidence
    };
  }

  /**
   * Detect statistical anomalies
   */
  async detectStatisticalAnomalies(transaction) {
    const anomalies = [];
    const client = await pool.connect();

    try {
      // Get statistical baseline
      const baseline = await client.query(
        `SELECT
          AVG(amount) as avg_amount,
          STDDEV(amount) as stddev_amount,
          MIN(amount) as min_amount,
          MAX(amount) as max_amount,
          COUNT(*) as transaction_count,
          AVG(EXTRACT(HOUR FROM transaction_date)) as avg_hour,
          MODE() WITHIN GROUP (ORDER BY merchant_info->>'category') as common_category
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND bt.status = 'COMPLETED'
           AND bt.transaction_date >= NOW() - INTERVAL '90 days'`,
        [transaction.user_id]
      );

      const stats = baseline.rows[0];

      if (stats.transaction_count > 10) {
        // Amount anomaly
        if (stats.stddev_amount > 0) {
          const zScore = Math.abs(
            (transaction.amount - parseFloat(stats.avg_amount)) /
            parseFloat(stats.stddev_amount)
          );

          if (zScore > 3) {
            anomalies.push({
              type: 'AMOUNT_ANOMALY',
              z_score: zScore,
              expected_range: {
                min: stats.min_amount,
                max: stats.max_amount,
                avg: stats.avg_amount
              },
              actual: transaction.amount,
              score: Math.min(zScore * 5, 25)
            });
          }
        }

        // Time anomaly
        const currentHour = new Date(transaction.timestamp).getHours();
        const hourDeviation = Math.abs(currentHour - parseFloat(stats.avg_hour));

        if (hourDeviation > 8) {
          anomalies.push({
            type: 'TIME_ANOMALY',
            expected_hour: stats.avg_hour,
            actual_hour: currentHour,
            deviation: hourDeviation,
            score: 10
          });
        }

        // Category anomaly
        if (stats.common_category &&
            transaction.merchant_info.category !== stats.common_category) {
          const categoryDeviation = await this.calculateCategoryDeviation(
            transaction.user_id,
            transaction.merchant_info.category,
            client
          );

          if (categoryDeviation.rare) {
            anomalies.push({
              type: 'CATEGORY_ANOMALY',
              common_category: stats.common_category,
              actual_category: transaction.merchant_info.category,
              frequency: categoryDeviation.frequency,
              score: 15
            });
          }
        }
      }

    } finally {
      client.release();
    }

    return anomalies;
  }

  /**
   * Detect behavioral patterns
   */
  async detectBehavioralPatterns(userId, transaction) {
    const result = {
      suspicious: false,
      patterns: [],
      score: 0
    };

    // Get or create user profile
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = await this.loadUserProfile(userId);
      this.userProfiles.set(userId, profile);
    }

    // Check for sudden behavior changes
    const behaviorChanges = this.detectBehaviorChanges(transaction, profile);
    if (behaviorChanges.length > 0) {
      result.suspicious = true;
      result.patterns.push(...behaviorChanges);
      result.score += behaviorChanges.reduce((sum, c) => sum + c.severity, 0);
    }

    // Check for account takeover patterns
    const takeoverIndicators = await this.detectAccountTakeover(userId, transaction);
    if (takeoverIndicators.detected) {
      result.suspicious = true;
      result.patterns.push({
        type: 'ACCOUNT_TAKEOVER',
        indicators: takeoverIndicators.indicators,
        confidence: takeoverIndicators.confidence
      });
      result.score += 30;
    }

    // Check for benefit abuse patterns
    const abusePatterns = await this.detectBenefitAbuse(userId, transaction);
    if (abusePatterns.length > 0) {
      result.suspicious = true;
      result.patterns.push(...abusePatterns);
      result.score += abusePatterns.reduce((sum, p) => sum + p.severity, 0);
    }

    return result;
  }

  /**
   * Perform network analysis
   */
  async performNetworkAnalysis(userId, merchantInfo) {
    const result = {
      suspicious: false,
      score: 0,
      details: []
    };

    const client = await pool.connect();
    try {
      // Check for fraud rings
      const fraudRing = await this.detectFraudRing(userId, client);
      if (fraudRing.detected) {
        result.suspicious = true;
        result.score += 35;
        result.details.push({
          type: 'FRAUD_RING',
          ring_size: fraudRing.ring_size,
          connections: fraudRing.connections
        });
      }

      // Check merchant risk network
      if (merchantInfo.merchant_id) {
        const merchantRisk = await this.analyzeMerchantNetwork(
          merchantInfo.merchant_id,
          client
        );

        if (merchantRisk.high_risk) {
          result.suspicious = true;
          result.score += merchantRisk.risk_score;
          result.details.push({
            type: 'HIGH_RISK_MERCHANT',
            fraud_rate: merchantRisk.fraud_rate,
            connected_frauds: merchantRisk.connected_frauds
          });
        }
      }

      // Check for collusion patterns
      const collusion = await this.detectCollusion(userId, merchantInfo, client);
      if (collusion.detected) {
        result.suspicious = true;
        result.score += 25;
        result.details.push({
          type: 'COLLUSION',
          pattern: collusion.pattern,
          participants: collusion.participants
        });
      }

    } finally {
      client.release();
    }

    return result;
  }

  /**
   * Predict with machine learning
   */
  async predictWithML(transaction) {
    // Extract features
    const features = await this.extractFeatures(transaction);

    // Get appropriate model
    const model = this.models.get(transaction.program_type) ||
                  this.models.get('GENERAL');

    if (!model) {
      return {
        model: 'NONE',
        fraud_probability: 0.5,
        confidence: 0
      };
    }

    // Make prediction (simplified - in production would use actual ML)
    const prediction = this.runMLModel(model, features);

    return {
      model: model.name,
      fraud_probability: prediction.probability,
      confidence: prediction.confidence,
      important_features: prediction.important_features
    };
  }

  /**
   * Extract features for ML
   */
  async extractFeatures(transaction) {
    const client = await pool.connect();
    try {
      // Time-based features
      const now = new Date(transaction.timestamp);
      const timeFeatures = {
        hour: now.getHours(),
        day_of_week: now.getDay(),
        is_weekend: now.getDay() === 0 || now.getDay() === 6,
        is_night: now.getHours() >= 22 || now.getHours() <= 5
      };

      // Amount features
      const amountFeatures = {
        amount: transaction.amount,
        amount_log: Math.log(transaction.amount + 1),
        is_round_amount: transaction.amount % 10 === 0,
        is_large_amount: transaction.amount > 500
      };

      // Historical features
      const history = await client.query(
        `SELECT
          COUNT(*) as tx_count_24h,
          AVG(amount) as avg_amount_7d,
          COUNT(DISTINCT merchant_info->>'merchant_id') as unique_merchants_30d,
          MAX(amount) as max_amount_30d
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND bt.transaction_date >= NOW() - INTERVAL '30 days'`,
        [transaction.user_id]
      );

      const historicalFeatures = history.rows[0];

      // Merchant features
      const merchantFeatures = {
        merchant_category: this.encodeMerchantCategory(transaction.merchant_info.category),
        is_new_merchant: await this.isNewMerchant(
          transaction.user_id,
          transaction.merchant_info.merchant_id
        ),
        merchant_risk_score: await this.getMerchantRiskScore(
          transaction.merchant_info.merchant_id
        )
      };

      // Velocity features
      const velocityFeatures = await this.getVelocityFeatures(
        transaction.user_id,
        transaction.benefit_id
      );

      return {
        ...timeFeatures,
        ...amountFeatures,
        ...historicalFeatures,
        ...merchantFeatures,
        ...velocityFeatures
      };

    } finally {
      client.release();
    }
  }

  /**
   * Run ML model
   */
  runMLModel(model, features) {
    // Simplified ML prediction
    // In production, would use TensorFlow.js or similar

    let probability = 0.5;
    const importantFeatures = [];

    // Simple decision tree logic as placeholder
    if (features.is_night && features.amount > 500) {
      probability += 0.2;
      importantFeatures.push('night_large_transaction');
    }

    if (features.tx_count_24h > 20) {
      probability += 0.15;
      importantFeatures.push('high_velocity');
    }

    if (features.is_new_merchant && features.amount > features.avg_amount_7d * 3) {
      probability += 0.25;
      importantFeatures.push('new_merchant_high_amount');
    }

    if (features.merchant_risk_score > 70) {
      probability += 0.2;
      importantFeatures.push('high_risk_merchant');
    }

    return {
      probability: Math.min(probability, 0.99),
      confidence: 0.75, // Placeholder confidence
      important_features: importantFeatures
    };
  }

  /**
   * Check known frauds
   */
  async checkKnownFrauds(transaction) {
    const client = await pool.connect();
    try {
      // Check if merchant is in fraud database
      const merchantCheck = await client.query(
        `SELECT * FROM known_fraud_merchants
         WHERE merchant_id = $1 OR merchant_name ILIKE $2`,
        [transaction.merchant_info.merchant_id,
         transaction.merchant_info.merchant_name]
      );

      if (merchantCheck.rows.length > 0) {
        return {
          matched: true,
          confidence: 90,
          details: {
            type: 'KNOWN_FRAUD_MERCHANT',
            merchant: merchantCheck.rows[0]
          }
        };
      }

      // Check for similar fraud patterns
      const patternCheck = await client.query(
        `SELECT * FROM confirmed_frauds
         WHERE program_type = $1
           AND ABS(amount - $2) < 10
           AND transaction_date >= NOW() - INTERVAL '30 days'
         LIMIT 5`,
        [transaction.program_type, transaction.amount]
      );

      if (patternCheck.rows.length >= 3) {
        return {
          matched: true,
          confidence: 70,
          details: {
            type: 'SIMILAR_FRAUD_PATTERN',
            similar_frauds: patternCheck.rows.length
          }
        };
      }

      return { matched: false };

    } finally {
      client.release();
    }
  }

  /**
   * Analyze velocity
   */
  async analyzeVelocity(userId, benefitId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `WITH velocity_data AS (
          SELECT
            DATE_TRUNC('hour', transaction_date) as hour_bucket,
            COUNT(*) as tx_count,
            SUM(amount) as total_amount
          FROM benefit_transactions
          WHERE benefit_id = $1
            AND transaction_date >= NOW() - INTERVAL '24 hours'
          GROUP BY DATE_TRUNC('hour', transaction_date)
        )
        SELECT
          MAX(tx_count) as max_hourly_count,
          AVG(tx_count) as avg_hourly_count,
          STDDEV(tx_count) as stddev_hourly_count,
          SUM(total_amount) as daily_amount
        FROM velocity_data`,
        [benefitId]
      );

      const velocity = result.rows[0];

      // Check for velocity anomalies
      const maxCount = parseInt(velocity.max_hourly_count || 0);
      const avgCount = parseFloat(velocity.avg_hourly_count || 0);
      const stddev = parseFloat(velocity.stddev_hourly_count || 1);

      const anomalous = maxCount > avgCount + (3 * stddev) || maxCount > 10;

      return {
        anomalous,
        score: anomalous ? Math.min(maxCount * 2, 30) : 0,
        details: {
          max_hourly: maxCount,
          average_hourly: avgCount,
          daily_total: velocity.daily_amount
        }
      };

    } finally {
      client.release();
    }
  }

  /**
   * Detect behavior changes
   */
  detectBehaviorChanges(transaction, profile) {
    const changes = [];

    // Check spending pattern change
    if (profile.typical_amount_range) {
      const deviation = (transaction.amount - profile.typical_amount_range.avg) /
                       (profile.typical_amount_range.stddev || 1);

      if (Math.abs(deviation) > 3) {
        changes.push({
          type: 'SPENDING_PATTERN_CHANGE',
          deviation: deviation,
          severity: Math.min(Math.abs(deviation) * 5, 20)
        });
      }
    }

    // Check time pattern change
    const hour = new Date(transaction.timestamp).getHours();
    if (profile.typical_hours && !profile.typical_hours.includes(hour)) {
      changes.push({
        type: 'TIME_PATTERN_CHANGE',
        typical_hours: profile.typical_hours,
        actual_hour: hour,
        severity: 10
      });
    }

    // Check merchant pattern change
    if (profile.merchant_categories &&
        !profile.merchant_categories.includes(transaction.merchant_info.category)) {
      changes.push({
        type: 'MERCHANT_PATTERN_CHANGE',
        new_category: transaction.merchant_info.category,
        severity: 8
      });
    }

    return changes;
  }

  /**
   * Detect account takeover
   */
  async detectAccountTakeover(userId, transaction) {
    const indicators = [];
    let confidence = 0;

    const client = await pool.connect();
    try {
      // Check for sudden location change
      const locationCheck = await client.query(
        `SELECT merchant_info->>'location' as location
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND bt.transaction_date >= NOW() - INTERVAL '1 hour'
         ORDER BY bt.transaction_date DESC
         LIMIT 2`,
        [userId]
      );

      if (locationCheck.rows.length === 2) {
        const loc1 = JSON.parse(locationCheck.rows[0].location || '{}');
        const loc2 = JSON.parse(locationCheck.rows[1].location || '{}');

        if (loc1.lat && loc2.lat) {
          const distance = this.calculateDistance(
            loc1.lat, loc1.lng,
            loc2.lat, loc2.lng
          );

          if (distance > 500) { // 500 miles in 1 hour
            indicators.push('IMPOSSIBLE_TRAVEL');
            confidence += 40;
          }
        }
      }

      // Check for rapid transaction pattern change
      const patternCheck = await client.query(
        `SELECT COUNT(DISTINCT merchant_info->>'category') as categories,
                COUNT(*) as tx_count
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND bt.transaction_date >= NOW() - INTERVAL '1 hour'`,
        [userId]
      );

      const recent = patternCheck.rows[0];
      if (recent.tx_count > 5 && recent.categories > 3) {
        indicators.push('RAPID_DIVERSE_SPENDING');
        confidence += 30;
      }

      // Check for device/channel change (would need device data in production)
      // Placeholder logic
      if (transaction.metadata && transaction.metadata.new_device) {
        indicators.push('NEW_DEVICE');
        confidence += 20;
      }

    } finally {
      client.release();
    }

    return {
      detected: indicators.length > 0,
      indicators,
      confidence: Math.min(confidence, 90)
    };
  }

  /**
   * Detect benefit abuse
   */
  async detectBenefitAbuse(userId, transaction) {
    const patterns = [];
    const client = await pool.connect();

    try {
      // Check for cash-out patterns
      if (transaction.transaction_type === 'WITHDRAWAL' ||
          transaction.merchant_info.type === 'ATM') {
        const cashOutCheck = await client.query(
          `SELECT COUNT(*) as withdrawal_count,
                  SUM(amount) as total_withdrawn
           FROM benefit_transactions bt
           JOIN government_benefits gb ON bt.benefit_id = gb.id
           WHERE gb.user_id = $1
             AND (transaction_type = 'WITHDRAWAL' OR merchant_info->>'type' = 'ATM')
             AND bt.transaction_date >= NOW() - INTERVAL '7 days'`,
          [userId]
        );

        const cashOut = cashOutCheck.rows[0];
        if (cashOut.withdrawal_count > 5 || cashOut.total_withdrawn > 1000) {
          patterns.push({
            type: 'EXCESSIVE_CASH_OUT',
            count: cashOut.withdrawal_count,
            amount: cashOut.total_withdrawn,
            severity: 20
          });
        }
      }

      // Check for benefit resale patterns
      const resaleCheck = await this.checkResalePattern(userId, transaction, client);
      if (resaleCheck.detected) {
        patterns.push({
          type: 'BENEFIT_RESALE',
          pattern: resaleCheck.pattern,
          severity: 25
        });
      }

      // Check for duplicate claims
      const duplicateCheck = await client.query(
        `SELECT COUNT(*) as duplicate_count
         FROM government_benefits
         WHERE user_id = $1
           AND program_type = $2
           AND status = 'ACTIVE'`,
        [userId, transaction.program_type]
      );

      if (duplicateCheck.rows[0].duplicate_count > 1) {
        patterns.push({
          type: 'DUPLICATE_BENEFIT_CLAIM',
          count: duplicateCheck.rows[0].duplicate_count,
          severity: 30
        });
      }

    } finally {
      client.release();
    }

    return patterns;
  }

  /**
   * Detect fraud ring
   */
  async detectFraudRing(userId, client) {
    // Check for connected users with similar patterns
    const result = await client.query(
      `WITH user_merchants AS (
        SELECT DISTINCT merchant_info->>'merchant_id' as merchant_id
        FROM benefit_transactions bt
        JOIN government_benefits gb ON bt.benefit_id = gb.id
        WHERE gb.user_id = $1
          AND bt.transaction_date >= NOW() - INTERVAL '30 days'
      ),
      connected_users AS (
        SELECT DISTINCT gb.user_id
        FROM benefit_transactions bt
        JOIN government_benefits gb ON bt.benefit_id = gb.id
        WHERE merchant_info->>'merchant_id' IN (SELECT merchant_id FROM user_merchants)
          AND gb.user_id != $1
      )
      SELECT COUNT(DISTINCT cu.user_id) as connected_count,
             COUNT(DISTINCT bt.id) as shared_transactions
      FROM connected_users cu
      JOIN government_benefits gb ON cu.user_id = gb.user_id
      JOIN benefit_transactions bt ON gb.id = bt.benefit_id
      WHERE bt.transaction_date >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    const connections = result.rows[0];
    const ringDetected = connections.connected_count > 5 &&
                        connections.shared_transactions > 20;

    return {
      detected: ringDetected,
      ring_size: connections.connected_count,
      connections: connections.shared_transactions
    };
  }

  /**
   * Analyze merchant network
   */
  async analyzeMerchantNetwork(merchantId, client) {
    const result = await client.query(
      `SELECT
        COUNT(*) as total_transactions,
        COUNT(*) FILTER (WHERE status = 'BLOCKED' OR status = 'FRAUD') as fraud_count,
        COUNT(DISTINCT gb.user_id) as unique_users,
        AVG(amount) as avg_amount
       FROM benefit_transactions bt
       JOIN government_benefits gb ON bt.benefit_id = gb.id
       WHERE merchant_info->>'merchant_id' = $1
         AND bt.transaction_date >= NOW() - INTERVAL '90 days'`,
      [merchantId]
    );

    const stats = result.rows[0];
    const fraudRate = stats.total_transactions > 0 ?
      (stats.fraud_count / stats.total_transactions) : 0;

    return {
      high_risk: fraudRate > 0.1 || stats.fraud_count > 10,
      risk_score: Math.min(fraudRate * 100, 50),
      fraud_rate: fraudRate,
      connected_frauds: stats.fraud_count
    };
  }

  /**
   * Detect collusion
   */
  async detectCollusion(userId, merchantInfo, client) {
    // Check for coordinated transactions
    const result = await client.query(
      `WITH merchant_users AS (
        SELECT gb.user_id,
               DATE_TRUNC('hour', bt.transaction_date) as hour_bucket,
               COUNT(*) as tx_count
        FROM benefit_transactions bt
        JOIN government_benefits gb ON bt.benefit_id = gb.id
        WHERE merchant_info->>'merchant_id' = $1
          AND bt.transaction_date >= NOW() - INTERVAL '24 hours'
        GROUP BY gb.user_id, DATE_TRUNC('hour', bt.transaction_date)
      )
      SELECT hour_bucket,
             COUNT(DISTINCT user_id) as user_count,
             SUM(tx_count) as total_tx
      FROM merchant_users
      GROUP BY hour_bucket
      HAVING COUNT(DISTINCT user_id) > 3`,
      [merchantInfo.merchant_id]
    );

    const collusionDetected = result.rows.length > 0 &&
      result.rows.some(r => r.user_count > 5 && r.total_tx > 10);

    return {
      detected: collusionDetected,
      pattern: collusionDetected ? 'COORDINATED_TRANSACTIONS' : null,
      participants: collusionDetected ? result.rows[0].user_count : 0
    };
  }

  /**
   * Check resale pattern
   */
  async checkResalePattern(userId, transaction, client) {
    // Check for buy-sell patterns indicative of benefit resale
    const result = await client.query(
      `SELECT
        COUNT(*) FILTER (WHERE merchant_info->>'category' = 'GROCERY') as grocery_count,
        COUNT(*) FILTER (WHERE transaction_type = 'WITHDRAWAL') as withdrawal_count,
        MAX(amount) FILTER (WHERE merchant_info->>'category' = 'GROCERY') as max_grocery,
        SUM(amount) FILTER (WHERE transaction_type = 'WITHDRAWAL') as total_withdrawn
       FROM benefit_transactions bt
       JOIN government_benefits gb ON bt.benefit_id = gb.id
       WHERE gb.user_id = $1
         AND gb.program_type = 'SNAP'
         AND bt.transaction_date >= NOW() - INTERVAL '7 days'`,
      [userId]
    );

    const stats = result.rows[0];
    const detected = stats.grocery_count > 3 &&
                    stats.withdrawal_count > 2 &&
                    stats.max_grocery > 200;

    return {
      detected,
      pattern: detected ? {
        grocery_transactions: stats.grocery_count,
        withdrawals: stats.withdrawal_count,
        max_amount: stats.max_grocery
      } : null
    };
  }

  /**
   * Load user profile
   */
  async loadUserProfile(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
          AVG(amount) as avg_amount,
          STDDEV(amount) as stddev_amount,
          MIN(amount) as min_amount,
          MAX(amount) as max_amount,
          ARRAY_AGG(DISTINCT EXTRACT(HOUR FROM transaction_date)) as typical_hours,
          ARRAY_AGG(DISTINCT merchant_info->>'category') as merchant_categories
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND bt.status = 'COMPLETED'
           AND bt.transaction_date >= NOW() - INTERVAL '90 days'`,
        [userId]
      );

      const stats = result.rows[0];

      return {
        user_id: userId,
        typical_amount_range: {
          min: stats.min_amount || 0,
          max: stats.max_amount || 1000,
          avg: stats.avg_amount || 100,
          stddev: stats.stddev_amount || 50
        },
        typical_hours: stats.typical_hours || [],
        merchant_categories: stats.merchant_categories || [],
        last_updated: new Date()
      };

    } finally {
      client.release();
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, detectionResult) {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Update risk score
    profile.risk_score = (profile.risk_score || 0) * 0.9 +
                        detectionResult.fraud_score * 0.1;

    // Update last detection
    profile.last_detection = detectionResult;
    profile.last_updated = new Date();

    this.userProfiles.set(userId, profile);
  }

  /**
   * Calculate pattern score
   */
  calculatePatternScore(patterns) {
    return patterns.reduce((total, pattern) => {
      const weight = pattern.risk_level === 'HIGH' ? 20 :
                    pattern.risk_level === 'MEDIUM' ? 10 : 5;
      return total + (weight * pattern.confidence / 100);
    }, 0);
  }

  /**
   * Get transaction frequency
   */
  async getTransactionFrequency(userId, timeWindow) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*) as count
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND bt.transaction_date >= NOW() - INTERVAL '%s'`,
        [userId, timeWindow]
      );

      return parseInt(result.rows[0].count);

    } finally {
      client.release();
    }
  }

  /**
   * Check location rule
   */
  async checkLocationRule(rule, location) {
    if (!location) return false;

    const loc = JSON.parse(location);

    switch (rule.condition) {
      case 'OUTSIDE_RADIUS':
        return this.calculateDistance(
          loc.lat, loc.lng,
          rule.center_lat, rule.center_lng
        ) > rule.radius;

      case 'HIGH_RISK_AREA':
        return rule.areas.some(area =>
          loc.zip_code === area || loc.city === area
        );

      default:
        return false;
    }
  }

  /**
   * Check sequence rule
   */
  async checkSequenceRule(rule, transaction) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT merchant_info->>'category' as category
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
         ORDER BY bt.transaction_date DESC
         LIMIT $2`,
        [transaction.user_id, rule.sequence_length]
      );

      const sequence = result.rows.map(r => r.category).join('-');
      return rule.patterns.some(p => sequence.includes(p));

    } finally {
      client.release();
    }
  }

  /**
   * Calculate category deviation
   */
  async calculateCategoryDeviation(userId, category, client) {
    const result = await client.query(
      `SELECT
        COUNT(*) FILTER (WHERE merchant_info->>'category' = $2) as category_count,
        COUNT(*) as total_count
       FROM benefit_transactions bt
       JOIN government_benefits gb ON bt.benefit_id = gb.id
       WHERE gb.user_id = $1
         AND bt.transaction_date >= NOW() - INTERVAL '90 days'`,
      [userId, category]
    );

    const stats = result.rows[0];
    const frequency = stats.total_count > 0 ?
      stats.category_count / stats.total_count : 0;

    return {
      rare: frequency < 0.05 && stats.total_count > 20,
      frequency
    };
  }

  /**
   * Encode merchant category
   */
  encodeMerchantCategory(category) {
    const categories = {
      'GROCERY': 1,
      'RESTAURANT': 2,
      'GAS': 3,
      'RETAIL': 4,
      'ENTERTAINMENT': 5,
      'HEALTHCARE': 6,
      'EDUCATION': 7,
      'UTILITIES': 8,
      'OTHER': 9
    };

    return categories[category] || 9;
  }

  /**
   * Check if new merchant
   */
  async isNewMerchant(userId, merchantId) {
    if (!merchantId) return true;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*) as count
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND merchant_info->>'merchant_id' = $2
           AND bt.transaction_date < NOW() - INTERVAL '1 day'`,
        [userId, merchantId]
      );

      return result.rows[0].count === 0;

    } finally {
      client.release();
    }
  }

  /**
   * Get merchant risk score
   */
  async getMerchantRiskScore(merchantId) {
    if (!merchantId) return 50;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT risk_score FROM merchant_risk_profiles
         WHERE merchant_id = $1`,
        [merchantId]
      );

      return result.rows.length > 0 ? result.rows[0].risk_score : 30;

    } finally {
      client.release();
    }
  }

  /**
   * Get velocity features
   */
  async getVelocityFeatures(userId, benefitId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
          COUNT(*) FILTER (WHERE transaction_date >= NOW() - INTERVAL '1 hour') as tx_count_1h,
          COUNT(*) FILTER (WHERE transaction_date >= NOW() - INTERVAL '24 hours') as tx_count_24h,
          SUM(amount) FILTER (WHERE transaction_date >= NOW() - INTERVAL '24 hours') as amount_24h
         FROM benefit_transactions
         WHERE benefit_id = $1`,
        [benefitId]
      );

      return result.rows[0];

    } finally {
      client.release();
    }
  }

  /**
   * Store detection result
   */
  async storeDetectionResult(result) {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO fraud_detection_results
         (transaction_id, fraud_score, patterns_matched, ml_predictions,
          risk_factors, recommended_action, detected_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [result.transaction_id, result.fraud_score,
         JSON.stringify(result.patterns_matched),
         JSON.stringify(result.ml_predictions),
         JSON.stringify(result.risk_factors),
         result.recommended_action]
      );

      // Cache recent detection
      this.detectedFrauds.set(result.transaction_id, result);

    } finally {
      client.release();
    }
  }

  /**
   * Load fraud patterns
   */
  async loadFraudPatterns() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM fraud_patterns WHERE active = true`
      );

      for (const row of result.rows) {
        this.patterns.set(row.id, {
          name: row.name,
          type: row.pattern_type,
          rules: row.rules,
          threshold: row.threshold || 70,
          risk_level: row.risk_level
        });
      }

      console.log(`Loaded ${this.patterns.size} fraud patterns`);

    } catch (error) {
      console.error('Error loading fraud patterns:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Load ML models
   */
  async loadMLModels() {
    // In production, would load actual ML models
    // Using placeholder models for now

    this.models.set('GENERAL', {
      name: 'GeneralFraudDetection',
      version: '1.0.0',
      type: 'RANDOM_FOREST'
    });

    this.models.set('SNAP', {
      name: 'SNAPFraudDetection',
      version: '1.0.0',
      type: 'NEURAL_NETWORK'
    });

    console.log(`Loaded ${this.models.size} ML models`);
  }

  /**
   * Load historical data
   */
  async loadHistoricalData() {
    const client = await pool.connect();
    try {
      // Load confirmed frauds for pattern learning
      const result = await client.query(
        `SELECT * FROM confirmed_frauds
         WHERE confirmed_at >= NOW() - INTERVAL '180 days'
         LIMIT 1000`
      );

      console.log(`Loaded ${result.rows.length} historical fraud cases`);

    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Start real-time detection
   */
  startRealTimeDetection() {
    this.isActive = true;
    console.log('Real-time fraud detection started');
  }

  /**
   * Schedule pattern updates
   */
  schedulePatternUpdates() {
    // Reload patterns every hour
    setInterval(() => this.loadFraudPatterns(), 3600000);

    // Update ML models daily
    setInterval(() => this.loadMLModels(), 86400000);

    // Clean up old cached data
    setInterval(() => this.cleanupCache(), 1800000);
  }

  /**
   * Clean up cache
   */
  cleanupCache() {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    // Clean user profiles
    for (const [userId, profile] of this.userProfiles) {
      if (now - profile.last_updated > maxAge) {
        this.userProfiles.delete(userId);
      }
    }

    // Clean detection results
    for (const [txId, result] of this.detectedFrauds) {
      if (now - result.timestamp > maxAge) {
        this.detectedFrauds.delete(txId);
      }
    }
  }

  /**
   * Calculate distance
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
   * Convert to radians
   */
  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Shutdown
   */
  shutdown() {
    console.log('Shutting down Fraud Detection Patterns Engine');
    this.isActive = false;
    this.patterns.clear();
    this.models.clear();
    this.detectedFrauds.clear();
    this.userProfiles.clear();
    this.merchantProfiles.clear();
  }
}

// Export singleton instance
export default new FraudDetectionPatterns();