const { Pool } = require('pg');
const crypto = require('crypto');
const Redis = require('redis');
const moment = require('moment');
const EventEmitter = require('events');

/**
 * Invoice-First Wallet Architecture
 * Revolutionary approach where wallets are created from invoices
 * Patent-pending system for automatic wallet-card pairing
 */
class InvoiceFirstWallet extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/monay'
    });

    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.walletTypes = {
      EPHEMERAL: 'ephemeral',
      PERSISTENT: 'persistent',
      ADAPTIVE: 'adaptive',
      ENTERPRISE: 'enterprise'
    };

    this.cardTypes = {
      SINGLE_USE: 'single_use',
      MULTI_USE: 'multi_use',
      VIRTUAL: 'virtual',
      PHYSICAL: 'physical'
    };
  }

  /**
   * Create wallet from invoice
   */
  async createWalletFromInvoice(invoice) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Determine wallet type based on invoice characteristics
      const walletType = this.determineWalletType(invoice);

      // Create wallet
      const wallet = {
        wallet_id: crypto.randomUUID(),
        invoice_id: invoice.invoice_id,
        customer_id: invoice.customer_id,
        wallet_type: walletType,
        wallet_address: this.generateWalletAddress(),
        status: 'active',
        balance: 0,
        spending_limit: invoice.total_amount,
        created_at: new Date(),
        expires_at: this.calculateExpiration(walletType, invoice),
        metadata: {
          invoice_number: invoice.invoice_number,
          vendor: invoice.vendor_name,
          purpose: invoice.description,
          payment_terms: invoice.payment_terms
        }
      };

      // Insert wallet
      const walletQuery = `
        INSERT INTO invoice_wallets (
          wallet_id, invoice_id, customer_id, wallet_type,
          wallet_address, status, balance, spending_limit,
          created_at, expires_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const walletResult = await client.query(walletQuery, [
        wallet.wallet_id,
        wallet.invoice_id,
        wallet.customer_id,
        wallet.wallet_type,
        wallet.wallet_address,
        wallet.status,
        wallet.balance,
        wallet.spending_limit,
        wallet.created_at,
        wallet.expires_at,
        JSON.stringify(wallet.metadata)
      ]);

      // Automatically issue card for wallet
      const card = await this.issueCardForWallet(wallet, client);

      // Create spending rules based on invoice
      await this.createSpendingRules(wallet, invoice, client);

      // Set up auto-funding if needed
      if (invoice.auto_fund) {
        await this.setupAutoFunding(wallet, invoice, client);
      }

      await client.query('COMMIT');

      // Emit wallet creation event
      this.emit('walletCreated', {
        wallet,
        card,
        invoice
      });

      return {
        wallet: walletResult.rows[0],
        card,
        activation_required: walletType !== this.walletTypes.EPHEMERAL
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to create wallet from invoice:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Determine optimal wallet type
   */
  determineWalletType(invoice) {
    // Ephemeral: One-time payments
    if (invoice.payment_type === 'one_time' || invoice.recurring === false) {
      return this.walletTypes.EPHEMERAL;
    }

    // Persistent: Recurring payments
    if (invoice.recurring === true || invoice.subscription_id) {
      return this.walletTypes.PERSISTENT;
    }

    // Enterprise: Multi-user/department invoices
    if (invoice.department_id || invoice.multi_approval) {
      return this.walletTypes.ENTERPRISE;
    }

    // Adaptive: AI-driven routing (default)
    return this.walletTypes.ADAPTIVE;
  }

  /**
   * Issue card automatically for wallet
   */
  async issueCardForWallet(wallet, client) {
    const cardType = this.determineCardType(wallet.wallet_type);

    const card = {
      card_id: crypto.randomUUID(),
      wallet_id: wallet.wallet_id,
      card_number: this.generateCardNumber(),
      card_type: cardType,
      cvv: this.generateCVV(),
      expiry_date: this.calculateCardExpiry(wallet),
      status: 'active',
      spending_limit: wallet.spending_limit,
      daily_limit: Math.min(wallet.spending_limit, 5000),
      transaction_limit: Math.min(wallet.spending_limit / 2, 2500),
      issued_at: new Date(),
      last_four: null, // Will be set after number generation
      brand: 'Visa',
      metadata: {
        wallet_type: wallet.wallet_type,
        invoice_id: wallet.invoice_id,
        auto_issued: true
      }
    };

    // Set last four digits
    card.last_four = card.card_number.slice(-4);

    // Insert card
    const cardQuery = `
      INSERT INTO cards (
        card_id, wallet_id, card_number, card_type, cvv,
        expiry_date, status, spending_limit, daily_limit,
        transaction_limit, issued_at, last_four, brand, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await client.query(cardQuery, [
      card.card_id,
      card.wallet_id,
      this.encryptCardNumber(card.card_number),
      card.card_type,
      this.encryptCVV(card.cvv),
      card.expiry_date,
      card.status,
      card.spending_limit,
      card.daily_limit,
      card.transaction_limit,
      card.issued_at,
      card.last_four,
      card.brand,
      JSON.stringify(card.metadata)
    ]);

    // Create card controls
    await this.createCardControls(card, wallet, client);

    return {
      card_id: card.card_id,
      last_four: card.last_four,
      card_type: card.card_type,
      expiry_date: card.expiry_date,
      brand: card.brand,
      spending_limit: card.spending_limit
    };
  }

  /**
   * Determine card type based on wallet type
   */
  determineCardType(walletType) {
    switch (walletType) {
      case this.walletTypes.EPHEMERAL:
        return this.cardTypes.SINGLE_USE;
      case this.walletTypes.PERSISTENT:
        return this.cardTypes.MULTI_USE;
      case this.walletTypes.ENTERPRISE:
        return this.cardTypes.VIRTUAL;
      default:
        return this.cardTypes.VIRTUAL;
    }
  }

  /**
   * Create spending rules from invoice
   */
  async createSpendingRules(wallet, invoice, client) {
    const rules = [];

    // MCC restrictions based on invoice category
    if (invoice.category) {
      rules.push({
        rule_type: 'mcc_restriction',
        allowed_mccs: this.getCategoryMCCs(invoice.category),
        action: 'allow'
      });
    }

    // Vendor restrictions
    if (invoice.vendor_id) {
      rules.push({
        rule_type: 'vendor_restriction',
        allowed_vendors: [invoice.vendor_id],
        action: 'prefer'
      });
    }

    // Time restrictions
    if (invoice.valid_until) {
      rules.push({
        rule_type: 'time_restriction',
        valid_until: invoice.valid_until,
        action: 'block_after'
      });
    }

    // Amount restrictions
    rules.push({
      rule_type: 'amount_restriction',
      max_transaction: invoice.total_amount,
      remaining_balance: invoice.total_amount,
      action: 'enforce'
    });

    // Geographic restrictions
    if (invoice.geo_restriction) {
      rules.push({
        rule_type: 'geo_restriction',
        allowed_regions: invoice.allowed_regions || [],
        blocked_regions: invoice.blocked_regions || [],
        action: 'enforce'
      });
    }

    // Insert rules
    for (const rule of rules) {
      const ruleQuery = `
        INSERT INTO wallet_spending_rules (
          wallet_id, rule_type, rule_config, status, created_at
        ) VALUES ($1, $2, $3, 'active', NOW())
      `;

      await client.query(ruleQuery, [
        wallet.wallet_id,
        rule.rule_type,
        JSON.stringify(rule)
      ]);
    }

    return rules;
  }

  /**
   * Setup auto-funding for wallet
   */
  async setupAutoFunding(wallet, invoice, client) {
    const autoFunding = {
      wallet_id: wallet.wallet_id,
      funding_source: invoice.funding_source || 'primary_account',
      trigger_type: invoice.auto_fund_trigger || 'on_creation',
      amount: invoice.total_amount,
      frequency: invoice.payment_frequency || 'once',
      status: 'active'
    };

    const query = `
      INSERT INTO wallet_auto_funding (
        wallet_id, funding_source, trigger_type, amount, frequency, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    await client.query(query, [
      autoFunding.wallet_id,
      autoFunding.funding_source,
      autoFunding.trigger_type,
      autoFunding.amount,
      autoFunding.frequency,
      autoFunding.status
    ]);

    // Execute initial funding if trigger is on_creation
    if (autoFunding.trigger_type === 'on_creation') {
      await this.fundWallet(wallet, autoFunding.amount, client);
    }
  }

  /**
   * Fund wallet
   */
  async fundWallet(wallet, amount, client) {
    // Update wallet balance
    const updateQuery = `
      UPDATE invoice_wallets
      SET balance = balance + $1, updated_at = NOW()
      WHERE wallet_id = $2
      RETURNING *
    `;

    const result = await client.query(updateQuery, [amount, wallet.wallet_id]);

    // Record funding transaction
    const transactionQuery = `
      INSERT INTO wallet_transactions (
        transaction_id, wallet_id, type, amount, status,
        description, created_at
      ) VALUES ($1, $2, 'funding', $3, 'completed', $4, NOW())
    `;

    await client.query(transactionQuery, [
      crypto.randomUUID(),
      wallet.wallet_id,
      amount,
      'Auto-funding from invoice'
    ]);

    return result.rows[0];
  }

  /**
   * Create card controls
   */
  async createCardControls(card, wallet, client) {
    const controls = {
      card_id: card.card_id,
      online_transactions: true,
      international_transactions: wallet.wallet_type === this.walletTypes.ENTERPRISE,
      atm_withdrawals: wallet.wallet_type !== this.walletTypes.EPHEMERAL,
      contactless_payments: true,
      recurring_payments: wallet.wallet_type === this.walletTypes.PERSISTENT,
      max_daily_transactions: 50,
      max_daily_amount: card.daily_limit
    };

    const query = `
      INSERT INTO card_controls (
        card_id, online_transactions, international_transactions,
        atm_withdrawals, contactless_payments, recurring_payments,
        max_daily_transactions, max_daily_amount, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `;

    await client.query(query, [
      controls.card_id,
      controls.online_transactions,
      controls.international_transactions,
      controls.atm_withdrawals,
      controls.contactless_payments,
      controls.recurring_payments,
      controls.max_daily_transactions,
      controls.max_daily_amount
    ]);

    return controls;
  }

  /**
   * Process payment with invoice wallet
   */
  async processPayment(paymentRequest) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get wallet and validate
      const wallet = await this.getWallet(paymentRequest.wallet_id, client);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check wallet status
      if (wallet.status !== 'active') {
        throw new Error(`Wallet is ${wallet.status}`);
      }

      // Check balance
      if (wallet.balance < paymentRequest.amount) {
        throw new Error('Insufficient balance');
      }

      // Validate against spending rules
      const rulesValid = await this.validateSpendingRules(
        wallet,
        paymentRequest,
        client
      );

      if (!rulesValid.valid) {
        throw new Error(`Payment rejected: ${rulesValid.reason}`);
      }

      // Process the payment
      const transaction = {
        transaction_id: crypto.randomUUID(),
        wallet_id: wallet.wallet_id,
        amount: paymentRequest.amount,
        merchant: paymentRequest.merchant,
        mcc_code: paymentRequest.mcc_code,
        status: 'pending',
        created_at: new Date()
      };

      // Deduct from wallet
      const updateQuery = `
        UPDATE invoice_wallets
        SET balance = balance - $1, updated_at = NOW()
        WHERE wallet_id = $2 AND balance >= $1
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [
        transaction.amount,
        transaction.wallet_id
      ]);

      if (updateResult.rows.length === 0) {
        throw new Error('Failed to deduct from wallet');
      }

      // Record transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          transaction_id, wallet_id, type, amount, merchant_name,
          mcc_code, status, authorization_code, created_at
        ) VALUES ($1, $2, 'payment', $3, $4, $5, 'completed', $6, NOW())
        RETURNING *
      `;

      const transactionResult = await client.query(transactionQuery, [
        transaction.transaction_id,
        transaction.wallet_id,
        transaction.amount,
        transaction.merchant.name,
        transaction.mcc_code,
        this.generateAuthCode()
      ]);

      await client.query('COMMIT');

      // Check if wallet should be closed (ephemeral with zero balance)
      if (wallet.wallet_type === this.walletTypes.EPHEMERAL &&
          updateResult.rows[0].balance === 0) {
        await this.closeEphemeralWallet(wallet.wallet_id);
      }

      return {
        transaction: transactionResult.rows[0],
        remaining_balance: updateResult.rows[0].balance,
        wallet_status: updateResult.rows[0].status
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Payment processing failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate spending rules
   */
  async validateSpendingRules(wallet, payment, client) {
    const query = `
      SELECT * FROM wallet_spending_rules
      WHERE wallet_id = $1 AND status = 'active'
    `;

    const rules = await client.query(query, [wallet.wallet_id]);

    for (const rule of rules.rows) {
      const ruleConfig = rule.rule_config;

      switch (rule.rule_type) {
        case 'mcc_restriction':
          if (ruleConfig.allowed_mccs &&
              !ruleConfig.allowed_mccs.includes(payment.mcc_code)) {
            return {
              valid: false,
              reason: `MCC ${payment.mcc_code} not allowed`
            };
          }
          break;

        case 'amount_restriction':
          if (payment.amount > ruleConfig.max_transaction) {
            return {
              valid: false,
              reason: `Amount exceeds maximum transaction limit`
            };
          }
          break;

        case 'time_restriction':
          if (new Date() > new Date(ruleConfig.valid_until)) {
            return {
              valid: false,
              reason: `Payment window expired`
            };
          }
          break;

        case 'vendor_restriction':
          if (ruleConfig.allowed_vendors &&
              !ruleConfig.allowed_vendors.includes(payment.merchant.id)) {
            return {
              valid: false,
              reason: `Merchant not in approved list`
            };
          }
          break;
      }
    }

    return { valid: true };
  }

  /**
   * Close ephemeral wallet
   */
  async closeEphemeralWallet(walletId) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Update wallet status
      await client.query(
        `UPDATE invoice_wallets SET status = 'closed', closed_at = NOW()
         WHERE wallet_id = $1`,
        [walletId]
      );

      // Deactivate associated cards
      await client.query(
        `UPDATE cards SET status = 'deactivated' WHERE wallet_id = $1`,
        [walletId]
      );

      await client.query('COMMIT');

      this.emit('walletClosed', { wallet_id: walletId });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to close ephemeral wallet:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Get wallet details
   */
  async getWallet(walletId, client) {
    const query = `
      SELECT * FROM invoice_wallets WHERE wallet_id = $1
    `;
    const result = await client.query(query, [walletId]);
    return result.rows[0];
  }

  /**
   * Generate wallet address
   */
  generateWalletAddress() {
    return '0x' + crypto.randomBytes(20).toString('hex');
  }

  /**
   * Generate card number (test number - not for production)
   */
  generateCardNumber() {
    // This is a test card number pattern - replace with real issuer API
    const bin = '4532'; // Test BIN
    const accountNumber = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
    const cardNumber = bin + accountNumber;
    return cardNumber + this.calculateLuhn(cardNumber);
  }

  /**
   * Calculate Luhn checksum
   */
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

  /**
   * Generate CVV
   */
  generateCVV() {
    return Math.floor(Math.random() * 900 + 100).toString();
  }

  /**
   * Calculate card expiry
   */
  calculateCardExpiry(wallet) {
    if (wallet.wallet_type === this.walletTypes.EPHEMERAL) {
      return moment().add(1, 'month').format('MM/YY');
    }
    return moment().add(3, 'years').format('MM/YY');
  }

  /**
   * Calculate wallet expiration
   */
  calculateExpiration(walletType, invoice) {
    switch (walletType) {
      case this.walletTypes.EPHEMERAL:
        return moment().add(30, 'days').toDate();
      case this.walletTypes.PERSISTENT:
        return moment().add(1, 'year').toDate();
      case this.walletTypes.ENTERPRISE:
        return null; // No expiration
      default:
        return moment().add(90, 'days').toDate();
    }
  }

  /**
   * Get category MCCs
   */
  getCategoryMCCs(category) {
    const mccMappings = {
      'office_supplies': ['5111', '5943', '5044'],
      'travel': ['3000-3999', '4111', '4511', '7011'],
      'food_beverage': ['5411', '5412', '5499', '5812', '5813'],
      'technology': ['5045', '5732', '5734'],
      'healthcare': ['5912', '8011', '8021', '8031'],
      'fuel': ['5541', '5542', '5983'],
      'entertainment': ['7832', '7922', '7929', '7941']
    };

    return mccMappings[category] || [];
  }

  /**
   * Encrypt card number
   */
  encryptCardNumber(cardNumber) {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'test-key');
    let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Encrypt CVV
   */
  encryptCVV(cvv) {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'test-key');
    let encrypted = cipher.update(cvv, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Generate authorization code
   */
  generateAuthCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  /**
   * Create enterprise wallet hierarchy
   */
  async createEnterpriseWalletHierarchy(enterpriseConfig) {
    const hierarchy = {
      parent_wallet: null,
      department_wallets: [],
      user_wallets: []
    };

    // Create parent enterprise wallet
    const parentInvoice = {
      ...enterpriseConfig,
      invoice_id: crypto.randomUUID(),
      total_amount: enterpriseConfig.total_budget
    };

    hierarchy.parent_wallet = await this.createWalletFromInvoice(parentInvoice);

    // Create department wallets
    for (const dept of enterpriseConfig.departments || []) {
      const deptInvoice = {
        ...dept,
        invoice_id: crypto.randomUUID(),
        parent_wallet_id: hierarchy.parent_wallet.wallet.wallet_id,
        total_amount: dept.budget
      };

      const deptWallet = await this.createWalletFromInvoice(deptInvoice);
      hierarchy.department_wallets.push(deptWallet);

      // Create user wallets within department
      for (const user of dept.users || []) {
        const userInvoice = {
          ...user,
          invoice_id: crypto.randomUUID(),
          parent_wallet_id: deptWallet.wallet.wallet_id,
          total_amount: user.spending_limit
        };

        const userWallet = await this.createWalletFromInvoice(userInvoice);
        hierarchy.user_wallets.push(userWallet);
      }
    }

    return hierarchy;
  }
}

module.exports = InvoiceFirstWallet;