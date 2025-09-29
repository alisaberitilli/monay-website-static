import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as superAdminController from '../controllers/super-admin-controller.js';

const router = express.Router();

// Middleware to check super admin access
const requireSuperAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user has super admin role
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for super admin operations'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authorization error' });
  }
};

// Apply authentication and super admin check to all routes
router.use(authenticate);
router.use(requireSuperAdmin);

// ===========================================
// PLATFORM OVERVIEW
// ===========================================
router.get('/platform/overview', superAdminController.getPlatformOverview);
router.get('/platform/health', superAdminController.getSystemHealth);

// ===========================================
// CIRCLE MANAGEMENT
// ===========================================
router.get('/circle/wallets', superAdminController.getCircleWallets);
router.get('/circle/metrics', superAdminController.getCircleMetrics);
router.post('/circle/freeze-wallet', superAdminController.freezeCircleWallet);
router.post('/circle/unfreeze-wallet', superAdminController.unfreezeCircleWallet);
router.get('/circle/transactions', superAdminController.getCircleTransactions);

// ===========================================
// TEMPO MANAGEMENT
// ===========================================
router.get('/tempo/status', superAdminController.getTempoStatus);
router.get('/tempo/wallets', superAdminController.getTempoWallets);
router.get('/tempo/transactions', superAdminController.getTempoTransactions);
router.get('/tempo/metrics', superAdminController.getTempoMetrics);
router.post('/tempo/process-batch', superAdminController.processTemoBatch);

// ===========================================
// PROVIDER COMPARISON & MANAGEMENT
// ===========================================
router.get('/providers/comparison', superAdminController.getProviderComparison);
router.post('/providers/set-primary', superAdminController.setPrimaryProvider);
router.get('/providers/health', superAdminController.getProvidersHealth);
router.post('/providers/failover', superAdminController.triggerProviderFailover);

// ===========================================
// USER MANAGEMENT
// ===========================================
router.get('/users', superAdminController.getAllUsers);
router.post('/users/suspend', superAdminController.suspendUser);
router.post('/users/activate', superAdminController.activateUser);
router.get('/users/:userId/activity', superAdminController.getUserActivity);
router.post('/users/:userId/reset-2fa', superAdminController.resetUser2FA);

// ===========================================
// TRANSACTION MONITORING
// ===========================================
router.get('/transactions/monitor', superAdminController.getTransactionMonitoring);
router.post('/transactions/flag', superAdminController.flagTransaction);
router.post('/transactions/reverse', superAdminController.reverseTransaction);
router.get('/transactions/suspicious', superAdminController.getSuspiciousTransactions);

// ===========================================
// COMPLIANCE & KYC
// ===========================================
router.get('/compliance/kyc-queue', superAdminController.getKYCQueue);
router.post('/compliance/review-kyc', superAdminController.reviewKYC);
router.get('/compliance/report', superAdminController.getComplianceReport);
router.get('/compliance/aml-alerts', superAdminController.getAMLAlerts);

// ===========================================
// ANALYTICS & REPORTING
// ===========================================
router.get('/analytics/dashboard', superAdminController.getAnalyticsDashboard);
router.post('/analytics/export', superAdminController.exportAnalytics);
router.get('/analytics/revenue', superAdminController.getRevenueAnalytics);
router.get('/analytics/performance', superAdminController.getPerformanceMetrics);

// ===========================================
// AUDIT LOGS
// ===========================================
router.get('/audit-logs', superAdminController.getAuditLogs);
router.get('/audit-logs/export', superAdminController.exportAuditLogs);

// ===========================================
// SYSTEM CONFIGURATION
// ===========================================
router.get('/system/config', superAdminController.getSystemConfig);
router.put('/system/config', superAdminController.updateSystemConfig);
router.get('/system/feature-flags', superAdminController.getFeatureFlags);
router.put('/system/feature-flags', superAdminController.updateFeatureFlag);
router.post('/system/restart-service', superAdminController.restartService);

// ===========================================
// ALERTS & MONITORING
// ===========================================
router.get('/alerts/active', superAdminController.getActiveAlerts);
router.post('/alerts/:alertId/acknowledge', superAdminController.acknowledgeAlert);
router.post('/alerts/:alertId/resolve', superAdminController.resolveAlert);
router.get('/monitoring/metrics', superAdminController.getMonitoringMetrics);

export default router;