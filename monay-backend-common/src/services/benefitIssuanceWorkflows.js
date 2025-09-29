import pool from '../models/index.js';
import MonayFiatRailsClient from './monayFiatRailsClient.js';
import BusinessRuleEngine from './businessRuleEngine.js';
import cron from 'node-cron';
import EventEmitter from 'events';

class BenefitIssuanceWorkflows extends EventEmitter {
  constructor() {
    super();
    this.fiatRailsClient = new MonayFiatRailsClient();
    this.scheduledJobs = new Map();
    this.issuanceQueue = [];
    this.processingActive = false;
  }

  /**
   * Initialize workflow engine and scheduled jobs
   */
  async initialize() {
    console.log('Initializing Benefit Issuance Workflows...');

    // Schedule daily disbursement processing (runs at 2 AM)
    this.scheduledJobs.set('daily_disbursement', cron.schedule('0 2 * * *', async () => {
      await this.processDailyDisbursements();
    }));

    // Schedule weekly UI benefits (runs every Monday at 3 AM)
    this.scheduledJobs.set('weekly_ui', cron.schedule('0 3 * * 1', async () => {
      await this.processUIWeeklyBenefits();
    }));

    // Schedule monthly benefits (runs on the 1st at 1 AM)
    this.scheduledJobs.set('monthly_benefits', cron.schedule('0 1 1 * *', async () => {
      await this.processMonthlyBenefits();
    }));

    // Schedule emergency disbursement check (runs every hour)
    this.scheduledJobs.set('emergency_check', cron.schedule('0 * * * *', async () => {
      await this.processEmergencyDisbursements();
    }));

    // Start queue processor
    this.startQueueProcessor();

    console.log('Benefit Issuance Workflows initialized successfully');
  }

  /**
   * Process daily disbursements for all programs
   */
  async processDailyDisbursements() {
    const client = await pool.connect();
    try {
      console.log('Starting daily disbursement processing...');

      // Get all benefits scheduled for today
      const result = await client.query(
        `SELECT gb.*, u.email, u.phone, u.first_name, u.last_name,
                bds.amount as scheduled_amount, bds.disbursement_type
         FROM government_benefits gb
         JOIN users u ON gb.user_id = u.id
         LEFT JOIN benefit_disbursement_schedules bds ON gb.id = bds.benefit_id
         WHERE gb.status = 'ACTIVE'
           AND (gb.next_disbursement_date = CURRENT_DATE
                OR bds.next_disbursement_date = CURRENT_DATE)
         ORDER BY gb.program_type, gb.created_at`
      );

      console.log(`Found ${result.rows.length} benefits to disburse today`);

      for (const benefit of result.rows) {
        await this.queueDisbursement({
          benefit_id: benefit.id,
          user_id: benefit.user_id,
          program_type: benefit.program_type,
          amount: benefit.scheduled_amount || this.calculateDisbursementAmount(benefit),
          disbursement_type: benefit.disbursement_type || 'REGULAR',
          user_details: {
            email: benefit.email,
            phone: benefit.phone,
            name: `${benefit.first_name} ${benefit.last_name}`
          }
        });
      }

      // Process the queue
      await this.processQueue();

      console.log('Daily disbursement processing completed');

    } catch (error) {
      console.error('Daily disbursement error:', error);
      this.emit('error', { type: 'DAILY_DISBURSEMENT_ERROR', error });
    } finally {
      client.release();
    }
  }

  /**
   * Process weekly UI benefits
   */
  async processUIWeeklyBenefits() {
    const client = await pool.connect();
    try {
      console.log('Processing weekly UI benefits...');

      const result = await client.query(
        `SELECT gb.*, u.*, uic.weekly_benefit_amount, uic.weeks_remaining
         FROM government_benefits gb
         JOIN users u ON gb.user_id = u.id
         JOIN ui_claims uic ON gb.id = uic.benefit_id
         WHERE gb.program_type = 'UI'
           AND gb.status = 'ACTIVE'
           AND uic.claim_status = 'APPROVED'
           AND uic.weeks_remaining > 0
           AND uic.last_certification_date >= CURRENT_DATE - INTERVAL '7 days'`
      );

      for (const claim of result.rows) {
        // Verify weekly certification was completed
        const certificationValid = await this.verifyWeeklyCertification(claim.id, client);

        if (certificationValid) {
          await this.issueDisbursement(
            claim.id,
            claim.user_id,
            'UI',
            claim.weekly_benefit_amount,
            'UI_WEEKLY',
            { claim_week: claim.current_week },
            client
          );

          // Update weeks remaining
          await client.query(
            `UPDATE ui_claims
             SET weeks_remaining = weeks_remaining - 1,
                 current_week = current_week + 1,
                 last_payment_date = NOW()
             WHERE benefit_id = $1`,
            [claim.id]
          );
        } else {
          // Flag for review
          await this.flagForReview(claim.id, 'CERTIFICATION_MISSING', client);
        }
      }

      console.log(`Processed ${result.rows.length} UI weekly benefits`);

    } catch (error) {
      console.error('UI weekly processing error:', error);
      this.emit('error', { type: 'UI_WEEKLY_ERROR', error });
    } finally {
      client.release();
    }
  }

  /**
   * Process monthly benefits (SNAP, TANF, WIC, etc.)
   */
  async processMonthlyBenefits() {
    const client = await pool.connect();
    try {
      console.log('Processing monthly benefits...');

      // Programs with monthly disbursements
      const monthlyPrograms = ['SNAP', 'TANF', 'WIC', 'SECTION_8', 'CHILD_CARE'];

      for (const program of monthlyPrograms) {
        const result = await client.query(
          `SELECT gb.*, u.*, bma.monthly_amount
           FROM government_benefits gb
           JOIN users u ON gb.user_id = u.id
           LEFT JOIN benefit_monthly_amounts bma ON gb.id = bma.benefit_id
           WHERE gb.program_type = $1
             AND gb.status = 'ACTIVE'
             AND (gb.last_disbursement_date IS NULL
                  OR gb.last_disbursement_date < DATE_TRUNC('month', CURRENT_DATE))`,
          [program]
        );

        console.log(`Processing ${result.rows.length} ${program} benefits`);

        for (const benefit of result.rows) {
          const amount = await this.calculateMonthlyBenefitAmount(benefit, client);

          if (amount > 0) {
            await this.issueDisbursement(
              benefit.id,
              benefit.user_id,
              program,
              amount,
              'MONTHLY_REGULAR',
              { month: new Date().toISOString().substring(0, 7) },
              client
            );
          }
        }
      }

      console.log('Monthly benefits processing completed');

    } catch (error) {
      console.error('Monthly benefits error:', error);
      this.emit('error', { type: 'MONTHLY_BENEFITS_ERROR', error });
    } finally {
      client.release();
    }
  }

  /**
   * Process emergency disbursements
   */
  async processEmergencyDisbursements() {
    const client = await pool.connect();
    try {
      // Check for pending emergency requests
      const result = await client.query(
        `SELECT er.*, gb.*, u.*
         FROM emergency_requests er
         JOIN government_benefits gb ON er.benefit_id = gb.id
         JOIN users u ON gb.user_id = u.id
         WHERE er.status = 'APPROVED'
           AND er.disbursed = false
           AND er.approved_at IS NOT NULL
         ORDER BY er.priority DESC, er.created_at ASC
         LIMIT 100`
      );

      if (result.rows.length > 0) {
        console.log(`Processing ${result.rows.length} emergency disbursements`);

        for (const request of result.rows) {
          await this.processEmergencyRequest(request, client);
        }
      }

    } catch (error) {
      console.error('Emergency disbursement error:', error);
      this.emit('error', { type: 'EMERGENCY_DISBURSEMENT_ERROR', error });
    } finally {
      client.release();
    }
  }

  /**
   * Issue a disbursement
   */
  async issueDisbursement(benefitId, userId, programType, amount, disbursementType, metadata, client) {
    try {
      await client.query('BEGIN');

      // Check current balance and limits
      const balanceCheck = await this.checkBalanceLimits(benefitId, amount, client);
      if (!balanceCheck.allowed) {
        console.log(`Disbursement blocked: ${balanceCheck.reason}`);
        await client.query('ROLLBACK');
        return { success: false, reason: balanceCheck.reason };
      }

      // Generate unique reference number
      const referenceNumber = this.generateReferenceNumber(programType, disbursementType);

      // Process through Monay-Fiat Rails
      const railsResult = await this.fiatRailsClient.processDisbursement({
        beneficiary_id: userId,
        amount: amount,
        program_type: programType,
        disbursement_type: disbursementType,
        reference_number: referenceNumber,
        metadata: metadata
      });

      if (!railsResult.success) {
        await client.query('ROLLBACK');
        return { success: false, reason: 'Payment rails processing failed' };
      }

      // Update benefit balance
      await client.query(
        `UPDATE government_benefits
         SET balance_amount = balance_amount + $1,
             last_disbursement_date = NOW(),
             last_disbursement_amount = $1,
             next_disbursement_date = $2,
             total_disbursed = COALESCE(total_disbursed, 0) + $1,
             updated_at = NOW()
         WHERE id = $3`,
        [amount, this.calculateNextDisbursementDate(programType), benefitId]
      );

      // Record disbursement
      const disbursementResult = await client.query(
        `INSERT INTO benefit_disbursements
         (benefit_id, amount, disbursement_type, reference_number,
          rails_transaction_id, status, metadata, issued_at)
         VALUES ($1, $2, $3, $4, $5, 'COMPLETED', $6, NOW())
         RETURNING *`,
        [benefitId, amount, disbursementType, referenceNumber,
         railsResult.transaction_id, metadata]
      );

      // Record transaction
      await client.query(
        `INSERT INTO benefit_transactions
         (benefit_id, transaction_type, amount, merchant_info,
          authorization_code, rails_transaction_id, status, transaction_date)
         VALUES ($1, 'CREDIT', $2, $3, $4, $5, 'COMPLETED', NOW())`,
        [benefitId, amount,
         { type: 'DISBURSEMENT', disbursement_type: disbursementType },
         referenceNumber, railsResult.transaction_id]
      );

      // Create audit log
      await client.query(
        `INSERT INTO benefit_audit_logs
         (benefit_id, user_id, action, details, timestamp)
         VALUES ($1, $2, 'DISBURSEMENT_ISSUED', $3, NOW())`,
        [benefitId, userId, {
          amount,
          disbursement_type: disbursementType,
          reference_number: referenceNumber,
          rails_transaction_id: railsResult.transaction_id
        }]
      );

      await client.query('COMMIT');

      // Send notification
      await this.sendDisbursementNotification(userId, programType, amount, referenceNumber);

      this.emit('disbursement_completed', {
        benefit_id: benefitId,
        user_id: userId,
        amount,
        reference_number: referenceNumber
      });

      return {
        success: true,
        disbursement: disbursementResult.rows[0],
        reference_number: referenceNumber
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Disbursement error:', error);
      throw error;
    }
  }

  /**
   * Queue disbursement for batch processing
   */
  async queueDisbursement(disbursementData) {
    this.issuanceQueue.push({
      ...disbursementData,
      queued_at: new Date(),
      attempts: 0,
      status: 'QUEUED'
    });

    this.emit('disbursement_queued', disbursementData);
  }

  /**
   * Process queued disbursements
   */
  async processQueue() {
    if (this.processingActive || this.issuanceQueue.length === 0) {
      return;
    }

    this.processingActive = true;
    const client = await pool.connect();

    try {
      console.log(`Processing ${this.issuanceQueue.length} queued disbursements`);

      while (this.issuanceQueue.length > 0) {
        const item = this.issuanceQueue.shift();

        try {
          await this.issueDisbursement(
            item.benefit_id,
            item.user_id,
            item.program_type,
            item.amount,
            item.disbursement_type,
            item.metadata || {},
            client
          );

          item.status = 'COMPLETED';
        } catch (error) {
          item.attempts++;
          item.last_error = error.message;

          if (item.attempts < 3) {
            // Retry later
            item.status = 'RETRY';
            this.issuanceQueue.push(item);
          } else {
            // Max retries reached
            item.status = 'FAILED';
            await this.recordFailedDisbursement(item, client);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      this.processingActive = false;
      client.release();
    }
  }

  /**
   * Start continuous queue processor
   */
  startQueueProcessor() {
    setInterval(async () => {
      if (this.issuanceQueue.length > 0) {
        await this.processQueue();
      }
    }, 30000); // Process every 30 seconds
  }

  /**
   * Process emergency request
   */
  async processEmergencyRequest(request, client) {
    try {
      // Validate emergency criteria
      const validation = await this.validateEmergencyCriteria(request, client);
      if (!validation.valid) {
        await this.rejectEmergencyRequest(request.id, validation.reason, client);
        return;
      }

      // Issue emergency disbursement with expedited processing
      const result = await this.issueDisbursement(
        request.benefit_id,
        request.user_id,
        request.program_type,
        request.requested_amount,
        'EMERGENCY',
        {
          emergency_type: request.emergency_type,
          request_id: request.id,
          expedited: true
        },
        client
      );

      if (result.success) {
        // Mark request as disbursed
        await client.query(
          `UPDATE emergency_requests
           SET disbursed = true,
               disbursement_date = NOW(),
               disbursement_reference = $1,
               status = 'DISBURSED'
           WHERE id = $2`,
          [result.reference_number, request.id]
        );

        // Send urgent notification
        await this.sendEmergencyNotification(request.user_id, request.requested_amount);
      }

    } catch (error) {
      console.error(`Emergency request ${request.id} failed:`, error);
      await this.recordFailedDisbursement({
        ...request,
        error: error.message
      }, client);
    }
  }

  /**
   * Calculate disbursement amount based on program rules
   */
  calculateDisbursementAmount(benefit) {
    const baseAmounts = {
      SNAP: 281,  // Average per person
      TANF: 492,  // Average per family
      WIC: 47,    // Average per person
      UI: 378,    // Average weekly
      SECTION_8: 1200,  // Average voucher
      CHILD_CARE: 800,  // Average subsidy
      LIHEAP: 500,      // Average assistance
      VETERANS: 1500    // Varies widely
    };

    return benefit.calculated_amount || baseAmounts[benefit.program_type] || 0;
  }

  /**
   * Calculate monthly benefit amount with adjustments
   */
  async calculateMonthlyBenefitAmount(benefit, client) {
    // Get household composition
    const householdResult = await client.query(
      `SELECT * FROM household_compositions
       WHERE user_id = $1 AND active = true`,
      [benefit.user_id]
    );

    const household = householdResult.rows[0] || { size: 1 };

    // Get program-specific calculation
    switch (benefit.program_type) {
      case 'SNAP':
        return this.calculateSNAPAmount(household);

      case 'TANF':
        return this.calculateTANFAmount(household);

      case 'WIC':
        return this.calculateWICAmount(household);

      case 'SECTION_8':
        return await this.calculateSection8Amount(benefit.user_id, client);

      default:
        return this.calculateDisbursementAmount(benefit);
    }
  }

  /**
   * SNAP benefit calculation
   */
  calculateSNAPAmount(household) {
    const maxAllotments = {
      1: 291, 2: 535, 3: 766, 4: 973,
      5: 1155, 6: 1386, 7: 1532, 8: 1751
    };

    const size = Math.min(household.size || 1, 8);
    let amount = maxAllotments[size];

    // Add for each additional person over 8
    if (household.size > 8) {
      amount += (household.size - 8) * 219;
    }

    // Deductions (simplified)
    const netIncome = household.net_income || 0;
    const thirtyPercentIncome = netIncome * 0.3;

    return Math.max(0, amount - thirtyPercentIncome);
  }

  /**
   * TANF benefit calculation
   */
  calculateTANFAmount(household) {
    // Base amount varies significantly by state
    // Using national average as example
    let baseAmount = 418;

    // Add per child
    const children = household.children_count || 0;
    baseAmount += children * 100;

    // Work incentive deduction
    if (household.has_earned_income) {
      baseAmount *= 1.2; // 20% work incentive
    }

    return Math.min(baseAmount, 1000); // Cap at state maximum
  }

  /**
   * WIC benefit calculation
   */
  calculateWICAmount(household) {
    let amount = 0;

    // Food package values (monthly averages)
    if (household.pregnant_women > 0) {
      amount += household.pregnant_women * 47;
    }
    if (household.breastfeeding_women > 0) {
      amount += household.breastfeeding_women * 52;
    }
    if (household.infants > 0) {
      amount += household.infants * 126; // Including formula
    }
    if (household.children_1_5 > 0) {
      amount += household.children_1_5 * 43;
    }

    return amount;
  }

  /**
   * Section 8 voucher calculation
   */
  async calculateSection8Amount(userId, client) {
    // Get fair market rent for area
    const rentResult = await client.query(
      `SELECT fmr.rent_amount, u.zip_code
       FROM users u
       LEFT JOIN fair_market_rents fmr ON u.zip_code = fmr.zip_code
       WHERE u.id = $1`,
      [userId]
    );

    const fairMarketRent = rentResult.rows[0]?.rent_amount || 1200;

    // Get tenant income
    const incomeResult = await client.query(
      `SELECT annual_income FROM income_verifications
       WHERE user_id = $1
       ORDER BY verification_date DESC
       LIMIT 1`,
      [userId]
    );

    const annualIncome = incomeResult.rows[0]?.annual_income || 0;
    const monthlyIncome = annualIncome / 12;

    // Tenant pays 30% of adjusted monthly income
    const tenantPayment = monthlyIncome * 0.3;

    // Housing assistance payment
    return Math.max(0, fairMarketRent - tenantPayment);
  }

  /**
   * Calculate next disbursement date
   */
  calculateNextDisbursementDate(programType) {
    const now = new Date();

    switch (programType) {
      case 'UI':
        // Weekly
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      case 'SNAP':
      case 'TANF':
      case 'WIC':
      case 'SECTION_8':
        // Monthly - first of next month
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth;

      case 'SCHOOL_CHOICE_ESA':
        // Quarterly
        const quarter = Math.floor(now.getMonth() / 3);
        const nextQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
        return nextQuarter;

      default:
        // Default to monthly
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }

  /**
   * Check balance limits before disbursement
   */
  async checkBalanceLimits(benefitId, amount, client) {
    const result = await client.query(
      `SELECT gb.*, bml.max_balance, bml.max_monthly_disbursement
       FROM government_benefits gb
       LEFT JOIN benefit_max_limits bml ON gb.program_type = bml.program_type
       WHERE gb.id = $1`,
      [benefitId]
    );

    const benefit = result.rows[0];
    if (!benefit) {
      return { allowed: false, reason: 'Benefit not found' };
    }

    // Check max balance
    if (benefit.max_balance && (benefit.balance_amount + amount) > benefit.max_balance) {
      return { allowed: false, reason: 'Would exceed maximum balance' };
    }

    // Check monthly disbursement limit
    const monthlyResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as monthly_total
       FROM benefit_disbursements
       WHERE benefit_id = $1
         AND issued_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [benefitId]
    );

    const monthlyTotal = monthlyResult.rows[0].monthly_total;
    if (benefit.max_monthly_disbursement && (monthlyTotal + amount) > benefit.max_monthly_disbursement) {
      return { allowed: false, reason: 'Would exceed monthly disbursement limit' };
    }

    return { allowed: true };
  }

  /**
   * Validate emergency criteria
   */
  async validateEmergencyCriteria(request, client) {
    // Check if user has had recent emergency disbursements
    const recentEmergency = await client.query(
      `SELECT COUNT(*) as count
       FROM benefit_disbursements
       WHERE benefit_id = $1
         AND disbursement_type = 'EMERGENCY'
         AND issued_at >= CURRENT_DATE - INTERVAL '30 days'`,
      [request.benefit_id]
    );

    if (recentEmergency.rows[0].count > 0) {
      return { valid: false, reason: 'Recent emergency disbursement already issued' };
    }

    // Validate emergency type
    const validTypes = ['NATURAL_DISASTER', 'MEDICAL_EMERGENCY', 'HOMELESSNESS_PREVENTION',
                       'UTILITY_SHUTOFF', 'FOOD_INSECURITY'];

    if (!validTypes.includes(request.emergency_type)) {
      return { valid: false, reason: 'Invalid emergency type' };
    }

    // Check documentation if required
    if (request.documentation_required && !request.documentation_provided) {
      return { valid: false, reason: 'Required documentation not provided' };
    }

    return { valid: true };
  }

  /**
   * Verify weekly certification for UI
   */
  async verifyWeeklyCertification(benefitId, client) {
    const result = await client.query(
      `SELECT * FROM ui_weekly_certifications
       WHERE benefit_id = $1
         AND certification_week = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
         AND certified = true`,
      [benefitId]
    );

    return result.rows.length > 0;
  }

  /**
   * Flag benefit for manual review
   */
  async flagForReview(benefitId, reason, client) {
    await client.query(
      `INSERT INTO benefit_review_flags
       (benefit_id, flag_reason, flagged_at, status)
       VALUES ($1, $2, NOW(), 'PENDING_REVIEW')`,
      [benefitId, reason]
    );

    this.emit('benefit_flagged', { benefit_id: benefitId, reason });
  }

  /**
   * Record failed disbursement
   */
  async recordFailedDisbursement(item, client) {
    await client.query(
      `INSERT INTO failed_disbursements
       (benefit_id, user_id, program_type, amount, disbursement_type,
        error_message, failed_at, retry_count)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
      [item.benefit_id, item.user_id, item.program_type, item.amount,
       item.disbursement_type, item.last_error || item.error, item.attempts || 0]
    );

    this.emit('disbursement_failed', item);
  }

  /**
   * Send disbursement notification
   */
  async sendDisbursementNotification(userId, programType, amount, referenceNumber) {
    // In production, integrate with notification service
    console.log(`Notification sent to user ${userId}: ${programType} disbursement of $${amount}`);

    this.emit('notification_sent', {
      user_id: userId,
      type: 'DISBURSEMENT',
      program_type: programType,
      amount,
      reference_number: referenceNumber
    });
  }

  /**
   * Send emergency notification
   */
  async sendEmergencyNotification(userId, amount) {
    console.log(`URGENT: Emergency disbursement of $${amount} sent to user ${userId}`);

    this.emit('emergency_notification_sent', {
      user_id: userId,
      amount,
      priority: 'HIGH'
    });
  }

  /**
   * Reject emergency request
   */
  async rejectEmergencyRequest(requestId, reason, client) {
    await client.query(
      `UPDATE emergency_requests
       SET status = 'REJECTED',
           rejection_reason = $1,
           rejected_at = NOW()
       WHERE id = $2`,
      [reason, requestId]
    );
  }

  /**
   * Generate unique reference number
   */
  generateReferenceNumber(programType, disbursementType) {
    const prefix = programType.substring(0, 3).toUpperCase();
    const type = disbursementType.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${prefix}-${type}-${timestamp}-${random}`;
  }

  /**
   * Shutdown workflow engine
   */
  shutdown() {
    console.log('Shutting down Benefit Issuance Workflows...');

    // Stop all scheduled jobs
    for (const [name, job] of this.scheduledJobs) {
      job.stop();
      console.log(`Stopped scheduled job: ${name}`);
    }

    this.scheduledJobs.clear();
    this.issuanceQueue = [];

    console.log('Benefit Issuance Workflows shutdown complete');
  }
}

// Export singleton instance
export default new BenefitIssuanceWorkflows();