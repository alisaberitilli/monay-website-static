import axios from 'axios';
import crypto from 'crypto';
import { Logger } from './logger';

class MonayFiatService {
  constructor() {
    this.baseURL = process.env.MONAY_FIAT_API_URL || 'https://pregps.monay.com/api';
    this.environment = process.env.MONAY_FIAT_ENV || 'production';
    this.webhookSecret = process.env.MONAY_FIAT_WEBHOOK_SECRET;
    
    // Multiple merchant account configurations with production credentials
    this.merchants = {
      main: {
        merchantId: process.env.MONAY_FIAT_MAIN_MERCHANT_ID || 'lpEGBQCW1mtX',
        apiKey: process.env.MONAY_FIAT_MAIN_API_KEY || 'cec7602a-1a16-4f7e-86b2-1856536006bf',
        secretKey: process.env.MONAY_FIAT_MAIN_SECRET_KEY || 'df76bfc2-a17e-4184-b1cc-658a93a838d4',
        paymentEngineApiKey: process.env.MONAY_FIAT_PE_API_KEY || 'SDLKJFJKALDFJSAJKFJKAJKFJKAJKFAKFAF09A09FAIOFJA0Fl',
        paymentEngineSecretKey: process.env.MONAY_FIAT_PE_SECRET_KEY || 'SDLKJFJKALDFJSAJKFJKAJKFJKAJKFAKFAF09A09FAIOFJA0FQ'
      },
      card: {
        merchantId: process.env.MONAY_FIAT_CARD_MERCHANT_ID || 'lpEGBQCW1mtX',
        apiKey: process.env.MONAY_FIAT_CARD_API_KEY || 'cec7602a-1a16-4f7e-86b2-1856536006bf',
        secretKey: process.env.MONAY_FIAT_CARD_SECRET_KEY || 'df76bfc2-a17e-4184-b1cc-658a93a838d4',
        paymentEngineApiKey: process.env.MONAY_FIAT_CARD_PE_API_KEY || 'SDLKJFJKALDFJSAJKFJKAJKFJKAJKFAKFAF09A09FAIOFJA0Fl',
        paymentEngineSecretKey: process.env.MONAY_FIAT_CARD_PE_SECRET_KEY || 'SDLKJFJKALDFJSAJKFJKAJKFJKAJKFAKFAF09A09FAIOFJA0FQ'
      },
      ach: {
        merchantId: process.env.MONAY_FIAT_ACH_MERCHANT_ID || '8DutmzBEHr4W',
        apiKey: process.env.MONAY_FIAT_ACH_API_KEY || '0ff06b78-c0d4-49f3-a802-9fef2a4f9438',
        secretKey: process.env.MONAY_FIAT_ACH_SECRET_KEY || '19a993a6-54ec-451d-b4d1-f213caaac33b',
        paymentEngineApiKey: process.env.MONAY_FIAT_ACH_PE_API_KEY || 'SDLKJFJKALDFJSAJKFJKAJKFJKAJKFAKFAF09A09FAIOFJA0Fl',
        paymentEngineSecretKey: process.env.MONAY_FIAT_ACH_PE_SECRET_KEY || 'SDLKJFJKALDFJSAJKFJKAJKFJKAJKFAKFAF09A09FAIOFJA0FQ'
      },
      cbp: {
        merchantId: process.env.MONAY_FIAT_CBP_MERCHANT_ID || '0weAXAvECTps',
        apiKey: process.env.MONAY_FIAT_CBP_API_KEY,
        secretKey: process.env.MONAY_FIAT_CBP_SECRET_KEY
      }
    };

    // Portal credentials (for documentation only - not used in code)
    this.portalInfo = {
      url: 'https://pregps.monay.com/portal/sign-in',
      username: 'ali+eaas@tilli.pro',
      // Password stored securely in environment variables only
    };
    
    // Default to main merchant for general operations
    this.currentMerchant = 'main';
    
    this.logger = new Logger({
      logName: 'monay-fiat',
      logFolder: 'monay-fiat',
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
        this.logger.logInfo('MonayFiat API Request', {
          method: config.method,
          url: config.url,
          params: config.params
        });
        return config;
      },
      error => {
        this.logger.logError('MonayFiat API Request Error', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      response => {
        this.logger.logInfo('MonayFiat API Response', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url
        });
        return response;
      },
      error => {
        this.logger.logError('MonayFiat API Response Error', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        return Promise.reject(error);
      }
    );
  }

  getMerchantConfig(merchantType = 'main') {
    return this.merchants[merchantType] || this.merchants.main;
  }

  generateSignature(payload, merchantType = 'main', usePaymentEngine = false) {
    const merchant = this.getMerchantConfig(merchantType);
    const secretKey = usePaymentEngine ? merchant.paymentEngineSecretKey : merchant.secretKey;
    const message = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('hex');
    return signature;
  }

  generateRequestId() {
    return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async authenticate(merchantType = 'main', usePaymentEngine = false) {
    try {
      const merchant = this.getMerchantConfig(merchantType);
      const apiKey = usePaymentEngine ? merchant.paymentEngineApiKey : merchant.apiKey;

      const response = await this.apiClient.get(`/api/login/${merchant.merchantId}`, {
        headers: {
          'API-Key': apiKey,
          'Merchant-Id': merchant.merchantId
        }
      });

      if (response.data.token) {
        this.authToken = response.data.token;
        this.tokenExpiry = new Date(Date.now() + (response.data.expiresIn || 3600) * 1000);
        
        this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
        
        this.logger.logInfo('MonayFiat Authentication Successful', {
          merchantId: this.merchantId,
          expiresAt: this.tokenExpiry
        });

        return {
          success: true,
          token: this.authToken,
          expiresAt: this.tokenExpiry
        };
      }

      throw new Error('No token received from MonayFiat');
    } catch (error) {
      this.logger.logError('MonayFiat Authentication Failed', error);
      throw new Error(`MonayFiat authentication failed: ${error.message}`);
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
        webhookUrl: params.webhookUrl || `${process.env.APP_URL}/api/monay-fiat/webhook`,
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
      
      this.logger.logInfo('MonayFiat Connection Test Completed', results);
      
      return {
        success: Object.values(results).some(r => r.success),
        message: 'MonayFiat connection test completed',
        environment: this.environment,
        merchants: results
      };
    } catch (error) {
      this.logger.logError('MonayFiat Connection Test Failed', error);
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
        environment: this.environment
      };
    }
  }
}

export default new MonayFiatService();