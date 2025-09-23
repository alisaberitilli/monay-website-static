const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../services/logger');
const db = require('../models');
const { BusinessRuleEngine } = require('./businessRuleEngine');

/**
 * Enhanced Business Rule Engine for Government Benefits with Fiat Rails Integration
 * Supports MCC restrictions, benefit program rules, and real-time authorization
 */
class BusinessRuleEngineFiatRails extends BusinessRuleEngine {
  constructor() {
    super();

    // Initialize Monay-Fiat Rails clients
    this.fiatRailsClient = {
      deposit: this.initFiatRailsClient('v3'), // For on-ramp operations
      payout: this.initFiatRailsClient('v1')   // For disbursements
    };

    // Program-specific MCC restrictions
    this.mccRestrictions = {
      SNAP: {
        allowed: [5411, 5422, 5441, 5451, 5499], // Grocery, food stores
        prohibited_items: ['alcohol', 'tobacco', 'hot_prepared_foods'],
        allow_cash_back: false,
        allow_atm: false
      },

      TANF: {
        prohibited: [5813, 5921, 7273, 7297, 7800, 7801, 7995, 9223],
        allow_cash_back: true,
        max_cash_back: 100,
        allow_atm: true,
        max_atm_daily: 200
      },

      MEDICAID: {
        allowed: [8011, 8021, 8031, 8041, 8042, 8043, 8049, 8050, 8062, 8071, 5912, 5975, 5976],
        copay_required: true
      },

      SCHOOL_CHOICE: {
        allowed: [8211, 8220, 8241, 8244, 8249, 8299, 5942, 5943, 5945, 8351],
        require_receipt: true,
        quarterly_reporting: true
      },

      UI: { // Unemployment Insurance
        prohibited: [7995, 5813, 7800], // Minimal restrictions
        allow_cash: true,
        weekly_certification: true
      },

      WIC: {
        allowed: [5411, 5451], // Only specific grocery stores
        vendor_specific: true,
        brand_specific: true,
        quantity_limited: true
      },

      SECTION_8: {
        payment_type: 'direct_to_landlord',
        allow_tenant_payment: false
      },

      LIHEAP: {
        vendor_payment: true,
        vendor_types: ['utility', 'fuel_dealer'],
        direct_benefit: false
      },

      CCAP: { // Child Care
        provider_payment: true,
        attendance_based: true,
        copayment: 'sliding_scale'
      },

      VETERANS: {
        unrestricted: ['disability_compensation'],
        education_only: [8211, 8220, 8241, 8244, 8249],
        healthcare_only: [8011, 8021, 8031, 8062]
      }
    };
  }

  /**
   * Initialize Monay-Fiat Rails API client
   */
  initFiatRailsClient(apiVersion) {
    const baseURL = process.env.NODE_ENV === 'production'
      ? 'https://gps.monay.com'
      : 'https://qaapi.monay.com/UtilliGPS';

    return axios.create({
      baseURL: `${baseURL}/api/${apiVersion}`,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.MONAY_FIAT_RAILS_API_KEY
      },
      timeout: 10000
    });
  }

  /**
   * Process benefit payment with full rule evaluation
   */
  async processBenefitPayment(transaction) {
    const startTime = Date.now();
    const transactionId = uuidv4();

    try {
      // 1. Load beneficiary context
      const context = await this.loadBeneficiaryContext(transaction.beneficiary_id);

      // 2. Evaluate all applicable rules
      const ruleEvaluation = await this.evaluateTransactionRules(transaction, context);

      if (!ruleEvaluation.approved) {
        await this.logDeniedTransaction(transactionId, transaction, ruleEvaluation);
        return {
          success: false,
          transactionId,
          reason: ruleEvaluation.denial_reason,
          failedRules: ruleEvaluation.failed_rules
        };
      }

      // 3. Process payment through appropriate rail
      const paymentResult = await this.routePayment(transaction, context, ruleEvaluation);

      // 4. Update balances if successful
      if (paymentResult.success) {
        await this.updateBenefitBalance(transaction, context);
      }

      // 5. Log transaction
      await this.logTransaction({
        transactionId,
        ...transaction,
        status: paymentResult.success ? 'APPROVED' : 'FAILED',
        processingTime: Date.now() - startTime,
        railUsed: paymentResult.rail,
        rulesApplied: ruleEvaluation.rules
      });

      return paymentResult;

    } catch (error) {
      logger.error('Benefit payment processing error:', error);
      throw error;
    }
  }

  /**
   * Evaluate all rules for a transaction
   */
  async evaluateTransactionRules(transaction, context) {
    const results = [];
    const program = context.programs.find(p => p.type === transaction.program_type);

    // 1. Eligibility check
    const eligibility = await this.checkEligibility(program);
    results.push({
      rule: 'eligibility',
      passed: eligibility.valid,
      reason: eligibility.reason
    });

    // 2. Balance check
    const balanceCheck = await this.checkBalance(transaction, program);
    results.push({
      rule: 'balance',
      passed: balanceCheck.sufficient,
      reason: balanceCheck.reason
    });

    // 3. MCC restrictions
    const mccCheck = await this.checkMCCRestrictions(transaction, program.type);
    results.push({
      rule: 'mcc_restriction',
      passed: mccCheck.allowed,
      reason: mccCheck.reason
    });

    // 4. Velocity limits
    const velocityCheck = await this.checkVelocityLimits(transaction, context);
    results.push({
      rule: 'velocity',
      passed: velocityCheck.passed,
      reason: velocityCheck.reason
    });

    // 5. Time restrictions
    const timeCheck = await this.checkTimeRestrictions(transaction, program);
    results.push({
      rule: 'time_restriction',
      passed: timeCheck.allowed,
      reason: timeCheck.reason
    });

    // 6. Program-specific rules
    const programRules = await this.evaluateProgramSpecificRules(transaction, program);
    results.push(...programRules);

    const allPassed = results.every(r => r.passed);

    return {
      approved: allPassed,
      denial_reason: results.find(r => !r.passed)?.reason,
      rules: results,
      failed_rules: results.filter(r => !r.passed)
    };
  }

  /**
   * Check MCC restrictions for program
   */
  async checkMCCRestrictions(transaction, programType) {
    const restrictions = this.mccRestrictions[programType];

    if (!restrictions) {
      return { allowed: true };
    }

    const mcc = transaction.merchant?.mcc_code;

    // Check allowed list
    if (restrictions.allowed && !restrictions.allowed.includes(parseInt(mcc))) {
      return {
        allowed: false,
        reason: `MCC ${mcc} not allowed for ${programType}`
      };
    }

    // Check prohibited list
    if (restrictions.prohibited && restrictions.prohibited.includes(parseInt(mcc))) {
      return {
        allowed: false,
        reason: `MCC ${mcc} prohibited for ${programType}`
      };
    }

    // Check cash back restrictions
    if (transaction.cash_back > 0) {
      if (!restrictions.allow_cash_back) {
        return {
          allowed: false,
          reason: 'Cash back not allowed for this program'
        };
      }
      if (transaction.cash_back > restrictions.max_cash_back) {
        return {
          allowed: false,
          reason: `Cash back exceeds limit of $${restrictions.max_cash_back}`
        };
      }
    }

    // Check ATM restrictions
    if (transaction.type === 'ATM') {
      if (!restrictions.allow_atm) {
        return {
          allowed: false,
          reason: 'ATM withdrawals not allowed for this program'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Route payment through appropriate rail
   */
  async routePayment(transaction, context, ruleEvaluation) {
    const { type, amount, merchant, program_type } = transaction;

    try {
      let result;

      switch (type) {
        case 'CARD_PURCHASE':
          result = await this.processCardPurchase(transaction, context);
          break;

        case 'ACH_DISBURSEMENT':
          result = await this.processACHDisbursement(transaction, context);
          break;

        case 'BENEFIT_LOAD':
          result = await this.loadBenefitFunds(transaction, context);
          break;

        case 'ATM_WITHDRAWAL':
          result = await this.processATMWithdrawal(transaction, context);
          break;

        case 'VENDOR_PAYMENT':
          result = await this.processVendorPayment(transaction, context);
          break;

        default:
          throw new Error(`Unsupported transaction type: ${type}`);
      }

      return {
        success: true,
        ...result,
        rail: result.rail || 'MONAY_FIAT_RAILS'
      };

    } catch (error) {
      logger.error('Payment routing error:', error);
      return {
        success: false,
        error: error.message,
        rail: 'FAILED'
      };
    }
  }

  /**
   * Process card purchase through Monay-Fiat Rails
   */
  async processCardPurchase(transaction, context) {
    const payload = {
      amount: transaction.amount,
      currency: 'USD',
      merchant: {
        name: transaction.merchant.name,
        mcc: transaction.merchant.mcc_code,
        location: transaction.merchant.location
      },
      card: {
        token: context.beneficiary.card_token,
        type: 'PREPAID'
      },
      metadata: {
        program: transaction.program_type,
        beneficiary_id: transaction.beneficiary_id,
        restrictions: this.mccRestrictions[transaction.program_type]
      }
    };

    const response = await this.fiatRailsClient.deposit.post('/authorize', payload);

    return {
      transactionId: response.data.transaction_id,
      status: response.data.status,
      authCode: response.data.auth_code,
      rail: 'CARD_NETWORK'
    };
  }

  /**
   * Process ACH disbursement
   */
  async processACHDisbursement(transaction, context) {
    const payload = {
      recipient: {
        account_number: context.beneficiary.bank_account,
        routing_number: context.beneficiary.bank_routing,
        name: context.beneficiary.name
      },
      amount: transaction.amount,
      description: `${transaction.program_type} Benefit Payment`,
      metadata: {
        program: transaction.program_type,
        period: transaction.benefit_period
      }
    };

    const response = await this.fiatRailsClient.payout.post('/disbursements', payload);

    return {
      transactionId: response.data.transaction_id,
      status: response.data.status,
      expectedSettlement: response.data.expected_settlement,
      rail: response.data.rail_used // ACH, FedNow, or RTP
    };
  }

  /**
   * Load benefit funds to prepaid card
   */
  async loadBenefitFunds(transaction, context) {
    const payload = {
      card_id: context.beneficiary.card_id,
      amount: transaction.amount,
      program: transaction.program_type,
      period: transaction.benefit_period,
      load_type: 'MONTHLY_BENEFIT'
    };

    const response = await this.fiatRailsClient.deposit.post('/card/load', payload);

    return {
      transactionId: response.data.transaction_id,
      newBalance: response.data.new_balance,
      rail: 'PREPAID_LOAD'
    };
  }

  /**
   * Process vendor payment (for Section 8, LIHEAP, etc.)
   */
  async processVendorPayment(transaction, context) {
    const payload = {
      vendor: {
        id: transaction.vendor_id,
        type: transaction.vendor_type
      },
      amount: transaction.amount,
      beneficiary: {
        id: transaction.beneficiary_id,
        account: transaction.account_number
      },
      program: transaction.program_type,
      invoice: transaction.invoice_number
    };

    const response = await this.fiatRailsClient.payout.post('/vendor-payments', payload);

    return {
      transactionId: response.data.transaction_id,
      paymentReference: response.data.payment_reference,
      rail: 'VENDOR_DIRECT'
    };
  }

  /**
   * Evaluate program-specific rules
   */
  async evaluateProgramSpecificRules(transaction, program) {
    const rules = [];

    switch (program.type) {
      case 'SNAP':
        if (transaction.items) {
          const itemCheck = await this.evaluateSNAPItems(transaction.items);
          rules.push({
            rule: 'snap_item_eligibility',
            passed: itemCheck.all_eligible,
            reason: itemCheck.reason
          });
        }
        break;

      case 'SCHOOL_CHOICE':
        if (transaction.receipt_required) {
          const receiptCheck = await this.validateEducationReceipt(transaction);
          rules.push({
            rule: 'education_receipt',
            passed: receiptCheck.valid,
            reason: receiptCheck.reason
          });
        }
        break;

      case 'TANF':
        const timeLimitCheck = await this.checkTANFTimeLimit(program);
        rules.push({
          rule: 'tanf_time_limit',
          passed: !timeLimitCheck.exceeded,
          reason: timeLimitCheck.reason
        });
        break;

      case 'UI':
        const certificationCheck = await this.checkWeeklyCertification(program);
        rules.push({
          rule: 'weekly_certification',
          passed: certificationCheck.certified,
          reason: certificationCheck.reason
        });
        break;

      case 'WIC':
        const wicItemCheck = await this.validateWICItems(transaction);
        rules.push({
          rule: 'wic_approved_items',
          passed: wicItemCheck.valid,
          reason: wicItemCheck.reason
        });
        break;
    }

    return rules;
  }

  /**
   * Check SNAP item eligibility
   */
  async evaluateSNAPItems(items) {
    const ineligible = items.filter(item =>
      item.category === 'alcohol' ||
      item.category === 'tobacco' ||
      item.is_hot_prepared ||
      item.category === 'pet_food' ||
      item.category === 'vitamins'
    );

    if (ineligible.length > 0) {
      return {
        all_eligible: false,
        reason: `${ineligible.length} items not SNAP eligible`,
        ineligible_items: ineligible
      };
    }

    return { all_eligible: true };
  }

  /**
   * Check TANF time limits
   */
  async checkTANFTimeLimit(program) {
    const monthsUsed = program.months_used || 0;
    const federalLimit = 60;

    if (monthsUsed >= federalLimit) {
      return {
        exceeded: true,
        reason: 'Federal 60-month lifetime limit reached',
        months_used: monthsUsed,
        months_remaining: 0
      };
    }

    return {
      exceeded: false,
      months_used: monthsUsed,
      months_remaining: federalLimit - monthsUsed
    };
  }

  /**
   * Update benefit balance after transaction
   */
  async updateBenefitBalance(transaction, context) {
    const { beneficiary_id, program_type, amount, type } = transaction;

    await db.sequelize.transaction(async (t) => {
      // Get current balance
      const balance = await db.BenefitBalance.findOne({
        where: {
          beneficiary_id,
          program_type,
          benefit_month: new Date().toISOString().slice(0, 7)
        },
        transaction: t,
        lock: true
      });

      if (type === 'BENEFIT_LOAD') {
        // Adding funds
        balance.current_balance += amount;
        balance.monthly_allotment = amount;
      } else {
        // Spending funds
        balance.current_balance -= amount;
        balance.amount_spent_this_month += amount;
        balance.amount_spent_this_year += amount;
      }

      await balance.save({ transaction: t });

      // Log balance change
      await db.BalanceHistory.create({
        beneficiary_id,
        program_type,
        transaction_type: type,
        amount,
        balance_before: balance.current_balance + (type === 'BENEFIT_LOAD' ? -amount : amount),
        balance_after: balance.current_balance,
        transaction_id: transaction.id
      }, { transaction: t });
    });
  }

  /**
   * Real-time authorization endpoint
   */
  async authorizeTransaction(req) {
    const startTime = Date.now();

    try {
      const transaction = {
        beneficiary_id: req.beneficiary_id,
        program_type: req.program,
        type: 'CARD_PURCHASE',
        amount: req.amount,
        merchant: {
          name: req.merchant_name,
          mcc_code: req.mcc,
          location: req.location
        },
        timestamp: new Date()
      };

      const result = await this.processBenefitPayment(transaction);

      // Target: <2 second response time
      const processingTime = Date.now() - startTime;
      if (processingTime > 2000) {
        logger.warn(`Slow authorization: ${processingTime}ms`);
      }

      return {
        authorized: result.success,
        auth_code: result.transactionId,
        reason: result.reason,
        processing_time_ms: processingTime
      };

    } catch (error) {
      logger.error('Authorization error:', error);
      return {
        authorized: false,
        reason: 'System error',
        processing_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * Batch benefit loading for monthly distributions
   */
  async loadMonthlyBenefits() {
    const today = new Date();
    const beneficiaries = await db.BenefitEnrollment.findAll({
      where: {
        enrollment_status: 'ACTIVE',
        [db.Sequelize.Op.or]: [
          { load_day: today.getDate() },
          { load_day: null } // Default to 1st of month
        ]
      },
      include: [{
        model: db.Beneficiary,
        include: [db.Household]
      }]
    });

    const results = [];

    for (const enrollment of beneficiaries) {
      try {
        // Calculate benefit amount
        const amount = await this.calculateBenefitAmount(enrollment);

        // Process the load
        const transaction = {
          beneficiary_id: enrollment.beneficiary_id,
          program_type: enrollment.program_type,
          type: 'BENEFIT_LOAD',
          amount,
          benefit_period: today.toISOString().slice(0, 7)
        };

        const result = await this.processBenefitPayment(transaction);
        results.push({
          beneficiary_id: enrollment.beneficiary_id,
          program: enrollment.program_type,
          success: result.success,
          amount
        });

      } catch (error) {
        logger.error(`Failed to load benefits for ${enrollment.beneficiary_id}:`, error);
        results.push({
          beneficiary_id: enrollment.beneficiary_id,
          program: enrollment.program_type,
          success: false,
          error: error.message
        });
      }
    }

    return {
      total: beneficiaries.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Calculate benefit amount based on program rules
   */
  async calculateBenefitAmount(enrollment) {
    const { program_type, Beneficiary } = enrollment;
    const household = Beneficiary.Household;

    switch (program_type) {
      case 'SNAP':
        return this.calculateSNAPBenefit(household);

      case 'TANF':
        return this.calculateTANFBenefit(household);

      case 'UI':
        return enrollment.program_data.weekly_benefit_amount;

      case 'WIC':
        return enrollment.program_data.monthly_allowance;

      case 'SCHOOL_CHOICE':
        return enrollment.program_data.annual_amount / 12;

      default:
        return enrollment.program_data.monthly_amount || 0;
    }
  }

  /**
   * Calculate SNAP benefit amount
   */
  calculateSNAPBenefit(household) {
    const maxBenefits = {
      1: 291, 2: 535, 3: 766, 4: 973,
      5: 1155, 6: 1386, 7: 1532, 8: 1751
    };

    const size = household.household_size;
    const maxBenefit = maxBenefits[size] || (1751 + (size - 8) * 219);
    const deduction = household.monthly_net_income * 0.3;

    return Math.max(maxBenefit - deduction, size === 1 ? 23 : 0);
  }
}

module.exports = BusinessRuleEngineFiatRails;