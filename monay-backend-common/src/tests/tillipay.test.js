import request from 'supertest';
import app from '../index';
import tilliPayService from '../services/tillipay.js';

jest.mock('../services/tillipay');

describe('TilliPay Integration Tests', () => {
  let authToken;
  let server;

  beforeAll(async () => {
    server = app.listen(4000);
    
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'test@monay.com',
        password: 'TestPassword123'
      });
    
    authToken = loginResponse.body.data?.token || 'mock-token';
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tillipay/test-connection', () => {
    it('should test connection successfully', async () => {
      tilliPayService.testConnection.mockResolvedValue({
        success: true,
        message: 'Successfully connected to TilliPay',
        environment: 'staging',
        merchantId: 'test-merchant'
      });

      const response = await request(app)
        .get('/api/tillipay/test-connection')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('environment', 'staging');
      expect(tilliPayService.testConnection).toHaveBeenCalledTimes(1);
    });

    it('should handle connection failure', async () => {
      tilliPayService.testConnection.mockRejectedValue(
        new Error('Connection failed')
      );

      const response = await request(app)
        .get('/api/tillipay/test-connection')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/tillipay/payment-link', () => {
    const validPaymentLinkData = {
      amount: 100.00,
      currency: 'USD',
      description: 'Test payment',
      customerEmail: 'customer@test.com',
      customerName: 'John Doe'
    };

    it('should create payment link successfully', async () => {
      tilliPayService.createPaymentLink.mockResolvedValue({
        success: true,
        paymentLinkId: 'link_123',
        paymentUrl: 'https://pay.tillipay.com/link_123',
        orderId: 'ORD_123',
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      });

      const response = await request(app)
        .post('/api/tillipay/payment-link')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPaymentLinkData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('paymentUrl');
      expect(response.body.data).toHaveProperty('paymentLinkId');
      expect(tilliPayService.createPaymentLink).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: validPaymentLinkData.amount,
          currency: validPaymentLinkData.currency
        })
      );
    });

    it('should validate required fields', async () => {
      const invalidData = { amount: 100 };

      const response = await request(app)
        .post('/api/tillipay/payment-link')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(tilliPayService.createPaymentLink).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/tillipay/payment/card', () => {
    const validCardPaymentData = {
      amount: 50.00,
      currency: 'USD',
      cardNumber: '4111111111111111',
      expMonth: 12,
      expYear: 2025,
      cvv: '123',
      cardHolderName: 'John Doe',
      billing: {
        email: 'john@test.com',
        phone: '+12025551234',
        postalCode: '12345'
      }
    };

    it('should process card payment successfully', async () => {
      tilliPayService.processCardPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn_123',
        status: 'COMPLETED',
        orderId: 'CARD_123',
        authorizationCode: 'AUTH123',
        message: 'Payment approved'
      });

      const response = await request(app)
        .post('/api/tillipay/payment/card')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCardPaymentData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('externalTransactionId');
      expect(response.body.data).toHaveProperty('authorizationCode');
      expect(tilliPayService.processCardPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: validCardPaymentData.amount,
          cardNumber: validCardPaymentData.cardNumber
        })
      );
    });

    it('should validate card number format', async () => {
      const invalidData = {
        ...validCardPaymentData,
        cardNumber: '1234567890'
      };

      const response = await request(app)
        .post('/api/tillipay/payment/card')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(tilliPayService.processCardPayment).not.toHaveBeenCalled();
    });

    it('should validate CVV for Amex cards', async () => {
      const amexData = {
        ...validCardPaymentData,
        cardNumber: '378282246310005',
        cvv: '1234'
      };

      tilliPayService.processCardPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn_amex_123',
        status: 'COMPLETED',
        orderId: 'CARD_AMEX_123',
        authorizationCode: 'AMEXAUTH'
      });

      const response = await request(app)
        .post('/api/tillipay/payment/card')
        .set('Authorization', `Bearer ${authToken}`)
        .send(amexData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/tillipay/payment/ach', () => {
    const validACHPaymentData = {
      amount: 500.00,
      currency: 'USD',
      accountNumber: '123456789012',
      routingNumber: '021000021',
      accountType: 'checking',
      accountHolderName: 'John Doe',
      customer: {
        email: 'john@test.com',
        phone: '+12025551234'
      }
    };

    it('should process ACH payment successfully', async () => {
      tilliPayService.processACHPayment.mockResolvedValue({
        success: true,
        transactionId: 'ach_123',
        status: 'PROCESSING',
        orderId: 'ACH_123',
        estimatedSettlement: new Date(Date.now() + 86400000).toISOString(),
        message: 'ACH payment initiated'
      });

      const response = await request(app)
        .post('/api/tillipay/payment/ach')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validACHPaymentData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('estimatedSettlement');
      expect(tilliPayService.processACHPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          accountNumber: validACHPaymentData.accountNumber,
          routingNumber: validACHPaymentData.routingNumber
        })
      );
    });

    it('should validate routing number length', async () => {
      const invalidData = {
        ...validACHPaymentData,
        routingNumber: '12345678'
      };

      const response = await request(app)
        .post('/api/tillipay/payment/ach')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(tilliPayService.processACHPayment).not.toHaveBeenCalled();
    });

    it('should only accept USD for ACH payments', async () => {
      const invalidData = {
        ...validACHPaymentData,
        currency: 'EUR'
      };

      const response = await request(app)
        .post('/api/tillipay/payment/ach')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/tillipay/payment/status/:transactionId', () => {
    it('should get payment status successfully', async () => {
      const transactionId = '550e8400-e29b-41d4-a716-446655440000';

      tilliPayService.getPaymentStatus.mockResolvedValue({
        success: true,
        transactionId: 'txn_123',
        status: 'COMPLETED',
        amount: 100.00,
        currency: 'USD',
        orderId: 'ORD_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const response = await request(app)
        .get(`/api/tillipay/payment/status/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status');
    });

    it('should validate transaction ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/api/tillipay/payment/status/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/tillipay/payment/refund/:transactionId', () => {
    const transactionId = '550e8400-e29b-41d4-a716-446655440000';

    it('should process refund successfully', async () => {
      tilliPayService.refundPayment.mockResolvedValue({
        success: true,
        refundId: 'refund_123',
        transactionId: 'txn_123',
        amount: 50.00,
        status: 'REFUNDED',
        processedAt: new Date().toISOString()
      });

      const response = await request(app)
        .post(`/api/tillipay/payment/refund/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 50.00,
          reason: 'Customer requested refund'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('refundId');
    });

    it('should process full refund when amount not specified', async () => {
      tilliPayService.refundPayment.mockResolvedValue({
        success: true,
        refundId: 'refund_full_123',
        transactionId: 'txn_123',
        amount: 100.00,
        status: 'REFUNDED',
        processedAt: new Date().toISOString()
      });

      const response = await request(app)
        .post(`/api/tillipay/payment/refund/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Product defect'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/tillipay/transactions', () => {
    it('should get transaction history successfully', async () => {
      tilliPayService.getTransactionHistory.mockResolvedValue({
        success: true,
        transactions: [
          {
            transactionId: 'txn_1',
            amount: 100.00,
            status: 'COMPLETED',
            createdAt: new Date().toISOString()
          },
          {
            transactionId: 'txn_2',
            amount: 50.00,
            status: 'REFUNDED',
            createdAt: new Date().toISOString()
          }
        ],
        totalCount: 2,
        hasMore: false
      });

      const response = await request(app)
        .get('/api/tillipay/transactions')
        .query({
          limit: 10,
          offset: 0,
          status: 'completed'
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.transactions).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('totalCount');
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/tillipay/transactions')
        .query({
          limit: 1000,
          offset: -1
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/tillipay/webhook', () => {
    it('should handle webhook successfully', async () => {
      const webhookPayload = {
        eventType: 'payment.completed',
        transactionId: 'txn_123',
        status: 'COMPLETED',
        amount: 100.00
      };

      tilliPayService.handleWebhook.mockResolvedValue({
        success: true,
        eventType: webhookPayload.eventType,
        transactionId: webhookPayload.transactionId,
        status: webhookPayload.status,
        data: webhookPayload
      });

      const response = await request(app)
        .post('/api/tillipay/webhook')
        .set('x-tillipay-signature', 'valid-signature')
        .send(webhookPayload)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(tilliPayService.handleWebhook).toHaveBeenCalledWith(
        webhookPayload,
        'valid-signature'
      );
    });

    it('should reject webhook with invalid signature', async () => {
      tilliPayService.handleWebhook.mockRejectedValue(
        new Error('Invalid webhook signature')
      );

      const response = await request(app)
        .post('/api/tillipay/webhook')
        .set('x-tillipay-signature', 'invalid-signature')
        .send({
          eventType: 'payment.failed',
          transactionId: 'txn_456'
        })
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Authorization Tests', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/tillipay/test-connection')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/tillipay/test-connection')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});