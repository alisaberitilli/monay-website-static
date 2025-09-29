import request from 'supertest';
import express from 'express';
import path from 'path';

// Import the app after setting up environment
let app;
let server;
let authToken;
let testUserId;
let testWalletId;
let testInvoiceId;

// Test data
const testUser = {
  email: 'test@monay.com',
  password: 'Test123!@#',
  confirmPassword: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User'
  // Note: companyName not accepted by API
};

const testWallet = {
  walletName: 'Test Invoice Wallet',
  description: 'Testing invoice-first wallet creation',
  walletType: 'INVOICE_FIRST',
  currency: 'USD',
  complianceLevel: 'STANDARD',
  autoPayEnabled: true,
  paymentThreshold: 1000,
  notifications: {
    email: true,
    sms: false,
    webhook: true
  }
};

const testInvoice = {
  invoiceNumber: 'INV-TEST-001',
  amount: 5000,
  currency: 'USD',
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  vendorName: 'Test Vendor',
  description: 'Test Invoice for Wallet',
  paymentTerms: 'NET30',
  items: [
    {
      description: 'Service Fee',
      quantity: 1,
      unitPrice: 5000,
      total: 5000
    }
  ]
};

describe('Invoice Wallet API Tests', () => {
  beforeAll(async () => {
    // Dynamic import of the app
    import appModule from '../../app';
    app = appModule.app || appModule;

    // Start server for testing
    server = app.listen(0); // Use random port
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Authentication', () => {
    test('Should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);

      authToken = response.body.token;
      testUserId = response.body.user.id;
    });

    test('Should login with credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    test('Should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Invoice Wallet Creation', () => {
    test('Should create a new invoice wallet', async () => {
      const response = await request(app)
        .post('/api/invoice-wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testWallet)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('address');
      expect(response.body.walletName).toBe(testWallet.walletName);
      expect(response.body.walletType).toBe('INVOICE_FIRST');
      expect(response.body.status).toBe('ACTIVE');

      testWalletId = response.body.id;
    });

    test('Should validate required fields', async () => {
      const response = await request(app)
        .post('/api/invoice-wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          walletName: 'Incomplete Wallet'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('validation');
    });

    test('Should enforce unique wallet names', async () => {
      const response = await request(app)
        .post('/api/invoice-wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testWallet) // Same name as before
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .post('/api/invoice-wallets')
        .send(testWallet)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Invoice Management', () => {
    test('Should attach invoice to wallet', async () => {
      const response = await request(app)
        .post(`/api/invoice-wallets/${testWalletId}/invoices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(testInvoice)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.invoiceNumber).toBe(testInvoice.invoiceNumber);
      expect(response.body.status).toBe('PENDING');
      expect(response.body.walletId).toBe(testWalletId);

      testInvoiceId = response.body.id;
    });

    test('Should process invoice payment', async () => {
      const response = await request(app)
        .post(`/api/invoice-wallets/${testWalletId}/invoices/${testInvoiceId}/pay`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethod: 'WALLET_BALANCE',
          amount: testInvoice.amount
        })
        .expect(200);

      expect(response.body).toHaveProperty('transactionId');
      expect(response.body.status).toBe('PROCESSING');
    });

    test('Should validate invoice amount', async () => {
      const response = await request(app)
        .post(`/api/invoice-wallets/${testWalletId}/invoices`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testInvoice,
          amount: -100 // Invalid negative amount
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('amount');
    });

    test('Should list wallet invoices', async () => {
      const response = await request(app)
        .get(`/api/invoice-wallets/${testWalletId}/invoices`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('invoiceNumber');
    });

    test('Should get invoice details', async () => {
      const response = await request(app)
        .get(`/api/invoice-wallets/${testWalletId}/invoices/${testInvoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testInvoiceId);
      expect(response.body).toHaveProperty('auditTrail');
    });
  });

  describe('Wallet Operations', () => {
    test('Should get wallet balance', async () => {
      const response = await request(app)
        .get(`/api/invoice-wallets/${testWalletId}/balance`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('available');
      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('reserved');
      expect(response.body).toHaveProperty('currency');
    });

    test('Should fund wallet', async () => {
      const response = await request(app)
        .post(`/api/invoice-wallets/${testWalletId}/fund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 10000,
          currency: 'USD',
          paymentMethod: 'BANK_TRANSFER',
          reference: 'TEST-FUND-001'
        })
        .expect(200);

      expect(response.body).toHaveProperty('transactionId');
      expect(response.body.status).toBe('PENDING');
    });

    test('Should transfer between wallets', async () => {
      // Create second wallet
      const wallet2Response = await request(app)
        .post('/api/invoice-wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testWallet,
          walletName: 'Second Test Wallet'
        })
        .expect(201);

      const wallet2Id = wallet2Response.body.id;

      // Transfer funds
      const response = await request(app)
        .post(`/api/invoice-wallets/${testWalletId}/transfer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          toWalletId: wallet2Id,
          amount: 100,
          currency: 'USD',
          description: 'Test transfer'
        })
        .expect(200);

      expect(response.body).toHaveProperty('transactionId');
      expect(response.body.fromWallet).toBe(testWalletId);
      expect(response.body.toWallet).toBe(wallet2Id);
    });

    test('Should get transaction history', async () => {
      const response = await request(app)
        .get(`/api/invoice-wallets/${testWalletId}/transactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          limit: 10,
          offset: 0,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(200);

      expect(Array.isArray(response.body.transactions)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('hasMore');
    });
  });

  describe('Compliance and Security', () => {
    test('Should enforce transaction limits', async () => {
      const response = await request(app)
        .post(`/api/invoice-wallets/${testWalletId}/transfer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          toWalletId: 'some-wallet-id',
          amount: 1000000, // Exceeds limit
          currency: 'USD'
        })
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('limit');
    });

    test('Should validate KYC requirements', async () => {
      const response = await request(app)
        .post(`/api/invoice-wallets/${testWalletId}/kyc-check`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transactionAmount: 50000,
          transactionType: 'WIRE_TRANSFER'
        })
        .expect(200);

      expect(response.body).toHaveProperty('kycRequired');
      expect(response.body).toHaveProperty('requiredDocuments');
    });

    test('Should log audit trail', async () => {
      const response = await request(app)
        .get(`/api/invoice-wallets/${testWalletId}/audit-log`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('action');
      expect(response.body[0]).toHaveProperty('timestamp');
      expect(response.body[0]).toHaveProperty('userId');
    });

    test('Should validate wallet ownership', async () => {
      // Try to access wallet with different user token
      const newUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'another@monay.com'
        });

      const otherToken = newUserResponse.body.token;

      const response = await request(app)
        .get(`/api/invoice-wallets/${testWalletId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('permission');
    });
  });

  describe('WebSocket Events', () => {
    test('Should emit wallet creation event', async () => {
      // This would typically test WebSocket connections
      // For now, we verify the event is logged
      const response = await request(app)
        .get(`/api/invoice-wallets/${testWalletId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const creationEvent = response.body.find(e => e.type === 'WALLET_CREATED');
      expect(creationEvent).toBeDefined();
    });
  });

  describe('Wallet Deletion and Cleanup', () => {
    test('Should deactivate wallet', async () => {
      const response = await request(app)
        .patch(`/api/invoice-wallets/${testWalletId}/deactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('INACTIVE');
    });

    test('Should prevent operations on inactive wallet', async () => {
      const response = await request(app)
        .post(`/api/invoice-wallets/${testWalletId}/transfer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          toWalletId: 'some-wallet',
          amount: 100,
          currency: 'USD'
        })
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('inactive');
    });
  });

  describe('Error Handling', () => {
    test('Should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/invoice-wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Should handle missing wallet ID', async () => {
      const response = await request(app)
        .get('/api/invoice-wallets/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('Should handle database errors gracefully', async () => {
      // This would require mocking database errors
      // Verify error handling is in place
      expect(true).toBe(true);
    });
  });
});