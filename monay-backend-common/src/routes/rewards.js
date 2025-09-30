/**
 * Rewards & Cashback Routes
 * Consumer Wallet Phase 3 Day 15 Implementation
 */

import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT } from '../middleware-app/authenticate.js';
import rewardsService from '../services/rewards-service.js';
import logger from '../services/logger.js';
import db from '../models/index.js';

const router = express.Router();

// ==================== VALIDATION SCHEMAS ====================

const redeemPointsSchema = Joi.object({
    catalogItemId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().positive().default(1)
});

const redeemCashbackSchema = Joi.object({
    amount: Joi.number().positive().min(25).required(),
    redemptionType: Joi.string().valid(
        'statement_credit',
        'bank_transfer',
        'gift_card'
    ).default('statement_credit')
});

const processTransactionSchema = Joi.object({
    transactionId: Joi.string().uuid().required(),
    transactionType: Joi.string().required(),
    amount: Joi.number().positive().required(),
    merchantName: Joi.string().required(),
    merchantCategory: Joi.string().required(),
    mccCode: Joi.string().length(4).required()
});

const activateCategorySchema = Joi.object({
    categoryId: Joi.string().uuid().required()
});

// ==================== ACCOUNT ENDPOINTS ====================

/**
 * Get rewards account summary
 * GET /api/rewards/account
 */
router.get('/account', authenticateJWT, async (req, res) => {
    try {
        const summary = await rewardsService.getAccountSummary(req.user.id);

        res.json({
            success: true,
            account: summary
        });
    } catch (error) {
        logger.error('Get rewards account error:', error);
        res.status(500).json({ error: 'Failed to get rewards account' });
    }
});

/**
 * Get rewards balance
 * GET /api/rewards/balance
 */
router.get('/balance', authenticateJWT, async (req, res) => {
    try {
        const [[balance]] = await db.sequelize.query(
            `SELECT
                points_balance,
                cashback_balance,
                lifetime_points_earned,
                lifetime_cashback_earned,
                current_tier
             FROM rewards_accounts
             WHERE user_id = :userId`,
            { replacements: { userId: req.user.id } }
        );

        res.json({
            success: true,
            balance: balance || {
                points_balance: 0,
                cashback_balance: 0,
                lifetime_points_earned: 0,
                lifetime_cashback_earned: 0,
                current_tier: 'bronze'
            }
        });
    } catch (error) {
        logger.error('Get rewards balance error:', error);
        res.status(500).json({ error: 'Failed to get balance' });
    }
});

/**
 * Get tier information
 * GET /api/rewards/tier
 */
router.get('/tier', authenticateJWT, async (req, res) => {
    try {
        const [[account]] = await db.sequelize.query(
            `SELECT
                ra.current_tier,
                ra.tier_progress,
                ra.tier_qualification_amount,
                ra.tier_expiry_date,
                rt.tier_level,
                rt.points_multiplier,
                rt.cashback_bonus,
                rt.perks
             FROM rewards_accounts ra
             LEFT JOIN reward_tiers rt ON ra.current_tier = rt.tier_name
             WHERE ra.user_id = :userId`,
            { replacements: { userId: req.user.id } }
        );

        const nextTierProgress = await rewardsService.calculateNextTierProgress(
            req.user.id,
            account?.current_tier || 'bronze'
        );

        res.json({
            success: true,
            tier: {
                ...account,
                nextTierProgress
            }
        });
    } catch (error) {
        logger.error('Get tier information error:', error);
        res.status(500).json({ error: 'Failed to get tier information' });
    }
});

// ==================== EARNING ENDPOINTS ====================

/**
 * Process transaction rewards
 * POST /api/rewards/earn
 */
router.post('/earn', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = processTransactionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const rewards = await rewardsService.processTransactionRewards({
            userId: req.user.id,
            ...value
        });

        res.json({
            success: true,
            rewards
        });
    } catch (error) {
        logger.error('Process transaction rewards error:', error);
        res.status(500).json({ error: 'Failed to process rewards' });
    }
});

/**
 * Get earning history
 * GET /api/rewards/history
 */
router.get('/history', authenticateJWT, async (req, res) => {
    try {
        const { limit = 50, offset = 0, type = 'all' } = req.query;

        let typeFilter = '';
        if (type === 'earned') {
            typeFilter = "AND transaction_type IN ('earn', 'bonus')";
        } else if (type === 'redeemed') {
            typeFilter = "AND transaction_type = 'redeem'";
        }

        const [transactions] = await db.sequelize.query(
            `SELECT
                rt.*,
                rp.name as program_name,
                er.rule_name
             FROM rewards_transactions rt
             LEFT JOIN rewards_programs rp ON rt.program_id = rp.id
             LEFT JOIN earning_rules er ON rt.rule_id = er.id
             WHERE rt.user_id = :userId
             ${typeFilter}
             ORDER BY rt.created_at DESC
             LIMIT :limit OFFSET :offset`,
            {
                replacements: {
                    userId: req.user.id,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            }
        );

        res.json({
            success: true,
            transactions,
            count: transactions.length
        });
    } catch (error) {
        logger.error('Get earning history error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
});

/**
 * Get earning rules
 * GET /api/rewards/earning-rules
 */
router.get('/earning-rules', authenticateJWT, async (req, res) => {
    try {
        const [rules] = await db.sequelize.query(
            `SELECT
                er.rule_name,
                er.rule_type,
                er.categories,
                er.points_multiplier,
                er.cashback_rate,
                er.bonus_points,
                rp.name as program_name
             FROM earning_rules er
             JOIN rewards_programs rp ON er.program_id = rp.id
             WHERE er.is_active = true
             AND rp.is_active = true
             AND (er.start_date IS NULL OR er.start_date <= CURRENT_DATE)
             AND (er.end_date IS NULL OR er.end_date >= CURRENT_DATE)
             ORDER BY er.priority DESC`
        );

        res.json({
            success: true,
            rules
        });
    } catch (error) {
        logger.error('Get earning rules error:', error);
        res.status(500).json({ error: 'Failed to get earning rules' });
    }
});

// ==================== REDEMPTION ENDPOINTS ====================

/**
 * Get rewards catalog
 * GET /api/rewards/catalog
 */
router.get('/catalog', authenticateJWT, async (req, res) => {
    try {
        const { category, type } = req.query;

        let filters = 'WHERE rc.is_active = true';
        const replacements = { userId: req.user.id };

        if (category) {
            filters += ' AND rc.category = :category';
            replacements.category = category;
        }

        if (type) {
            filters += ' AND rc.redemption_type = :type';
            replacements.type = type;
        }

        // Get user tier for filtering
        const [[account]] = await db.sequelize.query(
            `SELECT current_tier FROM rewards_accounts WHERE user_id = :userId`,
            { replacements: { userId: req.user.id } }
        );

        const [items] = await db.sequelize.query(
            `SELECT
                rc.*,
                rp.partner_name,
                CASE
                    WHEN rc.min_tier IS NULL THEN true
                    WHEN rt.tier_level >= min_rt.tier_level THEN true
                    ELSE false
                END as is_eligible
             FROM rewards_catalog rc
             LEFT JOIN rewards_partners rp ON rc.partner_id = rp.id
             LEFT JOIN reward_tiers rt ON rt.tier_name = :userTier
             LEFT JOIN reward_tiers min_rt ON min_rt.tier_name = rc.min_tier
             ${filters}
             ORDER BY rc.is_featured DESC, rc.points_cost ASC`,
            {
                replacements: {
                    ...replacements,
                    userTier: account?.current_tier || 'bronze'
                }
            }
        );

        res.json({
            success: true,
            catalog: items
        });
    } catch (error) {
        logger.error('Get rewards catalog error:', error);
        res.status(500).json({ error: 'Failed to get catalog' });
    }
});

/**
 * Redeem points
 * POST /api/rewards/redeem/points
 */
router.post('/redeem/points', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = redeemPointsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const redemption = await rewardsService.redeemPoints(
            req.user.id,
            value.catalogItemId,
            value.quantity
        );

        res.json({
            success: true,
            redemption
        });
    } catch (error) {
        logger.error('Redeem points error:', error);
        res.status(500).json({ error: error.message || 'Failed to redeem points' });
    }
});

/**
 * Redeem cashback
 * POST /api/rewards/redeem/cashback
 */
router.post('/redeem/cashback', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = redeemCashbackSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const redemption = await rewardsService.redeemCashback(
            req.user.id,
            value.amount,
            value.redemptionType
        );

        res.json({
            success: true,
            redemption
        });
    } catch (error) {
        logger.error('Redeem cashback error:', error);
        res.status(500).json({ error: error.message || 'Failed to redeem cashback' });
    }
});

/**
 * Get redemption history
 * GET /api/rewards/redemptions
 */
router.get('/redemptions', authenticateJWT, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const [redemptions] = await db.sequelize.query(
            `SELECT
                rr.*,
                rc.name as item_name,
                rc.redemption_type
             FROM rewards_redemptions rr
             LEFT JOIN rewards_catalog rc ON rr.catalog_item_id = rc.id
             WHERE rr.user_id = :userId
             ORDER BY rr.created_at DESC
             LIMIT :limit OFFSET :offset`,
            {
                replacements: {
                    userId: req.user.id,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            }
        );

        res.json({
            success: true,
            redemptions
        });
    } catch (error) {
        logger.error('Get redemption history error:', error);
        res.status(500).json({ error: 'Failed to get redemption history' });
    }
});

// ==================== CASHBACK CATEGORIES ====================

/**
 * Get current quarter categories
 * GET /api/rewards/categories
 */
router.get('/categories', authenticateJWT, async (req, res) => {
    try {
        const categories = await rewardsService.getCurrentQuarterCategories();

        // Get user activations
        const [activations] = await db.sequelize.query(
            `SELECT category_id, is_active
             FROM user_cashback_activations
             WHERE user_id = :userId`,
            { replacements: { userId: req.user.id } }
        );

        const activationMap = {};
        activations.forEach(a => {
            activationMap[a.category_id] = a.is_active;
        });

        const categoriesWithStatus = categories.map(c => ({
            ...c,
            isActivated: activationMap[c.id] || false
        }));

        res.json({
            success: true,
            categories: categoriesWithStatus
        });
    } catch (error) {
        logger.error('Get cashback categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

/**
 * Activate cashback category
 * POST /api/rewards/categories/activate
 */
router.post('/categories/activate', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = activateCategorySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const result = await rewardsService.activateCashbackCategory(
            req.user.id,
            value.categoryId
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        logger.error('Activate category error:', error);
        res.status(500).json({ error: error.message || 'Failed to activate category' });
    }
});

// ==================== PARTNER OFFERS ====================

/**
 * Get partner offers
 * GET /api/rewards/offers
 */
router.get('/offers', authenticateJWT, async (req, res) => {
    try {
        const [offers] = await db.sequelize.query(
            `SELECT
                po.*,
                rp.partner_name,
                rp.partner_type
             FROM partner_offers po
             JOIN rewards_partners rp ON po.partner_id = rp.id
             WHERE po.is_active = true
             AND rp.is_active = true
             AND CURRENT_TIMESTAMP BETWEEN po.valid_from AND po.valid_until
             ORDER BY po.bonus_multiplier DESC, po.bonus_points DESC`,
            {
                replacements: { userId: req.user.id }
            }
        );

        res.json({
            success: true,
            offers
        });
    } catch (error) {
        logger.error('Get partner offers error:', error);
        res.status(500).json({ error: 'Failed to get offers' });
    }
});

/**
 * Get partner details
 * GET /api/rewards/partners/:partnerId
 */
router.get('/partners/:partnerId', authenticateJWT, async (req, res) => {
    try {
        const [[partner]] = await db.sequelize.query(
            `SELECT * FROM rewards_partners
             WHERE id = :partnerId AND is_active = true`,
            { replacements: { partnerId: req.params.partnerId } }
        );

        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        // Get active offers
        const [offers] = await db.sequelize.query(
            `SELECT * FROM partner_offers
             WHERE partner_id = :partnerId
             AND is_active = true
             AND CURRENT_TIMESTAMP BETWEEN valid_from AND valid_until`,
            { replacements: { partnerId: req.params.partnerId } }
        );

        res.json({
            success: true,
            partner: {
                ...partner,
                offers
            }
        });
    } catch (error) {
        logger.error('Get partner details error:', error);
        res.status(500).json({ error: 'Failed to get partner details' });
    }
});

// ==================== CAMPAIGNS ====================

/**
 * Get active campaigns
 * GET /api/rewards/campaigns
 */
router.get('/campaigns', authenticateJWT, async (req, res) => {
    try {
        const [campaigns] = await db.sequelize.query(
            `SELECT
                bc.*,
                ucp.is_completed,
                ucp.progress,
                ucp.points_earned,
                ucp.cashback_earned
             FROM bonus_campaigns bc
             LEFT JOIN user_campaign_participation ucp ON
                bc.id = ucp.campaign_id AND ucp.user_id = :userId
             WHERE bc.is_active = true
             AND CURRENT_TIMESTAMP BETWEEN bc.start_date AND bc.end_date
             ORDER BY bc.bonus_points DESC, bc.bonus_cashback DESC`,
            { replacements: { userId: req.user.id } }
        );

        res.json({
            success: true,
            campaigns
        });
    } catch (error) {
        logger.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to get campaigns' });
    }
});

/**
 * Enroll in campaign
 * POST /api/rewards/campaigns/:campaignId/enroll
 */
router.post('/campaigns/:campaignId/enroll', authenticateJWT, async (req, res) => {
    try {
        const { campaignId } = req.params;

        // Check if campaign exists and is active
        const [[campaign]] = await db.sequelize.query(
            `SELECT * FROM bonus_campaigns
             WHERE id = :campaignId
             AND is_active = true
             AND CURRENT_TIMESTAMP BETWEEN start_date AND end_date`,
            { replacements: { campaignId } }
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found or expired' });
        }

        // Check if already enrolled
        const [[existing]] = await db.sequelize.query(
            `SELECT * FROM user_campaign_participation
             WHERE user_id = :userId AND campaign_id = :campaignId`,
            { replacements: { userId: req.user.id, campaignId } }
        );

        if (existing) {
            return res.json({
                success: true,
                message: 'Already enrolled in campaign'
            });
        }

        // Enroll user
        await db.sequelize.query(
            `INSERT INTO user_campaign_participation
             (id, user_id, campaign_id, progress)
             VALUES (:id, :userId, :campaignId, '{}')`,
            {
                replacements: {
                    id: uuidv4(),
                    userId: req.user.id,
                    campaignId
                }
            }
        );

        // Update participant count
        await db.sequelize.query(
            `UPDATE bonus_campaigns
             SET current_participants = current_participants + 1
             WHERE id = :campaignId`,
            { replacements: { campaignId } }
        );

        res.json({
            success: true,
            message: 'Successfully enrolled in campaign'
        });
    } catch (error) {
        logger.error('Enroll in campaign error:', error);
        res.status(500).json({ error: 'Failed to enroll in campaign' });
    }
});

// ==================== ANALYTICS ====================

/**
 * Get rewards analytics
 * GET /api/rewards/analytics
 */
router.get('/analytics', authenticateJWT, async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let dateFilter = 'CURRENT_DATE - INTERVAL \'30 days\'';
        if (period === '7d') {
            dateFilter = 'CURRENT_DATE - INTERVAL \'7 days\'';
        } else if (period === '90d') {
            dateFilter = 'CURRENT_DATE - INTERVAL \'90 days\'';
        } else if (period === '1y') {
            dateFilter = 'CURRENT_DATE - INTERVAL \'1 year\'';
        }

        // Get earnings summary
        const [[earnings]] = await db.sequelize.query(
            `SELECT
                COUNT(*) as transaction_count,
                SUM(points_amount) as total_points,
                SUM(cashback_amount) as total_cashback
             FROM rewards_transactions
             WHERE user_id = :userId
             AND transaction_type IN ('earn', 'bonus')
             AND created_at >= ${dateFilter}`,
            { replacements: { userId: req.user.id } }
        );

        // Get redemptions summary
        const [[redemptions]] = await db.sequelize.query(
            `SELECT
                COUNT(*) as redemption_count,
                SUM(points_redeemed) as points_redeemed,
                SUM(cashback_redeemed) as cashback_redeemed
             FROM rewards_redemptions
             WHERE user_id = :userId
             AND created_at >= ${dateFilter}`,
            { replacements: { userId: req.user.id } }
        );

        // Get category breakdown
        const [categoryBreakdown] = await db.sequelize.query(
            `SELECT
                merchant_category,
                COUNT(*) as transactions,
                SUM(points_amount) as points,
                SUM(cashback_amount) as cashback
             FROM rewards_transactions
             WHERE user_id = :userId
             AND transaction_type = 'earn'
             AND created_at >= ${dateFilter}
             GROUP BY merchant_category
             ORDER BY points DESC
             LIMIT 10`,
            { replacements: { userId: req.user.id } }
        );

        res.json({
            success: true,
            analytics: {
                period,
                earnings: {
                    transactionCount: parseInt(earnings.transaction_count),
                    totalPoints: parseFloat(earnings.total_points || 0),
                    totalCashback: parseFloat(earnings.total_cashback || 0)
                },
                redemptions: {
                    count: parseInt(redemptions.redemption_count || 0),
                    pointsRedeemed: parseFloat(redemptions.points_redeemed || 0),
                    cashbackRedeemed: parseFloat(redemptions.cashback_redeemed || 0)
                },
                categoryBreakdown
            }
        });
    } catch (error) {
        logger.error('Get rewards analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

/**
 * Get tier progress
 * GET /api/rewards/tier-progress
 */
router.get('/tier-progress', authenticateJWT, async (req, res) => {
    try {
        const [[account]] = await db.sequelize.query(
            `SELECT
                current_tier,
                tier_qualification_amount,
                tier_expiry_date,
                current_year_spending
             FROM rewards_accounts
             WHERE user_id = :userId`,
            { replacements: { userId: req.user.id } }
        );

        // Get all tiers
        const [tiers] = await db.sequelize.query(
            `SELECT * FROM reward_tiers
             WHERE is_active = true
             ORDER BY tier_level ASC`
        );

        // Calculate progress
        const currentSpending = account?.current_year_spending || 0;
        const currentTierIndex = tiers.findIndex(t => t.tier_name === account?.current_tier);
        const nextTier = tiers[currentTierIndex + 1];

        res.json({
            success: true,
            tierProgress: {
                currentTier: account?.current_tier || 'bronze',
                currentSpending,
                nextTier: nextTier?.tier_name,
                nextTierRequirement: nextTier?.min_annual_spending,
                remainingSpending: nextTier ?
                    Math.max(0, nextTier.min_annual_spending - currentSpending) : 0,
                expiryDate: account?.tier_expiry_date,
                allTiers: tiers
            }
        });
    } catch (error) {
        logger.error('Get tier progress error:', error);
        res.status(500).json({ error: 'Failed to get tier progress' });
    }
});

export default router;