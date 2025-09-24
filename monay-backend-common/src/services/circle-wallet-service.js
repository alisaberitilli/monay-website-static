import { db, sequelize } from '../models/index.js';
import CircleService from './circle.js';
import { logger } from './logger.js';
import crypto from 'crypto';

class CircleWalletService {
    constructor() {
        this.circleService = new CircleService();
    }

    /**
     * Create USDC deposit (fund wallet from bank account)
     */
    async createDeposit(userId, amount, sourceType = 'ach_bank_account', sourceId) {
        const transaction = await sequelize.transaction();

        try {
            // Get user's Circle wallet
            const [circleWallet] = await sequelize.query(
                `SELECT * FROM user_circle_wallets WHERE user_id = :userId AND status = 'active'`,
                { replacements: { userId }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            if (!circleWallet) {
                throw new Error('Circle wallet not found');
            }

            // Create transaction record
            const txId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO circle_transactions (
                    id, user_id, circle_wallet_id, transaction_type, amount,
                    currency, status, created_at, updated_at
                ) VALUES (
                    :id, :userId, :walletId, 'deposit', :amount,
                    'USDC', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: txId,
                        userId,
                        walletId: circleWallet.id,
                        amount
                    },
                    transaction
                }
            );

            // Call Circle API to create payment
            const paymentResult = await this.circleService.createPayment({
                idempotencyKey: crypto.randomUUID(),
                amount: { amount: amount.toString(), currency: 'USD' },
                source: { id: sourceId, type: sourceType },
                destination: {
                    type: 'wallet',
                    id: circleWallet.circle_wallet_id
                },
                description: `Deposit to wallet ${userId}`
            });

            if (paymentResult.success) {
                // Update transaction with Circle payment ID
                await sequelize.query(
                    `UPDATE circle_transactions
                     SET circle_transaction_id = :circleId, status = 'processing'
                     WHERE id = :id`,
                    {
                        replacements: {
                            id: txId,
                            circleId: paymentResult.data.id
                        },
                        transaction
                    }
                );
            }

            await transaction.commit();
            return {
                success: true,
                data: {
                    transaction_id: txId,
                    circle_payment_id: paymentResult.data?.id,
                    amount,
                    status: 'processing'
                }
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to create deposit:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create USDC withdrawal (send to bank account)
     */
    async createWithdrawal(userId, amount, destinationType = 'ach_bank_account', destinationId) {
        const transaction = await sequelize.transaction();

        try {
            // Get user's Circle wallet
            const [circleWallet] = await sequelize.query(
                `SELECT * FROM user_circle_wallets WHERE user_id = :userId AND status = 'active'`,
                { replacements: { userId }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            if (!circleWallet) {
                throw new Error('Circle wallet not found');
            }

            // Check balance
            if (circleWallet.usdc_balance < amount) {
                throw new Error('Insufficient USDC balance');
            }

            // Create transaction record
            const txId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO circle_transactions (
                    id, user_id, circle_wallet_id, transaction_type, amount,
                    currency, status, created_at, updated_at
                ) VALUES (
                    :id, :userId, :walletId, 'withdrawal', :amount,
                    'USDC', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: txId,
                        userId,
                        walletId: circleWallet.id,
                        amount
                    },
                    transaction
                }
            );

            // Call Circle API to create payout
            const payoutResult = await this.circleService.createPayout({
                idempotencyKey: crypto.randomUUID(),
                amount: { amount: amount.toString(), currency: 'USD' },
                source: {
                    type: 'wallet',
                    id: circleWallet.circle_wallet_id
                },
                destination: { id: destinationId, type: destinationType },
                description: `Withdrawal from wallet ${userId}`
            });

            if (payoutResult.success) {
                // Update transaction with Circle payout ID
                await sequelize.query(
                    `UPDATE circle_transactions
                     SET circle_transaction_id = :circleId, status = 'processing'
                     WHERE id = :id`,
                    {
                        replacements: {
                            id: txId,
                            circleId: payoutResult.data.id
                        },
                        transaction
                    }
                );

                // Update wallet balance (pending)
                await sequelize.query(
                    `UPDATE user_circle_wallets
                     SET pending_balance = pending_balance + :amount,
                         available_balance = available_balance - :amount
                     WHERE id = :id`,
                    {
                        replacements: {
                            id: circleWallet.id,
                            amount
                        },
                        transaction
                    }
                );
            }

            await transaction.commit();
            return {
                success: true,
                data: {
                    transaction_id: txId,
                    circle_payout_id: payoutResult.data?.id,
                    amount,
                    status: 'processing'
                }
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to create withdrawal:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Transfer USDC between Circle wallets
     */
    async transferUSDC(fromUserId, toAddress, amount, description = '') {
        const transaction = await sequelize.transaction();

        try {
            // Get sender's Circle wallet
            const [senderWallet] = await sequelize.query(
                `SELECT * FROM user_circle_wallets WHERE user_id = :userId AND status = 'active'`,
                { replacements: { userId: fromUserId }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            if (!senderWallet) {
                throw new Error('Sender wallet not found');
            }

            // Check balance
            if (senderWallet.usdc_balance < amount) {
                throw new Error('Insufficient USDC balance');
            }

            // Check if recipient is internal
            const [recipientWallet] = await sequelize.query(
                `SELECT * FROM user_circle_wallets WHERE circle_address = :address AND status = 'active'`,
                { replacements: { address: toAddress }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            // Create transaction record for sender
            const txId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO circle_transactions (
                    id, user_id, circle_wallet_id, transaction_type, amount,
                    currency, status, destination_address, metadata,
                    created_at, updated_at
                ) VALUES (
                    :id, :userId, :walletId, 'transfer_out', :amount,
                    'USDC', 'pending', :toAddress, :metadata,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: txId,
                        userId: fromUserId,
                        walletId: senderWallet.id,
                        amount,
                        toAddress,
                        metadata: JSON.stringify({ description })
                    },
                    transaction
                }
            );

            // If recipient is internal, create their transaction record
            if (recipientWallet) {
                const rxTxId = crypto.randomUUID();
                await sequelize.query(
                    `INSERT INTO circle_transactions (
                        id, user_id, circle_wallet_id, transaction_type, amount,
                        currency, status, source_address, related_transaction_id,
                        metadata, created_at, updated_at
                    ) VALUES (
                        :id, :userId, :walletId, 'transfer_in', :amount,
                        'USDC', 'pending', :fromAddress, :relatedId,
                        :metadata, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )`,
                    {
                        replacements: {
                            id: rxTxId,
                            userId: recipientWallet.user_id,
                            walletId: recipientWallet.id,
                            amount,
                            fromAddress: senderWallet.circle_address,
                            relatedId: txId,
                            metadata: JSON.stringify({ description })
                        },
                        transaction
                    }
                );
            }

            // Call Circle API to create transfer
            const transferResult = await this.circleService.createTransfer({
                idempotencyKey: crypto.randomUUID(),
                source: {
                    type: 'wallet',
                    id: senderWallet.circle_wallet_id
                },
                destination: {
                    type: 'blockchain',
                    address: toAddress,
                    chain: 'ALGO' // Or appropriate chain
                },
                amount: { amount: amount.toString(), currency: 'USD' }
            });

            if (transferResult.success) {
                // Update transaction with Circle transfer ID
                await sequelize.query(
                    `UPDATE circle_transactions
                     SET circle_transaction_id = :circleId,
                         status = 'processing',
                         blockchain_hash = :hash
                     WHERE id = :id`,
                    {
                        replacements: {
                            id: txId,
                            circleId: transferResult.data.id,
                            hash: transferResult.data.transactionHash || null
                        },
                        transaction
                    }
                );

                // Update sender's pending balance
                await sequelize.query(
                    `UPDATE user_circle_wallets
                     SET pending_balance = pending_balance + :amount,
                         available_balance = available_balance - :amount
                     WHERE id = :id`,
                    {
                        replacements: {
                            id: senderWallet.id,
                            amount
                        },
                        transaction
                    }
                );
            }

            await transaction.commit();
            return {
                success: true,
                data: {
                    transaction_id: txId,
                    circle_transfer_id: transferResult.data?.id,
                    amount,
                    to_address: toAddress,
                    status: 'processing'
                }
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to transfer USDC:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get transaction history for a user's Circle wallet
     */
    async getTransactionHistory(userId, limit = 50, offset = 0) {
        try {
            const transactions = await sequelize.query(
                `SELECT ct.*, ucw.circle_address
                 FROM circle_transactions ct
                 JOIN user_circle_wallets ucw ON ct.circle_wallet_id = ucw.id
                 WHERE ct.user_id = :userId
                   AND ct.status != 'archived'
                 ORDER BY ct.created_at DESC
                 LIMIT :limit OFFSET :offset`,
                {
                    replacements: { userId, limit, offset },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return {
                success: true,
                data: transactions.map(tx => ({
                    id: tx.id,
                    type: tx.transaction_type,
                    amount: parseFloat(tx.amount),
                    currency: tx.currency,
                    status: tx.status,
                    source: tx.source_address,
                    destination: tx.destination_address,
                    fees: {
                        circle: parseFloat(tx.circle_fee || 0),
                        network: parseFloat(tx.network_fee || 0),
                        bridge: parseFloat(tx.bridge_fee || 0),
                        total: parseFloat(tx.total_fee || 0)
                    },
                    blockchain_hash: tx.blockchain_hash,
                    created_at: tx.created_at,
                    completed_at: tx.completed_at
                }))
            };
        } catch (error) {
            logger.error('Failed to get transaction history:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process webhook notification from Circle
     */
    async processWebhook(webhookData) {
        const transaction = await sequelize.transaction();

        try {
            // Store webhook
            const webhookId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO circle_webhooks (
                    id, webhook_id, webhook_type, payload, status, created_at
                ) VALUES (
                    :id, :webhookId, :type, :payload, 'processing', CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: webhookId,
                        webhookId: webhookData.id,
                        type: webhookData.type,
                        payload: JSON.stringify(webhookData)
                    },
                    transaction
                }
            );

            // Process based on webhook type
            switch (webhookData.type) {
                case 'payments':
                    await this.handlePaymentWebhook(webhookData, transaction);
                    break;
                case 'payouts':
                    await this.handlePayoutWebhook(webhookData, transaction);
                    break;
                case 'transfers':
                    await this.handleTransferWebhook(webhookData, transaction);
                    break;
                default:
                    logger.info(`Unhandled webhook type: ${webhookData.type}`);
            }

            // Mark webhook as processed
            await sequelize.query(
                `UPDATE circle_webhooks
                 SET status = 'processed', processed_at = CURRENT_TIMESTAMP
                 WHERE id = :id`,
                { replacements: { id: webhookId }, transaction }
            );

            await transaction.commit();
            return { success: true };
        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to process webhook:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle payment webhook (deposits)
     */
    async handlePaymentWebhook(data, transaction) {
        const payment = data.data;

        // Update transaction status
        await sequelize.query(
            `UPDATE circle_transactions
             SET status = :status,
                 updated_at = CURRENT_TIMESTAMP,
                 completed_at = CASE WHEN :status = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
             WHERE circle_transaction_id = :paymentId`,
            {
                replacements: {
                    paymentId: payment.id,
                    status: payment.status === 'paid' ? 'completed' : payment.status
                },
                transaction
            }
        );

        // If completed, update wallet balance
        if (payment.status === 'paid') {
            const [tx] = await sequelize.query(
                `SELECT * FROM circle_transactions WHERE circle_transaction_id = :paymentId`,
                { replacements: { paymentId: payment.id }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            if (tx) {
                await sequelize.query(
                    `UPDATE user_circle_wallets
                     SET usdc_balance = usdc_balance + :amount,
                         available_balance = available_balance + :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :walletId`,
                    {
                        replacements: {
                            walletId: tx.circle_wallet_id,
                            amount: tx.amount
                        },
                        transaction
                    }
                );
            }
        }
    }

    /**
     * Handle payout webhook (withdrawals)
     */
    async handlePayoutWebhook(data, transaction) {
        const payout = data.data;

        // Update transaction status
        await sequelize.query(
            `UPDATE circle_transactions
             SET status = :status,
                 updated_at = CURRENT_TIMESTAMP,
                 completed_at = CASE WHEN :status = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
             WHERE circle_transaction_id = :payoutId`,
            {
                replacements: {
                    payoutId: payout.id,
                    status: payout.status === 'complete' ? 'completed' : payout.status
                },
                transaction
            }
        );

        // If completed, finalize wallet balance
        if (payout.status === 'complete') {
            const [tx] = await sequelize.query(
                `SELECT * FROM circle_transactions WHERE circle_transaction_id = :payoutId`,
                { replacements: { payoutId: payout.id }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            if (tx) {
                await sequelize.query(
                    `UPDATE user_circle_wallets
                     SET usdc_balance = usdc_balance - :amount,
                         pending_balance = pending_balance - :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :walletId`,
                    {
                        replacements: {
                            walletId: tx.circle_wallet_id,
                            amount: tx.amount
                        },
                        transaction
                    }
                );
            }
        }
    }

    /**
     * Handle transfer webhook
     */
    async handleTransferWebhook(data, transaction) {
        const transfer = data.data;

        // Update transaction status
        await sequelize.query(
            `UPDATE circle_transactions
             SET status = :status,
                 blockchain_hash = :hash,
                 updated_at = CURRENT_TIMESTAMP,
                 completed_at = CASE WHEN :status = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
             WHERE circle_transaction_id = :transferId`,
            {
                replacements: {
                    transferId: transfer.id,
                    status: transfer.status === 'complete' ? 'completed' : transfer.status,
                    hash: transfer.transactionHash || null
                },
                transaction
            }
        );

        // Handle completion
        if (transfer.status === 'complete') {
            const [tx] = await sequelize.query(
                `SELECT * FROM circle_transactions WHERE circle_transaction_id = :transferId`,
                { replacements: { transferId: transfer.id }, type: sequelize.QueryTypes.SELECT, transaction }
            );

            if (tx && tx.transaction_type === 'transfer_out') {
                // Finalize sender balance
                await sequelize.query(
                    `UPDATE user_circle_wallets
                     SET usdc_balance = usdc_balance - :amount,
                         pending_balance = pending_balance - :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :walletId`,
                    {
                        replacements: {
                            walletId: tx.circle_wallet_id,
                            amount: tx.amount
                        },
                        transaction
                    }
                );
            }

            // Check for internal recipient
            if (tx && tx.destination_address) {
                const [recipientTx] = await sequelize.query(
                    `SELECT ct.* FROM circle_transactions ct
                     JOIN user_circle_wallets ucw ON ct.circle_wallet_id = ucw.id
                     WHERE ucw.circle_address = :address
                       AND ct.related_transaction_id = :txId`,
                    {
                        replacements: {
                            address: tx.destination_address,
                            txId: tx.id
                        },
                        type: sequelize.QueryTypes.SELECT,
                        transaction
                    }
                );

                if (recipientTx) {
                    // Update recipient transaction and balance
                    await sequelize.query(
                        `UPDATE circle_transactions
                         SET status = 'completed', completed_at = CURRENT_TIMESTAMP
                         WHERE id = :id`,
                        { replacements: { id: recipientTx.id }, transaction }
                    );

                    await sequelize.query(
                        `UPDATE user_circle_wallets
                         SET usdc_balance = usdc_balance + :amount,
                             available_balance = available_balance + :amount,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = :walletId`,
                        {
                            replacements: {
                                walletId: recipientTx.circle_wallet_id,
                                amount: recipientTx.amount
                            },
                            transaction
                        }
                    );
                }
            }
        }
    }

    /**
     * Get Circle wallet details
     */
    async getWalletDetails(userId) {
        try {
            const [wallet] = await sequelize.query(
                `SELECT ucw.*, wl.preferred_wallet, wl.auto_bridge_enabled
                 FROM user_circle_wallets ucw
                 LEFT JOIN wallet_links wl ON ucw.user_id = wl.user_id
                 WHERE ucw.user_id = :userId AND ucw.status = 'active'`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (!wallet) {
                return { success: false, error: 'Circle wallet not found' };
            }

            return {
                success: true,
                data: {
                    wallet_id: wallet.circle_wallet_id,
                    address: wallet.circle_address,
                    balance: parseFloat(wallet.usdc_balance),
                    available_balance: parseFloat(wallet.available_balance),
                    pending_balance: parseFloat(wallet.pending_balance),
                    auto_convert: wallet.auto_convert_enabled,
                    auto_bridge: wallet.auto_bridge_enabled,
                    preferred_wallet: wallet.preferred_wallet,
                    last_synced: wallet.last_synced_at
                }
            };
        } catch (error) {
            logger.error('Failed to get wallet details:', error);
            return { success: false, error: error.message };
        }
    }
}

export default CircleWalletService;