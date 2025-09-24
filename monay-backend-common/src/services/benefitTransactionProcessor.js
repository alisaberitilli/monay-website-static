const pool = require('../models');
const BusinessRuleEngine = require('./businessRuleEngine');
const MonayFiatRailsClient = require('./monayFiatRailsClient');
const BenefitBalanceTracker = require('./benefitBalanceTracker');
const EventEmitter = require('events');
const crypto = require('crypto');

class BenefitTransactionProcessor extends EventEmitter {
  constructor() {
    super();
    this.fiatRailsClient = new MonayFiatRailsClient();
    this.processingQueue = [];
    this.authorizationCache = new Map();
    this.fraudPatterns = new Map();
    this.velocityTrackers = new Map();
    this.isProcessing = false;
  }

  /**
   * Initialize the transaction processor
   */
  async initialize() {
    console.log('Initializing Benefit Transaction Processor...');

    // Load fraud patterns
    await this.loadFraudPatterns();

    // Start queue processor
    this.startQueueProcessor();

    // Schedule cleanup jobs
    this.scheduleCleanup();

    console.log('Benefit Transaction Processor initialized');
  }

  /**
   * Process a benefit transaction with full validation
   */
  async processTransaction(transactionData) {
    const {
      benefit_id,
      user_id,
      program_type,
      amount,
      merchant_info,
      transaction_type,
      payment_method,
      metadata = {}
    } = transactionData;

    const transactionId = this.generateTransactionId();

    try {
      // Step 1: Pre-authorization checks
      const preAuthResult = await this.performPreAuthorization(
        benefit_id,
        user_id,
        program_type,
        amount,
        merchant_info
      );

      if (!preAuthResult.approved) {
        return {
          success: false,
          transaction_id: transactionId,
          reason: preAuthResult.reason,
          code: preAuthResult.code
        };
      }

      // Step 2: Track pending transaction
      await BenefitBalanceTracker.trackPendingTransaction(
        benefit_id,
        transactionId,
        amount,
        transaction_type
      );

      // Step 3: Fraud detection
      const fraudCheck = await this.performFraudCheck(
        user_id,
        benefit_id,
        amount,
        merchant_info,
        metadata
      );

      if (fraudCheck.suspicious) {
        await this.flagSuspiciousTransaction(
          transactionId,
          fraudCheck.reasons,
          transactionData
        );

        if (fraudCheck.block) {
          await BenefitBalanceTracker.releasePendingTransaction(benefit_id, transactionId);
          return {
            success: false,
            transaction_id: transactionId,
            reason: 'Transaction flagged by fraud detection',
            code: 'FRAUD_DETECTED'
          };
        }
      }

      // Step 4: Velocity checks
      const velocityCheck = await this.performVelocityCheck(
        benefit_id,
        program_type,
        amount
      );

      if (!velocityCheck.passed) {
        await BenefitBalanceTracker.releasePendingTransaction(benefit_id, transactionId);
        return {
          success: false,
          transaction_id: transactionId,
          reason: velocityCheck.reason,
          code: 'VELOCITY_EXCEEDED'
        };
      }

      // Step 5: Business rule validation
      const ruleValidation = await BusinessRuleEngine.validateBenefitTransaction(
        { id: benefit_id, program_type },
        {
          amount,
          merchant_info,
          transaction_type,
          user_id
        }
      );

      if (!ruleValidation.approved) {
        await BenefitBalanceTracker.releasePendingTransaction(benefit_id, transactionId);
        return {
          success: false,
          transaction_id: transactionId,
          reason: ruleValidation.reasons.join(', '),
          code: ruleValidation.code
        };
      }

      // Step 6: Process payment through appropriate rail
      const paymentResult = await this.processPayment(
        transactionId,
        amount,
        merchant_info,
        payment_method,
        metadata
      );

      if (!paymentResult.success) {
        await BenefitBalanceTracker.releasePendingTransaction(benefit_id, transactionId);
        return {
          success: false,
          transaction_id: transactionId,
          reason: 'Payment processing failed',
          code: 'PAYMENT_FAILED'
        };
      }

      // Step 7: Record transaction in database
      const recordResult = await this.recordTransaction(
        transactionId,
        benefit_id,
        user_id,
        program_type,
        amount,
        merchant_info,
        transaction_type,
        paymentResult.rails_transaction_id,
        ruleValidation.authorization_code
      );

      // Step 8: Confirm transaction and update balance
      await BenefitBalanceTracker.confirmTransaction(benefit_id, transactionId, amount);

      // Step 9: Post-transaction processing
      await this.performPostTransactionProcessing(
        transactionId,
        benefit_id,
        user_id,
        amount,
        merchant_info
      );

      // Emit success event
      this.emit('transaction_completed', {
        transaction_id: transactionId,
        benefit_id,
        user_id,
        amount,
        merchant_info
      });

      return {
        success: true,
        transaction_id: transactionId,
        authorization_code: ruleValidation.authorization_code,
        rails_transaction_id: paymentResult.rails_transaction_id,
        balance_after: recordResult.balance_after,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Transaction processing error:', error);

      // Release pending transaction on error
      await BenefitBalanceTracker.releasePendingTransaction(benefit_id, transactionId);

      // Record failed transaction
      await this.recordFailedTransaction(
        transactionId,
        benefit_id,
        user_id,
        amount,
        error.message
      );

      return {
        success: false,
        transaction_id: transactionId,
        reason: 'Transaction processing error',
        code: 'PROCESSING_ERROR'
      };
    }
  }

  /**
   * Perform pre-authorization checks
   */
  async performPreAuthorization(benefitId, userId, programType, amount, merchantInfo) {
    const client = await pool.connect();
    try {
      // Check benefit status
      const benefitResult = await client.query(
        `SELECT * FROM government_benefits
         WHERE id = $1 AND user_id = $2 AND status = 'ACTIVE'`,
        [benefitId, userId]
      );

      if (benefitResult.rows.length === 0) {
        return {
          approved: false,
          reason: 'Benefit not found or inactive',
          code: 'BENEFIT_INACTIVE'
        };
      }

      const benefit = benefitResult.rows[0];

      // Check balance
      if (benefit.balance_amount < amount) {
        return {
          approved: false,
          reason: 'Insufficient balance',
          code: 'INSUFFICIENT_FUNDS'
        };
      }

      // Check merchant category restrictions
      if (merchantInfo.mcc_code) {
        const mccAllowed = await this.checkMCCRestrictions(
          programType,
          merchantInfo.mcc_code
        );

        if (!mccAllowed) {
          return {
            approved: false,
            reason: `Merchant category ${merchantInfo.mcc_code} not allowed for ${programType}`,
            code: 'MCC_RESTRICTED'
          };
        }
      }

      // Check time restrictions
      const timeAllowed = this.checkTimeRestrictions(programType);
      if (!timeAllowed) {
        return {
          approved: false,
          reason: 'Transaction not allowed at this time',
          code: 'TIME_RESTRICTED'
        };
      }

      return { approved: true };

    } finally {
      client.release();
    }
  }

  /**
   * Perform fraud detection
   */
  async performFraudCheck(userId, benefitId, amount, merchantInfo, metadata) {
    const fraudIndicators = [];
    let riskScore = 0;

    // Check unusual amount
    if (amount > 500) {
      fraudIndicators.push('High transaction amount');
      riskScore += 20;
    }

    // Check location anomaly
    if (metadata.location) {
      const locationAnomaly = await this.checkLocationAnomaly(userId, metadata.location);
      if (locationAnomaly) {
        fraudIndicators.push('Unusual transaction location');
        riskScore += 30;
      }
    }

    // Check velocity spikes
    const velocitySpike = await this.checkVelocitySpike(benefitId);
    if (velocitySpike) {
      fraudIndicators.push('Sudden increase in transaction velocity');
      riskScore += 25;
    }

    // Check merchant risk
    if (merchantInfo.merchant_id) {
      const merchantRisk = await this.checkMerchantRisk(merchantInfo.merchant_id);
      if (merchantRisk.high) {
        fraudIndicators.push(`High-risk merchant: ${merchantRisk.reason}`);
        riskScore += merchantRisk.score;
      }
    }

    // Check duplicate transactions
    const duplicate = await this.checkDuplicateTransaction(
      benefitId,
      amount,
      merchantInfo,
      300000 // 5 minutes
    );

    if (duplicate) {
      fraudIndicators.push('Potential duplicate transaction');
      riskScore += 40;
    }

    // Check known fraud patterns
    const patternMatch = await this.matchFraudPatterns(
      userId,
      amount,
      merchantInfo
    );

    if (patternMatch) {
      fraudIndicators.push(`Matches fraud pattern: ${patternMatch.pattern_name}`);
      riskScore += patternMatch.risk_score;
    }

    return {
      suspicious: riskScore > 30,
      block: riskScore > 70,
      risk_score: riskScore,
      reasons: fraudIndicators
    };
  }

  /**
   * Perform velocity checks
   */
  async performVelocityCheck(benefitId, programType, amount) {
    const client = await pool.connect();
    try {
      // Get program velocity limits
      const limitsResult = await client.query(
        `SELECT * FROM program_velocity_limits WHERE program_type = $1`,
        [programType]
      );

      const limits = limitsResult.rows[0] || this.getDefaultVelocityLimits(programType);

      // Check daily spending
      if (limits.daily_limit) {
        const dailyResult = await client.query(
          `SELECT COALESCE(SUM(amount), 0) as daily_total
           FROM benefit_transactions
           WHERE benefit_id = $1
             AND transaction_type = 'DEBIT'
             AND status = 'COMPLETED'
             AND transaction_date >= CURRENT_DATE`,
          [benefitId]
        );

        const dailyTotal = parseFloat(dailyResult.rows[0].daily_total);
        if (dailyTotal + amount > limits.daily_limit) {
          return {
            passed: false,
            reason: `Daily limit of $${limits.daily_limit} would be exceeded`
          };
        }
      }

      // Check transaction count
      if (limits.daily_transaction_count) {
        const countResult = await client.query(
          `SELECT COUNT(*) as tx_count
           FROM benefit_transactions
           WHERE benefit_id = $1
             AND transaction_date >= CURRENT_DATE`,
          [benefitId]
        );

        const txCount = parseInt(countResult.rows[0].tx_count);
        if (txCount >= limits.daily_transaction_count) {
          return {
            passed: false,
            reason: `Daily transaction limit of ${limits.daily_transaction_count} reached`
          };
        }
      }

      // Check single transaction limit
      if (limits.transaction_limit && amount > limits.transaction_limit) {
        return {
          passed: false,
          reason: `Transaction amount exceeds limit of $${limits.transaction_limit}`
        };
      }

      // Update velocity tracker
      this.updateVelocityTracker(benefitId, amount);

      return { passed: true };

    } finally {
      client.release();
    }
  }

  /**
   * Process payment through appropriate payment rail
   */
  async processPayment(transactionId, amount, merchantInfo, paymentMethod, metadata) {
    try {
      // Determine payment rail based on merchant and method
      const paymentRail = this.determinePaymentRail(merchantInfo, paymentMethod);

      switch (paymentRail) {
        case 'ACH':
          return await this.fiatRailsClient.processACHPayment({
            transaction_id: transactionId,
            amount,
            merchant_account: merchantInfo.account_number,
            routing_number: merchantInfo.routing_number,
            metadata
          });

        case 'CARD':
          return await this.fiatRailsClient.processCardPayment({
            transaction_id: transactionId,
            amount,
            merchant_id: merchantInfo.merchant_id,
            terminal_id: merchantInfo.terminal_id,
            metadata
          });

        case 'RTP':
          return await this.fiatRailsClient.processRTPPayment({
            transaction_id: transactionId,
            amount,
            recipient: merchantInfo.account_info,
            metadata
          });

        case 'WIRE':
          return await this.fiatRailsClient.processWireTransfer({
            transaction_id: transactionId,
            amount,
            beneficiary: merchantInfo,
            metadata
          });

        default:
          // Default to ACH
          return await this.fiatRailsClient.processACHPayment({
            transaction_id: transactionId,
            amount,
            merchant_account: merchantInfo.account_number || 'DEFAULT',
            metadata
          });
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Record transaction in database
   */
  async recordTransaction(
    transactionId,
    benefitId,
    userId,
    programType,
    amount,
    merchantInfo,
    transactionType,
    railsTransactionId,
    authorizationCode
  ) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert transaction record
      const transactionResult = await client.query(
        `INSERT INTO benefit_transactions
         (id, benefit_id, transaction_type, amount, merchant_info,
          authorization_code, rails_transaction_id, status,
          transaction_date, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'COMPLETED', NOW(), NOW())
         RETURNING *`,
        [transactionId, benefitId, transactionType, amount, merchantInfo,
         authorizationCode, railsTransactionId]
      );

      // Update benefit balance
      const balanceResult = await client.query(
        `UPDATE government_benefits
         SET balance_amount = balance_amount - $1,
             last_transaction_date = NOW(),
             updated_at = NOW()
         WHERE id = $2
         RETURNING balance_amount`,
        [amount, benefitId]
      );

      // Create audit log
      await client.query(
        `INSERT INTO benefit_audit_logs
         (benefit_id, user_id, action, details, timestamp)
         VALUES ($1, $2, 'TRANSACTION_PROCESSED', $3, NOW())`,
        [benefitId, userId, {
          transaction_id: transactionId,
          amount,
          merchant_info: merchantInfo,
          authorization_code: authorizationCode
        }]
      );

      // Update merchant statistics
      if (merchantInfo.merchant_id) {
        await client.query(
          `INSERT INTO merchant_transaction_stats
           (merchant_id, program_type, transaction_count, total_amount, last_transaction)
           VALUES ($1, $2, 1, $3, NOW())
           ON CONFLICT (merchant_id, program_type)
           DO UPDATE SET
             transaction_count = merchant_transaction_stats.transaction_count + 1,
             total_amount = merchant_transaction_stats.total_amount + $3,
             last_transaction = NOW()`,
          [merchantInfo.merchant_id, programType, amount]
        );
      }

      await client.query('COMMIT');

      return {
        transaction: transactionResult.rows[0],
        balance_after: balanceResult.rows[0].balance_amount
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Perform post-transaction processing
   */
  async performPostTransactionProcessing(transactionId, benefitId, userId, amount, merchantInfo) {
    try {
      // Update loyalty points if applicable
      await this.updateLoyaltyPoints(userId, amount, merchantInfo);

      // Check for cashback eligibility
      await this.processCashback(userId, benefitId, amount, merchantInfo);

      // Update spending analytics
      await this.updateSpendingAnalytics(userId, benefitId, amount, merchantInfo);

      // Send transaction notification
      await this.sendTransactionNotification(userId, amount, merchantInfo);

      // Check for achievement unlocks
      await this.checkAchievements(userId, benefitId);

    } catch (error) {
      // Log error but don't fail the transaction
      console.error('Post-transaction processing error:', error);
    }
  }

  /**
   * Check MCC restrictions for program
   */
  async checkMCCRestrictions(programType, mccCode) {
    const rules = BusinessRuleEngine.FEDERAL_PROGRAM_RULES[programType];

    if (!rules) return true; // No restrictions

    // Check allowed MCC codes
    if (rules.allowed_mcc_codes && !rules.allowed_mcc_codes.includes(mccCode)) {
      return false;
    }

    // Check prohibited MCC codes
    if (rules.prohibited_mcc_codes && rules.prohibited_mcc_codes.includes(mccCode)) {
      return false;
    }

    return true;
  }

  /**
   * Check time restrictions
   */
  checkTimeRestrictions(programType) {
    // Some programs may have time-of-day restrictions
    const now = new Date();
    const hour = now.getHours();

    // Example: SNAP purchases restricted during certain hours in some states
    if (programType === 'SNAP' && (hour < 6 || hour > 23)) {
      // Check state-specific rules (simplified example)
      return false;
    }

    return true;
  }

  /**
   * Check for location anomalies
   */
  async checkLocationAnomaly(userId, location) {
    const client = await pool.connect();
    try {
      // Get user's recent transaction locations
      const result = await client.query(
        `SELECT merchant_info->>'location' as location
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
           AND bt.transaction_date >= CURRENT_DATE - INTERVAL '7 days'
           AND merchant_info->>'location' IS NOT NULL
         ORDER BY bt.transaction_date DESC
         LIMIT 10`,
        [userId]
      );

      if (result.rows.length === 0) {
        return false; // No history to compare
      }

      // Simple distance check (would use proper geospatial in production)
      const recentLocations = result.rows.map(r => r.location);
      const avgLat = recentLocations.reduce((sum, loc) => {
        const coords = JSON.parse(loc);
        return sum + coords.lat;
      }, 0) / recentLocations.length;

      const currentCoords = JSON.parse(location);
      const distance = Math.abs(currentCoords.lat - avgLat);

      // Flag if more than 5 degrees difference (roughly 350 miles)
      return distance > 5;

    } finally {
      client.release();
    }
  }

  /**
   * Check for velocity spikes
   */
  async checkVelocitySpike(benefitId) {
    const tracker = this.velocityTrackers.get(benefitId);

    if (!tracker) {
      return false;
    }

    // Check if recent velocity is 3x higher than average
    const recentVelocity = tracker.recent_count || 0;
    const avgVelocity = tracker.average_count || 1;

    return recentVelocity > avgVelocity * 3;
  }

  /**
   * Check merchant risk level
   */
  async checkMerchantRisk(merchantId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT risk_level, risk_score, risk_reason
         FROM merchant_risk_profiles
         WHERE merchant_id = $1`,
        [merchantId]
      );

      if (result.rows.length === 0) {
        return { high: false, score: 0 };
      }

      const profile = result.rows[0];
      return {
        high: profile.risk_level === 'HIGH',
        score: profile.risk_score || 0,
        reason: profile.risk_reason
      };

    } finally {
      client.release();
    }
  }

  /**
   * Check for duplicate transactions
   */
  async checkDuplicateTransaction(benefitId, amount, merchantInfo, timeWindow) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*) as count
         FROM benefit_transactions
         WHERE benefit_id = $1
           AND amount = $2
           AND merchant_info->>'merchant_id' = $3
           AND transaction_date >= NOW() - INTERVAL '%s milliseconds'
           AND status = 'COMPLETED'`,
        [benefitId, amount, merchantInfo.merchant_id, timeWindow]
      );

      return result.rows[0].count > 0;

    } finally {
      client.release();
    }
  }

  /**
   * Match against known fraud patterns
   */
  async matchFraudPatterns(userId, amount, merchantInfo) {
    // Check loaded fraud patterns
    for (const [patternId, pattern] of this.fraudPatterns) {
      if (pattern.matches(userId, amount, merchantInfo)) {
        return {
          pattern_name: pattern.name,
          risk_score: pattern.risk_score
        };
      }
    }

    return null;
  }

  /**
   * Load fraud patterns from database
   */
  async loadFraudPatterns() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM fraud_patterns WHERE active = true`
      );

      for (const row of result.rows) {
        this.fraudPatterns.set(row.id, {
          name: row.name,
          risk_score: row.risk_score,
          matches: (userId, amount, merchantInfo) => {
            // Implement pattern matching logic
            try {
              const pattern = JSON.parse(row.pattern_definition);
              return this.evaluateFraudPattern(pattern, userId, amount, merchantInfo);
            } catch (error) {
              console.error(`Error evaluating fraud pattern ${row.id}:`, error);
              return false;
            }
          }
        });
      }

      console.log(`Loaded ${this.fraudPatterns.size} fraud patterns`);

    } finally {
      client.release();
    }
  }

  /**
   * Evaluate a fraud pattern
   */
  evaluateFraudPattern(pattern, userId, amount, merchantInfo) {
    // Simple pattern matching (would be more sophisticated in production)
    if (pattern.amount_range) {
      if (amount < pattern.amount_range.min || amount > pattern.amount_range.max) {
        return false;
      }
    }

    if (pattern.merchant_types && merchantInfo.type) {
      if (!pattern.merchant_types.includes(merchantInfo.type)) {
        return false;
      }
    }

    if (pattern.time_window) {
      const hour = new Date().getHours();
      if (hour < pattern.time_window.start || hour > pattern.time_window.end) {
        return false;
      }
    }

    return true;
  }

  /**
   * Flag suspicious transaction
   */
  async flagSuspiciousTransaction(transactionId, reasons, transactionData) {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO suspicious_transactions
         (transaction_id, reasons, transaction_data, flagged_at, status)
         VALUES ($1, $2, $3, NOW(), 'PENDING_REVIEW')`,
        [transactionId, reasons, transactionData]
      );

      this.emit('suspicious_transaction', {
        transaction_id: transactionId,
        reasons
      });

    } finally {
      client.release();
    }
  }

  /**
   * Record failed transaction
   */
  async recordFailedTransaction(transactionId, benefitId, userId, amount, errorMessage) {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO failed_benefit_transactions
         (transaction_id, benefit_id, user_id, amount, error_message, failed_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [transactionId, benefitId, userId, amount, errorMessage]
      );

    } finally {
      client.release();
    }
  }

  /**
   * Update velocity tracker
   */
  updateVelocityTracker(benefitId, amount) {
    if (!this.velocityTrackers.has(benefitId)) {
      this.velocityTrackers.set(benefitId, {
        recent_count: 0,
        recent_amount: 0,
        average_count: 0,
        average_amount: 0,
        last_update: Date.now()
      });
    }

    const tracker = this.velocityTrackers.get(benefitId);
    tracker.recent_count++;
    tracker.recent_amount += amount;
    tracker.last_update = Date.now();

    // Update average (simplified)
    tracker.average_count = (tracker.average_count * 0.9) + (tracker.recent_count * 0.1);
    tracker.average_amount = (tracker.average_amount * 0.9) + (tracker.recent_amount * 0.1);
  }

  /**
   * Update loyalty points
   */
  async updateLoyaltyPoints(userId, amount, merchantInfo) {
    const client = await pool.connect();
    try {
      // Calculate points (1 point per dollar by default)
      const points = Math.floor(amount);

      // Check for bonus multipliers
      const multiplier = await this.getPointsMultiplier(userId, merchantInfo);
      const totalPoints = points * multiplier;

      await client.query(
        `INSERT INTO loyalty_points_transactions
         (user_id, points_earned, transaction_type, reference_data, created_at)
         VALUES ($1, $2, 'PURCHASE', $3, NOW())`,
        [userId, totalPoints, { amount, merchant: merchantInfo.merchant_name }]
      );

      // Update user's total points
      await client.query(
        `UPDATE loyalty_members
         SET current_points = current_points + $1,
             lifetime_points = lifetime_points + $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [totalPoints, userId]
      );

    } catch (error) {
      console.error('Error updating loyalty points:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Process cashback
   */
  async processCashback(userId, benefitId, amount, merchantInfo) {
    // Check if merchant offers cashback
    if (merchantInfo.cashback_rate) {
      const cashbackAmount = amount * merchantInfo.cashback_rate;

      // Credit cashback (would be more complex in production)
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO cashback_transactions
           (user_id, benefit_id, amount, cashback_amount, merchant_info, processed_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [userId, benefitId, amount, cashbackAmount, merchantInfo]
        );
      } finally {
        client.release();
      }
    }
  }

  /**
   * Update spending analytics
   */
  async updateSpendingAnalytics(userId, benefitId, amount, merchantInfo) {
    const client = await pool.connect();
    try {
      const category = merchantInfo.category || 'OTHER';

      await client.query(
        `INSERT INTO spending_analytics
         (user_id, benefit_id, category, amount, merchant_name, transaction_date)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id, benefit_id, category, transaction_date)
         DO UPDATE SET
           amount = spending_analytics.amount + $4`,
        [userId, benefitId, category, amount, merchantInfo.merchant_name]
      );

    } catch (error) {
      console.error('Error updating analytics:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Send transaction notification
   */
  async sendTransactionNotification(userId, amount, merchantInfo) {
    // In production, integrate with notification service
    this.emit('notification_sent', {
      user_id: userId,
      type: 'TRANSACTION',
      message: `Transaction of $${amount} at ${merchantInfo.merchant_name} completed`
    });
  }

  /**
   * Check for achievement unlocks
   */
  async checkAchievements(userId, benefitId) {
    // Check various achievement criteria
    const achievements = [
      { id: 'first_transaction', name: 'First Transaction' },
      { id: 'savvy_spender', name: 'Spent wisely 10 times' },
      { id: 'budget_master', name: 'Stayed under budget for a month' }
    ];

    // Would check actual criteria in production
    for (const achievement of achievements) {
      this.emit('achievement_check', {
        user_id: userId,
        achievement_id: achievement.id
      });
    }
  }

  /**
   * Get points multiplier for transaction
   */
  async getPointsMultiplier(userId, merchantInfo) {
    const client = await pool.connect();
    try {
      // Check for active campaigns
      const result = await client.query(
        `SELECT multiplier FROM loyalty_campaigns
         WHERE active = true
           AND (merchant_category = $1 OR merchant_id = $2)
           AND start_date <= NOW()
           AND end_date >= NOW()
         ORDER BY multiplier DESC
         LIMIT 1`,
        [merchantInfo.category, merchantInfo.merchant_id]
      );

      return result.rows.length > 0 ? result.rows[0].multiplier : 1;

    } finally {
      client.release();
    }
  }

  /**
   * Determine payment rail based on merchant and method
   */
  determinePaymentRail(merchantInfo, paymentMethod) {
    if (paymentMethod) {
      return paymentMethod.toUpperCase();
    }

    // Default logic based on merchant type
    if (merchantInfo.supports_rtp) {
      return 'RTP';
    }

    if (merchantInfo.terminal_id) {
      return 'CARD';
    }

    if (merchantInfo.routing_number) {
      return 'ACH';
    }

    return 'ACH'; // Default
  }

  /**
   * Get default velocity limits
   */
  getDefaultVelocityLimits(programType) {
    const defaults = {
      SNAP: {
        daily_limit: 200,
        daily_transaction_count: 10,
        transaction_limit: 100
      },
      TANF: {
        daily_limit: 500,
        daily_transaction_count: 20,
        transaction_limit: 300
      },
      WIC: {
        daily_limit: 150,
        daily_transaction_count: 5,
        transaction_limit: 100
      }
    };

    return defaults[programType] || {
      daily_limit: 1000,
      daily_transaction_count: 50,
      transaction_limit: 500
    };
  }

  /**
   * Generate unique transaction ID
   */
  generateTransactionId() {
    return 'TXN-' + Date.now().toString(36).toUpperCase() +
           '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Start queue processor for batch transactions
   */
  startQueueProcessor() {
    setInterval(async () => {
      if (this.processingQueue.length > 0 && !this.isProcessing) {
        await this.processQueue();
      }
    }, 1000); // Process every second
  }

  /**
   * Process queued transactions
   */
  async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.processingQueue.length > 0) {
        const transaction = this.processingQueue.shift();
        await this.processTransaction(transaction);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Schedule cleanup jobs
   */
  scheduleCleanup() {
    // Clean up old authorization cache entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.authorizationCache) {
        if (now - value.timestamp > 3600000) { // 1 hour
          this.authorizationCache.delete(key);
        }
      }
    }, 600000); // Every 10 minutes

    // Clean up old velocity trackers
    setInterval(() => {
      const now = Date.now();
      for (const [key, tracker] of this.velocityTrackers) {
        if (now - tracker.last_update > 86400000) { // 24 hours
          this.velocityTrackers.delete(key);
        }
      }
    }, 3600000); // Every hour
  }

  /**
   * Shutdown the processor
   */
  shutdown() {
    console.log('Shutting down Benefit Transaction Processor');
    this.processingQueue = [];
    this.authorizationCache.clear();
    this.velocityTrackers.clear();
    this.fraudPatterns.clear();
  }
}

// Export singleton instance
export default new BenefitTransactionProcessor();