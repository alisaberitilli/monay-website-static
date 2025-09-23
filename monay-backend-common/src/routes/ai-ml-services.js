import { Router } from 'express';
import HttpStatus from 'http-status';
import authenticate from '../middlewares/auth-middleware';
import rateLimiter from '../middlewares/rate-limiter-middleware';

// Import AI/ML services
import PredictiveAnalyticsEngine from '../services/predictiveAnalyticsEngine';
import AIPoweredFeatures from '../services/aiPoweredFeatures';
import FraudDetectionML from '../services/machineLearningModels';
import BehavioralBiometrics from '../services/behavioralBiometrics';

const router = Router();

// Initialize services
const predictiveAnalytics = new PredictiveAnalyticsEngine();
const aiFeatures = new AIPoweredFeatures();
const fraudML = new FraudDetectionML();
const behavioralBiometrics = new BehavioralBiometrics();

// Predictive Analytics Endpoints
router.post('/predict/customer-ltv', authenticate, async (req, res, next) => {
  try {
    const result = await predictiveAnalytics.predictCustomerLTV(
      req.body.userId,
      req.body.horizon || '365_days'
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Customer LTV prediction generated'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/predict/churn-risk', authenticate, async (req, res, next) => {
  try {
    const result = await predictiveAnalytics.predictChurnRisk(req.body.userId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Churn risk assessment completed'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/predict/credit-score', authenticate, async (req, res, next) => {
  try {
    const result = await predictiveAnalytics.predictCreditScore(req.body.userId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Credit score prediction generated'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/predict/transaction-volume', authenticate, async (req, res, next) => {
  try {
    const result = await predictiveAnalytics.predictTransactionVolume(
      req.body.merchantId,
      req.body.period || 30
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Transaction volume forecast generated'
    });
  } catch (error) {
    next(error);
  }
});

// AI-Powered Features Endpoints
router.post('/ai/route-transaction', authenticate, async (req, res, next) => {
  try {
    const result = await aiFeatures.routeTransaction(req.body.transactionData);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Optimal transaction route determined'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/ai/smart-notification', authenticate, async (req, res, next) => {
  try {
    const result = await aiFeatures.generateSmartNotification(
      req.body.userId,
      req.body.event,
      req.body.context
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Smart notification generated'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/ai/dynamic-pricing', authenticate, async (req, res, next) => {
  try {
    const result = await aiFeatures.calculateDynamicPricing(
      req.body.merchantId,
      req.body.transactionType,
      req.body.volume
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Dynamic pricing calculated'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/ai/chat-assist', authenticate, async (req, res, next) => {
  try {
    const result = await aiFeatures.processNaturalLanguageQuery(
      req.body.userId,
      req.body.query,
      req.body.context
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Query processed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Fraud Detection ML Endpoints
router.post('/fraud/analyze-transaction', authenticate, rateLimiter, async (req, res, next) => {
  try {
    const result = await fraudML.analyzeTransaction(req.body.transaction);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Fraud analysis completed'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/fraud/batch-screen', authenticate, async (req, res, next) => {
  try {
    const result = await fraudML.batchScreenTransactions(req.body.transactions);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Batch fraud screening completed'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/fraud/risk-profile/:userId', authenticate, async (req, res, next) => {
  try {
    const result = await fraudML.getUserRiskProfile(req.params.userId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Risk profile retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Behavioral Biometrics Endpoints
router.post('/biometrics/capture', authenticate, async (req, res, next) => {
  try {
    const result = await behavioralBiometrics.captureSession(
      req.body.userId,
      req.body.sessionData
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Biometric session captured'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/biometrics/verify', authenticate, async (req, res, next) => {
  try {
    const result = await behavioralBiometrics.verifyUser(
      req.body.userId,
      req.body.biometricData
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Biometric verification completed'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/biometrics/profile/:userId', authenticate, async (req, res, next) => {
  try {
    const result = await behavioralBiometrics.getUserProfile(req.params.userId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Biometric profile retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Model Management Endpoints
router.post('/models/retrain', authenticate, async (req, res, next) => {
  try {
    const modelType = req.body.modelType;
    let result;

    switch (modelType) {
      case 'fraud':
        result = await fraudML.retrainModel();
        break;
      case 'churn':
        result = await predictiveAnalytics.retrainChurnModel();
        break;
      case 'ltv':
        result = await predictiveAnalytics.retrainLTVModel();
        break;
      default:
        throw new Error('Invalid model type');
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: `Model ${modelType} retrained successfully`
    });
  } catch (error) {
    next(error);
  }
});

router.get('/models/performance', authenticate, async (req, res, next) => {
  try {
    const performance = {
      fraud: await fraudML.getModelPerformance(),
      predictive: await predictiveAnalytics.getModelPerformance(),
      biometrics: await behavioralBiometrics.getSystemAccuracy()
    };

    res.status(HttpStatus.OK).json({
      success: true,
      data: performance,
      message: 'Model performance metrics retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Analytics Dashboard Endpoints
router.get('/analytics/dashboard', authenticate, async (req, res, next) => {
  try {
    const dashboard = {
      fraud_metrics: await fraudML.getDashboardMetrics(),
      predictive_insights: await predictiveAnalytics.getInsightsSummary(),
      ai_feature_usage: await aiFeatures.getUsageStatistics()
    };

    res.status(HttpStatus.OK).json({
      success: true,
      data: dashboard,
      message: 'AI/ML dashboard data retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Recommendations Engine
router.get('/recommendations/:userId', authenticate, async (req, res, next) => {
  try {
    const recommendations = await aiFeatures.generateRecommendations(
      req.params.userId,
      req.query.type || 'all'
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: recommendations,
      message: 'Recommendations generated'
    });
  } catch (error) {
    next(error);
  }
});

// Anomaly Detection
router.post('/anomaly/detect', authenticate, async (req, res, next) => {
  try {
    const result = await fraudML.detectAnomalies(
      req.body.data,
      req.body.type
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Anomaly detection completed'
    });
  } catch (error) {
    next(error);
  }
});

// Health Check
router.get('/health', (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    service: 'AI/ML Services',
    status: 'operational',
    models: {
      fraud_detection: 'active',
      predictive_analytics: 'active',
      behavioral_biometrics: 'active',
      ai_features: 'active'
    },
    timestamp: new Date()
  });
});

export default router;