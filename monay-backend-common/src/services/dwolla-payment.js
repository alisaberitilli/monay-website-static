/**
 * Dwolla Payment Service
 * Handles FedNow and RTP instant payments through Dwolla API
 * @module services/dwolla-payment
 */

import dwolla from 'dwolla-v2';
import HttpStatus from 'http-status';
import { CustomError } from '../middleware-app/errors.js';
import loggers from './logger.js';
import crypto from 'crypto';

class DwollaPaymentService {
  constructor() {
    this.environment = process.env.DWOLLA_ENVIRONMENT || 'sandbox';
    this.isInitialized = false;
    this.client = null;

    // Dwolla configuration
    this.config = {
      sandbox: {
        key: process.env.DWOLLA_KEY || '',
        secret: process.env.DWOLLA_SECRET || '',
        environment: 'sandbox'
      },
      production: {
        key: process.env.DWOLLA_PROD_KEY || '',
        secret: process.env.DWOLLA_PROD_SECRET || '',
        environment: 'production'
      }
    };

    // Payment limits
    this.limits = {
      instant: {
        min: 1, // $0.01
        max: 1000000 // $10,000.00
      },
      ach: {
        min: 1,
        max: 10000000 // $100,000.00
      }
    };
  }

  /**
   * Initialize Dwolla client
   */
  async initialize() {
    try {
      const config = this.config[this.environment];

      if (!config.key || !config.secret) {
        loggers.errorLogger.error('Dwolla credentials not configured');
        throw new Error('Dwolla credentials missing');
      }

      // Create Dwolla client
      this.client = new dwolla.Client({
        key: config.key,
        secret: config.secret,
        environment: config.environment
      });

      // Get application token
      this.appToken = await this.client.auth.client();

      this.isInitialized = true;
      loggers.infoLogger.info(`Dwolla ${this.environment} environment initialized`);

      return true;
    } catch (error) {
      loggers.errorLogger.error(`Failed to initialize Dwolla: ${error.message}`);
      throw new CustomError(
        'Failed to initialize payment service',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Ensure service is initialized
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Create or retrieve a Dwolla customer
   */
  async createCustomer(customerData) {
    await this.ensureInitialized();

    try {
      const requestBody = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        type: customerData.businessName ? 'business' : 'personal',
        businessName: customerData.businessName,
        ipAddress: customerData.ipAddress || '127.0.0.1'
      };

      // For verified customers (required for instant payments)
      if (customerData.verified) {
        requestBody.type = 'personal'; // or 'business'
        requestBody.address1 = customerData.address1;
        requestBody.city = customerData.city;
        requestBody.state = customerData.state;
        requestBody.postalCode = customerData.postalCode;
        requestBody.dateOfBirth = customerData.dateOfBirth;
        requestBody.ssn = customerData.ssn; // Last 4 digits for personal
      }

      const response = await this.appToken.post('customers', requestBody);
      const customerId = response.headers.get('location').split('/').pop();

      loggers.infoLogger.info(`Dwolla customer created: ${customerId}`);

      return {
        success: true,
        customerId,
        status: customerData.verified ? 'verified' : 'unverified'
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to create Dwolla customer: ${error.message}`);
      throw new CustomError(
        error.body?.message || 'Failed to create customer',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Add bank account funding source
   */
  async addBankAccount(customerId, bankData) {
    await this.ensureInitialized();

    try {
      const requestBody = {
        routingNumber: bankData.routingNumber,
        accountNumber: bankData.accountNumber,
        bankAccountType: bankData.accountType || 'checking',
        name: bankData.accountName
      };

      // For instant payment eligibility, use Plaid token if available
      if (bankData.plaidToken) {
        requestBody.plaidToken = bankData.plaidToken;
      }

      const customerUrl = `${this.client.tokenUrl}/customers/${customerId}`;
      const response = await this.appToken.post(
        `${customerUrl}/funding-sources`,
        requestBody
      );

      const fundingSourceId = response.headers.get('location').split('/').pop();

      // Check if funding source supports instant payments
      const fundingSource = await this.getFundingSource(fundingSourceId);

      loggers.infoLogger.info(`Bank account added: ${fundingSourceId}`);

      return {
        success: true,
        fundingSourceId,
        channels: fundingSource.channels || [],
        supportsInstant: fundingSource.channels?.includes('real-time-payments')
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to add bank account: ${error.message}`);
      throw new CustomError(
        error.body?.message || 'Failed to add bank account',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get funding source details
   */
  async getFundingSource(fundingSourceId) {
    await this.ensureInitialized();

    try {
      const response = await this.appToken.get(
        `funding-sources/${fundingSourceId}`
      );

      return response.body;
    } catch (error) {
      loggers.errorLogger.error(`Failed to get funding source: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process instant payment (FedNow/RTP)
   */
  async processInstantPayment(paymentData) {
    await this.ensureInitialized();

    try {
      const {
        sourceFundingSourceId,
        destinationFundingSourceId,
        amount,
        metadata,
        correlationId
      } = paymentData;

      // Validate amount
      if (amount < this.limits.instant.min || amount > this.limits.instant.max) {
        throw new Error(`Amount must be between $${this.limits.instant.min/100} and $${this.limits.instant.max/100}`);
      }

      const requestBody = {
        _links: {
          source: {
            href: `${this.client.tokenUrl}/funding-sources/${sourceFundingSourceId}`
          },
          destination: {
            href: `${this.client.tokenUrl}/funding-sources/${destinationFundingSourceId}`
          }
        },
        amount: {
          currency: 'USD',
          value: (amount / 100).toFixed(2) // Convert cents to dollars
        }
      };

      // Add RTP/FedNow details for instant processing
      requestBody.rtpDetails = {
        destination: metadata?.recipientName || 'Recipient'
      };

      // Add correlation ID for tracking
      if (correlationId) {
        requestBody.correlationId = correlationId;
      }

      // Add metadata
      if (metadata) {
        requestBody.metadata = metadata;
      }

      // Process instant transfer
      const response = await this.appToken.post('transfers', requestBody);
      const transferId = response.headers.get('location').split('/').pop();

      // Get transfer details to confirm network used
      const transfer = await this.getTransfer(transferId);

      loggers.infoLogger.info(`Instant payment processed: ${transferId}`);

      return {
        success: true,
        transferId,
        status: transfer.status,
        network: transfer.rtpDetails ? 'RTP' : (transfer.fedNowDetails ? 'FedNow' : 'Unknown'),
        processingTime: transfer.rtpDetails?.completedAt || transfer.fedNowDetails?.completedAt,
        amount: amount,
        correlationId: transfer.correlationId
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to process instant payment: ${error.message}`);
      throw new CustomError(
        error.body?.message || 'Failed to process instant payment',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Process standard ACH payment
   */
  async processACHPayment(paymentData) {
    await this.ensureInitialized();

    try {
      const {
        sourceFundingSourceId,
        destinationFundingSourceId,
        amount,
        metadata,
        clearing, // 'standard' or 'same-day'
        correlationId
      } = paymentData;

      // Validate amount
      if (amount < this.limits.ach.min || amount > this.limits.ach.max) {
        throw new Error(`Amount must be between $${this.limits.ach.min/100} and $${this.limits.ach.max/100}`);
      }

      const requestBody = {
        _links: {
          source: {
            href: `${this.client.tokenUrl}/funding-sources/${sourceFundingSourceId}`
          },
          destination: {
            href: `${this.client.tokenUrl}/funding-sources/${destinationFundingSourceId}`
          }
        },
        amount: {
          currency: 'USD',
          value: (amount / 100).toFixed(2)
        }
      };

      // Set clearing type
      if (clearing) {
        requestBody.clearing = {
          source: clearing,
          destination: clearing
        };
      }

      // Add metadata and correlation ID
      if (metadata) requestBody.metadata = metadata;
      if (correlationId) requestBody.correlationId = correlationId;

      const response = await this.appToken.post('transfers', requestBody);
      const transferId = response.headers.get('location').split('/').pop();

      loggers.infoLogger.info(`ACH payment processed: ${transferId}`);

      return {
        success: true,
        transferId,
        type: 'ACH',
        clearing: clearing || 'standard',
        estimatedCompletion: clearing === 'same-day' ? '1 business day' : '3-5 business days'
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to process ACH payment: ${error.message}`);
      throw new CustomError(
        error.body?.message || 'Failed to process ACH payment',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get transfer details
   */
  async getTransfer(transferId) {
    await this.ensureInitialized();

    try {
      const response = await this.appToken.get(`transfers/${transferId}`);
      return response.body;
    } catch (error) {
      loggers.errorLogger.error(`Failed to get transfer: ${error.message}`);
      throw new CustomError(
        'Failed to retrieve transfer details',
        HttpStatus.NOT_FOUND
      );
    }
  }

  /**
   * Cancel transfer (if still pending)
   */
  async cancelTransfer(transferId) {
    await this.ensureInitialized();

    try {
      const requestBody = { status: 'cancelled' };
      const response = await this.appToken.post(
        `transfers/${transferId}`,
        requestBody
      );

      loggers.infoLogger.info(`Transfer cancelled: ${transferId}`);

      return {
        success: true,
        transferId,
        status: 'cancelled'
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to cancel transfer: ${error.message}`);
      throw new CustomError(
        error.body?.message || 'Failed to cancel transfer',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Create webhook subscription
   */
  async createWebhookSubscription(url, secret) {
    await this.ensureInitialized();

    try {
      const requestBody = {
        url,
        secret
      };

      const response = await this.appToken.post(
        'webhook-subscriptions',
        requestBody
      );

      const subscriptionId = response.headers.get('location').split('/').pop();

      loggers.infoLogger.info(`Webhook subscription created: ${subscriptionId}`);

      return {
        success: true,
        subscriptionId
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to create webhook subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(headers, body, secret) {
    const signature = headers['x-dwolla-signature'];
    // Use imported crypto

    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    return hash === signature;
  }

  /**
   * Check if funding source supports instant payments
   */
  async checkInstantPaymentEligibility(fundingSourceId) {
    await this.ensureInitialized();

    try {
      const fundingSource = await this.getFundingSource(fundingSourceId);
      const channels = fundingSource.channels || [];

      return {
        eligible: channels.includes('real-time-payments'),
        channels,
        bankName: fundingSource.bankName,
        accountName: fundingSource.name
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to check instant payment eligibility: ${error.message}`);
      return {
        eligible: false,
        channels: [],
        error: error.message
      };
    }
  }

  /**
   * Get account balance (for Dwolla Balance accounts)
   */
  async getBalance(fundingSourceId) {
    await this.ensureInitialized();

    try {
      const response = await this.appToken.get(
        `funding-sources/${fundingSourceId}/balance`
      );

      return {
        success: true,
        balance: response.body.balance,
        lastUpdated: response.body.lastUpdated
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to get balance: ${error.message}`);
      throw new CustomError(
        'Failed to retrieve balance',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

export default new DwollaPaymentService();