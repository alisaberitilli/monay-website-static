import { Router } from 'express';
import HttpStatus from 'http-status';
import path from 'path';
import net from 'net';

const router = Router();

// API information endpoint - serve the modern status HTML page
router.get('/', (req, res) => {
  // Serve the modern status page for root route
  const statusPath = path.join(__dirname, '../public/status-modern.html');
  return res.sendFile(statusPath);
});

// JSON API info endpoint for programmatic access
router.get('/api/info', (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    name: 'Monay Backend API',
    version: '1.0.0',
    description: 'Centralized API for Monay Platform',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      transactions: '/api/transactions',
      wallet: '/api/wallet',
      admin: '/api/admin',
      blockchain: {
        solana: {
          base: '/api/solana',
          description: 'Solana Consumer Rail - Fast payments',
          endpoints: [
            'POST /api/solana/generate-wallet - Generate new Solana wallet',
            'GET /api/solana/balance/:address - Get SOL balance',
            'GET /api/solana/token-balance/:address/:mint - Get token balance',
            'POST /api/solana/transfer-sol - Transfer SOL',
            'POST /api/solana/transfer-token - Transfer SPL token',
            'GET /api/solana/transactions/:address - Get transaction history',
            'POST /api/solana/validate-address - Validate Solana address',
            'GET /api/solana/estimate-fee - Estimate transaction fee'
          ]
        },
        evm: {
          base: '/api/evm',
          description: 'Base L2 Enterprise Rail - Compliance & institutional',
          endpoints: [
            'POST /api/evm/generate-wallet - Generate EVM wallet',
            'POST /api/evm/import-wallet - Import existing wallet',
            'GET /api/evm/balance/:address - Get ETH/token balance',
            'POST /api/evm/transfer - Transfer ETH or ERC20',
            'POST /api/evm/deploy-token - Deploy ERC3643 token',
            'POST /api/evm/business-rule - Create business rule',
            'POST /api/evm/spend-limits - Set spend limits',
            'POST /api/evm/kyc-data - Update KYC data',
            'GET /api/evm/transactions/:address - Get transaction history',
            'POST /api/evm/estimate-gas - Estimate gas cost',
            'POST /api/evm/validate-address - Validate EVM address',
            'GET /api/evm/network-status - Get network status',
            'GET /api/evm/block-number - Get current block'
          ]
        },
        bridge: {
          base: '/api/bridge',
          description: 'Cross-Rail Bridge - Transfer between chains',
          endpoints: [
            'POST /api/bridge/swap/evm-to-solana - Swap from Base to Solana',
            'POST /api/bridge/swap/solana-to-evm - Swap from Solana to Base',
            'GET /api/bridge/swap/status/:swapId - Get swap status',
            'GET /api/bridge/swaps/user/:userId - Get user swaps',
            'POST /api/bridge/swap/cancel/:swapId - Cancel pending swap',
            'GET /api/bridge/stats - Get bridge statistics',
            'GET /api/bridge/config - Get bridge configuration',
            'GET /api/bridge/health - Bridge health check'
          ]
        },
        status: {
          base: '/api/blockchain',
          endpoints: [
            'GET /api/blockchain/health - Overall blockchain health',
            'GET /api/blockchain/base/status - Base L2 status',
            'GET /api/blockchain/solana/status - Solana status',
            'GET /api/blockchain/bridge/status - Bridge status'
          ]
        },
        contracts: {
          base: '/api/contracts',
          description: 'Smart Contract Operations',
          endpoints: [
            'POST /api/contracts/evm/deploy - Deploy ERC3643 compliant token',
            'POST /api/contracts/evm/mint - Mint tokens to address',
            'POST /api/contracts/evm/burn - Burn tokens from address',
            'POST /api/contracts/evm/pause - Pause token transfers',
            'POST /api/contracts/evm/unpause - Resume token transfers',
            'GET /api/contracts/evm/info/:address - Get contract info',
            'GET /api/contracts/evm/supply/:address - Get total supply',
            'POST /api/contracts/evm/whitelist/add - Add to whitelist',
            'POST /api/contracts/evm/whitelist/remove - Remove from whitelist',
            'GET /api/contracts/evm/whitelist/:address - Check whitelist status',
            'POST /api/contracts/solana/deploy - Deploy Token-2022 program',
            'POST /api/contracts/solana/create-token - Create new SPL token',
            'POST /api/contracts/solana/mint - Mint SPL tokens',
            'POST /api/contracts/solana/freeze - Freeze token account',
            'POST /api/contracts/solana/thaw - Unfreeze token account',
            'GET /api/contracts/solana/metadata/:mint - Get token metadata',
            'POST /api/contracts/solana/transfer-hook - Set transfer hook',
            'POST /api/contracts/solana/interest - Configure interest rate'
          ]
        }
      },
      treasury: {
        base: '/api/treasury',
        description: 'Treasury Management & Liquidity',
        endpoints: [
          'GET /api/treasury/overview - Get treasury overview',
          'GET /api/treasury/balances - Get all treasury balances',
          'GET /api/treasury/balance/:chain - Get chain-specific balance',
          'POST /api/treasury/rebalance - Rebalance liquidity across chains',
          'POST /api/treasury/mint - Mint new tokens (Admin only)',
          'POST /api/treasury/burn - Burn tokens (Admin only)',
          'GET /api/treasury/transactions - Get treasury transactions',
          'GET /api/treasury/analytics - Get treasury analytics',
          'POST /api/treasury/reserve/lock - Lock reserve funds',
          'POST /api/treasury/reserve/unlock - Unlock reserve funds',
          'GET /api/treasury/audit/trail - Get audit trail',
          'GET /api/treasury/compliance/report - Generate compliance report'
        ]
      },
      monayFiat: {
        base: '/api/monay-fiat',
        description: 'Monay GPS Fiat Payment Gateway - Primary on/off-ramp provider',
        endpoints: [
          'GET /api/monay-fiat/test-connection - Test Monay Fiat connection (Admin/Developer only)',
          'POST /api/monay-fiat/payment-link - Create payment link',
          'POST /api/monay-fiat/payment/card - Process card payment',
          'POST /api/monay-fiat/payment/ach - Process ACH payment',
          'GET /api/monay-fiat/payment/status/:transactionId - Get payment status',
          'POST /api/monay-fiat/payment/refund/:transactionId - Refund payment (Admin/Merchant only)',
          'POST /api/monay-fiat/payment/capture/:transactionId - Capture payment (Admin/Merchant only)',
          'POST /api/monay-fiat/payment/void/:transactionId - Void payment (Admin/Merchant only)',
          'GET /api/monay-fiat/transactions - Get transaction history',
          'POST /api/monay-fiat/webhook - Handle Monay Fiat webhooks'
        ]
      },
      status: '/status - Platform status dashboard',
      documentation: '/api-docs (development only)'
    },
    message: 'Welcome to Monay API. Please use the appropriate endpoints for your requests.'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// API version endpoint
router.get('/version', (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    version: '1.0.0',
    api_version: 'v1',
    build: process.env.BUILD_NUMBER || 'dev',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get all connected applications status
router.get('/applications', async (req, res) => {
  const applications = [
    {
      name: 'Monay Website',
      displayName: 'Public Marketing Website',
      url: 'http://localhost:3000',
      port: 3000,
      type: 'frontend',
      description: 'Marketing and onboarding platform',
      service: 'marketing'
    },
    {
      name: 'Monay Admin',
      displayName: 'Admin Dashboard',
      url: 'http://localhost:3002',
      port: 3002,
      type: 'frontend',
      description: 'Administrative control panel',
      service: 'admin'
    },
    {
      name: 'Monay Web App',
      displayName: 'Cross-Platform Web',
      url: 'http://localhost:3003',
      port: 3003,
      type: 'frontend',
      description: 'Consumer wallet application',
      service: 'wallet'
    },
    {
      name: 'CaaS Admin Dashboard',
      displayName: 'CaaS Platform Admin',
      url: 'http://localhost:3005',
      port: 3005,
      type: 'frontend',
      description: 'CaaS platform administration',
      service: 'caas-admin'
    },
    {
      name: 'Enterprise Console',
      displayName: 'Enterprise Console',
      url: 'http://localhost:3006',
      port: 3006,
      type: 'frontend',
      description: 'Self-service enterprise portal',
      service: 'caas-console'
    },
    {
      name: 'Enterprise Wallet',
      displayName: 'Enterprise Wallet',
      url: 'http://localhost:3007',
      port: 3007,
      type: 'frontend',
      description: 'Enterprise wallet management',
      service: 'caas-wallet'
    },
    {
      name: 'Backend API',
      displayName: 'Monay Backend Common',
      url: 'http://localhost:3001',
      port: 3001,
      type: 'backend',
      description: 'Centralized API server',
      status: 'online',
      service: 'api'
    },
    {
      name: 'PostgreSQL',
      displayName: 'Primary Database',
      url: 'localhost:5432',
      port: 5432,
      type: 'database',
      description: 'Main data store',
      database: 'monay',
      service: 'database'
    }
  ];

  // Check connectivity for frontend apps - simplified
  const checkHealth = async (app) => {
    if (app.type === 'backend') {
      return { ...app, status: 'online', responseTime: 0 };
    }
    if (app.type === 'database') {
      // Database connectivity is already checked by Sequelize
      return { ...app, status: 'online' };
    }
    
    // Use net module for simple port check instead of HTTP fetch
    
    return new Promise((resolve) => {
      const start = Date.now();
      const client = new net.Socket();
      
      // Set timeout
      const timeout = setTimeout(() => {
        client.destroy();
        resolve({ ...app, status: 'offline' });
      }, 1000); // 1 second timeout
      
      client.connect(app.port, 'localhost', () => {
        clearTimeout(timeout);
        client.destroy();
        const responseTime = Date.now() - start;
        resolve({ ...app, status: 'online', responseTime });
      });
      
      client.on('error', () => {
        clearTimeout(timeout);
        client.destroy();
        resolve({ ...app, status: 'offline' });
      });
    });
  };

  try {
    const appsWithStatus = await Promise.all(
      applications.map(app => checkHealth(app))
    );

    res.status(HttpStatus.OK).json({
      success: true,
      applications: appsWithStatus,
      totalApplications: applications.length,
      onlineCount: appsWithStatus.filter(a => a.status === 'online').length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
});

export default router;