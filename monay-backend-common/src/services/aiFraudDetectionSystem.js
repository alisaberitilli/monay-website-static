import EventEmitter from 'events';
import { Pool } from 'pg';
import crypto from 'crypto';

class AIFraudDetectionSystem extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Risk thresholds
    this.riskThresholds = {
      LOW: 0.3,
      MEDIUM: 0.6,
      HIGH: 0.8,
      CRITICAL: 0.95
    };

    // Fraud patterns
    this.fraudPatterns = {
      VELOCITY: 'velocity_abuse',
      AMOUNT: 'unusual_amount',
      LOCATION: 'location_anomaly',
      DEVICE: 'device_mismatch',
      PATTERN: 'behavioral_pattern',
      MERCHANT: 'suspicious_merchant',
      TIME: 'unusual_timing',
      NETWORK: 'network_anomaly'
    };

    // ML model configurations
    this.modelConfigs = {
      REAL_TIME: {
        threshold: 0.7,
        features: ['amount', 'velocity', 'location', 'device', 'time'],
        weight: 0.4
      },
      BEHAVIORAL: {
        threshold: 0.6,
        features: ['pattern', 'history', 'profile'],
        weight: 0.3
      },
      NETWORK: {
        threshold: 0.8,
        features: ['graph', 'connections', 'clusters'],
        weight: 0.3
      }
    };
  }

  /**
   * Analyze transaction for fraud risk
   */
  async analyzeTransaction(transactionData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get user behavior profile
      const behaviorProfile = await this.getUserBehaviorProfile(
        transactionData.userId,
        client
      );

      // Calculate individual risk scores
      const velocityRisk = await this.calculateVelocityRisk(transactionData, client);
      const amountRisk = await this.calculateAmountRisk(transactionData, behaviorProfile);
      const locationRisk = await this.calculateLocationRisk(transactionData, behaviorProfile, client);
      const deviceRisk = await this.calculateDeviceRisk(transactionData, client);
      const patternRisk = await this.calculatePatternRisk(transactionData, behaviorProfile);
      const merchantRisk = await this.calculateMerchantRisk(transactionData, client);
      const timeRisk = await this.calculateTimeRisk(transactionData, behaviorProfile);
      const networkRisk = await this.calculateNetworkRisk(transactionData, client);

      // Combine scores using weighted average
      const riskComponents = {
        velocity: { score: velocityRisk, weight: 0.15 },
        amount: { score: amountRisk, weight: 0.20 },
        location: { score: locationRisk, weight: 0.15 },
        device: { score: deviceRisk, weight: 0.10 },
        pattern: { score: patternRisk, weight: 0.15 },
        merchant: { score: merchantRisk, weight: 0.10 },
        time: { score: timeRisk, weight: 0.05 },
        network: { score: networkRisk, weight: 0.10 }
      };

      const overallRiskScore = this.calculateWeightedRiskScore(riskComponents);

      // Apply ML model predictions if available
      const mlPrediction = await this.getMLPrediction(transactionData, client);
      const finalRiskScore = mlPrediction
        ? (overallRiskScore * 0.6 + mlPrediction * 0.4)
        : overallRiskScore;

      // Determine risk level and action
      const riskLevel = this.determineRiskLevel(finalRiskScore);
      const action = this.determineAction(finalRiskScore, transactionData);

      // Identify anomalies and risk factors
      const anomalies = this.identifyAnomalies(riskComponents);
      const riskFactors = this.extractRiskFactors(riskComponents, behaviorProfile);

      // Store fraud detection result
      const detectionResult = await this.storeFraudDetectionResult({
        transactionId: transactionData.transactionId,
        userId: transactionData.userId,
        overallRiskScore: finalRiskScore,
        fraudProbability: finalRiskScore,
        anomalyScore: this.calculateAnomalyScore(anomalies),
        riskFactors,
        anomalyReasons: anomalies,
        riskLevel,
        actionTaken: action,
        modelVersion: '1.0.0'
      }, client);

      // Update behavior profile
      await this.updateBehaviorProfile(transactionData, client);

      // Trigger alerts if necessary
      if (riskLevel === 'high' || riskLevel === 'critical') {
        await this.triggerFraudAlert(transactionData, finalRiskScore, riskFactors, client);
      }

      await client.query('COMMIT');

      this.emit('fraudAnalysisComplete', {
        transactionId: transactionData.transactionId,
        riskScore: finalRiskScore,
        riskLevel,
        action
      });

      return {
        success: true,
        riskScore: finalRiskScore,
        riskLevel,
        action,
        riskFactors,
        anomalies,
        requiresReview: action === 'review',
        breakdown: riskComponents
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error analyzing transaction:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Calculate velocity risk
   */
  async calculateVelocityRisk(transaction, client) {
    // Check transaction velocity in different time windows
    const velocityChecks = await Promise.all([
      this.checkVelocity(transaction.userId, '1 hour', 5, client),
      this.checkVelocity(transaction.userId, '24 hours', 20, client),
      this.checkVelocity(transaction.userId, '7 days', 100, client)
    ]);

    // Calculate velocity score
    let riskScore = 0;

    if (velocityChecks[0].exceeded) riskScore += 0.4;
    if (velocityChecks[1].exceeded) riskScore += 0.3;
    if (velocityChecks[2].exceeded) riskScore += 0.3;

    // Check for sudden spike in activity
    const spikeRisk = await this.detectActivitySpike(transaction.userId, client);
    riskScore = Math.min(1, riskScore + spikeRisk * 0.2);

    return riskScore;
  }

  /**
   * Check velocity in time window
   */
  async checkVelocity(userId, timeWindow, threshold, client) {
    const query = `
      SELECT COUNT(*) as count,
             SUM(amount) as total_amount
      FROM transactions
      WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '${timeWindow}'
    `;

    const result = await client.query(query, [userId]);
    const count = parseInt(result.rows[0].count);
    const totalAmount = parseFloat(result.rows[0].total_amount || 0);

    return {
      count,
      totalAmount,
      exceeded: count > threshold
    };
  }

  /**
   * Detect activity spike
   */
  async detectActivitySpike(userId, client) {
    const query = `
      WITH hourly_counts AS (
        SELECT DATE_TRUNC('hour', created_at) as hour,
               COUNT(*) as tx_count
        FROM transactions
        WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('hour', created_at)
      ),
      stats AS (
        SELECT AVG(tx_count) as avg_count,
               STDDEV(tx_count) as std_dev
        FROM hourly_counts
      )
      SELECT
        (SELECT COUNT(*) FROM transactions
         WHERE user_id = $1
         AND created_at > NOW() - INTERVAL '1 hour') as current_count,
        avg_count,
        std_dev
      FROM stats
    `;

    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) return 0;

    const { current_count, avg_count, std_dev } = result.rows[0];

    if (std_dev === 0) return 0;

    // Calculate z-score
    const zScore = (current_count - avg_count) / std_dev;

    // Convert to risk score (0-1)
    return Math.min(1, Math.max(0, (zScore - 2) / 4));
  }

  /**
   * Calculate amount risk
   */
  calculateAmountRisk(transaction, behaviorProfile) {
    if (!behaviorProfile) return 0.5;

    const amount = transaction.amount;
    const avgAmount = behaviorProfile.avg_transaction_amount || 0;
    const stdDev = behaviorProfile.std_dev_amount || 1;

    // Calculate z-score
    const zScore = Math.abs((amount - avgAmount) / stdDev);

    // High risk for amounts > 3 standard deviations
    if (zScore > 3) return 0.9;
    if (zScore > 2) return 0.6;
    if (zScore > 1) return 0.3;

    return 0.1;
  }

  /**
   * Calculate location risk
   */
  async calculateLocationRisk(transaction, behaviorProfile, client) {
    if (!transaction.location) return 0;

    // Check if location is typical
    const typicalLocations = behaviorProfile?.typical_locations || [];
    const isTypical = typicalLocations.some(loc =>
      this.isNearbyLocation(transaction.location, loc)
    );

    if (isTypical) return 0;

    // Check for impossible travel
    const impossibleTravel = await this.checkImpossibleTravel(
      transaction.userId,
      transaction.location,
      transaction.timestamp,
      client
    );

    if (impossibleTravel) return 0.95;

    // Check if location is high-risk
    const isHighRisk = await this.isHighRiskLocation(transaction.location);
    if (isHighRisk) return 0.7;

    return 0.4;
  }

  /**
   * Check for impossible travel
   */
  async checkImpossibleTravel(userId, currentLocation, timestamp, client) {
    const query = `
      SELECT location, created_at
      FROM transactions
      WHERE user_id = $1
      AND created_at < $2
      AND created_at > $2::timestamp - INTERVAL '6 hours'
      AND location IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await client.query(query, [userId, timestamp]);

    if (result.rows.length === 0) return false;

    const previousLocation = result.rows[0].location;
    const previousTime = result.rows[0].created_at;

    const distance = this.calculateDistance(currentLocation, previousLocation);
    const timeDiff = (timestamp - previousTime) / (1000 * 60 * 60); // hours

    // Impossible if traveling > 500 mph
    const speed = distance / timeDiff;
    return speed > 500;
  }

  /**
   * Calculate device risk
   */
  async calculateDeviceRisk(transaction, client) {
    if (!transaction.deviceId) return 0;

    // Check if device is known
    const deviceQuery = `
      SELECT COUNT(*) as usage_count,
             MIN(created_at) as first_seen
      FROM transactions
      WHERE user_id = $1
      AND device_id = $2
    `;

    const result = await client.query(deviceQuery, [
      transaction.userId,
      transaction.deviceId
    ]);

    const usageCount = parseInt(result.rows[0].usage_count);
    const firstSeen = result.rows[0].first_seen;

    // New device risk
    if (usageCount === 0) return 0.7;

    // Recently added device (within 24 hours)
    const hoursSinceFirst = (new Date() - firstSeen) / (1000 * 60 * 60);
    if (hoursSinceFirst < 24) return 0.5;

    // Check for device sharing
    const sharingQuery = `
      SELECT COUNT(DISTINCT user_id) as user_count
      FROM transactions
      WHERE device_id = $1
      AND created_at > NOW() - INTERVAL '30 days'
    `;

    const sharingResult = await client.query(sharingQuery, [transaction.deviceId]);
    const userCount = parseInt(sharingResult.rows[0].user_count);

    if (userCount > 3) return 0.8;
    if (userCount > 1) return 0.4;

    return 0.1;
  }

  /**
   * Calculate pattern risk
   */
  calculatePatternRisk(transaction, behaviorProfile) {
    if (!behaviorProfile) return 0.5;

    let riskScore = 0;

    // Check time pattern
    const hour = new Date(transaction.timestamp).getHours();
    const typicalHours = behaviorProfile.typical_time_of_day || {};

    if (!typicalHours[hour] || typicalHours[hour] < 0.05) {
      riskScore += 0.3;
    }

    // Check day pattern
    const dayOfWeek = new Date(transaction.timestamp).getDay();
    const typicalDays = behaviorProfile.typical_day_of_week || {};

    if (!typicalDays[dayOfWeek] || typicalDays[dayOfWeek] < 0.05) {
      riskScore += 0.2;
    }

    // Check category pattern
    if (transaction.category) {
      const typicalCategories = behaviorProfile.typical_categories || [];
      if (!typicalCategories.includes(transaction.category)) {
        riskScore += 0.3;
      }
    }

    return Math.min(1, riskScore);
  }

  /**
   * Calculate merchant risk
   */
  async calculateMerchantRisk(transaction, client) {
    if (!transaction.merchantId) return 0;

    // Check merchant fraud history
    const fraudQuery = `
      SELECT COUNT(*) as fraud_count,
             COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as recent_fraud
      FROM fraud_detection_scores
      WHERE merchant_id = $1
      AND risk_level IN ('high', 'critical')
      AND true_fraud = true
    `;

    const fraudResult = await client.query(fraudQuery, [transaction.merchantId]);
    const fraudCount = parseInt(fraudResult.rows[0].fraud_count);
    const recentFraud = parseInt(fraudResult.rows[0].recent_fraud);

    if (recentFraud > 5) return 0.9;
    if (fraudCount > 10) return 0.7;
    if (fraudCount > 3) return 0.4;

    // Check if merchant is new
    const merchantAge = await this.getMerchantAge(transaction.merchantId, client);
    if (merchantAge < 30) return 0.5; // New merchant risk

    return 0.1;
  }

  /**
   * Calculate time risk
   */
  calculateTimeRisk(transaction, behaviorProfile) {
    const hour = new Date(transaction.timestamp).getHours();

    // High risk hours (2 AM - 5 AM)
    if (hour >= 2 && hour <= 5) {
      // Check if user typically transacts at this time
      const typicalHours = behaviorProfile?.typical_time_of_day || {};
      if (!typicalHours[hour] || typicalHours[hour] < 0.02) {
        return 0.7;
      }
    }

    return 0;
  }

  /**
   * Calculate network risk
   */
  async calculateNetworkRisk(transaction, client) {
    // Check for connected fraudulent accounts
    const networkQuery = `
      WITH connected_users AS (
        SELECT DISTINCT user_id
        FROM transactions
        WHERE (device_id = $1 OR ip_address = $2)
        AND user_id != $3
        AND created_at > NOW() - INTERVAL '30 days'
      )
      SELECT COUNT(*) as fraud_connections
      FROM connected_users cu
      JOIN fraud_detection_scores fds ON cu.user_id = fds.user_id
      WHERE fds.risk_level IN ('high', 'critical')
      AND fds.created_at > NOW() - INTERVAL '30 days'
    `;

    const result = await client.query(networkQuery, [
      transaction.deviceId,
      transaction.ipAddress,
      transaction.userId
    ]);

    const fraudConnections = parseInt(result.rows[0].fraud_connections);

    if (fraudConnections > 3) return 0.9;
    if (fraudConnections > 1) return 0.6;
    if (fraudConnections > 0) return 0.3;

    return 0;
  }

  /**
   * Get user behavior profile
   */
  async getUserBehaviorProfile(userId, client) {
    const query = `
      SELECT * FROM customer_behavior_profiles
      WHERE user_id = $1
    `;

    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
      // Create new profile if doesn't exist
      await this.createBehaviorProfile(userId, client);
      return null;
    }

    return result.rows[0];
  }

  /**
   * Create behavior profile
   */
  async createBehaviorProfile(userId, client) {
    const query = `
      INSERT INTO customer_behavior_profiles (
        id, user_id,
        avg_transaction_amount, std_dev_amount,
        typical_merchants, typical_categories,
        typical_time_of_day, typical_day_of_week
      ) VALUES ($1, $2, 0, 1, '[]', '[]', '{}', '{}')
      ON CONFLICT (user_id) DO NOTHING
    `;

    await client.query(query, [crypto.randomUUID(), userId]);
  }

  /**
   * Update behavior profile
   */
  async updateBehaviorProfile(transaction, client) {
    // This would be done asynchronously in production
    // Simplified version for demonstration
    const updateQuery = `
      UPDATE customer_behavior_profiles
      SET last_updated = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `;

    await client.query(updateQuery, [transaction.userId]);
  }

  /**
   * Calculate weighted risk score
   */
  calculateWeightedRiskScore(components) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [key, component] of Object.entries(components)) {
      totalScore += component.score * component.weight;
      totalWeight += component.weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Get ML model prediction
   */
  async getMLPrediction(transaction, client) {
    // In production, this would call actual ML model
    // Simulated prediction based on transaction features

    const features = {
      amount: transaction.amount,
      hour: new Date(transaction.timestamp).getHours(),
      dayOfWeek: new Date(transaction.timestamp).getDay(),
      isWeekend: [0, 6].includes(new Date(transaction.timestamp).getDay()),
      merchantRisk: await this.getMerchantRiskScore(transaction.merchantId, client)
    };

    // Simulated model prediction
    let prediction = 0.3;

    if (features.amount > 5000) prediction += 0.2;
    if (features.hour >= 2 && features.hour <= 5) prediction += 0.15;
    if (features.isWeekend) prediction += 0.1;
    if (features.merchantRisk > 0.5) prediction += 0.2;

    return Math.min(1, prediction);
  }

  /**
   * Get merchant risk score
   */
  async getMerchantRiskScore(merchantId, client) {
    if (!merchantId) return 0.5;

    const query = `
      SELECT AVG(overall_risk_score) as avg_risk
      FROM fraud_detection_scores
      WHERE merchant_id = $1
      AND created_at > NOW() - INTERVAL '90 days'
    `;

    const result = await client.query(query, [merchantId]);
    return result.rows[0]?.avg_risk || 0.5;
  }

  /**
   * Get merchant age in days
   */
  async getMerchantAge(merchantId, client) {
    const query = `
      SELECT MIN(created_at) as first_transaction
      FROM transactions
      WHERE merchant_id = $1
    `;

    const result = await client.query(query, [merchantId]);

    if (!result.rows[0]?.first_transaction) return 0;

    const ageInMs = new Date() - new Date(result.rows[0].first_transaction);
    return Math.floor(ageInMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Determine risk level
   */
  determineRiskLevel(riskScore) {
    if (riskScore >= this.riskThresholds.CRITICAL) return 'critical';
    if (riskScore >= this.riskThresholds.HIGH) return 'high';
    if (riskScore >= this.riskThresholds.MEDIUM) return 'medium';
    if (riskScore >= this.riskThresholds.LOW) return 'low';
    return 'minimal';
  }

  /**
   * Determine action based on risk
   */
  determineAction(riskScore, transaction) {
    if (riskScore >= this.riskThresholds.CRITICAL) return 'declined';
    if (riskScore >= this.riskThresholds.HIGH) return 'review';
    if (riskScore >= this.riskThresholds.MEDIUM && transaction.amount > 1000) return 'challenge';
    return 'approved';
  }

  /**
   * Identify anomalies
   */
  identifyAnomalies(riskComponents) {
    const anomalies = [];

    for (const [key, component] of Object.entries(riskComponents)) {
      if (component.score > 0.7) {
        anomalies.push({
          type: key,
          score: component.score,
          severity: component.score > 0.9 ? 'critical' : 'high'
        });
      }
    }

    return anomalies;
  }

  /**
   * Extract risk factors
   */
  extractRiskFactors(riskComponents, behaviorProfile) {
    const factors = [];

    for (const [key, component] of Object.entries(riskComponents)) {
      if (component.score > 0.5) {
        factors.push({
          factor: key,
          score: component.score,
          description: this.getRiskFactorDescription(key, component.score)
        });
      }
    }

    return factors;
  }

  /**
   * Get risk factor description
   */
  getRiskFactorDescription(factor, score) {
    const descriptions = {
      velocity: `High transaction velocity detected (risk: ${(score * 100).toFixed(1)}%)`,
      amount: `Unusual transaction amount (risk: ${(score * 100).toFixed(1)}%)`,
      location: `Location anomaly detected (risk: ${(score * 100).toFixed(1)}%)`,
      device: `Device risk identified (risk: ${(score * 100).toFixed(1)}%)`,
      pattern: `Behavioral pattern mismatch (risk: ${(score * 100).toFixed(1)}%)`,
      merchant: `Merchant risk factors present (risk: ${(score * 100).toFixed(1)}%)`,
      time: `Unusual transaction timing (risk: ${(score * 100).toFixed(1)}%)`,
      network: `Network fraud indicators (risk: ${(score * 100).toFixed(1)}%)`
    };

    return descriptions[factor] || `Risk factor: ${factor}`;
  }

  /**
   * Calculate anomaly score
   */
  calculateAnomalyScore(anomalies) {
    if (anomalies.length === 0) return 0;

    const totalScore = anomalies.reduce((sum, a) => sum + a.score, 0);
    return Math.min(1, totalScore / anomalies.length);
  }

  /**
   * Store fraud detection result
   */
  async storeFraudDetectionResult(data, client) {
    const query = `
      INSERT INTO fraud_detection_scores (
        id, transaction_id, user_id,
        overall_risk_score, fraud_probability, anomaly_score,
        risk_factors, anomaly_reasons,
        risk_level, action_taken,
        model_version, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      RETURNING id
    `;

    const result = await client.query(query, [
      crypto.randomUUID(),
      data.transactionId,
      data.userId,
      data.overallRiskScore,
      data.fraudProbability,
      data.anomalyScore,
      JSON.stringify(data.riskFactors),
      JSON.stringify(data.anomalyReasons),
      data.riskLevel,
      data.actionTaken,
      data.modelVersion
    ]);

    return result.rows[0].id;
  }

  /**
   * Trigger fraud alert
   */
  async triggerFraudAlert(transaction, riskScore, riskFactors, client) {
    const alertQuery = `
      INSERT INTO anomaly_detection_events (
        id, entity_type, entity_id,
        anomaly_type, anomaly_score,
        context_data, alert_raised,
        detected_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `;

    await client.query(alertQuery, [
      crypto.randomUUID(),
      'transaction',
      transaction.transactionId,
      'fraud_detection',
      riskScore,
      JSON.stringify({ transaction, riskFactors }),
      true
    ]);

    this.emit('fraudAlert', {
      transactionId: transaction.transactionId,
      userId: transaction.userId,
      riskScore,
      riskFactors
    });
  }

  /**
   * Check if locations are nearby
   */
  isNearbyLocation(loc1, loc2, thresholdKm = 50) {
    const distance = this.calculateDistance(loc1, loc2);
    return distance <= thresholdKm;
  }

  /**
   * Calculate distance between locations
   */
  calculateDistance(loc1, loc2) {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLon = this.toRad(loc2.lon - loc1.lon);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(loc1.lat)) * Math.cos(this.toRad(loc2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Check if location is high risk
   */
  async isHighRiskLocation(location) {
    // In production, check against database of high-risk locations
    // Simplified version
    const highRiskCountries = ['XX', 'YY', 'ZZ']; // Example country codes
    return location.country && highRiskCountries.includes(location.country);
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

export default AIFraudDetectionSystem;