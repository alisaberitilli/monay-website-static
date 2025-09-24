/**
 * Emergency Disbursement System
 * GENIUS Act Compliant - 4-hour SLA for emergency benefit payments
 * Integrates with Dwolla FedNow/RTP for instant payments
 */

import dwollaPaymentService from './dwolla-payment';
import paymentRailOrchestrator from './payment-rail-orchestrator';
import loggers from './logger';
import db from '../models/index.js';
import { CustomError } from '../middlewares/errors';
import HttpStatus from 'http-status';

class EmergencyDisbursementSystem {
  constructor() {
    // SLA Requirements (in seconds)
    this.SLA_TARGETS = {
      EMERGENCY: 14400,    // 4 hours (GENIUS Act requirement)
      URGENT: 7200,        // 2 hours
      STANDARD: 86400,     // 24 hours
      BATCH: 259200        // 72 hours
    };

    // Disbursement status tracking
    this.DISBURSEMENT_STATUS = {
      INITIATED: 'initiated',
      VERIFIED: 'verified',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
      EXPIRED: 'expired'
    };

    // Program types
    this.PROGRAM_TYPES = {
      SNAP: 'snap',
      TANF: 'tanf',
      WIC: 'wic',
      UNEMPLOYMENT: 'unemployment',
      DISASTER_RELIEF: 'disaster_relief',
      EMERGENCY_CASH: 'emergency_cash',
      MEDICAID: 'medicaid',
      HOUSING_ASSISTANCE: 'housing_assistance',
      VETERAN_BENEFITS: 'veteran_benefits'
    };

    // Payment rail priority for emergency disbursements
    this.RAIL_PRIORITY = ['FEDNOW', 'RTP', 'SAME_DAY_ACH', 'STANDARD_ACH'];

    // Active disbursements tracking
    this.activeDisbursements = new Map();

    // SLA monitoring intervals
    this.slaMonitoringInterval = null;
  }

  /**
   * Initialize the emergency disbursement system
   */
  async initialize() {
    try {
      // Ensure Dwolla is initialized
      await dwollaPaymentService.initialize();

      // Start SLA monitoring
      this.startSLAMonitoring();

      // Load pending disbursements from database
      await this.loadPendingDisbursements();

      loggers.infoLogger.info('Emergency Disbursement System initialized');
      return { success: true, message: 'System initialized' };
    } catch (error) {
      loggers.errorLogger.error(`Failed to initialize Emergency Disbursement System: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create emergency disbursement request
   */
  async createEmergencyDisbursement(disbursementData) {
    try {
      const {
        beneficiaryId,
        amount,
        programType,
        reason,
        sourceFundingId,
        destinationDetails,
        metadata = {}
      } = disbursementData;

      // Validate beneficiary eligibility
      const eligibility = await this.verifyBeneficiaryEligibility(beneficiaryId, programType);
      if (!eligibility.eligible) {
        throw new CustomError(
          `Beneficiary not eligible: ${eligibility.reason}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Create disbursement record
      const disbursementId = `emrg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const disbursement = {
        id: disbursementId,
        beneficiaryId,
        amount,
        programType,
        reason,
        status: this.DISBURSEMENT_STATUS.INITIATED,
        priority: 'emergency',
        slaTarget: this.SLA_TARGETS.EMERGENCY,
        initiatedAt: new Date(),
        expiresAt: new Date(Date.now() + this.SLA_TARGETS.EMERGENCY * 1000),
        sourceFundingId,
        destinationDetails,
        metadata: {
          ...metadata,
          eligibilityVerified: true,
          verificationId: eligibility.verificationId
        }
      };

      // Store in active disbursements
      this.activeDisbursements.set(disbursementId, disbursement);

      // Save to database
      await this.saveDisbursementToDB(disbursement);

      // Process immediately
      this.processEmergencyDisbursement(disbursementId);

      return {
        success: true,
        disbursementId,
        status: disbursement.status,
        estimatedCompletion: this.calculateEstimatedCompletion(disbursement),
        slaTarget: '4 hours',
        trackingUrl: `/api/emergency-disbursement/track/${disbursementId}`
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to create emergency disbursement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process emergency disbursement with rail optimization
   */
  async processEmergencyDisbursement(disbursementId) {
    try {
      const disbursement = this.activeDisbursements.get(disbursementId);
      if (!disbursement) {
        throw new Error(`Disbursement ${disbursementId} not found`);
      }

      // Update status
      disbursement.status = this.DISBURSEMENT_STATUS.PROCESSING;
      disbursement.processingStartedAt = new Date();

      // Check destination bank eligibility for instant payments
      const destinationEligibility = await this.checkInstantPaymentEligibility(
        disbursement.destinationDetails
      );

      // Select optimal payment rail
      const selectedRail = await this.selectOptimalRail(
        disbursement.amount,
        destinationEligibility
      );

      loggers.infoLogger.info(`Processing emergency disbursement ${disbursementId} via ${selectedRail}`);

      // Process payment through selected rail
      let paymentResult;

      if (selectedRail === 'FEDNOW' || selectedRail === 'RTP') {
        paymentResult = await this.processInstantDisbursement(disbursement, selectedRail);
      } else if (selectedRail === 'SAME_DAY_ACH') {
        paymentResult = await this.processSameDayACHDisbursement(disbursement);
      } else {
        paymentResult = await this.processStandardACHDisbursement(disbursement);
      }

      // Update disbursement status
      if (paymentResult.success) {
        disbursement.status = this.DISBURSEMENT_STATUS.COMPLETED;
        disbursement.completedAt = new Date();
        disbursement.paymentId = paymentResult.paymentId;
        disbursement.railUsed = selectedRail;

        // Calculate SLA performance
        const slaPerformance = this.calculateSLAPerformance(disbursement);
        disbursement.slaPerformance = slaPerformance;

        // Send notification
        await this.sendDisbursementNotification(disbursement, 'completed');

        loggers.infoLogger.info(
          `Emergency disbursement ${disbursementId} completed in ${slaPerformance.actualTime} seconds`
        );
      } else {
        disbursement.status = this.DISBURSEMENT_STATUS.FAILED;
        disbursement.failureReason = paymentResult.error;

        // Trigger retry logic
        await this.handleDisbursementFailure(disbursement);
      }

      // Update database
      await this.updateDisbursementInDB(disbursement);

      return paymentResult;
    } catch (error) {
      loggers.errorLogger.error(`Failed to process emergency disbursement: ${error.message}`);

      const disbursement = this.activeDisbursements.get(disbursementId);
      if (disbursement) {
        disbursement.status = this.DISBURSEMENT_STATUS.FAILED;
        disbursement.failureReason = error.message;
        await this.updateDisbursementInDB(disbursement);
      }

      throw error;
    }
  }

  /**
   * Process instant disbursement through FedNow/RTP
   */
  async processInstantDisbursement(disbursement, rail) {
    try {
      const result = await dwollaPaymentService.processInstantPayment({
        sourceFundingSourceId: disbursement.sourceFundingId,
        destinationFundingSourceId: disbursement.destinationDetails.fundingSourceId,
        amount: disbursement.amount,
        metadata: {
          disbursementId: disbursement.id,
          programType: disbursement.programType,
          beneficiaryId: disbursement.beneficiaryId,
          rail: rail,
          priority: 'emergency',
          slaTarget: '4_hours'
        },
        correlationId: `emergency_${disbursement.id}`
      });

      return {
        success: true,
        paymentId: result.transferId,
        network: result.network,
        processingTime: result.processingTime
      };
    } catch (error) {
      loggers.errorLogger.error(`Instant disbursement failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process same-day ACH disbursement
   */
  async processSameDayACHDisbursement(disbursement) {
    try {
      const result = await dwollaPaymentService.processACHPayment({
        sourceFundingSourceId: disbursement.sourceFundingId,
        destinationFundingSourceId: disbursement.destinationDetails.fundingSourceId,
        amount: disbursement.amount,
        clearing: 'same-day',
        metadata: {
          disbursementId: disbursement.id,
          programType: disbursement.programType,
          beneficiaryId: disbursement.beneficiaryId,
          priority: 'emergency'
        },
        correlationId: `emergency_ach_${disbursement.id}`
      });

      return {
        success: true,
        paymentId: result.transferId,
        clearing: result.clearing,
        estimatedCompletion: result.estimatedCompletion
      };
    } catch (error) {
      loggers.errorLogger.error(`Same-day ACH disbursement failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process standard ACH disbursement (fallback)
   */
  async processStandardACHDisbursement(disbursement) {
    try {
      const result = await dwollaPaymentService.processACHPayment({
        sourceFundingSourceId: disbursement.sourceFundingId,
        destinationFundingSourceId: disbursement.destinationDetails.fundingSourceId,
        amount: disbursement.amount,
        clearing: 'standard',
        metadata: {
          disbursementId: disbursement.id,
          programType: disbursement.programType,
          beneficiaryId: disbursement.beneficiaryId,
          priority: 'emergency',
          slaWarning: 'May exceed 4-hour SLA'
        },
        correlationId: `emergency_standard_${disbursement.id}`
      });

      // Log SLA risk
      loggers.warnLogger.warn(
        `Emergency disbursement ${disbursement.id} using standard ACH - SLA at risk`
      );

      return {
        success: true,
        paymentId: result.transferId,
        clearing: result.clearing,
        estimatedCompletion: result.estimatedCompletion,
        slaWarning: true
      };
    } catch (error) {
      loggers.errorLogger.error(`Standard ACH disbursement failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify beneficiary eligibility for emergency disbursement
   */
  async verifyBeneficiaryEligibility(beneficiaryId, programType) {
    try {
      // Check beneficiary status
      const beneficiary = await this.getBeneficiaryDetails(beneficiaryId);

      if (!beneficiary) {
        return {
          eligible: false,
          reason: 'Beneficiary not found'
        };
      }

      // Check program enrollment
      if (!beneficiary.enrolledPrograms?.includes(programType)) {
        return {
          eligible: false,
          reason: `Not enrolled in ${programType}`
        };
      }

      // Check identity verification
      if (!beneficiary.identityVerified) {
        return {
          eligible: false,
          reason: 'Identity not verified'
        };
      }

      // Check for duplicate disbursements
      const recentDisbursement = await this.checkRecentDisbursements(
        beneficiaryId,
        programType
      );

      if (recentDisbursement) {
        return {
          eligible: false,
          reason: 'Recent disbursement already processed'
        };
      }

      // Check benefit balance
      const balance = await this.checkBenefitBalance(beneficiaryId, programType);
      if (balance <= 0) {
        return {
          eligible: false,
          reason: 'No available benefit balance'
        };
      }

      return {
        eligible: true,
        verificationId: `verify_${Date.now()}`,
        availableBalance: balance
      };
    } catch (error) {
      loggers.errorLogger.error(`Eligibility verification failed: ${error.message}`);
      return {
        eligible: false,
        reason: 'Verification system error'
      };
    }
  }

  /**
   * Check instant payment eligibility
   */
  async checkInstantPaymentEligibility(destinationDetails) {
    try {
      if (!destinationDetails.fundingSourceId) {
        return { eligible: false };
      }

      const eligibility = await dwollaPaymentService.checkInstantPaymentEligibility(
        destinationDetails.fundingSourceId
      );

      return eligibility;
    } catch (error) {
      loggers.errorLogger.error(`Failed to check instant payment eligibility: ${error.message}`);
      return { eligible: false };
    }
  }

  /**
   * Select optimal payment rail based on eligibility and urgency
   */
  async selectOptimalRail(amount, destinationEligibility) {
    // For emergency disbursements, prioritize speed
    if (destinationEligibility.eligible &&
        destinationEligibility.channels?.includes('real-time-payments')) {
      // Check if amount is within instant payment limits
      if (amount <= 100000000) { // $1M limit
        return 'RTP'; // Dwolla will automatically route between RTP and FedNow
      }
    }

    // Fall back to same-day ACH if within business hours
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    if (day >= 1 && day <= 5 && hour >= 6 && hour < 17) {
      if (amount <= 10000000) { // $100K limit for same-day ACH
        return 'SAME_DAY_ACH';
      }
    }

    // Default to standard ACH
    return 'STANDARD_ACH';
  }

  /**
   * Calculate SLA performance
   */
  calculateSLAPerformance(disbursement) {
    const startTime = new Date(disbursement.initiatedAt);
    const endTime = new Date(disbursement.completedAt || Date.now());
    const actualTime = Math.floor((endTime - startTime) / 1000); // in seconds
    const targetTime = disbursement.slaTarget;

    return {
      actualTime,
      targetTime,
      withinSLA: actualTime <= targetTime,
      performance: Math.round((1 - (actualTime / targetTime)) * 100), // Percentage under/over SLA
      railUsed: disbursement.railUsed
    };
  }

  /**
   * Start SLA monitoring
   */
  startSLAMonitoring() {
    // Check SLA compliance every minute
    this.slaMonitoringInterval = setInterval(() => {
      this.checkSLACompliance();
    }, 60000); // 1 minute

    loggers.infoLogger.info('SLA monitoring started');
  }

  /**
   * Check SLA compliance for all active disbursements
   */
  async checkSLACompliance() {
    const now = Date.now();

    for (const [disbursementId, disbursement] of this.activeDisbursements) {
      if (disbursement.status === this.DISBURSEMENT_STATUS.PROCESSING ||
          disbursement.status === this.DISBURSEMENT_STATUS.INITIATED) {

        const elapsed = (now - new Date(disbursement.initiatedAt).getTime()) / 1000;
        const remaining = disbursement.slaTarget - elapsed;

        // Alert if less than 30 minutes remaining
        if (remaining < 1800 && remaining > 0 && !disbursement.slaAlerted) {
          await this.sendSLAAlert(disbursement, remaining);
          disbursement.slaAlerted = true;
        }

        // Mark as expired if SLA breached
        if (remaining <= 0 && disbursement.status !== this.DISBURSEMENT_STATUS.EXPIRED) {
          disbursement.status = this.DISBURSEMENT_STATUS.EXPIRED;
          await this.handleSLABreach(disbursement);
        }
      }
    }
  }

  /**
   * Send SLA alert
   */
  async sendSLAAlert(disbursement, remainingSeconds) {
    const remainingMinutes = Math.floor(remainingSeconds / 60);

    loggers.warnLogger.warn(
      `SLA Alert: Disbursement ${disbursement.id} has ${remainingMinutes} minutes remaining`
    );

    // Trigger escalation
    await this.escalateDisbursement(disbursement);
  }

  /**
   * Handle SLA breach
   */
  async handleSLABreach(disbursement) {
    loggers.errorLogger.error(
      `SLA BREACH: Disbursement ${disbursement.id} exceeded ${disbursement.slaTarget} second target`
    );

    // Update status
    disbursement.status = this.DISBURSEMENT_STATUS.EXPIRED;
    disbursement.slaBreach = true;
    disbursement.breachTime = new Date();

    // Save to database
    await this.updateDisbursementInDB(disbursement);

    // Send critical alert
    await this.sendCriticalAlert(disbursement);

    // Trigger automatic remediation
    await this.triggerRemediation(disbursement);
  }

  /**
   * Escalate disbursement processing
   */
  async escalateDisbursement(disbursement) {
    // Attempt to upgrade to faster rail if possible
    if (disbursement.railUsed === 'STANDARD_ACH') {
      loggers.infoLogger.info(`Attempting to escalate disbursement ${disbursement.id} to faster rail`);

      // Cancel current transfer if possible
      if (disbursement.paymentId) {
        try {
          await dwollaPaymentService.cancelTransfer(disbursement.paymentId);

          // Retry with higher priority
          disbursement.priority = 'critical';
          await this.processEmergencyDisbursement(disbursement.id);
        } catch (error) {
          loggers.errorLogger.error(`Failed to escalate disbursement: ${error.message}`);
        }
      }
    }
  }

  /**
   * Handle disbursement failure
   */
  async handleDisbursementFailure(disbursement) {
    disbursement.retryCount = (disbursement.retryCount || 0) + 1;

    if (disbursement.retryCount < 3) {
      // Retry with exponential backoff
      const delay = Math.pow(2, disbursement.retryCount) * 1000;

      setTimeout(() => {
        loggers.infoLogger.info(`Retrying disbursement ${disbursement.id} (attempt ${disbursement.retryCount})`);
        this.processEmergencyDisbursement(disbursement.id);
      }, delay);
    } else {
      // Max retries exceeded
      await this.sendCriticalAlert(disbursement);
      await this.triggerManualReview(disbursement);
    }
  }

  /**
   * Calculate estimated completion time
   */
  calculateEstimatedCompletion(disbursement) {
    const rail = disbursement.railUsed || 'UNKNOWN';

    const estimates = {
      FEDNOW: 'Within 20 seconds',
      RTP: 'Within 15 seconds',
      SAME_DAY_ACH: 'Within 4 hours',
      STANDARD_ACH: '1-2 business days',
      UNKNOWN: 'Within 4 hours (SLA target)'
    };

    return estimates[rail];
  }

  /**
   * Get disbursement status
   */
  async getDisbursementStatus(disbursementId) {
    const disbursement = this.activeDisbursements.get(disbursementId);

    if (!disbursement) {
      // Try loading from database
      const dbDisbursement = await this.loadDisbursementFromDB(disbursementId);
      if (!dbDisbursement) {
        throw new CustomError('Disbursement not found', HttpStatus.NOT_FOUND);
      }
      return this.formatDisbursementStatus(dbDisbursement);
    }

    return this.formatDisbursementStatus(disbursement);
  }

  /**
   * Format disbursement status for API response
   */
  formatDisbursementStatus(disbursement) {
    const elapsed = (Date.now() - new Date(disbursement.initiatedAt).getTime()) / 1000;
    const remaining = Math.max(0, disbursement.slaTarget - elapsed);

    return {
      disbursementId: disbursement.id,
      status: disbursement.status,
      amount: disbursement.amount,
      beneficiaryId: disbursement.beneficiaryId,
      programType: disbursement.programType,
      railUsed: disbursement.railUsed,
      initiatedAt: disbursement.initiatedAt,
      completedAt: disbursement.completedAt,
      sla: {
        target: '4 hours',
        elapsed: `${Math.floor(elapsed / 60)} minutes`,
        remaining: `${Math.floor(remaining / 60)} minutes`,
        withinSLA: remaining > 0 || disbursement.status === this.DISBURSEMENT_STATUS.COMPLETED
      },
      paymentDetails: disbursement.paymentId ? {
        paymentId: disbursement.paymentId,
        network: disbursement.network
      } : null
    };
  }

  // Database helper methods (mock implementations)
  async saveDisbursementToDB(disbursement) {
    // Save to database
    loggers.infoLogger.info(`Saved disbursement ${disbursement.id} to database`);
  }

  async updateDisbursementInDB(disbursement) {
    // Update in database
    loggers.infoLogger.info(`Updated disbursement ${disbursement.id} in database`);
  }

  async loadDisbursementFromDB(disbursementId) {
    // Load from database
    return null;
  }

  async loadPendingDisbursements() {
    // Load pending disbursements from database
    loggers.infoLogger.info('Loaded pending disbursements from database');
  }

  async getBeneficiaryDetails(beneficiaryId) {
    // Mock beneficiary data
    return {
      id: beneficiaryId,
      enrolledPrograms: ['snap', 'tanf'],
      identityVerified: true
    };
  }

  async checkRecentDisbursements(beneficiaryId, programType) {
    // Check for recent disbursements
    return null;
  }

  async checkBenefitBalance(beneficiaryId, programType) {
    // Return available balance
    return 50000; // $500 in cents
  }

  async sendDisbursementNotification(disbursement, type) {
    loggers.infoLogger.info(`Notification sent for disbursement ${disbursement.id}: ${type}`);
  }

  async sendCriticalAlert(disbursement) {
    loggers.errorLogger.error(`CRITICAL ALERT: Disbursement ${disbursement.id} requires immediate attention`);
  }

  async triggerRemediation(disbursement) {
    loggers.infoLogger.info(`Remediation triggered for disbursement ${disbursement.id}`);
  }

  async triggerManualReview(disbursement) {
    loggers.infoLogger.info(`Manual review required for disbursement ${disbursement.id}`);
  }

  /**
   * Generate disbursement report
   */
  async generateDisbursementReport(startDate, endDate) {
    const report = {
      period: { startDate, endDate },
      totalDisbursements: 0,
      totalAmount: 0,
      byProgram: {},
      byStatus: {},
      slaPerformance: {
        withinSLA: 0,
        breached: 0,
        averageTime: 0
      },
      byRail: {}
    };

    // Aggregate data from active disbursements
    for (const [id, disbursement] of this.activeDisbursements) {
      const disbDate = new Date(disbursement.initiatedAt);
      if (disbDate >= startDate && disbDate <= endDate) {
        report.totalDisbursements++;
        report.totalAmount += disbursement.amount;

        // By program
        report.byProgram[disbursement.programType] =
          (report.byProgram[disbursement.programType] || 0) + 1;

        // By status
        report.byStatus[disbursement.status] =
          (report.byStatus[disbursement.status] || 0) + 1;

        // By rail
        if (disbursement.railUsed) {
          report.byRail[disbursement.railUsed] =
            (report.byRail[disbursement.railUsed] || 0) + 1;
        }

        // SLA performance
        if (disbursement.slaPerformance) {
          if (disbursement.slaPerformance.withinSLA) {
            report.slaPerformance.withinSLA++;
          } else {
            report.slaPerformance.breached++;
          }
        }
      }
    }

    // Calculate SLA percentage
    const total = report.slaPerformance.withinSLA + report.slaPerformance.breached;
    report.slaPerformance.percentage = total > 0
      ? Math.round((report.slaPerformance.withinSLA / total) * 100)
      : 100;

    return report;
  }

  /**
   * Shutdown system gracefully
   */
  async shutdown() {
    if (this.slaMonitoringInterval) {
      clearInterval(this.slaMonitoringInterval);
    }

    // Save all active disbursements to database
    for (const [id, disbursement] of this.activeDisbursements) {
      await this.updateDisbursementInDB(disbursement);
    }

    loggers.infoLogger.info('Emergency Disbursement System shutdown complete');
  }
}

export default new EmergencyDisbursementSystem();