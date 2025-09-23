/**
 * SNAP/TANF Benefit Management System
 * Comprehensive benefit program management for government assistance
 * GENIUS Act compliant with real-time distribution capabilities
 */

import emergencyDisbursementSystem from './emergency-disbursement-system';
import dwollaPaymentService from './dwolla-payment';
import loggers from './logger';
import { CustomError } from '../middlewares/errors';
import HttpStatus from 'http-status';

class SNAPTANFBenefitSystem {
  constructor() {
    // SNAP (Supplemental Nutrition Assistance Program) Configuration
    this.SNAP_CONFIG = {
      maxMonthlyBenefit: {
        1: 29100,  // $291 for household of 1
        2: 53500,  // $535 for household of 2
        3: 76600,  // $766 for household of 3
        4: 97300,  // $973 for household of 4
        5: 115500, // $1,155 for household of 5
        6: 138600, // $1,386 for household of 6
        7: 153200, // $1,532 for household of 7
        8: 175900, // $1,759 for household of 8
        additional: 22000 // $220 for each additional person
      },
      incomeLimit: {
        gross: 130, // 130% of federal poverty level
        net: 100    // 100% of federal poverty level
      },
      deductions: {
        standard: {
          1: 19800,  // $198 for household of 1-3
          4: 20800,  // $208 for household of 4
          5: 24400,  // $244 for household of 5
          6: 27900   // $279 for household of 6+
        },
        earnedIncome: 0.20, // 20% of earned income
        childSupport: 1.00, // 100% deductible
        medicalExpenses: 35.00, // Expenses over $35 for elderly/disabled
        shelterCap: 62400 // $624 maximum shelter deduction
      },
      eligiblePurchases: [
        'FOOD', 'PRODUCE', 'DAIRY', 'MEAT', 'BREAD', 'CEREALS',
        'SNACKS', 'NON_ALCOHOLIC_BEVERAGES', 'SEEDS_PLANTS'
      ],
      restrictedPurchases: [
        'ALCOHOL', 'TOBACCO', 'VITAMINS', 'HOT_FOODS',
        'PET_FOOD', 'CLEANING_SUPPLIES', 'PAPER_PRODUCTS'
      ]
    };

    // TANF (Temporary Assistance for Needy Families) Configuration
    this.TANF_CONFIG = {
      maxMonthlyBenefit: {
        1: 20400,  // $204 for single adult
        2: 32700,  // $327 for parent + 1 child
        3: 40300,  // $403 for parent + 2 children
        4: 49700,  // $497 for parent + 3 children
        5: 57700,  // $577 for parent + 4 children
        additional: 8000 // $80 for each additional child
      },
      timeLimit: {
        lifetime: 60, // 60 months lifetime limit
        consecutive: 24 // Some states limit consecutive months
      },
      workRequirements: {
        hoursPerWeek: 30, // Single parents
        hoursPerWeekTwoParent: 35, // Two-parent families
        exemptionAge: 60, // Age 60+ exempt
        childAgeExemption: 1 // Exempt if child under 1 year
      },
      eligibleExpenses: [
        'RENT', 'UTILITIES', 'CLOTHING', 'TRANSPORTATION',
        'MEDICAL', 'CHILDCARE', 'EDUCATION', 'JOB_TRAINING'
      ]
    };

    // WIC (Women, Infants, and Children) Configuration
    this.WIC_CONFIG = {
      eligibleCategories: ['PREGNANT', 'POSTPARTUM', 'BREASTFEEDING', 'INFANT', 'CHILD'],
      incomeLimit: 185, // 185% of federal poverty level
      benefitPackages: {
        PREGNANT: 4700,     // $47/month
        BREASTFEEDING: 5200, // $52/month
        POSTPARTUM: 4700,    // $47/month
        INFANT: 11300,       // $113/month (formula)
        CHILD: 4300          // $43/month
      }
    };

    // Benefit card types
    this.CARD_TYPES = {
      EBT_SNAP: 'ebt_snap',
      EBT_CASH: 'ebt_cash',
      WIC: 'wic_card',
      COMBINED: 'combined_benefits'
    };

    // Transaction categories
    this.TRANSACTION_CATEGORIES = {
      BENEFIT_LOAD: 'benefit_load',
      PURCHASE: 'purchase',
      CASH_WITHDRAWAL: 'cash_withdrawal',
      TRANSFER: 'transfer',
      REFUND: 'refund',
      ADJUSTMENT: 'adjustment'
    };

    // Active beneficiaries cache
    this.beneficiaries = new Map();

    // Transaction monitoring
    this.transactionMonitor = new Map();
  }

  /**
   * Initialize SNAP/TANF system
   */
  async initialize() {
    try {
      // Load beneficiaries from database
      await this.loadBeneficiaries();

      // Start benefit calculation scheduler
      this.startBenefitScheduler();

      // Initialize fraud detection
      this.initializeFraudDetection();

      loggers.infoLogger.info('SNAP/TANF Benefit System initialized');
      return { success: true };
    } catch (error) {
      loggers.errorLogger.error(`Failed to initialize SNAP/TANF system: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enroll beneficiary in SNAP program
   */
  async enrollSNAP(enrollmentData) {
    try {
      const {
        beneficiaryId,
        householdSize,
        monthlyIncome,
        expenses,
        hasElderly,
        hasDisabled,
        dependents
      } = enrollmentData;

      // Verify eligibility
      const eligibility = await this.verifySNAPEligibility({
        householdSize,
        monthlyIncome,
        expenses,
        hasElderly,
        hasDisabled
      });

      if (!eligibility.eligible) {
        throw new CustomError(
          `Not eligible for SNAP: ${eligibility.reason}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Calculate benefit amount
      const benefitAmount = this.calculateSNAPBenefit({
        householdSize,
        monthlyIncome,
        expenses,
        hasElderly,
        hasDisabled
      });

      // Create SNAP account
      const snapAccount = {
        beneficiaryId,
        programType: 'SNAP',
        status: 'ACTIVE',
        enrollmentDate: new Date(),
        householdSize,
        monthlyBenefit: benefitAmount,
        balance: 0,
        nextIssuanceDate: this.getNextIssuanceDate(),
        eligibilityDetails: eligibility,
        recertificationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        cardNumber: this.generateEBTCardNumber(),
        restrictions: this.SNAP_CONFIG.restrictedPurchases
      };

      // Store beneficiary
      this.beneficiaries.set(`snap_${beneficiaryId}`, snapAccount);

      // Issue initial benefits
      await this.issueSNAPBenefits(beneficiaryId, benefitAmount);

      return {
        success: true,
        beneficiaryId,
        programType: 'SNAP',
        monthlyBenefit: `$${(benefitAmount / 100).toFixed(2)}`,
        cardNumber: snapAccount.cardNumber,
        nextIssuance: snapAccount.nextIssuanceDate,
        eligibilityPeriod: '6 months'
      };
    } catch (error) {
      loggers.errorLogger.error(`SNAP enrollment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enroll beneficiary in TANF program
   */
  async enrollTANF(enrollmentData) {
    try {
      const {
        beneficiaryId,
        familySize,
        monthlyIncome,
        hasMinorChildren,
        employmentStatus,
        previousMonthsReceived = 0
      } = enrollmentData;

      // Check lifetime limit
      if (previousMonthsReceived >= this.TANF_CONFIG.timeLimit.lifetime) {
        throw new CustomError(
          'Lifetime TANF limit (60 months) reached',
          HttpStatus.BAD_REQUEST
        );
      }

      // Verify eligibility
      const eligibility = await this.verifyTANFEligibility({
        familySize,
        monthlyIncome,
        hasMinorChildren,
        employmentStatus
      });

      if (!eligibility.eligible) {
        throw new CustomError(
          `Not eligible for TANF: ${eligibility.reason}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Calculate benefit amount
      const benefitAmount = this.calculateTANFBenefit(familySize, monthlyIncome);

      // Create TANF account
      const tanfAccount = {
        beneficiaryId,
        programType: 'TANF',
        status: 'ACTIVE',
        enrollmentDate: new Date(),
        familySize,
        monthlyBenefit: benefitAmount,
        cashBalance: 0,
        monthsRemaining: this.TANF_CONFIG.timeLimit.lifetime - previousMonthsReceived,
        workRequirement: this.determineWorkRequirement(enrollmentData),
        nextIssuanceDate: this.getNextIssuanceDate(),
        eligibilityDetails: eligibility,
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        cardNumber: this.generateEBTCardNumber(),
        allowedCategories: this.TANF_CONFIG.eligibleExpenses
      };

      // Store beneficiary
      this.beneficiaries.set(`tanf_${beneficiaryId}`, tanfAccount);

      // Issue initial benefits
      await this.issueTANFBenefits(beneficiaryId, benefitAmount);

      return {
        success: true,
        beneficiaryId,
        programType: 'TANF',
        monthlyBenefit: `$${(benefitAmount / 100).toFixed(2)}`,
        cardNumber: tanfAccount.cardNumber,
        monthsRemaining: tanfAccount.monthsRemaining,
        workRequirement: tanfAccount.workRequirement,
        nextReview: tanfAccount.reviewDate
      };
    } catch (error) {
      loggers.errorLogger.error(`TANF enrollment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process SNAP benefit issuance
   */
  async issueSNAPBenefits(beneficiaryId, amount) {
    try {
      const account = this.beneficiaries.get(`snap_${beneficiaryId}`);
      if (!account) {
        throw new Error('SNAP account not found');
      }

      // Create disbursement through emergency system for fast delivery
      const disbursement = await emergencyDisbursementSystem.createEmergencyDisbursement({
        beneficiaryId,
        amount,
        programType: 'snap',
        reason: 'Monthly SNAP benefit issuance',
        sourceFundingId: process.env.SNAP_TREASURY_FUNDING_ID,
        destinationDetails: {
          fundingSourceId: account.fundingSourceId,
          accountType: 'ebt_snap'
        },
        metadata: {
          benefitMonth: new Date().toISOString().substring(0, 7),
          householdSize: account.householdSize,
          issuanceType: 'regular'
        }
      });

      // Update account balance
      account.balance += amount;
      account.lastIssuance = new Date();
      account.transactionHistory = account.transactionHistory || [];
      account.transactionHistory.push({
        type: this.TRANSACTION_CATEGORIES.BENEFIT_LOAD,
        amount,
        date: new Date(),
        description: 'Monthly SNAP benefit',
        disbursementId: disbursement.disbursementId
      });

      loggers.infoLogger.info(`SNAP benefits issued: ${beneficiaryId} - $${(amount / 100).toFixed(2)}`);

      return {
        success: true,
        amount,
        newBalance: account.balance,
        disbursementId: disbursement.disbursementId
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to issue SNAP benefits: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process TANF cash benefit issuance
   */
  async issueTANFBenefits(beneficiaryId, amount) {
    try {
      const account = this.beneficiaries.get(`tanf_${beneficiaryId}`);
      if (!account) {
        throw new Error('TANF account not found');
      }

      // Create disbursement
      const disbursement = await emergencyDisbursementSystem.createEmergencyDisbursement({
        beneficiaryId,
        amount,
        programType: 'tanf',
        reason: 'Monthly TANF cash assistance',
        sourceFundingId: process.env.TANF_TREASURY_FUNDING_ID,
        destinationDetails: {
          fundingSourceId: account.fundingSourceId,
          accountType: 'ebt_cash'
        },
        metadata: {
          benefitMonth: new Date().toISOString().substring(0, 7),
          familySize: account.familySize,
          monthsUsed: this.TANF_CONFIG.timeLimit.lifetime - account.monthsRemaining
        }
      });

      // Update account
      account.cashBalance += amount;
      account.lastIssuance = new Date();
      account.monthsRemaining--;
      account.transactionHistory = account.transactionHistory || [];
      account.transactionHistory.push({
        type: this.TRANSACTION_CATEGORIES.BENEFIT_LOAD,
        amount,
        date: new Date(),
        description: 'Monthly TANF assistance',
        disbursementId: disbursement.disbursementId
      });

      loggers.infoLogger.info(`TANF benefits issued: ${beneficiaryId} - $${(amount / 100).toFixed(2)}`);

      return {
        success: true,
        amount,
        newBalance: account.cashBalance,
        monthsRemaining: account.monthsRemaining,
        disbursementId: disbursement.disbursementId
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to issue TANF benefits: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process benefit purchase transaction
   */
  async processPurchase(transactionData) {
    try {
      const {
        beneficiaryId,
        programType,
        amount,
        merchantId,
        merchantCategory,
        items = []
      } = transactionData;

      const accountKey = `${programType.toLowerCase()}_${beneficiaryId}`;
      const account = this.beneficiaries.get(accountKey);

      if (!account) {
        throw new CustomError('Account not found', HttpStatus.NOT_FOUND);
      }

      // Check balance
      const balance = programType === 'SNAP' ? account.balance : account.cashBalance;
      if (balance < amount) {
        throw new CustomError('Insufficient balance', HttpStatus.BAD_REQUEST);
      }

      // Validate purchase eligibility
      if (programType === 'SNAP') {
        const validation = this.validateSNAPPurchase(items, merchantCategory);
        if (!validation.valid) {
          throw new CustomError(
            `Invalid SNAP purchase: ${validation.reason}`,
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // Process transaction
      const transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        beneficiaryId,
        programType,
        type: this.TRANSACTION_CATEGORIES.PURCHASE,
        amount,
        merchantId,
        merchantCategory,
        items,
        date: new Date(),
        status: 'COMPLETED'
      };

      // Update balance
      if (programType === 'SNAP') {
        account.balance -= amount;
      } else {
        account.cashBalance -= amount;
      }

      // Record transaction
      account.transactionHistory = account.transactionHistory || [];
      account.transactionHistory.push(transaction);

      // Check for fraud patterns
      await this.checkFraudPatterns(beneficiaryId, transaction);

      return {
        success: true,
        transactionId: transaction.id,
        remainingBalance: programType === 'SNAP' ? account.balance : account.cashBalance,
        amount
      };
    } catch (error) {
      loggers.errorLogger.error(`Purchase transaction failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate SNAP benefit amount
   */
  calculateSNAPBenefit(eligibilityData) {
    const { householdSize, monthlyIncome, expenses, hasElderly, hasDisabled } = eligibilityData;

    // Get maximum benefit for household size
    let maxBenefit = this.SNAP_CONFIG.maxMonthlyBenefit[householdSize] ||
      (this.SNAP_CONFIG.maxMonthlyBenefit[8] +
       (householdSize - 8) * this.SNAP_CONFIG.maxMonthlyBenefit.additional);

    // Calculate net income after deductions
    let netIncome = monthlyIncome;

    // Apply standard deduction
    const standardDeduction = householdSize <= 3 ? this.SNAP_CONFIG.deductions.standard[1] :
      householdSize === 4 ? this.SNAP_CONFIG.deductions.standard[4] :
      householdSize === 5 ? this.SNAP_CONFIG.deductions.standard[5] :
      this.SNAP_CONFIG.deductions.standard[6];

    netIncome -= standardDeduction;

    // Apply earned income deduction (20%)
    netIncome -= (monthlyIncome * this.SNAP_CONFIG.deductions.earnedIncome);

    // Apply shelter deduction
    const shelterCosts = expenses.rent + expenses.utilities;
    const shelterDeduction = Math.min(shelterCosts, this.SNAP_CONFIG.deductions.shelterCap);
    netIncome -= shelterDeduction;

    // Apply medical deduction for elderly/disabled
    if (hasElderly || hasDisabled) {
      const medicalDeduction = Math.max(0, expenses.medical - 3500); // Deduct amount over $35
      netIncome -= medicalDeduction;
    }

    // Calculate benefit (30% of net income)
    const thirtyPercentNetIncome = Math.floor(netIncome * 0.30);
    const benefitAmount = Math.max(0, maxBenefit - thirtyPercentNetIncome);

    // Minimum benefit for small households
    if (householdSize <= 2 && benefitAmount < 2300) { // $23 minimum
      return 2300;
    }

    return benefitAmount;
  }

  /**
   * Calculate TANF benefit amount
   */
  calculateTANFBenefit(familySize, monthlyIncome) {
    // Get maximum benefit for family size
    let maxBenefit = this.TANF_CONFIG.maxMonthlyBenefit[familySize] ||
      (this.TANF_CONFIG.maxMonthlyBenefit[5] +
       (familySize - 5) * this.TANF_CONFIG.maxMonthlyBenefit.additional);

    // Apply income reduction (typically 50% of earned income reduces benefit)
    const incomeReduction = Math.floor(monthlyIncome * 0.50);
    const benefitAmount = Math.max(0, maxBenefit - incomeReduction);

    return benefitAmount;
  }

  /**
   * Verify SNAP eligibility
   */
  async verifySNAPEligibility(data) {
    const { householdSize, monthlyIncome, hasElderly, hasDisabled } = data;

    // Calculate gross income limit (130% of federal poverty level)
    const federalPovertyLevel = this.getFederalPovertyLevel(householdSize);
    const grossIncomeLimit = Math.floor(federalPovertyLevel * (this.SNAP_CONFIG.incomeLimit.gross / 100));
    const netIncomeLimit = Math.floor(federalPovertyLevel * (this.SNAP_CONFIG.incomeLimit.net / 100));

    // Check gross income test (waived for elderly/disabled)
    if (!hasElderly && !hasDisabled && monthlyIncome > grossIncomeLimit) {
      return {
        eligible: false,
        reason: `Gross income ($${monthlyIncome / 100}) exceeds limit ($${grossIncomeLimit / 100})`
      };
    }

    // Additional eligibility checks would go here (assets, work requirements, etc.)

    return {
      eligible: true,
      grossIncomeLimit,
      netIncomeLimit,
      householdSize
    };
  }

  /**
   * Verify TANF eligibility
   */
  async verifyTANFEligibility(data) {
    const { familySize, monthlyIncome, hasMinorChildren, employmentStatus } = data;

    // Must have minor children
    if (!hasMinorChildren) {
      return {
        eligible: false,
        reason: 'Must have minor children in household'
      };
    }

    // Income test (varies by state, using 50% of federal poverty level as example)
    const federalPovertyLevel = this.getFederalPovertyLevel(familySize);
    const incomeLimit = Math.floor(federalPovertyLevel * 0.50);

    if (monthlyIncome > incomeLimit) {
      return {
        eligible: false,
        reason: `Income ($${monthlyIncome / 100}) exceeds limit ($${incomeLimit / 100})`
      };
    }

    // Work requirement check
    if (employmentStatus === 'unemployed') {
      // Would need to verify job search activities
    }

    return {
      eligible: true,
      incomeLimit,
      familySize,
      workRequirementApplies: true
    };
  }

  /**
   * Validate SNAP purchase
   */
  validateSNAPPurchase(items, merchantCategory) {
    // Check if merchant category is eligible
    const restrictedCategories = ['LIQUOR_STORE', 'CASINO', 'ADULT_ENTERTAINMENT'];
    if (restrictedCategories.includes(merchantCategory)) {
      return {
        valid: false,
        reason: `Merchant category ${merchantCategory} not eligible for SNAP`
      };
    }

    // Check individual items
    for (const item of items) {
      if (this.SNAP_CONFIG.restrictedPurchases.includes(item.category)) {
        return {
          valid: false,
          reason: `Item category ${item.category} not eligible for SNAP`
        };
      }

      // Check for hot/prepared foods
      if (item.isHot || item.isPrepared) {
        return {
          valid: false,
          reason: 'Hot/prepared foods not eligible for SNAP'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Get federal poverty level for household size
   */
  getFederalPovertyLevel(householdSize) {
    // 2025 Federal Poverty Levels (annual, converted to monthly cents)
    const povertyLevels = {
      1: 125500,  // $1,255/month
      2: 170300,  // $1,703/month
      3: 215200,  // $2,152/month
      4: 260000,  // $2,600/month
      5: 304800,  // $3,048/month
      6: 349700,  // $3,497/month
      7: 394500,  // $3,945/month
      8: 439300   // $4,393/month
    };

    if (householdSize <= 8) {
      return povertyLevels[householdSize];
    }

    // For households larger than 8, add $448/month per additional person
    return povertyLevels[8] + ((householdSize - 8) * 44800);
  }

  /**
   * Determine work requirements for TANF
   */
  determineWorkRequirement(data) {
    const { employmentStatus, hasChildUnder1, beneficiaryAge } = data;

    // Exempt if child under 1 year
    if (hasChildUnder1) {
      return {
        required: false,
        reason: 'Exempt - child under 1 year'
      };
    }

    // Exempt if over 60
    if (beneficiaryAge >= this.TANF_CONFIG.workRequirements.exemptionAge) {
      return {
        required: false,
        reason: 'Exempt - age 60+'
      };
    }

    // Otherwise work requirement applies
    return {
      required: true,
      hoursPerWeek: this.TANF_CONFIG.workRequirements.hoursPerWeek,
      activities: ['EMPLOYMENT', 'JOB_SEARCH', 'EDUCATION', 'VOCATIONAL_TRAINING']
    };
  }

  /**
   * Check for fraud patterns
   */
  async checkFraudPatterns(beneficiaryId, transaction) {
    const recentTransactions = this.transactionMonitor.get(beneficiaryId) || [];

    // Add current transaction
    recentTransactions.push(transaction);

    // Keep only last 24 hours of transactions
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const filteredTransactions = recentTransactions.filter(t =>
      new Date(t.date).getTime() > oneDayAgo
    );

    // Check for suspicious patterns
    const suspiciousPatterns = [];

    // Multiple transactions at same merchant in short time
    const merchantCounts = {};
    filteredTransactions.forEach(t => {
      merchantCounts[t.merchantId] = (merchantCounts[t.merchantId] || 0) + 1;
    });

    Object.entries(merchantCounts).forEach(([merchantId, count]) => {
      if (count > 3) {
        suspiciousPatterns.push({
          type: 'MULTIPLE_MERCHANT_TRANSACTIONS',
          merchantId,
          count
        });
      }
    });

    // Unusual spending velocity
    const totalSpent = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    if (totalSpent > 50000) { // More than $500 in 24 hours
      suspiciousPatterns.push({
        type: 'HIGH_VELOCITY_SPENDING',
        amount: totalSpent,
        transactionCount: filteredTransactions.length
      });
    }

    // Store updated transactions
    this.transactionMonitor.set(beneficiaryId, filteredTransactions);

    // Alert if suspicious patterns detected
    if (suspiciousPatterns.length > 0) {
      loggers.warnLogger.warn(`Suspicious patterns detected for ${beneficiaryId}:`, suspiciousPatterns);
      // Would trigger additional review or temporary hold
    }
  }

  /**
   * Generate EBT card number
   */
  generateEBTCardNumber() {
    // Generate a mock 16-digit EBT card number
    const prefix = '5077'; // EBT prefix
    const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return prefix + random;
  }

  /**
   * Get next benefit issuance date
   */
  getNextIssuanceDate() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Benefits typically issued on specific days based on case number
    // For simplicity, using the 5th of each month
    nextMonth.setDate(5);

    return nextMonth;
  }

  /**
   * Start benefit calculation scheduler
   */
  startBenefitScheduler() {
    // Would implement cron job to run monthly benefit calculations
    loggers.infoLogger.info('Benefit scheduler started');
  }

  /**
   * Initialize fraud detection system
   */
  initializeFraudDetection() {
    // Would implement ML-based fraud detection
    loggers.infoLogger.info('Fraud detection system initialized');
  }

  /**
   * Load beneficiaries from database
   */
  async loadBeneficiaries() {
    // Would load from database
    loggers.infoLogger.info('Beneficiaries loaded from database');
  }

  /**
   * Get beneficiary account information
   */
  async getBeneficiaryAccount(beneficiaryId, programType) {
    const accountKey = `${programType.toLowerCase()}_${beneficiaryId}`;
    const account = this.beneficiaries.get(accountKey);

    if (!account) {
      throw new CustomError('Account not found', HttpStatus.NOT_FOUND);
    }

    return {
      beneficiaryId,
      programType,
      status: account.status,
      balance: programType === 'SNAP' ? account.balance : account.cashBalance,
      monthlyBenefit: account.monthlyBenefit,
      nextIssuance: account.nextIssuanceDate,
      cardNumber: account.cardNumber.replace(/\d(?=\d{4})/g, '*'), // Mask all but last 4
      enrollmentDate: account.enrollmentDate,
      recertificationDate: account.recertificationDate || account.reviewDate
    };
  }

  /**
   * Generate benefit report
   */
  async generateBenefitReport(startDate, endDate) {
    const report = {
      period: { startDate, endDate },
      snap: {
        totalBeneficiaries: 0,
        totalBenefitsIssued: 0,
        averageBenefit: 0,
        totalTransactions: 0
      },
      tanf: {
        totalBeneficiaries: 0,
        totalBenefitsIssued: 0,
        averageBenefit: 0,
        monthsUsed: 0
      },
      fraud: {
        alertsGenerated: 0,
        casesInvestigated: 0,
        amountRecovered: 0
      }
    };

    // Calculate statistics from beneficiaries
    for (const [key, account] of this.beneficiaries) {
      if (key.startsWith('snap_')) {
        report.snap.totalBeneficiaries++;
        report.snap.totalBenefitsIssued += account.monthlyBenefit || 0;
      } else if (key.startsWith('tanf_')) {
        report.tanf.totalBeneficiaries++;
        report.tanf.totalBenefitsIssued += account.monthlyBenefit || 0;
      }
    }

    // Calculate averages
    if (report.snap.totalBeneficiaries > 0) {
      report.snap.averageBenefit = Math.floor(
        report.snap.totalBenefitsIssued / report.snap.totalBeneficiaries
      );
    }

    if (report.tanf.totalBeneficiaries > 0) {
      report.tanf.averageBenefit = Math.floor(
        report.tanf.totalBenefitsIssued / report.tanf.totalBeneficiaries
      );
    }

    return report;
  }
}

export default new SNAPTANFBenefitSystem();