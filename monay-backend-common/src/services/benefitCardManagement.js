const pool = require('../models');
const EventEmitter = require('events');
const crypto = require('crypto');
const QRCode = require('qrcode');

class BenefitCardManagement extends EventEmitter {
  constructor() {
    super();
    this.cardProviders = new Map();
    this.virtualCards = new Map();
    this.cardLimits = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize Benefit Card Management System
   */
  async initialize() {
    console.log('Initializing Benefit Card Management System...');

    // Load card providers
    await this.loadCardProviders();

    // Load card configuration
    await this.loadCardConfiguration();

    // Start card monitoring
    this.startCardMonitoring();

    // Schedule card maintenance
    this.scheduleCardMaintenance();

    this.isInitialized = true;
    console.log('Benefit Card Management System initialized');
  }

  /**
   * Issue a new benefit card
   */
  async issueCard(userId, benefitId, cardType = 'VIRTUAL', options = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify benefit ownership
      const benefitResult = await client.query(
        `SELECT * FROM government_benefits
         WHERE id = $1 AND user_id = $2 AND status = 'ACTIVE'`,
        [benefitId, userId]
      );

      if (benefitResult.rows.length === 0) {
        throw new Error('Active benefit not found');
      }

      const benefit = benefitResult.rows[0];

      // Generate card details
      const cardDetails = await this.generateCardDetails(
        benefit.program_type,
        cardType,
        options
      );

      // Create card record
      const cardResult = await client.query(
        `INSERT INTO benefit_cards
         (user_id, benefit_id, card_number, card_type, status,
          expiry_date, cvv_hash, pin_hash, issued_at, metadata)
         VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, NOW(), $8)
         RETURNING *`,
        [userId, benefitId, cardDetails.masked_number, cardType,
         cardDetails.expiry_date, cardDetails.cvv_hash,
         cardDetails.pin_hash, options.metadata || {}]
      );

      const card = cardResult.rows[0];

      // Store secure card details
      await this.storeSecureCardData(card.id, cardDetails);

      // Set initial spending limits
      await this.setCardLimits(card.id, benefit.program_type, client);

      // Generate virtual card image if needed
      if (cardType === 'VIRTUAL') {
        const virtualCard = await this.generateVirtualCard(card, benefit);
        card.virtual_card_data = virtualCard;
      }

      // Add to digital wallets if requested
      if (options.add_to_wallet) {
        await this.addToDigitalWallet(card.id, options.wallet_type, userId);
      }

      // Create audit log
      await client.query(
        `INSERT INTO card_audit_logs
         (card_id, action, user_id, details, timestamp)
         VALUES ($1, 'CARD_ISSUED', $2, $3, NOW())`,
        [card.id, userId, { card_type: cardType, program: benefit.program_type }]
      );

      await client.query('COMMIT');

      // Emit card issued event
      this.emit('card_issued', {
        card_id: card.id,
        user_id: userId,
        card_type: cardType,
        program_type: benefit.program_type
      });

      return {
        success: true,
        card_id: card.id,
        card_number: cardDetails.masked_number,
        expiry_date: cardDetails.expiry_date,
        card_type: cardType,
        virtual_card: card.virtual_card_data,
        activation_required: cardType === 'PHYSICAL'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Card issuance error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Activate a physical card
   */
  async activateCard(cardId, userId, activationCode) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify card ownership
      const cardResult = await client.query(
        `SELECT * FROM benefit_cards
         WHERE id = $1 AND user_id = $2 AND status = 'PENDING_ACTIVATION'`,
        [cardId, userId]
      );

      if (cardResult.rows.length === 0) {
        throw new Error('Card not found or already activated');
      }

      // Verify activation code
      const codeValid = await this.verifyActivationCode(cardId, activationCode);
      if (!codeValid) {
        throw new Error('Invalid activation code');
      }

      // Activate card
      await client.query(
        `UPDATE benefit_cards
         SET status = 'ACTIVE',
             activated_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [cardId]
      );

      // Log activation
      await client.query(
        `INSERT INTO card_audit_logs
         (card_id, action, user_id, details, timestamp)
         VALUES ($1, 'CARD_ACTIVATED', $2, $3, NOW())`,
        [cardId, userId, { method: 'CODE_VERIFICATION' }]
      );

      await client.query('COMMIT');

      this.emit('card_activated', { card_id: cardId, user_id: userId });

      return {
        success: true,
        message: 'Card activated successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Card activation error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Set or update card PIN
   */
  async setCardPIN(cardId, userId, newPIN) {
    const client = await pool.connect();
    try {
      // Validate PIN format
      if (!/^\d{4}$/.test(newPIN)) {
        throw new Error('PIN must be 4 digits');
      }

      // Hash PIN
      const pinHash = this.hashPIN(newPIN);

      // Update card
      await client.query(
        `UPDATE benefit_cards
         SET pin_hash = $1,
             pin_set = true,
             updated_at = NOW()
         WHERE id = $2 AND user_id = $3`,
        [pinHash, cardId, userId]
      );

      // Log PIN change
      await client.query(
        `INSERT INTO card_audit_logs
         (card_id, action, user_id, details, timestamp)
         VALUES ($1, 'PIN_CHANGED', $2, $3, NOW())`,
        [cardId, userId, { method: 'USER_REQUEST' }]
      );

      return {
        success: true,
        message: 'PIN updated successfully'
      };

    } catch (error) {
      console.error('PIN update error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Lock/Unlock card
   */
  async toggleCardLock(cardId, userId, lock = true) {
    const client = await pool.connect();
    try {
      const newStatus = lock ? 'LOCKED' : 'ACTIVE';

      await client.query(
        `UPDATE benefit_cards
         SET status = $1,
             locked_at = CASE WHEN $1 = 'LOCKED' THEN NOW() ELSE NULL END,
             updated_at = NOW()
         WHERE id = $2 AND user_id = $3`,
        [newStatus, cardId, userId]
      );

      // Log status change
      await client.query(
        `INSERT INTO card_audit_logs
         (card_id, action, user_id, details, timestamp)
         VALUES ($1, $2, $3, $4, NOW())`,
        [cardId, lock ? 'CARD_LOCKED' : 'CARD_UNLOCKED', userId,
         { reason: 'USER_REQUEST' }]
      );

      this.emit('card_status_changed', {
        card_id: cardId,
        new_status: newStatus
      });

      return {
        success: true,
        status: newStatus
      };

    } catch (error) {
      console.error('Card lock error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Report card lost/stolen
   */
  async reportCardLostStolen(cardId, userId, reason = 'LOST') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Block old card
      await client.query(
        `UPDATE benefit_cards
         SET status = $1,
             blocked_at = NOW(),
             block_reason = $2,
             updated_at = NOW()
         WHERE id = $3 AND user_id = $4`,
        [reason === 'STOLEN' ? 'STOLEN' : 'LOST', reason, cardId, userId]
      );

      // Get card details for replacement
      const cardResult = await client.query(
        `SELECT bc.*, gb.program_type
         FROM benefit_cards bc
         JOIN government_benefits gb ON bc.benefit_id = gb.id
         WHERE bc.id = $1`,
        [cardId]
      );

      const oldCard = cardResult.rows[0];

      // Issue replacement card
      const replacementCard = await this.issueCard(
        userId,
        oldCard.benefit_id,
        oldCard.card_type,
        {
          replacement_for: cardId,
          expedited: reason === 'STOLEN'
        }
      );

      // Transfer balance and limits
      await client.query(
        `UPDATE spending_limits
         SET card_id = $1
         WHERE card_id = $2`,
        [replacementCard.card_id, cardId]
      );

      // Log incident
      await client.query(
        `INSERT INTO card_incidents
         (card_id, incident_type, reported_at, replacement_card_id, details)
         VALUES ($1, $2, NOW(), $3, $4)`,
        [cardId, reason, replacementCard.card_id,
         { reported_by: userId, auto_replaced: true }]
      );

      await client.query('COMMIT');

      // Notify fraud monitoring
      if (reason === 'STOLEN') {
        this.emit('card_stolen', {
          card_id: cardId,
          user_id: userId,
          immediate_action: 'BLOCKED_AND_REPLACED'
        });
      }

      return {
        success: true,
        old_card_blocked: true,
        replacement_card_id: replacementCard.card_id,
        replacement_card_number: replacementCard.card_number,
        expedited_delivery: reason === 'STOLEN'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Lost/stolen report error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update card spending limits
   */
  async updateSpendingLimits(cardId, userId, limits) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify card ownership
      const cardResult = await client.query(
        `SELECT bc.*, gb.program_type
         FROM benefit_cards bc
         JOIN government_benefits gb ON bc.benefit_id = gb.id
         WHERE bc.id = $1 AND bc.user_id = $2`,
        [cardId, userId]
      );

      if (cardResult.rows.length === 0) {
        throw new Error('Card not found');
      }

      const card = cardResult.rows[0];

      // Validate limits against program rules
      const validatedLimits = await this.validateLimits(
        limits,
        card.program_type
      );

      // Update limits
      for (const [limitType, limitValue] of Object.entries(validatedLimits)) {
        await client.query(
          `INSERT INTO spending_limits
           (card_id, limit_type, limit_value, period, active, created_at)
           VALUES ($1, $2, $3, $4, true, NOW())
           ON CONFLICT (card_id, limit_type, period)
           DO UPDATE SET
             limit_value = $3,
             updated_at = NOW()`,
          [cardId, limitType, limitValue, limits.period || 'DAILY']
        );
      }

      // Cache limits
      this.cardLimits.set(cardId, validatedLimits);

      // Log limit change
      await client.query(
        `INSERT INTO card_audit_logs
         (card_id, action, user_id, details, timestamp)
         VALUES ($1, 'LIMITS_UPDATED', $2, $3, NOW())`,
        [cardId, userId, validatedLimits]
      );

      await client.query('COMMIT');

      return {
        success: true,
        applied_limits: validatedLimits
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Limit update error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get card transaction history
   */
  async getCardTransactions(cardId, userId, filters = {}) {
    const client = await pool.connect();
    try {
      // Verify card ownership
      const cardCheck = await client.query(
        `SELECT 1 FROM benefit_cards WHERE id = $1 AND user_id = $2`,
        [cardId, userId]
      );

      if (cardCheck.rows.length === 0) {
        throw new Error('Card not found');
      }

      // Build query
      let query = `
        SELECT
          ct.*,
          m.name as merchant_name,
          m.category as merchant_category
        FROM card_transactions ct
        LEFT JOIN merchants m ON ct.merchant_id = m.id
        WHERE ct.card_id = $1
      `;

      const params = [cardId];
      let paramIndex = 2;

      if (filters.start_date) {
        query += ` AND ct.transaction_date >= $${paramIndex}`;
        params.push(filters.start_date);
        paramIndex++;
      }

      if (filters.end_date) {
        query += ` AND ct.transaction_date <= $${paramIndex}`;
        params.push(filters.end_date);
        paramIndex++;
      }

      if (filters.status) {
        query += ` AND ct.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      query += ` ORDER BY ct.transaction_date DESC LIMIT 100`;

      const result = await client.query(query, params);

      return {
        transactions: result.rows,
        count: result.rows.length
      };

    } catch (error) {
      console.error('Transaction history error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add card to digital wallet (Apple Pay, Google Pay)
   */
  async addToDigitalWallet(cardId, walletType, userId) {
    const client = await pool.connect();
    try {
      // Get card details
      const cardResult = await client.query(
        `SELECT * FROM benefit_cards WHERE id = $1 AND user_id = $2`,
        [cardId, userId]
      );

      if (cardResult.rows.length === 0) {
        throw new Error('Card not found');
      }

      const card = cardResult.rows[0];

      // Generate wallet token
      const walletToken = await this.generateWalletToken(card, walletType);

      // Store wallet provisioning
      await client.query(
        `INSERT INTO digital_wallet_provisions
         (card_id, wallet_type, device_id, token, provisioned_at, status)
         VALUES ($1, $2, $3, $4, NOW(), 'ACTIVE')`,
        [cardId, walletType, walletToken.device_id, walletToken.token]
      );

      // Generate provisioning data for wallet
      const provisioningData = await this.getProvisioningData(
        card,
        walletType,
        walletToken
      );

      return {
        success: true,
        wallet_type: walletType,
        provisioning_data: provisioningData,
        activation_required: false
      };

    } catch (error) {
      console.error('Digital wallet error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate QR code for cardless ATM withdrawal
   */
  async generateATMQRCode(cardId, userId, amount) {
    const client = await pool.connect();
    try {
      // Verify card and balance
      const verificationResult = await client.query(
        `SELECT bc.*, gb.balance_amount
         FROM benefit_cards bc
         JOIN government_benefits gb ON bc.benefit_id = gb.id
         WHERE bc.id = $1 AND bc.user_id = $2 AND bc.status = 'ACTIVE'`,
        [cardId, userId]
      );

      if (verificationResult.rows.length === 0) {
        throw new Error('Active card not found');
      }

      const card = verificationResult.rows[0];

      if (card.balance_amount < amount) {
        throw new Error('Insufficient balance');
      }

      // Generate secure withdrawal code
      const withdrawalCode = this.generateWithdrawalCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store withdrawal request
      const withdrawalResult = await client.query(
        `INSERT INTO atm_withdrawal_requests
         (card_id, amount, code_hash, expires_at, status, created_at)
         VALUES ($1, $2, $3, $4, 'PENDING', NOW())
         RETURNING id`,
        [cardId, amount, this.hashCode(withdrawalCode), expiresAt]
      );

      const withdrawalId = withdrawalResult.rows[0].id;

      // Generate QR code data
      const qrData = {
        withdrawal_id: withdrawalId,
        code: withdrawalCode,
        amount: amount,
        expires: expiresAt.toISOString()
      };

      // Create QR code image
      const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));

      return {
        success: true,
        qr_code: qrCodeImage,
        withdrawal_code: withdrawalCode,
        amount: amount,
        expires_in_seconds: 300,
        atm_locator: '/api/atm/nearest'
      };

    } catch (error) {
      console.error('QR code generation error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get card details (masked)
   */
  async getCardDetails(cardId, userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
          bc.*,
          gb.program_type,
          gb.balance_amount,
          COUNT(ct.id) as transaction_count,
          SUM(ct.amount) FILTER (WHERE ct.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_spent
         FROM benefit_cards bc
         JOIN government_benefits gb ON bc.benefit_id = gb.id
         LEFT JOIN card_transactions ct ON bc.id = ct.card_id
         WHERE bc.id = $1 AND bc.user_id = $2
         GROUP BY bc.id, gb.program_type, gb.balance_amount`,
        [cardId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Card not found');
      }

      const card = result.rows[0];

      // Get spending limits
      const limitsResult = await client.query(
        `SELECT * FROM spending_limits
         WHERE card_id = $1 AND active = true`,
        [cardId]
      );

      card.spending_limits = limitsResult.rows;

      // Get digital wallet status
      const walletResult = await client.query(
        `SELECT wallet_type, status FROM digital_wallet_provisions
         WHERE card_id = $1 AND status = 'ACTIVE'`,
        [cardId]
      );

      card.digital_wallets = walletResult.rows;

      return card;

    } catch (error) {
      console.error('Get card details error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate card details
   */
  async generateCardDetails(programType, cardType, options) {
    // Generate card number (16 digits)
    const bin = this.getBIN(programType); // Bank Identification Number
    const accountNumber = this.generateAccountNumber();
    const cardNumber = bin + accountNumber;
    const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
    const fullCardNumber = cardNumber + checkDigit;

    // Generate expiry date (3 years from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);

    // Generate CVV
    const cvv = this.generateCVV();

    // Generate PIN if physical card
    const pin = cardType === 'PHYSICAL' ? this.generatePIN() : null;

    return {
      card_number: fullCardNumber,
      masked_number: this.maskCardNumber(fullCardNumber),
      expiry_date: expiryDate,
      cvv: cvv,
      cvv_hash: this.hashCVV(cvv),
      pin: pin,
      pin_hash: pin ? this.hashPIN(pin) : null,
      card_network: 'VISA' // Default to Visa for government benefits
    };
  }

  /**
   * Store secure card data
   */
  async storeSecureCardData(cardId, cardDetails) {
    // In production, this would use HSM or secure key management
    // Store encrypted card data
    const encryptedData = this.encryptCardData({
      card_number: cardDetails.card_number,
      cvv: cardDetails.cvv,
      pin: cardDetails.pin
    });

    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO secure_card_vault
         (card_id, encrypted_data, encryption_key_id, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [cardId, encryptedData.data, encryptedData.key_id]
      );
    } finally {
      client.release();
    }
  }

  /**
   * Set initial card limits based on program
   */
  async setCardLimits(cardId, programType, client) {
    const BusinessRuleEngine = require('./businessRuleEngine');
    const rules = BusinessRuleEngine.FEDERAL_PROGRAM_RULES[programType];

    const limits = {
      DAILY_SPEND: rules.daily_limit || 500,
      DAILY_WITHDRAWAL: rules.max_cash_per_day || 200,
      DAILY_TRANSACTIONS: rules.max_daily_transactions || 10,
      SINGLE_TRANSACTION: rules.max_single_transaction || 200
    };

    for (const [type, value] of Object.entries(limits)) {
      await client.query(
        `INSERT INTO spending_limits
         (card_id, limit_type, limit_value, period, active, created_at)
         VALUES ($1, $2, $3, 'DAILY', true, NOW())`,
        [cardId, type, value]
      );
    }

    this.cardLimits.set(cardId, limits);
  }

  /**
   * Generate virtual card image
   */
  async generateVirtualCard(card, benefit) {
    // Generate card design based on program
    const design = {
      background: this.getCardBackground(benefit.program_type),
      logo: this.getProgramLogo(benefit.program_type),
      card_number: card.card_number,
      expiry: card.expiry_date.toISOString().substring(5, 7) + '/' +
              card.expiry_date.toISOString().substring(2, 4),
      cardholder_name: 'BENEFIT RECIPIENT',
      program_name: this.getProgramDisplayName(benefit.program_type)
    };

    // In production, this would generate actual card image
    return {
      image_url: `/api/cards/virtual/${card.id}/image`,
      design_template: design,
      can_add_to_wallet: true
    };
  }

  /**
   * Validate spending limits
   */
  async validateLimits(limits, programType) {
    const BusinessRuleEngine = require('./businessRuleEngine');
    const rules = BusinessRuleEngine.FEDERAL_PROGRAM_RULES[programType];

    const validated = {};

    // Ensure limits don't exceed program maximums
    if (limits.daily_spend) {
      validated.DAILY_SPEND = Math.min(
        limits.daily_spend,
        rules.daily_limit || 1000
      );
    }

    if (limits.daily_withdrawal) {
      validated.DAILY_WITHDRAWAL = Math.min(
        limits.daily_withdrawal,
        rules.max_cash_per_day || 500
      );
    }

    if (limits.daily_transactions) {
      validated.DAILY_TRANSACTIONS = Math.min(
        limits.daily_transactions,
        rules.max_daily_transactions || 20
      );
    }

    return validated;
  }

  /**
   * Generate wallet token
   */
  async generateWalletToken(card, walletType) {
    const tokenData = {
      card_id: card.id,
      wallet_type: walletType,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    };

    const token = crypto
      .createHash('sha256')
      .update(JSON.stringify(tokenData))
      .digest('hex');

    return {
      token,
      device_id: crypto.randomBytes(8).toString('hex'),
      expires_at: new Date(Date.now() + 3600000) // 1 hour
    };
  }

  /**
   * Get provisioning data for digital wallet
   */
  async getProvisioningData(card, walletType, token) {
    const data = {
      card_suffix: card.card_number.slice(-4),
      expiry_date: card.expiry_date,
      cardholder_name: 'BENEFIT RECIPIENT',
      token: token.token
    };

    if (walletType === 'APPLE_PAY') {
      data.activation_data = {
        encryptedPassData: this.encryptForApplePay(data),
        activationCodeRequired: false
      };
    } else if (walletType === 'GOOGLE_PAY') {
      data.activation_data = {
        opaquePaymentCard: this.encryptForGooglePay(data),
        userAddress: {} // Would include user address in production
      };
    }

    return data;
  }

  /**
   * Helper functions
   */
  getBIN(programType) {
    // Simplified BIN assignment
    const bins = {
      SNAP: '400000',
      TANF: '400001',
      WIC: '400002',
      DEFAULT: '400099'
    };
    return bins[programType] || bins.DEFAULT;
  }

  generateAccountNumber() {
    return crypto.randomBytes(4).toString('hex').padStart(9, '0');
  }

  calculateLuhnCheckDigit(cardNumber) {
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

  generateCVV() {
    return crypto.randomInt(100, 999).toString();
  }

  generatePIN() {
    return crypto.randomInt(1000, 9999).toString();
  }

  generateWithdrawalCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  maskCardNumber(cardNumber) {
    return cardNumber.substring(0, 4) + ' **** **** ' + cardNumber.slice(-4);
  }

  hashCVV(cvv) {
    return crypto.createHash('sha256').update(cvv + process.env.SALT).digest('hex');
  }

  hashPIN(pin) {
    return crypto.createHash('sha256').update(pin + process.env.SALT).digest('hex');
  }

  hashCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  encryptCardData(data) {
    // Simplified encryption - use proper KMS in production
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      data: encrypted,
      key_id: crypto.randomBytes(8).toString('hex')
    };
  }

  encryptForApplePay(data) {
    // Placeholder - would use Apple's encryption requirements
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  encryptForGooglePay(data) {
    // Placeholder - would use Google's encryption requirements
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  verifyActivationCode(cardId, code) {
    // Simplified verification
    return code.length === 6 && /^\d+$/.test(code);
  }

  getCardBackground(programType) {
    const backgrounds = {
      SNAP: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      TANF: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      WIC: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      DEFAULT: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    return backgrounds[programType] || backgrounds.DEFAULT;
  }

  getProgramLogo(programType) {
    return `/assets/logos/${programType.toLowerCase()}.svg`;
  }

  getProgramDisplayName(programType) {
    const names = {
      SNAP: 'SNAP Benefits',
      TANF: 'TANF Assistance',
      WIC: 'WIC Program',
      UI: 'Unemployment Insurance'
    };
    return names[programType] || programType;
  }

  /**
   * Load card providers
   */
  async loadCardProviders() {
    // Load configured card providers
    this.cardProviders.set('PRIMARY', {
      name: 'Primary Card Processor',
      api_endpoint: process.env.CARD_PROCESSOR_API,
      supports: ['VIRTUAL', 'PHYSICAL']
    });
  }

  /**
   * Load card configuration
   */
  async loadCardConfiguration() {
    // Load card program configurations
    console.log('Card configuration loaded');
  }

  /**
   * Start card monitoring
   */
  startCardMonitoring() {
    // Monitor card usage and fraud patterns
    setInterval(() => {
      this.checkCardUsagePatterns();
    }, 60000); // Every minute
  }

  /**
   * Schedule card maintenance
   */
  scheduleCardMaintenance() {
    // Daily maintenance tasks
    setInterval(() => {
      this.performCardMaintenance();
    }, 86400000); // Daily
  }

  /**
   * Check card usage patterns
   */
  async checkCardUsagePatterns() {
    // Monitor for unusual usage patterns
  }

  /**
   * Perform card maintenance
   */
  async performCardMaintenance() {
    const client = await pool.connect();
    try {
      // Expire old cards
      await client.query(
        `UPDATE benefit_cards
         SET status = 'EXPIRED'
         WHERE expiry_date < CURRENT_DATE
           AND status = 'ACTIVE'`
      );

      // Clean up expired withdrawal codes
      await client.query(
        `UPDATE atm_withdrawal_requests
         SET status = 'EXPIRED'
         WHERE expires_at < NOW()
           AND status = 'PENDING'`
      );

    } catch (error) {
      console.error('Card maintenance error:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Shutdown
   */
  shutdown() {
    console.log('Shutting down Benefit Card Management System');
    this.cardProviders.clear();
    this.virtualCards.clear();
    this.cardLimits.clear();
  }
}

// Export singleton instance
export default new BenefitCardManagement();