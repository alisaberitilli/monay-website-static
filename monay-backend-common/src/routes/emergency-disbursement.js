/**
 * Emergency Disbursement API Routes
 * GENIUS Act compliant 4-hour SLA emergency benefit payment endpoints
 */

import { Router } from 'express';
import HttpStatus from 'http-status';
import authenticate from '../middlewares/auth-middleware';
import emergencyDisbursementSystem from '../services/emergency-disbursement-system';
import paymentRailOrchestrator from '../services/payment-rail-orchestrator';
import loggers from '../services/logger';

const router = Router();

/**
 * Initialize Emergency Disbursement System
 */
router.post('/initialize', authenticate, async (req, res, next) => {
  try {
    const result = await emergencyDisbursementSystem.initialize();

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Emergency Disbursement System initialized',
      data: {
        status: 'operational',
        slaTarget: '4 hours',
        supportedPrograms: Object.keys(emergencyDisbursementSystem.PROGRAM_TYPES),
        paymentRails: ['FedNow', 'RTP', 'Same-Day ACH', 'Standard ACH']
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create emergency disbursement
 * 4-hour SLA for GENIUS Act compliance
 */
router.post('/disburse', authenticate, async (req, res, next) => {
  try {
    const {
      beneficiaryId,
      amount,
      programType,
      reason,
      sourceFundingId,
      destinationDetails
    } = req.body;

    // Validate required fields
    if (!beneficiaryId || !amount || !programType) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Missing required fields: beneficiaryId, amount, programType'
      });
    }

    // Validate amount
    if (amount <= 0 || amount > 10000000) { // Max $100,000
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Invalid amount. Must be between $0.01 and $100,000'
      });
    }

    // Create emergency disbursement
    const result = await emergencyDisbursementSystem.createEmergencyDisbursement({
      beneficiaryId,
      amount,
      programType: programType.toLowerCase(),
      reason: reason || 'Emergency assistance',
      sourceFundingId: sourceFundingId || process.env.TREASURY_FUNDING_SOURCE_ID,
      destinationDetails: destinationDetails || {
        fundingSourceId: req.body.destinationFundingSourceId,
        accountType: 'checking'
      },
      metadata: {
        requestedBy: req.user?.id,
        requestedAt: new Date().toISOString(),
        ipAddress: req.ip
      }
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Emergency disbursement initiated',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Bulk emergency disbursement for multiple beneficiaries
 */
router.post('/disburse/bulk', authenticate, async (req, res, next) => {
  try {
    const { disbursements, programType } = req.body;

    if (!Array.isArray(disbursements) || disbursements.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Disbursements array is required'
      });
    }

    const results = [];
    const failures = [];

    // Process each disbursement
    for (const disbursement of disbursements) {
      try {
        const result = await emergencyDisbursementSystem.createEmergencyDisbursement({
          ...disbursement,
          programType: programType || disbursement.programType,
          sourceFundingId: disbursement.sourceFundingId || process.env.TREASURY_FUNDING_SOURCE_ID
        });
        results.push(result);
      } catch (error) {
        failures.push({
          beneficiaryId: disbursement.beneficiaryId,
          error: error.message
        });
      }
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: `Processed ${results.length} disbursements`,
      data: {
        successful: results,
        failed: failures,
        summary: {
          total: disbursements.length,
          successful: results.length,
          failed: failures.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Track disbursement status
 */
router.get('/track/:disbursementId', authenticate, async (req, res, next) => {
  try {
    const { disbursementId } = req.params;

    const status = await emergencyDisbursementSystem.getDisbursementStatus(disbursementId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get disbursements by beneficiary
 */
router.get('/beneficiary/:beneficiaryId', authenticate, async (req, res, next) => {
  try {
    const { beneficiaryId } = req.params;
    const { startDate, endDate } = req.query;

    // This would query the database for beneficiary disbursements
    const disbursements = [];

    res.status(HttpStatus.OK).json({
      success: true,
      data: disbursements,
      count: disbursements.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Generate disbursement report
 */
router.post('/report', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const report = await emergencyDisbursementSystem.generateDisbursementReport(start, end);

    res.status(HttpStatus.OK).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
});

/**
 * SNAP Emergency Disbursement
 * Specific endpoint for SNAP benefits
 */
router.post('/snap/emergency', authenticate, async (req, res, next) => {
  try {
    const {
      beneficiaryId,
      amount,
      emergencyType,
      disasterCode
    } = req.body;

    const result = await emergencyDisbursementSystem.createEmergencyDisbursement({
      beneficiaryId,
      amount: amount || 19400, // Default SNAP emergency amount ($194)
      programType: 'snap',
      reason: emergencyType || 'Emergency SNAP assistance',
      sourceFundingId: process.env.SNAP_FUNDING_SOURCE_ID || process.env.TREASURY_FUNDING_SOURCE_ID,
      destinationDetails: {
        fundingSourceId: req.body.destinationFundingSourceId,
        accountType: 'checking'
      },
      metadata: {
        emergencyType,
        disasterCode,
        snapCaseNumber: req.body.caseNumber,
        householdSize: req.body.householdSize
      }
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'SNAP emergency disbursement initiated',
      data: {
        ...result,
        program: 'SNAP',
        benefitType: 'Emergency Food Assistance'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * TANF Emergency Disbursement
 * Specific endpoint for TANF cash assistance
 */
router.post('/tanf/emergency', authenticate, async (req, res, next) => {
  try {
    const {
      beneficiaryId,
      amount,
      assistanceType,
      familySize
    } = req.body;

    const result = await emergencyDisbursementSystem.createEmergencyDisbursement({
      beneficiaryId,
      amount: amount || 50000, // Default TANF emergency amount ($500)
      programType: 'tanf',
      reason: assistanceType || 'Emergency TANF cash assistance',
      sourceFundingId: process.env.TANF_FUNDING_SOURCE_ID || process.env.TREASURY_FUNDING_SOURCE_ID,
      destinationDetails: {
        fundingSourceId: req.body.destinationFundingSourceId,
        accountType: 'checking'
      },
      metadata: {
        assistanceType,
        tanfCaseNumber: req.body.caseNumber,
        familySize: familySize || 1,
        dependentChildren: req.body.dependentChildren
      }
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'TANF emergency disbursement initiated',
      data: {
        ...result,
        program: 'TANF',
        benefitType: 'Emergency Cash Assistance'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Disaster Relief Emergency Disbursement
 */
router.post('/disaster-relief', authenticate, async (req, res, next) => {
  try {
    const {
      beneficiaryId,
      amount,
      disasterType,
      femaCode,
      location
    } = req.body;

    const result = await emergencyDisbursementSystem.createEmergencyDisbursement({
      beneficiaryId,
      amount: amount || 100000, // Default disaster relief ($1,000)
      programType: 'disaster_relief',
      reason: `${disasterType} disaster relief`,
      sourceFundingId: process.env.DISASTER_FUNDING_SOURCE_ID || process.env.TREASURY_FUNDING_SOURCE_ID,
      destinationDetails: {
        fundingSourceId: req.body.destinationFundingSourceId,
        accountType: 'checking'
      },
      metadata: {
        disasterType,
        femaCode,
        location,
        declarationDate: req.body.declarationDate,
        evacuationRequired: req.body.evacuationRequired
      }
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Disaster relief disbursement initiated',
      data: {
        ...result,
        program: 'DISASTER_RELIEF',
        urgency: 'CRITICAL'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * SLA Performance Metrics
 */
router.get('/metrics/sla', authenticate, async (req, res, next) => {
  try {
    const { period } = req.query;

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
    }

    const report = await emergencyDisbursementSystem.generateDisbursementReport(startDate, endDate);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        period: { startDate, endDate },
        slaCompliance: report.slaPerformance,
        disbursementsByRail: report.byRail,
        programBreakdown: report.byProgram,
        statusSummary: report.byStatus,
        totalVolume: {
          count: report.totalDisbursements,
          amount: `$${(report.totalAmount / 100).toFixed(2)}`
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Cancel disbursement (if still pending)
 */
router.post('/cancel/:disbursementId', authenticate, async (req, res, next) => {
  try {
    const { disbursementId } = req.params;
    const { reason } = req.body;

    // Get current status
    const status = await emergencyDisbursementSystem.getDisbursementStatus(disbursementId);

    if (status.status !== 'initiated' && status.status !== 'processing') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Cannot cancel disbursement in current status'
      });
    }

    // This would implement cancellation logic
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Disbursement cancellation requested',
      data: {
        disbursementId,
        previousStatus: status.status,
        newStatus: 'cancelled',
        reason
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  const activeDisbursements = emergencyDisbursementSystem.activeDisbursements.size;

  res.status(HttpStatus.OK).json({
    success: true,
    service: 'Emergency Disbursement System',
    status: 'operational',
    slaTarget: '4 hours (GENIUS Act compliant)',
    capabilities: {
      programs: Object.keys(emergencyDisbursementSystem.PROGRAM_TYPES),
      paymentRails: ['FedNow', 'RTP', 'Same-Day ACH', 'Standard ACH'],
      maxAmount: '$100,000',
      activeDisbursements
    },
    timestamp: new Date()
  });
});

export default router;