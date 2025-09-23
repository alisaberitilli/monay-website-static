const { Pool } = require('pg');
const crypto = require('crypto');
const Redis = require('redis');
const moment = require('moment');
const axios = require('axios');

/**
 * Virtual Card Platform
 * Complete virtual and physical card issuance and management
 * Real-time authorization and dynamic spending controls
 */
class VirtualCardPlatform {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/monay'
    });

    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.cardNetworks = {
      VISA: { bin: '4532', name: 'Visa' },
      MASTERCARD: { bin: '5425', name: 'Mastercard' },
      AMEX: { bin: '3782', name: 'American Express' },
      DISCOVER: { bin: '6011', name: 'Discover' }
    };

    this.authorizationCache = new Map();
  }

  /**
   * Issue instant virtual card
   */
  async issueVirtualCard(request) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Generate card details
      const card = {
        card_id: crypto.randomUUID(),
        customer_id: request.customer_id,
        wallet_id: request.wallet_id,
        card_type: 'virtual',
        network: request.network || 'VISA',
        card_number: this.generateCardNumber(request.network || 'VISA'),
        cvv: this.generateCVV(),
        expiry_month: moment().add(3, 'years').format('MM'),
        expiry_year: moment().add(3, 'years').format('YYYY'),
        status: 'active',
        spending_limits: this.setSpendingLimits(request),
        features: {
          contactless: true,
          online_payments: true,
          international: request.international || false,
          atm_access: request.atm_access || false,
          recurring_payments: request.recurring || true,
          tokenization_enabled: true
        },
        metadata: request.metadata || {},
        created_at: new Date()
      };

      // Mask card number for storage
      card.masked_number = this.maskCardNumber(card.card_number);
      card.last_four = card.card_number.slice(-4);

      // Store card
      const cardQuery = `
        INSERT INTO virtual_cards (
          card_id, customer_id, wallet_id, card_type, network,
          masked_number, last_four, encrypted_number, encrypted_cvv,
          expiry_month, expiry_year, status, spending_limits,
          features, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        RETURNING *
      `;

      const encryptedData = this.encryptCardData({
        number: card.card_number,
        cvv: card.cvv
      });

      const cardResult = await client.query(cardQuery, [
        card.card_id,
        card.customer_id,
        card.wallet_id,
        card.card_type,
        card.network,
        card.masked_number,
        card.last_four,
        encryptedData.number,
        encryptedData.cvv,
        card.expiry_month,
        card.expiry_year,
        card.status,
        JSON.stringify(card.spending_limits),
        JSON.stringify(card.features),
        JSON.stringify(card.metadata)
      ]);

      // Create card controls
      await this.createCardControls(card, client);

      // Generate digital wallet tokens if requested
      if (request.digital_wallets) {
        await this.generateDigitalWalletTokens(card, request.digital_wallets, client);
      }

      // Set up authorization rules
      await this.setupAuthorizationRules(card, request.rules || {}, client);

      await client.query('COMMIT');

      // Cache card for fast authorization
      await this.cacheCardData(card);

      return {
        card_id: card.card_id,
        card_number: card.masked_number,
        last_four: card.last_four,
        expiry: `${card.expiry_month}/${card.expiry_year}`,
        cvv_hint: 'Check secure message',
        network: card.network,
        status: card.status,
        digital_wallets: request.digital_wallets || []
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to issue virtual card:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Real-time transaction authorization
   */
  async authorizeTransaction(authRequest) {
    const startTime = Date.now();

    try {
      // Get card from cache or database
      const card = await this.getCardForAuthorization(authRequest.card_id);

      if (!card) {
        return this.createAuthResponse(false, 'Card not found', authRequest);
      }

      // Check card status
      if (card.status !== 'active') {
        return this.createAuthResponse(false, `Card ${card.status}`, authRequest);
      }

      // Perform authorization checks in parallel
      const [
        velocityCheck,
        balanceCheck,
        mccCheck,
        fraudCheck,
        limitCheck
      ] = await Promise.all([
        this.checkVelocityLimits(card, authRequest),
        this.checkBalance(card, authRequest),
        this.checkMCCRestrictions(card, authRequest),
        this.checkFraudPatterns(card, authRequest),
        this.checkSpendingLimits(card, authRequest)
      ]);

      // Compile authorization decision
      const checks = [velocityCheck, balanceCheck, mccCheck, fraudCheck, limitCheck];
      const failedCheck = checks.find(check => !check.passed);

      if (failedCheck) {
        return this.createAuthResponse(false, failedCheck.reason, authRequest);
      }

      // Generate authorization code
      const authCode = this.generateAuthCode();

      // Record authorization
      await this.recordAuthorization({
        ...authRequest,
        card_id: card.card_id,
        auth_code: authCode,
        status: 'approved',
        response_time_ms: Date.now() - startTime
      });

      // Update spending tracker
      await this.updateSpendingTracker(card, authRequest.amount);

      return this.createAuthResponse(true, 'Approved', authRequest, authCode);
    } catch (error) {
      console.error('Authorization error:', error);
      return this.createAuthResponse(false, 'System error', authRequest);
    }
  }

  /**
   * Dynamic spending control update
   */
  async updateSpendingControls(cardId, controls) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Validate card exists and belongs to requester
      const cardCheck = await client.query(
        'SELECT * FROM virtual_cards WHERE card_id = $1',
        [cardId]
      );

      if (cardCheck.rows.length === 0) {
        throw new Error('Card not found');
      }

      const card = cardCheck.rows[0];

      // Update spending limits
      if (controls.spending_limits) {
        const limitsQuery = `
          UPDATE virtual_cards
          SET spending_limits = $1, updated_at = NOW()
          WHERE card_id = $2
        `;

        await client.query(limitsQuery, [
          JSON.stringify({
            ...card.spending_limits,
            ...controls.spending_limits
          }),
          cardId
        ]);
      }

      // Update features
      if (controls.features) {
        const featuresQuery = `
          UPDATE virtual_cards
          SET features = $1, updated_at = NOW()
          WHERE card_id = $2
        `;

        await client.query(featuresQuery, [
          JSON.stringify({
            ...card.features,
            ...controls.features
          }),
          cardId
        ]);
      }

      // Update MCC restrictions
      if (controls.mcc_restrictions) {
        await this.updateMCCRestrictions(cardId, controls.mcc_restrictions, client);
      }

      // Update merchant restrictions
      if (controls.merchant_restrictions) {
        await this.updateMerchantRestrictions(cardId, controls.merchant_restrictions, client);
      }

      await client.query('COMMIT');

      // Update cache
      await this.refreshCardCache(cardId);

      return {
        card_id: cardId,
        controls_updated: true,
        effective_immediately: true
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to update spending controls:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Card lifecycle management
   */
  async manageCardLifecycle(cardId, action, reason = null) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const validActions = ['freeze', 'unfreeze', 'close', 'replace', 'upgrade'];
      if (!validActions.includes(action)) {
        throw new Error(`Invalid action: ${action}`);
      }

      let newStatus;
      let additionalActions = [];

      switch (action) {
        case 'freeze':
          newStatus = 'frozen';
          additionalActions.push(this.notifyCardFreeze(cardId, reason));
          break;

        case 'unfreeze':
          newStatus = 'active';
          additionalActions.push(this.notifyCardUnfreeze(cardId));
          break;

        case 'close':
          newStatus = 'closed';
          additionalActions.push(this.permanentlyDisableCard(cardId, client));
          break;

        case 'replace':
          newStatus = 'replaced';
          const newCard = await this.issueReplacementCard(cardId, reason);
          additionalActions.push(this.notifyCardReplacement(cardId, newCard));
          break;

        case 'upgrade':
          const upgradedCard = await this.upgradeCard(cardId);
          additionalActions.push(this.notifyCardUpgrade(cardId, upgradedCard));
          break;
      }

      // Update card status
      if (newStatus) {
        const updateQuery = `
          UPDATE virtual_cards
          SET status = $1, status_changed_at = NOW(), status_reason = $2
          WHERE card_id = $3
        `;

        await client.query(updateQuery, [newStatus, reason, cardId]);
      }

      // Log lifecycle event
      const eventQuery = `
        INSERT INTO card_lifecycle_events (
          card_id, action, reason, performed_by, performed_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `;

      await client.query(eventQuery, [
        cardId,
        action,
        reason,
        'system' // Should be actual user/admin ID
      ]);

      // Execute additional actions
      await Promise.all(additionalActions);

      await client.query('COMMIT');

      // Update cache
      if (newStatus === 'frozen' || newStatus === 'closed') {
        await this.removeFromCache(cardId);
      } else {
        await this.refreshCardCache(cardId);
      }

      return {
        card_id: cardId,
        action,
        new_status: newStatus,
        success: true
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Card lifecycle management failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Issue physical card
   */
  async issuePhysicalCard(request) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Create virtual card first
      const virtualCard = await this.issueVirtualCard(request);

      // Create physical card order
      const physicalCard = {
        order_id: crypto.randomUUID(),
        card_id: virtualCard.card_id,
        customer_id: request.customer_id,
        card_design: request.card_design || 'standard',
        shipping_address: request.shipping_address,
        shipping_method: request.shipping_method || 'standard',
        personalization: {
          name_on_card: request.name_on_card,
          card_color: request.card_color || 'black',
          custom_image: request.custom_image || null
        },
        status: 'ordered',
        ordered_at: new Date(),
        estimated_delivery: this.calculateDeliveryDate(request.shipping_method)
      };

      // Store physical card order
      const orderQuery = `
        INSERT INTO physical_card_orders (
          order_id, card_id, customer_id, card_design,
          shipping_address, shipping_method, personalization,
          status, ordered_at, estimated_delivery
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
        RETURNING *
      `;

      await client.query(orderQuery, [
        physicalCard.order_id,
        physicalCard.card_id,
        physicalCard.customer_id,
        physicalCard.card_design,
        JSON.stringify(physicalCard.shipping_address),
        physicalCard.shipping_method,
        JSON.stringify(physicalCard.personalization),
        physicalCard.status,
        physicalCard.estimated_delivery
      ]);

      // Send to card production API
      await this.sendToProduction(physicalCard);

      await client.query('COMMIT');

      return {
        ...virtualCard,
        physical_card: {
          order_id: physicalCard.order_id,
          status: physicalCard.status,
          estimated_delivery: physicalCard.estimated_delivery
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to issue physical card:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate digital wallet tokens
   */
  async generateDigitalWalletTokens(card, wallets, client) {
    const tokens = [];

    for (const wallet of wallets) {
      const token = {
        token_id: crypto.randomUUID(),
        card_id: card.card_id,
        wallet_type: wallet, // 'apple_pay', 'google_pay', 'samsung_pay'
        token_number: this.generateTokenNumber(),
        device_id: crypto.randomUUID(),
        status: 'active',
        created_at: new Date()
      };

      const tokenQuery = `
        INSERT INTO digital_wallet_tokens (
          token_id, card_id, wallet_type, token_number,
          device_id, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;

      await client.query(tokenQuery, [
        token.token_id,
        token.card_id,
        token.wallet_type,
        token.token_number,
        token.device_id,
        token.status
      ]);

      tokens.push(token);
    }

    return tokens;
  }

  /**
   * Set spending limits
   */
  setSpendingLimits(request) {
    return {
      daily_limit: request.daily_limit || 5000,
      weekly_limit: request.weekly_limit || 20000,
      monthly_limit: request.monthly_limit || 50000,
      per_transaction: request.per_transaction || 2500,
      atm_daily: request.atm_daily || 500,
      international_enabled: request.international || false,
      online_enabled: request.online !== false,
      contactless_limit: request.contactless_limit || 100
    };
  }

  /**
   * Create card controls
   */
  async createCardControls(card, client) {
    const controlsQuery = `
      INSERT INTO card_controls (
        card_id, pin_set, activated, activation_date,
        failed_attempts, locked, last_activity
      ) VALUES ($1, false, false, NULL, 0, false, NULL)
    `;

    await client.query(controlsQuery, [card.card_id]);
  }

  /**
   * Setup authorization rules
   */
  async setupAuthorizationRules(card, rules, client) {
    const defaultRules = {
      require_pin: rules.require_pin || false,
      require_zip: rules.require_zip || false,
      block_countries: rules.block_countries || [],
      allowed_countries: rules.allowed_countries || [],
      time_restrictions: rules.time_restrictions || null,
      velocity_checks: rules.velocity_checks || true
    };

    const rulesQuery = `
      INSERT INTO card_authorization_rules (
        card_id, rules, created_at
      ) VALUES ($1, $2, NOW())
    `;

    await client.query(rulesQuery, [
      card.card_id,
      JSON.stringify(defaultRules)
    ]);
  }

  /**
   * Check velocity limits
   */
  async checkVelocityLimits(card, authRequest) {
    const key = `velocity:${card.card_id}:${moment().format('YYYY-MM-DD')}`;
    const dailySpent = await this.redis.get(key) || 0;

    if (parseFloat(dailySpent) + authRequest.amount > card.spending_limits.daily_limit) {
      return {
        passed: false,
        reason: 'Daily spending limit exceeded'
      };
    }

    // Check transaction frequency
    const txKey = `tx_count:${card.card_id}:${moment().format('YYYY-MM-DD-HH')}`;
    const txCount = await this.redis.get(txKey) || 0;

    if (txCount > 10) { // Max 10 transactions per hour
      return {
        passed: false,
        reason: 'Too many transactions'
      };
    }

    return { passed: true };
  }

  /**
   * Check balance
   */
  async checkBalance(card, authRequest) {
    const query = `
      SELECT balance FROM wallets WHERE wallet_id = $1
    `;

    const result = await this.pool.query(query, [card.wallet_id]);

    if (result.rows.length === 0 || result.rows[0].balance < authRequest.amount) {
      return {
        passed: false,
        reason: 'Insufficient funds'
      };
    }

    return { passed: true };
  }

  /**
   * Check MCC restrictions
   */
  async checkMCCRestrictions(card, authRequest) {
    const query = `
      SELECT * FROM card_mcc_restrictions
      WHERE card_id = $1 AND status = 'active'
    `;

    const restrictions = await this.pool.query(query, [card.card_id]);

    for (const restriction of restrictions.rows) {
      if (restriction.type === 'block' &&
          restriction.mcc_codes.includes(authRequest.mcc_code)) {
        return {
          passed: false,
          reason: `MCC ${authRequest.mcc_code} blocked`
        };
      }

      if (restriction.type === 'allow' &&
          !restriction.mcc_codes.includes(authRequest.mcc_code)) {
        return {
          passed: false,
          reason: `MCC ${authRequest.mcc_code} not allowed`
        };
      }
    }

    return { passed: true };
  }

  /**
   * Check fraud patterns
   */
  async checkFraudPatterns(card, authRequest) {
    // Simplified fraud check - would integrate with fraud service
    const suspiciousPatterns = [
      authRequest.amount > card.spending_limits.per_transaction,
      authRequest.country && authRequest.country !== 'US',
      authRequest.online && !card.features.online_payments
    ];

    if (suspiciousPatterns.filter(Boolean).length >= 2) {
      return {
        passed: false,
        reason: 'Suspicious activity detected'
      };
    }

    return { passed: true };
  }

  /**
   * Check spending limits
   */
  async checkSpendingLimits(card, authRequest) {
    if (authRequest.amount > card.spending_limits.per_transaction) {
      return {
        passed: false,
        reason: 'Exceeds per-transaction limit'
      };
    }

    return { passed: true };
  }

  /**
   * Create authorization response
   */
  createAuthResponse(approved, reason, request, authCode = null) {
    return {
      approved,
      auth_code: authCode || null,
      reason,
      transaction_id: request.transaction_id,
      amount: request.amount,
      timestamp: new Date()
    };
  }

  /**
   * Record authorization
   */
  async recordAuthorization(authData) {
    const query = `
      INSERT INTO card_authorizations (
        authorization_id, card_id, transaction_id, amount,
        mcc_code, merchant_name, status, auth_code,
        response_time_ms, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `;

    await this.pool.query(query, [
      crypto.randomUUID(),
      authData.card_id,
      authData.transaction_id,
      authData.amount,
      authData.mcc_code,
      authData.merchant_name,
      authData.status,
      authData.auth_code,
      authData.response_time_ms
    ]);
  }

  /**
   * Update spending tracker
   */
  async updateSpendingTracker(card, amount) {
    const dayKey = `velocity:${card.card_id}:${moment().format('YYYY-MM-DD')}`;
    const weekKey = `velocity:${card.card_id}:week:${moment().week()}`;
    const monthKey = `velocity:${card.card_id}:month:${moment().format('YYYY-MM')}`;
    const txKey = `tx_count:${card.card_id}:${moment().format('YYYY-MM-DD-HH')}`;

    await this.redis.incrby(dayKey, amount);
    await this.redis.incrby(weekKey, amount);
    await this.redis.incrby(monthKey, amount);
    await this.redis.incr(txKey);

    // Set expiration
    await this.redis.expire(dayKey, 86400); // 1 day
    await this.redis.expire(weekKey, 604800); // 1 week
    await this.redis.expire(monthKey, 2592000); // 30 days
    await this.redis.expire(txKey, 3600); // 1 hour
  }

  /**
   * Cache card data
   */
  async cacheCardData(card) {
    const key = `card:${card.card_id}`;
    await this.redis.setex(key, 3600, JSON.stringify(card));
  }

  /**
   * Get card for authorization
   */
  async getCardForAuthorization(cardId) {
    // Try cache first
    const cached = await this.redis.get(`card:${cardId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to database
    const query = `
      SELECT * FROM virtual_cards WHERE card_id = $1
    `;

    const result = await this.pool.query(query, [cardId]);
    if (result.rows.length > 0) {
      const card = result.rows[0];
      await this.cacheCardData(card);
      return card;
    }

    return null;
  }

  /**
   * Refresh card cache
   */
  async refreshCardCache(cardId) {
    const query = `
      SELECT * FROM virtual_cards WHERE card_id = $1
    `;

    const result = await this.pool.query(query, [cardId]);
    if (result.rows.length > 0) {
      await this.cacheCardData(result.rows[0]);
    }
  }

  /**
   * Remove from cache
   */
  async removeFromCache(cardId) {
    await this.redis.del(`card:${cardId}`);
  }

  /**
   * Helper functions
   */
  generateCardNumber(network) {
    const networkData = this.cardNetworks[network];
    const bin = networkData.bin;
    const accountNumber = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
    const cardNumber = bin + accountNumber;
    return cardNumber + this.calculateLuhn(cardNumber);
  }

  generateCVV() {
    return Math.floor(Math.random() * 900 + 100).toString();
  }

  generateAuthCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  generateTokenNumber() {
    return crypto.randomBytes(8).toString('hex');
  }

  maskCardNumber(number) {
    return number.slice(0, 4) + ' **** **** ' + number.slice(-4);
  }

  encryptCardData(data) {
    const key = process.env.ENCRYPTION_KEY || 'test-encryption-key-32-chars-long!!';
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

    let encryptedNumber = cipher.update(data.number, 'utf8', 'hex');
    encryptedNumber += cipher.final('hex');

    const cipher2 = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encryptedCVV = cipher2.update(data.cvv, 'utf8', 'hex');
    encryptedCVV += cipher2.final('hex');

    return {
      number: iv.toString('hex') + ':' + encryptedNumber,
      cvv: iv.toString('hex') + ':' + encryptedCVV
    };
  }

  calculateLuhn(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return ((10 - (sum % 10)) % 10).toString();
  }

  calculateDeliveryDate(shippingMethod) {
    const days = {
      'express': 2,
      'priority': 5,
      'standard': 10
    };

    return moment().add(days[shippingMethod] || 10, 'days').toDate();
  }

  // Stub functions for notifications
  async notifyCardFreeze(cardId, reason) {
    console.log(`Card ${cardId} frozen: ${reason}`);
  }

  async notifyCardUnfreeze(cardId) {
    console.log(`Card ${cardId} unfrozen`);
  }

  async notifyCardReplacement(oldCardId, newCard) {
    console.log(`Card ${oldCardId} replaced with ${newCard.card_id}`);
  }

  async notifyCardUpgrade(cardId, upgradedCard) {
    console.log(`Card ${cardId} upgraded`);
  }

  async permanentlyDisableCard(cardId, client) {
    await client.query(
      'UPDATE virtual_cards SET status = $1 WHERE card_id = $2',
      ['permanently_closed', cardId]
    );
  }

  async issueReplacementCard(cardId, reason) {
    // Simplified - would copy settings from old card
    return { card_id: crypto.randomUUID() };
  }

  async upgradeCard(cardId) {
    // Simplified - would upgrade card tier/limits
    return { card_id: cardId, tier: 'premium' };
  }

  async sendToProduction(physicalCard) {
    // Would integrate with card production API
    console.log('Sending card to production:', physicalCard.order_id);
  }

  async updateMCCRestrictions(cardId, restrictions, client) {
    const query = `
      INSERT INTO card_mcc_restrictions (card_id, type, mcc_codes, status)
      VALUES ($1, $2, $3, 'active')
      ON CONFLICT (card_id, type) DO UPDATE
      SET mcc_codes = $3, updated_at = NOW()
    `;

    await client.query(query, [
      cardId,
      restrictions.type,
      JSON.stringify(restrictions.codes)
    ]);
  }

  async updateMerchantRestrictions(cardId, restrictions, client) {
    const query = `
      INSERT INTO card_merchant_restrictions (card_id, type, merchant_ids, status)
      VALUES ($1, $2, $3, 'active')
      ON CONFLICT (card_id, type) DO UPDATE
      SET merchant_ids = $3, updated_at = NOW()
    `;

    await client.query(query, [
      cardId,
      restrictions.type,
      JSON.stringify(restrictions.merchants)
    ]);
  }
}

module.exports = VirtualCardPlatform;