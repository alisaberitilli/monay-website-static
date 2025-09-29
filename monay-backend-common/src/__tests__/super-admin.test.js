import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index.js';
import db from '../models/index.js';
import mockDataService from '../services/mock-data-service.js';

// Mock JWT token for testing
const generateToken = (role = 'super_admin', userId = 'test-admin-123') => {
  return jwt.sign(
    { id: userId, role, email: 'admin@monay.com' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Super Admin API Endpoints', () => {
  let authToken;
  let nonAdminToken;

  beforeAll(() => {
    authToken = generateToken('super_admin');
    nonAdminToken = generateToken('user', 'regular-user-456');
  });

  describe('Authentication & Authorization', () => {
    test('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/super-admin/platform/overview')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject requests from non-admin users', async () => {
      const response = await request(app)
        .get('/api/super-admin/platform/overview')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient permissions');
    });

    test('should accept requests from super admins', async () => {
      const response = await request(app)
        .get('/api/super-admin/platform/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Platform Overview', () => {
    test('GET /api/super-admin/platform/overview', async () => {
      const response = await request(app)
        .get('/api/super-admin/platform/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('transactions');
      expect(response.body.data).toHaveProperty('wallets');
      expect(response.body.data.users).toHaveProperty('total');
      expect(response.body.data.users).toHaveProperty('active');
      expect(response.body.data.users).toHaveProperty('new');
    });

    test('GET /api/super-admin/platform/health', async () => {
      const response = await request(app)
        .get('/api/super-admin/platform/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('api');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('redis');
      expect(response.body.data).toHaveProperty('providers');
      expect(response.body.data.api).toBe('healthy');
    });
  });

  describe('Circle Management', () => {
    test('GET /api/super-admin/circle/wallets', async () => {
      const response = await request(app)
        .get('/api/super-admin/circle/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('wallets');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data.wallets)).toBe(true);
    });

    test('GET /api/super-admin/circle/metrics', async () => {
      const response = await request(app)
        .get('/api/super-admin/circle/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalSupply');
      expect(response.body.data).toHaveProperty('walletCount');
      expect(response.body.data).toHaveProperty('dailyVolume');
      expect(response.body.data).toHaveProperty('pendingOperations');
      expect(response.body.data).toHaveProperty('failedTransactions');
    });

    test('POST /api/super-admin/circle/freeze-wallet', async () => {
      // Get a wallet to freeze
      const walletsResponse = await request(app)
        .get('/api/super-admin/circle/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 1 });

      const wallet = walletsResponse.body.data.wallets[0];

      if (wallet) {
        const response = await request(app)
          .post('/api/super-admin/circle/freeze-wallet')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            walletId: wallet.walletId,
            reason: 'Test freeze operation'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('frozen successfully');
      }
    });

    test('POST /api/super-admin/circle/unfreeze-wallet', async () => {
      // Get a frozen wallet to unfreeze
      const walletsResponse = await request(app)
        .get('/api/super-admin/circle/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'frozen', limit: 1 });

      const wallet = walletsResponse.body.data.wallets[0];

      if (wallet) {
        const response = await request(app)
          .post('/api/super-admin/circle/unfreeze-wallet')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            walletId: wallet.walletId
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('unfrozen successfully');
      }
    });
  });

  describe('Tempo Management', () => {
    test('GET /api/super-admin/tempo/status', async () => {
      const response = await request(app)
        .get('/api/super-admin/tempo/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('metrics');
      expect(response.body.data).toHaveProperty('capabilities');
      expect(response.body.data.metrics).toHaveProperty('tps');
      expect(response.body.data.metrics).toHaveProperty('finality');
      expect(response.body.data.metrics).toHaveProperty('avgFee');
    });

    test('GET /api/super-admin/tempo/wallets', async () => {
      const response = await request(app)
        .get('/api/super-admin/tempo/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('wallets');
      expect(Array.isArray(response.body.data.wallets)).toBe(true);
    });

    test('GET /api/super-admin/tempo/transactions', async () => {
      const response = await request(app)
        .get('/api/super-admin/tempo/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transactions');
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
    });

    test('POST /api/super-admin/tempo/process-batch', async () => {
      const batchTransactions = [
        { from: 'wallet1', to: 'wallet2', amount: 100, currency: 'USDC' },
        { from: 'wallet2', to: 'wallet3', amount: 50, currency: 'USDT' },
        { from: 'wallet3', to: 'wallet1', amount: 25, currency: 'PYUSD' }
      ];

      const response = await request(app)
        .post('/api/super-admin/tempo/process-batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ transactions: batchTransactions })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
    });
  });

  describe('Provider Comparison', () => {
    test('GET /api/super-admin/providers/comparison', async () => {
      const response = await request(app)
        .get('/api/super-admin/providers/comparison')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tempo');
      expect(response.body.data).toHaveProperty('circle');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data.tempo).toHaveProperty('metrics');
      expect(response.body.data.circle).toHaveProperty('metrics');
    });

    test('POST /api/super-admin/providers/set-primary', async () => {
      const response = await request(app)
        .post('/api/super-admin/providers/set-primary')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          provider: 'tempo',
          reason: 'Better performance metrics'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('tempo');
    });

    test('GET /api/super-admin/providers/health', async () => {
      const response = await request(app)
        .get('/api/super-admin/providers/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tempo');
      expect(response.body.data).toHaveProperty('circle');
    });
  });

  describe('User Management', () => {
    test('GET /api/super-admin/users', async () => {
      const response = await request(app)
        .get('/api/super-admin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    test('POST /api/super-admin/users/suspend', async () => {
      // Create a test user first
      const testUser = await db.User.create({
        email: 'test-suspend@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        status: 'active'
      });

      const response = await request(app)
        .post('/api/super-admin/users/suspend')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser.id,
          reason: 'Test suspension',
          duration: 7 // 7 days
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('suspended');

      // Cleanup
      await testUser.destroy();
    });
  });

  describe('Transaction Monitoring', () => {
    test('GET /api/super-admin/transactions/monitor', async () => {
      const response = await request(app)
        .get('/api/super-admin/transactions/monitor')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transactions');
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
    });

    test('GET /api/super-admin/transactions/suspicious', async () => {
      const response = await request(app)
        .get('/api/super-admin/transactions/suspicious')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Compliance & KYC', () => {
    test('GET /api/super-admin/compliance/kyc-queue', async () => {
      const response = await request(app)
        .get('/api/super-admin/compliance/kyc-queue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/super-admin/compliance/report', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get('/api/super-admin/compliance/report')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('kycSubmissions');
      expect(response.body.data).toHaveProperty('kycApproved');
      expect(response.body.data).toHaveProperty('flaggedTransactions');
      expect(response.body.data).toHaveProperty('suspendedUsers');
    });
  });

  describe('Analytics', () => {
    test('GET /api/super-admin/analytics/dashboard', async () => {
      const response = await request(app)
        .get('/api/super-admin/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('revenue');
      expect(response.body.data).toHaveProperty('transactions');
      expect(response.body.data).toHaveProperty('newUsers');
    });

    test('GET /api/super-admin/analytics/revenue', async () => {
      const response = await request(app)
        .get('/api/super-admin/analytics/revenue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('System Configuration', () => {
    test('GET /api/super-admin/system/config', async () => {
      const response = await request(app)
        .get('/api/super-admin/system/config')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/super-admin/system/feature-flags', async () => {
      const response = await request(app)
        .get('/api/super-admin/system/feature-flags')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('PUT /api/super-admin/system/feature-flags', async () => {
      const response = await request(app)
        .put('/api/super-admin/system/feature-flags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          flag: 'test_feature',
          enabled: true
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('test_feature');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits on sensitive operations', async () => {
      // Make multiple freeze requests quickly
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post('/api/super-admin/circle/freeze-wallet')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              walletId: `test-wallet-${i}`,
              reason: 'Rate limit test'
            })
        );
      }

      const responses = await Promise.all(promises);

      // Some requests should be rate limited
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid wallet ID gracefully', async () => {
      const response = await request(app)
        .post('/api/super-admin/circle/freeze-wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          walletId: 'invalid-wallet-id-12345',
          reason: 'Test invalid wallet'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should handle invalid provider name', async () => {
      const response = await request(app)
        .post('/api/super-admin/providers/set-primary')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          provider: 'invalid-provider',
          reason: 'Test invalid provider'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid provider');
    });

    test('should handle missing required parameters', async () => {
      const response = await request(app)
        .post('/api/super-admin/circle/freeze-wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing walletId and reason
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });
});

// Performance tests
describe('Performance Tests', () => {
  test('Platform overview should respond within 500ms', async () => {
    const start = Date.now();

    await request(app)
      .get('/api/super-admin/platform/overview')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });

  test('Metrics endpoint should handle concurrent requests', async () => {
    const promises = [];
    const concurrentRequests = 10;

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        request(app)
          .get('/api/super-admin/circle/metrics')
          .set('Authorization', `Bearer ${authToken}`)
      );
    }

    const responses = await Promise.all(promises);
    const allSuccessful = responses.every(r => r.status === 200);

    expect(allSuccessful).toBe(true);
  });
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connections
  await db.sequelize.close();
});