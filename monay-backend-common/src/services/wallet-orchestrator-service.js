import db from '../models/index.js';
const { sequelize } = db;
import circleService from './circle.js';
import walletBalanceService from './wallet-balance-service.js';
import logger from './logger.js';
import crypto from 'crypto';

class WalletOrchestratorService {
    constructor() {
        this.circleService = circleService;
        this.walletService = walletBalanceService;
    }

    /**
     * Initialize dual wallet system for a user
     */
    async initializeUserWallets(userId) {
        try {
            // 1. Get or create Monay wallet (already exists)
            const monayWallet = await this.getOrCreateMonayWallet(userId);

            // 2. Get or create Circle wallet
            const circleWallet = await this.getOrCreateCircleWallet(userId);

            // 3. Link wallets if not already linked
            const walletLink = await this.linkWallets(userId, {
                monay_wallet_id: monayWallet.id,
                circle_wallet_id: circleWallet.id
            });

            return {
                success: true,
                data: {
                    monay: monayWallet,
                    circle: circleWallet,
                    link: walletLink
                }
            };
        } catch (error) {
            logger.error('Failed to initialize user wallets:', error);
            throw error;
        }
    }

    /**
     * Get or create Monay wallet
     */
    async getOrCreateMonayWallet(userId) {
        try {
            // Check existing wallet
            const [wallet] = await sequelize.query(
                `SELECT * FROM wallets WHERE user_id = :userId AND status = 'active' LIMIT 1`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (wallet) {
                return wallet;
            }

            // Create new wallet
            const walletId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO wallets (id, user_id, balance, status, created_at, updated_at)
                 VALUES (:id, :userId, 0, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                {
                    replacements: { id: walletId, userId }
                }
            );

            return { id: walletId, user_id: userId, balance: 0, status: 'active' };
        } catch (error) {
            logger.error('Failed to get/create Monay wallet:', error);
            throw error;
        }
    }

    /**
     * Get or create Circle wallet
     */
    async getOrCreateCircleWallet(userId) {
        try {
            // Check existing Circle wallet
            const [existingWallet] = await sequelize.query(
                `SELECT * FROM user_circle_wallets WHERE user_id = :userId AND status = 'active' LIMIT 1`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (existingWallet) {
                return existingWallet;
            }

            // Get user details
            const [user] = await sequelize.query(
                `SELECT * FROM users WHERE id = :userId LIMIT 1`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (!user) {
                throw new Error('User not found');
            }

            // Create Circle wallet via API
            const circleWallet = await this.circleService.createWallet({
                idempotencyKey: crypto.randomUUID(),
                entityId: userId,
                type: 'end_user_wallet',
                description: `Consumer wallet for ${user.email}`
            });

            if (!circleWallet.success) {
                throw new Error('Failed to create Circle wallet');
            }

            // Store in database
            const walletId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO user_circle_wallets (
                    id, user_id, circle_wallet_id, circle_address, wallet_type,
                    status, usdc_balance, created_at, updated_at
                ) VALUES (
                    :id, :userId, :circleWalletId, :address, 'end_user_wallet',
                    'active', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: walletId,
                        userId,
                        circleWalletId: circleWallet.data.walletId,
                        address: circleWallet.data.address
                    }
                }
            );

            return {
                id: walletId,
                user_id: userId,
                circle_wallet_id: circleWallet.data.walletId,
                circle_address: circleWallet.data.address,
                status: 'active',
                usdc_balance: 0
            };
        } catch (error) {
            logger.error('Failed to get/create Circle wallet:', error);
            throw error;
        }
    }

    /**
     * Link Monay and Circle wallets
     */
    async linkWallets(userId, { monay_wallet_id, circle_wallet_id }) {
        try {
            // Check existing link
            const [existingLink] = await sequelize.query(
                `SELECT * FROM wallet_links WHERE user_id = :userId AND link_status = 'active' LIMIT 1`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (existingLink) {
                return existingLink;
            }

            // Create new link
            const linkId = crypto.randomUUID();
            await sequelize.query(
                `INSERT INTO wallet_links (
                    id, user_id, monay_wallet_id, circle_wallet_id,
                    link_status, auto_bridge_enabled, preferred_wallet,
                    created_at, updated_at
                ) VALUES (
                    :id, :userId, :monayWalletId, :circleWalletId,
                    'active', true, 'smart',
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: linkId,
                        userId,
                        monayWalletId: monay_wallet_id,
                        circleWalletId: circle_wallet_id
                    }
                }
            );

            return {
                id: linkId,
                user_id: userId,
                monay_wallet_id,
                circle_wallet_id,
                link_status: 'active'
            };
        } catch (error) {
            logger.error('Failed to link wallets:', error);
            throw error;
        }
    }

    /**
     * Get combined wallet balances
     */
    async getCombinedBalance(userId) {
        try {
            const [result] = await sequelize.query(
                `SELECT * FROM get_combined_balance(:userId)`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return {
                monay_balance: parseFloat(result.monay_balance || 0),
                circle_balance: parseFloat(result.circle_balance || 0),
                total_usd_value: parseFloat(result.total_usd_value || 0),
                currency: 'USD'
            };
        } catch (error) {
            logger.error('Failed to get combined balance:', error);
            throw error;
        }
    }

    /**
     * Smart routing decision for payment
     */
    async getOptimalPaymentRoute(userId, amount, paymentType = 'payment', metadata = {}) {
        try {
            const routingId = crypto.randomUUID();

            // Get wallet balances
            const balances = await this.getCombinedBalance(userId);

            // Calculate estimated fees
            const monayFee = this.calculateMonayFee(amount, paymentType);
            const circleFee = this.calculateCircleFee(amount, paymentType);

            // Estimate processing times (in seconds)
            const monayTime = this.estimateMonayTime(paymentType);
            const circleTime = this.estimateCircleTime(paymentType);

            // Score each option
            const scores = this.calculateRoutingScores({
                amount,
                paymentType,
                balances,
                fees: { monay: monayFee, circle: circleFee },
                times: { monay: monayTime, circle: circleTime },
                metadata
            });

            // Determine optimal route
            let selectedWallet = 'monay';
            let routingReason = 'Default to Monay wallet';

            if (scores.circle > scores.monay) {
                selectedWallet = 'circle';
                routingReason = 'Better fees and speed with Circle';
            }

            // Check balance sufficiency
            if (selectedWallet === 'circle' && balances.circle_balance < amount) {
                if (balances.monay_balance >= amount) {
                    selectedWallet = 'monay';
                    routingReason = 'Insufficient USDC balance';
                } else {
                    selectedWallet = 'split';
                    routingReason = 'Requires combined balances';
                }
            } else if (selectedWallet === 'monay' && balances.monay_balance < amount) {
                if (balances.circle_balance >= amount) {
                    selectedWallet = 'circle';
                    routingReason = 'Insufficient fiat balance';
                } else {
                    selectedWallet = 'split';
                    routingReason = 'Requires combined balances';
                }
            }

            // Store routing decision
            await sequelize.query(
                `INSERT INTO routing_decisions (
                    id, user_id, decision_type, selected_wallet, routing_reason,
                    total_amount, monay_amount, circle_amount,
                    monay_fee_estimate, circle_fee_estimate, selected_fee,
                    fee_savings, monay_time_estimate, circle_time_estimate,
                    selected_time, factors, score_monay, score_circle, created_at
                ) VALUES (
                    :id, :userId, :decisionType, :selectedWallet, :routingReason,
                    :totalAmount, :monayAmount, :circleAmount,
                    :monayFee, :circleFee, :selectedFee,
                    :feeSavings, :monayTime, :circleTime,
                    :selectedTime, :factors, :scoreMonay, :scoreCircle, CURRENT_TIMESTAMP
                )`,
                {
                    replacements: {
                        id: routingId,
                        userId,
                        decisionType: paymentType,
                        selectedWallet,
                        routingReason,
                        totalAmount: amount,
                        monayAmount: selectedWallet === 'monay' ? amount : (selectedWallet === 'split' ? balances.monay_balance : 0),
                        circleAmount: selectedWallet === 'circle' ? amount : (selectedWallet === 'split' ? amount - balances.monay_balance : 0),
                        monayFee,
                        circleFee,
                        selectedFee: selectedWallet === 'circle' ? circleFee : monayFee,
                        feeSavings: Math.abs(monayFee - circleFee),
                        monayTime,
                        circleTime,
                        selectedTime: selectedWallet === 'circle' ? circleTime : monayTime,
                        factors: JSON.stringify(metadata),
                        scoreMonay: scores.monay,
                        scoreCircle: scores.circle
                    }
                }
            );

            return {
                recommended_wallet: selectedWallet,
                reason: routingReason,
                routing_id: routingId,
                analysis: {
                    balances,
                    fees: { monay: monayFee, circle: circleFee },
                    times: { monay: monayTime, circle: circleTime },
                    scores,
                    can_use_monay: balances.monay_balance >= amount,
                    can_use_circle: balances.circle_balance >= amount,
                    requires_split: selectedWallet === 'split'
                }
            };
        } catch (error) {
            logger.error('Failed to get optimal payment route:', error);
            throw error;
        }
    }

    /**
     * Calculate Monay transaction fee
     */
    calculateMonayFee(amount, type) {
        const feeRates = {
            payment: 0.029,      // 2.9%
            transfer: 0.015,     // 1.5%
            withdrawal: 3.00,    // Flat $3
            deposit: 0,          // Free
            bill_pay: 2.00,      // Flat $2
            card_payment: 0.025, // 2.5%
            p2p: 0               // Free
        };

        const rate = feeRates[type] || 0.02;
        if (type === 'withdrawal' || type === 'bill_pay') {
            return rate; // Flat fee
        }
        return Math.max(amount * rate, 0.50); // Percentage with minimum
    }

    /**
     * Calculate Circle transaction fee
     */
    calculateCircleFee(amount, type) {
        const feeRates = {
            payment: 0.01,       // 1%
            transfer: 0.005,     // 0.5%
            withdrawal: 1.00,    // Flat $1
            deposit: 0,          // Free
            bill_pay: 0.015,     // 1.5% (requires conversion)
            card_payment: 0.02,  // 2%
            p2p: 0               // Free
        };

        const rate = feeRates[type] || 0.01;
        if (type === 'withdrawal') {
            return rate; // Flat fee
        }
        return Math.max(amount * rate, 0.25); // Percentage with minimum
    }

    /**
     * Estimate Monay processing time (seconds)
     */
    estimateMonayTime(type) {
        const times = {
            payment: 3,
            transfer: 86400,    // 1 day
            withdrawal: 172800, // 2 days
            deposit: 86400,     // 1 day
            bill_pay: 86400,    // 1 day
            card_payment: 3,
            p2p: 5
        };
        return times[type] || 60;
    }

    /**
     * Estimate Circle processing time (seconds)
     */
    estimateCircleTime(type) {
        const times = {
            payment: 1,
            transfer: 2,
            withdrawal: 60,
            deposit: 60,
            bill_pay: 120,     // Includes conversion
            card_payment: 2,
            p2p: 1
        };
        return times[type] || 5;
    }

    /**
     * Calculate routing scores
     */
    calculateRoutingScores({ amount, paymentType, balances, fees, times, metadata }) {
        let monayScore = 50; // Base score
        let circleScore = 50; // Base score

        // Fee comparison (30 points)
        const feeDiff = fees.monay - fees.circle;
        if (feeDiff > 0) {
            circleScore += Math.min(feeDiff * 10, 30);
        } else {
            monayScore += Math.min(Math.abs(feeDiff) * 10, 30);
        }

        // Speed comparison (30 points)
        const timeDiff = times.monay - times.circle;
        if (timeDiff > 0) {
            circleScore += Math.min(timeDiff / 100, 30);
        } else {
            monayScore += Math.min(Math.abs(timeDiff) / 100, 30);
        }

        // Balance availability (20 points)
        if (balances.monay_balance >= amount) monayScore += 10;
        if (balances.circle_balance >= amount) circleScore += 10;

        // Payment type preference (20 points)
        if (['payment', 'p2p', 'transfer'].includes(paymentType)) {
            circleScore += 10; // Prefer Circle for instant payments
        }
        if (['bill_pay', 'card_payment'].includes(paymentType)) {
            monayScore += 10; // Prefer Monay for traditional payments
        }

        // International payment bonus
        if (metadata.international) {
            circleScore += 20;
        }

        return {
            monay: Math.min(monayScore, 100),
            circle: Math.min(circleScore, 100)
        };
    }

    /**
     * Sync Circle wallet balance
     */
    async syncCircleWalletBalance(userId) {
        try {
            // Get Circle wallet
            const [circleWallet] = await sequelize.query(
                `SELECT * FROM user_circle_wallets WHERE user_id = :userId AND status = 'active' LIMIT 1`,
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (!circleWallet) {
                return { success: false, error: 'Circle wallet not found' };
            }

            // Get balance from Circle API
            const balanceResult = await this.circleService.getWalletBalance(circleWallet.circle_wallet_id);

            if (!balanceResult.success) {
                return balanceResult;
            }

            // Update database
            await sequelize.query(
                `UPDATE user_circle_wallets
                 SET usdc_balance = :balance,
                     available_balance = :available,
                     pending_balance = :pending,
                     last_synced_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :id`,
                {
                    replacements: {
                        id: circleWallet.id,
                        balance: balanceResult.data.balance,
                        available: balanceResult.data.availableBalance,
                        pending: balanceResult.data.pendingBalance || 0
                    }
                }
            );

            return {
                success: true,
                data: {
                    wallet_id: circleWallet.id,
                    usdc_balance: balanceResult.data.balance,
                    available_balance: balanceResult.data.availableBalance,
                    pending_balance: balanceResult.data.pendingBalance
                }
            };
        } catch (error) {
            logger.error('Failed to sync Circle wallet balance:', error);
            return { success: false, error: error.message };
        }
    }
}

export default WalletOrchestratorService;