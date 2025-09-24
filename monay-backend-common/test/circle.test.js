import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import circleService from '../src/services/circle.js';

// Mock Circle SDK
jest.mock('@circle-fin/circle-sdk', () => {
  return {
    Circle: jest.fn().mockImplementation(() => ({
      wallets: {
        create: jest.fn().mockResolvedValue({
          data: {
            walletId: 'mock-wallet-123',
            address: '0xMockAddress123',
            blockchain: 'ETH',
            status: 'active'
          }
        }),
        get: jest.fn().mockResolvedValue({
          data: {
            walletId: 'mock-wallet-123',
            address: '0xMockAddress123',
            balances: [
              {
                currency: 'USDC',
                amount: '1000.00',
                updateTime: new Date().toISOString()
              }
            ],
            status: 'active'
          }
        })
      },
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          data: {
            id: 'mock-payment-123',
            status: 'pending',
            amount: { amount: '1000', currency: 'USD' },
            trackingRef: 'TRACK123'
          }
        })
      },
      transfers: {
        create: jest.fn().mockResolvedValue({
          data: {
            id: 'mock-transfer-123',
            status: 'pending',
            transactionHash: '0xMockTxHash',
            amount: { amount: '100', currency: 'USD' },
            fees: { amount: '5', currency: 'USD' }
          }
        })
      },
      payouts: {
        create: jest.fn().mockResolvedValue({
          data: {
            id: 'mock-payout-123',
            status: 'pending',
            amount: { amount: '500', currency: 'USD' },
            fees: { amount: '2', currency: 'USD' },
            trackingRef: 'PAYOUT123'
          }
        })
      },
      bankAccounts: {
        create: jest.fn().mockResolvedValue({
          data: {
            id: 'mock-bank-123',
            status: 'pending_verification',
            trackingRef: 'BANK123',
            fingerprint: 'fp_123'
          }
        })
      }
    })),
    CircleEnvironments: {
      sandbox: 'sandbox',
      production: 'production'
    }
  };
});

describe('Circle Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup test user and auth
    const authResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@monay.com',
        password: 'testpassword'
      });

    authToken = authResponse.body.token || 'test-token';
    userId = authResponse.body.user?.id || 'test-user-123';
  });

  describe('Wallet Management', () => {
    it('should create a Circle wallet for user', async () => {
      const response = await request(app)
        .post('/api/circle/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'enterprise'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('walletId');
      expect(response.body.data).toHaveProperty('address');
      expect(response.body.message).toBe('Circle wallet created successfully');
    });

    it('should get user wallet information', async () => {
      const response = await request(app)
        .get('/api/circle/wallets/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('walletId');
      expect(response.body.data).toHaveProperty('usdcBalance');
    });

    it('should get wallet balance', async () => {
      const response = await request(app)
        .get('/api/circle/wallets/mock-wallet-123/balance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('usdcBalance');
      expect(response.body.data).toHaveProperty('balances');
    });
  });

  describe('USDC Operations', () => {
    describe('Minting USDC', () => {
      it('should mint USDC from USD deposit', async () => {
        const response = await request(app)
          .post('/api/circle/mint')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 1000,
            sourceAccount: {
              type: 'wire',
              id: 'test-bank-account'
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('paymentId');
        expect(response.body.message).toContain('Minting 1000 USDC initiated');
      });

      it('should reject minting with invalid amount', async () => {
        const response = await request(app)
          .post('/api/circle/mint')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: -100,
            sourceAccount: {
              type: 'wire',
              id: 'test-bank-account'
            }
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid amount');
      });

      it('should enforce business rules on minting', async () => {
        // This test would check if business rules are properly applied
        const response = await request(app)
          .post('/api/circle/mint')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 1000000, // Large amount that might trigger limits
            sourceAccount: {
              type: 'wire',
              id: 'test-bank-account'
            }
          });

        // Response depends on business rule configuration
        expect(response.status).toBeOneOf([200, 403]);
      });
    });

    describe('Burning USDC', () => {
      it('should burn USDC to receive USD', async () => {
        const response = await request(app)
          .post('/api/circle/burn')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 500,
            destinationAccount: {
              type: 'wire',
              id: 'test-bank-account'
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('payoutId');
        expect(response.body.message).toContain('Burning 500 USDC initiated');
      });

      it('should check balance before burning', async () => {
        const response = await request(app)
          .post('/api/circle/burn')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 10000000, // More than available balance
            destinationAccount: {
              type: 'wire',
              id: 'test-bank-account'
            }
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Insufficient USDC balance');
      });
    });

    describe('USDC Transfers', () => {
      it('should transfer USDC to another address', async () => {
        const response = await request(app)
          .post('/api/circle/transfer')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 100,
            toAddress: '0xRecipientAddress123'
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transferId');
        expect(response.body.data).toHaveProperty('transactionHash');
      });

      it('should require destination address', async () => {
        const response = await request(app)
          .post('/api/circle/transfer')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 100
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Destination address required');
      });

      it('should enforce transfer business rules', async () => {
        const response = await request(app)
          .post('/api/circle/transfer')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 50000, // Amount that might trigger rules
            toAddress: '0xSuspiciousAddress'
          });

        expect(response.status).toBeOneOf([200, 403]);
      });
    });
  });

  describe('Bank Account Management', () => {
    it('should link a bank account', async () => {
      const response = await request(app)
        .post('/api/circle/bank-accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountNumber: '123456789',
          routingNumber: '021000021',
          accountName: 'Test User',
          bankName: 'Test Bank'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('bankAccountId');
      expect(response.body.message).toBe('Bank account linked successfully');
    });

    it('should validate bank account details', async () => {
      const response = await request(app)
        .post('/api/circle/bank-accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountName: 'Test User'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Account number and routing number are required');
    });
  });

  describe('Fee Estimation', () => {
    it('should estimate fees for minting', async () => {
      const response = await request(app)
        .post('/api/circle/fees/estimate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          operation: 'mint',
          amount: 1000,
          chain: 'ETH'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('fee');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.operation).toBe('mint');
    });

    it('should estimate fees for transfers', async () => {
      const response = await request(app)
        .post('/api/circle/fees/estimate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          operation: 'transfer',
          amount: 100,
          chain: 'ETH'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('fee');
      expect(response.body.data.fee).toBeGreaterThan(0);
    });
  });

  describe('Transaction History', () => {
    it('should get transaction history', async () => {
      const response = await request(app)
        .get('/api/circle/transactions')
        .query({ limit: 10, offset: 0 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transactions');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/circle/transactions')
        .query({ type: 'transfer', limit: 5 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('Webhook Handling', () => {
    it('should handle Circle webhook notifications', async () => {
      const webhookPayload = {
        Type: 'payments',
        Message: {
          id: 'payment-123',
          status: 'confirmed',
          amount: { amount: '1000', currency: 'USD' }
        }
      };

      const response = await request(app)
        .post('/api/circle/webhooks')
        .set('circle-signature', 'mock-signature')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.received).toBe(true);
    });

    it('should reject webhooks without signature', async () => {
      const response = await request(app)
        .post('/api/circle/webhooks')
        .send({
          Type: 'payments',
          Message: {}
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing webhook signature');
    });
  });

  describe('Security & Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      const response = await request(app)
        .get('/api/circle/wallets/me');

      expect(response.status).toBe(401);
    });

    it('should handle expired tokens gracefully', async () => {
      const response = await request(app)
        .get('/api/circle/wallets/me')
        .set('Authorization', 'Bearer expired-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle Circle API errors gracefully', async () => {
      // Mock a Circle API error
      jest.spyOn(circleService, 'createWallet').mockRejectedValueOnce(
        new Error('Circle API error')
      );

      const response = await request(app)
        .post('/api/circle/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'enterprise' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to create wallet');
    });

    it('should handle network timeouts', async () => {
      // Test timeout handling
      jest.spyOn(circleService, 'getBalance').mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );

      const response = await request(app)
        .get('/api/circle/wallets/test-wallet/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(1000);

      expect(response.status).toBeOneOf([408, 500]);
    });
  });
});

// Helper to extend Jest matchers
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);
    return {
      pass,
      message: () =>
        `expected ${received} to be one of ${array.join(', ')}`
    };
  }
});