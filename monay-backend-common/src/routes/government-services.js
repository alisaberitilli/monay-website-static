import { Router } from 'express';
import HttpStatus from 'http-status';
import authenticate from '../middleware-app/auth-middleware.js';
import rateLimiter from '../middleware-app/rate-limiter-middleware.js';

// Import all government services
import BenefitEligibilityVerification from '../services/benefitEligibilityVerification.js';
import BenefitIssuanceWorkflows from '../services/benefitIssuanceWorkflows.js';
import BenefitBalanceTracker from '../services/benefitBalanceTracker.js';
import BenefitTransactionProcessor from '../services/benefitTransactionProcessor.js';
import BenefitCardManagement from '../services/benefitCardManagement.js';
import BenefitReportingDashboards from '../services/benefitReportingDashboards.js';
import MultiLanguageSupport from '../services/multiLanguageSupport.js';
import MobileOptimization from '../services/mobileOptimization.js';
import StateIntegrationService from '../services/stateIntegrationService.js';
import AnalyticsReportingService from '../services/analyticsReportingService.js';
import MedicaidMedicareIntegration from '../services/medicaidMedicareIntegration.js';
import EducationBenefitsService from '../services/educationBenefitsService.js';
import HousingAssistancePrograms from '../services/housingAssistancePrograms.js';
import VeteranBenefitsService from '../services/veteranBenefitsService.js';
import TribalBenefitsService from '../services/tribalBenefitsService.js';
import AgriculturalProgramsService from '../services/agriculturalProgramsService.js';

const router = Router();

// Initialize services
const eligibilityService = new BenefitEligibilityVerification();
const issuanceService = new BenefitIssuanceWorkflows();
const balanceTracker = new BenefitBalanceTracker();
const transactionProcessor = new BenefitTransactionProcessor();
const cardManagement = new BenefitCardManagement();
const reportingDashboards = new BenefitReportingDashboards();
const languageSupport = new MultiLanguageSupport();
const mobileOptimization = new MobileOptimization();
const stateIntegration = new StateIntegrationService();
const analyticsReporting = new AnalyticsReportingService();
const medicaidMedicare = new MedicaidMedicareIntegration();
const educationBenefits = new EducationBenefitsService();
const housingAssistance = new HousingAssistancePrograms();
const veteranBenefits = new VeteranBenefitsService();
const tribalBenefits = new TribalBenefitsService();
const agriculturalPrograms = new AgriculturalProgramsService();

// Eligibility Verification Endpoints
router.post('/eligibility/verify', authenticate, rateLimiter, async (req, res, next) => {
  try {
    const result = await eligibilityService.verifyEligibility(
      req.body.applicantData,
      req.body.programType
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Eligibility verification completed'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/eligibility/batch-verify', authenticate, rateLimiter, async (req, res, next) => {
  try {
    const result = await eligibilityService.batchVerification(req.body.applicants);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Batch verification completed'
    });
  } catch (error) {
    next(error);
  }
});

// Benefit Issuance Endpoints
router.post('/issuance/create', authenticate, async (req, res, next) => {
  try {
    const result = await issuanceService.createIssuanceWorkflow(
      req.body.beneficiaryId,
      req.body.programType,
      req.body.amount,
      req.body.schedule
    );
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Issuance workflow created'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/issuance/process', authenticate, async (req, res, next) => {
  try {
    const result = await issuanceService.processIssuance(req.body.workflowId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Issuance processed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Balance Management Endpoints
router.get('/balance/:userId', authenticate, async (req, res, next) => {
  try {
    const result = await balanceTracker.getBalances(req.params.userId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Balances retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/balance/update', authenticate, async (req, res, next) => {
  try {
    const result = await balanceTracker.updateBalance(
      req.body.userId,
      req.body.programType,
      req.body.amount,
      req.body.operation
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Balance updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Transaction Processing Endpoints
router.post('/transaction/process', authenticate, async (req, res, next) => {
  try {
    const result = await transactionProcessor.processTransaction(req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Transaction processed successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/transaction/history/:userId', authenticate, async (req, res, next) => {
  try {
    const result = await transactionProcessor.getTransactionHistory(
      req.params.userId,
      req.query
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Transaction history retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Card Management Endpoints
router.post('/card/issue', authenticate, async (req, res, next) => {
  try {
    const result = await cardManagement.issueCard(
      req.body.userId,
      req.body.cardType,
      req.body.programType
    );
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Card issued successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/card/activate/:cardId', authenticate, async (req, res, next) => {
  try {
    const result = await cardManagement.activateCard(req.params.cardId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Card activated successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/card/lock/:cardId', authenticate, async (req, res, next) => {
  try {
    const result = await cardManagement.lockCard(req.params.cardId, req.body.reason);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Card locked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Reporting Dashboard Endpoints
router.get('/reports/dashboard/:userId', authenticate, async (req, res, next) => {
  try {
    const result = await reportingDashboards.getUserDashboard(
      req.params.userId,
      req.query.period
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Dashboard data retrieved'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/analytics', authenticate, async (req, res, next) => {
  try {
    const result = await analyticsReporting.generateReport(req.query);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Analytics report generated'
    });
  } catch (error) {
    next(error);
  }
});

// Multi-Language Support Endpoints
router.get('/language/translate', async (req, res, next) => {
  try {
    const result = await languageSupport.translate(
      req.query.text,
      req.query.targetLanguage,
      req.query.sourceLanguage
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Translation completed'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/language/supported', async (req, res, next) => {
  try {
    const languages = languageSupport.getSupportedLanguages();
    res.status(HttpStatus.OK).json({
      success: true,
      data: languages,
      message: 'Supported languages retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// State Integration Endpoints
router.post('/state/sync', authenticate, async (req, res, next) => {
  try {
    const result = await stateIntegration.syncWithStateSystem(
      req.body.stateCode,
      req.body.dataType
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'State sync completed'
    });
  } catch (error) {
    next(error);
  }
});

// Healthcare Integration Endpoints
router.post('/healthcare/medicaid/verify', authenticate, async (req, res, next) => {
  try {
    const result = await medicaidMedicare.verifyMedicaidEligibility(req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Medicaid eligibility verified'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/healthcare/medicare/enroll', authenticate, async (req, res, next) => {
  try {
    const result = await medicaidMedicare.enrollInMedicare(req.body);
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Medicare enrollment completed'
    });
  } catch (error) {
    next(error);
  }
});

// Education Benefits Endpoints
router.post('/education/apply', authenticate, async (req, res, next) => {
  try {
    const result = await educationBenefits.applyForBenefit(req.body);
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Education benefit application submitted'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/education/lunch-program/:schoolId', authenticate, async (req, res, next) => {
  try {
    const result = await educationBenefits.getSchoolLunchProgram(req.params.schoolId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'School lunch program details retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Housing Assistance Endpoints
router.post('/housing/section8/apply', authenticate, async (req, res, next) => {
  try {
    const result = await housingAssistance.applyForSection8(req.body);
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Section 8 application submitted'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/housing/rent-assistance', authenticate, async (req, res, next) => {
  try {
    const result = await housingAssistance.processRentAssistance(req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Rent assistance processed'
    });
  } catch (error) {
    next(error);
  }
});

// Veteran Benefits Endpoints
router.post('/veteran/verify', authenticate, async (req, res, next) => {
  try {
    const result = await veteranBenefits.verifyVeteranStatus(req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Veteran status verified'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/veteran/disability/claim', authenticate, async (req, res, next) => {
  try {
    const result = await veteranBenefits.fileDisabilityClaim(req.body);
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Disability claim filed'
    });
  } catch (error) {
    next(error);
  }
});

// Tribal Benefits Endpoints
router.post('/tribal/verify', authenticate, async (req, res, next) => {
  try {
    const result = await tribalBenefits.verifyTribalMembership(req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Tribal membership verified'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tribal/programs/:tribeId', authenticate, async (req, res, next) => {
  try {
    const result = await tribalBenefits.getTribalPrograms(req.params.tribeId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Tribal programs retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Agricultural Programs Endpoints
router.post('/agriculture/subsidy/apply', authenticate, async (req, res, next) => {
  try {
    const result = await agriculturalPrograms.applyForSubsidy(req.body);
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Subsidy application submitted'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/agriculture/crop-insurance', authenticate, async (req, res, next) => {
  try {
    const result = await agriculturalPrograms.processCropInsurance(req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Crop insurance processed'
    });
  } catch (error) {
    next(error);
  }
});

// Mobile Optimization Endpoint
router.get('/mobile/optimize', async (req, res, next) => {
  try {
    const optimized = await mobileOptimization.optimizeForDevice(
      req.query.deviceType,
      req.query.screenSize
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: optimized,
      message: 'Mobile optimization settings retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Health Check
router.get('/health', (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    service: 'Government Services',
    status: 'operational',
    timestamp: new Date()
  });
});

export default router;