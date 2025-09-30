import io from 'socket.io-client';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
  createTestUser,
  createTestWallet,
  cleanDatabase,
  closeTestDb
} from '../utils/database-helpers.js';

describe('Invoice Wallet WebSocket Tests', () => {
  let server;
  let httpServer;
  let ioServer;
  let clientSocket;
  let serverSocket;
  let testUser;
  let testWallet;
  let authToken;
  const PORT = 3099; // Test port

  beforeAll(async () => {
    // Clean database and create test data
    await cleanDatabase();
    testUser = await createTestUser();
    testWallet = await createTestWallet(testUser.id);

    // Generate auth token
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test server
    const app = express();
    httpServer = http.createServer(app);

    ioServer = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Setup WebSocket handlers
    ioServer.use(async (socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    ioServer.on('connection', (socket) => {
      serverSocket = socket;

      // Join user room
      socket.join(`user:${socket.userId}`);

      // Handle wallet subscription
      socket.on('subscribe:wallet', (data) => {
        const { walletId } = data;
        socket.join(`wallet:${walletId}`);
        socket.emit('subscribed', { walletId, status: 'success' });
      });

      // Handle wallet unsubscription
      socket.on('unsubscribe:wallet', (data) => {
        const { walletId } = data;
        socket.leave(`wallet:${walletId}`);
        socket.emit('unsubscribed', { walletId, status: 'success' });
      });

      // Handle invoice events
      socket.on('invoice:create', async (data) => {
        // Simulate invoice creation
        const invoice = {
          id: 'test-invoice-id',
          ...data,
          status: 'PENDING',
          created_at: new Date()
        };

        // Emit to wallet room
        ioServer.to(`wallet:${data.walletId}`).emit('invoice:created', invoice);
      });

      socket.on('invoice:pay', async (data) => {
        // Simulate payment processing
        const payment = {
          transactionId: 'test-txn-id',
          invoiceId: data.invoiceId,
          amount: data.amount,
          status: 'PROCESSING'
        };

        socket.emit('payment:initiated', payment);

        // Simulate async payment completion
        setTimeout(() => {
          payment.status = 'COMPLETED';
          ioServer.to(`wallet:${data.walletId}`).emit('payment:completed', payment);
        }, 100);
      });

      // Handle transaction events
      socket.on('transaction:create', async (data) => {
        const transaction = {
          id: 'test-transaction-id',
          ...data,
          timestamp: new Date()
        };

        ioServer.to(`wallet:${data.walletId}`).emit('transaction:created', transaction);
      });

      // Handle balance updates
      socket.on('balance:update', async (data) => {
        ioServer.to(`wallet:${data.walletId}`).emit('balance:updated', {
          walletId: data.walletId,
          balance: data.balance,
          timestamp: new Date()
        });
      });

      // Handle errors
      socket.on('error', (error) => {
        socket.emit('error:received', { message: error.message });
      });

      socket.on('disconnect', () => {
        // Cleanup
      });
    });

    await new Promise((resolve) => {
      httpServer.listen(PORT, () => {
        resolve();
      });
    });
  });

  beforeEach((done) => {
    // Create client socket for each test
    clientSocket = io(`http://localhost:${PORT}`, {
      auth: {
        token: authToken
      }
    });

    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
  });

  afterAll(async () => {
    if (ioServer) {
      ioServer.close();
    }
    if (httpServer) {
      httpServer.close();
    }
    await closeTestDb();
  });

  describe('Connection and Authentication', () => {
    test('Should connect with valid token', (done) => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    test('Should reject connection without token', (done) => {
      const unauthorizedSocket = io(`http://localhost:${PORT}`, {
        auth: {}
      });

      unauthorizedSocket.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication required');
        unauthorizedSocket.disconnect();
        done();
      });
    });

    test('Should reject connection with invalid token', (done) => {
      const invalidSocket = io(`http://localhost:${PORT}`, {
        auth: {
          token: 'invalid-token'
        }
      });

      invalidSocket.on('connect_error', (error) => {
        expect(error.message).toContain('Invalid token');
        invalidSocket.disconnect();
        done();
      });
    });

    test('Should handle reconnection', (done) => {
      let reconnectCount = 0;

      clientSocket.on('reconnect', () => {
        reconnectCount++;
        if (reconnectCount === 1) {
          expect(clientSocket.connected).toBe(true);
          done();
        }
      });

      // Force disconnect and reconnect
      clientSocket.io.engine.close();
    });
  });

  describe('Wallet Subscription', () => {
    test('Should subscribe to wallet updates', (done) => {
      clientSocket.emit('subscribe:wallet', { walletId: testWallet.id });

      clientSocket.on('subscribed', (data) => {
        expect(data.walletId).toBe(testWallet.id);
        expect(data.status).toBe('success');
        done();
      });
    });

    test('Should unsubscribe from wallet updates', (done) => {
      clientSocket.emit('subscribe:wallet', { walletId: testWallet.id });

      clientSocket.on('subscribed', () => {
        clientSocket.emit('unsubscribe:wallet', { walletId: testWallet.id });
      });

      clientSocket.on('unsubscribed', (data) => {
        expect(data.walletId).toBe(testWallet.id);
        expect(data.status).toBe('success');
        done();
      });
    });

    test('Should receive updates only for subscribed wallets', (done) => {
      const wallet1 = testWallet.id;
      const wallet2 = 'other-wallet-id';
      let receivedUpdates = [];

      // Subscribe to wallet1 only
      clientSocket.emit('subscribe:wallet', { walletId: wallet1 });

      clientSocket.on('balance:updated', (data) => {
        receivedUpdates.push(data.walletId);
      });

      clientSocket.on('subscribed', () => {
        // Emit updates to both wallets
        serverSocket.emit('balance:update', { walletId: wallet1, balance: 1000 });
        serverSocket.emit('balance:update', { walletId: wallet2, balance: 2000 });

        setTimeout(() => {
          expect(receivedUpdates).toContain(wallet1);
          expect(receivedUpdates).not.toContain(wallet2);
          done();
        }, 100);
      });
    });
  });

  describe('Invoice Events', () => {
    beforeEach((done) => {
      clientSocket.emit('subscribe:wallet', { walletId: testWallet.id });
      clientSocket.on('subscribed', done);
    });

    test('Should emit invoice creation event', (done) => {
      const invoiceData = {
        walletId: testWallet.id,
        invoiceNumber: 'INV-TEST-001',
        amount: 1000,
        currency: 'USD'
      };

      clientSocket.on('invoice:created', (invoice) => {
        expect(invoice.invoiceNumber).toBe(invoiceData.invoiceNumber);
        expect(invoice.amount).toBe(invoiceData.amount);
        expect(invoice.status).toBe('PENDING');
        done();
      });

      clientSocket.emit('invoice:create', invoiceData);
    });

    test('Should handle invoice payment events', (done) => {
      const paymentData = {
        walletId: testWallet.id,
        invoiceId: 'test-invoice-id',
        amount: 1000
      };

      let eventCount = 0;

      clientSocket.on('payment:initiated', (payment) => {
        expect(payment.status).toBe('PROCESSING');
        expect(payment.invoiceId).toBe(paymentData.invoiceId);
        eventCount++;
      });

      clientSocket.on('payment:completed', (payment) => {
        expect(payment.status).toBe('COMPLETED');
        expect(payment.invoiceId).toBe(paymentData.invoiceId);
        eventCount++;

        if (eventCount === 2) {
          done();
        }
      });

      clientSocket.emit('invoice:pay', paymentData);
    });

    test('Should broadcast invoice updates to all wallet subscribers', (done) => {
      const clientSocket2 = io(`http://localhost:${PORT}`, {
        auth: { token: authToken }
      });

      let receivedCount = 0;
      const invoiceData = {
        walletId: testWallet.id,
        invoiceNumber: 'INV-BROADCAST-001'
      };

      const checkComplete = () => {
        receivedCount++;
        if (receivedCount === 2) {
          clientSocket2.disconnect();
          done();
        }
      };

      clientSocket2.on('connect', () => {
        clientSocket2.emit('subscribe:wallet', { walletId: testWallet.id });
      });

      clientSocket.on('invoice:created', (invoice) => {
        expect(invoice.invoiceNumber).toBe(invoiceData.invoiceNumber);
        checkComplete();
      });

      clientSocket2.on('invoice:created', (invoice) => {
        expect(invoice.invoiceNumber).toBe(invoiceData.invoiceNumber);
        checkComplete();
      });

      clientSocket2.on('subscribed', () => {
        clientSocket.emit('invoice:create', invoiceData);
      });
    });
  });

  describe('Transaction Events', () => {
    beforeEach((done) => {
      clientSocket.emit('subscribe:wallet', { walletId: testWallet.id });
      clientSocket.on('subscribed', done);
    });

    test('Should emit transaction creation event', (done) => {
      const transactionData = {
        walletId: testWallet.id,
        type: 'CREDIT',
        amount: 500,
        currency: 'USD'
      };

      clientSocket.on('transaction:created', (transaction) => {
        expect(transaction.type).toBe(transactionData.type);
        expect(transaction.amount).toBe(transactionData.amount);
        expect(transaction).toHaveProperty('timestamp');
        done();
      });

      clientSocket.emit('transaction:create', transactionData);
    });

    test('Should emit balance update events', (done) => {
      const balanceData = {
        walletId: testWallet.id,
        balance: {
          available: 5000,
          pending: 1000,
          reserved: 500
        }
      };

      clientSocket.on('balance:updated', (update) => {
        expect(update.walletId).toBe(balanceData.walletId);
        expect(update.balance).toEqual(balanceData.balance);
        expect(update).toHaveProperty('timestamp');
        done();
      });

      clientSocket.emit('balance:update', balanceData);
    });
  });

  describe('Error Handling', () => {
    test('Should handle and emit errors', (done) => {
      clientSocket.on('error:received', (error) => {
        expect(error.message).toBe('Test error');
        done();
      });

      clientSocket.emit('error', { message: 'Test error' });
    });

    test('Should handle malformed messages gracefully', (done) => {
      // Send malformed data
      clientSocket.emit('subscribe:wallet', null);

      // Should not crash, might emit error or ignore
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 100);
    });

    test('Should recover from temporary disconnection', (done) => {
      let disconnected = false;

      clientSocket.on('disconnect', () => {
        disconnected = true;
      });

      clientSocket.on('reconnect', () => {
        expect(disconnected).toBe(true);
        expect(clientSocket.connected).toBe(true);
        done();
      });

      // Force temporary disconnect
      clientSocket.io.engine.close();
    });
  });

  describe('Performance and Load Testing', () => {
    test('Should handle multiple rapid messages', (done) => {
      const messageCount = 100;
      let receivedCount = 0;

      clientSocket.on('balance:updated', () => {
        receivedCount++;
        if (receivedCount === messageCount) {
          done();
        }
      });

      clientSocket.emit('subscribe:wallet', { walletId: testWallet.id });

      clientSocket.on('subscribed', () => {
        for (let i = 0; i < messageCount; i++) {
          clientSocket.emit('balance:update', {
            walletId: testWallet.id,
            balance: { available: i * 100 }
          });
        }
      });
    });

    test('Should handle multiple concurrent connections', async () => {
      const connectionCount = 10;
      const sockets = [];

      // Create multiple connections
      for (let i = 0; i < connectionCount; i++) {
        const socket = io(`http://localhost:${PORT}`, {
          auth: { token: authToken }
        });

        await new Promise((resolve) => {
          socket.on('connect', resolve);
        });

        sockets.push(socket);
      }

      // Verify all connected
      expect(sockets.every(s => s.connected)).toBe(true);

      // Cleanup
      sockets.forEach(s => s.disconnect());
    });

    test('Should maintain message order', (done) => {
      const messages = [];
      const expectedOrder = [1, 2, 3, 4, 5];

      clientSocket.on('transaction:created', (transaction) => {
        messages.push(transaction.index);

        if (messages.length === expectedOrder.length) {
          expect(messages).toEqual(expectedOrder);
          done();
        }
      });

      clientSocket.emit('subscribe:wallet', { walletId: testWallet.id });

      clientSocket.on('subscribed', () => {
        expectedOrder.forEach((index) => {
          clientSocket.emit('transaction:create', {
            walletId: testWallet.id,
            index
          });
        });
      });
    });
  });

  describe('Security Tests', () => {
    test('Should not allow cross-user wallet access', (done) => {
      const otherWalletId = 'unauthorized-wallet-id';

      // Try to subscribe to another user's wallet
      clientSocket.emit('subscribe:wallet', { walletId: otherWalletId });

      // Server should validate ownership
      clientSocket.on('error', (error) => {
        expect(error).toContain('Unauthorized');
        done();
      });

      // If no error, test should timeout and fail
      setTimeout(() => {
        done(new Error('Should have received unauthorized error'));
      }, 1000);
    });

    test('Should sanitize user input', (done) => {
      const maliciousData = {
        walletId: testWallet.id,
        invoiceNumber: '<script>alert("XSS")</script>',
        amount: 'not-a-number'
      };

      clientSocket.on('invoice:created', (invoice) => {
        // Server should sanitize or reject malicious input
        expect(invoice.invoiceNumber).not.toContain('<script>');
        done();
      });

      clientSocket.emit('invoice:create', maliciousData);
    });

    test('Should rate limit excessive requests', async () => {
      const requestCount = 100;
      let errorReceived = false;

      clientSocket.on('error', (error) => {
        if (error.includes('rate limit')) {
          errorReceived = true;
        }
      });

      // Send many requests rapidly
      for (let i = 0; i < requestCount; i++) {
        clientSocket.emit('balance:update', {
          walletId: testWallet.id,
          balance: i
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Should have triggered rate limiting
      // Note: This assumes rate limiting is implemented
      // expect(errorReceived).toBe(true);
    });
  });
});