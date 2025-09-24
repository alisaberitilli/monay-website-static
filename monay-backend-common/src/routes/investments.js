/**
 * Investment Routes
 * Consumer Wallet Phase 3 Day 14 Implementation
 */

import express from 'express';
import Joi from 'joi';
import { authenticateJWT } from '../middlewares/authenticate.js';
import investmentService from '../services/investment-service.js';
import logger from '../services/logger.js';
import db from '../models/index.js';

const router = express.Router();

// ==================== VALIDATION SCHEMAS ====================

const accountSchema = Joi.object({
    accountType: Joi.string().valid('individual', 'joint', 'ira', 'roth_ira', '401k', 'education', 'custodial').required(),
    riskProfile: Joi.string().valid('conservative', 'moderate', 'aggressive', 'very_aggressive').default('moderate'),
    marginEnabled: Joi.boolean().default(false),
    optionsEnabled: Joi.boolean().default(false),
    cryptoEnabled: Joi.boolean().default(false)
});

const marketOrderSchema = Joi.object({
    accountId: Joi.string().uuid().required(),
    securityId: Joi.string().uuid().required(),
    side: Joi.string().valid('buy', 'sell').required(),
    quantity: Joi.number().positive().required()
});

const limitOrderSchema = Joi.object({
    accountId: Joi.string().uuid().required(),
    securityId: Joi.string().uuid().required(),
    side: Joi.string().valid('buy', 'sell').required(),
    quantity: Joi.number().positive().required(),
    limitPrice: Joi.number().positive().required(),
    timeInForce: Joi.string().valid('day', 'gtc', 'ioc', 'fok', 'extended').default('day')
});

const stopOrderSchema = Joi.object({
    accountId: Joi.string().uuid().required(),
    securityId: Joi.string().uuid().required(),
    side: Joi.string().valid('buy', 'sell').required(),
    quantity: Joi.number().positive().required(),
    stopPrice: Joi.number().positive().required(),
    limitPrice: Joi.number().positive().optional(),
    timeInForce: Joi.string().valid('day', 'gtc').default('day')
});

const recurringInvestmentSchema = Joi.object({
    accountId: Joi.string().uuid().required(),
    name: Joi.string().max(100).optional(),
    amount: Joi.number().positive().max(10000).required(),
    frequency: Joi.string().valid('daily', 'weekly', 'biweekly', 'monthly', 'quarterly').required(),
    allocationStrategy: Joi.string().valid('single_security', 'portfolio', 'etf_basket', 'custom').default('portfolio'),
    allocationData: Joi.object().required()
});

const watchlistSchema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(500).optional()
});

// ==================== ACCOUNT MANAGEMENT ====================

/**
 * Create investment account
 * POST /api/investments/accounts
 */
router.post('/accounts', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = accountSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const account = await investmentService.createInvestmentAccount(
            req.user.id,
            value.accountType,
            {
                riskProfile: value.riskProfile,
                marginEnabled: value.marginEnabled,
                optionsEnabled: value.optionsEnabled,
                cryptoEnabled: value.cryptoEnabled
            }
        );

        res.json({
            success: true,
            account
        });
    } catch (error) {
        logger.error('Create investment account error:', error);
        res.status(500).json({ error: error.message || 'Failed to create account' });
    }
});

/**
 * Get user's investment accounts
 * GET /api/investments/accounts
 */
router.get('/accounts', authenticateJWT, async (req, res) => {
    try {
        const [accounts] = await db.sequelize.query(
            `SELECT
                ia.*,
                (ia.cash_balance + ia.invested_balance) as total_value,
                COUNT(DISTINCT ph.security_id) as holdings_count
             FROM investment_accounts ia
             LEFT JOIN portfolio_holdings ph ON ia.id = ph.account_id
             WHERE ia.user_id = :userId AND ia.status != 'closed'
             GROUP BY ia.id
             ORDER BY ia.created_at DESC`,
            { replacements: { userId: req.user.id } }
        );

        res.json({
            success: true,
            accounts
        });
    } catch (error) {
        logger.error('Get investment accounts error:', error);
        res.status(500).json({ error: 'Failed to get accounts' });
    }
});

/**
 * Get account details with holdings
 * GET /api/investments/accounts/:accountId
 */
router.get('/accounts/:accountId', authenticateJWT, async (req, res) => {
    try {
        const accountDetails = await investmentService.getAccountDetails(
            req.params.accountId,
            req.user.id
        );

        res.json({
            success: true,
            account: accountDetails
        });
    } catch (error) {
        logger.error('Get account details error:', error);
        res.status(500).json({ error: 'Failed to get account details' });
    }
});

// ==================== ORDER MANAGEMENT ====================

/**
 * Place market order
 * POST /api/investments/orders/market
 */
router.post('/orders/market', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = marketOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const order = await investmentService.placeMarketOrder(
            value.accountId,
            value.securityId,
            value.side,
            value.quantity,
            req.user.id
        );

        res.json({
            success: true,
            order
        });
    } catch (error) {
        logger.error('Place market order error:', error);
        res.status(500).json({ error: error.message || 'Failed to place order' });
    }
});

/**
 * Place limit order
 * POST /api/investments/orders/limit
 */
router.post('/orders/limit', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = limitOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const order = await investmentService.placeLimitOrder(
            value.accountId,
            value.securityId,
            value.side,
            value.quantity,
            value.limitPrice,
            req.user.id,
            { timeInForce: value.timeInForce }
        );

        res.json({
            success: true,
            order
        });
    } catch (error) {
        logger.error('Place limit order error:', error);
        res.status(500).json({ error: error.message || 'Failed to place order' });
    }
});

/**
 * Place stop order
 * POST /api/investments/orders/stop
 */
router.post('/orders/stop', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = stopOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Create stop order (similar to limit but with stop trigger)
        const orderId = uuidv4();
        const orderReference = await investmentService.generateOrderReference();

        await db.sequelize.query(
            `INSERT INTO investment_orders
             (id, account_id, security_id, order_type, side, quantity,
              stop_price, limit_price, status, order_reference, time_in_force)
             VALUES (:id, :accountId, :securityId, :orderType, :side, :quantity,
              :stopPrice, :limitPrice, 'submitted', :orderReference, :timeInForce)`,
            {
                replacements: {
                    id: orderId,
                    accountId: value.accountId,
                    securityId: value.securityId,
                    orderType: value.limitPrice ? 'stop_limit' : 'stop',
                    side: value.side,
                    quantity: value.quantity,
                    stopPrice: value.stopPrice,
                    limitPrice: value.limitPrice,
                    orderReference,
                    timeInForce: value.timeInForce
                }
            }
        );

        res.json({
            success: true,
            order: { id: orderId, orderReference, status: 'submitted' }
        });
    } catch (error) {
        logger.error('Place stop order error:', error);
        res.status(500).json({ error: 'Failed to place stop order' });
    }
});

/**
 * Get orders
 * GET /api/investments/orders
 */
router.get('/orders', authenticateJWT, async (req, res) => {
    try {
        const { accountId, status = 'all', limit = 50, offset = 0 } = req.query;

        let statusFilter = '';
        if (status !== 'all') {
            statusFilter = 'AND o.status = :status';
        }

        let accountFilter = '';
        if (accountId) {
            accountFilter = 'AND o.account_id = :accountId';
        }

        const [orders] = await db.sequelize.query(
            `SELECT
                o.*,
                s.symbol,
                s.name,
                ia.account_number
             FROM investment_orders o
             JOIN investment_accounts ia ON o.account_id = ia.id
             JOIN securities s ON o.security_id = s.id
             WHERE ia.user_id = :userId
             ${accountFilter}
             ${statusFilter}
             ORDER BY o.created_at DESC
             LIMIT :limit OFFSET :offset`,
            {
                replacements: {
                    userId: req.user.id,
                    accountId,
                    status,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            }
        );

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        logger.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

/**
 * Cancel order
 * DELETE /api/investments/orders/:orderId
 */
router.delete('/orders/:orderId', authenticateJWT, async (req, res) => {
    try {
        const result = await investmentService.cancelOrder(
            req.params.orderId,
            req.user.id
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        logger.error('Cancel order error:', error);
        res.status(500).json({ error: error.message || 'Failed to cancel order' });
    }
});

// ==================== PORTFOLIO MANAGEMENT ====================

/**
 * Get portfolio summary
 * GET /api/investments/portfolio/:accountId
 */
router.get('/portfolio/:accountId', authenticateJWT, async (req, res) => {
    try {
        const summary = await investmentService.getPortfolioSummary(
            req.params.accountId,
            req.user.id
        );

        res.json({
            success: true,
            portfolio: summary
        });
    } catch (error) {
        logger.error('Get portfolio summary error:', error);
        res.status(500).json({ error: 'Failed to get portfolio summary' });
    }
});

/**
 * Get portfolio holdings
 * GET /api/investments/portfolio/:accountId/holdings
 */
router.get('/portfolio/:accountId/holdings', authenticateJWT, async (req, res) => {
    try {
        const [holdings] = await db.sequelize.query(
            `SELECT
                ph.*,
                s.symbol,
                s.name,
                s.security_type,
                s.current_price,
                s.previous_close,
                (ph.quantity * s.current_price) as current_value,
                ((ph.quantity * s.current_price) - ph.total_cost) as unrealized_gain_loss,
                (((ph.quantity * s.current_price) - ph.total_cost) / ph.total_cost * 100) as unrealized_gain_loss_pct
             FROM portfolio_holdings ph
             JOIN securities s ON ph.security_id = s.id
             JOIN investment_accounts ia ON ph.account_id = ia.id
             WHERE ph.account_id = :accountId
             AND ia.user_id = :userId
             AND ph.quantity > 0
             ORDER BY current_value DESC`,
            {
                replacements: {
                    accountId: req.params.accountId,
                    userId: req.user.id
                }
            }
        );

        res.json({
            success: true,
            holdings
        });
    } catch (error) {
        logger.error('Get portfolio holdings error:', error);
        res.status(500).json({ error: 'Failed to get holdings' });
    }
});

/**
 * Get portfolio performance
 * GET /api/investments/portfolio/:accountId/performance
 */
router.get('/portfolio/:accountId/performance', authenticateJWT, async (req, res) => {
    try {
        const { period = '1M' } = req.query;

        const performance = await investmentService.getPortfolioPerformance(
            req.params.accountId,
            period
        );

        res.json({
            success: true,
            performance,
            period
        });
    } catch (error) {
        logger.error('Get portfolio performance error:', error);
        res.status(500).json({ error: 'Failed to get performance' });
    }
});

/**
 * Get asset allocation
 * GET /api/investments/portfolio/:accountId/allocation
 */
router.get('/portfolio/:accountId/allocation', authenticateJWT, async (req, res) => {
    try {
        const [holdings] = await db.sequelize.query(
            `SELECT
                ph.quantity,
                s.security_type,
                s.current_price
             FROM portfolio_holdings ph
             JOIN securities s ON ph.security_id = s.id
             JOIN investment_accounts ia ON ph.account_id = ia.id
             WHERE ph.account_id = :accountId
             AND ia.user_id = :userId
             AND ph.quantity > 0`,
            {
                replacements: {
                    accountId: req.params.accountId,
                    userId: req.user.id
                }
            }
        );

        const allocation = investmentService.calculateAssetAllocation(holdings);

        res.json({
            success: true,
            allocation
        });
    } catch (error) {
        logger.error('Get asset allocation error:', error);
        res.status(500).json({ error: 'Failed to get allocation' });
    }
});

// ==================== MARKET DATA ====================

/**
 * Search securities
 * GET /api/investments/search
 */
router.get('/search', authenticateJWT, async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;

        if (!q || q.length < 1) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const securities = await investmentService.searchSecurities(q, type);

        res.json({
            success: true,
            securities
        });
    } catch (error) {
        logger.error('Search securities error:', error);
        res.status(500).json({ error: 'Failed to search securities' });
    }
});

/**
 * Get market quote
 * GET /api/investments/quote/:symbol
 */
router.get('/quote/:symbol', authenticateJWT, async (req, res) => {
    try {
        const quote = await investmentService.getMarketQuote(req.params.symbol);

        res.json({
            success: true,
            quote
        });
    } catch (error) {
        logger.error('Get market quote error:', error);
        res.status(500).json({ error: 'Failed to get quote' });
    }
});

/**
 * Get price history
 * GET /api/investments/history/:securityId
 */
router.get('/history/:securityId', authenticateJWT, async (req, res) => {
    try {
        const { period = '1M' } = req.query;

        const history = await investmentService.getPriceHistory(
            req.params.securityId,
            period
        );

        res.json({
            success: true,
            history,
            period
        });
    } catch (error) {
        logger.error('Get price history error:', error);
        res.status(500).json({ error: 'Failed to get price history' });
    }
});

/**
 * Get market movers
 * GET /api/investments/movers
 */
router.get('/movers', authenticateJWT, async (req, res) => {
    try {
        const { type = 'gainers', limit = 10 } = req.query;

        let orderBy = '';
        let filter = '';

        switch (type) {
            case 'gainers':
                orderBy = 'ORDER BY change_percent DESC';
                filter = 'AND mq.change_percent > 0';
                break;
            case 'losers':
                orderBy = 'ORDER BY change_percent ASC';
                filter = 'AND mq.change_percent < 0';
                break;
            case 'volume':
                orderBy = 'ORDER BY mq.volume DESC';
                break;
        }

        const [movers] = await db.sequelize.query(
            `SELECT
                s.id,
                s.symbol,
                s.name,
                s.current_price,
                mq.change_amount,
                mq.change_percent,
                mq.volume
             FROM securities s
             JOIN market_quotes mq ON s.id = mq.security_id
             WHERE s.tradeable = true
             ${filter}
             ${orderBy}
             LIMIT :limit`,
            { replacements: { limit: parseInt(limit) } }
        );

        res.json({
            success: true,
            movers,
            type
        });
    } catch (error) {
        logger.error('Get market movers error:', error);
        res.status(500).json({ error: 'Failed to get market movers' });
    }
});

// ==================== WATCHLISTS ====================

/**
 * Create watchlist
 * POST /api/investments/watchlists
 */
router.post('/watchlists', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = watchlistSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const watchlist = await investmentService.createWatchlist(
            req.user.id,
            value.name,
            value.description
        );

        res.json({
            success: true,
            watchlist
        });
    } catch (error) {
        logger.error('Create watchlist error:', error);
        res.status(500).json({ error: 'Failed to create watchlist' });
    }
});

/**
 * Get user's watchlists
 * GET /api/investments/watchlists
 */
router.get('/watchlists', authenticateJWT, async (req, res) => {
    try {
        const [watchlists] = await db.sequelize.query(
            `SELECT
                w.*,
                COUNT(wi.id) as item_count
             FROM watchlists w
             LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
             WHERE w.user_id = :userId
             GROUP BY w.id
             ORDER BY w.is_default DESC, w.created_at DESC`,
            { replacements: { userId: req.user.id } }
        );

        res.json({
            success: true,
            watchlists
        });
    } catch (error) {
        logger.error('Get watchlists error:', error);
        res.status(500).json({ error: 'Failed to get watchlists' });
    }
});

/**
 * Get watchlist details
 * GET /api/investments/watchlists/:watchlistId
 */
router.get('/watchlists/:watchlistId', authenticateJWT, async (req, res) => {
    try {
        const watchlist = await investmentService.getWatchlist(
            req.params.watchlistId,
            req.user.id
        );

        res.json({
            success: true,
            watchlist
        });
    } catch (error) {
        logger.error('Get watchlist error:', error);
        res.status(500).json({ error: 'Failed to get watchlist' });
    }
});

/**
 * Add to watchlist
 * POST /api/investments/watchlists/:watchlistId/add
 */
router.post('/watchlists/:watchlistId/add', authenticateJWT, async (req, res) => {
    try {
        const { securityId } = req.body;

        if (!securityId) {
            return res.status(400).json({ error: 'Security ID required' });
        }

        await investmentService.addToWatchlist(
            req.params.watchlistId,
            securityId,
            req.user.id
        );

        res.json({
            success: true,
            message: 'Added to watchlist'
        });
    } catch (error) {
        logger.error('Add to watchlist error:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

/**
 * Remove from watchlist
 * DELETE /api/investments/watchlists/:watchlistId/remove/:securityId
 */
router.delete('/watchlists/:watchlistId/remove/:securityId', authenticateJWT, async (req, res) => {
    try {
        // Verify ownership
        const [[watchlist]] = await db.sequelize.query(
            `SELECT id FROM watchlists WHERE id = :watchlistId AND user_id = :userId`,
            {
                replacements: {
                    watchlistId: req.params.watchlistId,
                    userId: req.user.id
                }
            }
        );

        if (!watchlist) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }

        // Remove item
        await db.sequelize.query(
            `DELETE FROM watchlist_items
             WHERE watchlist_id = :watchlistId AND security_id = :securityId`,
            {
                replacements: {
                    watchlistId: req.params.watchlistId,
                    securityId: req.params.securityId
                }
            }
        );

        res.json({
            success: true,
            message: 'Removed from watchlist'
        });
    } catch (error) {
        logger.error('Remove from watchlist error:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

// ==================== RECURRING INVESTMENTS ====================

/**
 * Create recurring investment
 * POST /api/investments/recurring
 */
router.post('/recurring', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = recurringInvestmentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const recurringInvestment = await investmentService.createRecurringInvestment(
            value.accountId,
            value.amount,
            value.frequency,
            value.allocationData,
            req.user.id
        );

        res.json({
            success: true,
            recurringInvestment
        });
    } catch (error) {
        logger.error('Create recurring investment error:', error);
        res.status(500).json({ error: 'Failed to create recurring investment' });
    }
});

/**
 * Get recurring investments
 * GET /api/investments/recurring
 */
router.get('/recurring', authenticateJWT, async (req, res) => {
    try {
        const [recurringInvestments] = await db.sequelize.query(
            `SELECT
                ri.*,
                ia.account_number
             FROM recurring_investments ri
             JOIN investment_accounts ia ON ri.account_id = ia.id
             WHERE ia.user_id = :userId
             AND ri.status = 'active'
             ORDER BY ri.created_at DESC`,
            { replacements: { userId: req.user.id } }
        );

        res.json({
            success: true,
            recurringInvestments
        });
    } catch (error) {
        logger.error('Get recurring investments error:', error);
        res.status(500).json({ error: 'Failed to get recurring investments' });
    }
});

/**
 * Cancel recurring investment
 * DELETE /api/investments/recurring/:recurringId
 */
router.delete('/recurring/:recurringId', authenticateJWT, async (req, res) => {
    try {
        await db.sequelize.query(
            `UPDATE recurring_investments ri
             SET status = 'cancelled',
                 updated_at = CURRENT_TIMESTAMP
             FROM investment_accounts ia
             WHERE ri.account_id = ia.id
             AND ri.id = :recurringId
             AND ia.user_id = :userId`,
            {
                replacements: {
                    recurringId: req.params.recurringId,
                    userId: req.user.id
                }
            }
        );

        res.json({
            success: true,
            message: 'Recurring investment cancelled'
        });
    } catch (error) {
        logger.error('Cancel recurring investment error:', error);
        res.status(500).json({ error: 'Failed to cancel recurring investment' });
    }
});

// ==================== TAX REPORTING ====================

/**
 * Get capital gains report
 * GET /api/investments/tax/capital-gains
 */
router.get('/tax/capital-gains', authenticateJWT, async (req, res) => {
    try {
        const { year = new Date().getFullYear(), accountId } = req.query;

        let accountFilter = '';
        if (accountId) {
            accountFilter = 'AND cg.account_id = :accountId';
        }

        const [gains] = await db.sequelize.query(
            `SELECT
                cg.*,
                s.symbol,
                s.name,
                ia.account_number
             FROM capital_gains cg
             JOIN securities s ON cg.security_id = s.id
             JOIN investment_accounts ia ON cg.account_id = ia.id
             WHERE ia.user_id = :userId
             AND cg.tax_year = :year
             ${accountFilter}
             ORDER BY cg.sale_date DESC`,
            {
                replacements: {
                    userId: req.user.id,
                    year: parseInt(year),
                    accountId
                }
            }
        );

        // Calculate summary
        const summary = {
            shortTermGains: 0,
            shortTermLosses: 0,
            longTermGains: 0,
            longTermLosses: 0,
            netShortTerm: 0,
            netLongTerm: 0,
            totalNet: 0
        };

        gains.forEach(gain => {
            if (gain.holding_period === 'short_term') {
                if (gain.gain_loss > 0) {
                    summary.shortTermGains += parseFloat(gain.gain_loss);
                } else {
                    summary.shortTermLosses += Math.abs(parseFloat(gain.gain_loss));
                }
            } else {
                if (gain.gain_loss > 0) {
                    summary.longTermGains += parseFloat(gain.gain_loss);
                } else {
                    summary.longTermLosses += Math.abs(parseFloat(gain.gain_loss));
                }
            }
        });

        summary.netShortTerm = summary.shortTermGains - summary.shortTermLosses;
        summary.netLongTerm = summary.longTermGains - summary.longTermLosses;
        summary.totalNet = summary.netShortTerm + summary.netLongTerm;

        res.json({
            success: true,
            year,
            summary,
            gains
        });
    } catch (error) {
        logger.error('Get capital gains report error:', error);
        res.status(500).json({ error: 'Failed to get capital gains report' });
    }
});

/**
 * Get dividend report
 * GET /api/investments/tax/dividends
 */
router.get('/tax/dividends', authenticateJWT, async (req, res) => {
    try {
        const { year = new Date().getFullYear(), accountId } = req.query;

        let accountFilter = '';
        if (accountId) {
            accountFilter = 'AND dr.account_id = :accountId';
        }

        const [dividends] = await db.sequelize.query(
            `SELECT
                dr.*,
                s.symbol,
                s.name,
                ia.account_number
             FROM dividend_receipts dr
             JOIN securities s ON dr.security_id = s.id
             JOIN investment_accounts ia ON dr.account_id = ia.id
             WHERE ia.user_id = :userId
             AND EXTRACT(YEAR FROM dr.payment_date) = :year
             ${accountFilter}
             ORDER BY dr.payment_date DESC`,
            {
                replacements: {
                    userId: req.user.id,
                    year: parseInt(year),
                    accountId
                }
            }
        );

        const summary = {
            totalDividends: dividends.reduce((sum, d) => sum + parseFloat(d.total_amount), 0),
            totalTaxWithheld: dividends.reduce((sum, d) => sum + parseFloat(d.tax_withheld), 0),
            netReceived: dividends.reduce((sum, d) => sum + parseFloat(d.net_amount), 0)
        };

        res.json({
            success: true,
            year,
            summary,
            dividends
        });
    } catch (error) {
        logger.error('Get dividend report error:', error);
        res.status(500).json({ error: 'Failed to get dividend report' });
    }
});

// ==================== ANALYTICS ====================

/**
 * Get investment analytics
 * GET /api/investments/analytics
 */
router.get('/analytics', authenticateJWT, async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        // Get all user accounts
        const [accounts] = await db.sequelize.query(
            `SELECT id FROM investment_accounts WHERE user_id = :userId AND status = 'active'`,
            { replacements: { userId: req.user.id } }
        );

        if (accounts.length === 0) {
            return res.json({
                success: true,
                analytics: {
                    totalValue: 0,
                    totalGainLoss: 0,
                    trades: 0,
                    dividends: 0
                }
            });
        }

        const accountIds = accounts.map(a => a.id);

        // Calculate total portfolio value
        const [[totals]] = await db.sequelize.query(
            `SELECT
                SUM(cash_balance + invested_balance) as total_value
             FROM investment_accounts
             WHERE id IN (:accountIds)`,
            { replacements: { accountIds } }
        );

        // Get trade statistics
        const [[trades]] = await db.sequelize.query(
            `SELECT
                COUNT(*) as count,
                SUM(total_amount) as volume
             FROM investment_orders
             WHERE account_id IN (:accountIds)
             AND status = 'filled'
             AND filled_at >= CURRENT_DATE - INTERVAL '${period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}'`,
            { replacements: { accountIds } }
        );

        // Get dividend income
        const [[dividends]] = await db.sequelize.query(
            `SELECT
                COALESCE(SUM(net_amount), 0) as total
             FROM dividend_receipts
             WHERE account_id IN (:accountIds)
             AND payment_date >= CURRENT_DATE - INTERVAL '${period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}'`,
            { replacements: { accountIds } }
        );

        res.json({
            success: true,
            analytics: {
                totalValue: parseFloat(totals?.total_value || 0),
                tradeCount: parseInt(trades?.count || 0),
                tradeVolume: parseFloat(trades?.volume || 0),
                dividendIncome: parseFloat(dividends?.total || 0),
                period
            }
        });
    } catch (error) {
        logger.error('Get investment analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

export default router;