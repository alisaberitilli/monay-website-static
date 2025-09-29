/**
 * SNAP/TANF Benefits API Routes
 * Comprehensive benefit management endpoints for government assistance programs
 */

import { Router } from 'express';
import HttpStatus from 'http-status';
import authenticate from '../middlewares/auth-middleware.js';
import snapTanfSystem from '../services/snap-tanf-benefit-system.js';
import emergencyDisbursementSystem from '../services/emergency-disbursement-system.js';
import loggers from '../services/logger.js';

const router = Router();

/**
 * Initialize SNAP/TANF System
 */
router.post('/initialize', authenticate, async (req, res, next) => {
  try {
    const result = await snapTanfSystem.initialize();

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'SNAP/TANF Benefit System initialized',
      data: {
        programs: ['SNAP', 'TANF', 'WIC'],
        status: 'operational',
        features: {
          realTimeIssuance: true,
          fraudDetection: true,
          ebtCardManagement: true,
          purchaseValidation: true
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * SNAP Program Enrollment
 */
router.post('/snap/enroll', authenticate, async (req, res, next) => {
  try {
    const {
      beneficiaryId,
      householdSize,
      monthlyIncome,
      expenses,
      hasElderly,
      hasDisabled,
      dependents
    } = req.body;

    // Validate required fields
    if (!beneficiaryId || !householdSize || monthlyIncome === undefined) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Missing required fields: beneficiaryId, householdSize, monthlyIncome'
      });
    }

    const result = await snapTanfSystem.enrollSNAP({
      beneficiaryId,
      householdSize: parseInt(householdSize),
      monthlyIncome: parseInt(monthlyIncome),
      expenses: expenses || {
        rent: 0,
        utilities: 0,
        medical: 0,
        childcare: 0
      },
      hasElderly: hasElderly || false,
      hasDisabled: hasDisabled || false,
      dependents: dependents || []
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Successfully enrolled in SNAP',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * TANF Program Enrollment
 */
router.post('/tanf/enroll', authenticate, async (req, res, next) => {
  try {
    const {
      beneficiaryId,
      familySize,
      monthlyIncome,
      hasMinorChildren,
      employmentStatus,
      previousMonthsReceived
    } = req.body;

    // Validate required fields
    if (!beneficiaryId || !familySize || monthlyIncome === undefined) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Missing required fields: beneficiaryId, familySize, monthlyIncome'
      });
    }

    const result = await snapTanfSystem.enrollTANF({
      beneficiaryId,
      familySize: parseInt(familySize),
      monthlyIncome: parseInt(monthlyIncome),
      hasMinorChildren: hasMinorChildren !== false,
      employmentStatus: employmentStatus || 'unemployed',
      previousMonthsReceived: previousMonthsReceived || 0
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Successfully enrolled in TANF',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Check SNAP Eligibility
 */
router.post('/snap/check-eligibility', async (req, res, next) => {
  try {
    const { householdSize, monthlyIncome, hasElderly, hasDisabled } = req.body;

    const eligibility = await snapTanfSystem.verifySNAPEligibility({
      householdSize: parseInt(householdSize),
      monthlyIncome: parseInt(monthlyIncome),
      hasElderly: hasElderly || false,
      hasDisabled: hasDisabled || false
    });

    // Calculate potential benefit
    let potentialBenefit = 0;
    if (eligibility.eligible) {
      potentialBenefit = snapTanfSystem.calculateSNAPBenefit({
        householdSize: parseInt(householdSize),
        monthlyIncome: parseInt(monthlyIncome),
        expenses: req.body.expenses || { rent: 0, utilities: 0, medical: 0 },
        hasElderly: hasElderly || false,
        hasDisabled: hasDisabled || false
      });
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        ...eligibility,
        potentialMonthlyBenefit: potentialBenefit ? `$${(potentialBenefit / 100).toFixed(2)}` : null
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Check TANF Eligibility
 */
router.post('/tanf/check-eligibility', async (req, res, next) => {
  try {
    const { familySize, monthlyIncome, hasMinorChildren, employmentStatus } = req.body;

    const eligibility = await snapTanfSystem.verifyTANFEligibility({
      familySize: parseInt(familySize),
      monthlyIncome: parseInt(monthlyIncome),
      hasMinorChildren: hasMinorChildren !== false,
      employmentStatus: employmentStatus || 'unemployed'
    });

    // Calculate potential benefit
    let potentialBenefit = 0;
    if (eligibility.eligible) {
      potentialBenefit = snapTanfSystem.calculateTANFBenefit(
        parseInt(familySize),
        parseInt(monthlyIncome)
      );
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        ...eligibility,
        potentialMonthlyBenefit: potentialBenefit ? `$${(potentialBenefit / 100).toFixed(2)}` : null
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Issue Monthly Benefits
 */
router.post('/issue-benefits', authenticate, async (req, res, next) => {
  try {
    const { beneficiaryId, programType, amount, isEmergency } = req.body;

    let result;
    if (programType === 'SNAP') {
      result = await snapTanfSystem.issueSNAPBenefits(
        beneficiaryId,
        amount || snapTanfSystem.beneficiaries.get(`snap_${beneficiaryId}`)?.monthlyBenefit
      );
    } else if (programType === 'TANF') {
      result = await snapTanfSystem.issueTANFBenefits(
        beneficiaryId,
        amount || snapTanfSystem.beneficiaries.get(`tanf_${beneficiaryId}`)?.monthlyBenefit
      );
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Invalid program type. Must be SNAP or TANF'
      });
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: `${programType} benefits issued successfully`,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Process EBT Purchase Transaction
 */
router.post('/transaction/purchase', authenticate, async (req, res, next) => {
  try {
    const {
      beneficiaryId,
      programType,
      amount,
      merchantId,
      merchantCategory,
      items
    } = req.body;

    // Validate required fields
    if (!beneficiaryId || !programType || !amount || !merchantId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await snapTanfSystem.processPurchase({
      beneficiaryId,
      programType,
      amount: parseInt(amount),
      merchantId,
      merchantCategory: merchantCategory || 'GROCERY',
      items: items || []
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Purchase processed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get Beneficiary Account Information
 */
router.get('/account/:beneficiaryId/:programType', authenticate, async (req, res, next) => {
  try {
    const { beneficiaryId, programType } = req.params;

    const account = await snapTanfSystem.getBeneficiaryAccount(
      beneficiaryId,
      programType.toUpperCase()
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: account
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Check Account Balance
 */
router.get('/balance/:beneficiaryId', authenticate, async (req, res, next) => {
  try {
    const { beneficiaryId } = req.params;

    const balances = {};

    // Check SNAP balance
    const snapAccount = snapTanfSystem.beneficiaries.get(`snap_${beneficiaryId}`);
    if (snapAccount) {
      balances.snap = {
        balance: snapAccount.balance,
        formattedBalance: `$${(snapAccount.balance / 100).toFixed(2)}`,
        nextIssuance: snapAccount.nextIssuanceDate
      };
    }

    // Check TANF balance
    const tanfAccount = snapTanfSystem.beneficiaries.get(`tanf_${beneficiaryId}`);
    if (tanfAccount) {
      balances.tanf = {
        balance: tanfAccount.cashBalance,
        formattedBalance: `$${(tanfAccount.cashBalance / 100).toFixed(2)}`,
        monthsRemaining: tanfAccount.monthsRemaining,
        nextIssuance: tanfAccount.nextIssuanceDate
      };
    }

    if (Object.keys(balances).length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: 'No benefit accounts found for this beneficiary'
      });
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: balances
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Transaction History
 */
router.get('/transactions/:beneficiaryId', authenticate, async (req, res, next) => {
  try {
    const { beneficiaryId } = req.params;
    const { programType, startDate, endDate, limit } = req.query;

    const transactions = [];

    // Get transactions from SNAP account
    if (!programType || programType === 'SNAP') {
      const snapAccount = snapTanfSystem.beneficiaries.get(`snap_${beneficiaryId}`);
      if (snapAccount && snapAccount.transactionHistory) {
        transactions.push(...snapAccount.transactionHistory.map(t => ({
          ...t,
          programType: 'SNAP'
        })));
      }
    }

    // Get transactions from TANF account
    if (!programType || programType === 'TANF') {
      const tanfAccount = snapTanfSystem.beneficiaries.get(`tanf_${beneficiaryId}`);
      if (tanfAccount && tanfAccount.transactionHistory) {
        transactions.push(...tanfAccount.transactionHistory.map(t => ({
          ...t,
          programType: 'TANF'
        })));
      }
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply limit if specified
    const limitedTransactions = limit ? transactions.slice(0, parseInt(limit)) : transactions;

    res.status(HttpStatus.OK).json({
      success: true,
      data: limitedTransactions,
      count: limitedTransactions.length,
      total: transactions.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Bulk Enrollment for Disaster Relief
 */
router.post('/bulk-enroll/disaster', authenticate, async (req, res, next) => {
  try {
    const { beneficiaries, disasterCode, programType } = req.body;

    if (!Array.isArray(beneficiaries) || beneficiaries.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Beneficiaries array is required'
      });
    }

    const results = [];
    const failures = [];

    for (const beneficiary of beneficiaries) {
      try {
        let result;
        if (programType === 'SNAP' || !programType) {
          result = await snapTanfSystem.enrollSNAP({
            ...beneficiary,
            metadata: { disasterCode, enrollmentType: 'disaster_relief' }
          });
        } else if (programType === 'TANF') {
          result = await snapTanfSystem.enrollTANF({
            ...beneficiary,
            metadata: { disasterCode, enrollmentType: 'disaster_relief' }
          });
        }

        // Issue emergency benefits immediately
        if (result.success) {
          await emergencyDisbursementSystem.createEmergencyDisbursement({
            beneficiaryId: beneficiary.beneficiaryId,
            amount: result.monthlyBenefit,
            programType: programType?.toLowerCase() || 'snap',
            reason: `Disaster relief - ${disasterCode}`
          });
        }

        results.push(result);
      } catch (error) {
        failures.push({
          beneficiaryId: beneficiary.beneficiaryId,
          error: error.message
        });
      }
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: `Processed ${results.length} enrollments for disaster ${disasterCode}`,
      data: {
        successful: results,
        failed: failures,
        summary: {
          total: beneficiaries.length,
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
 * Recertification Reminder
 */
router.get('/recertification/:beneficiaryId', authenticate, async (req, res, next) => {
  try {
    const { beneficiaryId } = req.params;

    const reminders = [];

    // Check SNAP recertification
    const snapAccount = snapTanfSystem.beneficiaries.get(`snap_${beneficiaryId}`);
    if (snapAccount && snapAccount.recertificationDate) {
      const daysUntil = Math.floor(
        (new Date(snapAccount.recertificationDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      reminders.push({
        program: 'SNAP',
        recertificationDate: snapAccount.recertificationDate,
        daysUntil,
        status: daysUntil <= 30 ? 'URGENT' : 'UPCOMING'
      });
    }

    // Check TANF review
    const tanfAccount = snapTanfSystem.beneficiaries.get(`tanf_${beneficiaryId}`);
    if (tanfAccount && tanfAccount.reviewDate) {
      const daysUntil = Math.floor(
        (new Date(tanfAccount.reviewDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      reminders.push({
        program: 'TANF',
        reviewDate: tanfAccount.reviewDate,
        daysUntil,
        status: daysUntil <= 14 ? 'URGENT' : 'UPCOMING',
        monthsRemaining: tanfAccount.monthsRemaining
      });
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: reminders
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Generate Program Reports
 */
router.post('/reports/generate', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const report = await snapTanfSystem.generateBenefitReport(start, end);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        ...report,
        generatedAt: new Date(),
        totalBeneficiaries: report.snap.totalBeneficiaries + report.tanf.totalBeneficiaries,
        totalBenefitsIssued: report.snap.totalBenefitsIssued + report.tanf.totalBenefitsIssued,
        formattedTotalBenefits: `$${((report.snap.totalBenefitsIssued + report.tanf.totalBenefitsIssued) / 100).toFixed(2)}`
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
  res.status(HttpStatus.OK).json({
    success: true,
    service: 'SNAP/TANF Benefit System',
    status: 'operational',
    programs: {
      snap: {
        name: 'Supplemental Nutrition Assistance Program',
        maxBenefit: '$973/month (family of 4)',
        activeBeneficiaries: snapTanfSystem.beneficiaries.size
      },
      tanf: {
        name: 'Temporary Assistance for Needy Families',
        maxBenefit: '$497/month (family of 4)',
        lifetimeLimit: '60 months'
      },
      wic: {
        name: 'Women, Infants, and Children',
        status: 'coming_soon'
      }
    },
    features: {
      instantIssuance: true,
      fraudDetection: true,
      purchaseValidation: true,
      realTimeBalance: true
    },
    timestamp: new Date()
  });
});

export default router;