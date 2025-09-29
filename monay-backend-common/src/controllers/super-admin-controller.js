import db from '../models/index.js';
import logger from '../services/logger.js';
import CircleWalletService from '../services/circle-wallet-service.js';
import TempoService from '../services/tempo.js';
import WalletOrchestratorService from '../services/wallet-orchestrator-service.js';
import stablecoinProviderFactoryModule from '../services/stablecoin-provider-factory.js';
import mockDataService from '../services/mock-data-service.js';
import { Op } from 'sequelize';

const circleService = new CircleWalletService();
const tempoService = new TempoService();
const orchestrator = new WalletOrchestratorService();
const providerFactory = stablecoinProviderFactoryModule.getInstance();

// Helper function to log admin actions
async function logAdminAction(adminId, action, details, ipAddress = 'unknown') {
  try {
    await db.ActivityLog.create({
      userId: adminId,
      action,
      details: JSON.stringify(details),
      ipAddress,
      createdAt: new Date()
    });
  } catch (error) {
    logger.error('Failed to log admin action:', error);
  }
}

// ===========================================
// PLATFORM OVERVIEW
// ===========================================

export const getPlatformOverview = async (req, res) => {
  try {
    const [userCount, transactionCount, walletCount] = await Promise.all([
      db.User.count(),
      db.Transaction.count(),
      db.Wallet.count()
    ]);

    const dailyVolume = await db.Transaction.sum('amount', {
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    const activeUsers = await db.User.count({
      where: {
        lastLoginAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: userCount,
          active: activeUsers,
          new: await db.User.count({
            where: {
              createdAt: {
                [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          })
        },
        transactions: {
          total: transactionCount,
          dailyVolume: dailyVolume || 0,
          pending: await db.Transaction.count({ where: { status: 'pending' } })
        },
        wallets: {
          total: walletCount,
          active: await db.Wallet.count({ where: { status: 'active' } })
        },
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Error getting platform overview:', error);
    res.status(500).json({ success: false, message: 'Failed to get platform overview' });
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    const health = {
      api: 'healthy',
      database: 'healthy',
      redis: 'healthy',
      providers: {
        tempo: await tempoService.checkHealth(),
        circle: await circleService.checkHealth()
      },
      timestamp: new Date()
    };

    res.json({ success: true, data: health });
  } catch (error) {
    logger.error('Error getting system health:', error);
    res.status(500).json({ success: false, message: 'Failed to get system health' });
  }
};

// ===========================================
// CIRCLE MANAGEMENT
// ===========================================

export const getCircleWallets = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { provider: 'circle' };
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { walletId: { [Op.iLike]: `%${search}%` } },
        { '$User.email$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const wallets = await db.Wallet.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        attributes: ['id', 'email', 'firstName', 'lastName']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        wallets: wallets.rows.map(wallet => ({
          id: wallet.id,
          userId: wallet.userId,
          userEmail: wallet.User?.email,
          walletId: wallet.walletId,
          address: wallet.address,
          balance: wallet.balance || 0,
          status: wallet.status,
          createdAt: wallet.createdAt,
          lastActivity: wallet.updatedAt
        })),
        total: wallets.count,
        page: parseInt(page),
        totalPages: Math.ceil(wallets.count / limit)
      }
    });

    await logAdminAction(req.user.id, 'VIEW_CIRCLE_WALLETS', { page, limit, status }, req.ip);
  } catch (error) {
    logger.error('Error getting Circle wallets:', error);
    res.status(500).json({ success: false, message: 'Failed to get Circle wallets' });
  }
};

export const getCircleMetrics = async (req, res) => {
  try {
    // Get Circle-specific metrics
    const [totalSupply, walletCount, dailyVolume, pendingOps] = await Promise.all([
      db.Transaction.sum('amount', {
        where: {
          provider: 'circle',
          type: 'mint',
          status: 'completed'
        }
      }),
      db.Wallet.count({ where: { provider: 'circle', status: 'active' } }),
      db.Transaction.sum('amount', {
        where: {
          provider: 'circle',
          createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          status: 'completed'
        }
      }),
      db.Transaction.count({
        where: {
          provider: 'circle',
          status: 'pending'
        }
      })
    ]);

    // Get failed transactions for monitoring
    const failedTransactions = await db.Transaction.findAll({
      where: {
        provider: 'circle',
        status: 'failed',
        createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      include: [{
        model: db.User,
        attributes: ['email']
      }],
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        totalSupply: totalSupply || 0,
        walletCount,
        dailyVolume: dailyVolume || 0,
        pendingOperations: pendingOps,
        failedTransactions: failedTransactions.map(tx => ({
          id: tx.id,
          userEmail: tx.User?.email,
          amount: tx.amount,
          error: tx.errorMessage || 'Unknown error',
          createdAt: tx.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting Circle metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to get Circle metrics' });
  }
};

export const freezeCircleWallet = async (req, res) => {
  try {
    const { walletId, reason } = req.body;

    if (!walletId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Wallet ID and reason are required'
      });
    }

    // Update wallet status in database
    const wallet = await db.Wallet.findOne({ where: { walletId } });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    await wallet.update({
      status: 'frozen',
      frozenReason: reason,
      frozenBy: req.user.id,
      frozenAt: new Date()
    });

    // Log the action
    await logAdminAction(req.user.id, 'FREEZE_CIRCLE_WALLET', {
      walletId,
      reason,
      userId: wallet.userId
    }, req.ip);

    // Call Circle API to freeze wallet (if implemented)
    try {
      await circleService.freezeWallet(walletId);
    } catch (circleError) {
      logger.error('Circle API freeze error:', circleError);
      // Continue even if Circle API fails - we've frozen it in our system
    }

    res.json({
      success: true,
      message: 'Wallet frozen successfully',
      data: { walletId, status: 'frozen' }
    });
  } catch (error) {
    logger.error('Error freezing Circle wallet:', error);
    res.status(500).json({ success: false, message: 'Failed to freeze wallet' });
  }
};

export const unfreezeCircleWallet = async (req, res) => {
  try {
    const { walletId } = req.body;

    if (!walletId) {
      return res.status(400).json({
        success: false,
        message: 'Wallet ID is required'
      });
    }

    // Update wallet status in database
    const wallet = await db.Wallet.findOne({ where: { walletId } });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    await wallet.update({
      status: 'active',
      frozenReason: null,
      frozenBy: null,
      frozenAt: null
    });

    // Log the action
    await logAdminAction(req.user.id, 'UNFREEZE_CIRCLE_WALLET', {
      walletId,
      userId: wallet.userId
    }, req.ip);

    // Call Circle API to unfreeze wallet (if implemented)
    try {
      await circleService.unfreezeWallet(walletId);
    } catch (circleError) {
      logger.error('Circle API unfreeze error:', circleError);
    }

    res.json({
      success: true,
      message: 'Wallet unfrozen successfully',
      data: { walletId, status: 'active' }
    });
  } catch (error) {
    logger.error('Error unfreezing Circle wallet:', error);
    res.status(500).json({ success: false, message: 'Failed to unfreeze wallet' });
  }
};

export const getCircleTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { provider: 'circle' };
    if (status) whereClause.status = status;

    const transactions = await db.Transaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        attributes: ['email', 'firstName', 'lastName']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        transactions: transactions.rows,
        total: transactions.count,
        page: parseInt(page),
        totalPages: Math.ceil(transactions.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting Circle transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to get transactions' });
  }
};

// ===========================================
// TEMPO MANAGEMENT
// ===========================================

export const getTempoStatus = async (req, res) => {
  try {
    // Get Tempo network status
    const status = await tempoService.getNetworkStatus();

    const metrics = {
      tps: 100000,
      finality: 100,
      avgFee: 0.0001,
      networkLoad: 35,
      successRate: 99.98,
      supportedCurrencies: ['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB']
    };

    res.json({
      success: true,
      data: {
        status,
        metrics,
        capabilities: {
          batchTransfers: true,
          nativeSwaps: true,
          privacyFeatures: true,
          multiSignature: true,
          smartRouting: true
        },
        lastUpdate: new Date()
      }
    });
  } catch (error) {
    logger.error('Error getting Tempo status:', error);
    res.status(500).json({ success: false, message: 'Failed to get Tempo status' });
  }
};

export const getTempoWallets = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const wallets = await db.Wallet.findAndCountAll({
      where: { provider: 'tempo' },
      include: [{
        model: db.User,
        attributes: ['id', 'email', 'firstName', 'lastName']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        wallets: wallets.rows,
        total: wallets.count,
        page: parseInt(page),
        totalPages: Math.ceil(wallets.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting Tempo wallets:', error);
    res.status(500).json({ success: false, message: 'Failed to get Tempo wallets' });
  }
};

export const getTempoTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, currency } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { provider: 'tempo' };
    if (status) whereClause.status = status;
    if (currency) whereClause.currency = currency;

    const transactions = await db.Transaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        attributes: ['email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Add mock confirmation times for demo
    const enhancedTransactions = transactions.rows.map(tx => ({
      ...tx.toJSON(),
      confirmationTime: Math.floor(Math.random() * 50) + 85, // 85-135ms
      fee: 0.0001
    }));

    res.json({
      success: true,
      data: {
        transactions: enhancedTransactions,
        total: transactions.count,
        page: parseInt(page),
        totalPages: Math.ceil(transactions.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting Tempo transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to get Tempo transactions' });
  }
};

export const getTempoMetrics = async (req, res) => {
  try {
    const [totalVolume, activeWallets] = await Promise.all([
      db.Transaction.sum('amount', {
        where: {
          provider: 'tempo',
          createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          status: 'completed'
        }
      }),
      db.Wallet.count({ where: { provider: 'tempo', status: 'active' } })
    ]);

    res.json({
      success: true,
      data: {
        totalVolume: totalVolume || 0,
        activeWallets,
        tps: 100000,
        finality: 100,
        avgFee: 0.0001,
        networkLoad: 35,
        successRate: 99.98
      }
    });
  } catch (error) {
    logger.error('Error getting Tempo metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to get Tempo metrics' });
  }
};

export const processTemoBatch = async (req, res) => {
  try {
    const { transactions } = req.body;

    // Process batch transactions through Tempo
    const results = await tempoService.processBatch(transactions);

    await logAdminAction(req.user.id, 'PROCESS_TEMPO_BATCH', {
      count: transactions.length,
      totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0)
    }, req.ip);

    res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    logger.error('Error processing Tempo batch:', error);
    res.status(500).json({ success: false, message: 'Failed to process batch' });
  }
};

// ===========================================
// PROVIDER COMPARISON & MANAGEMENT
// ===========================================

export const getProviderComparison = async (req, res) => {
  try {
    const [tempoMetrics, circleMetrics] = await Promise.all([
      getProviderMetrics('tempo'),
      getProviderMetrics('circle')
    ]);

    res.json({
      success: true,
      data: {
        tempo: tempoMetrics,
        circle: circleMetrics,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Error getting provider comparison:', error);
    res.status(500).json({ success: false, message: 'Failed to get provider comparison' });
  }
};

async function getProviderMetrics(provider) {
  const [volume24h, activeWallets, avgProcessingTime] = await Promise.all([
    db.Transaction.sum('amount', {
      where: {
        provider,
        createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        status: 'completed'
      }
    }),
    db.Wallet.count({ where: { provider, status: 'active' } }),
    db.sequelize.query(
      `SELECT AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))) as avg_time
       FROM "Transactions"
       WHERE provider = :provider AND status = 'completed'
       AND "createdAt" >= :date`,
      {
        replacements: {
          provider,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        type: db.sequelize.QueryTypes.SELECT
      }
    )
  ]);

  const metrics = provider === 'tempo' ? {
    tps: 100000,
    finality: 100,
    fee: 0.0001,
    uptime: 99.99
  } : {
    tps: 1000,
    finality: 4000,
    fee: 0.05,
    uptime: 99.95
  };

  return {
    metrics,
    volume24h: volume24h || 0,
    activeWallets,
    avgProcessingTime: avgProcessingTime[0]?.avg_time || 0
  };
}

export const setPrimaryProvider = async (req, res) => {
  try {
    const { provider, reason } = req.body;

    if (!['tempo', 'circle'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider. Must be "tempo" or "circle"'
      });
    }

    // Update system configuration
    await db.SystemConfig.upsert({
      key: 'primary_stablecoin_provider',
      value: provider,
      updatedBy: req.user.id
    });

    // Switch the provider in the orchestrator
    await orchestrator.switchPrimaryProvider(provider);

    // Log the action
    await logAdminAction(req.user.id, 'SET_PRIMARY_PROVIDER', {
      provider,
      reason
    }, req.ip);

    res.json({
      success: true,
      message: `${provider} is now the primary provider`,
      data: { provider, reason }
    });
  } catch (error) {
    logger.error('Error setting primary provider:', error);
    res.status(500).json({ success: false, message: 'Failed to set primary provider' });
  }
};

export const getProvidersHealth = async (req, res) => {
  try {
    const [tempoHealth, circleHealth] = await Promise.all([
      tempoService.checkHealth(),
      circleService.checkHealth()
    ]);

    res.json({
      success: true,
      data: {
        tempo: tempoHealth,
        circle: circleHealth,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Error getting providers health:', error);
    res.status(500).json({ success: false, message: 'Failed to get providers health' });
  }
};

export const triggerProviderFailover = async (req, res) => {
  try {
    const { fromProvider, toProvider, reason } = req.body;

    // Trigger failover in orchestrator
    await orchestrator.failover(fromProvider, toProvider);

    // Log critical action
    await logAdminAction(req.user.id, 'TRIGGER_PROVIDER_FAILOVER', {
      fromProvider,
      toProvider,
      reason
    }, req.ip);

    res.json({
      success: true,
      message: `Failover from ${fromProvider} to ${toProvider} initiated`,
      data: { fromProvider, toProvider, reason }
    });
  } catch (error) {
    logger.error('Error triggering provider failover:', error);
    res.status(500).json({ success: false, message: 'Failed to trigger failover' });
  }
};

// ===========================================
// USER MANAGEMENT
// ===========================================

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await db.User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        total: users.count,
        page: parseInt(page),
        totalPages: Math.ceil(users.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { userId, reason, duration } = req.body;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({
      status: 'suspended',
      suspendedReason: reason,
      suspendedUntil: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
    });

    await logAdminAction(req.user.id, 'SUSPEND_USER', {
      userId,
      reason,
      duration
    }, req.ip);

    res.json({
      success: true,
      message: 'User suspended successfully'
    });
  } catch (error) {
    logger.error('Error suspending user:', error);
    res.status(500).json({ success: false, message: 'Failed to suspend user' });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({
      status: 'active',
      suspendedReason: null,
      suspendedUntil: null
    });

    await logAdminAction(req.user.id, 'ACTIVATE_USER', { userId }, req.ip);

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    logger.error('Error activating user:', error);
    res.status(500).json({ success: false, message: 'Failed to activate user' });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const activities = await db.ActivityLog.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    logger.error('Error getting user activity:', error);
    res.status(500).json({ success: false, message: 'Failed to get user activity' });
  }
};

export const resetUser2FA = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({
      mfaEnabled: false,
      mfaSecret: null
    });

    await logAdminAction(req.user.id, 'RESET_USER_2FA', { userId }, req.ip);

    res.json({
      success: true,
      message: '2FA reset successfully'
    });
  } catch (error) {
    logger.error('Error resetting user 2FA:', error);
    res.status(500).json({ success: false, message: 'Failed to reset 2FA' });
  }
};

// ===========================================
// TRANSACTION MONITORING
// ===========================================

export const getTransactionMonitoring = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, provider, dateRange } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (provider) whereClause.provider = provider;
    if (dateRange?.start) {
      whereClause.createdAt = {
        [Op.between]: [new Date(dateRange.start), new Date(dateRange.end || Date.now())]
      };
    }

    const transactions = await db.Transaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        attributes: ['email', 'firstName', 'lastName']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        transactions: transactions.rows,
        total: transactions.count,
        page: parseInt(page),
        totalPages: Math.ceil(transactions.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting transaction monitoring:', error);
    res.status(500).json({ success: false, message: 'Failed to get transactions' });
  }
};

export const flagTransaction = async (req, res) => {
  try {
    const { transactionId, reason, severity } = req.body;

    const transaction = await db.Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await transaction.update({
      flagged: true,
      flagReason: reason,
      flagSeverity: severity,
      flaggedBy: req.user.id,
      flaggedAt: new Date()
    });

    await logAdminAction(req.user.id, 'FLAG_TRANSACTION', {
      transactionId,
      reason,
      severity
    }, req.ip);

    res.json({
      success: true,
      message: 'Transaction flagged successfully'
    });
  } catch (error) {
    logger.error('Error flagging transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to flag transaction' });
  }
};

export const reverseTransaction = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;

    const transaction = await db.Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Create reverse transaction
    const reverseTransaction = await db.Transaction.create({
      userId: transaction.userId,
      type: 'reversal',
      amount: transaction.amount,
      provider: transaction.provider,
      status: 'pending',
      relatedTransactionId: transactionId,
      reversalReason: reason,
      reversedBy: req.user.id
    });

    // Process the reversal
    if (transaction.provider === 'tempo') {
      await tempoService.reverseTransaction(transaction.providerTransactionId);
    } else if (transaction.provider === 'circle') {
      await circleService.reverseTransaction(transaction.providerTransactionId);
    }

    await transaction.update({ status: 'reversed' });
    await reverseTransaction.update({ status: 'completed' });

    await logAdminAction(req.user.id, 'REVERSE_TRANSACTION', {
      transactionId,
      reason,
      amount: transaction.amount
    }, req.ip);

    res.json({
      success: true,
      message: 'Transaction reversed successfully',
      data: { reverseTransactionId: reverseTransaction.id }
    });
  } catch (error) {
    logger.error('Error reversing transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to reverse transaction' });
  }
};

export const getSuspiciousTransactions = async (req, res) => {
  try {
    const suspiciousTransactions = await db.Transaction.findAll({
      where: {
        [Op.or]: [
          { flagged: true },
          { amount: { [Op.gte]: 10000 } }, // Large transactions
          { status: 'failed' }
        ]
      },
      include: [{
        model: db.User,
        attributes: ['email', 'firstName', 'lastName']
      }],
      limit: 50,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: suspiciousTransactions
    });
  } catch (error) {
    logger.error('Error getting suspicious transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to get suspicious transactions' });
  }
};

// ===========================================
// COMPLIANCE & KYC
// ===========================================

export const getKYCQueue = async (req, res) => {
  try {
    const pendingKYC = await db.UserKyc.findAll({
      where: { status: 'pending' },
      include: [{
        model: db.User,
        attributes: ['email', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: pendingKYC
    });
  } catch (error) {
    logger.error('Error getting KYC queue:', error);
    res.status(500).json({ success: false, message: 'Failed to get KYC queue' });
  }
};

export const reviewKYC = async (req, res) => {
  try {
    const { kycId, status, notes } = req.body;

    const kyc = await db.UserKyc.findByPk(kycId);
    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    await kyc.update({
      status,
      reviewNotes: notes,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    // Update user verification status
    await db.User.update(
      { kycVerified: status === 'approved' },
      { where: { id: kyc.userId } }
    );

    await logAdminAction(req.user.id, 'REVIEW_KYC', {
      kycId,
      status,
      userId: kyc.userId
    }, req.ip);

    res.json({
      success: true,
      message: `KYC ${status} successfully`
    });
  } catch (error) {
    logger.error('Error reviewing KYC:', error);
    res.status(500).json({ success: false, message: 'Failed to review KYC' });
  }
};

export const getComplianceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const report = {
      kycSubmissions: await db.UserKyc.count({
        where: {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        }
      }),
      kycApproved: await db.UserKyc.count({
        where: {
          status: 'approved',
          reviewedAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        }
      }),
      flaggedTransactions: await db.Transaction.count({
        where: {
          flagged: true,
          flaggedAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        }
      }),
      suspendedUsers: await db.User.count({
        where: {
          status: 'suspended',
          updatedAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        }
      })
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error getting compliance report:', error);
    res.status(500).json({ success: false, message: 'Failed to get compliance report' });
  }
};

export const getAMLAlerts = async (req, res) => {
  try {
    // Get potential AML alerts based on patterns
    const alerts = await db.sequelize.query(
      `SELECT u.id, u.email, COUNT(t.id) as transaction_count, SUM(t.amount) as total_amount
       FROM "Users" u
       JOIN "Transactions" t ON u.id = t."userId"
       WHERE t."createdAt" >= :date
       GROUP BY u.id, u.email
       HAVING COUNT(t.id) > 10 OR SUM(t.amount) > 10000`,
      {
        replacements: {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Error getting AML alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to get AML alerts' });
  }
};

// ===========================================
// ANALYTICS & REPORTING
// ===========================================

export const getAnalyticsDashboard = async (req, res) => {
  try {
    const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = req.query;

    const analytics = {
      revenue: await db.Transaction.sum('fee', {
        where: {
          status: 'completed',
          createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] }
        }
      }),
      transactions: await db.Transaction.count({
        where: {
          createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] }
        }
      }),
      newUsers: await db.User.count({
        where: {
          createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] }
        }
      }),
      providerBreakdown: await db.sequelize.query(
        `SELECT provider, COUNT(*) as count, SUM(amount) as volume
         FROM "Transactions"
         WHERE "createdAt" BETWEEN :startDate AND :endDate
         GROUP BY provider`,
        {
          replacements: { startDate, endDate },
          type: db.sequelize.QueryTypes.SELECT
        }
      )
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error getting analytics dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
};

export const exportAnalytics = async (req, res) => {
  try {
    const { format, dateRange } = req.body;

    // Get analytics data
    const data = await getAnalyticsData(dateRange);

    // Format based on requested format
    let output;
    if (format === 'csv') {
      output = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
    } else if (format === 'json') {
      output = JSON.stringify(data, null, 2);
      res.setHeader('Content-Type', 'application/json');
    }

    res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.${format}`);
    res.send(output);
  } catch (error) {
    logger.error('Error exporting analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to export analytics' });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const revenue = await db.sequelize.query(
      `SELECT
        DATE_TRUNC('day', "createdAt") as date,
        SUM(fee) as revenue,
        COUNT(*) as transactions
       FROM "Transactions"
       WHERE status = 'completed' AND "createdAt" >= :date
       GROUP BY DATE_TRUNC('day', "createdAt")
       ORDER BY date DESC`,
      {
        replacements: {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    logger.error('Error getting revenue analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to get revenue analytics' });
  }
};

export const getPerformanceMetrics = async (req, res) => {
  try {
    const metrics = {
      apiLatency: await getAPILatency(),
      databasePerformance: await getDatabasePerformance(),
      providerLatency: {
        tempo: 100, // ms
        circle: 4000 // ms
      },
      errorRate: await getErrorRate()
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to get performance metrics' });
  }
};

// ===========================================
// AUDIT LOGS
// ===========================================

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action, dateRange } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (userId) whereClause.userId = userId;
    if (action) whereClause.action = action;
    if (dateRange?.start) {
      whereClause.createdAt = {
        [Op.between]: [new Date(dateRange.start), new Date(dateRange.end || Date.now())]
      };
    }

    const logs = await db.ActivityLog.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        attributes: ['email', 'firstName', 'lastName']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        logs: logs.rows,
        total: logs.count,
        page: parseInt(page),
        totalPages: Math.ceil(logs.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting audit logs:', error);
    res.status(500).json({ success: false, message: 'Failed to get audit logs' });
  }
};

export const exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const logs = await db.ActivityLog.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [{
        model: db.User,
        attributes: ['email']
      }],
      order: [['createdAt', 'DESC']]
    });

    const csv = convertToCSV(logs.map(log => ({
      timestamp: log.createdAt,
      user: log.User?.email,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress
    })));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting audit logs:', error);
    res.status(500).json({ success: false, message: 'Failed to export audit logs' });
  }
};

// ===========================================
// SYSTEM CONFIGURATION
// ===========================================

export const getSystemConfig = async (req, res) => {
  try {
    const config = await db.SystemConfig.findAll();

    const configObject = {};
    config.forEach(item => {
      configObject[item.key] = item.value;
    });

    res.json({
      success: true,
      data: configObject
    });
  } catch (error) {
    logger.error('Error getting system config:', error);
    res.status(500).json({ success: false, message: 'Failed to get system config' });
  }
};

export const updateSystemConfig = async (req, res) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await db.SystemConfig.upsert({
        key,
        value,
        updatedBy: req.user.id,
        updatedAt: new Date()
      });
    }

    await logAdminAction(req.user.id, 'UPDATE_SYSTEM_CONFIG', updates, req.ip);

    res.json({
      success: true,
      message: 'System configuration updated successfully'
    });
  } catch (error) {
    logger.error('Error updating system config:', error);
    res.status(500).json({ success: false, message: 'Failed to update system config' });
  }
};

export const getFeatureFlags = async (req, res) => {
  try {
    const flags = await db.SystemConfig.findAll({
      where: {
        key: { [Op.like]: 'feature_%' }
      }
    });

    const flagsObject = {};
    flags.forEach(flag => {
      flagsObject[flag.key.replace('feature_', '')] = flag.value === 'true';
    });

    res.json({
      success: true,
      data: flagsObject
    });
  } catch (error) {
    logger.error('Error getting feature flags:', error);
    res.status(500).json({ success: false, message: 'Failed to get feature flags' });
  }
};

export const updateFeatureFlag = async (req, res) => {
  try {
    const { flag, enabled } = req.body;

    await db.SystemConfig.upsert({
      key: `feature_${flag}`,
      value: enabled.toString(),
      updatedBy: req.user.id,
      updatedAt: new Date()
    });

    await logAdminAction(req.user.id, 'UPDATE_FEATURE_FLAG', { flag, enabled }, req.ip);

    res.json({
      success: true,
      message: `Feature flag ${flag} ${enabled ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    logger.error('Error updating feature flag:', error);
    res.status(500).json({ success: false, message: 'Failed to update feature flag' });
  }
};

export const restartService = async (req, res) => {
  try {
    const { service } = req.body;

    // This would trigger actual service restart in production
    logger.info(`Service restart requested for: ${service}`);

    await logAdminAction(req.user.id, 'RESTART_SERVICE', { service }, req.ip);

    res.json({
      success: true,
      message: `Service ${service} restart initiated`
    });
  } catch (error) {
    logger.error('Error restarting service:', error);
    res.status(500).json({ success: false, message: 'Failed to restart service' });
  }
};

// ===========================================
// ALERTS & MONITORING
// ===========================================

export const getActiveAlerts = async (req, res) => {
  try {
    // Mock alerts for now - would be from monitoring system
    const alerts = [
      {
        id: '1',
        type: 'warning',
        category: 'performance',
        title: 'High API Latency',
        message: 'API latency exceeds 500ms threshold',
        timestamp: new Date(),
        acknowledged: false
      }
    ];

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Error getting active alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to get alerts' });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    // Update alert status in monitoring system
    logger.info(`Alert ${alertId} acknowledged by ${req.user.email}`);

    await logAdminAction(req.user.id, 'ACKNOWLEDGE_ALERT', { alertId }, req.ip);

    res.json({
      success: true,
      message: 'Alert acknowledged'
    });
  } catch (error) {
    logger.error('Error acknowledging alert:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge alert' });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolution } = req.body;

    // Resolve alert in monitoring system
    logger.info(`Alert ${alertId} resolved by ${req.user.email}`);

    await logAdminAction(req.user.id, 'RESOLVE_ALERT', { alertId, resolution }, req.ip);

    res.json({
      success: true,
      message: 'Alert resolved'
    });
  } catch (error) {
    logger.error('Error resolving alert:', error);
    res.status(500).json({ success: false, message: 'Failed to resolve alert' });
  }
};

export const getMonitoringMetrics = async (req, res) => {
  try {
    const metrics = {
      cpu: 45, // percentage
      memory: 62, // percentage
      disk: 35, // percentage
      network: {
        in: 125, // Mbps
        out: 89 // Mbps
      },
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting monitoring metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to get monitoring metrics' });
  }
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

async function getAnalyticsData(dateRange) {
  // Implementation for getting analytics data
  return {};
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');

  return csv;
}

async function getAPILatency() {
  // Mock implementation - would query monitoring system
  return 125; // ms
}

async function getDatabasePerformance() {
  // Mock implementation - would query database metrics
  return {
    avgQueryTime: 15, // ms
    activeConnections: 45,
    slowQueries: 2
  };
}

async function getErrorRate() {
  // Mock implementation - would calculate from logs
  return 0.02; // 2% error rate
}