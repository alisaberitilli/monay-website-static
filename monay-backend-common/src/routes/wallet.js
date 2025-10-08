import { Router } from 'express';
import controllers from '../controllers/index.js';
import middlewares from '../middleware-app/index.js';
import db from '../models/index.js';

const router = Router();
const { walletController } = controllers;
const { authMiddleware } = middlewares;

router.get(
    '/user/wallet',
    authMiddleware,
    walletController.getMyWallet
);

/**
 * GET /api/wallet/addresses
 * Get or generate wallet addresses for user (Solana + Base L2)
 */
router.get(
    '/wallet/addresses',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.user?.id || req.user?.userId;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            const User = db.User;

            // Get user from database
            const user = await User.findByPk(userId, {
                attributes: ['id', 'solanaAddress', 'baseAddress', 'firstName', 'lastName', 'email']
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Generate addresses if they don't exist
            let { solanaAddress, baseAddress } = user;

            // Simple demo address generation (in production, use proper wallet generation)
            if (!solanaAddress) {
                // Generate a mock Solana address (44 characters)
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
                solanaAddress = Array(44).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
                await user.update({ solanaAddress });
            }

            if (!baseAddress) {
                // Generate a mock EVM address (42 characters with 0x prefix)
                const hex = '0123456789abcdef';
                baseAddress = '0x' + Array(40).fill(0).map(() => hex[Math.floor(Math.random() * hex.length)]).join('');
                await user.update({ baseAddress });
            }

            res.json({
                success: true,
                data: {
                    solana: solanaAddress,
                    ethereum: baseAddress,
                    base: baseAddress, // Same as ethereum for Base L2
                    userId: user.id,
                    userInfo: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }
                }
            });
        } catch (error) {
            console.error('Wallet addresses error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch wallet addresses'
            });
        }
    }
);

// Simple balance endpoint for demo
router.get(
    '/balance',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.user?.id || req.user?.userId;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            // Use direct database query since models might not be loaded
            const sequelize = db.sequelize;

            const [results] = await sequelize.query(
                'SELECT id, balance FROM wallets WHERE user_id = :userId LIMIT 1',
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (!results) {
                return res.status(404).json({
                    success: false,
                    message: 'Wallet not found'
                });
            }

            const balance = parseFloat(results.balance || 0);

            res.json({
                success: true,
                data: {
                    balance: balance,
                    available: balance,
                    walletId: results.id
                }
            });
        } catch (error) {
            console.error('Balance error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch balance'
            });
        }
    }
);

/**
 * GET /api/transactions
 * Get user's transaction history with filtering and pagination
 */
router.get(
    '/transactions',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.user?.id || req.user?.userId;
            const {
                type = 'all',
                category = 'all',
                dateRange = 'month',
                search = '',
                limit = 50
            } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            const sequelize = db.sequelize;

            // Build where clause for filtering
            let whereClause = 'WHERE (user_id = :userId OR from_user_id = :userId OR to_user_id = :userId)';
            const replacements = { userId, limit: parseInt(limit) };

            // Date range filter
            if (dateRange === 'today') {
                whereClause += ' AND created_at >= CURRENT_DATE';
            } else if (dateRange === 'week') {
                whereClause += ' AND created_at >= CURRENT_DATE - INTERVAL \'7 days\'';
            } else if (dateRange === 'month') {
                whereClause += ' AND created_at >= CURRENT_DATE - INTERVAL \'30 days\'';
            } else if (dateRange === 'year') {
                whereClause += ' AND created_at >= CURRENT_DATE - INTERVAL \'365 days\'';
            }

            // Search filter
            if (search) {
                whereClause += ' AND (status_message ILIKE :search OR to_address ILIKE :search OR from_address ILIKE :search)';
                replacements.search = `%${search}%`;
            }

            // Fetch transactions
            const transactions = await sequelize.query(
                `SELECT
                    id,
                    wallet_id,
                    user_id,
                    from_user_id,
                    to_user_id,
                    from_address,
                    to_address,
                    amount,
                    currency,
                    type,
                    status,
                    status_message,
                    blockchain_network,
                    metadata,
                    created_at
                FROM transactions
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT :limit`,
                {
                    replacements,
                    type: sequelize.QueryTypes.SELECT
                }
            );

            // Transform to frontend format
            const formattedTransactions = transactions.map(tx => {
                const isIncome = tx.to_user_id === userId && tx.from_user_id !== userId;
                const metadata = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;

                // Determine merchant/description
                let merchant = tx.status_message || 'Transaction';
                if (metadata?.recipientName) {
                    merchant = isIncome ? `From ${metadata.recipientName}` : `To ${metadata.recipientName}`;
                } else if (metadata?.fromRail && metadata?.toRail) {
                    merchant = `${metadata.fromRail} → ${metadata.toRail}`;
                }

                // Determine category
                let category = 'Transfer';
                if (metadata?.fromRail === 'solana' && metadata?.toRail === 'base_l2') {
                    category = 'Cross-Rail Transfer';
                }

                return {
                    id: tx.id,
                    type: isIncome ? 'income' : 'expense',
                    merchant,
                    category,
                    amount: parseFloat(tx.amount),
                    date: formatDate(tx.created_at),
                    time: formatTime(tx.created_at),
                    status: tx.status,
                    paymentMethod: metadata?.fromRail ? `${metadata.fromRail} network` : tx.blockchain_network || 'Wallet',
                    description: tx.status_message,
                    transactionId: tx.id,
                    rawAmount: parseFloat(tx.amount),
                    createdAt: tx.created_at,
                    metadata: metadata
                };
            });

            // Calculate summary
            const totalIncome = formattedTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalExpenses = formattedTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            res.json({
                success: true,
                transactions: formattedTransactions,
                summary: {
                    totalIncome,
                    totalExpenses,
                    netFlow: totalIncome - totalExpenses,
                    transactionCount: formattedTransactions.length
                }
            });

        } catch (error) {
            console.error('Transactions error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch transactions'
            });
        }
    }
);

// Helper functions for date formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * POST /api/wallet/cross-rail-transfer
 * Transfer funds from Consumer Wallet (Solana) to Enterprise Wallet (Base L2)
 * Implements treasury swap model for cross-chain transfers
 */
router.post(
    '/wallet/cross-rail-transfer',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.user?.id || req.user?.userId;
            const { toAddress, amount, currency = 'USD', description = 'Cross-rail transfer' } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            if (!toAddress || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Recipient address and amount are required'
                });
            }

            if (amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than zero'
                });
            }

            const sequelize = db.sequelize;

            // Start transaction
            const transaction = await sequelize.transaction();

            try {
                // 1. Get sender's user info and wallet
                const [senderUser] = await sequelize.query(
                    'SELECT id, solana_address, base_address FROM users WHERE id = :userId LIMIT 1',
                    {
                        replacements: { userId },
                        type: sequelize.QueryTypes.SELECT,
                        transaction
                    }
                );

                const [senderWallet] = await sequelize.query(
                    'SELECT id, balance, user_id FROM wallets WHERE user_id = :userId LIMIT 1',
                    {
                        replacements: { userId },
                        type: sequelize.QueryTypes.SELECT,
                        transaction
                    }
                );

                if (!senderWallet) {
                    await transaction.rollback();
                    return res.status(404).json({
                        success: false,
                        message: 'Sender wallet not found'
                    });
                }

                const currentBalance = parseFloat(senderWallet.balance || 0);

                if (currentBalance < amount) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient balance. Available: $${currentBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`
                    });
                }

                // 2. Find recipient (enterprise) wallet by Base L2 address
                const [recipientUser] = await sequelize.query(
                    'SELECT id, first_name, last_name FROM users WHERE base_address = :toAddress LIMIT 1',
                    {
                        replacements: { toAddress },
                        type: sequelize.QueryTypes.SELECT,
                        transaction
                    }
                );

                let recipientWalletId;
                let recipientName = 'Enterprise Wallet';

                if (recipientUser) {
                    recipientName = `${recipientUser.first_name} ${recipientUser.last_name}`;
                    const [recipientWallet] = await sequelize.query(
                        'SELECT id FROM wallets WHERE user_id = :userId LIMIT 1',
                        {
                            replacements: { userId: recipientUser.id },
                            type: sequelize.QueryTypes.SELECT,
                            transaction
                        }
                    );
                    recipientWalletId = recipientWallet?.id;
                }

                // 3. Deduct from sender
                await sequelize.query(
                    'UPDATE wallets SET balance = balance - :amount, updated_at = NOW() WHERE id = :walletId',
                    {
                        replacements: { amount, walletId: senderWallet.id },
                        type: sequelize.QueryTypes.UPDATE,
                        transaction
                    }
                );

                // 4. Add to recipient (if wallet exists)
                if (recipientWalletId) {
                    await sequelize.query(
                        'UPDATE wallets SET balance = balance + :amount, updated_at = NOW() WHERE id = :walletId',
                        {
                            replacements: { amount, walletId: recipientWalletId },
                            type: sequelize.QueryTypes.UPDATE,
                            transaction
                        }
                    );
                }

                // 5. Create transaction record
                const transactionId = `xfer_${Date.now()}_${userId.substring(0, 8)}`;
                await sequelize.query(
                    `INSERT INTO transactions (
                        id, wallet_id, user_id, from_user_id, to_user_id,
                        from_address, to_address, amount, currency, type, status,
                        status_message, blockchain_network, metadata, created_at, updated_at
                    ) VALUES (
                        :id, :walletId, :userId, :fromUserId, :toUserId,
                        :fromAddress, :toAddress, :amount, :currency, :type, :status,
                        :statusMessage, :blockchainNetwork, :metadata, NOW(), NOW()
                    )`,
                    {
                        replacements: {
                            id: transactionId,
                            walletId: senderWallet.id,
                            userId,
                            fromUserId: userId,
                            toUserId: recipientUser?.id || null,
                            fromAddress: senderUser?.solana_address || null,
                            toAddress: toAddress,
                            amount,
                            currency,
                            type: 'transfer',
                            status: 'completed',
                            statusMessage: description,
                            blockchainNetwork: 'cross_rail',
                            metadata: JSON.stringify({
                                fromRail: 'solana',
                                toRail: 'base_l2',
                                toAddress,
                                recipientName,
                                treasurySwap: true,
                                timestamp: new Date().toISOString()
                            })
                        },
                        type: sequelize.QueryTypes.INSERT,
                        transaction
                    }
                );

                // Commit transaction
                await transaction.commit();

                // Get new balance
                const [updatedWallet] = await sequelize.query(
                    'SELECT balance FROM wallets WHERE id = :walletId',
                    {
                        replacements: { walletId: senderWallet.id },
                        type: sequelize.QueryTypes.SELECT
                    }
                );

                res.json({
                    success: true,
                    data: {
                        transactionId,
                        amount,
                        currency,
                        toAddress,
                        recipientName,
                        status: 'completed',
                        newBalance: parseFloat(updatedWallet.balance),
                        timestamp: new Date().toISOString(),
                        rails: {
                            from: 'Solana (Consumer)',
                            to: 'Base L2 (Enterprise)'
                        }
                    },
                    message: `Successfully transferred $${amount.toFixed(2)} to ${recipientName}`
                });

            } catch (error) {
                await transaction.rollback();
                throw error;
            }

        } catch (error) {
            console.error('Cross-rail transfer error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to process cross-rail transfer'
            });
        }
    }
);

export default router;
