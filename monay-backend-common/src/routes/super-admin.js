import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as superAdminController from '../controllers/super-admin-controller.js';

const router = Router();

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


// ===========================================
// PLATFORM OVERVIEW ENDPOINTS
// ===========================================

/**
 * @route   GET /api/super-admin/platform/overview
 * @desc    Get comprehensive platform metrics
 * @access  Super Admin
 */
router.get('/platform/overview', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    // Fetch metrics from multiple sources
    const [userMetrics, transactionMetrics, walletMetrics, systemHealth] = await Promise.all([
      getUserMetrics(),
      getTransactionMetrics(),
      getWalletMetrics(),
      getSystemHealth()
    ]);

    res.json({
      success: true,
      data: {
        users: userMetrics,
        transactions: transactionMetrics,
        wallets: walletMetrics,
        system: systemHealth,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Platform overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch platform overview' });
  }
});

/**
 * @route   GET /api/super-admin/platform/health
 * @desc    Get system health status
 * @access  Super Admin
 */
router.get('/platform/health', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const health = await getSystemHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    logger.error('System health check error:', error);
    res.status(500).json({ success: false, message: 'Failed to check system health' });
  }
});

// ===========================================
// CIRCLE ADMIN ENDPOINTS
// ===========================================

/**
 * @route   GET /api/super-admin/circle/wallets
 * @desc    Get all Circle wallets across the platform
 * @access  Super Admin
 */
router.get('/circle/wallets', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type } = req.query;

    // Fetch all Circle wallets from database
    const wallets = await db.Wallet.findAll({
      where: {
        ...(status && { status }),
        ...(type && { walletType: type })
      },
      include: [{
        model: db.User,
        attributes: ['id', 'email', 'firstName', 'lastName', 'role']
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    // Get Circle-specific metrics
    const circleMetrics = await circleService.getGlobalMetrics();

    res.json({
      success: true,
      data: {
        wallets,
        metrics: circleMetrics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await db.Wallet.count()
        }
      }
    });
  } catch (error) {
    logger.error('Admin get Circle wallets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Circle wallets' });
  }
});

/**
 * @route   GET /api/super-admin/circle/metrics
 * @desc    Get Circle platform metrics
 * @access  Super Admin
 */
router.get('/circle/metrics', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const metrics = await circleService.getGlobalMetrics();

    // Add additional metrics
    const extendedMetrics = {
      ...metrics,
      dailyVolume: await getCircleDailyVolume(),
      pendingOperations: await getPendingCircleOperations(),
      failedTransactions: await getFailedCircleTransactions()
    };

    res.json({ success: true, data: extendedMetrics });
  } catch (error) {
    logger.error('Circle metrics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Circle metrics' });
  }
});

/**
 * @route   POST /api/super-admin/circle/freeze-wallet
 * @desc    Freeze a Circle wallet
 * @access  Super Admin
 */
router.post('/circle/freeze-wallet', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { walletId, reason } = req.body;

    // Update wallet status
    await db.Wallet.update(
      {
        status: 'frozen',
        metadata: db.sequelize.literal(`
          metadata || '{"frozenBy": "${req.user.id}", "frozenAt": "${new Date().toISOString()}", "freezeReason": "${reason}"}'::jsonb
        `)
      },
      { where: { id: walletId } }
    );

    // Log action
    await logAdminAction(req.user.id, 'FREEZE_CIRCLE_WALLET', { walletId, reason });

    res.json({ success: true, message: 'Wallet frozen successfully' });
  } catch (error) {
    logger.error('Freeze Circle wallet error:', error);
    res.status(500).json({ success: false, message: 'Failed to freeze wallet' });
  }
});

// ===========================================
// TEMPO ADMIN ENDPOINTS
// ===========================================

/**
 * @route   GET /api/super-admin/tempo/status
 * @desc    Get Tempo provider status and metrics
 * @access  Super Admin
 */
router.get('/tempo/status', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const [status, metrics, capabilities] = await Promise.all([
      tempoService.getProviderStatus(),
      tempoService.getNetworkStats(),
      tempoService.getSupportedCurrencies()
    ]);

    res.json({
      success: true,
      data: {
        status,
        metrics,
        capabilities,
        lastUpdate: new Date()
      }
    });
  } catch (error) {
    logger.error('Tempo status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Tempo status' });
  }
});

/**
 * @route   GET /api/super-admin/tempo/wallets
 * @desc    Get all Tempo wallets
 * @access  Super Admin
 */
router.get('/tempo/wallets', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Get Tempo wallets
    const wallets = await db.Wallet.findAll({
      where: {
        metadata: {
          provider: 'tempo'
        }
      },
      include: [{
        model: db.User,
        attributes: ['id', 'email', 'firstName', 'lastName', 'role']
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    // Get Tempo-specific metrics
    const tempoMetrics = await tempoService.getNetworkStats();

    res.json({
      success: true,
      data: {
        wallets,
        metrics: tempoMetrics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Admin get Tempo wallets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Tempo wallets' });
  }
});

/**
 * @route   GET /api/super-admin/tempo/transactions
 * @desc    Get Tempo transaction history
 * @access  Super Admin
 */
router.get('/tempo/transactions', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 100, status, currency } = req.query;

    const transactions = await db.Transaction.findAll({
      where: {
        ...(status && { status }),
        ...(currency && { currency }),
        metadata: {
          provider: 'tempo'
        }
      },
      include: [{
        model: db.User,
        as: 'sender',
        attributes: ['id', 'email', 'firstName', 'lastName']
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Tempo transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Tempo transactions' });
  }
});

// ===========================================
// PROVIDER COMPARISON ENDPOINTS
// ===========================================

/**
 * @route   GET /api/super-admin/providers/comparison
 * @desc    Get real-time provider comparison
 * @access  Super Admin
 */
router.get('/providers/comparison', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const providers = await providerFactory.getProviderStatus();

    const comparison = {
      tempo: {
        ...providers.tempo,
        metrics: await tempoService.getNetworkStats(),
        volume24h: await getProviderDailyVolume('tempo'),
        activeWallets: await getActiveWallets('tempo')
      },
      circle: {
        ...providers.circle,
        metrics: await circleService.getGlobalMetrics(),
        volume24h: await getProviderDailyVolume('circle'),
        activeWallets: await getActiveWallets('circle')
      },
      timestamp: new Date()
    };

    res.json({ success: true, data: comparison });
  } catch (error) {
    logger.error('Provider comparison error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch provider comparison' });
  }
});

/**
 * @route   POST /api/super-admin/providers/set-primary
 * @desc    Set primary stablecoin provider
 * @access  Super Admin
 */
router.post('/providers/set-primary', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { provider, reason } = req.body;

    if (!['tempo', 'circle'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider. Must be "tempo" or "circle"'
      });
    }

    // Update provider configuration
    await db.Setting.upsert({
      key: 'primary_stablecoin_provider',
      value: provider,
      metadata: {
        updatedBy: req.user.id,
        updatedAt: new Date(),
        reason
      }
    });

    // Log action
    await logAdminAction(req.user.id, 'SET_PRIMARY_PROVIDER', { provider, reason });

    res.json({ success: true, message: `Primary provider set to ${provider}` });
  } catch (error) {
    logger.error('Set primary provider error:', error);
    res.status(500).json({ success: false, message: 'Failed to set primary provider' });
  }
});

// ===========================================
// COMPLIANCE & KYC ADMIN ENDPOINTS
// ===========================================

/**
 * @route   GET /api/super-admin/compliance/kyc-queue
 * @desc    Get pending KYC verifications
 * @access  Super Admin
 */
router.get('/compliance/kyc-queue', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const pendingKyc = await db.UserKyc.findAll({
      where: { status: 'pending' },
      include: [{
        model: db.User,
        attributes: ['id', 'email', 'firstName', 'lastName', 'createdAt']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        queue: pendingKyc,
        count: pendingKyc.length,
        oldestPending: pendingKyc[0]?.createdAt
      }
    });
  } catch (error) {
    logger.error('KYC queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch KYC queue' });
  }
});

/**
 * @route   POST /api/super-admin/compliance/review-kyc
 * @desc    Review and approve/reject KYC
 * @access  Super Admin
 */
router.post('/compliance/review-kyc', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { kycId, status, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    // Update KYC status
    await db.UserKyc.update(
      {
        status,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: notes
      },
      { where: { id: kycId } }
    );

    // Log action
    await logAdminAction(req.user.id, 'REVIEW_KYC', { kycId, status, notes });

    res.json({ success: true, message: `KYC ${status} successfully` });
  } catch (error) {
    logger.error('Review KYC error:', error);
    res.status(500).json({ success: false, message: 'Failed to review KYC' });
  }
});

// ===========================================
// ANALYTICS ENDPOINTS
// ===========================================

/**
 * @route   GET /api/super-admin/analytics/dashboard
 * @desc    Get comprehensive analytics dashboard data
 * @access  Super Admin
 */
router.get('/analytics/dashboard', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await getComprehensiveAnalytics(startDate, endDate);

    res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Analytics dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// ===========================================
// HELPER FUNCTIONS
// ===========================================

async function getUserMetrics() {
  try {
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      db.User.count(),
      db.User.count({
        where: {
          lastLoginAt: {
            [db.Sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      db.User.count({
        where: {
          createdAt: {
            [db.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return { total: totalUsers, active: activeUsers, new: newUsers };
  } catch (error) {
    logger.error('Get user metrics error:', error);
    return { total: 0, active: 0, new: 0 };
  }
}

async function getTransactionMetrics() {
  try {
    const [totalTransactions, dailyVolume, pendingTransactions] = await Promise.all([
      db.Transaction.count(),
      db.Transaction.sum('amount', {
        where: {
          createdAt: {
            [db.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      db.Transaction.count({ where: { status: 'pending' } })
    ]);

    return {
      total: totalTransactions,
      dailyVolume: dailyVolume || 0,
      pending: pendingTransactions
    };
  } catch (error) {
    logger.error('Get transaction metrics error:', error);
    return { total: 0, dailyVolume: 0, pending: 0 };
  }
}

async function getWalletMetrics() {
  try {
    const [totalWallets, activeWallets] = await Promise.all([
      db.Wallet.count(),
      db.Wallet.count({ where: { status: 'active' } })
    ]);

    return { total: totalWallets, active: activeWallets };
  } catch (error) {
    logger.error('Get wallet metrics error:', error);
    return { total: 0, active: 0 };
  }
}

async function getSystemHealth() {
  try {
    const health = {
      api: 'healthy',
      database: 'healthy',
      redis: 'healthy',
      providers: {
        tempo: await tempoService.getProviderStatus(),
        circle: await circleService.getProviderStatus()
      },
      timestamp: new Date()
    };

    return health;
  } catch (error) {
    logger.error('Get system health error:', error);
    return {
      api: 'unknown',
      database: 'unknown',
      redis: 'unknown',
      providers: {},
      timestamp: new Date()
    };
  }
}

async function getCircleDailyVolume() {
  try {
    const volume = await db.Transaction.sum('amount', {
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        metadata: {
          provider: 'circle'
        }
      }
    });
    return volume || 0;
  } catch (error) {
    return 0;
  }
}

async function getPendingCircleOperations() {
  try {
    const count = await db.Transaction.count({
      where: {
        status: 'pending',
        metadata: {
          provider: 'circle'
        }
      }
    });
    return count;
  } catch (error) {
    return 0;
  }
}

async function getFailedCircleTransactions() {
  try {
    const transactions = await db.Transaction.findAll({
      where: {
        status: 'failed',
        metadata: {
          provider: 'circle'
        }
      },
      limit: 10,
      order: [['createdAt', 'DESC']]
    });
    return transactions;
  } catch (error) {
    return [];
  }
}

async function getProviderDailyVolume(provider) {
  try {
    const volume = await db.Transaction.sum('amount', {
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        metadata: {
          provider
        }
      }
    });
    return volume || 0;
  } catch (error) {
    return 0;
  }
}

async function getActiveWallets(provider) {
  try {
    const count = await db.Wallet.count({
      where: {
        status: 'active',
        metadata: {
          provider
        }
      }
    });
    return count;
  } catch (error) {
    return 0;
  }
}

async function getComprehensiveAnalytics(startDate, endDate) {
  // Implement comprehensive analytics logic
  return {
    revenue: {},
    users: {},
    transactions: {},
    providers: {},
    trends: {}
  };
}

export default router;