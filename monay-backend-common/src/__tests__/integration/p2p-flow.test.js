/**
 * P2P Transfer Flow Integration Tests
 * Consumer Wallet Phase 1 Day 5 Implementation
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import db from '../../models/index.js';
import jwt from 'jsonwebtoken';

describe('P2P Transfer Flow - Integration', () => {
  let senderToken;
  let recipientToken;
  let senderId = 'sender_test_123';
  let recipientId = 'recipient_test_456';
  let senderWalletId = 'wallet_sender_789';
  let recipientWalletId = 'wallet_recipient_012';

  beforeAll(async () => {
    // Create test users and wallets
    await setupTestData();

    // Generate auth tokens
    senderToken = jwt.sign(
      { id: senderId, email: 'sender@test.com' },
      process.env.JWT_SECRET || 'test-secret'
    );

    recipientToken = jwt.sign(
      { id: recipientId, email: 'recipient@test.com' },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  describe('Complete P2P Transfer Flow', () => {
    let transferId;

    it('should get sender initial balance', async () => {
      const response = await request(app)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availableBalance).toBe(1000);
      expect(response.body.data.walletId).toBe(senderWalletId);
    });

    it('should validate recipient before transfer', async () => {
      const response = await request(app)
        .post('/api/p2p-transfer/validate')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientIdentifier: 'recipient@test.com',
          recipientType: 'email'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.user.email).toBe('recipient@test.com');
    });

    it('should check transaction limits', async () => {
      const response = await request(app)
        .post('/api/wallet/validate-transaction')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          amount: 100,
          transactionType: 'p2p'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.canProceed).toBe(true);
    });

    it('should create P2P transfer', async () => {
      const response = await request(app)
        .post('/api/p2p-transfer/send')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientIdentifier: 'recipient@test.com',
          amount: 100,
          note: 'Integration test transfer'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transferId).toBeDefined();
      expect(response.body.data.status).toBe('processing');

      transferId = response.body.data.transferId;
    });

    it('should track transfer status', async () => {
      const response = await request(app)
        .get(`/api/p2p-transfer/status/${transferId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transferId).toBe(transferId);
      expect(['processing', 'completed']).toContain(response.body.data.status);
    });

    it('should update sender balance after transfer', async () => {
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await request(app)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availableBalance).toBe(900); // 1000 - 100
    });

    it('should update recipient balance after transfer', async () => {
      const response = await request(app)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${recipientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availableBalance).toBe(100); // 0 + 100
    });

    it('should show transfer in sender history', async () => {
      const response = await request(app)
        .get('/api/p2p-transfer/history')
        .set('Authorization', `Bearer ${senderToken}`)
        .query({ type: 'sent', limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transfers).toBeInstanceOf(Array);

      const transfer = response.body.data.transfers.find(t => t.id === transferId);
      expect(transfer).toBeDefined();
      expect(transfer.amount).toBe(100);
      expect(transfer.type).toBe('sent');
    });

    it('should show transfer in recipient history', async () => {
      const response = await request(app)
        .get('/api/p2p-transfer/history')
        .set('Authorization', `Bearer ${recipientToken}`)
        .query({ type: 'received', limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transfers).toBeInstanceOf(Array);

      const transfer = response.body.data.transfers.find(t => t.id === transferId);
      expect(transfer).toBeDefined();
      expect(transfer.amount).toBe(100);
      expect(transfer.type).toBe('received');
    });
  });

  describe('Transfer Cancellation', () => {
    let cancelTransferId;

    it('should create pending transfer', async () => {
      const response = await request(app)
        .post('/api/p2p-transfer/send')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientIdentifier: 'recipient@test.com',
          amount: 50,
          transferMethod: 'scheduled',
          scheduledDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
      cancelTransferId = response.body.data.transferId;
    });

    it('should cancel pending transfer', async () => {
      const response = await request(app)
        .post(`/api/p2p-transfer/cancel/${cancelTransferId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should not process cancelled transfer', async () => {
      const response = await request(app)
        .get(`/api/p2p-transfer/status/${cancelTransferId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);

      expect(response.body.data.status).toBe('cancelled');
    });
  });

  describe('Transfer Limits', () => {
    it('should reject transfer exceeding daily limit', async () => {
      const response = await request(app)
        .post('/api/p2p-transfer/send')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientIdentifier: 'recipient@test.com',
          amount: 10000 // Exceeds daily limit
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('limit');
    });

    it('should reject transfer with insufficient balance', async () => {
      const response = await request(app)
        .post('/api/p2p-transfer/send')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientIdentifier: 'recipient@test.com',
          amount: 5000 // More than available balance
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Insufficient');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle non-existent recipient', async () => {
      const response = await request(app)
        .post('/api/p2p-transfer/send')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientIdentifier: 'nonexistent@test.com',
          amount: 50
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/p2p-transfer/send')
        .send({
          recipientIdentifier: 'recipient@test.com',
          amount: 50
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/p2p-transfer/send')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          // Missing required fields
          amount: 'invalid' // Invalid type
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

/**
 * Setup test data
 */
async function setupTestData() {
  // Create test users
  await db.User.bulkCreate([
    {
      id: senderId,
      email: 'sender@test.com',
      firstName: 'Test',
      lastName: 'Sender',
      phone: '+1234567890',
      status: 'active',
      kyc_status: 'verified'
    },
    {
      id: recipientId,
      email: 'recipient@test.com',
      firstName: 'Test',
      lastName: 'Recipient',
      phone: '+0987654321',
      status: 'active',
      kyc_status: 'verified'
    }
  ]);

  // Create test wallets
  await db.Wallet.bulkCreate([
    {
      id: senderWalletId,
      user_id: senderId,
      balance: 1000,
      currency: 'USD',
      status: 'active',
      type: 'primary'
    },
    {
      id: recipientWalletId,
      user_id: recipientId,
      balance: 0,
      currency: 'USD',
      status: 'active',
      type: 'primary'
    }
  ]);

  // Create default limits
  await db.sequelize.query(`
    INSERT INTO wallet_limits (
      wallet_id, user_id, user_tier,
      daily_spending_limit, daily_p2p_limit,
      monthly_spending_limit, monthly_p2p_limit,
      per_transaction_limit
    ) VALUES
    (:senderWalletId, :senderId, 'verified', 5000, 2500, 50000, 25000, 5000),
    (:recipientWalletId, :recipientId, 'verified', 5000, 2500, 50000, 25000, 5000)
  `, {
    replacements: {
      senderWalletId,
      senderId,
      recipientWalletId,
      recipientId
    }
  });
}

/**
 * Cleanup test data
 */
async function cleanupTestData() {
  await db.sequelize.query(
    'DELETE FROM p2p_transfers WHERE sender_id IN (:senderId, :recipientId)',
    { replacements: { senderId, recipientId } }
  );

  await db.sequelize.query(
    'DELETE FROM transactions WHERE wallet_id IN (:senderWalletId, :recipientWalletId)',
    { replacements: { senderWalletId, recipientWalletId } }
  );

  await db.sequelize.query(
    'DELETE FROM wallet_limits WHERE wallet_id IN (:senderWalletId, :recipientWalletId)',
    { replacements: { senderWalletId, recipientWalletId } }
  );

  await db.Wallet.destroy({ where: { id: [senderWalletId, recipientWalletId] } });
  await db.User.destroy({ where: { id: [senderId, recipientId] } });
}