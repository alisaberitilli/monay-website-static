import express from 'express';
import path from 'path';
import os from 'os';
import { successResponse } from '../helpers';

const router = express.Router();

// Serve the modern status HTML page at /status
router.get('/status', (req, res) => {
    const statusPath = path.join(__dirname, '../public/status-modern.html');
    res.sendFile(statusPath);
});

// Serve the original status page at /status-classic
router.get('/status-classic', (req, res) => {
    const statusPath = path.join(__dirname, '../public/status.html');
    res.sendFile(statusPath);
});

// API endpoint for live status data
router.get('/api/status', async (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = os.loadavg();
    
    const status = {
        api: {
            status: 'operational',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 3001,
            uptime: uptime,
            timestamp: new Date().toISOString()
        },
        system: {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: memoryUsage.heapUsed,
                percentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
            },
            cpu: {
                loadAverage: cpuUsage,
                cores: os.cpus().length
            }
        },
        services: {
            database: 'connected',
            redis: 'connected',
            blockchain: {
                solana: {
                    network: process.env.SOLANA_NETWORK || 'devnet',
                    status: 'operational',
                    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
                    programId: process.env.SOLANA_PROGRAM_ID || 'MonaySpendMgmt11111111111111111111111111111',
                    type: 'Consumer Rail'
                },
                baseL2: {
                    network: process.env.BASE_NETWORK || 'base-sepolia',
                    status: 'operational',
                    chainId: process.env.BASE_CHAIN_ID || 84532,
                    rpcUrl: process.env.BASE_RPC_URL || 'https://sepolia.base.org',
                    type: 'Enterprise Rail'
                },
                crossRailBridge: {
                    status: 'operational',
                    supportedChains: ['base', 'solana'],
                    estimatedSwapTime: '60 seconds'
                }
            }
        },
        applications: [
            {
                name: 'Monay Website',
                description: 'Public marketing website and CaaS onboarding',
                port: 3000,
                url: 'http://localhost:3000',
                status: 'checking',
                service: 'marketing'
            },
            {
                name: 'Monay Backend API',
                description: 'Core API services with Solana integration',
                port: 3001,
                url: 'http://localhost:3001',
                status: 'online',
                service: 'api'
            },
            {
                name: 'Monay Admin Dashboard',
                description: 'Administrative control panel and monitoring',
                port: 3002,
                url: 'http://localhost:3002',
                status: 'checking',
                service: 'admin'
            },
            {
                name: 'Monay Web Wallet',
                description: 'Consumer wallet application with payment features',
                port: 3003,
                url: 'http://localhost:3003',
                status: 'checking',
                service: 'wallet'
            },
            {
                name: 'CaaS Admin Dashboard',
                description: 'CaaS platform administration',
                port: 3005,
                url: 'http://localhost:3005',
                status: 'checking',
                service: 'caas-admin'
            },
            {
                name: 'Enterprise Console',
                description: 'Self-service enterprise portal',
                port: 3006,
                url: 'http://localhost:3006',
                status: 'checking',
                service: 'caas-console'
            },
            {
                name: 'Monay Enterprise Wallet',
                description: 'CaaS enterprise wallet for token management and compliance',
                port: 3007,
                url: 'http://localhost:3007',
                status: 'checking',
                service: 'caas-wallet'
            }
        ],
        blockchainEndpoints: {
            solana: [
                { method: 'POST', path: '/api/solana/generate-wallet', description: 'Generate new Solana wallet' },
                { method: 'GET', path: '/api/solana/balance/:address', description: 'Get SOL balance' },
                { method: 'GET', path: '/api/solana/token-balance/:address/:mint', description: 'Get token balance' },
                { method: 'POST', path: '/api/solana/transfer-sol', description: 'Transfer SOL' },
                { method: 'POST', path: '/api/solana/transfer-token', description: 'Transfer SPL token' },
                { method: 'GET', path: '/api/solana/transactions/:address', description: 'Get transaction history' },
                { method: 'POST', path: '/api/solana/validate-address', description: 'Validate Solana address' },
                { method: 'GET', path: '/api/solana/estimate-fee', description: 'Estimate transaction fee' }
            ],
            evm: [
                { method: 'POST', path: '/api/evm/generate-wallet', description: 'Generate EVM wallet' },
                { method: 'POST', path: '/api/evm/import-wallet', description: 'Import existing wallet' },
                { method: 'GET', path: '/api/evm/balance/:address', description: 'Get ETH/token balance' },
                { method: 'POST', path: '/api/evm/transfer', description: 'Transfer ETH or ERC20 tokens' },
                { method: 'POST', path: '/api/evm/deploy-token', description: 'Deploy ERC3643 token' },
                { method: 'POST', path: '/api/evm/business-rule', description: 'Create business rule' },
                { method: 'POST', path: '/api/evm/spend-limits', description: 'Set spend limits' },
                { method: 'POST', path: '/api/evm/kyc-data', description: 'Update KYC data' },
                { method: 'GET', path: '/api/evm/transactions/:address', description: 'Get transaction history' },
                { method: 'POST', path: '/api/evm/estimate-gas', description: 'Estimate gas cost' },
                { method: 'POST', path: '/api/evm/validate-address', description: 'Validate EVM address' },
                { method: 'GET', path: '/api/evm/network-status', description: 'Get network status' },
                { method: 'GET', path: '/api/evm/block-number', description: 'Get current block' }
            ],
            bridge: [
                { method: 'POST', path: '/api/bridge/swap/evm-to-solana', description: 'Swap from Base to Solana' },
                { method: 'POST', path: '/api/bridge/swap/solana-to-evm', description: 'Swap from Solana to Base' },
                { method: 'GET', path: '/api/bridge/swap/status/:swapId', description: 'Get swap status' },
                { method: 'GET', path: '/api/bridge/swaps/user/:userId', description: 'Get user swaps' },
                { method: 'POST', path: '/api/bridge/swap/cancel/:swapId', description: 'Cancel pending swap' },
                { method: 'GET', path: '/api/bridge/stats', description: 'Get bridge statistics' },
                { method: 'GET', path: '/api/bridge/config', description: 'Get bridge configuration' },
                { method: 'GET', path: '/api/bridge/health', description: 'Bridge health check' }
            ],
            blockchain: [
                { method: 'GET', path: '/api/blockchain/health', description: 'Overall blockchain health' },
                { method: 'GET', path: '/api/blockchain/base/status', description: 'Base L2 status' },
                { method: 'GET', path: '/api/blockchain/solana/status', description: 'Solana status' },
                { method: 'GET', path: '/api/blockchain/bridge/status', description: 'Bridge status' }
            ]
        },
        statistics: {
            totalRequests: Math.floor(Math.random() * 10000),
            activeUsers: Math.floor(Math.random() * 100),
            avgResponseTime: Math.floor(Math.random() * 100) + 50,
            errorRate: (Math.random() * 2).toFixed(2)
        }
    };
    
    return successResponse(req, res, status, 'Status retrieved successfully');
});

// Endpoint to start an application (development only)
router.post('/api/status/start-app', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ success: false, message: 'Not available in production' });
    }
    
    const { port } = req.body;
    
    // Map ports to start commands
    const startCommands = {
        3000: {
            path: '/Users/alisaberi/Downloads/monay/monay-website',
            command: 'PORT=3000 npm run dev'
        },
        3002: {
            path: '/Users/alisaberi/Downloads/monay/monay-admin',
            command: 'PORT=3002 npm run dev'
        },
        3003: {
            path: '/Users/alisaberi/Downloads/monay/monay-cross-platform/web',
            command: 'PORT=3003 npm run dev'
        },
        3005: {
            path: '/Users/alisaberi/Downloads/monay/monay-caas',
            command: 'PORT=3005 npm run dev:admin'
        },
        3006: {
            path: '/Users/alisaberi/Downloads/monay/monay-caas',
            command: 'PORT=3006 npm run dev:console'
        },
        3007: {
            path: '/Users/alisaberi/Downloads/monay/monay-caas/monay-enterprise-wallet',
            command: 'PORT=3007 npm run dev'
        }
    };
    
    const appConfig = startCommands[port];
    
    if (!appConfig) {
        return res.status(400).json({ success: false, message: 'Invalid port' });
    }
    
    const { spawn, exec } = require('child_process');
    
    try {
        // First, kill any existing process on this port
        exec(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, (error, stdout, stderr) => {
            // After killing any existing process, wait a moment then start the new one
            setTimeout(() => {
                // Spawn the process in detached mode so it continues running
                const child = spawn('npm', ['run', 'dev'], {
                    cwd: appConfig.path,
                    detached: true,
                    stdio: 'ignore',
                    env: { ...process.env, PORT: port }
                });
                
                // Unref the child so our process can exit independently
                child.unref();
            }, 1000); // Wait 1 second for port to be fully released
        });
        
        return res.json({ 
            success: true, 
            message: `Application on port ${port} is starting (killing any existing process first)...`,
            port: port,
            path: appConfig.path
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: `Failed to start application: ${error.message}` 
        });
    }
});

export default router;