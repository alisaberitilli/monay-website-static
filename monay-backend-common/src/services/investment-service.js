/**
 * Investment Service
 * Consumer Wallet Phase 3 Day 14 Implementation
 * Handles stock trading, ETFs, mutual funds, portfolio management
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';
import { publishToQueue } from './kafka.js';
import NotificationService from './notificationService.js';
import { trackMetrics } from './analytics.js';
import logger from './logger.js';
import axios from 'axios';

class InvestmentService {
    constructor() {
        this.notificationService = new NotificationService();
        this.marketDataCache = new Map();
        this.orderQueue = new Map();
    }

    // ==================== ACCOUNT MANAGEMENT ====================

    /**
     * Create investment account
     */
    async createInvestmentAccount(userId, accountType, options = {}) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                riskProfile = 'moderate',
                marginEnabled = false,
                optionsEnabled = false,
                cryptoEnabled = false
            } = options;

            // Check if user already has account of this type
            const [[existing]] = await db.sequelize.query(
                `SELECT id FROM investment_accounts
                 WHERE user_id = :userId AND account_type = :accountType
                 AND status != 'closed'`,
                { replacements: { userId, accountType }, transaction }
            );

            if (existing) {
                throw new Error(`Active ${accountType} account already exists`);
            }

            // Generate account number
            const accountNumber = await this.generateAccountNumber();

            // Create account
            const accountId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO investment_accounts
                 (id, user_id, account_number, account_type, risk_profile,
                  margin_enabled, options_enabled, crypto_enabled, status)
                 VALUES (:id, :userId, :accountNumber, :accountType, :riskProfile,
                  :marginEnabled, :optionsEnabled, :cryptoEnabled, 'pending_approval')`,
                {
                    replacements: {
                        id: accountId,
                        userId,
                        accountNumber,
                        accountType,
                        riskProfile,
                        marginEnabled,
                        optionsEnabled,
                        cryptoEnabled
                    },
                    transaction
                }
            );

            // Perform KYC verification (simulated)
            await this.performKYCVerification(accountId, userId, transaction);

            await transaction.commit();

            // Send welcome notification
            await this.notificationService.sendNotification(userId, {
                type: 'investment_account_created',
                title: 'Investment Account Created',
                message: `Your ${accountType} investment account has been created`,
                data: { accountId, accountNumber }
            });

            return { id: accountId, accountNumber, status: 'pending_approval' };
        } catch (error) {
            await transaction.rollback();
            logger.error('Create investment account error:', error);
            throw error;
        }
    }

    /**
     * Get account details with holdings
     */
    async getAccountDetails(accountId, userId) {
        try {
            // Get account info
            const [[account]] = await db.sequelize.query(
                `SELECT * FROM investment_accounts
                 WHERE id = :accountId AND user_id = :userId`,
                { replacements: { accountId, userId } }
            );

            if (!account) {
                throw new Error('Account not found');
            }

            // Get holdings
            const [holdings] = await db.sequelize.query(
                `SELECT
                    ph.*,
                    s.symbol,
                    s.name,
                    s.security_type,
                    s.current_price
                 FROM portfolio_holdings ph
                 JOIN securities s ON ph.security_id = s.id
                 WHERE ph.account_id = :accountId
                 ORDER BY ph.current_value DESC`,
                { replacements: { accountId } }
            );

            // Calculate totals
            const totalValue = account.cash_balance +
                holdings.reduce((sum, h) => sum + parseFloat(h.current_value || 0), 0);

            const unrealizedGainLoss =
                holdings.reduce((sum, h) => sum + parseFloat(h.unrealized_gain_loss || 0), 0);

            return {
                ...account,
                holdings,
                totalValue,
                unrealizedGainLoss,
                holdingsCount: holdings.length
            };
        } catch (error) {
            logger.error('Get account details error:', error);
            throw error;
        }
    }

    // ==================== ORDER MANAGEMENT ====================

    /**
     * Place market order
     */
    async placeMarketOrder(accountId, securityId, side, quantity, userId) {
        const transaction = await db.sequelize.transaction();

        try {
            // Validate account
            const [[account]] = await db.sequelize.query(
                `SELECT * FROM investment_accounts
                 WHERE id = :accountId AND user_id = :userId AND status = 'active'`,
                { replacements: { accountId, userId }, transaction }
            );

            if (!account) {
                throw new Error('Active account not found');
            }

            // Get security details
            const [[security]] = await db.sequelize.query(
                `SELECT * FROM securities WHERE id = :securityId AND tradeable = true`,
                { replacements: { securityId }, transaction }
            );

            if (!security) {
                throw new Error('Security not tradeable');
            }

            // Validate quantity for fractional shares
            if (!security.fractional_allowed && quantity % 1 !== 0) {
                throw new Error('Fractional shares not allowed for this security');
            }

            // Calculate order value
            const orderValue = quantity * security.current_price;
            const commission = this.calculateCommission(orderValue);

            // Validate buying power for buy orders
            if (side === 'buy') {
                const requiredAmount = orderValue + commission;
                if (account.cash_balance < requiredAmount) {
                    throw new Error(`Insufficient funds. Required: $${requiredAmount.toFixed(2)}`);
                }
            }

            // Validate shares available for sell orders
            if (side === 'sell') {
                const [[holding]] = await db.sequelize.query(
                    `SELECT * FROM portfolio_holdings
                     WHERE account_id = :accountId AND security_id = :securityId`,
                    { replacements: { accountId, securityId }, transaction }
                );

                if (!holding || holding.quantity < quantity) {
                    throw new Error('Insufficient shares to sell');
                }
            }

            // Create order
            const orderId = uuidv4();
            const orderReference = await this.generateOrderReference();

            await db.sequelize.query(
                `INSERT INTO investment_orders
                 (id, account_id, security_id, order_type, side, quantity,
                  status, order_reference, time_in_force)
                 VALUES (:id, :accountId, :securityId, 'market', :side, :quantity,
                  'submitted', :orderReference, 'day')`,
                {
                    replacements: {
                        id: orderId,
                        accountId,
                        securityId,
                        side,
                        quantity,
                        orderReference
                    },
                    transaction
                }
            );

            // Execute market order immediately
            await this.executeMarketOrder(
                orderId,
                accountId,
                securityId,
                side,
                quantity,
                security.current_price,
                commission,
                transaction
            );

            await transaction.commit();

            // Send notification
            await this.notificationService.sendNotification(userId, {
                type: 'order_executed',
                title: 'Order Executed',
                message: `${side === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${security.symbol}`,
                data: { orderId, symbol: security.symbol, quantity, price: security.current_price }
            });

            return {
                id: orderId,
                orderReference,
                status: 'filled',
                executedPrice: security.current_price,
                totalAmount: orderValue
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Place market order error:', error);
            throw error;
        }
    }

    /**
     * Place limit order
     */
    async placeLimitOrder(accountId, securityId, side, quantity, limitPrice, userId, options = {}) {
        const transaction = await db.sequelize.transaction();

        try {
            const { timeInForce = 'day' } = options;

            // Validate account and security (similar to market order)
            const [[account]] = await db.sequelize.query(
                `SELECT * FROM investment_accounts
                 WHERE id = :accountId AND user_id = :userId AND status = 'active'`,
                { replacements: { accountId, userId }, transaction }
            );

            if (!account) {
                throw new Error('Active account not found');
            }

            // Create limit order
            const orderId = uuidv4();
            const orderReference = await this.generateOrderReference();

            await db.sequelize.query(
                `INSERT INTO investment_orders
                 (id, account_id, security_id, order_type, side, quantity,
                  limit_price, status, order_reference, time_in_force)
                 VALUES (:id, :accountId, :securityId, 'limit', :side, :quantity,
                  :limitPrice, 'submitted', :orderReference, :timeInForce)`,
                {
                    replacements: {
                        id: orderId,
                        accountId,
                        securityId,
                        side,
                        quantity,
                        limitPrice,
                        orderReference,
                        timeInForce
                    },
                    transaction
                }
            );

            // Reserve funds for buy orders
            if (side === 'buy') {
                const requiredAmount = quantity * limitPrice + this.calculateCommission(quantity * limitPrice);
                await db.sequelize.query(
                    `UPDATE investment_accounts
                     SET cash_balance = cash_balance - :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :accountId`,
                    { replacements: { amount: requiredAmount, accountId }, transaction }
                );
            }

            await transaction.commit();

            // Add to order monitoring queue
            this.orderQueue.set(orderId, {
                securityId,
                side,
                limitPrice,
                checkInterval: setInterval(() => this.checkLimitOrder(orderId), 60000) // Check every minute
            });

            return {
                id: orderId,
                orderReference,
                status: 'submitted',
                limitPrice,
                quantity
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Place limit order error:', error);
            throw error;
        }
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId, userId) {
        const transaction = await db.sequelize.transaction();

        try {
            // Get order details
            const [[order]] = await db.sequelize.query(
                `SELECT o.*, ia.user_id
                 FROM investment_orders o
                 JOIN investment_accounts ia ON o.account_id = ia.id
                 WHERE o.id = :orderId AND ia.user_id = :userId
                 AND o.status IN ('pending', 'submitted', 'partial')`,
                { replacements: { orderId, userId }, transaction }
            );

            if (!order) {
                throw new Error('Order not found or cannot be cancelled');
            }

            // Update order status
            await db.sequelize.query(
                `UPDATE investment_orders
                 SET status = 'cancelled',
                     cancelled_at = CURRENT_TIMESTAMP
                 WHERE id = :orderId`,
                { replacements: { orderId }, transaction }
            );

            // Release reserved funds for buy limit orders
            if (order.order_type === 'limit' && order.side === 'buy') {
                const reservedAmount = (order.quantity - order.filled_quantity) * order.limit_price;
                await db.sequelize.query(
                    `UPDATE investment_accounts
                     SET cash_balance = cash_balance + :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :accountId`,
                    { replacements: { amount: reservedAmount, accountId: order.account_id }, transaction }
                );
            }

            await transaction.commit();

            // Remove from monitoring queue
            if (this.orderQueue.has(orderId)) {
                clearInterval(this.orderQueue.get(orderId).checkInterval);
                this.orderQueue.delete(orderId);
            }

            return { orderId, status: 'cancelled' };
        } catch (error) {
            await transaction.rollback();
            logger.error('Cancel order error:', error);
            throw error;
        }
    }

    /**
     * Execute market order
     */
    async executeMarketOrder(orderId, accountId, securityId, side, quantity, price, commission, transaction) {
        try {
            const totalAmount = quantity * price;

            // Create trade execution
            const executionId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO trade_executions
                 (id, order_id, account_id, security_id, side, quantity,
                  price, amount, commission, settlement_date)
                 VALUES (:id, :orderId, :accountId, :securityId, :side, :quantity,
                  :price, :amount, :commission, CURRENT_DATE + INTERVAL '2 days')`,
                {
                    replacements: {
                        id: executionId,
                        orderId,
                        accountId,
                        securityId,
                        side,
                        quantity,
                        price,
                        amount: totalAmount,
                        commission
                    },
                    transaction
                }
            );

            // Update order status
            await db.sequelize.query(
                `UPDATE investment_orders
                 SET status = 'filled',
                     filled_quantity = :quantity,
                     average_fill_price = :price,
                     total_amount = :totalAmount,
                     commission = :commission,
                     filled_at = CURRENT_TIMESTAMP
                 WHERE id = :orderId`,
                {
                    replacements: {
                        orderId,
                        quantity,
                        price,
                        totalAmount,
                        commission
                    },
                    transaction
                }
            );

            if (side === 'buy') {
                // Deduct cash
                await db.sequelize.query(
                    `UPDATE investment_accounts
                     SET cash_balance = cash_balance - :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :accountId`,
                    { replacements: { amount: totalAmount + commission, accountId }, transaction }
                );

                // Add to holdings
                await this.addToHoldings(accountId, securityId, quantity, price, transaction);
            } else {
                // Add cash
                await db.sequelize.query(
                    `UPDATE investment_accounts
                     SET cash_balance = cash_balance + :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :accountId`,
                    { replacements: { amount: totalAmount - commission, accountId }, transaction }
                );

                // Remove from holdings
                await this.removeFromHoldings(accountId, securityId, quantity, price, transaction);
            }

            // Track metrics
            await trackMetrics('investment_trade', {
                orderId,
                accountId,
                securityId,
                side,
                quantity,
                price,
                amount: totalAmount
            });
        } catch (error) {
            logger.error('Execute market order error:', error);
            throw error;
        }
    }

    /**
     * Add to holdings
     */
    async addToHoldings(accountId, securityId, quantity, price, transaction) {
        try {
            const [[existing]] = await db.sequelize.query(
                `SELECT * FROM portfolio_holdings
                 WHERE account_id = :accountId AND security_id = :securityId`,
                { replacements: { accountId, securityId }, transaction }
            );

            if (existing) {
                // Update existing holding
                const newQuantity = parseFloat(existing.quantity) + quantity;
                const newTotalCost = parseFloat(existing.total_cost) + (quantity * price);
                const newAverageCost = newTotalCost / newQuantity;

                await db.sequelize.query(
                    `UPDATE portfolio_holdings
                     SET quantity = :quantity,
                         average_cost = :averageCost,
                         total_cost = :totalCost,
                         last_acquired = CURRENT_DATE,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id`,
                    {
                        replacements: {
                            id: existing.id,
                            quantity: newQuantity,
                            averageCost: newAverageCost,
                            totalCost: newTotalCost
                        },
                        transaction
                    }
                );
            } else {
                // Create new holding
                await db.sequelize.query(
                    `INSERT INTO portfolio_holdings
                     (id, account_id, security_id, quantity, average_cost,
                      total_cost, first_acquired, last_acquired)
                     VALUES (:id, :accountId, :securityId, :quantity, :price,
                      :totalCost, CURRENT_DATE, CURRENT_DATE)`,
                    {
                        replacements: {
                            id: uuidv4(),
                            accountId,
                            securityId,
                            quantity,
                            price,
                            totalCost: quantity * price
                        },
                        transaction
                    }
                );
            }

            // Create tax lot
            await db.sequelize.query(
                `INSERT INTO tax_lots
                 (id, account_id, security_id, acquisition_date, quantity,
                  remaining_quantity, cost_per_share, total_cost)
                 VALUES (:id, :accountId, :securityId, CURRENT_DATE, :quantity,
                  :quantity, :price, :totalCost)`,
                {
                    replacements: {
                        id: uuidv4(),
                        accountId,
                        securityId,
                        quantity,
                        price,
                        totalCost: quantity * price
                    },
                    transaction
                }
            );
        } catch (error) {
            logger.error('Add to holdings error:', error);
            throw error;
        }
    }

    /**
     * Remove from holdings
     */
    async removeFromHoldings(accountId, securityId, quantity, salePrice, transaction) {
        try {
            const [[holding]] = await db.sequelize.query(
                `SELECT * FROM portfolio_holdings
                 WHERE account_id = :accountId AND security_id = :securityId`,
                { replacements: { accountId, securityId }, transaction }
            );

            if (!holding || holding.quantity < quantity) {
                throw new Error('Insufficient shares');
            }

            const newQuantity = parseFloat(holding.quantity) - quantity;

            if (newQuantity === 0) {
                // Remove holding completely
                await db.sequelize.query(
                    `UPDATE portfolio_holdings
                     SET quantity = 0,
                         current_value = 0,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id`,
                    { replacements: { id: holding.id }, transaction }
                );
            } else {
                // Update holding
                const soldCost = quantity * parseFloat(holding.average_cost);
                const newTotalCost = parseFloat(holding.total_cost) - soldCost;

                await db.sequelize.query(
                    `UPDATE portfolio_holdings
                     SET quantity = :quantity,
                         total_cost = :totalCost,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id`,
                    {
                        replacements: {
                            id: holding.id,
                            quantity: newQuantity,
                            totalCost: newTotalCost
                        },
                        transaction
                    }
                );
            }

            // Calculate capital gain/loss
            const costBasis = quantity * parseFloat(holding.average_cost);
            const saleProceeds = quantity * salePrice;
            const gainLoss = saleProceeds - costBasis;

            // Record capital gain
            await db.sequelize.query(
                `INSERT INTO capital_gains
                 (id, account_id, security_id, sale_date, acquisition_date,
                  quantity, sale_proceeds, cost_basis, gain_loss, holding_period, tax_year)
                 VALUES (:id, :accountId, :securityId, CURRENT_DATE, :acquisitionDate,
                  :quantity, :saleProceeds, :costBasis, :gainLoss, :holdingPeriod, :taxYear)`,
                {
                    replacements: {
                        id: uuidv4(),
                        accountId,
                        securityId,
                        acquisitionDate: holding.first_acquired,
                        quantity,
                        saleProceeds,
                        costBasis,
                        gainLoss,
                        holdingPeriod: this.calculateHoldingPeriod(holding.first_acquired),
                        taxYear: new Date().getFullYear()
                    },
                    transaction
                }
            );

            // Update realized gains in holding
            await db.sequelize.query(
                `UPDATE portfolio_holdings
                 SET realized_gain_loss = realized_gain_loss + :gainLoss
                 WHERE id = :id`,
                { replacements: { gainLoss, id: holding.id }, transaction }
            );
        } catch (error) {
            logger.error('Remove from holdings error:', error);
            throw error;
        }
    }

    // ==================== PORTFOLIO MANAGEMENT ====================

    /**
     * Get portfolio summary
     */
    async getPortfolioSummary(accountId, userId) {
        try {
            // Get account
            const [[account]] = await db.sequelize.query(
                `SELECT * FROM investment_accounts
                 WHERE id = :accountId AND user_id = :userId`,
                { replacements: { accountId, userId } }
            );

            if (!account) {
                throw new Error('Account not found');
            }

            // Get holdings with current values
            const [holdings] = await db.sequelize.query(
                `SELECT
                    ph.*,
                    s.symbol,
                    s.name,
                    s.security_type,
                    s.current_price,
                    s.previous_close,
                    (s.current_price - s.previous_close) as daily_change,
                    ((s.current_price - s.previous_close) / s.previous_close * 100) as daily_change_pct
                 FROM portfolio_holdings ph
                 JOIN securities s ON ph.security_id = s.id
                 WHERE ph.account_id = :accountId AND ph.quantity > 0
                 ORDER BY ph.current_value DESC`,
                { replacements: { accountId } }
            );

            // Calculate portfolio metrics
            const totalInvested = holdings.reduce((sum, h) => sum + parseFloat(h.total_cost), 0);
            const currentValue = holdings.reduce((sum, h) => sum + (parseFloat(h.quantity) * parseFloat(h.current_price)), 0);
            const unrealizedGainLoss = currentValue - totalInvested;
            const unrealizedGainLossPct = totalInvested > 0 ? (unrealizedGainLoss / totalInvested * 100) : 0;

            // Get today's performance
            const [[todayPerf]] = await db.sequelize.query(
                `SELECT * FROM portfolio_performance
                 WHERE account_id = :accountId AND date = CURRENT_DATE`,
                { replacements: { accountId } }
            );

            // Get asset allocation
            const assetAllocation = this.calculateAssetAllocation(holdings);

            return {
                accountId,
                cashBalance: parseFloat(account.cash_balance),
                investedValue: currentValue,
                totalValue: parseFloat(account.cash_balance) + currentValue,
                unrealizedGainLoss,
                unrealizedGainLossPct,
                todayGainLoss: todayPerf?.daily_gain_loss || 0,
                todayGainLossPct: todayPerf?.daily_gain_loss_pct || 0,
                holdings: holdings.length,
                assetAllocation
            };
        } catch (error) {
            logger.error('Get portfolio summary error:', error);
            throw error;
        }
    }

    /**
     * Get portfolio performance
     */
    async getPortfolioPerformance(accountId, period = '1M') {
        try {
            let dateFilter = 'CURRENT_DATE - INTERVAL \'30 days\'';
            switch (period) {
                case '1W': dateFilter = 'CURRENT_DATE - INTERVAL \'7 days\''; break;
                case '1M': dateFilter = 'CURRENT_DATE - INTERVAL \'30 days\''; break;
                case '3M': dateFilter = 'CURRENT_DATE - INTERVAL \'90 days\''; break;
                case '1Y': dateFilter = 'CURRENT_DATE - INTERVAL \'1 year\''; break;
                case 'YTD': dateFilter = 'DATE_TRUNC(\'year\', CURRENT_DATE)'; break;
                case 'ALL': dateFilter = '\'1900-01-01\''; break;
            }

            const [performance] = await db.sequelize.query(
                `SELECT
                    date,
                    total_value,
                    daily_gain_loss,
                    daily_gain_loss_pct,
                    deposits,
                    withdrawals
                 FROM portfolio_performance
                 WHERE account_id = :accountId
                 AND date >= ${dateFilter}
                 ORDER BY date ASC`,
                { replacements: { accountId } }
            );

            return performance;
        } catch (error) {
            logger.error('Get portfolio performance error:', error);
            throw error;
        }
    }

    /**
     * Calculate asset allocation
     */
    calculateAssetAllocation(holdings) {
        const allocation = {
            stocks: 0,
            etfs: 0,
            mutualFunds: 0,
            bonds: 0,
            crypto: 0,
            other: 0
        };

        const totalValue = holdings.reduce((sum, h) =>
            sum + (parseFloat(h.quantity) * parseFloat(h.current_price)), 0);

        if (totalValue === 0) return allocation;

        holdings.forEach(h => {
            const value = parseFloat(h.quantity) * parseFloat(h.current_price);
            const percentage = (value / totalValue) * 100;

            switch (h.security_type) {
                case 'stock': allocation.stocks += percentage; break;
                case 'etf': allocation.etfs += percentage; break;
                case 'mutual_fund': allocation.mutualFunds += percentage; break;
                case 'bond': allocation.bonds += percentage; break;
                case 'crypto': allocation.crypto += percentage; break;
                default: allocation.other += percentage;
            }
        });

        // Round percentages
        Object.keys(allocation).forEach(key => {
            allocation[key] = Math.round(allocation[key] * 100) / 100;
        });

        return allocation;
    }

    // ==================== MARKET DATA ====================

    /**
     * Get market quote
     */
    async getMarketQuote(symbol) {
        try {
            // Check cache first
            const cached = this.marketDataCache.get(symbol);
            if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
                return cached.data;
            }

            // Get from database
            const [[quote]] = await db.sequelize.query(
                `SELECT
                    s.*,
                    mq.bid_price,
                    mq.ask_price,
                    mq.bid_size,
                    mq.ask_size,
                    mq.volume,
                    mq.change_amount,
                    mq.change_percent
                 FROM securities s
                 LEFT JOIN market_quotes mq ON s.id = mq.security_id
                 WHERE s.symbol = :symbol`,
                { replacements: { symbol } }
            );

            if (!quote) {
                throw new Error('Symbol not found');
            }

            // Cache the result
            this.marketDataCache.set(symbol, {
                data: quote,
                timestamp: Date.now()
            });

            return quote;
        } catch (error) {
            logger.error('Get market quote error:', error);
            throw error;
        }
    }

    /**
     * Search securities
     */
    async searchSecurities(searchTerm, type = 'all') {
        try {
            let typeFilter = '';
            if (type !== 'all') {
                typeFilter = 'AND security_type = :type';
            }

            const [results] = await db.sequelize.query(
                `SELECT
                    id,
                    symbol,
                    name,
                    security_type,
                    current_price,
                    change_percent,
                    market_cap
                 FROM securities
                 WHERE (
                    LOWER(symbol) LIKE :term OR
                    LOWER(name) LIKE :term
                 )
                 ${typeFilter}
                 AND tradeable = true
                 ORDER BY
                    CASE WHEN LOWER(symbol) = LOWER(:exactTerm) THEN 0 ELSE 1 END,
                    market_cap DESC NULLS LAST
                 LIMIT 20`,
                {
                    replacements: {
                        term: `%${searchTerm.toLowerCase()}%`,
                        exactTerm: searchTerm,
                        type
                    }
                }
            );

            return results;
        } catch (error) {
            logger.error('Search securities error:', error);
            throw error;
        }
    }

    /**
     * Get price history
     */
    async getPriceHistory(securityId, period = '1M') {
        try {
            let dateFilter = 'CURRENT_DATE - INTERVAL \'30 days\'';
            switch (period) {
                case '1D': dateFilter = 'CURRENT_DATE - INTERVAL \'1 day\''; break;
                case '1W': dateFilter = 'CURRENT_DATE - INTERVAL \'7 days\''; break;
                case '1M': dateFilter = 'CURRENT_DATE - INTERVAL \'30 days\''; break;
                case '3M': dateFilter = 'CURRENT_DATE - INTERVAL \'90 days\''; break;
                case '1Y': dateFilter = 'CURRENT_DATE - INTERVAL \'1 year\''; break;
                case '5Y': dateFilter = 'CURRENT_DATE - INTERVAL \'5 years\''; break;
            }

            const [history] = await db.sequelize.query(
                `SELECT
                    date,
                    open,
                    high,
                    low,
                    close,
                    volume
                 FROM price_history
                 WHERE security_id = :securityId
                 AND date >= ${dateFilter}
                 ORDER BY date ASC`,
                { replacements: { securityId } }
            );

            return history;
        } catch (error) {
            logger.error('Get price history error:', error);
            throw error;
        }
    }

    // ==================== WATCHLISTS ====================

    /**
     * Create watchlist
     */
    async createWatchlist(userId, name, description = null) {
        try {
            const watchlistId = uuidv4();

            await db.sequelize.query(
                `INSERT INTO watchlists (id, user_id, name, description)
                 VALUES (:id, :userId, :name, :description)`,
                {
                    replacements: {
                        id: watchlistId,
                        userId,
                        name,
                        description
                    }
                }
            );

            return { id: watchlistId, name };
        } catch (error) {
            logger.error('Create watchlist error:', error);
            throw error;
        }
    }

    /**
     * Add to watchlist
     */
    async addToWatchlist(watchlistId, securityId, userId) {
        try {
            // Verify ownership
            const [[watchlist]] = await db.sequelize.query(
                `SELECT id FROM watchlists WHERE id = :watchlistId AND user_id = :userId`,
                { replacements: { watchlistId, userId } }
            );

            if (!watchlist) {
                throw new Error('Watchlist not found');
            }

            // Add security
            await db.sequelize.query(
                `INSERT INTO watchlist_items (id, watchlist_id, security_id)
                 VALUES (:id, :watchlistId, :securityId)
                 ON CONFLICT (watchlist_id, security_id) DO NOTHING`,
                {
                    replacements: {
                        id: uuidv4(),
                        watchlistId,
                        securityId
                    }
                }
            );

            return { success: true };
        } catch (error) {
            logger.error('Add to watchlist error:', error);
            throw error;
        }
    }

    /**
     * Get watchlist
     */
    async getWatchlist(watchlistId, userId) {
        try {
            const [[watchlist]] = await db.sequelize.query(
                `SELECT * FROM watchlists WHERE id = :watchlistId AND user_id = :userId`,
                { replacements: { watchlistId, userId } }
            );

            if (!watchlist) {
                throw new Error('Watchlist not found');
            }

            const [items] = await db.sequelize.query(
                `SELECT
                    wi.*,
                    s.symbol,
                    s.name,
                    s.current_price,
                    s.previous_close,
                    (s.current_price - s.previous_close) as change_amount,
                    ((s.current_price - s.previous_close) / s.previous_close * 100) as change_percent
                 FROM watchlist_items wi
                 JOIN securities s ON wi.security_id = s.id
                 WHERE wi.watchlist_id = :watchlistId
                 ORDER BY wi.sort_order, wi.added_at DESC`,
                { replacements: { watchlistId } }
            );

            return {
                ...watchlist,
                items
            };
        } catch (error) {
            logger.error('Get watchlist error:', error);
            throw error;
        }
    }

    // ==================== DIVIDENDS ====================

    /**
     * Process dividend payment
     */
    async processDividendPayment(dividendId) {
        const transaction = await db.sequelize.transaction();

        try {
            // Get dividend details
            const [[dividend]] = await db.sequelize.query(
                `SELECT * FROM dividends WHERE id = :dividendId`,
                { replacements: { dividendId }, transaction }
            );

            if (!dividend) {
                throw new Error('Dividend not found');
            }

            // Get all holders of this security
            const [holders] = await db.sequelize.query(
                `SELECT
                    ph.*,
                    ia.dividend_reinvestment
                 FROM portfolio_holdings ph
                 JOIN investment_accounts ia ON ph.account_id = ia.id
                 WHERE ph.security_id = :securityId AND ph.quantity > 0`,
                { replacements: { securityId: dividend.security_id }, transaction }
            );

            for (const holder of holders) {
                const dividendAmount = holder.quantity * dividend.amount_per_share;
                const taxWithheld = dividendAmount * 0.15; // 15% withholding tax
                const netAmount = dividendAmount - taxWithheld;

                // Create dividend receipt
                const receiptId = uuidv4();
                await db.sequelize.query(
                    `INSERT INTO dividend_receipts
                     (id, account_id, dividend_id, security_id, shares_held,
                      amount_per_share, total_amount, tax_withheld, net_amount,
                      reinvested, payment_date)
                     VALUES (:id, :accountId, :dividendId, :securityId, :sharesHeld,
                      :amountPerShare, :totalAmount, :taxWithheld, :netAmount,
                      :reinvested, :paymentDate)`,
                    {
                        replacements: {
                            id: receiptId,
                            accountId: holder.account_id,
                            dividendId,
                            securityId: dividend.security_id,
                            sharesHeld: holder.quantity,
                            amountPerShare: dividend.amount_per_share,
                            totalAmount: dividendAmount,
                            taxWithheld,
                            netAmount,
                            reinvested: holder.dividend_reinvestment,
                            paymentDate: dividend.payment_date
                        },
                        transaction
                    }
                );

                if (holder.dividend_reinvestment) {
                    // Reinvest dividend
                    const [[security]] = await db.sequelize.query(
                        `SELECT current_price FROM securities WHERE id = :securityId`,
                        { replacements: { securityId: dividend.security_id }, transaction }
                    );

                    const sharesPurchased = netAmount / security.current_price;

                    // Update dividend receipt with reinvestment info
                    await db.sequelize.query(
                        `UPDATE dividend_receipts
                         SET reinvestment_price = :price,
                             reinvestment_shares = :shares
                         WHERE id = :receiptId`,
                        {
                            replacements: {
                                price: security.current_price,
                                shares: sharesPurchased,
                                receiptId
                            },
                            transaction
                        }
                    );

                    // Add shares to holdings
                    await this.addToHoldings(
                        holder.account_id,
                        dividend.security_id,
                        sharesPurchased,
                        security.current_price,
                        transaction
                    );
                } else {
                    // Add cash to account
                    await db.sequelize.query(
                        `UPDATE investment_accounts
                         SET cash_balance = cash_balance + :amount,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = :accountId`,
                        { replacements: { amount: netAmount, accountId: holder.account_id }, transaction }
                    );
                }
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            logger.error('Process dividend payment error:', error);
            throw error;
        }
    }

    // ==================== RECURRING INVESTMENTS ====================

    /**
     * Create recurring investment plan
     */
    async createRecurringInvestment(accountId, amount, frequency, allocationData, userId) {
        try {
            // Validate account
            const [[account]] = await db.sequelize.query(
                `SELECT id FROM investment_accounts
                 WHERE id = :accountId AND user_id = :userId AND status = 'active'`,
                { replacements: { accountId, userId } }
            );

            if (!account) {
                throw new Error('Active account not found');
            }

            const recurringId = uuidv4();
            const nextDate = this.calculateNextInvestmentDate(frequency);

            await db.sequelize.query(
                `INSERT INTO recurring_investments
                 (id, account_id, frequency, amount, allocation_strategy,
                  allocation_data, next_investment_date, status)
                 VALUES (:id, :accountId, :frequency, :amount, :strategy,
                  :allocationData, :nextDate, 'active')`,
                {
                    replacements: {
                        id: recurringId,
                        accountId,
                        frequency,
                        amount,
                        strategy: allocationData.strategy || 'portfolio',
                        allocationData: JSON.stringify(allocationData),
                        nextDate
                    }
                }
            );

            return { id: recurringId, nextInvestmentDate: nextDate };
        } catch (error) {
            logger.error('Create recurring investment error:', error);
            throw error;
        }
    }

    /**
     * Execute recurring investments
     */
    async executeRecurringInvestments() {
        try {
            // Get due recurring investments
            const [dueInvestments] = await db.sequelize.query(
                `SELECT * FROM recurring_investments
                 WHERE status = 'active'
                 AND next_investment_date <= CURRENT_DATE`
            );

            for (const investment of dueInvestments) {
                try {
                    await this.executeRecurringInvestment(investment);
                } catch (error) {
                    logger.error(`Failed to execute recurring investment ${investment.id}:`, error);
                }
            }
        } catch (error) {
            logger.error('Execute recurring investments error:', error);
        }
    }

    /**
     * Execute single recurring investment
     */
    async executeRecurringInvestment(investment) {
        const transaction = await db.sequelize.transaction();

        try {
            const allocationData = JSON.parse(investment.allocation_data);

            // Check account balance
            const [[account]] = await db.sequelize.query(
                `SELECT * FROM investment_accounts WHERE id = :accountId`,
                { replacements: { accountId: investment.account_id }, transaction }
            );

            if (account.cash_balance < investment.amount) {
                logger.warn(`Insufficient funds for recurring investment ${investment.id}`);
                return;
            }

            // Execute based on strategy
            if (investment.allocation_strategy === 'single_security') {
                // Buy single security
                await this.placeMarketOrder(
                    investment.account_id,
                    allocationData.securityId,
                    'buy',
                    investment.amount / allocationData.price, // Calculate shares
                    account.user_id
                );
            } else if (investment.allocation_strategy === 'portfolio') {
                // Buy multiple securities based on allocation
                for (const allocation of allocationData.allocations) {
                    const orderAmount = investment.amount * (allocation.percentage / 100);
                    const shares = orderAmount / allocation.price;

                    await this.placeMarketOrder(
                        investment.account_id,
                        allocation.securityId,
                        'buy',
                        shares,
                        account.user_id
                    );
                }
            }

            // Update next investment date
            const nextDate = this.calculateNextInvestmentDate(investment.frequency, investment.next_investment_date);
            await db.sequelize.query(
                `UPDATE recurring_investments
                 SET next_investment_date = :nextDate,
                     last_investment_date = CURRENT_DATE,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :id`,
                { replacements: { nextDate, id: investment.id }, transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            logger.error('Execute recurring investment error:', error);
            throw error;
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Generate account number
     */
    async generateAccountNumber() {
        return 'INV' + Math.random().toString().substr(2, 9);
    }

    /**
     * Generate order reference
     */
    async generateOrderReference() {
        return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    /**
     * Calculate commission
     */
    calculateCommission(orderValue) {
        // Simple commission structure: $0 for now (commission-free trading)
        return 0;
    }

    /**
     * Calculate holding period
     */
    calculateHoldingPeriod(acquisitionDate) {
        const days = Math.floor((new Date() - new Date(acquisitionDate)) / (1000 * 60 * 60 * 24));
        return days > 365 ? 'long_term' : 'short_term';
    }

    /**
     * Calculate next investment date
     */
    calculateNextInvestmentDate(frequency, fromDate = null) {
        const startDate = fromDate ? new Date(fromDate) : new Date();

        switch (frequency) {
            case 'daily':
                startDate.setDate(startDate.getDate() + 1);
                break;
            case 'weekly':
                startDate.setDate(startDate.getDate() + 7);
                break;
            case 'biweekly':
                startDate.setDate(startDate.getDate() + 14);
                break;
            case 'monthly':
                startDate.setMonth(startDate.getMonth() + 1);
                break;
            case 'quarterly':
                startDate.setMonth(startDate.getMonth() + 3);
                break;
        }

        return startDate.toISOString().split('T')[0];
    }

    /**
     * Perform KYC verification (simulated)
     */
    async performKYCVerification(accountId, userId, transaction) {
        // Simulated KYC - in production, integrate with real KYC provider
        await db.sequelize.query(
            `UPDATE investment_accounts
             SET kyc_verified = true,
                 status = 'active',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :accountId`,
            { replacements: { accountId }, transaction }
        );
    }

    /**
     * Check limit order
     */
    async checkLimitOrder(orderId) {
        try {
            const [[order]] = await db.sequelize.query(
                `SELECT o.*, s.current_price
                 FROM investment_orders o
                 JOIN securities s ON o.security_id = s.id
                 WHERE o.id = :orderId AND o.status = 'submitted'`,
                { replacements: { orderId } }
            );

            if (!order) return;

            // Check if limit price is met
            const shouldExecute = (order.side === 'buy' && order.current_price <= order.limit_price) ||
                                (order.side === 'sell' && order.current_price >= order.limit_price);

            if (shouldExecute) {
                // Execute the order
                await this.executeLimitOrder(order);

                // Remove from monitoring
                clearInterval(this.orderQueue.get(orderId).checkInterval);
                this.orderQueue.delete(orderId);
            }
        } catch (error) {
            logger.error('Check limit order error:', error);
        }
    }

    /**
     * Execute limit order
     */
    async executeLimitOrder(order) {
        const transaction = await db.sequelize.transaction();

        try {
            await this.executeMarketOrder(
                order.id,
                order.account_id,
                order.security_id,
                order.side,
                order.quantity,
                order.limit_price,
                this.calculateCommission(order.quantity * order.limit_price),
                transaction
            );

            await transaction.commit();

            // Send notification
            await this.notificationService.sendNotification(order.user_id, {
                type: 'limit_order_executed',
                title: 'Limit Order Executed',
                message: `Your limit order for ${order.symbol} has been executed`,
                data: { orderId: order.id }
            });
        } catch (error) {
            await transaction.rollback();
            logger.error('Execute limit order error:', error);
        }
    }
}

export default new InvestmentService();