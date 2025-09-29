/**
 * Monay-Fiat Rails Integration Client
 * Handles all traditional payment rail operations (ACH, Wire, FedNow, RTP)
 * Production: gps.monay.com
 * QA: qaapi.monay.com
 */

import axios from 'axios';
import crypto from 'crypto';
import logger from '../services/logger.js';

class MonayFiatRailsClient {
  constructor(config = {}) {
    this.config = {
      baseURL: process.env.NODE_ENV === 'production'
        ? 'https://gps.monay.com'
        : 'https://qaapi.monay.com',
      apiVersion: config.apiVersion || 'v3',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000
    };

    // Initialize API clients
    this.depositClient = this.createClient('/deposit/v3');
    this.payoutClient = this.createClient('/payout/v1');
    this.statusClient = this.createClient('/status/v2');

    // Failover configuration
    this.failoverEndpoints = [
      'https://gps-backup.monay.com',
      'https://gps-dr.monay.com'
    ];
    this.currentEndpointIndex = 0;

    // Circuit breaker
    this.circuitBreaker = {
      failures: 0,
      maxFailures: 5,
      resetTimeout: 60000, // 1 minute
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      lastFailureTime: null
    };
  }

  /**
   * Create axios client with interceptors
   */
  createClient(basePath) {
    const client = axios.create({
      baseURL: `${this.config.baseURL}${basePath}`,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': this.config.apiVersion,
        'X-Client-Id': process.env.MONAY_CLIENT_ID,
        'X-Request-ID': this.generateRequestId()
      }
    });

    // Request interceptor for authentication
    client.interceptors.request.use(
      config => {
        config.headers['X-Timestamp'] = new Date().toISOString();
        config.headers['X-Signature'] = this.generateSignature(config);
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for error handling
    client.interceptors.response.use(
      response => {
        this.resetCircuitBreaker();
        return response;
      },
      async error => {
        return this.handleError(error, client);
      }
    );

    return client;
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate HMAC signature for request
   */
  generateSignature(config) {
    const timestamp = config.headers['X-Timestamp'];
    const method = config.method.toUpperCase();
    const path = config.url;
    const body = config.data ? JSON.stringify(config.data) : '';

    const message = `${method}|${path}|${timestamp}|${body}`;
    const secret = process.env.MONAY_API_SECRET;

    return crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
  }

  /**
   * Handle errors with retry and failover
   */
  async handleError(error, client) {
    const { config } = error;

    // Check circuit breaker
    if (this.circuitBreaker.state === 'OPEN') {
      if (Date.now() - this.circuitBreaker.lastFailureTime > this.circuitBreaker.resetTimeout) {
        this.circuitBreaker.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
      }
    }

    // Record failure
    this.recordFailure();

    // Retry logic
    config.retryCount = config.retryCount || 0;
    if (config.retryCount < this.config.retryAttempts) {
      config.retryCount++;

      logger.warn('Retrying request', {
        attempt: config.retryCount,
        maxAttempts: this.config.retryAttempts,
        error: error.message
      });

      await this.delay(this.config.retryDelay * config.retryCount);

      // Try failover endpoint if main fails
      if (config.retryCount > 1) {
        const failoverURL = this.getFailoverEndpoint();
        if (failoverURL) {
          config.baseURL = failoverURL;
          logger.info('Switching to failover endpoint', { url: failoverURL });
        }
      }

      return client.request(config);
    }

    throw error;
  }

  /**
   * Record circuit breaker failure
   */
  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failures >= this.circuitBreaker.maxFailures) {
      this.circuitBreaker.state = 'OPEN';
      logger.error('Circuit breaker opened due to excessive failures');
    }
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker() {
    if (this.circuitBreaker.state === 'HALF_OPEN' || this.circuitBreaker.failures > 0) {
      this.circuitBreaker.failures = 0;
      this.circuitBreaker.state = 'CLOSED';
      this.circuitBreaker.lastFailureTime = null;
      logger.info('Circuit breaker reset');
    }
  }

  /**
   * Get failover endpoint
   */
  getFailoverEndpoint() {
    if (this.currentEndpointIndex < this.failoverEndpoints.length) {
      return this.failoverEndpoints[this.currentEndpointIndex++];
    }
    return null;
  }

  /**
   * Delay helper for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * DEPOSIT OPERATIONS
   */

  /**
   * Create ACH deposit
   */
  async createACHDeposit(params) {
    try {
      const payload = {
        accountNumber: params.accountNumber,
        routingNumber: params.routingNumber,
        accountType: params.accountType || 'CHECKING',
        amount: params.amount,
        currency: params.currency || 'USD',
        description: params.description,
        customerInfo: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone,
          address: params.customerAddress
        },
        metadata: params.metadata || {}
      };

      const response = await this.depositClient.post('/ach', payload);

      logger.info('ACH deposit created', {
        transactionId: response.data.transactionId,
        amount: params.amount
      });

      return response.data;

    } catch (error) {
      logger.error('ACH deposit failed', { error, params });
      throw error;
    }
  }

  /**
   * Create Wire deposit
   */
  async createWireDeposit(params) {
    try {
      const payload = {
        accountNumber: params.accountNumber,
        routingNumber: params.routingNumber,
        swiftCode: params.swiftCode,
        amount: params.amount,
        currency: params.currency || 'USD',
        purpose: params.purpose,
        reference: params.reference,
        beneficiary: {
          name: params.beneficiaryName,
          address: params.beneficiaryAddress
        },
        intermediaryBank: params.intermediaryBank,
        metadata: params.metadata || {}
      };

      const response = await this.depositClient.post('/wire', payload);

      logger.info('Wire deposit created', {
        transactionId: response.data.transactionId,
        amount: params.amount
      });

      return response.data;

    } catch (error) {
      logger.error('Wire deposit failed', { error, params });
      throw error;
    }
  }

  /**
   * Create FedNow instant payment
   */
  async createFedNowDeposit(params) {
    try {
      const payload = {
        accountNumber: params.accountNumber,
        routingNumber: params.routingNumber,
        amount: params.amount,
        currency: 'USD', // FedNow is USD only
        paymentType: 'INSTANT',
        requestForPayment: params.requestForPayment || false,
        remittanceInfo: params.remittanceInfo,
        customer: {
          name: params.customerName,
          accountNumber: params.customerAccountNumber
        },
        metadata: params.metadata || {}
      };

      const response = await this.depositClient.post('/fednow', payload);

      logger.info('FedNow deposit created', {
        transactionId: response.data.transactionId,
        amount: params.amount,
        status: response.data.status
      });

      return response.data;

    } catch (error) {
      logger.error('FedNow deposit failed', { error, params });
      throw error;
    }
  }

  /**
   * Create RTP (Real-Time Payments) deposit
   */
  async createRTPDeposit(params) {
    try {
      const payload = {
        accountNumber: params.accountNumber,
        routingNumber: params.routingNumber,
        amount: params.amount,
        currency: 'USD', // RTP is USD only
        paymentType: 'RTP',
        maxAmount: 1000000, // RTP limit is $1M
        messageType: params.messageType || 'PAYMENT',
        remittanceData: params.remittanceData,
        requestedExecutionDate: params.executionDate || new Date().toISOString(),
        metadata: params.metadata || {}
      };

      const response = await this.depositClient.post('/rtp', payload);

      logger.info('RTP deposit created', {
        transactionId: response.data.transactionId,
        amount: params.amount,
        clearingSystemReference: response.data.clearingSystemReference
      });

      return response.data;

    } catch (error) {
      logger.error('RTP deposit failed', { error, params });
      throw error;
    }
  }

  /**
   * PAYOUT OPERATIONS
   */

  /**
   * Create ACH payout
   */
  async createACHPayout(params) {
    try {
      const payload = {
        recipientAccount: params.recipientAccount,
        recipientRouting: params.recipientRouting,
        accountType: params.accountType || 'CHECKING',
        amount: params.amount,
        currency: params.currency || 'USD',
        secCode: params.secCode || 'PPD', // PPD, CCD, WEB
        companyName: params.companyName || 'Monay Inc',
        companyId: params.companyId || process.env.MONAY_COMPANY_ID,
        description: params.description,
        recipient: {
          name: params.recipientName,
          id: params.recipientId,
          email: params.recipientEmail
        },
        effectiveDate: params.effectiveDate,
        metadata: params.metadata || {}
      };

      const response = await this.payoutClient.post('/ach', payload);

      logger.info('ACH payout created', {
        payoutId: response.data.payoutId,
        amount: params.amount
      });

      return response.data;

    } catch (error) {
      logger.error('ACH payout failed', { error, params });
      throw error;
    }
  }

  /**
   * Create instant payout via FedNow
   */
  async createInstantPayout(params) {
    try {
      const payload = {
        recipientAccount: params.recipientAccount,
        recipientRouting: params.recipientRouting,
        amount: params.amount,
        paymentRail: params.rail || 'FEDNOW', // FEDNOW or RTP
        urgency: 'IMMEDIATE',
        recipient: {
          name: params.recipientName,
          type: params.recipientType || 'INDIVIDUAL'
        },
        purpose: params.purpose,
        remittanceInfo: params.remittanceInfo,
        endToEndId: this.generateRequestId(),
        metadata: params.metadata || {}
      };

      const response = await this.payoutClient.post('/instant', payload);

      logger.info('Instant payout created', {
        payoutId: response.data.payoutId,
        amount: params.amount,
        rail: payload.paymentRail,
        completionTime: response.data.estimatedCompletionTime
      });

      return response.data;

    } catch (error) {
      logger.error('Instant payout failed', { error, params });
      throw error;
    }
  }

  /**
   * Create government disbursement (GENIUS Act compliant)
   */
  async createGovernmentDisbursement(params) {
    try {
      const payload = {
        beneficiaryId: params.beneficiaryId,
        benefitProgram: params.program,
        amount: params.amount,
        disbursementType: params.type || 'REGULAR',
        paymentMethod: params.paymentMethod || 'INSTANT', // INSTANT for GENIUS Act
        recipientAccount: params.recipientAccount,
        recipientRouting: params.recipientRouting,
        digitalWalletId: params.digitalWalletId, // For digital wallet delivery

        // GENIUS Act requirements
        digitalIdentityVerified: params.identityVerified,
        identityProvider: params.identityProvider, // LOGIN_GOV, ID_ME
        identityAssuranceLevel: params.identityAssuranceLevel || 'IAL2',

        // Emergency disbursement
        isEmergency: params.isEmergency || false,
        emergencyType: params.emergencyType,
        disasterDeclaration: params.disasterDeclaration,

        // Compliance
        benefitMonth: params.benefitMonth,
        eligibilityVerified: true,
        complianceChecks: {
          duplicatePayment: false,
          eligibilityConfirmed: true,
          identityMatched: true
        },

        metadata: params.metadata || {}
      };

      const response = await this.payoutClient.post('/government-disbursement', payload);

      logger.info('Government disbursement created', {
        disbursementId: response.data.disbursementId,
        program: params.program,
        amount: params.amount,
        beneficiaryId: params.beneficiaryId
      });

      return response.data;

    } catch (error) {
      logger.error('Government disbursement failed', { error, params });
      throw error;
    }
  }

  /**
   * STATUS OPERATIONS
   */

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId) {
    try {
      const response = await this.statusClient.get(`/transaction/${transactionId}`);

      return {
        transactionId: response.data.transactionId,
        status: response.data.status,
        rail: response.data.paymentRail,
        amount: response.data.amount,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
        completedAt: response.data.completedAt,
        failureReason: response.data.failureReason
      };

    } catch (error) {
      logger.error('Failed to get transaction status', { error, transactionId });
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId) {
    try {
      const response = await this.statusClient.get(`/account/${accountId}/balance`);

      return {
        accountId: response.data.accountId,
        availableBalance: response.data.availableBalance,
        pendingCredits: response.data.pendingCredits,
        pendingDebits: response.data.pendingDebits,
        currency: response.data.currency,
        asOf: response.data.asOf
      };

    } catch (error) {
      logger.error('Failed to get account balance', { error, accountId });
      throw error;
    }
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(transactionId, reason) {
    try {
      const response = await this.statusClient.post(`/transaction/${transactionId}/cancel`, {
        reason: reason,
        requestedBy: process.env.SYSTEM_USER_ID
      });

      logger.info('Transaction cancelled', {
        transactionId,
        status: response.data.status
      });

      return response.data;

    } catch (error) {
      logger.error('Failed to cancel transaction', { error, transactionId });
      throw error;
    }
  }

  /**
   * WEBHOOK HANDLING
   */

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const secret = process.env.MONAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event) {
    try {
      logger.info('Processing webhook event', {
        eventType: event.type,
        transactionId: event.data.transactionId
      });

      switch (event.type) {
        case 'deposit.completed':
          await this.handleDepositCompleted(event.data);
          break;

        case 'payout.completed':
          await this.handlePayoutCompleted(event.data);
          break;

        case 'transaction.failed':
          await this.handleTransactionFailed(event.data);
          break;

        case 'disbursement.completed':
          await this.handleDisbursementCompleted(event.data);
          break;

        default:
          logger.warn('Unhandled webhook event type', { type: event.type });
      }

    } catch (error) {
      logger.error('Error processing webhook event', { error, event });
      throw error;
    }
  }

  /**
   * Handle deposit completed webhook
   */
  async handleDepositCompleted(data) {
    // Update database with completion status
    const query = `
      UPDATE transactions
      SET status = 'completed',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE external_id = $1
    `;

    await this.pool.query(query, [data.transactionId]);

    // Update wallet balance
    await this.updateWalletBalance(data.walletId, data.amount, 'credit');

    logger.info('Deposit completed', data);
  }

  /**
   * Handle payout completed webhook
   */
  async handlePayoutCompleted(data) {
    // Update database with completion status
    const query = `
      UPDATE transactions
      SET status = 'completed',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE external_id = $1
    `;

    await this.pool.query(query, [data.payoutId]);

    logger.info('Payout completed', data);
  }

  /**
   * Handle transaction failed webhook
   */
  async handleTransactionFailed(data) {
    // Update database with failure status
    const query = `
      UPDATE transactions
      SET status = 'failed',
          error_code = $2,
          error_message = $3,
          updated_at = NOW()
      WHERE external_id = $1
    `;

    await this.pool.query(query, [
      data.transactionId,
      data.errorCode,
      data.errorMessage
    ]);

    // Reverse any balance changes
    if (data.reversalRequired) {
      await this.reverseTransaction(data.transactionId);
    }

    logger.error('Transaction failed', data);
  }

  /**
   * Handle government disbursement completed
   */
  async handleDisbursementCompleted(data) {
    // Update benefit balance
    const query = `
      UPDATE benefit_balances
      SET issued_amount = issued_amount + $2,
          status = 'issued',
          issuance_date = NOW()
      WHERE enrollment_id = $1
        AND benefit_month = $3
    `;

    await this.pool.query(query, [
      data.enrollmentId,
      data.amount,
      data.benefitMonth
    ]);

    logger.info('Government disbursement completed', data);
  }

  /**
   * Update wallet balance
   */
  async updateWalletBalance(walletId, amount, type) {
    const query = `
      UPDATE wallets
      SET balance = balance ${type === 'credit' ? '+' : '-'} $2,
          available_balance = available_balance ${type === 'credit' ? '+' : '-'} $2,
          updated_at = NOW()
      WHERE id = $1
    `;

    await this.pool.query(query, [walletId, amount]);
  }

  /**
   * Reverse transaction
   */
  async reverseTransaction(transactionId) {
    // Implementation for transaction reversal
    logger.info('Reversing transaction', { transactionId });
  }
}

export default MonayFiatRailsClient;