/**
 * Rewards & Cashback Service
 * Consumer Wallet Phase 3 Day 15 Implementation
 * Handles points earning, cashback, redemptions, and tier management
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';
import { publishToQueue } from './kafka.js';
import NotificationService from './notificationService.js';
import { trackMetrics } from './analytics.js';
import logger from './logger.js';

class RewardsService {
    constructor() {
        this.notificationService = new NotificationService();
    }

    // ==================== ACCOUNT MANAGEMENT ====================

    /**
     * Create or get rewards account
     */
    async ensureRewardsAccount(userId) {
        try {
            // Check if account exists
            const [[existing]] = await db.sequelize.query(
                `SELECT * FROM rewards_accounts WHERE user_id = :userId`,
                { replacements: { userId } }
            );

            if (existing) {
                return existing;
            }

            // Create new account
            const accountId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO rewards_accounts
                 (id, user_id, current_tier, points_balance, cashback_balance)
                 VALUES (:id, :userId, 'bronze', 0, 0)`,
                {
                    replacements: { id: accountId, userId }
                }
            );

            // Auto-enroll in default programs
            await this.autoEnrollPrograms(userId);

            return { id: accountId, userId, currentTier: 'bronze' };
        } catch (error) {
            logger.error('Ensure rewards account error:', error);
            throw error;
        }
    }

    /**
     * Get rewards account summary
     */
    async getAccountSummary(userId) {
        try {
            const [[account]] = await db.sequelize.query(
                `SELECT
                    ra.*,
                    rt.tier_level,
                    rt.points_multiplier,
                    rt.cashback_bonus,
                    rt.perks
                 FROM rewards_accounts ra
                 LEFT JOIN reward_tiers rt ON ra.current_tier = rt.tier_name
                 WHERE ra.user_id = :userId`,
                { replacements: { userId } }
            );

            if (!account) {
                // Create account if doesn't exist
                return await this.ensureRewardsAccount(userId);
            }

            // Calculate progress to next tier
            const nextTierProgress = await this.calculateNextTierProgress(userId, account.current_tier);

            return {
                ...account,
                nextTierProgress
            };
        } catch (error) {
            logger.error('Get account summary error:', error);
            throw error;
        }
    }

    /**
     * Calculate progress to next tier
     */
    async calculateNextTierProgress(userId, currentTier) {
        try {
            // Get current and next tier
            const [[current]] = await db.sequelize.query(
                `SELECT * FROM reward_tiers WHERE tier_name = :currentTier`,
                { replacements: { currentTier } }
            );

            const [[next]] = await db.sequelize.query(
                `SELECT * FROM reward_tiers
                 WHERE tier_level = :nextLevel AND is_active = true`,
                { replacements: { nextLevel: (current?.tier_level || 0) + 1 } }
            );

            if (!next) {
                return { isMaxTier: true };
            }

            // Get current year spending
            const [[spending]] = await db.sequelize.query(
                `SELECT COALESCE(SUM(source_amount), 0) as total
                 FROM rewards_transactions
                 WHERE user_id = :userId
                 AND transaction_type = 'earn'
                 AND created_at >= DATE_TRUNC('year', CURRENT_DATE)`,
                { replacements: { userId } }
            );

            const currentSpending = parseFloat(spending.total);
            const requiredSpending = parseFloat(next.min_annual_spending);
            const remainingSpending = Math.max(0, requiredSpending - currentSpending);
            const progressPercentage = (currentSpending / requiredSpending) * 100;

            return {
                nextTier: next.tier_name,
                currentSpending,
                requiredSpending,
                remainingSpending,
                progressPercentage: Math.min(100, progressPercentage)
            };
        } catch (error) {
            logger.error('Calculate next tier progress error:', error);
            return null;
        }
    }

    // ==================== POINTS & CASHBACK EARNING ====================

    /**
     * Process transaction for rewards
     */
    async processTransactionRewards(transactionData) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                userId,
                transactionId,
                transactionType,
                amount,
                merchantName,
                merchantCategory,
                mccCode
            } = transactionData;

            // Ensure user has rewards account
            const account = await this.ensureRewardsAccount(userId);

            // Calculate points and cashback
            const points = await this.calculatePoints(userId, amount, mccCode, merchantName, transaction);
            const cashback = await this.calculateCashback(userId, amount, mccCode, merchantName, transaction);

            // Find applicable earning rule
            const rule = await this.getApplicableRule(userId, mccCode, merchantCategory, amount);

            // Create rewards transaction
            const rewardsTransactionId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO rewards_transactions
                 (id, user_id, account_id, transaction_type, reward_type,
                  amount, points_amount, cashback_amount, source_transaction_id,
                  source_transaction_type, source_amount, program_id, rule_id,
                  merchant_name, merchant_category, mcc_code, status)
                 VALUES (:id, :userId, :accountId, 'earn', 'mixed',
                  :totalReward, :points, :cashback, :transactionId,
                  :transactionType, :amount, :programId, :ruleId,
                  :merchantName, :merchantCategory, :mccCode, 'completed')`,
                {
                    replacements: {
                        id: rewardsTransactionId,
                        userId,
                        accountId: account.id,
                        totalReward: points + cashback,
                        points,
                        cashback,
                        transactionId,
                        transactionType,
                        amount,
                        programId: rule?.program_id || null,
                        ruleId: rule?.id || null,
                        merchantName,
                        merchantCategory,
                        mccCode
                    },
                    transaction
                }
            );

            // Check for bonus campaigns
            const bonuses = await this.checkBonusCampaigns(userId, amount, merchantCategory, transaction);
            if (bonuses.points > 0 || bonuses.cashback > 0) {
                await this.awardBonus(userId, account.id, bonuses, 'campaign_bonus', transaction);
            }

            await transaction.commit();

            // Send notification
            if (points > 0 || cashback > 0) {
                await this.notificationService.sendNotification(userId, {
                    type: 'rewards_earned',
                    title: 'Rewards Earned!',
                    message: `You earned ${points.toFixed(0)} points and $${cashback.toFixed(2)} cashback`,
                    data: { points, cashback, merchantName }
                });
            }

            // Track metrics
            await trackMetrics('rewards_earned', {
                userId,
                points,
                cashback,
                merchantCategory,
                amount
            });

            return {
                points,
                cashback,
                totalRewards: points + cashback
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Process transaction rewards error:', error);
            throw error;
        }
    }

    /**
     * Calculate points for transaction
     */
    async calculatePoints(userId, amount, mccCode, merchantName, transaction) {
        try {
            // Get applicable earning rule
            const [[rule]] = await db.sequelize.query(
                `SELECT
                    er.*,
                    rp.points_per_dollar,
                    ra.current_tier,
                    rt.points_multiplier as tier_multiplier
                 FROM earning_rules er
                 JOIN rewards_programs rp ON er.program_id = rp.id
                 JOIN rewards_accounts ra ON ra.user_id = :userId
                 LEFT JOIN reward_tiers rt ON ra.current_tier = rt.tier_name
                 WHERE er.is_active = true
                 AND rp.is_active = true
                 AND (er.mcc_codes IS NULL OR :mccCode = ANY(er.mcc_codes))
                 AND (er.min_transaction_amount IS NULL OR :amount >= er.min_transaction_amount)
                 ORDER BY er.priority DESC
                 LIMIT 1`,
                {
                    replacements: { userId, mccCode, amount },
                    transaction
                }
            );

            let points = 0;
            if (rule) {
                const basePoints = amount * (rule.points_per_dollar || 1);
                const ruleMultiplier = rule.points_multiplier || 1;
                const tierMultiplier = rule.tier_multiplier || 1;
                points = basePoints * ruleMultiplier * tierMultiplier;
                points += rule.bonus_points || 0;
            } else {
                // Default 1 point per dollar
                points = amount;
            }

            return Math.floor(points);
        } catch (error) {
            logger.error('Calculate points error:', error);
            return 0;
        }
    }

    /**
     * Calculate cashback for transaction
     */
    async calculateCashback(userId, amount, mccCode, merchantName, transaction) {
        try {
            const quarter = Math.ceil((new Date().getMonth() + 1) / 3);

            // Check rotating categories first
            const [[rotatingCategory]] = await db.sequelize.query(
                `SELECT cc.cashback_rate
                 FROM cashback_categories cc
                 JOIN user_cashback_activations uca ON cc.id = uca.category_id
                 WHERE uca.user_id = :userId
                 AND uca.is_active = true
                 AND cc.is_active = true
                 AND cc.quarter = :quarter
                 AND cc.year = :year
                 AND :mccCode = ANY(cc.mcc_codes)
                 AND CURRENT_DATE BETWEEN cc.start_date AND cc.end_date`,
                {
                    replacements: {
                        userId,
                        quarter,
                        year: new Date().getFullYear(),
                        mccCode
                    },
                    transaction
                }
            );

            if (rotatingCategory) {
                return amount * (rotatingCategory.cashback_rate / 100);
            }

            // Use standard cashback rules
            const [[rule]] = await db.sequelize.query(
                `SELECT er.cashback_rate
                 FROM earning_rules er
                 JOIN rewards_programs rp ON er.program_id = rp.id
                 WHERE er.is_active = true
                 AND rp.is_active = true
                 AND (er.mcc_codes IS NULL OR :mccCode = ANY(er.mcc_codes))
                 ORDER BY er.priority DESC
                 LIMIT 1`,
                {
                    replacements: { mccCode },
                    transaction
                }
            );

            const cashbackRate = rule?.cashback_rate || 1; // Default 1%
            return amount * (cashbackRate / 100);
        } catch (error) {
            logger.error('Calculate cashback error:', error);
            return 0;
        }
    }

    /**
     * Get applicable earning rule
     */
    async getApplicableRule(userId, mccCode, category, amount) {
        try {
            const [[rule]] = await db.sequelize.query(
                `SELECT er.*, rp.program_code
                 FROM earning_rules er
                 JOIN rewards_programs rp ON er.program_id = rp.id
                 WHERE er.is_active = true
                 AND rp.is_active = true
                 AND (er.mcc_codes IS NULL OR :mccCode = ANY(er.mcc_codes))
                 AND (er.categories IS NULL OR :category = ANY(er.categories))
                 AND (er.min_transaction_amount IS NULL OR :amount >= er.min_transaction_amount)
                 AND (er.max_transaction_amount IS NULL OR :amount <= er.max_transaction_amount)
                 ORDER BY er.priority DESC
                 LIMIT 1`,
                {
                    replacements: { mccCode, category, amount }
                }
            );

            return rule;
        } catch (error) {
            logger.error('Get applicable rule error:', error);
            return null;
        }
    }

    // ==================== REDEMPTIONS ====================

    /**
     * Redeem points for reward
     */
    async redeemPoints(userId, catalogItemId, quantity = 1) {
        const transaction = await db.sequelize.transaction();

        try {
            // Get user account
            const [[account]] = await db.sequelize.query(
                `SELECT * FROM rewards_accounts WHERE user_id = :userId`,
                { replacements: { userId }, transaction }
            );

            if (!account) {
                throw new Error('Rewards account not found');
            }

            // Get catalog item
            const [[item]] = await db.sequelize.query(
                `SELECT * FROM rewards_catalog
                 WHERE id = :catalogItemId AND is_active = true`,
                { replacements: { catalogItemId }, transaction }
            );

            if (!item) {
                throw new Error('Reward item not found');
            }

            const totalPointsCost = item.points_cost * quantity;

            // Check balance
            if (account.points_balance < totalPointsCost) {
                throw new Error('Insufficient points balance');
            }

            // Check tier requirements
            if (item.min_tier) {
                const [[userTier]] = await db.sequelize.query(
                    `SELECT tier_level FROM reward_tiers WHERE tier_name = :tier`,
                    { replacements: { tier: account.current_tier }, transaction }
                );

                const [[minTier]] = await db.sequelize.query(
                    `SELECT tier_level FROM reward_tiers WHERE tier_name = :tier`,
                    { replacements: { tier: item.min_tier }, transaction }
                );

                if (!userTier || !minTier || userTier.tier_level < minTier.tier_level) {
                    throw new Error(`Minimum tier ${item.min_tier} required`);
                }
            }

            // Create redemption record
            const redemptionId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO rewards_redemptions
                 (id, user_id, account_id, catalog_item_id, redemption_type,
                  points_redeemed, cash_value, status, delivery_method)
                 VALUES (:id, :userId, :accountId, :catalogItemId, :redemptionType,
                  :pointsRedeemed, :cashValue, 'pending', :deliveryMethod)`,
                {
                    replacements: {
                        id: redemptionId,
                        userId,
                        accountId: account.id,
                        catalogItemId,
                        redemptionType: item.redemption_type,
                        pointsRedeemed: totalPointsCost,
                        cashValue: item.cash_value * quantity,
                        deliveryMethod: item.redemption_type === 'gift_card' ? 'email' : 'account_credit'
                    },
                    transaction
                }
            );

            // Create rewards transaction
            await db.sequelize.query(
                `INSERT INTO rewards_transactions
                 (id, user_id, account_id, transaction_type, reward_type,
                  amount, points_amount, status)
                 VALUES (:id, :userId, :accountId, 'redeem', 'points',
                  :points, :points, 'completed')`,
                {
                    replacements: {
                        id: uuidv4(),
                        userId,
                        accountId: account.id,
                        points: totalPointsCost
                    },
                    transaction
                }
            );

            // Process redemption
            await this.processRedemption(redemptionId, item, transaction);

            await transaction.commit();

            // Send notification
            await this.notificationService.sendNotification(userId, {
                type: 'redemption_complete',
                title: 'Redemption Successful',
                message: `You redeemed ${totalPointsCost} points for ${item.name}`,
                data: { redemptionId, itemName: item.name }
            });

            return {
                redemptionId,
                itemName: item.name,
                pointsRedeemed: totalPointsCost,
                cashValue: item.cash_value * quantity
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Redeem points error:', error);
            throw error;
        }
    }

    /**
     * Redeem cashback
     */
    async redeemCashback(userId, amount, redemptionType = 'statement_credit') {
        const transaction = await db.sequelize.transaction();

        try {
            // Get user account
            const [[account]] = await db.sequelize.query(
                `SELECT * FROM rewards_accounts WHERE user_id = :userId`,
                { replacements: { userId }, transaction }
            );

            if (!account) {
                throw new Error('Rewards account not found');
            }

            // Check balance
            if (account.cashback_balance < amount) {
                throw new Error('Insufficient cashback balance');
            }

            // Minimum redemption amount
            if (amount < 25) {
                throw new Error('Minimum redemption amount is $25');
            }

            // Create redemption
            const redemptionId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO rewards_redemptions
                 (id, user_id, account_id, redemption_type, cashback_redeemed,
                  cash_value, status, delivery_method)
                 VALUES (:id, :userId, :accountId, :redemptionType, :amount,
                  :amount, 'approved', 'account_credit')`,
                {
                    replacements: {
                        id: redemptionId,
                        userId,
                        accountId: account.id,
                        redemptionType,
                        amount
                    },
                    transaction
                }
            );

            // Create rewards transaction
            await db.sequelize.query(
                `INSERT INTO rewards_transactions
                 (id, user_id, account_id, transaction_type, reward_type,
                  amount, cashback_amount, status)
                 VALUES (:id, :userId, :accountId, 'redeem', 'cashback',
                  :amount, :amount, 'completed')`,
                {
                    replacements: {
                        id: uuidv4(),
                        userId,
                        accountId: account.id,
                        amount
                    },
                    transaction
                }
            );

            // Apply cashback based on redemption type
            if (redemptionType === 'statement_credit') {
                // Credit to wallet balance
                await db.sequelize.query(
                    `UPDATE wallets
                     SET balance = balance + :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = :userId`,
                    { replacements: { amount, userId }, transaction }
                );
            }

            await transaction.commit();

            // Send notification
            await this.notificationService.sendNotification(userId, {
                type: 'cashback_redeemed',
                title: 'Cashback Redeemed',
                message: `$${amount.toFixed(2)} cashback has been applied to your account`,
                data: { redemptionId, amount }
            });

            return {
                redemptionId,
                amount,
                redemptionType
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Redeem cashback error:', error);
            throw error;
        }
    }

    /**
     * Process redemption fulfillment
     */
    async processRedemption(redemptionId, item, transaction) {
        try {
            switch (item.redemption_type) {
                case 'gift_card':
                    // Generate gift card code
                    const code = this.generateGiftCardCode();
                    await db.sequelize.query(
                        `UPDATE rewards_redemptions
                         SET redemption_code = :code,
                             delivery_status = 'delivered',
                             status = 'completed',
                             completed_at = CURRENT_TIMESTAMP
                         WHERE id = :redemptionId`,
                        { replacements: { code, redemptionId }, transaction }
                    );
                    break;

                case 'cash_back':
                case 'statement_credit':
                    // Process cash credit
                    await db.sequelize.query(
                        `UPDATE rewards_redemptions
                         SET delivery_status = 'delivered',
                             status = 'completed',
                             completed_at = CURRENT_TIMESTAMP
                         WHERE id = :redemptionId`,
                        { replacements: { redemptionId }, transaction }
                    );
                    break;

                case 'merchandise':
                    // Queue for fulfillment
                    await publishToQueue('fulfillment', {
                        redemptionId,
                        itemId: item.id,
                        type: 'merchandise'
                    });
                    break;
            }
        } catch (error) {
            logger.error('Process redemption error:', error);
            throw error;
        }
    }

    // ==================== PARTNER PROGRAMS ====================

    /**
     * Process partner transaction
     */
    async processPartnerTransaction(userId, partnerId, amount, transactionData) {
        try {
            // Get partner details
            const [[partner]] = await db.sequelize.query(
                `SELECT * FROM rewards_partners
                 WHERE id = :partnerId AND is_active = true`,
                { replacements: { partnerId } }
            );

            if (!partner) {
                return null;
            }

            // Apply partner multipliers
            const bonusPoints = amount * (partner.base_points_multiplier - 1);
            const bonusCashback = amount * (partner.base_cashback_rate / 100);

            // Check for special offers
            const offers = await this.getActivePartnerOffers(partnerId, userId, amount);

            let totalBonusPoints = bonusPoints;
            let totalBonusCashback = bonusCashback;

            for (const offer of offers) {
                if (offer.bonus_points) {
                    totalBonusPoints += offer.bonus_points;
                }
                if (offer.bonus_multiplier) {
                    totalBonusPoints *= offer.bonus_multiplier;
                }
                if (offer.cashback_bonus) {
                    totalBonusCashback += amount * (offer.cashback_bonus / 100);
                }
            }

            // Award partner bonuses
            if (totalBonusPoints > 0 || totalBonusCashback > 0) {
                const account = await this.ensureRewardsAccount(userId);
                await this.awardBonus(
                    userId,
                    account.id,
                    { points: totalBonusPoints, cashback: totalBonusCashback },
                    'partner_bonus'
                );
            }

            return {
                partnerId,
                bonusPoints: totalBonusPoints,
                bonusCashback: totalBonusCashback
            };
        } catch (error) {
            logger.error('Process partner transaction error:', error);
            return null;
        }
    }

    /**
     * Get active partner offers
     */
    async getActivePartnerOffers(partnerId, userId, amount) {
        try {
            const [offers] = await db.sequelize.query(
                `SELECT po.*
                 FROM partner_offers po
                 LEFT JOIN (
                     SELECT offer_id, COUNT(*) as use_count
                     FROM rewards_transactions
                     WHERE user_id = :userId
                     AND metadata->>'offer_id' IS NOT NULL
                     GROUP BY offer_id
                 ) user_uses ON po.id = user_uses.offer_id
                 WHERE po.partner_id = :partnerId
                 AND po.is_active = true
                 AND CURRENT_TIMESTAMP BETWEEN po.valid_from AND po.valid_until
                 AND (po.min_purchase_amount IS NULL OR :amount >= po.min_purchase_amount)
                 AND (po.max_uses_per_user IS NULL OR COALESCE(user_uses.use_count, 0) < po.max_uses_per_user)
                 AND (po.total_redemption_limit IS NULL OR po.current_redemption_count < po.total_redemption_limit)`,
                {
                    replacements: { partnerId, userId, amount }
                }
            );

            return offers;
        } catch (error) {
            logger.error('Get active partner offers error:', error);
            return [];
        }
    }

    // ==================== CAMPAIGNS & BONUSES ====================

    /**
     * Check and apply bonus campaigns
     */
    async checkBonusCampaigns(userId, amount, category, transaction) {
        try {
            const [campaigns] = await db.sequelize.query(
                `SELECT bc.*
                 FROM bonus_campaigns bc
                 LEFT JOIN user_campaign_participation ucp ON
                     bc.id = ucp.campaign_id AND ucp.user_id = :userId
                 WHERE bc.is_active = true
                 AND CURRENT_TIMESTAMP BETWEEN bc.start_date AND bc.end_date
                 AND (bc.max_participants IS NULL OR bc.current_participants < bc.max_participants)
                 AND (ucp.is_completed IS NULL OR ucp.is_completed = false)`,
                {
                    replacements: { userId },
                    transaction
                }
            );

            let totalBonusPoints = 0;
            let totalBonusCashback = 0;

            for (const campaign of campaigns) {
                const qualified = await this.checkCampaignQualification(
                    userId,
                    campaign,
                    amount,
                    category,
                    transaction
                );

                if (qualified) {
                    totalBonusPoints += campaign.bonus_points || 0;
                    totalBonusCashback += campaign.bonus_cashback || 0;

                    // Update participation
                    await this.updateCampaignParticipation(
                        userId,
                        campaign.id,
                        amount,
                        transaction
                    );
                }
            }

            return {
                points: totalBonusPoints,
                cashback: totalBonusCashback
            };
        } catch (error) {
            logger.error('Check bonus campaigns error:', error);
            return { points: 0, cashback: 0 };
        }
    }

    /**
     * Award bonus points or cashback
     */
    async awardBonus(userId, accountId, bonus, reason, transaction = null) {
        try {
            const shouldCommit = !transaction;
            if (shouldCommit) {
                transaction = await db.sequelize.transaction();
            }

            // Create bonus transaction
            await db.sequelize.query(
                `INSERT INTO rewards_transactions
                 (id, user_id, account_id, transaction_type, reward_type,
                  amount, points_amount, cashback_amount, description, status)
                 VALUES (:id, :userId, :accountId, 'bonus', 'mixed',
                  :totalAmount, :points, :cashback, :reason, 'completed')`,
                {
                    replacements: {
                        id: uuidv4(),
                        userId,
                        accountId,
                        totalAmount: (bonus.points || 0) + (bonus.cashback || 0),
                        points: bonus.points || 0,
                        cashback: bonus.cashback || 0,
                        reason
                    },
                    transaction
                }
            );

            if (shouldCommit) {
                await transaction.commit();
            }

            return bonus;
        } catch (error) {
            if (transaction && shouldCommit) {
                await transaction.rollback();
            }
            logger.error('Award bonus error:', error);
            throw error;
        }
    }

    // ==================== TIER MANAGEMENT ====================

    /**
     * Update user tier based on activity
     */
    async updateUserTier(userId) {
        const transaction = await db.sequelize.transaction();

        try {
            // Get annual spending
            const [[spending]] = await db.sequelize.query(
                `SELECT COALESCE(SUM(source_amount), 0) as total
                 FROM rewards_transactions
                 WHERE user_id = :userId
                 AND transaction_type = 'earn'
                 AND created_at >= DATE_TRUNC('year', CURRENT_DATE)`,
                { replacements: { userId }, transaction }
            );

            const annualSpending = parseFloat(spending.total);

            // Determine appropriate tier
            const [[newTier]] = await db.sequelize.query(
                `SELECT * FROM reward_tiers
                 WHERE is_active = true
                 AND min_annual_spending <= :spending
                 ORDER BY tier_level DESC
                 LIMIT 1`,
                { replacements: { spending: annualSpending }, transaction }
            );

            if (!newTier) {
                await transaction.rollback();
                return null;
            }

            // Get current tier
            const [[account]] = await db.sequelize.query(
                `SELECT * FROM rewards_accounts WHERE user_id = :userId`,
                { replacements: { userId }, transaction }
            );

            if (account && account.current_tier !== newTier.tier_name) {
                // Update tier
                await db.sequelize.query(
                    `UPDATE rewards_accounts
                     SET current_tier = :newTier,
                         tier_qualification_amount = :amount,
                         tier_expiry_date = CURRENT_DATE + INTERVAL '1 year',
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = :userId`,
                    {
                        replacements: {
                            newTier: newTier.tier_name,
                            amount: annualSpending,
                            userId
                        },
                        transaction
                    }
                );

                // Record tier history
                await db.sequelize.query(
                    `INSERT INTO user_tier_history
                     (id, user_id, account_id, previous_tier, new_tier,
                      change_reason, qualification_amount)
                     VALUES (:id, :userId, :accountId, :previousTier, :newTier,
                      :reason, :amount)`,
                    {
                        replacements: {
                            id: uuidv4(),
                            userId,
                            accountId: account.id,
                            previousTier: account.current_tier,
                            newTier: newTier.tier_name,
                            reason: 'Annual spending qualification',
                            amount: annualSpending
                        },
                        transaction
                    }
                );

                await transaction.commit();

                // Send notification
                await this.notificationService.sendNotification(userId, {
                    type: 'tier_upgrade',
                    title: 'Tier Upgrade!',
                    message: `Congratulations! You've been upgraded to ${newTier.tier_name} tier`,
                    data: { newTier: newTier.tier_name }
                });

                return newTier.tier_name;
            }

            await transaction.commit();
            return account?.current_tier;
        } catch (error) {
            await transaction.rollback();
            logger.error('Update user tier error:', error);
            return null;
        }
    }

    // ==================== ROTATING CATEGORIES ====================

    /**
     * Activate cashback category
     */
    async activateCashbackCategory(userId, categoryId) {
        try {
            // Check if category is valid
            const [[category]] = await db.sequelize.query(
                `SELECT * FROM cashback_categories
                 WHERE id = :categoryId
                 AND is_active = true
                 AND CURRENT_DATE BETWEEN start_date AND end_date`,
                { replacements: { categoryId } }
            );

            if (!category) {
                throw new Error('Invalid or expired category');
            }

            // Check if already activated
            const [[existing]] = await db.sequelize.query(
                `SELECT * FROM user_cashback_activations
                 WHERE user_id = :userId AND category_id = :categoryId`,
                { replacements: { userId, categoryId } }
            );

            if (existing && existing.is_active) {
                return { alreadyActive: true };
            }

            // Activate category
            if (existing) {
                await db.sequelize.query(
                    `UPDATE user_cashback_activations
                     SET is_active = true, activated_at = CURRENT_TIMESTAMP
                     WHERE user_id = :userId AND category_id = :categoryId`,
                    { replacements: { userId, categoryId } }
                );
            } else {
                await db.sequelize.query(
                    `INSERT INTO user_cashback_activations
                     (id, user_id, category_id, is_active)
                     VALUES (:id, :userId, :categoryId, true)`,
                    {
                        replacements: {
                            id: uuidv4(),
                            userId,
                            categoryId
                        }
                    }
                );
            }

            return {
                activated: true,
                category: category.category_name,
                cashbackRate: category.cashback_rate
            };
        } catch (error) {
            logger.error('Activate cashback category error:', error);
            throw error;
        }
    }

    /**
     * Get current quarter categories
     */
    async getCurrentQuarterCategories() {
        try {
            const quarter = Math.ceil((new Date().getMonth() + 1) / 3);
            const year = new Date().getFullYear();

            const [categories] = await db.sequelize.query(
                `SELECT * FROM cashback_categories
                 WHERE quarter = :quarter
                 AND year = :year
                 AND is_active = true
                 ORDER BY cashback_rate DESC`,
                { replacements: { quarter, year } }
            );

            return categories;
        } catch (error) {
            logger.error('Get current quarter categories error:', error);
            return [];
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Auto-enroll in default programs
     */
    async autoEnrollPrograms(userId) {
        try {
            const [programs] = await db.sequelize.query(
                `SELECT * FROM rewards_programs
                 WHERE auto_enroll = true AND is_active = true`
            );

            // Auto-enrollment logic would go here
            // For now, users are automatically part of default program

            return programs;
        } catch (error) {
            logger.error('Auto enroll programs error:', error);
            return [];
        }
    }

    /**
     * Check campaign qualification
     */
    async checkCampaignQualification(userId, campaign, amount, category, transaction) {
        try {
            const requirements = JSON.parse(campaign.requirements || '{}');

            // Check spending requirement
            if (requirements.minSpending && amount < requirements.minSpending) {
                return false;
            }

            // Check category requirement
            if (requirements.categories && !requirements.categories.includes(category)) {
                return false;
            }

            // Check first purchase requirement
            if (requirements.firstPurchase) {
                const [[previousTransaction]] = await db.sequelize.query(
                    `SELECT COUNT(*) as count
                     FROM rewards_transactions
                     WHERE user_id = :userId AND transaction_type = 'earn'`,
                    { replacements: { userId }, transaction }
                );

                if (previousTransaction.count > 1) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            logger.error('Check campaign qualification error:', error);
            return false;
        }
    }

    /**
     * Update campaign participation
     */
    async updateCampaignParticipation(userId, campaignId, amount, transaction) {
        try {
            const [[existing]] = await db.sequelize.query(
                `SELECT * FROM user_campaign_participation
                 WHERE user_id = :userId AND campaign_id = :campaignId`,
                { replacements: { userId, campaignId }, transaction }
            );

            if (existing) {
                const progress = JSON.parse(existing.progress || '{}');
                progress.totalSpent = (progress.totalSpent || 0) + amount;
                progress.transactionCount = (progress.transactionCount || 0) + 1;

                await db.sequelize.query(
                    `UPDATE user_campaign_participation
                     SET progress = :progress
                     WHERE user_id = :userId AND campaign_id = :campaignId`,
                    {
                        replacements: {
                            progress: JSON.stringify(progress),
                            userId,
                            campaignId
                        },
                        transaction
                    }
                );
            } else {
                await db.sequelize.query(
                    `INSERT INTO user_campaign_participation
                     (id, user_id, campaign_id, progress)
                     VALUES (:id, :userId, :campaignId, :progress)`,
                    {
                        replacements: {
                            id: uuidv4(),
                            userId,
                            campaignId,
                            progress: JSON.stringify({
                                totalSpent: amount,
                                transactionCount: 1
                            })
                        },
                        transaction
                    }
                );
            }
        } catch (error) {
            logger.error('Update campaign participation error:', error);
        }
    }

    /**
     * Generate gift card code
     */
    generateGiftCardCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) {
                code += '-';
            }
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    /**
     * Process points expiry
     */
    async processPointsExpiry() {
        try {
            const result = await db.sequelize.query(
                `SELECT process_points_expiry() as expired_count`
            );

            const expiredCount = result[0][0].expired_count;

            if (expiredCount > 0) {
                logger.info(`Processed ${expiredCount} expired points transactions`);
            }

            return expiredCount;
        } catch (error) {
            logger.error('Process points expiry error:', error);
            return 0;
        }
    }
}

export default new RewardsService();