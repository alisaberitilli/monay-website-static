const { Pool } = require('pg');
const crypto = require('crypto');
const Redis = require('redis');
const moment = require('moment');
const axios = require('axios');
const QRCode = require('qrcode');

/**
 * ATM Network Service
 * Cardless ATM withdrawals, AllPoint network integration
 * QR code and one-time PIN system
 */
class ATMNetwork {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/monay'
    });

    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    // ATM network partners
    this.networks = {
      ALLPOINT: {
        name: 'AllPoint',
        api_url: process.env.ALLPOINT_API || 'https://api.allpointnetwork.com',
        network_id: process.env.ALLPOINT_NETWORK_ID,
        atm_count: 55000
      },
      MONEYPASS: {
        name: 'MoneyPass',
        api_url: process.env.MONEYPASS_API || 'https://api.moneypass.com',
        network_id: process.env.MONEYPASS_NETWORK_ID,
        atm_count: 40000
      },
      CO_OP: {
        name: 'CO-OP',
        api_url: process.env.COOP_API || 'https://api.co-opfs.org',
        network_id: process.env.COOP_NETWORK_ID,
        atm_count: 30000
      }
    };

    this.withdrawalSessions = new Map();
  }

  /**
   * Generate cardless ATM withdrawal code
   */
  async generateCardlessWithdrawal(request) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify wallet and balance
      const wallet = await this.verifyWalletBalance(request.wallet_id, request.amount, client);
      if (!wallet) {
        throw new Error('Insufficient funds or wallet not found');
      }

      // Generate withdrawal session
      const withdrawalSession = {
        session_id: crypto.randomUUID(),
        wallet_id: request.wallet_id,
        customer_id: request.customer_id,
        amount: request.amount,
        withdrawal_type: request.type || 'qr_code', // qr_code, one_time_pin, biometric
        network: request.network || 'ALLPOINT',
        status: 'pending',
        created_at: new Date(),
        expires_at: moment().add(15, 'minutes').toDate()
      };

      // Generate access credentials based on type
      let accessCredentials = {};

      switch (withdrawalSession.withdrawal_type) {
        case 'qr_code':
          accessCredentials = await this.generateQRCodeAccess(withdrawalSession);
          break;
        case 'one_time_pin':
          accessCredentials = await this.generateOneTimePIN(withdrawalSession);
          break;
        case 'biometric':
          accessCredentials = await this.generateBiometricAccess(withdrawalSession);
          break;
        default:
          accessCredentials = await this.generateQRCodeAccess(withdrawalSession);
      }

      // Store withdrawal session
      const sessionQuery = `
        INSERT INTO atm_withdrawal_sessions (
          session_id, wallet_id, customer_id, amount,
          withdrawal_type, network, access_credentials,
          status, created_at, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
        RETURNING *
      `;

      await client.query(sessionQuery, [
        withdrawalSession.session_id,
        withdrawalSession.wallet_id,
        withdrawalSession.customer_id,
        withdrawalSession.amount,
        withdrawalSession.withdrawal_type,
        withdrawalSession.network,
        JSON.stringify(accessCredentials),
        withdrawalSession.status,
        withdrawalSession.expires_at
      ]);

      // Reserve funds in wallet
      await this.reserveFunds(wallet.wallet_id, withdrawalSession.amount, withdrawalSession.session_id, client);

      // Register with ATM network
      await this.registerWithATMNetwork(withdrawalSession, accessCredentials);

      await client.query('COMMIT');

      // Cache session for quick validation
      await this.cacheWithdrawalSession(withdrawalSession, accessCredentials);

      return {
        session_id: withdrawalSession.session_id,
        withdrawal_type: withdrawalSession.withdrawal_type,
        amount: withdrawalSession.amount,
        expires_at: withdrawalSession.expires_at,
        access: {
          ...accessCredentials.public,
          network: withdrawalSession.network,
          atm_locator: this.getATMLocatorUrl(withdrawalSession.network)
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to generate cardless withdrawal:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process ATM withdrawal
   */
  async processATMWithdrawal(request) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Validate withdrawal session
      const session = await this.validateWithdrawalSession(request.session_id, request.verification);
      if (!session) {
        throw new Error('Invalid or expired withdrawal session');
      }

      // Verify ATM terminal
      const atmValid = await this.verifyATMTerminal(request.terminal_id, session.network);
      if (!atmValid) {
        throw new Error('Invalid ATM terminal');
      }

      // Create withdrawal transaction
      const withdrawal = {
        transaction_id: crypto.randomUUID(),
        session_id: session.session_id,
        terminal_id: request.terminal_id,
        amount: session.amount,
        fee: this.calculateATMFee(session.amount, session.network),
        total_amount: session.amount + this.calculateATMFee(session.amount, session.network),
        location: request.location,
        status: 'processing',
        created_at: new Date()
      };

      // Process withdrawal from wallet
      const walletUpdate = await this.processWalletWithdrawal(
        session.wallet_id,
        withdrawal.total_amount,
        withdrawal.transaction_id,
        client
      );

      if (!walletUpdate) {
        throw new Error('Failed to process withdrawal from wallet');
      }

      // Record ATM transaction
      const transactionQuery = `
        INSERT INTO atm_transactions (
          transaction_id, session_id, terminal_id, amount,
          fee, total_amount, location, network,
          status, authorization_code, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *
      `;

      const authCode = this.generateAuthorizationCode();

      await client.query(transactionQuery, [
        withdrawal.transaction_id,
        withdrawal.session_id,
        withdrawal.terminal_id,
        withdrawal.amount,
        withdrawal.fee,
        withdrawal.total_amount,
        JSON.stringify(withdrawal.location),
        session.network,
        'completed',
        authCode
      ]);

      // Update session status
      await client.query(
        `UPDATE atm_withdrawal_sessions
         SET status = 'completed', completed_at = NOW()
         WHERE session_id = $1`,
        [session.session_id]
      );

      // Notify ATM network of completion
      await this.notifyNetworkCompletion(session.network, withdrawal);

      await client.query('COMMIT');

      // Clear cached session
      await this.clearWithdrawalSession(session.session_id);

      // Send notification to customer
      await this.sendWithdrawalNotification(session.customer_id, withdrawal);

      return {
        transaction_id: withdrawal.transaction_id,
        authorization_code: authCode,
        amount: withdrawal.amount,
        fee: withdrawal.fee,
        total_amount: withdrawal.total_amount,
        remaining_balance: walletUpdate.balance,
        status: 'completed'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('ATM withdrawal failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find nearby ATMs
   */
  async findNearbyATMs(request) {
    const { latitude, longitude, radius = 5, network = 'ALL', limit = 20 } = request;

    // Get ATM locations from networks
    const atms = [];

    if (network === 'ALL' || network === 'ALLPOINT') {
      const allpointATMs = await this.getNetworkATMs('ALLPOINT', latitude, longitude, radius);
      atms.push(...allpointATMs);
    }

    if (network === 'ALL' || network === 'MONEYPASS') {
      const moneypassATMs = await this.getNetworkATMs('MONEYPASS', latitude, longitude, radius);
      atms.push(...moneypassATMs);
    }

    if (network === 'ALL' || network === 'CO_OP') {
      const coopATMs = await this.getNetworkATMs('CO_OP', latitude, longitude, radius);
      atms.push(...coopATMs);
    }

    // Sort by distance
    const sortedATMs = atms
      .map(atm => ({
        ...atm,
        distance: this.calculateDistance(latitude, longitude, atm.latitude, atm.longitude)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return {
      location: { latitude, longitude },
      radius,
      atms: sortedATMs,
      total_found: sortedATMs.length
    };
  }

  /**
   * Cash deposit to ATM
   */
  async processCashDeposit(request) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify ATM supports deposits
      const atmSupportsDeposit = await this.verifyDepositCapability(request.terminal_id);
      if (!atmSupportsDeposit) {
        throw new Error('This ATM does not support cash deposits');
      }

      // Create deposit session
      const deposit = {
        deposit_id: crypto.randomUUID(),
        wallet_id: request.wallet_id,
        terminal_id: request.terminal_id,
        amount: request.amount,
        currency: request.currency || 'USD',
        bill_count: request.bill_count,
        status: 'processing',
        created_at: new Date()
      };

      // Validate bills (counterfeit detection simulation)
      const validationResult = await this.validateCashBills(request.bills);
      if (!validationResult.valid) {
        throw new Error(`Invalid bills detected: ${validationResult.reason}`);
      }

      // Record deposit transaction
      const depositQuery = `
        INSERT INTO atm_deposits (
          deposit_id, wallet_id, terminal_id, amount,
          currency, bill_count, bill_details, status,
          validation_result, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `;

      await client.query(depositQuery, [
        deposit.deposit_id,
        deposit.wallet_id,
        deposit.terminal_id,
        deposit.amount,
        deposit.currency,
        deposit.bill_count,
        JSON.stringify(request.bills),
        'completed',
        JSON.stringify(validationResult)
      ]);

      // Credit wallet
      await this.creditWallet(deposit.wallet_id, deposit.amount, deposit.deposit_id, client);

      await client.query('COMMIT');

      return {
        deposit_id: deposit.deposit_id,
        amount: deposit.amount,
        status: 'completed',
        credited_at: new Date()
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Cash deposit failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawalHistory(customerId, options = {}) {
    const { limit = 50, offset = 0, start_date, end_date } = options;

    let query = `
      SELECT
        at.*,
        aws.withdrawal_type,
        aws.network
      FROM atm_transactions at
      JOIN atm_withdrawal_sessions aws ON at.session_id = aws.session_id
      WHERE aws.customer_id = $1
    `;

    const params = [customerId];
    let paramIndex = 2;

    if (start_date) {
      query += ` AND at.created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND at.created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ` ORDER BY at.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);

    return {
      transactions: result.rows,
      total: result.rows.length,
      limit,
      offset
    };
  }

  /**
   * Set withdrawal limits
   */
  async setWithdrawalLimits(customerId, limits) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const limitsQuery = `
        INSERT INTO atm_withdrawal_limits (
          customer_id, daily_limit, weekly_limit, monthly_limit,
          per_transaction_limit, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (customer_id) DO UPDATE
        SET
          daily_limit = $2,
          weekly_limit = $3,
          monthly_limit = $4,
          per_transaction_limit = $5,
          updated_at = NOW()
        RETURNING *
      `;

      const result = await client.query(limitsQuery, [
        customerId,
        limits.daily_limit || 500,
        limits.weekly_limit || 2500,
        limits.monthly_limit || 10000,
        limits.per_transaction_limit || 500
      ]);

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to set withdrawal limits:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Helper: Generate QR code access
   */
  async generateQRCodeAccess(session) {
    const qrData = {
      session_id: session.session_id,
      amount: session.amount,
      network: session.network,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    };

    const signature = this.signData(qrData);
    const qrContent = {
      ...qrData,
      signature
    };

    // Generate QR code image
    const qrImage = await QRCode.toDataURL(JSON.stringify(qrContent), {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      private: qrContent,
      public: {
        qr_code: qrImage,
        qr_data: Buffer.from(JSON.stringify(qrContent)).toString('base64')
      }
    };
  }

  /**
   * Helper: Generate one-time PIN
   */
  async generateOneTimePIN(session) {
    const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN
    const reference = crypto.randomBytes(4).toString('hex').toUpperCase();

    return {
      private: {
        pin,
        reference,
        session_id: session.session_id
      },
      public: {
        pin,
        reference_code: reference,
        valid_for: '15 minutes'
      }
    };
  }

  /**
   * Helper: Generate biometric access
   */
  async generateBiometricAccess(session) {
    const biometricToken = crypto.randomUUID();
    const challenge = crypto.randomBytes(32).toString('base64');

    return {
      private: {
        token: biometricToken,
        challenge,
        session_id: session.session_id
      },
      public: {
        biometric_token: biometricToken,
        authentication_required: 'fingerprint_or_face',
        challenge
      }
    };
  }

  /**
   * Helper: Verify wallet balance
   */
  async verifyWalletBalance(walletId, amount, client) {
    const query = `
      SELECT * FROM wallets
      WHERE wallet_id = $1 AND balance >= $2 AND status = 'active'
    `;

    const result = await client.query(query, [walletId, amount]);
    return result.rows[0] || null;
  }

  /**
   * Helper: Reserve funds
   */
  async reserveFunds(walletId, amount, sessionId, client) {
    // Create reservation
    const reservationQuery = `
      INSERT INTO fund_reservations (
        reservation_id, wallet_id, amount, reference_type,
        reference_id, status, created_at, expires_at
      ) VALUES ($1, $2, $3, 'atm_withdrawal', $4, 'active', NOW(), $5)
    `;

    await client.query(reservationQuery, [
      crypto.randomUUID(),
      walletId,
      amount,
      sessionId,
      moment().add(15, 'minutes').toDate()
    ]);

    // Update available balance
    await client.query(
      `UPDATE wallets
       SET available_balance = available_balance - $1
       WHERE wallet_id = $2`,
      [amount, walletId]
    );
  }

  /**
   * Helper: Register with ATM network
   */
  async registerWithATMNetwork(session, credentials) {
    // Would integrate with actual ATM network APIs
    // This is a simulation
    const networkConfig = this.networks[session.network];

    if (!networkConfig) {
      throw new Error(`Unknown ATM network: ${session.network}`);
    }

    // Simulate API call to register withdrawal session
    console.log(`Registering withdrawal with ${networkConfig.name}`);

    return {
      network_reference: crypto.randomUUID(),
      registered: true
    };
  }

  /**
   * Helper: Cache withdrawal session
   */
  async cacheWithdrawalSession(session, credentials) {
    const key = `atm:session:${session.session_id}`;
    const data = {
      ...session,
      credentials: credentials.private
    };

    await this.redis.setex(key, 900, JSON.stringify(data)); // 15 minutes
    this.withdrawalSessions.set(session.session_id, data);
  }

  /**
   * Helper: Validate withdrawal session
   */
  async validateWithdrawalSession(sessionId, verification) {
    // Check cache first
    let session = this.withdrawalSessions.get(sessionId);

    if (!session) {
      const cached = await this.redis.get(`atm:session:${sessionId}`);
      if (cached) {
        session = JSON.parse(cached);
      }
    }

    if (!session) {
      // Check database
      const query = `
        SELECT * FROM atm_withdrawal_sessions
        WHERE session_id = $1 AND status = 'pending'
        AND expires_at > NOW()
      `;

      const result = await this.pool.query(query, [sessionId]);
      if (result.rows.length > 0) {
        session = result.rows[0];
      }
    }

    if (!session) {
      return null;
    }

    // Validate verification based on type
    switch (session.withdrawal_type) {
      case 'qr_code':
        // QR code is validated by session ID lookup
        return session;

      case 'one_time_pin':
        if (verification.pin === session.credentials.pin) {
          return session;
        }
        break;

      case 'biometric':
        if (verification.token === session.credentials.token) {
          return session;
        }
        break;
    }

    return null;
  }

  /**
   * Helper: Verify ATM terminal
   */
  async verifyATMTerminal(terminalId, network) {
    // Would verify with actual ATM network
    // Simulation for now
    return true;
  }

  /**
   * Helper: Calculate ATM fee
   */
  calculateATMFee(amount, network) {
    const fees = {
      ALLPOINT: 0, // Fee-free network
      MONEYPASS: 0, // Fee-free network
      CO_OP: 0, // Fee-free network
      OTHER: 3.00 // Out-of-network fee
    };

    return fees[network] || fees.OTHER;
  }

  /**
   * Helper: Process wallet withdrawal
   */
  async processWalletWithdrawal(walletId, amount, transactionId, client) {
    const updateQuery = `
      UPDATE wallets
      SET balance = balance - $1,
          available_balance = available_balance + $1,
          updated_at = NOW()
      WHERE wallet_id = $2 AND balance >= $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [amount, walletId]);

    if (result.rows.length === 0) {
      return null;
    }

    // Record wallet transaction
    const transactionQuery = `
      INSERT INTO wallet_transactions (
        transaction_id, wallet_id, type, amount,
        reference_type, reference_id, status, created_at
      ) VALUES ($1, $2, 'atm_withdrawal', $3, 'atm_transaction', $4, 'completed', NOW())
    `;

    await client.query(transactionQuery, [
      crypto.randomUUID(),
      walletId,
      amount,
      transactionId
    ]);

    return result.rows[0];
  }

  /**
   * Helper: Generate authorization code
   */
  generateAuthorizationCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  /**
   * Helper: Get ATM locator URL
   */
  getATMLocatorUrl(network) {
    const urls = {
      ALLPOINT: 'https://www.allpointnetwork.com/locator.html',
      MONEYPASS: 'https://moneypass.com/atm-locator/',
      CO_OP: 'https://co-opcreditunions.org/locator/'
    };

    return urls[network] || urls.ALLPOINT;
  }

  /**
   * Helper: Get network ATMs
   */
  async getNetworkATMs(network, latitude, longitude, radius) {
    // Would call actual network APIs
    // Simulating ATM data
    const mockATMs = [];

    for (let i = 0; i < 5; i++) {
      mockATMs.push({
        terminal_id: crypto.randomUUID(),
        network,
        name: `${network} ATM ${i + 1}`,
        address: `${100 + i} Main Street`,
        city: 'City',
        state: 'ST',
        zip: '12345',
        latitude: latitude + (Math.random() - 0.5) * 0.1,
        longitude: longitude + (Math.random() - 0.5) * 0.1,
        features: {
          deposit: Math.random() > 0.5,
          withdrawal: true,
          balance_inquiry: true,
          wheelchair_accessible: Math.random() > 0.3
        },
        hours: '24/7',
        fee_free: true
      });
    }

    return mockATMs;
  }

  /**
   * Helper: Calculate distance
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Helper: Convert to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Helper: Sign data
   */
  signData(data) {
    const key = process.env.ATM_SIGNING_KEY || 'test-signing-key';
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }

  /**
   * Helper: Verify deposit capability
   */
  async verifyDepositCapability(terminalId) {
    // Would check with actual ATM network
    // Simulation - 70% of ATMs support deposit
    return Math.random() > 0.3;
  }

  /**
   * Helper: Validate cash bills
   */
  async validateCashBills(bills) {
    // Simulate bill validation (counterfeit detection)
    // In production, would integrate with ATM hardware

    const invalidBills = bills.filter(bill => {
      // Simulate 0.1% chance of invalid bill
      return Math.random() < 0.001;
    });

    if (invalidBills.length > 0) {
      return {
        valid: false,
        reason: `${invalidBills.length} invalid bills detected`,
        invalid_bills: invalidBills
      };
    }

    return {
      valid: true,
      validated_count: bills.length,
      total_amount: bills.reduce((sum, bill) => sum + bill.value, 0)
    };
  }

  /**
   * Helper: Credit wallet
   */
  async creditWallet(walletId, amount, depositId, client) {
    const updateQuery = `
      UPDATE wallets
      SET balance = balance + $1, updated_at = NOW()
      WHERE wallet_id = $2
      RETURNING *
    `;

    await client.query(updateQuery, [amount, walletId]);

    // Record transaction
    const transactionQuery = `
      INSERT INTO wallet_transactions (
        transaction_id, wallet_id, type, amount,
        reference_type, reference_id, status, created_at
      ) VALUES ($1, $2, 'atm_deposit', $3, 'atm_deposit', $4, 'completed', NOW())
    `;

    await client.query(transactionQuery, [
      crypto.randomUUID(),
      walletId,
      amount,
      depositId
    ]);
  }

  /**
   * Helper: Clear withdrawal session
   */
  async clearWithdrawalSession(sessionId) {
    this.withdrawalSessions.delete(sessionId);
    await this.redis.del(`atm:session:${sessionId}`);
  }

  /**
   * Helper: Send withdrawal notification
   */
  async sendWithdrawalNotification(customerId, withdrawal) {
    // Would integrate with notification service
    console.log(`ATM withdrawal notification for customer ${customerId}:`, {
      amount: withdrawal.amount,
      fee: withdrawal.fee,
      location: withdrawal.location
    });
  }

  /**
   * Helper: Notify network completion
   */
  async notifyNetworkCompletion(network, withdrawal) {
    // Would notify ATM network of successful withdrawal
    console.log(`Notifying ${network} of withdrawal completion:`, withdrawal.transaction_id);
  }
}

module.exports = ATMNetwork;