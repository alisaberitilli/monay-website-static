import db from '../models/index.js';
const { sequelize } = db;
import circleService from './circle.js';
import walletBalanceService from './wallet-balance-service.js';
import CircleWalletService from './circle-wallet-service.js';
import logger from './logger.js';
import crypto from 'crypto';

class BridgeTransferService {
    constructor() {
        this.circleService = circleService;
        this.circleWalletService = new CircleWalletService();
        this.walletBalanceService = walletBalanceService;
    }

    /**
     * Bridge transfer from Monay to Circle wallet
     */
    async bridgeMonayToCircle(userId, amount) {
        const transaction = await sequelize.transaction();

        try {
            // Validate amount
            if (amount <= 0) {
                throw new Error('Invalid amount');
            }

            // Get user's wallets
            const [monayWallet] = await sequelize.query(
                `SELECT * FROM wallets WHERE user_id = :userId AND status = 'active'`,
                { replacements: { userId }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            const [circleWallet] = await sequelize.query(
                `SELECT * FROM user_circle_wallets WHERE user_id = :userId AND status = 'active'`,
                { replacements: { userId }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            if (!monayWallet || !circleWallet) {
                throw new Error('Wallets not found or not linked');
            }

            // Check Monay balance
            if (parseFloat(monayWallet.balance) < amount) {
                throw new Error('Insufficient Monay balance');
            }

            // Create bridge transfer record
            const transferId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO bridge_transfers (
                    id, user_id, direction, source_amount, source_currency,
                    destination_amount, destination_currency, exchange_rate,
                    status, bridge_fee, initiated_at
                ) VALUES (
                    :id, :userId, 'monay_to_circle', :amount, 'USD',
                    :amount, 'USDC', 1.0, 'initiated', 0, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: { id: transferId, userId, amount },
                    transaction
                }
            );

            // Start processing
            await sequelize.query(
                `UPDATE bridge_transfers
                 SET status = 'processing', processing_at = CURRENT_TIMESTAMP
                 WHERE id = :id`,
                { replacements: { id: transferId }, transaction }
            );

            // Deduct from Monay wallet
            await sequelize.query(
                `UPDATE wallets
                 SET balance = balance - :amount,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :walletId`,
                {
                    replacements: { walletId: monayWallet.id, amount },
                    transaction
                }
            );

            // Create Monay transaction record
            const monayTxId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO transactions (
                    id, user_id, wallet_id, type, amount, currency,
                    status, description, created_at, updated_at
                ) VALUES (
                    :id, :userId, :walletId, 'bridge_out', :amount, 'USD',
                    'completed', 'Bridge to USDC wallet', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: monayTxId,
                        userId,
                        walletId: monayWallet.id,
                        amount: -amount // Negative for outgoing
                    },
                    transaction
                }
            );

            // Add to Circle wallet
            await sequelize.query(
                `UPDATE user_circle_wallets
                 SET usdc_balance = usdc_balance + :amount,
                     available_balance = available_balance + :amount,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :walletId`,
                {
                    replacements: { walletId: circleWallet.id, amount },
                    transaction
                }
            );

            // Create Circle transaction record
            const circleTxId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO circle_transactions (
                    id, user_id, circle_wallet_id, transaction_type, amount,
                    currency, status, related_transaction_id, metadata,
                    created_at, updated_at, completed_at
                ) VALUES (
                    :id, :userId, :walletId, 'bridge_from_monay', :amount,
                    'USDC', 'completed', :relatedId, :metadata,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: circleTxId,
                        userId,
                        walletId: circleWallet.id,
                        amount,
                        relatedId: monayTxId,
                        metadata: JSON.stringify({ bridge_transfer_id: transferId })
                    },
                    transaction
                }
            );

            // Complete bridge transfer
            await sequelize.query(
                `UPDATE bridge_transfers
                 SET status = 'completed',
                     completed_at = CURRENT_TIMESTAMP,
                     monay_transaction_id = :monayTxId,
                     circle_transaction_id = :circleTxId
                 WHERE id = :id`,
                {
                    replacements: {
                        id: transferId,
                        monayTxId,
                        circleTxId
                    },
                    transaction
                }
            );

            await transaction.commit();

            return {
                success: true,
                data: {
                    bridge_transfer_id: transferId,
                    amount,
                    from_wallet: 'monay',
                    to_wallet: 'circle',
                    status: 'completed',
                    monay_transaction_id: monayTxId,
                    circle_transaction_id: circleTxId
                }
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to bridge Monay to Circle:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Bridge transfer from Circle to Monay wallet
     */
    async bridgeCircleToMonay(userId, amount) {
        const transaction = await sequelize.transaction();

        try {
            // Validate amount
            if (amount <= 0) {
                throw new Error('Invalid amount');
            }

            // Get user's wallets
            const [monayWallet] = await sequelize.query(
                `SELECT * FROM wallets WHERE user_id = :userId AND status = 'active'`,
                { replacements: { userId }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            const [circleWallet] = await sequelize.query(
                `SELECT * FROM user_circle_wallets WHERE user_id = :userId AND status = 'active'`,
                { replacements: { userId }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            if (!monayWallet || !circleWallet) {
                throw new Error('Wallets not found or not linked');
            }

            // Check Circle balance
            if (parseFloat(circleWallet.usdc_balance) < amount) {
                throw new Error('Insufficient USDC balance');
            }

            // Create bridge transfer record
            const transferId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO bridge_transfers (
                    id, user_id, direction, source_amount, source_currency,
                    destination_amount, destination_currency, exchange_rate,
                    status, bridge_fee, initiated_at
                ) VALUES (
                    :id, :userId, 'circle_to_monay', :amount, 'USDC',
                    :amount, 'USD', 1.0, 'initiated', 0, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: { id: transferId, userId, amount },
                    transaction
                }
            );

            // Start processing
            await sequelize.query(
                `UPDATE bridge_transfers
                 SET status = 'processing', processing_at = CURRENT_TIMESTAMP
                 WHERE id = :id`,
                { replacements: { id: transferId }, transaction }
            );

            // Deduct from Circle wallet
            await sequelize.query(
                `UPDATE user_circle_wallets
                 SET usdc_balance = usdc_balance - :amount,
                     available_balance = available_balance - :amount,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :walletId`,
                {
                    replacements: { walletId: circleWallet.id, amount },
                    transaction
                }
            );

            // Create Circle transaction record
            const circleTxId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO circle_transactions (
                    id, user_id, circle_wallet_id, transaction_type, amount,
                    currency, status, metadata, created_at, updated_at, completed_at
                ) VALUES (
                    :id, :userId, :walletId, 'bridge_to_monay', :amount,
                    'USDC', 'completed', :metadata,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: circleTxId,
                        userId,
                        walletId: circleWallet.id,
                        amount: -amount, // Negative for outgoing
                        metadata: JSON.stringify({ bridge_transfer_id: transferId })
                    },
                    transaction
                }
            );

            // Add to Monay wallet
            await sequelize.query(
                `UPDATE wallets
                 SET balance = balance + :amount,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :walletId`,
                {
                    replacements: { walletId: monayWallet.id, amount },
                    transaction
                }
            );

            // Create Monay transaction record
            const monayTxId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO transactions (
                    id, user_id, wallet_id, type, amount, currency,
                    status, description, related_transaction_id,
                    created_at, updated_at
                ) VALUES (
                    :id, :userId, :walletId, 'bridge_in', :amount, 'USD',
                    'completed', 'Bridge from USDC wallet', :relatedId,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: monayTxId,
                        userId,
                        walletId: monayWallet.id,
                        amount,
                        relatedId: circleTxId
                    },
                    transaction
                }
            );

            // Complete bridge transfer
            await sequelize.query(
                `UPDATE bridge_transfers
                 SET status = 'completed',
                     completed_at = CURRENT_TIMESTAMP,
                     monay_transaction_id = :monayTxId,
                     circle_transaction_id = :circleTxId
                 WHERE id = :id`,
                {
                    replacements: {
                        id: transferId,
                        monayTxId,
                        circleTxId
                    },
                    transaction
                }
            );

            await transaction.commit();

            return {
                success: true,
                data: {
                    bridge_transfer_id: transferId,
                    amount,
                    from_wallet: 'circle',
                    to_wallet: 'monay',
                    status: 'completed',
                    monay_transaction_id: monayTxId,
                    circle_transaction_id: circleTxId
                }
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to bridge Circle to Monay:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get bridge transfer history
     */
    async getBridgeHistory(userId, limit = 50) {
        try {
            const transfers = await sequelize.query(
                `SELECT bt.*,
                        mt.description as monay_description,
                        ct.transaction_type as circle_type
                 FROM bridge_transfers bt
                 LEFT JOIN transactions mt ON bt.monay_transaction_id = mt.id
                 LEFT JOIN circle_transactions ct ON bt.circle_transaction_id = ct.id
                 WHERE bt.user_id = :userId
                   AND bt.status != 'archived'
                 ORDER BY bt.initiated_at DESC
                 LIMIT :limit`,
                {
                    replacements: { userId, limit },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return {
                success: true,
                data: transfers.map(t => ({
                    id: t.id,
                    direction: t.direction,
                    amount: parseFloat(t.source_amount),
                    source_currency: t.source_currency,
                    destination_currency: t.destination_currency,
                    status: t.status,
                    fee: parseFloat(t.bridge_fee || 0),
                    initiated_at: t.initiated_at,
                    completed_at: t.completed_at,
                    processing_time: t.completed_at ?
                        Math.floor((new Date(t.completed_at) - new Date(t.initiated_at)) / 1000) : null
                }))
            };
        } catch (error) {
            logger.error('Failed to get bridge history:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Auto-bridge based on configured thresholds
     */
    async checkAutoBridge(userId) {
        try {
            // Get wallet link configuration
            const [walletLink] = await sequelize.query(
                `SELECT * FROM wallet_links
                 WHERE user_id = :userId AND link_status = 'active' AND auto_bridge_enabled = true`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (!walletLink) {
                return { success: false, message: 'Auto-bridge not enabled' };
            }

            // Get current balances
            const [balances] = await sequelize.query(
                `SELECT * FROM get_combined_balance(:userId)`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            const monayBalance = parseFloat(balances.monay_balance);
            const circleBalance = parseFloat(balances.circle_balance);
            const threshold = parseFloat(walletLink.bridge_threshold);

            let bridgeAction = null;

            // Check if Monay balance exceeds threshold
            if (monayBalance > threshold && walletLink.preferred_wallet === 'circle') {
                const bridgeAmount = monayBalance - (threshold / 2); // Keep half the threshold
                bridgeAction = {
                    direction: 'monay_to_circle',
                    amount: Math.min(bridgeAmount, walletLink.max_bridge_amount)
                };
            }

            // Check if Circle balance exceeds threshold
            if (circleBalance > threshold && walletLink.preferred_wallet === 'monay') {
                const bridgeAmount = circleBalance - (threshold / 2);
                bridgeAction = {
                    direction: 'circle_to_monay',
                    amount: Math.min(bridgeAmount, walletLink.max_bridge_amount)
                };
            }

            if (bridgeAction && bridgeAction.amount >= walletLink.min_bridge_amount) {
                // Execute auto-bridge
                if (bridgeAction.direction === 'monay_to_circle') {
                    return await this.bridgeMonayToCircle(userId, bridgeAction.amount);
                } else {
                    return await this.bridgeCircleToMonay(userId, bridgeAction.amount);
                }
            }

            return {
                success: true,
                message: 'No auto-bridge needed',
                balances: { monay: monayBalance, circle: circleBalance }
            };
        } catch (error) {
            logger.error('Failed to check auto-bridge:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Estimate bridge transfer time and fees
     */
    async estimateBridge(userId, amount, direction) {
        try {
            // Base estimates
            const estimates = {
                'monay_to_circle': {
                    fee: 0, // Free for internal bridge
                    time_seconds: 2,
                    instant: true
                },
                'circle_to_monay': {
                    fee: 0, // Free for internal bridge
                    time_seconds: 2,
                    instant: true
                }
            };

            const estimate = estimates[direction];
            if (!estimate) {
                throw new Error('Invalid bridge direction');
            }

            // Check if amount is available
            const [balances] = await sequelize.query(
                `SELECT * FROM get_combined_balance(:userId)`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            const sourceBalance = direction === 'monay_to_circle'
                ? parseFloat(balances.monay_balance)
                : parseFloat(balances.circle_balance);

            return {
                success: true,
                data: {
                    direction,
                    amount,
                    fee: estimate.fee,
                    time_seconds: estimate.time_seconds,
                    instant: estimate.instant,
                    source_balance: sourceBalance,
                    sufficient_balance: sourceBalance >= amount,
                    estimated_completion: new Date(Date.now() + estimate.time_seconds * 1000)
                }
            };
        } catch (error) {
            logger.error('Failed to estimate bridge:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel pending bridge transfer (if possible)
     */
    async cancelBridge(userId, transferId) {
        const transaction = await sequelize.transaction();

        try {
            // Get transfer
            const [transfer] = await sequelize.query(
                `SELECT * FROM bridge_transfers
                 WHERE id = :transferId AND user_id = :userId`,
                {
                    replacements: { transferId, userId },
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!transfer) {
                throw new Error('Transfer not found');
            }

            if (transfer.status !== 'initiated' && transfer.status !== 'processing') {
                throw new Error('Transfer cannot be cancelled');
            }

            // For instant bridges, we typically can't cancel once processing
            if (transfer.status === 'processing') {
                throw new Error('Transfer is already processing and cannot be cancelled');
            }

            // Update transfer status
            await sequelize.query(
                `UPDATE bridge_transfers
                 SET status = 'cancelled',
                     failure_reason = 'User cancelled',
                     failed_at = CURRENT_TIMESTAMP
                 WHERE id = :id`,
                {
                    replacements: { id: transferId },
                    transaction
                }
            );

            await transaction.commit();

            return {
                success: true,
                data: {
                    transfer_id: transferId,
                    status: 'cancelled'
                }
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to cancel bridge:', error);
            return { success: false, error: error.message };
        }
    }
}

export default BridgeTransferService;