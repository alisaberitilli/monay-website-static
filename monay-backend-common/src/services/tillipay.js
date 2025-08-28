import axios from 'axios';
import crypto from 'crypto';
import { Logger } from './logger';

class TilliPayService {
  constructor() {
    this.baseURL = process.env.TILLIPAY_API_URL || 'https://stagingapi.tillipay.com';
    this.environment = process.env.TILLIPAY_ENV || 'staging';
    this.webhookSecret = process.env.TILLIPAY_WEBHOOK_SECRET;
    
    // Multiple merchant account configurations
    this.merchants = {
      main: {
        merchantId: process.env.TILLIPAY_MAIN_MERCHANT_ID || 'S2H0u5BJ5TUU',
        apiKey: process.env.TILLIPAY_MAIN_API_KEY,
        secretKey: process.env.TILLIPAY_MAIN_SECRET_KEY
      },
      card: {
        merchantId: process.env.TILLIPAY_CARD_MERCHANT_ID || 'eJ8Vj27cK6HW',
        apiKey: process.env.TILLIPAY_CARD_API_KEY,
        secretKey: process.env.TILLIPAY_CARD_SECRET_KEY
      },
      ach: {
        merchantId: process.env.TILLIPAY_ICA_MERCHANT_ID || 'idBABc0kwl2H',
        apiKey: process.env.TILLIPAY_ICA_API_KEY,
        secretKey: process.env.TILLIPAY_ICA_SECRET_KEY
      },
      cbp: {
        merchantId: process.env.TILLIPAY_CBP_MERCHANT_ID || '0weAXAvECTps',
        apiKey: process.env.TILLIPAY_CBP_API_KEY,
        secretKey: process.env.TILLIPAY_CBP_SECRET_KEY
      }
    };
    
    // Default to main merchant for general operations
    this.currentMerchant = 'main';
    
    this.logger = new Logger({
      logName: 'tillipay',
      logFolder: 'tillipay',
    });

    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.apiClient.interceptors.request.use(
      config => {
        this.logger.logInfo('TilliPay API Request', {
          method: config.method,
          url: config.url,
          params: config.params
        });
        return config;
      },
      error => {
        this.logger.logError('TilliPay API Request Error', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      response => {
        this.logger.logInfo('TilliPay API Response', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url
        });
        return response;
      },
      error => {
        this.logger.logError('TilliPay API Response Error', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        return Promise.reject(error);
      }
    );
  }

  generateSignature(payload) {
    const message = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
    return signature;
  }

  generateRequestId() {
    return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async authenticate() {
    try {
      const response = await this.apiClient.get(`/api/login/${this.merchantId}`, {
        headers: {
          'API-Key': this.apiKey,
          'Merchant-Id': this.merchantId
        }
      });

      if (response.data.token) {
        this.authToken = response.data.token;
        this.tokenExpiry = new Date(Date.now() + (response.data.expiresIn || 3600) * 1000);
        
        this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
        
        this.logger.logInfo('TilliPay Authentication Successful', {
          merchantId: this.merchantId,
          expiresAt: this.tokenExpiry
        });

        return {
          success: true,
          token: this.authToken,
          expiresAt: this.tokenExpiry
        };
      }

      throw new Error('No token received from TilliPay');
    } catch (error) {
      this.logger.logError('TilliPay Authentication Failed', error);
      throw new Error(`TilliPay authentication failed: ${error.message}`);
    }
  }

  async ensureAuthenticated() {
    if (!this.authToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  async createPaymentLink(params) {
    try {
      await this.ensureAuthenticated();

      const payload = {
        merchantId: this.merchantId,
        amount: params.amount,
        currency: params.currency || 'USD',
        orderId: params.orderId || this.generateRequestId(),
        description: params.description,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        redirectUrl: params.redirectUrl,
        webhookUrl: params.webhookUrl || `${process.env.APP_URL}/api/tillipay/webhook`,
        metadata: params.metadata || {}
      };

      const signature = this.generateSignature(payload, merchantType);
      
      const response = await this.apiClient.post('/api/payment-link', payload, {
        headers: {
          'X-Signature': signature
        }
      });

      this.logger.logInfo('Payment Link Created', {
        orderId: payload.orderId,
        paymentLinkId: response.data.paymentLinkId,
        paymentUrl: response.data.paymentUrl
      });

      return {
        success: true,
        paymentLinkId: response.data.paymentLinkId,
        paymentUrl: response.data.paymentUrl,
        orderId: payload.orderId,
        expiresAt: response.data.expiresAt
      };
    } catch (error) {
      this.logger.logError('Create Payment Link Failed', error);
      throw new Error(`Failed to create payment link: ${error.message}`);
    }
  }

  async processCardPayment(params) {
    try {
      await this.ensureAuthenticated();

      const payload = {
        merchantId: this.merchantId,
        amount: params.amount,
        currency: params.currency || 'USD',
        orderId: params.orderId || this.generateRequestId(),
        card: {
          number: params.cardNumber,
          expMonth: params.expMonth,
          expYear: params.expYear,
          cvv: params.cvv,
          holderName: params.cardHolderName
        },
        billing: {
          firstName: params.billingFirstName,
          lastName: params.billingLastName,
          email: params.billingEmail,
          phone: params.billingPhone,
          address: params.billingAddress,
          city: params.billingCity,
          state: params.billingState,
          postalCode: params.billingPostalCode,
          country: params.billingCountry || 'US'
        },
        metadata: params.metadata || {}
      };

      const signature = this.generateSignature(payload, merchantType);

      const response = await this.apiClient.post('/api/payment/card', payload, {
        headers: {
          'X-Signature': signature
        }
      });

      this.logger.logInfo('Card Payment Processed', {
        transactionId: response.data.transactionId,
        status: response.data.status,
        orderId: payload.orderId
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        status: response.data.status,
        orderId: payload.orderId,
        authorizationCode: response.data.authorizationCode,
        message: response.data.message
      };
    } catch (error) {
      this.logger.logError('Card Payment Failed', error);
      throw new Error(`Card payment failed: ${error.message}`);
    }
  }

  async processACHPayment(params) {
    try {
      await this.ensureAuthenticated();

      const payload = {
        merchantId: this.merchantId,
        amount: params.amount,
        currency: params.currency || 'USD',
        orderId: params.orderId || this.generateRequestId(),
        account: {
          accountNumber: params.accountNumber,
          routingNumber: params.routingNumber,
          accountType: params.accountType || 'checking',
          accountHolderName: params.accountHolderName
        },
        customer: {
          firstName: params.customerFirstName,
          lastName: params.customerLastName,
          email: params.customerEmail,
          phone: params.customerPhone,
          address: params.customerAddress,
          city: params.customerCity,
          state: params.customerState,
          postalCode: params.customerPostalCode,
          country: params.customerCountry || 'US'
        },
        metadata: params.metadata || {}
      };

      const signature = this.generateSignature(payload, merchantType);

      const response = await this.apiClient.post('/api/payment/ach', payload, {
        headers: {
          'X-Signature': signature
        }
      });

      this.logger.logInfo('ACH Payment Initiated', {
        transactionId: response.data.transactionId,
        status: response.data.status,
        orderId: payload.orderId
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        status: response.data.status,
        orderId: payload.orderId,
        estimatedSettlement: response.data.estimatedSettlement,
        message: response.data.message
      };
    } catch (error) {
      this.logger.logError('ACH Payment Failed', error);
      throw new Error(`ACH payment failed: ${error.message}`);
    }
  }

  async getPaymentStatus(transactionId, merchantType = 'main') {
    try {
      await this.ensureAuthenticated(merchantType);
      const merchant = this.getMerchantConfig(merchantType);

      const response = await this.apiClient.get(`/api/payment/status/${transactionId}`, {
        headers: {
          'Merchant-Id': merchant.merchantId
        }
      });

      this.logger.logInfo('Payment Status Retrieved', {
        transactionId,
        status: response.data.status
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
        orderId: response.data.orderId,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
        metadata: response.data.metadata
      };
    } catch (error) {
      this.logger.logError('Get Payment Status Failed', error);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  async refundPayment(params) {
    try {
      const merchantType = params.merchantType || 'main';
      await this.ensureAuthenticated(merchantType);
      const merchant = this.getMerchantConfig(merchantType);

      const payload = {
        merchantId: merchant.merchantId,
        transactionId: params.transactionId,
        amount: params.amount,
        reason: params.reason || 'Customer requested refund',
        metadata: params.metadata || {}
      };

      const signature = this.generateSignature(payload, merchantType);

      const response = await this.apiClient.post('/api/payment/refund', payload, {
        headers: {
          'X-Signature': signature
        }
      });

      this.logger.logInfo('Payment Refunded', {
        refundId: response.data.refundId,
        transactionId: params.transactionId,
        amount: params.amount,
        status: response.data.status
      });

      return {
        success: true,
        refundId: response.data.refundId,
        transactionId: params.transactionId,
        amount: response.data.amount,
        status: response.data.status,
        processedAt: response.data.processedAt
      };
    } catch (error) {
      this.logger.logError('Payment Refund Failed', error);
      throw new Error(`Payment refund failed: ${error.message}`);
    }
  }

  async capturePayment(params) {
    try {
      const merchantType = params.merchantType || 'card';
      await this.ensureAuthenticated(merchantType);
      const merchant = this.getMerchantConfig(merchantType);

      const payload = {
        merchantId: merchant.merchantId,
        transactionId: params.transactionId,
        amount: params.amount,
        metadata: params.metadata || {}
      };

      const signature = this.generateSignature(payload, merchantType);

      const response = await this.apiClient.post('/api/payment/capture', payload, {
        headers: {
          'X-Signature': signature
        }
      });

      this.logger.logInfo('Payment Captured', {
        transactionId: params.transactionId,
        amount: params.amount,
        status: response.data.status
      });

      return {
        success: true,
        transactionId: params.transactionId,
        amount: response.data.amount,
        status: response.data.status,
        capturedAt: response.data.capturedAt
      };
    } catch (error) {
      this.logger.logError('Payment Capture Failed', error);
      throw new Error(`Payment capture failed: ${error.message}`);
    }
  }

  async voidPayment(params) {
    try {
      const merchantType = params.merchantType || 'main';
      await this.ensureAuthenticated(merchantType);
      const merchant = this.getMerchantConfig(merchantType);

      const payload = {
        merchantId: merchant.merchantId,
        transactionId: params.transactionId,
        reason: params.reason || 'Transaction voided',
        metadata: params.metadata || {}
      };

      const signature = this.generateSignature(payload, merchantType);

      const response = await this.apiClient.post('/api/payment/void', payload, {
        headers: {
          'X-Signature': signature
        }
      });

      this.logger.logInfo('Payment Voided', {
        transactionId: params.transactionId,
        status: response.data.status
      });

      return {
        success: true,
        transactionId: params.transactionId,
        status: response.data.status,
        voidedAt: response.data.voidedAt
      };
    } catch (error) {
      this.logger.logError('Payment Void Failed', error);
      throw new Error(`Payment void failed: ${error.message}`);
    }
  }

  async getTransactionHistory(params = {}) {
    try {
      const merchantType = params.merchantType || 'main';
      await this.ensureAuthenticated(merchantType);
      const merchant = this.getMerchantConfig(merchantType);

      const queryParams = {
        merchantId: merchant.merchantId,
        startDate: params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: params.endDate || new Date().toISOString(),
        limit: params.limit || 100,
        offset: params.offset || 0,
        status: params.status,
        orderId: params.orderId
      };

      const response = await this.apiClient.get('/api/transactions', {
        params: queryParams
      });

      this.logger.logInfo('Transaction History Retrieved', {
        count: response.data.transactions?.length || 0,
        totalCount: response.data.totalCount
      });

      return {
        success: true,
        transactions: response.data.transactions || [],
        totalCount: response.data.totalCount,
        hasMore: response.data.hasMore
      };
    } catch (error) {
      this.logger.logError('Get Transaction History Failed', error);
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  validateWebhookSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret || this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  }

  async handleWebhook(payload, signature) {
    try {
      const isValid = this.validateWebhookSignature(payload, signature);
      
      if (!isValid) {
        this.logger.logError('Invalid Webhook Signature', {
          receivedSignature: signature
        });
        throw new Error('Invalid webhook signature');
      }

      this.logger.logInfo('Webhook Received', {
        eventType: payload.eventType,
        transactionId: payload.transactionId,
        status: payload.status
      });

      return {
        success: true,
        eventType: payload.eventType,
        transactionId: payload.transactionId,
        status: payload.status,
        data: payload
      };
    } catch (error) {
      this.logger.logError('Webhook Processing Failed', error);
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      // Test all merchant accounts
      const results = {};
      for (const [type, config] of Object.entries(this.merchants)) {
        try {
          const authResult = await this.authenticate(type);
          results[type] = {
            success: authResult.success,
            merchantId: config.merchantId
          };
        } catch (error) {
          results[type] = {
            success: false,
            error: error.message
          };
        }
      }
      
      this.logger.logInfo('TilliPay Connection Test Completed', results);
      
      return {
        success: Object.values(results).some(r => r.success),
        message: 'TilliPay connection test completed',
        environment: this.environment,
        merchants: results
      };
    } catch (error) {
      this.logger.logError('TilliPay Connection Test Failed', error);
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
        environment: this.environment
      };
    }
  }
}

export default new TilliPayService();