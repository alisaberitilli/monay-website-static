const { Pool } = require('pg');
const crypto = require('crypto');
const EventEmitter = require('events');

class InstantPayoutSystem extends EventEmitter {
  constructor(dbConfig) {
    super();
    this.pool = new Pool(dbConfig);

    // Payout methods
    this.payoutMethods = {
      ACH_SAME_DAY: 'ach_same_day',
      ACH_NEXT_DAY: 'ach_next_day',
      WIRE: 'wire',
      RTP: 'rtp', // Real-Time Payments
      FEDNOW: 'fednow',
      DEBIT_CARD: 'debit_card',
      CRYPTO: 'crypto',
      DIGITAL_WALLET: 'digital_wallet',
      PREPAID_CARD: 'prepaid_card'
    };

    // Payout statuses
    this.payoutStatus = {
      PENDING: 'pending',
      PROCESSING: 'processing',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      SENT: 'sent',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
      REVERSED: 'reversed'
    };

    // Risk levels
    this.riskLevels = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };

    // Fee structures
    this.feeStructures = {
      [this.payoutMethods.FEDNOW]: { fixed: 0.25, percentage: 0 },
      [this.payoutMethods.RTP]: { fixed: 0.50, percentage: 0 },
      [this.payoutMethods.ACH_SAME_DAY]: { fixed: 1.00, percentage: 0 },
      [this.payoutMethods.ACH_NEXT_DAY]: { fixed: 0.25, percentage: 0 },
      [this.payoutMethods.WIRE]: { fixed: 15.00, percentage: 0 },
      [this.payoutMethods.DEBIT_CARD]: { fixed: 0, percentage: 1.5 },
      [this.payoutMethods.CRYPTO]: { fixed: 0, percentage: 1.0 },
      [this.payoutMethods.DIGITAL_WALLET]: { fixed: 0, percentage: 2.0 },
      [this.payoutMethods.PREPAID_CARD]: { fixed: 0, percentage: 2.5 }
    };

    // Payout limits
    this.payoutLimits = {
      [this.payoutMethods.FEDNOW]: { min: 0.01, max: 100000, daily: 500000 },
      [this.payoutMethods.RTP]: { min: 0.01, max: 100000, daily: 500000 },
      [this.payoutMethods.ACH_SAME_DAY]: { min: 0.01, max: 100000, daily: 250000 },
      [this.payoutMethods.ACH_NEXT_DAY]: { min: 0.01, max: 1000000, daily: 5000000 },
      [this.payoutMethods.WIRE]: { min: 100, max: 10000000, daily: 50000000 },
      [this.payoutMethods.DEBIT_CARD]: { min: 0.01, max: 5000, daily: 10000 },
      [this.payoutMethods.CRYPTO]: { min: 1, max: 100000, daily: 500000 },
      [this.payoutMethods.DIGITAL_WALLET]: { min: 0.01, max: 10000, daily: 50000 },
      [this.payoutMethods.PREPAID_CARD]: { min: 0.01, max: 5000, daily: 10000 }
    };
  }

  /**
   * Request instant payout
   */
  async requestInstantPayout(contractorId, payoutData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Validate contractor eligibility
      const eligible = await this.validateContractorEligibility(client, contractorId);
      if (!eligible.isEligible) {
        throw new Error(`Payout not allowed: ${eligible.reason}`);
      }

      // Check available balance
      const balance = await this.getAvailableBalance(client, contractorId);
      if (balance < payoutData.amount) {
        throw new Error(`Insufficient balance. Available: $${balance.toFixed(2)}`);
      }

      // Validate payout method and limits
      await this.validatePayoutLimits(client, contractorId, payoutData);

      // Calculate fees
      const fees = this.calculatePayoutFees(payoutData.amount, payoutData.method);

      // Perform risk assessment
      const riskScore = await this.assessPayoutRisk(client, contractorId, payoutData);

      // Create payout request
      const payoutId = await this.createPayoutRequest(
        client,
        contractorId,
        payoutData,
        fees,
        riskScore
      );

      // Process based on risk level
      if (riskScore.level === this.riskLevels.LOW) {
        // Auto-approve low risk payouts
        await this.approveAndProcessPayout(client, payoutId);
      } else if (riskScore.level === this.riskLevels.CRITICAL) {
        // Auto-reject critical risk
        await this.rejectPayout(client, payoutId, 'High risk detected');
      } else {
        // Queue for manual review
        await this.queueForReview(client, payoutId, riskScore);
      }

      await client.query('COMMIT');

      this.emit('payout:requested', {
        payoutId,
        contractorId,
        amount: payoutData.amount,
        method: payoutData.method,
        riskLevel: riskScore.level
      });

      return {
        success: true,
        payoutId,
        status: riskScore.level === this.riskLevels.LOW ? 'processing' : 'pending_review',
        estimatedArrival: this.getEstimatedArrival(payoutData.method),
        fees,
        netAmount: payoutData.amount - fees.total
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate contractor eligibility
   */
  async validateContractorEligibility(client, contractorId) {
    const query = `
      SELECT
        c.status,
        c.verification_level,
        c.activated_at,
        c.suspended_at,
        c.suspended_reason,
        ba.is_verified as bank_verified,
        COUNT(DISTINCT p.id) as completed_jobs,
        AVG(r.rating) as average_rating,
        COUNT(ch.id) FILTER (WHERE ch.status = 'lost' AND ch.created_at > NOW() - INTERVAL '30 days') as recent_chargebacks
      FROM contractors c
      LEFT JOIN contractor_bank_accounts ba ON c.id = ba.contractor_id AND ba.is_primary = true
      LEFT JOIN contractor_jobs p ON c.id = p.contractor_id AND p.status = 'completed'
      LEFT JOIN contractor_ratings r ON c.id = r.contractor_id
      LEFT JOIN payment_chargebacks ch ON c.id = ch.contractor_id
      WHERE c.id = $1
      GROUP BY c.id, c.status, c.verification_level, c.activated_at, c.suspended_at, c.suspended_reason, ba.is_verified`;

    const result = await client.query(query, [contractorId]);

    if (result.rows.length === 0) {
      return { isEligible: false, reason: 'Contractor not found' };
    }

    const contractor = result.rows[0];

    // Check various eligibility criteria
    if (contractor.status !== 'active') {
      return { isEligible: false, reason: `Account status: ${contractor.status}` };
    }

    if (contractor.suspended_at) {
      return { isEligible: false, reason: contractor.suspended_reason || 'Account suspended' };
    }

    if (!contractor.bank_verified) {
      return { isEligible: false, reason: 'Bank account not verified' };
    }

    if (contractor.recent_chargebacks > 2) {
      return { isEligible: false, reason: 'Too many recent chargebacks' };
    }

    if (contractor.average_rating && contractor.average_rating < 3.0) {
      return { isEligible: false, reason: 'Rating below minimum threshold' };
    }

    return { isEligible: true };
  }

  /**
   * Get available balance
   */
  async getAvailableBalance(client, contractorId) {
    const query = `
      SELECT
        COALESCE(SUM(amount), 0) as total_earnings,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_earnings,
        COALESCE(SUM(amount) FILTER (WHERE status = 'hold'), 0) as held_earnings
      FROM contractor_earnings
      WHERE contractor_id = $1`;

    const earningsResult = await client.query(query, [contractorId]);

    const payoutsQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_payouts
      FROM contractor_payouts
      WHERE contractor_id = $1
      AND status IN ('processing', 'sent', 'completed')`;

    const payoutsResult = await client.query(payoutsQuery, [contractorId]);

    const earnings = earningsResult.rows[0];
    const payouts = payoutsResult.rows[0];

    const availableBalance = earnings.total_earnings -
                           earnings.pending_earnings -
                           earnings.held_earnings -
                           payouts.total_payouts;

    return Math.max(0, availableBalance);
  }

  /**
   * Validate payout limits
   */
  async validatePayoutLimits(client, contractorId, payoutData) {
    const limits = this.payoutLimits[payoutData.method];

    if (!limits) {
      throw new Error(`Invalid payout method: ${payoutData.method}`);
    }

    // Check amount limits
    if (payoutData.amount < limits.min) {
      throw new Error(`Minimum payout amount is $${limits.min.toFixed(2)}`);
    }

    if (payoutData.amount > limits.max) {
      throw new Error(`Maximum payout amount is $${limits.max.toFixed(2)}`);
    }

    // Check daily limits
    const dailyQuery = `
      SELECT COALESCE(SUM(amount), 0) as daily_total
      FROM contractor_payouts
      WHERE contractor_id = $1
      AND payout_method = $2
      AND created_at >= CURRENT_DATE
      AND status NOT IN ('failed', 'cancelled', 'rejected')`;

    const dailyResult = await client.query(dailyQuery, [contractorId, payoutData.method]);
    const dailyTotal = dailyResult.rows[0].daily_total;

    if (dailyTotal + payoutData.amount > limits.daily) {
      throw new Error(`Daily limit exceeded. Remaining: $${(limits.daily - dailyTotal).toFixed(2)}`);
    }

    // Check velocity limits
    await this.checkVelocityLimits(client, contractorId);
  }

  /**
   * Check velocity limits
   */
  async checkVelocityLimits(client, contractorId) {
    const velocityQuery = `
      SELECT
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as hourly_count,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as daily_count,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as weekly_count
      FROM contractor_payouts
      WHERE contractor_id = $1
      AND status NOT IN ('failed', 'cancelled', 'rejected')`;

    const result = await client.query(velocityQuery, [contractorId]);
    const velocity = result.rows[0];

    if (velocity.hourly_count >= 3) {
      throw new Error('Hourly payout limit exceeded');
    }

    if (velocity.daily_count >= 10) {
      throw new Error('Daily payout frequency limit exceeded');
    }

    if (velocity.weekly_count >= 50) {
      throw new Error('Weekly payout frequency limit exceeded');
    }
  }

  /**
   * Calculate payout fees
   */
  calculatePayoutFees(amount, method) {
    const feeStructure = this.feeStructures[method];

    if (!feeStructure) {
      throw new Error(`Invalid payout method: ${method}`);
    }

    const fixedFee = feeStructure.fixed;
    const percentageFee = (amount * feeStructure.percentage) / 100;
    const totalFee = fixedFee + percentageFee;

    return {
      fixed: fixedFee,
      percentage: percentageFee,
      total: totalFee,
      net: amount - totalFee
    };
  }

  /**
   * Assess payout risk
   */
  async assessPayoutRisk(client, contractorId, payoutData) {
    let riskScore = 0;
    const riskFactors = [];

    // Check account age
    const accountAgeQuery = `
      SELECT EXTRACT(DAY FROM NOW() - created_at) as account_age_days
      FROM contractors WHERE id = $1`;
    const ageResult = await client.query(accountAgeQuery, [contractorId]);
    const accountAge = ageResult.rows[0].account_age_days;

    if (accountAge < 7) {
      riskScore += 30;
      riskFactors.push('New account');
    } else if (accountAge < 30) {
      riskScore += 15;
      riskFactors.push('Recent account');
    }

    // Check payout amount
    if (payoutData.amount > 5000) {
      riskScore += 20;
      riskFactors.push('Large amount');
    } else if (payoutData.amount > 1000) {
      riskScore += 10;
      riskFactors.push('Medium amount');
    }

    // Check payout frequency
    const frequencyQuery = `
      SELECT COUNT(*) as recent_payouts
      FROM contractor_payouts
      WHERE contractor_id = $1
      AND created_at > NOW() - INTERVAL '24 hours'`;
    const freqResult = await client.query(frequencyQuery, [contractorId]);

    if (freqResult.rows[0].recent_payouts > 3) {
      riskScore += 25;
      riskFactors.push('High frequency');
    }

    // Check for suspicious patterns
    const patternScore = await this.checkSuspiciousPatterns(client, contractorId, payoutData);
    riskScore += patternScore.score;
    if (patternScore.factors.length > 0) {
      riskFactors.push(...patternScore.factors);
    }

    // Check contractor behavior
    const behaviorQuery = `
      SELECT
        COUNT(*) FILTER (WHERE type = 'complaint') as complaints,
        COUNT(*) FILTER (WHERE type = 'dispute') as disputes,
        COUNT(*) FILTER (WHERE type = 'fraud_report') as fraud_reports
      FROM contractor_issues
      WHERE contractor_id = $1
      AND created_at > NOW() - INTERVAL '90 days'`;
    const behaviorResult = await client.query(behaviorQuery, [contractorId]);
    const behavior = behaviorResult.rows[0];

    if (behavior.fraud_reports > 0) {
      riskScore += 50;
      riskFactors.push('Fraud reports');
    }

    if (behavior.disputes > 2) {
      riskScore += 20;
      riskFactors.push('Multiple disputes');
    }

    // Determine risk level
    let level;
    if (riskScore >= 70) {
      level = this.riskLevels.CRITICAL;
    } else if (riskScore >= 50) {
      level = this.riskLevels.HIGH;
    } else if (riskScore >= 30) {
      level = this.riskLevels.MEDIUM;
    } else {
      level = this.riskLevels.LOW;
    }

    return {
      score: riskScore,
      level,
      factors: riskFactors
    };
  }

  /**
   * Check suspicious patterns
   */
  async checkSuspiciousPatterns(client, contractorId, payoutData) {
    let score = 0;
    const factors = [];

    // Check for round amounts
    if (payoutData.amount % 100 === 0 && payoutData.amount > 1000) {
      score += 5;
      factors.push('Round amount');
    }

    // Check for unusual timing
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      score += 10;
      factors.push('Unusual time');
    }

    // Check for location changes
    if (payoutData.ipAddress) {
      const locationQuery = `
        SELECT COUNT(DISTINCT ip_country) as country_count
        FROM contractor_sessions
        WHERE contractor_id = $1
        AND created_at > NOW() - INTERVAL '7 days'`;
      const locResult = await client.query(locationQuery, [contractorId]);

      if (locResult.rows[0].country_count > 2) {
        score += 15;
        factors.push('Multiple locations');
      }
    }

    // Check for device changes
    const deviceQuery = `
      SELECT COUNT(DISTINCT device_fingerprint) as device_count
      FROM contractor_sessions
      WHERE contractor_id = $1
      AND created_at > NOW() - INTERVAL '7 days'`;
    const deviceResult = await client.query(deviceQuery, [contractorId]);

    if (deviceResult.rows[0].device_count > 3) {
      score += 10;
      factors.push('Multiple devices');
    }

    return { score, factors };
  }

  /**
   * Create payout request
   */
  async createPayoutRequest(client, contractorId, payoutData, fees, riskScore) {
    const query = `
      INSERT INTO contractor_payouts (
        contractor_id, amount, payout_method, destination_type,
        destination_account, destination_details, currency,
        fee_amount, net_amount, risk_score, risk_level,
        risk_factors, status, ip_address, device_fingerprint,
        requested_at, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, NOW(), NOW()
      ) RETURNING id`;

    const result = await client.query(query, [
      contractorId,
      payoutData.amount,
      payoutData.method,
      payoutData.destinationType || 'bank_account',
      payoutData.destinationAccount,
      JSON.stringify(payoutData.destinationDetails || {}),
      payoutData.currency || 'USD',
      fees.total,
      fees.net,
      riskScore.score,
      riskScore.level,
      JSON.stringify(riskScore.factors),
      this.payoutStatus.PENDING,
      payoutData.ipAddress,
      payoutData.deviceFingerprint,
    ]);

    return result.rows[0].id;
  }

  /**
   * Approve and process payout
   */
  async approveAndProcessPayout(client, payoutId) {
    // Update status to approved
    await client.query(
      'UPDATE contractor_payouts SET status = $1, approved_at = NOW() WHERE id = $2',
      [this.payoutStatus.APPROVED, payoutId]
    );

    // Get payout details
    const payoutQuery = `
      SELECT * FROM contractor_payouts WHERE id = $1`;
    const payoutResult = await client.query(payoutQuery, [payoutId]);
    const payout = payoutResult.rows[0];

    // Process based on method
    let processingResult;
    switch (payout.payout_method) {
      case this.payoutMethods.FEDNOW:
        processingResult = await this.processFedNowPayout(payout);
        break;
      case this.payoutMethods.RTP:
        processingResult = await this.processRTPPayout(payout);
        break;
      case this.payoutMethods.ACH_SAME_DAY:
      case this.payoutMethods.ACH_NEXT_DAY:
        processingResult = await this.processACHPayout(payout);
        break;
      case this.payoutMethods.WIRE:
        processingResult = await this.processWirePayout(payout);
        break;
      case this.payoutMethods.DEBIT_CARD:
        processingResult = await this.processDebitCardPayout(payout);
        break;
      case this.payoutMethods.CRYPTO:
        processingResult = await this.processCryptoPayout(payout);
        break;
      case this.payoutMethods.DIGITAL_WALLET:
        processingResult = await this.processDigitalWalletPayout(payout);
        break;
      case this.payoutMethods.PREPAID_CARD:
        processingResult = await this.processPrepaidCardPayout(payout);
        break;
      default:
        throw new Error(`Unsupported payout method: ${payout.payout_method}`);
    }

    // Update payout status
    await client.query(
      `UPDATE contractor_payouts
       SET status = $1, processor_reference = $2, processed_at = NOW()
       WHERE id = $3`,
      [
        processingResult.success ? this.payoutStatus.SENT : this.payoutStatus.FAILED,
        processingResult.reference,
        payoutId
      ]
    );

    // Create ledger entry
    await this.createLedgerEntry(client, payout);

    this.emit('payout:processed', {
      payoutId,
      success: processingResult.success,
      reference: processingResult.reference
    });

    return processingResult;
  }

  /**
   * Process FedNow payout
   */
  async processFedNowPayout(payout) {
    // Integration with FedNow service
    // This would connect to actual FedNow API
    const reference = 'FEDNOW-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    // Simulate instant processing
    return {
      success: true,
      reference,
      processingTime: '<1 second',
      estimatedArrival: 'Instant'
    };
  }

  /**
   * Process RTP payout
   */
  async processRTPPayout(payout) {
    // Integration with RTP network
    const reference = 'RTP-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    return {
      success: true,
      reference,
      processingTime: '<5 seconds',
      estimatedArrival: 'Instant'
    };
  }

  /**
   * Process ACH payout
   */
  async processACHPayout(payout) {
    // Integration with ACH network
    const reference = 'ACH-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    const isSameDay = payout.payout_method === this.payoutMethods.ACH_SAME_DAY;

    return {
      success: true,
      reference,
      processingTime: '1-2 minutes',
      estimatedArrival: isSameDay ? 'Same business day' : 'Next business day'
    };
  }

  /**
   * Process wire payout
   */
  async processWirePayout(payout) {
    // Integration with wire transfer service
    const reference = 'WIRE-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    return {
      success: true,
      reference,
      processingTime: '10-30 minutes',
      estimatedArrival: '2-4 hours'
    };
  }

  /**
   * Process debit card payout
   */
  async processDebitCardPayout(payout) {
    // Integration with card network
    const reference = 'CARD-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    return {
      success: true,
      reference,
      processingTime: '30 seconds',
      estimatedArrival: '30 minutes'
    };
  }

  /**
   * Process crypto payout
   */
  async processCryptoPayout(payout) {
    // Integration with crypto payment processor
    const reference = 'CRYPTO-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    return {
      success: true,
      reference,
      processingTime: '1-2 minutes',
      estimatedArrival: '10-30 minutes',
      txHash: '0x' + crypto.randomBytes(32).toString('hex')
    };
  }

  /**
   * Process digital wallet payout
   */
  async processDigitalWalletPayout(payout) {
    // Integration with digital wallet providers
    const reference = 'WALLET-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    return {
      success: true,
      reference,
      processingTime: 'Instant',
      estimatedArrival: 'Instant'
    };
  }

  /**
   * Process prepaid card payout
   */
  async processPrepaidCardPayout(payout) {
    // Integration with prepaid card issuer
    const reference = 'PREPAID-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    return {
      success: true,
      reference,
      processingTime: '1-2 minutes',
      estimatedArrival: 'Instant',
      cardLastFour: '****' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    };
  }

  /**
   * Reject payout
   */
  async rejectPayout(client, payoutId, reason) {
    await client.query(
      `UPDATE contractor_payouts
       SET status = $1, rejection_reason = $2, rejected_at = NOW()
       WHERE id = $3`,
      [this.payoutStatus.REJECTED, reason, payoutId]
    );

    this.emit('payout:rejected', { payoutId, reason });
  }

  /**
   * Queue for review
   */
  async queueForReview(client, payoutId, riskScore) {
    const query = `
      INSERT INTO payout_review_queue (
        payout_id, risk_score, risk_level, risk_factors,
        priority, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`;

    const priority = riskScore.level === this.riskLevels.HIGH ? 1 : 2;

    await client.query(query, [
      payoutId,
      riskScore.score,
      riskScore.level,
      JSON.stringify(riskScore.factors),
      priority
    ]);

    this.emit('payout:queued_for_review', { payoutId, riskLevel: riskScore.level });
  }

  /**
   * Create ledger entry
   */
  async createLedgerEntry(client, payout) {
    const query = `
      INSERT INTO contractor_ledger (
        contractor_id, transaction_type, amount,
        reference_type, reference_id, balance_before,
        balance_after, description, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`;

    const balanceBefore = await this.getAvailableBalance(client, payout.contractor_id);
    const balanceAfter = balanceBefore - payout.amount;

    await client.query(query, [
      payout.contractor_id,
      'payout',
      -payout.amount,
      'payout',
      payout.id,
      balanceBefore,
      balanceAfter,
      `Payout via ${payout.payout_method}`
    ]);
  }

  /**
   * Get estimated arrival time
   */
  getEstimatedArrival(method) {
    const estimates = {
      [this.payoutMethods.FEDNOW]: 'Instant (< 1 second)',
      [this.payoutMethods.RTP]: 'Instant (< 5 seconds)',
      [this.payoutMethods.ACH_SAME_DAY]: 'Same business day',
      [this.payoutMethods.ACH_NEXT_DAY]: 'Next business day',
      [this.payoutMethods.WIRE]: '2-4 hours',
      [this.payoutMethods.DEBIT_CARD]: '30 minutes',
      [this.payoutMethods.CRYPTO]: '10-30 minutes',
      [this.payoutMethods.DIGITAL_WALLET]: 'Instant',
      [this.payoutMethods.PREPAID_CARD]: 'Instant'
    };

    return estimates[method] || 'Unknown';
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(contractorId, options = {}) {
    let query = `
      SELECT
        p.*,
        CASE
          WHEN p.status = 'completed' THEN p.completed_at
          WHEN p.status = 'sent' THEN p.processed_at
          ELSE p.created_at
        END as effective_date
      FROM contractor_payouts p
      WHERE p.contractor_id = $1`;

    const params = [contractorId];
    let paramIndex = 2;

    if (options.startDate) {
      query += ` AND p.created_at >= $${paramIndex}`;
      params.push(options.startDate);
      paramIndex++;
    }

    if (options.endDate) {
      query += ` AND p.created_at <= $${paramIndex}`;
      params.push(options.endDate);
      paramIndex++;
    }

    if (options.status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(options.status);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC`;

    if (options.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(options.limit);
    }

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Cancel payout
   */
  async cancelPayout(payoutId, reason) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Check if payout can be cancelled
      const statusQuery = `
        SELECT status, payout_method, processor_reference
        FROM contractor_payouts
        WHERE id = $1`;
      const statusResult = await client.query(statusQuery, [payoutId]);

      if (statusResult.rows.length === 0) {
        throw new Error('Payout not found');
      }

      const payout = statusResult.rows[0];

      if (!['pending', 'approved'].includes(payout.status)) {
        throw new Error(`Cannot cancel payout with status: ${payout.status}`);
      }

      // Update status
      await client.query(
        `UPDATE contractor_payouts
         SET status = $1, cancellation_reason = $2, cancelled_at = NOW()
         WHERE id = $3`,
        [this.payoutStatus.CANCELLED, reason, payoutId]
      );

      // If already sent to processor, attempt cancellation
      if (payout.processor_reference) {
        await this.cancelWithProcessor(payout);
      }

      await client.query('COMMIT');

      this.emit('payout:cancelled', { payoutId, reason });

      return { success: true, message: 'Payout cancelled successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cancel with processor
   */
  async cancelWithProcessor(payout) {
    // Implement processor-specific cancellation logic
    switch (payout.payout_method) {
      case this.payoutMethods.ACH_SAME_DAY:
      case this.payoutMethods.ACH_NEXT_DAY:
        // ACH cancellation logic
        break;
      case this.payoutMethods.WIRE:
        // Wire cancellation logic
        break;
      default:
        // Other cancellation logic
        break;
    }
  }

  /**
   * Get payout statistics
   */
  async getPayoutStatistics(contractorId) {
    const query = `
      SELECT
        COUNT(*) as total_payouts,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_payouts,
        SUM(amount) as total_amount,
        SUM(amount) FILTER (WHERE status = 'completed') as completed_amount,
        SUM(fee_amount) as total_fees,
        AVG(amount) as average_amount,
        MAX(amount) as max_amount,
        MIN(amount) FILTER (WHERE amount > 0) as min_amount,
        COUNT(DISTINCT payout_method) as methods_used,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as recent_payouts
      FROM contractor_payouts
      WHERE contractor_id = $1`;

    const result = await this.pool.query(query, [contractorId]);
    return result.rows[0];
  }
}

export default InstantPayoutSystem;