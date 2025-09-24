const { Pool } = require('pg');
const crypto = require('crypto');
const EventEmitter = require('events');

class CapitalMarketsTradingEngine extends EventEmitter {
  constructor(dbConfig) {
    super();
    this.pool = new Pool(dbConfig);

    // Order types
    this.orderTypes = {
      MARKET: 'market',
      LIMIT: 'limit',
      STOP: 'stop',
      STOP_LIMIT: 'stop_limit',
      TRAILING_STOP: 'trailing_stop',
      ICEBERG: 'iceberg',
      TWAP: 'twap', // Time-Weighted Average Price
      VWAP: 'vwap', // Volume-Weighted Average Price
      PEG: 'peg'
    };

    // Order sides
    this.orderSides = {
      BUY: 'buy',
      SELL: 'sell',
      SELL_SHORT: 'sell_short',
      BUY_TO_COVER: 'buy_to_cover'
    };

    // Time in force options
    this.timeInForce = {
      DAY: 'DAY',
      GTC: 'GTC', // Good Till Cancelled
      IOC: 'IOC', // Immediate or Cancel
      FOK: 'FOK', // Fill or Kill
      GTD: 'GTD', // Good Till Date
      MOO: 'MOO', // Market on Open
      MOC: 'MOC', // Market on Close
      EXT: 'EXT'  // Extended hours
    };

    // Order status
    this.orderStatus = {
      PENDING_SUBMIT: 'pending_submit',
      SUBMITTED: 'submitted',
      PENDING: 'pending',
      PARTIALLY_FILLED: 'partial',
      FILLED: 'filled',
      CANCELLED: 'cancelled',
      REJECTED: 'rejected',
      EXPIRED: 'expired'
    };

    // Security types
    this.securityTypes = {
      EQUITY: 'equity',
      OPTION: 'option',
      FUTURE: 'future',
      BOND: 'bond',
      ETF: 'etf',
      MUTUAL_FUND: 'mutual_fund',
      FOREX: 'forex',
      CRYPTO: 'crypto',
      COMMODITY: 'commodity'
    };

    // Trading hours
    this.tradingHours = {
      PRE_MARKET: { start: '04:00', end: '09:30' },
      REGULAR: { start: '09:30', end: '16:00' },
      AFTER_HOURS: { start: '16:00', end: '20:00' }
    };

    // Circuit breaker levels
    this.circuitBreakerLevels = {
      LEVEL_1: 0.07, // 7% decline
      LEVEL_2: 0.13, // 13% decline
      LEVEL_3: 0.20  // 20% decline
    };
  }

  /**
   * Submit a new order
   */
  async submitOrder(orderData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Validate account and permissions
      const account = await this.validateAccount(client, orderData.accountId);

      // Check trading permissions for security type
      await this.checkTradingPermissions(client, account, orderData);

      // Validate order parameters
      await this.validateOrderParameters(orderData);

      // Check market hours
      await this.checkMarketHours(orderData);

      // Perform pre-trade compliance checks
      const complianceResult = await this.performComplianceChecks(
        client,
        account,
        orderData
      );

      if (!complianceResult.passed) {
        throw new Error(`Compliance check failed: ${complianceResult.reason}`);
      }

      // Calculate buying power and margin requirements
      const marginCheck = await this.checkMarginRequirements(
        client,
        account,
        orderData
      );

      if (!marginCheck.sufficient) {
        throw new Error(`Insufficient buying power. Required: $${marginCheck.required}, Available: $${marginCheck.available}`);
      }

      // Check for pattern day trader restrictions
      if (await this.isPatternDayTrader(client, orderData.accountId)) {
        const pdtCheck = await this.checkPDTRestrictions(client, account);
        if (!pdtCheck.allowed) {
          throw new Error(pdtCheck.reason);
        }
      }

      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Create order record
      const orderId = await this.createOrderRecord(
        client,
        orderData,
        orderNumber,
        complianceResult
      );

      // Route order for execution
      const routingResult = await this.routeOrder(client, orderId, orderData);

      // If market order or marketable limit, try immediate execution
      if (this.isImmediatelyExecutable(orderData)) {
        await this.attemptExecution(client, orderId, orderData);
      }

      await client.query('COMMIT');

      this.emit('order:submitted', {
        orderId,
        orderNumber,
        accountId: orderData.accountId,
        symbol: orderData.symbol,
        side: orderData.side,
        quantity: orderData.quantity
      });

      return {
        success: true,
        orderId,
        orderNumber,
        status: this.orderStatus.SUBMITTED,
        routing: routingResult
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId, reason = 'User requested') {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get order details
      const order = await this.getOrder(client, orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (!this.isCancellable(order.status)) {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }

      // Update order status
      await client.query(
        `UPDATE capital_markets_orders
         SET status = $1, cancelled_at = NOW(), rejection_reason = $2
         WHERE id = $3`,
        [this.orderStatus.CANCELLED, reason, orderId]
      );

      // Release any reserved buying power
      await this.releaseBuyingPower(client, order);

      // Audit log
      await this.auditLog(client, 'order', orderId, 'cancel', { reason });

      await client.query('COMMIT');

      this.emit('order:cancelled', { orderId, reason });

      return { success: true, message: 'Order cancelled successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute an order (called by matching engine)
   */
  async executeOrder(orderId, executionData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const order = await this.getOrder(client, orderId);

      // Create execution record
      const executionId = await this.createExecutionRecord(
        client,
        orderId,
        executionData
      );

      // Update order status and filled quantity
      const newFilledQuantity = parseFloat(order.filled_quantity) + parseFloat(executionData.quantity);
      const isFullyFilled = newFilledQuantity >= parseFloat(order.quantity);

      await client.query(
        `UPDATE capital_markets_orders
         SET filled_quantity = $1,
             remaining_quantity = $2,
             average_price = $3,
             status = $4,
             executed_at = CASE WHEN executed_at IS NULL THEN NOW() ELSE executed_at END
         WHERE id = $5`,
        [
          newFilledQuantity,
          parseFloat(order.quantity) - newFilledQuantity,
          this.calculateAveragePrice(order, executionData),
          isFullyFilled ? this.orderStatus.FILLED : this.orderStatus.PARTIALLY_FILLED,
          orderId
        ]
      );

      // Update position
      await this.updatePosition(client, order, executionData);

      // Update buying power
      await this.updateBuyingPower(client, order.account_id, executionData);

      // Create settlement instruction
      await this.createSettlementInstruction(client, executionId, executionData);

      // Best execution analysis
      await this.analyzeBestExecution(client, orderId, executionData);

      await client.query('COMMIT');

      this.emit('order:executed', {
        orderId,
        executionId,
        quantity: executionData.quantity,
        price: executionData.price,
        fullyFilled: isFullyFilled
      });

      return {
        success: true,
        executionId,
        filledQuantity: newFilledQuantity,
        remainingQuantity: parseFloat(order.quantity) - newFilledQuantity,
        status: isFullyFilled ? 'filled' : 'partially_filled'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get real-time positions
   */
  async getPositions(accountId) {
    const query = `
      SELECT
        p.*,
        s.symbol,
        s.name,
        s.security_type,
        s.exchange,
        md.last_price,
        md.bid_price,
        md.ask_price,
        p.quantity * md.last_price as market_value,
        (p.quantity * md.last_price) - (p.quantity * p.average_cost) as unrealized_pnl
      FROM capital_markets_positions p
      JOIN capital_markets_securities s ON p.security_id = s.id
      LEFT JOIN capital_markets_market_data md ON s.id = md.security_id
      WHERE p.account_id = $1
      AND p.quantity != 0
      ORDER BY ABS(p.quantity * md.last_price) DESC`;

    const result = await this.pool.query(query, [accountId]);
    return result.rows;
  }

  /**
   * Get order history
   */
  async getOrderHistory(accountId, filters = {}) {
    let query = `
      SELECT
        o.*,
        s.symbol,
        s.name,
        s.security_type
      FROM capital_markets_orders o
      JOIN capital_markets_securities s ON o.security_id = s.id
      WHERE o.account_id = $1`;

    const params = [accountId];
    let paramIndex = 2;

    if (filters.startDate) {
      query += ` AND o.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND o.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND o.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.symbol) {
      query += ` AND s.symbol = $${paramIndex}`;
      params.push(filters.symbol);
      paramIndex++;
    }

    query += ` ORDER BY o.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Calculate P&L for account
   */
  async calculatePnL(accountId, period = 'daily') {
    const periodConditions = {
      daily: "DATE(e.executed_at) = CURRENT_DATE",
      weekly: "e.executed_at >= CURRENT_DATE - INTERVAL '7 days'",
      monthly: "e.executed_at >= CURRENT_DATE - INTERVAL '30 days'",
      yearly: "EXTRACT(YEAR FROM e.executed_at) = EXTRACT(YEAR FROM CURRENT_DATE)"
    };

    const query = `
      SELECT
        SUM(CASE
          WHEN o.side IN ('sell', 'sell_short') THEN e.quantity * e.price
          ELSE -e.quantity * e.price
        END) - SUM(e.commission + e.fees) as realized_pnl,
        COUNT(DISTINCT o.id) as total_trades,
        SUM(e.quantity) as total_volume,
        AVG(e.commission + e.fees) as avg_cost_per_trade
      FROM capital_markets_executions e
      JOIN capital_markets_orders o ON e.order_id = o.id
      WHERE o.account_id = $1
      AND ${periodConditions[period] || periodConditions.daily}`;

    const result = await this.pool.query(query, [accountId]);

    // Also get unrealized P&L from positions
    const positionsQuery = `
      SELECT SUM(unrealized_pnl) as unrealized_pnl
      FROM capital_markets_positions
      WHERE account_id = $1`;

    const positionsResult = await this.pool.query(positionsQuery, [accountId]);

    return {
      realized_pnl: result.rows[0].realized_pnl || 0,
      unrealized_pnl: positionsResult.rows[0].unrealized_pnl || 0,
      total_pnl: (result.rows[0].realized_pnl || 0) + (positionsResult.rows[0].unrealized_pnl || 0),
      total_trades: result.rows[0].total_trades || 0,
      total_volume: result.rows[0].total_volume || 0,
      avg_cost_per_trade: result.rows[0].avg_cost_per_trade || 0,
      period
    };
  }

  /**
   * Check for trading halts
   */
  async checkTradingHalt(securityId) {
    const query = `
      SELECT *
      FROM capital_markets_trading_halts
      WHERE security_id = $1
      AND active = true
      ORDER BY halt_time DESC
      LIMIT 1`;

    const result = await this.pool.query(query, [securityId]);

    if (result.rows.length > 0) {
      const halt = result.rows[0];
      return {
        halted: true,
        code: halt.halt_code,
        reason: halt.halt_reason,
        haltTime: halt.halt_time,
        expectedResume: halt.resume_time
      };
    }

    return { halted: false };
  }

  /**
   * Apply circuit breakers
   */
  async checkCircuitBreakers(securityId) {
    const query = `
      SELECT
        md.last_price,
        md.previous_close,
        (md.last_price - md.previous_close) / md.previous_close as price_change_pct
      FROM capital_markets_market_data md
      WHERE md.security_id = $1`;

    const result = await this.pool.query(query, [securityId]);

    if (result.rows.length === 0) {
      return { triggered: false };
    }

    const priceChangePct = Math.abs(result.rows[0].price_change_pct);

    if (priceChangePct >= this.circuitBreakerLevels.LEVEL_3) {
      return {
        triggered: true,
        level: 3,
        action: 'TRADING_HALT_DAY',
        percentage: priceChangePct
      };
    } else if (priceChangePct >= this.circuitBreakerLevels.LEVEL_2) {
      return {
        triggered: true,
        level: 2,
        action: 'TRADING_HALT_15MIN',
        percentage: priceChangePct
      };
    } else if (priceChangePct >= this.circuitBreakerLevels.LEVEL_1) {
      return {
        triggered: true,
        level: 1,
        action: 'TRADING_HALT_15MIN',
        percentage: priceChangePct
      };
    }

    return { triggered: false };
  }

  /**
   * Helper methods
   */
  async validateAccount(client, accountId) {
    const query = `SELECT * FROM capital_markets_accounts WHERE id = $1`;
    const result = await client.query(query, [accountId]);

    if (result.rows.length === 0) {
      throw new Error('Account not found');
    }

    const account = result.rows[0];

    if (account.kyc_status !== 'approved') {
      throw new Error('KYC not approved');
    }

    return account;
  }

  async checkTradingPermissions(client, account, orderData) {
    const securityQuery = `
      SELECT * FROM capital_markets_securities WHERE symbol = $1`;
    const securityResult = await client.query(securityQuery, [orderData.symbol]);

    if (securityResult.rows.length === 0) {
      throw new Error('Security not found');
    }

    const security = securityResult.rows[0];
    orderData.securityId = security.id;
    orderData.securityType = security.security_type;

    // Check specific permissions
    switch (security.security_type) {
      case this.securityTypes.OPTION:
        if (!account.options_level || account.options_level < this.getRequiredOptionsLevel(orderData)) {
          throw new Error('Insufficient options trading level');
        }
        break;

      case this.securityTypes.FUTURE:
        if (!account.futures_approved) {
          throw new Error('Futures trading not approved');
        }
        break;

      case this.securityTypes.FOREX:
        if (!account.forex_approved) {
          throw new Error('Forex trading not approved');
        }
        break;

      case this.securityTypes.CRYPTO:
        if (!account.crypto_approved) {
          throw new Error('Crypto trading not approved');
        }
        break;
    }

    // Check margin requirements for short selling
    if (orderData.side === this.orderSides.SELL_SHORT && !account.short_selling_approved) {
      throw new Error('Short selling not approved');
    }

    return true;
  }

  async validateOrderParameters(orderData) {
    // Validate quantity
    if (!orderData.quantity || orderData.quantity <= 0) {
      throw new Error('Invalid quantity');
    }

    // Validate price for limit orders
    if (orderData.orderType === this.orderTypes.LIMIT && (!orderData.price || orderData.price <= 0)) {
      throw new Error('Invalid limit price');
    }

    // Validate stop price for stop orders
    if ((orderData.orderType === this.orderTypes.STOP || orderData.orderType === this.orderTypes.STOP_LIMIT) &&
        (!orderData.stopPrice || orderData.stopPrice <= 0)) {
      throw new Error('Invalid stop price');
    }

    // Validate time in force
    if (!Object.values(this.timeInForce).includes(orderData.timeInForce)) {
      orderData.timeInForce = this.timeInForce.DAY;
    }

    return true;
  }

  async checkMarketHours(orderData) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const dayOfWeek = now.getDay();

    // Check if weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (orderData.timeInForce !== this.timeInForce.GTC) {
        throw new Error('Market is closed on weekends');
      }
      return true;
    }

    // Check trading session
    let inTradingHours = false;
    let session = null;

    if (currentTime >= this.tradingHours.REGULAR.start && currentTime < this.tradingHours.REGULAR.end) {
      inTradingHours = true;
      session = 'regular';
    } else if (currentTime >= this.tradingHours.PRE_MARKET.start && currentTime < this.tradingHours.PRE_MARKET.end) {
      if (orderData.extendedHours) {
        inTradingHours = true;
        session = 'pre_market';
      }
    } else if (currentTime >= this.tradingHours.AFTER_HOURS.start && currentTime < this.tradingHours.AFTER_HOURS.end) {
      if (orderData.extendedHours) {
        inTradingHours = true;
        session = 'after_hours';
      }
    }

    if (!inTradingHours && orderData.timeInForce === this.timeInForce.DAY) {
      throw new Error('Market is closed. Use GTC order or enable extended hours trading');
    }

    orderData.session = session;
    return true;
  }

  async performComplianceChecks(client, account, orderData) {
    const checks = [];

    // Check for restricted securities
    const restrictionQuery = `
      SELECT restricted, reg_sho_threshold, hard_to_borrow
      FROM capital_markets_securities
      WHERE id = $1`;
    const restrictionResult = await client.query(restrictionQuery, [orderData.securityId]);

    if (restrictionResult.rows[0].restricted) {
      checks.push({ rule: 'restricted_security', passed: false, reason: 'Security is restricted' });
    }

    // Check for Reg SHO threshold
    if (orderData.side === this.orderSides.SELL_SHORT && restrictionResult.rows[0].reg_sho_threshold) {
      checks.push({ rule: 'reg_sho', passed: false, reason: 'Security on Reg SHO threshold list' });
    }

    // Check for hard to borrow
    if (orderData.side === this.orderSides.SELL_SHORT && restrictionResult.rows[0].hard_to_borrow) {
      checks.push({ rule: 'hard_to_borrow', passed: false, reason: 'Security is hard to borrow' });
    }

    // Check position limits
    const positionQuery = `
      SELECT quantity FROM capital_markets_positions
      WHERE account_id = $1 AND security_id = $2`;
    const positionResult = await client.query(positionQuery, [account.id, orderData.securityId]);

    const currentPosition = positionResult.rows[0]?.quantity || 0;
    const newPosition = orderData.side === this.orderSides.BUY ?
                       currentPosition + orderData.quantity :
                       currentPosition - orderData.quantity;

    if (Math.abs(newPosition) > (account.position_limit || 100000)) {
      checks.push({ rule: 'position_limit', passed: false, reason: 'Exceeds position limit' });
    }

    // Check daily loss limit
    const dailyPnL = await this.calculatePnL(account.id, 'daily');
    if (account.daily_loss_limit && dailyPnL.total_pnl < -account.daily_loss_limit) {
      checks.push({ rule: 'daily_loss_limit', passed: false, reason: 'Daily loss limit exceeded' });
    }

    // Aggregate results
    const failed = checks.filter(c => !c.passed);
    return {
      passed: failed.length === 0,
      reason: failed.map(c => c.reason).join(', '),
      checks
    };
  }

  async checkMarginRequirements(client, account, orderData) {
    // Calculate order value
    const orderValue = orderData.quantity * (orderData.price || await this.getCurrentPrice(client, orderData.securityId));

    // Get current margin usage
    const marginQuery = `
      SELECT SUM(margin_requirement) as total_margin
      FROM capital_markets_positions
      WHERE account_id = $1`;
    const marginResult = await client.query(marginQuery, [account.id]);
    const currentMargin = marginResult.rows[0].total_margin || 0;

    // Calculate new margin requirement
    let marginRequired = 0;
    switch (orderData.securityType) {
      case this.securityTypes.EQUITY:
        marginRequired = orderValue * 0.25; // 25% for equities
        break;
      case this.securityTypes.OPTION:
        marginRequired = this.calculateOptionMargin(orderData);
        break;
      case this.securityTypes.FUTURE:
        marginRequired = this.calculateFutureMargin(orderData);
        break;
      default:
        marginRequired = orderValue * 0.5; // 50% default
    }

    // Calculate available buying power
    const buyingPower = (account.cash_balance + account.margin_balance - currentMargin) * account.leverage_ratio;

    return {
      sufficient: buyingPower >= marginRequired,
      required: marginRequired,
      available: buyingPower,
      currentMargin,
      orderValue
    };
  }

  async isPatternDayTrader(client, accountId) {
    // Count day trades in last 5 business days
    const query = `
      SELECT COUNT(*) as day_trades
      FROM (
        SELECT DATE(created_at) as trade_date, security_id
        FROM capital_markets_orders
        WHERE account_id = $1
        AND side IN ('buy', 'sell')
        AND status = 'filled'
        AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at), security_id
        HAVING COUNT(CASE WHEN side = 'buy' THEN 1 END) > 0
        AND COUNT(CASE WHEN side = 'sell' THEN 1 END) > 0
      ) day_trades`;

    const result = await client.query(query, [accountId]);
    return result.rows[0].day_trades >= 4;
  }

  async checkPDTRestrictions(client, account) {
    const equity = account.cash_balance + account.margin_balance;

    if (equity < 25000) {
      return {
        allowed: false,
        reason: 'Pattern Day Trader restriction: Minimum $25,000 equity required'
      };
    }

    return { allowed: true };
  }

  generateOrderNumber() {
    return 'ORD-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  async createOrderRecord(client, orderData, orderNumber, complianceResult) {
    const query = `
      INSERT INTO capital_markets_orders (
        account_id, security_id, order_number, order_type,
        side, quantity, price, stop_price, time_in_force,
        status, compliance_checks, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING id`;

    const result = await client.query(query, [
      orderData.accountId,
      orderData.securityId,
      orderNumber,
      orderData.orderType,
      orderData.side,
      orderData.quantity,
      orderData.price,
      orderData.stopPrice,
      orderData.timeInForce,
      this.orderStatus.PENDING_SUBMIT,
      JSON.stringify(complianceResult.checks)
    ]);

    return result.rows[0].id;
  }

  async routeOrder(client, orderId, orderData) {
    // Smart order routing logic
    const routes = await this.determineOptimalRoute(orderData);

    // Update order with routing information
    await client.query(
      `UPDATE capital_markets_orders
       SET route = $1, execution_venue = $2
       WHERE id = $3`,
      [routes.primary, routes.venues.join(','), orderId]
    );

    return {
      primary: routes.primary,
      venues: routes.venues,
      strategy: routes.strategy
    };
  }

  async determineOptimalRoute(orderData) {
    // Simplified smart order routing
    // In production, this would connect to multiple exchanges and dark pools

    const routes = {
      primary: 'SMART',
      venues: [],
      strategy: 'best_price'
    };

    // Large orders might use iceberg or VWAP
    if (orderData.quantity > 10000) {
      routes.strategy = 'iceberg';
      routes.venues = ['NYSE', 'NASDAQ', 'ARCA', 'BATS'];
    } else {
      routes.venues = ['NASDAQ'];
    }

    return routes;
  }

  isImmediatelyExecutable(orderData) {
    return orderData.orderType === this.orderTypes.MARKET ||
           (orderData.orderType === this.orderTypes.LIMIT && orderData.timeInForce === this.timeInForce.IOC);
  }

  async attemptExecution(client, orderId, orderData) {
    // Simulate immediate execution for market orders
    if (orderData.orderType === this.orderTypes.MARKET) {
      const currentPrice = await this.getCurrentPrice(client, orderData.securityId);

      await this.executeOrder(orderId, {
        quantity: orderData.quantity,
        price: currentPrice,
        exchange: 'NASDAQ',
        liquidity_type: 'add'
      });
    }
  }

  async getCurrentPrice(client, securityId) {
    const query = `
      SELECT last_price, bid_price, ask_price
      FROM capital_markets_market_data
      WHERE security_id = $1`;

    const result = await client.query(query, [securityId]);
    if (result.rows.length === 0) {
      throw new Error('No market data available');
    }

    return result.rows[0].last_price || result.rows[0].bid_price;
  }

  async getOrder(client, orderId) {
    const query = `SELECT * FROM capital_markets_orders WHERE id = $1`;
    const result = await client.query(query, [orderId]);
    return result.rows[0];
  }

  isCancellable(status) {
    return [
      this.orderStatus.PENDING_SUBMIT,
      this.orderStatus.SUBMITTED,
      this.orderStatus.PENDING,
      this.orderStatus.PARTIALLY_FILLED
    ].includes(status);
  }

  async releaseBuyingPower(client, order) {
    // Release any reserved margin
    // This would update the account's available buying power
  }

  async createExecutionRecord(client, orderId, executionData) {
    const query = `
      INSERT INTO capital_markets_executions (
        order_id, execution_id, quantity, price,
        commission, fees, exchange, liquidity_type,
        settlement_date, executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id`;

    const executionId = 'EX-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    const settlementDate = this.calculateSettlementDate(executionData.securityType);

    const result = await client.query(query, [
      orderId,
      executionId,
      executionData.quantity,
      executionData.price,
      executionData.commission || 0,
      executionData.fees || 0,
      executionData.exchange,
      executionData.liquidity_type,
      settlementDate
    ]);

    return result.rows[0].id;
  }

  calculateAveragePrice(order, executionData) {
    const prevValue = parseFloat(order.filled_quantity) * parseFloat(order.average_price || 0);
    const newValue = parseFloat(executionData.quantity) * parseFloat(executionData.price);
    const totalQuantity = parseFloat(order.filled_quantity) + parseFloat(executionData.quantity);

    return (prevValue + newValue) / totalQuantity;
  }

  async updatePosition(client, order, executionData) {
    const quantityChange = order.side === this.orderSides.BUY ?
                          executionData.quantity :
                          -executionData.quantity;

    const query = `
      INSERT INTO capital_markets_positions (
        account_id, security_id, quantity, average_cost
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (account_id, security_id)
      DO UPDATE SET
        quantity = capital_markets_positions.quantity + $3,
        average_cost = CASE
          WHEN $5 = 'buy' THEN
            ((capital_markets_positions.quantity * capital_markets_positions.average_cost) +
             ($3 * $4)) / (capital_markets_positions.quantity + $3)
          ELSE capital_markets_positions.average_cost
        END,
        updated_at = NOW()`;

    await client.query(query, [
      order.account_id,
      order.security_id,
      quantityChange,
      executionData.price,
      order.side
    ]);
  }

  async updateBuyingPower(client, accountId, executionData) {
    // Update account buying power based on execution
    const cost = executionData.quantity * executionData.price +
                 (executionData.commission || 0) +
                 (executionData.fees || 0);

    await client.query(
      `UPDATE capital_markets_accounts
       SET cash_balance = cash_balance - $1
       WHERE id = $2`,
      [cost, accountId]
    );
  }

  async createSettlementInstruction(client, executionId, executionData) {
    const query = `
      INSERT INTO capital_markets_settlements (
        execution_id, settlement_date, settlement_amount,
        status, created_at
      ) VALUES ($1, $2, $3, $4, NOW())`;

    const settlementDate = this.calculateSettlementDate(executionData.securityType);
    const settlementAmount = executionData.quantity * executionData.price;

    await client.query(query, [
      executionId,
      settlementDate,
      settlementAmount,
      'pending'
    ]);
  }

  async analyzeBestExecution(client, orderId, executionData) {
    // Get NBBO at time of execution
    const nbboQuery = `
      SELECT bid_price, ask_price
      FROM capital_markets_market_data
      WHERE security_id = (SELECT security_id FROM capital_markets_orders WHERE id = $1)`;

    const nbboResult = await client.query(nbboQuery, [orderId]);
    const nbbo = nbboResult.rows[0] || {};

    const priceImprovement = this.calculatePriceImprovement(
      executionData.price,
      nbbo.bid_price,
      nbbo.ask_price,
      executionData.side
    );

    const query = `
      INSERT INTO capital_markets_best_execution (
        order_id, nbbo_bid, nbbo_ask, nbbo_mid,
        execution_price, price_improvement,
        analyzed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`;

    await client.query(query, [
      orderId,
      nbbo.bid_price,
      nbbo.ask_price,
      (nbbo.bid_price + nbbo.ask_price) / 2,
      executionData.price,
      priceImprovement
    ]);
  }

  calculateSettlementDate(securityType) {
    const today = new Date();
    let settlementDays = 2; // T+2 default

    switch (securityType) {
      case this.securityTypes.OPTION:
        settlementDays = 1; // T+1 for options
        break;
      case this.securityTypes.FUTURE:
        settlementDays = 1; // T+1 for futures
        break;
    }

    // Add business days
    let daysAdded = 0;
    while (daysAdded < settlementDays) {
      today.setDate(today.getDate() + 1);
      if (today.getDay() !== 0 && today.getDay() !== 6) {
        daysAdded++;
      }
    }

    return today;
  }

  calculatePriceImprovement(execPrice, bidPrice, askPrice, side) {
    if (side === this.orderSides.BUY) {
      return Math.max(0, askPrice - execPrice);
    } else {
      return Math.max(0, execPrice - bidPrice);
    }
  }

  getRequiredOptionsLevel(orderData) {
    // Simplified options level requirements
    if (orderData.orderType === 'spread') return 3;
    if (orderData.side === this.orderSides.SELL) return 2;
    return 1;
  }

  calculateOptionMargin(orderData) {
    // Simplified option margin calculation
    // In production, use CBOE margin requirements
    return orderData.quantity * 100 * orderData.price * 0.2;
  }

  calculateFutureMargin(orderData) {
    // Simplified futures margin calculation
    // In production, use exchange-specific margins
    return orderData.quantity * orderData.price * 0.1;
  }

  async auditLog(client, entityType, entityId, action, details) {
    const query = `
      INSERT INTO capital_markets_audit_log (
        entity_type, entity_id, action, new_value, created_at
      ) VALUES ($1, $2, $3, $4, NOW())`;

    await client.query(query, [
      entityType,
      entityId,
      action,
      JSON.stringify(details)
    ]);
  }

  /**
   * Risk management functions
   */
  async calculateRiskMetrics(accountId) {
    const client = await this.pool.connect();
    try {
      // Get positions
      const positions = await this.getPositions(accountId);

      // Calculate portfolio value
      const portfolioValue = positions.reduce((sum, p) => sum + parseFloat(p.market_value), 0);

      // Calculate exposures
      const longExposure = positions
        .filter(p => p.quantity > 0)
        .reduce((sum, p) => sum + parseFloat(p.market_value), 0);

      const shortExposure = Math.abs(positions
        .filter(p => p.quantity < 0)
        .reduce((sum, p) => sum + parseFloat(p.market_value), 0));

      // Calculate concentration
      const largestPosition = Math.max(...positions.map(p => Math.abs(parseFloat(p.market_value))));
      const largestPositionPct = portfolioValue > 0 ? (largestPosition / portfolioValue) * 100 : 0;

      // Store metrics
      const query = `
        INSERT INTO capital_markets_risk_metrics (
          account_id, portfolio_value, gross_exposure,
          net_exposure, long_exposure, short_exposure,
          largest_position_pct, calculated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *`;

      const result = await client.query(query, [
        accountId,
        portfolioValue,
        longExposure + shortExposure,
        longExposure - shortExposure,
        longExposure,
        shortExposure,
        largestPositionPct
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

export default CapitalMarketsTradingEngine;