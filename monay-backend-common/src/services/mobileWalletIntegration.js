import { Pool } from 'pg';
import crypto from 'crypto';
import Redis from 'redis';
import moment from 'moment';
import axios from 'axios';

/**
 * Mobile Wallet Integration
 * Apple Pay, Google Pay, Samsung Pay integration
 * NFC and contactless payment support
 */
class MobileWalletIntegration {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/monay'
    });

    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.walletProviders = {
      APPLE_PAY: {
        name: 'Apple Pay',
        api_url: process.env.APPLE_PAY_API || 'https://api.apple-pay.apple.com',
        merchant_id: process.env.APPLE_MERCHANT_ID
      },
      GOOGLE_PAY: {
        name: 'Google Pay',
        api_url: process.env.GOOGLE_PAY_API || 'https://pay.google.com/gp/p/api',
        merchant_id: process.env.GOOGLE_MERCHANT_ID
      },
      SAMSUNG_PAY: {
        name: 'Samsung Pay',
        api_url: process.env.SAMSUNG_PAY_API || 'https://api.samsung.com/pay',
        service_id: process.env.SAMSUNG_SERVICE_ID
      }
    };

    this.nfcSessions = new Map();
  }

  /**
   * Provision card to Apple Pay
   */
  async provisionApplePay(request) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify card ownership
      const card = await this.verifyCardOwnership(request.card_id, request.customer_id, client);
      if (!card) {
        throw new Error('Card not found or unauthorized');
      }

      // Generate Apple Pay certificate
      const applePayData = {
        provision_id: crypto.randomUUID(),
        card_id: request.card_id,
        device_id: request.device_id,
        device_type: request.device_type || 'iPhone',
        wallet_type: 'APPLE_PAY',
        certificates: await this.generateApplePayCertificates(card),
        dpan: this.generateDPAN(card.card_number), // Device PAN
        dpan_expiry: card.expiry_date,
        status: 'provisioning',
        created_at: new Date()
      };

      // Store provisioning request
      const provisionQuery = `
        INSERT INTO mobile_wallet_provisions (
          provision_id, card_id, device_id, device_type,
          wallet_type, dpan, dpan_expiry, certificates,
          status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `;

      await client.query(provisionQuery, [
        applePayData.provision_id,
        applePayData.card_id,
        applePayData.device_id,
        applePayData.device_type,
        applePayData.wallet_type,
        applePayData.dpan,
        applePayData.dpan_expiry,
        JSON.stringify(applePayData.certificates),
        applePayData.status
      ]);

      // Send to Apple Pay API
      const activationData = await this.activateApplePayCard(applePayData);

      // Update provision status
      await client.query(
        `UPDATE mobile_wallet_provisions
         SET status = 'active', activation_data = $1, activated_at = NOW()
         WHERE provision_id = $2`,
        [JSON.stringify(activationData), applePayData.provision_id]
      );

      // Create NFC profile
      await this.createNFCProfile(applePayData, client);

      await client.query('COMMIT');

      return {
        provision_id: applePayData.provision_id,
        wallet_type: 'APPLE_PAY',
        device_id: applePayData.device_id,
        status: 'active',
        last_four: card.last_four,
        card_art_url: this.getCardArtUrl(card),
        activation_required: false
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Apple Pay provisioning failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Provision card to Google Pay
   */
  async provisionGooglePay(request) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify card ownership
      const card = await this.verifyCardOwnership(request.card_id, request.customer_id, client);
      if (!card) {
        throw new Error('Card not found or unauthorized');
      }

      // Generate Google Pay token
      const googlePayData = {
        provision_id: crypto.randomUUID(),
        card_id: request.card_id,
        device_id: request.device_id,
        device_type: request.device_type || 'Android',
        wallet_type: 'GOOGLE_PAY',
        token: await this.generateGooglePayToken(card),
        token_reference: crypto.randomUUID(),
        status: 'pending',
        created_at: new Date()
      };

      // Store provisioning request
      const provisionQuery = `
        INSERT INTO mobile_wallet_provisions (
          provision_id, card_id, device_id, device_type,
          wallet_type, dpan, token_reference, metadata,
          status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `;

      await client.query(provisionQuery, [
        googlePayData.provision_id,
        googlePayData.card_id,
        googlePayData.device_id,
        googlePayData.device_type,
        googlePayData.wallet_type,
        googlePayData.token.dpan,
        googlePayData.token_reference,
        JSON.stringify(googlePayData.token),
        googlePayData.status
      ]);

      // Send to Google Pay API
      const activationData = await this.activateGooglePayCard(googlePayData);

      // Update provision status
      await client.query(
        `UPDATE mobile_wallet_provisions
         SET status = 'active', activation_data = $1, activated_at = NOW()
         WHERE provision_id = $2`,
        [JSON.stringify(activationData), googlePayData.provision_id]
      );

      // Enable NFC payments
      await this.enableNFCPayments(googlePayData, client);

      await client.query('COMMIT');

      return {
        provision_id: googlePayData.provision_id,
        wallet_type: 'GOOGLE_PAY',
        device_id: googlePayData.device_id,
        status: 'active',
        last_four: card.last_four,
        token_reference: googlePayData.token_reference,
        card_art_url: this.getCardArtUrl(card)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Google Pay provisioning failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate QR code for payments
   */
  async generatePaymentQR(request) {
    const qrData = {
      qr_id: crypto.randomUUID(),
      wallet_id: request.wallet_id,
      amount: request.amount,
      merchant: request.merchant,
      reference: request.reference || crypto.randomUUID(),
      type: request.type || 'dynamic', // static or dynamic
      valid_for: request.valid_for || 300, // seconds
      created_at: new Date(),
      expires_at: moment().add(request.valid_for || 300, 'seconds').toDate()
    };

    // Generate QR code content
    const qrContent = {
      version: '1.0',
      type: 'payment',
      provider: 'monay',
      data: {
        qr_id: qrData.qr_id,
        amount: qrData.amount,
        currency: request.currency || 'USD',
        merchant: qrData.merchant,
        reference: qrData.reference,
        timestamp: qrData.created_at.getTime()
      },
      signature: this.signQRData(qrData)
    };

    // Store QR code data
    const query = `
      INSERT INTO payment_qr_codes (
        qr_id, wallet_id, amount, merchant, reference,
        type, qr_content, valid_for, expires_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      qrData.qr_id,
      qrData.wallet_id,
      qrData.amount,
      JSON.stringify(qrData.merchant),
      qrData.reference,
      qrData.type,
      JSON.stringify(qrContent),
      qrData.valid_for,
      qrData.expires_at
    ]);

    // Cache for quick validation
    await this.redis.setex(
      `qr:${qrData.qr_id}`,
      qrData.valid_for,
      JSON.stringify(qrData)
    );

    // Generate QR code image
    const qrImage = await this.generateQRImage(qrContent);

    return {
      qr_id: qrData.qr_id,
      qr_code: qrImage,
      qr_data: Buffer.from(JSON.stringify(qrContent)).toString('base64'),
      expires_at: qrData.expires_at,
      reference: qrData.reference
    };
  }

  /**
   * Process NFC payment
   */
  async processNFCPayment(request) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Validate NFC session
      const session = await this.validateNFCSession(request.session_id);
      if (!session) {
        throw new Error('Invalid or expired NFC session');
      }

      // Get provisioned card
      const provision = await this.getProvisionedCard(request.device_id, request.wallet_type);
      if (!provision) {
        throw new Error('No provisioned card found');
      }

      // Create NFC transaction
      const nfcTransaction = {
        transaction_id: crypto.randomUUID(),
        provision_id: provision.provision_id,
        session_id: request.session_id,
        amount: request.amount,
        merchant: request.merchant,
        terminal_id: request.terminal_id,
        transaction_type: 'contactless',
        cryptogram: request.cryptogram, // EMV cryptogram
        status: 'processing',
        created_at: new Date()
      };

      // Validate cryptogram
      const cryptogramValid = await this.validateCryptogram(
        nfcTransaction.cryptogram,
        provision
      );

      if (!cryptogramValid) {
        throw new Error('Invalid transaction cryptogram');
      }

      // Process payment
      const paymentResult = await this.processContactlessPayment(nfcTransaction, client);

      // Record NFC transaction
      const transactionQuery = `
        INSERT INTO nfc_transactions (
          transaction_id, provision_id, session_id, amount,
          merchant, terminal_id, transaction_type, cryptogram,
          status, authorization_code, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *
      `;

      await client.query(transactionQuery, [
        nfcTransaction.transaction_id,
        nfcTransaction.provision_id,
        nfcTransaction.session_id,
        nfcTransaction.amount,
        JSON.stringify(nfcTransaction.merchant),
        nfcTransaction.terminal_id,
        nfcTransaction.transaction_type,
        nfcTransaction.cryptogram,
        paymentResult.status,
        paymentResult.authorization_code
      ]);

      await client.query('COMMIT');

      // Send push notification
      await this.sendPaymentNotification(provision, nfcTransaction);

      return {
        transaction_id: nfcTransaction.transaction_id,
        status: paymentResult.status,
        authorization_code: paymentResult.authorization_code,
        amount: nfcTransaction.amount,
        merchant: nfcTransaction.merchant.name,
        timestamp: nfcTransaction.created_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('NFC payment failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process transit payment
   */
  async processTransitPayment(request) {
    const transitPayment = {
      payment_id: crypto.randomUUID(),
      card_id: request.card_id,
      transit_system: request.transit_system,
      entry_point: request.entry_point,
      exit_point: request.exit_point || null,
      fare_type: request.fare_type || 'single_ride',
      base_fare: request.base_fare,
      distance_fare: request.distance_fare || 0,
      total_fare: request.base_fare + (request.distance_fare || 0),
      status: 'pending',
      created_at: new Date()
    };

    // Check for daily/weekly caps
    const fareCapCheck = await this.checkFareCap(
      request.card_id,
      request.transit_system
    );

    if (fareCapCheck.capped) {
      transitPayment.total_fare = 0;
      transitPayment.cap_applied = true;
    }

    // Process the payment
    const query = `
      INSERT INTO transit_payments (
        payment_id, card_id, transit_system, entry_point,
        exit_point, fare_type, base_fare, distance_fare,
        total_fare, cap_applied, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      transitPayment.payment_id,
      transitPayment.card_id,
      transitPayment.transit_system,
      transitPayment.entry_point,
      transitPayment.exit_point,
      transitPayment.fare_type,
      transitPayment.base_fare,
      transitPayment.distance_fare,
      transitPayment.total_fare,
      transitPayment.cap_applied || false,
      'completed'
    ]);

    // Update fare cap tracker
    await this.updateFareCapTracker(
      request.card_id,
      request.transit_system,
      transitPayment.total_fare
    );

    return {
      payment_id: transitPayment.payment_id,
      fare_charged: transitPayment.total_fare,
      cap_applied: transitPayment.cap_applied || false,
      daily_spent: fareCapCheck.daily_spent + transitPayment.total_fare,
      daily_cap: fareCapCheck.daily_cap
    };
  }

  /**
   * Manage Samsung Pay provisioning
   */
  async provisionSamsungPay(request) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify card ownership
      const card = await this.verifyCardOwnership(request.card_id, request.customer_id, client);
      if (!card) {
        throw new Error('Card not found or unauthorized');
      }

      // Generate Samsung Pay data
      const samsungPayData = {
        provision_id: crypto.randomUUID(),
        card_id: request.card_id,
        device_id: request.device_id,
        wallet_type: 'SAMSUNG_PAY',
        service_id: this.walletProviders.SAMSUNG_PAY.service_id,
        card_info: await this.prepareSamsungPayCard(card),
        status: 'provisioning',
        created_at: new Date()
      };

      // Store provisioning
      const provisionQuery = `
        INSERT INTO mobile_wallet_provisions (
          provision_id, card_id, device_id, device_type,
          wallet_type, metadata, status, created_at
        ) VALUES ($1, $2, $3, 'Samsung', $4, $5, $6, NOW())
        RETURNING *
      `;

      await client.query(provisionQuery, [
        samsungPayData.provision_id,
        samsungPayData.card_id,
        samsungPayData.device_id,
        samsungPayData.wallet_type,
        JSON.stringify(samsungPayData.card_info),
        samsungPayData.status
      ]);

      // Activate with Samsung Pay
      const activation = await this.activateSamsungPayCard(samsungPayData);

      // Update status
      await client.query(
        `UPDATE mobile_wallet_provisions
         SET status = 'active', activation_data = $1, activated_at = NOW()
         WHERE provision_id = $2`,
        [JSON.stringify(activation), samsungPayData.provision_id]
      );

      await client.query('COMMIT');

      return {
        provision_id: samsungPayData.provision_id,
        wallet_type: 'SAMSUNG_PAY',
        device_id: samsungPayData.device_id,
        status: 'active'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Samsung Pay provisioning failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get provisioned cards for device
   */
  async getProvisionedCards(deviceId) {
    const query = `
      SELECT p.*, c.last_four, c.brand, c.card_type
      FROM mobile_wallet_provisions p
      JOIN cards c ON p.card_id = c.card_id
      WHERE p.device_id = $1 AND p.status = 'active'
      ORDER BY p.created_at DESC
    `;

    const result = await this.pool.query(query, [deviceId]);

    return result.rows.map(row => ({
      provision_id: row.provision_id,
      wallet_type: row.wallet_type,
      last_four: row.last_four,
      brand: row.brand,
      card_type: row.card_type,
      is_default: row.is_default || false,
      created_at: row.created_at
    }));
  }

  /**
   * Remove card from wallet
   */
  async removeFromWallet(provisionId) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get provision details
      const provision = await client.query(
        'SELECT * FROM mobile_wallet_provisions WHERE provision_id = $1',
        [provisionId]
      );

      if (provision.rows.length === 0) {
        throw new Error('Provision not found');
      }

      const provisionData = provision.rows[0];

      // Notify wallet provider
      await this.notifyWalletProviderRemoval(provisionData);

      // Update provision status
      await client.query(
        `UPDATE mobile_wallet_provisions
         SET status = 'removed', removed_at = NOW()
         WHERE provision_id = $1`,
        [provisionId]
      );

      // Remove NFC profiles
      await client.query(
        'DELETE FROM nfc_profiles WHERE provision_id = $1',
        [provisionId]
      );

      await client.query('COMMIT');

      return {
        provision_id: provisionId,
        status: 'removed',
        removed_at: new Date()
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to remove from wallet:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Helper: Verify card ownership
   */
  async verifyCardOwnership(cardId, customerId, client) {
    const query = `
      SELECT c.*, w.customer_id
      FROM cards c
      JOIN wallets w ON c.wallet_id = w.wallet_id
      WHERE c.card_id = $1 AND w.customer_id = $2
    `;

    const result = await client.query(query, [cardId, customerId]);
    return result.rows[0] || null;
  }

  /**
   * Helper: Generate Apple Pay certificates
   */
  async generateApplePayCertificates(card) {
    // Simplified - would integrate with Apple Pay API
    return {
      leaf_certificate: crypto.randomBytes(256).toString('base64'),
      sub_ca_certificate: crypto.randomBytes(256).toString('base64'),
      device_certificate: crypto.randomBytes(128).toString('base64'),
      nonce: crypto.randomBytes(16).toString('hex'),
      nonce_signature: crypto.randomBytes(64).toString('base64')
    };
  }

  /**
   * Helper: Generate DPAN
   */
  generateDPAN(cardNumber) {
    // Generate unique device PAN
    const dpan = '9' + cardNumber.substring(1); // Change first digit to 9
    return dpan;
  }

  /**
   * Helper: Generate Google Pay token
   */
  async generateGooglePayToken(card) {
    return {
      dpan: this.generateDPAN(card.card_number),
      expiry: card.expiry_date,
      cryptogram_key: crypto.randomBytes(32).toString('hex'),
      token_number: crypto.randomBytes(8).toString('hex'),
      device_info: {
        device_id: crypto.randomUUID(),
        device_name: 'User Device',
        device_type: 'MOBILE_PHONE'
      }
    };
  }

  /**
   * Helper: Create NFC profile
   */
  async createNFCProfile(provisionData, client) {
    const nfcProfile = {
      profile_id: crypto.randomUUID(),
      provision_id: provisionData.provision_id,
      se_id: crypto.randomUUID(), // Secure Element ID
      aid: this.generateAID(), // Application ID
      encryption_key: crypto.randomBytes(32).toString('hex'),
      status: 'active'
    };

    const query = `
      INSERT INTO nfc_profiles (
        profile_id, provision_id, se_id, aid,
        encryption_key, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    await client.query(query, [
      nfcProfile.profile_id,
      nfcProfile.provision_id,
      nfcProfile.se_id,
      nfcProfile.aid,
      nfcProfile.encryption_key,
      nfcProfile.status
    ]);

    return nfcProfile;
  }

  /**
   * Helper: Enable NFC payments
   */
  async enableNFCPayments(provisionData, client) {
    return this.createNFCProfile(provisionData, client);
  }

  /**
   * Helper: Validate NFC session
   */
  async validateNFCSession(sessionId) {
    const session = this.nfcSessions.get(sessionId);
    if (!session) {
      // Try to get from cache
      const cached = await this.redis.get(`nfc_session:${sessionId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    }

    // Check if expired
    if (moment().isAfter(session.expires_at)) {
      this.nfcSessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Helper: Get provisioned card
   */
  async getProvisionedCard(deviceId, walletType) {
    const query = `
      SELECT * FROM mobile_wallet_provisions
      WHERE device_id = $1 AND wallet_type = $2 AND status = 'active'
      ORDER BY is_default DESC, created_at DESC
      LIMIT 1
    `;

    const result = await this.pool.query(query, [deviceId, walletType]);
    return result.rows[0] || null;
  }

  /**
   * Helper: Validate cryptogram
   */
  async validateCryptogram(cryptogram, provision) {
    // Simplified cryptogram validation
    // Would integrate with EMV validation service
    return cryptogram && cryptogram.length > 16;
  }

  /**
   * Helper: Process contactless payment
   */
  async processContactlessPayment(transaction, client) {
    // Deduct from wallet balance
    const updateQuery = `
      UPDATE wallets
      SET balance = balance - $1
      WHERE wallet_id = (
        SELECT wallet_id FROM cards
        WHERE card_id = (
          SELECT card_id FROM mobile_wallet_provisions
          WHERE provision_id = $2
        )
      ) AND balance >= $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      transaction.amount,
      transaction.provision_id
    ]);

    if (result.rows.length === 0) {
      throw new Error('Insufficient funds');
    }

    return {
      status: 'approved',
      authorization_code: crypto.randomBytes(3).toString('hex').toUpperCase()
    };
  }

  /**
   * Helper: Send payment notification
   */
  async sendPaymentNotification(provision, transaction) {
    // Would integrate with push notification service
    console.log(`Payment notification for ${provision.device_id}: ${transaction.amount}`);
  }

  /**
   * Helper: Check fare cap
   */
  async checkFareCap(cardId, transitSystem) {
    const dayKey = `fare_cap:${cardId}:${transitSystem}:${moment().format('YYYY-MM-DD')}`;
    const weekKey = `fare_cap:${cardId}:${transitSystem}:week:${moment().week()}`;

    const dailySpent = parseFloat(await this.redis.get(dayKey) || 0);
    const weeklySpent = parseFloat(await this.redis.get(weekKey) || 0);

    const caps = {
      daily_cap: 15.00, // Example daily cap
      weekly_cap: 60.00, // Example weekly cap
      daily_spent: dailySpent,
      weekly_spent: weeklySpent,
      capped: dailySpent >= 15.00 || weeklySpent >= 60.00
    };

    return caps;
  }

  /**
   * Helper: Update fare cap tracker
   */
  async updateFareCapTracker(cardId, transitSystem, fare) {
    const dayKey = `fare_cap:${cardId}:${transitSystem}:${moment().format('YYYY-MM-DD')}`;
    const weekKey = `fare_cap:${cardId}:${transitSystem}:week:${moment().week()}`;

    await this.redis.incrbyfloat(dayKey, fare);
    await this.redis.incrbyfloat(weekKey, fare);

    await this.redis.expire(dayKey, 86400);
    await this.redis.expire(weekKey, 604800);
  }

  /**
   * Helper: Sign QR data
   */
  signQRData(data) {
    const key = process.env.QR_SIGNING_KEY || 'test-signing-key';
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }

  /**
   * Helper: Generate QR image
   */
  async generateQRImage(content) {
    // Would use QR code library
    // Returning base64 placeholder
    return Buffer.from(JSON.stringify(content)).toString('base64');
  }

  /**
   * Helper: Get card art URL
   */
  getCardArtUrl(card) {
    return `https://cards.monay.com/art/${card.brand.toLowerCase()}_${card.card_type}.png`;
  }

  /**
   * Helper: Generate AID
   */
  generateAID() {
    // Generate Application Identifier for NFC
    return 'A0000000031010' + crypto.randomBytes(2).toString('hex').toUpperCase();
  }

  /**
   * Helper: Activate with providers
   */
  async activateApplePayCard(data) {
    // Would integrate with Apple Pay API
    return {
      activation_id: crypto.randomUUID(),
      activated_at: new Date()
    };
  }

  async activateGooglePayCard(data) {
    // Would integrate with Google Pay API
    return {
      activation_id: crypto.randomUUID(),
      activated_at: new Date()
    };
  }

  async activateSamsungPayCard(data) {
    // Would integrate with Samsung Pay API
    return {
      activation_id: crypto.randomUUID(),
      activated_at: new Date()
    };
  }

  async prepareSamsungPayCard(card) {
    return {
      card_ref_id: crypto.randomUUID(),
      card_info: {
        last4: card.last_four,
        brand: card.brand,
        expiry: card.expiry_date
      }
    };
  }

  async notifyWalletProviderRemoval(provision) {
    // Would notify the wallet provider API
    console.log(`Removing ${provision.provision_id} from ${provision.wallet_type}`);
  }
}

export default MobileWalletIntegration;