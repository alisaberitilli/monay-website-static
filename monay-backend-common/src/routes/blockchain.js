import { Router } from 'express';
import HttpStatus from 'http-status';
import authenticateToken from '../middleware-app/auth-middleware.js';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://alisaberi:@localhost:5432/monay',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const router = Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Blockchain routes are working' });
});

// Base EVM L2 Status
router.get('/base/status', async (req, res) => {
  try {
    // Mock implementation for Base EVM L2 status
    const baseStatus = {
      success: true,
      chain: 'Base L2',
      type: 'EVM',
      network: 'testnet',
      chainId: 84531, // Base Goerli testnet
      status: 'operational',
      blockHeight: Math.floor(Math.random() * 1000000) + 5000000,
      gasPrice: '0.001 gwei',
      rpcUrl: process.env.BASE_RPC_URL || 'https://goerli.base.org',
      features: {
        erc3643: true,
        treasury: true,
        compliance: true,
        institutionalSupport: true
      },
      contracts: {
        treasury: '0x' + '0'.repeat(40),
        complianceRegistry: '0x' + '0'.repeat(40),
        tokenFactory: '0x' + '0'.repeat(40)
      },
      metrics: {
        transactionsToday: Math.floor(Math.random() * 1000),
        totalValueLocked: '$' + (Math.random() * 10000000).toFixed(2),
        activeWallets: Math.floor(Math.random() * 5000)
      },
      lastUpdated: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(baseStatus);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      chain: 'Base L2',
      status: 'error',
      error: error.message
    });
  }
});

// Solana Status
router.get('/solana/status', async (req, res) => {
  try {
    // Mock implementation for Solana status
    const solanaStatus = {
      success: true,
      chain: 'Solana',
      type: 'Consumer Rail',
      network: 'devnet',
      status: 'operational',
      slot: Math.floor(Math.random() * 10000000) + 200000000,
      blockHeight: Math.floor(Math.random() * 10000000) + 200000000,
      tps: Math.floor(Math.random() * 5000) + 1000,
      rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      features: {
        token2022: true,
        fastPayments: true,
        consumerWallet: true,
        nftSupport: true
      },
      programs: {
        treasury: '11111111111111111111111111111111',
        paymentProcessor: '11111111111111111111111111111111',
        walletProgram: '11111111111111111111111111111111'
      },
      metrics: {
        transactionsToday: Math.floor(Math.random() * 50000),
        averageConfirmationTime: '0.4s',
        activeWallets: Math.floor(Math.random() * 20000),
        totalValueProcessed: '$' + (Math.random() * 5000000).toFixed(2)
      },
      lastUpdated: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(solanaStatus);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      chain: 'Solana',
      status: 'error',
      error: error.message
    });
  }
});

// Cross-rail bridge status
router.get('/bridge/status', async (req, res) => {
  try {
    const bridgeStatus = {
      success: true,
      service: 'Cross-Rail Bridge',
      status: 'operational',
      supportedChains: ['Base L2', 'Solana'],
      bridges: {
        baseToSolana: {
          status: 'active',
          pendingTransfers: Math.floor(Math.random() * 10),
          totalBridged: '$' + (Math.random() * 1000000).toFixed(2),
          averageTime: '2-3 minutes'
        },
        solanaToBase: {
          status: 'active',
          pendingTransfers: Math.floor(Math.random() * 10),
          totalBridged: '$' + (Math.random() * 1000000).toFixed(2),
          averageTime: '2-3 minutes'
        }
      },
      treasury: {
        baseBalance: '$' + (Math.random() * 5000000).toFixed(2),
        solanaBalance: '$' + (Math.random() * 5000000).toFixed(2),
        totalLiquidity: '$' + (Math.random() * 10000000).toFixed(2)
      },
      lastSync: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(bridgeStatus);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      service: 'Cross-Rail Bridge',
      status: 'error',
      error: error.message
    });
  }
});

// Get blockchain health for all chains
router.get('/health', async (req, res) => {
  try {
    const health = {
      success: true,
      timestamp: new Date().toISOString(),
      chains: {
        base: {
          status: 'healthy',
          responseTime: Math.random() * 100 + 'ms'
        },
        solana: {
          status: 'healthy',
          responseTime: Math.random() * 50 + 'ms'
        },
        bridge: {
          status: 'healthy',
          responseTime: Math.random() * 150 + 'ms'
        }
      },
      overall: 'operational'
    };

    res.status(HttpStatus.OK).json(health);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
});

// Create blockchain transfer (Enterprise Wallet → Treasury)
router.post('/transfer', authenticateToken, async (req, res) => {
  try {
    const {
      to_address,
      value,
      token_symbol,
      network,
      memo,
      speed,
      recipient_name,
      recipient_type
    } = req.body;

    // Validate required fields
    if (!to_address || !value || !token_symbol) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Missing required fields: to_address, value, token_symbol'
      });
    }

    // Get user from auth middleware
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User authentication required'
      });
    }

    // Generate transaction hash (mock - in production would come from blockchain)
    const transactionHash = `0x${Math.random().toString(16).substring(2, 66).padEnd(64, '0')}`;
    const transactionId = uuidv4();

    // Determine from_address (Enterprise Wallet address)
    // In production, fetch from user's wallet record
    const from_address = '0xEnterpriseWallet' + userId.substring(0, 30);

    // Insert into blockchain_transactions table
    // Note: Using 'chain' column (not 'network') and 'user_id' to match schema
    const query = `
      INSERT INTO blockchain_transactions (
        id,
        user_id,
        from_address,
        to_address,
        value,
        token_symbol,
        transaction_hash,
        status,
        chain,
        metadata,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `;

    const metadata = {
      memo,
      speed,
      recipient_name,
      recipient_type,
      initiated_by: userId,
      source: 'enterprise_wallet'
    };

    const values = [
      transactionId,
      userId,
      from_address,
      to_address,
      value.toString(),
      token_symbol,
      transactionHash,
      'completed', // Auto-complete for now, in production would be 'pending'
      network || 'base',
      JSON.stringify(metadata)
    ];

    const result = await pool.query(query, values);
    const transaction = result.rows[0];

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Transfer initiated successfully',
      transaction: {
        id: transaction.id,
        transaction_hash: transaction.transaction_hash,
        from_address: transaction.from_address,
        to_address: transaction.to_address,
        value: transaction.value,
        token_symbol: transaction.token_symbol,
        status: transaction.status,
        chain: transaction.chain,
        created_at: transaction.created_at
      }
    });
  } catch (error) {
    console.error('Blockchain transfer error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to process blockchain transfer',
      details: error.message
    });
  }
});

export default router;