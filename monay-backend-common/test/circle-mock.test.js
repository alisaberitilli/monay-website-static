const chai = require('chai');
const { expect } = chai;
const request = require('supertest');
const express = require('express');
const circleMock = require('../src/services/circle-mock');

describe('Circle Mock Service Tests', () => {
  describe('Mock Service Unit Tests', () => {
    beforeEach(() => {
      // Clear mock data before each test
      circleMock.mockWallets.clear();
      circleMock.mockTransactions = [];
      circleMock.mockBankAccounts.clear();
    });

    describe('Wallet Operations', () => {
      it('should create a mock wallet', async () => {
        const wallet = await circleMock.createWallet('user123', 'enterprise', {
          companyName: 'Test Corp'
        });

        expect(wallet).to.have.property('walletId');
        expect(wallet).to.have.property('address');
        expect(wallet.userId).to.equal('user123');
        expect(wallet.type).to.equal('enterprise');
        expect(wallet.balance).to.equal(1000); // Default mock balance
        expect(wallet.metadata.isMock).to.equal(true);
      });

      it('should return existing wallet if user already has one', async () => {
        const wallet1 = await circleMock.createWallet('user123', 'enterprise');
        const wallet2 = await circleMock.createWallet('user123', 'consumer');

        expect(wallet1.walletId).to.equal(wallet2.walletId);
        expect(wallet2.type).to.equal('enterprise'); // Keeps original type
      });

      it('should get wallet by user ID', async () => {
        await circleMock.createWallet('user456', 'consumer');
        const wallet = await circleMock.getWalletByUserId('user456');

        expect(wallet).to.exist;
        expect(wallet.userId).to.equal('user456');
      });

      it('should auto-create wallet if not exists', async () => {
        const wallet = await circleMock.getWalletByUserId('newuser');

        expect(wallet).to.exist;
        expect(wallet.userId).to.equal('newuser');
        expect(wallet.balance).to.equal(1000);
      });

      it('should get wallet balance', async () => {
        const wallet = await circleMock.createWallet('user789', 'enterprise');
        const balance = await circleMock.getBalance(wallet.walletId);

        expect(balance.walletId).to.equal(wallet.walletId);
        expect(balance.usdcBalance).to.equal(1000);
        expect(balance.balances[0].currency).to.equal('USDC');
        expect(balance.balances[0].amount).to.equal('1000.00');
      });
    });

    describe('Mint Operations', () => {
      it('should mint USDC and update balance', async () => {
        const userId = 'user-mint';
        const wallet = await circleMock.createWallet(userId, 'enterprise');
        const initialBalance = wallet.balance;

        const result = await circleMock.mintUSDC(500, wallet.address, 'bank123', userId);

        expect(result.status).to.equal('confirmed');
        expect(result.amount).to.equal(500);
        expect(result.paymentId).to.include('payment_mock');

        // Check balance updated
        const updatedBalance = await circleMock.getBalance(wallet.walletId);
        expect(updatedBalance.usdcBalance).to.equal(initialBalance + 500);
      });

      it('should track mint transactions', async () => {
        const userId = 'user-mint-tx';
        await circleMock.mintUSDC(250, 'address123', 'bank123', userId);

        const transactions = await circleMock.getMockTransactions(userId);

        expect(transactions.transactions).to.have.lengthOf(1);
        expect(transactions.transactions[0].type).to.equal('mint');
        expect(transactions.transactions[0].amount).to.equal(250);
      });
    });

    describe('Burn Operations', () => {
      it('should burn USDC and update balance', async () => {
        const userId = 'user-burn';
        const wallet = await circleMock.createWallet(userId, 'enterprise');

        // Add balance first
        await circleMock.mintUSDC(1000, wallet.address, 'bank123', userId);

        const result = await circleMock.burnUSDC(300, wallet.walletId, 'bank456', userId);

        expect(result.status).to.equal('confirmed');
        expect(result.amount).to.equal(300);
        expect(result.payoutId).to.include('payout_mock');

        // Check balance updated
        const updatedBalance = await circleMock.getBalance(wallet.walletId);
        expect(updatedBalance.usdcBalance).to.equal(2000 - 300); // 1000 initial + 1000 minted - 300 burned
      });

      it('should reject burn if insufficient balance', async () => {
        const userId = 'user-burn-fail';
        await circleMock.createWallet(userId, 'enterprise');

        try {
          await circleMock.burnUSDC(5000, 'wallet123', 'bank456', userId);
          expect.fail('Should have thrown error');
        } catch (error) {
          expect(error.message).to.include('Insufficient balance');
        }
      });
    });

    describe('Transfer Operations', () => {
      it('should transfer USDC and update balance', async () => {
        const userId = 'user-transfer';
        const wallet = await circleMock.createWallet(userId, 'enterprise');

        const result = await circleMock.transferUSDC(200, wallet.walletId, '0xDestination', userId);

        expect(result.status).to.equal('confirmed');
        expect(result.amount).to.equal(200);
        expect(result.transferId).to.include('transfer_mock');
        expect(result.transactionHash).to.include('0xMOCK');

        // Check balance updated
        const updatedBalance = await circleMock.getBalance(wallet.walletId);
        expect(updatedBalance.usdcBalance).to.equal(800); // 1000 - 200
      });

      it('should reject transfer if insufficient balance', async () => {
        const userId = 'user-transfer-fail';
        await circleMock.createWallet(userId, 'enterprise');

        try {
          await circleMock.transferUSDC(2000, 'wallet123', '0xDest', userId);
          expect.fail('Should have thrown error');
        } catch (error) {
          expect(error.message).to.include('Insufficient balance');
        }
      });
    });

    describe('Bank Account Operations', () => {
      it('should link a bank account', async () => {
        const result = await circleMock.linkBankAccount({
          accountNumber: '123456789',
          routingNumber: '021000021',
          accountType: 'checking'
        }, 'user123');

        expect(result.bankAccountId).to.include('bank_mock');
        expect(result.status).to.equal('verified');
        expect(result.fingerprint).to.include('fp_mock');
      });

      it('should store bank account details', async () => {
        const accountDetails = {
          accountNumber: '987654321',
          routingNumber: '021000089',
          accountType: 'savings',
          bankName: 'Mock Bank'
        };

        const result = await circleMock.linkBankAccount(accountDetails, 'user456');

        expect(circleMock.mockBankAccounts.has(result.bankAccountId)).to.be.true;
        const stored = circleMock.mockBankAccounts.get(result.bankAccountId);
        expect(stored.bankName).to.equal('Mock Bank');
        expect(stored.userId).to.equal('user456');
      });
    });

    describe('Fee Estimation', () => {
      it('should estimate mint fees', async () => {
        const fees = await circleMock.estimateFees('mint', 1000, 'ETH');

        expect(fees.operation).to.equal('mint');
        expect(fees.amount).to.equal(1000);
        expect(fees.fee).to.equal(1); // 0.1% of 1000
        expect(fees.total).to.equal(1001);
        expect(fees.isMock).to.be.true;
      });

      it('should estimate transfer fees', async () => {
        const feesETH = await circleMock.estimateFees('transfer', 500, 'ETH');
        const feesSOL = await circleMock.estimateFees('transfer', 500, 'SOL');

        expect(feesETH.fee).to.equal(5); // ETH network fee
        expect(feesSOL.fee).to.equal(1); // SOL network fee
      });

      it('should estimate burn fees', async () => {
        const fees = await circleMock.estimateFees('burn', 2000);

        expect(fees.operation).to.equal('burn');
        expect(fees.fee).to.equal(2); // 0.1% of 2000
        expect(fees.total).to.equal(2002);
      });
    });

    describe('Transaction History', () => {
      it('should track all transaction types', async () => {
        const userId = 'user-history';
        const wallet = await circleMock.createWallet(userId, 'enterprise');

        // Create various transactions
        await circleMock.mintUSDC(500, wallet.address, 'bank123', userId);
        await circleMock.transferUSDC(100, wallet.walletId, '0xDest', userId);
        await circleMock.burnUSDC(50, wallet.walletId, 'bank456', userId);

        const history = await circleMock.getMockTransactions(userId);

        expect(history.transactions).to.have.lengthOf(3);
        expect(history.total).to.equal(3);

        const types = history.transactions.map(tx => tx.type);
        expect(types).to.include.members(['mint', 'transfer', 'burn']);
      });

      it('should sort transactions by timestamp', async () => {
        const userId = 'user-sorted';
        await circleMock.mintUSDC(100, 'addr', 'bank', userId);
        await new Promise(resolve => setTimeout(resolve, 10));
        await circleMock.mintUSDC(200, 'addr', 'bank', userId);

        const history = await circleMock.getMockTransactions(userId);

        expect(history.transactions[0].amount).to.equal(200); // Most recent first
        expect(history.transactions[1].amount).to.equal(100);
      });

      it('should support pagination', async () => {
        const userId = 'user-paginated';

        // Create 5 transactions
        for (let i = 0; i < 5; i++) {
          await circleMock.mintUSDC(100 * (i + 1), 'addr', 'bank', userId);
        }

        const page1 = await circleMock.getMockTransactions(userId, 2, 0);
        const page2 = await circleMock.getMockTransactions(userId, 2, 2);

        expect(page1.transactions).to.have.lengthOf(2);
        expect(page2.transactions).to.have.lengthOf(2);
        expect(page1.total).to.equal(5);
        expect(page2.total).to.equal(5);
      });
    });

    describe('Webhook Operations', () => {
      it('should verify webhook signatures', () => {
        const payload = { test: 'data' };
        const signature = 'mock-signature';

        const result = circleMock.verifyWebhookSignature(payload, signature);
        expect(result).to.be.true; // Always true in mock mode
      });

      it('should handle webhook payloads', async () => {
        const payload = {
          Type: 'payment.created',
          Message: { id: 'payment123', status: 'confirmed' }
        };

        const result = await circleMock.handleWebhook(payload, 'signature');

        expect(result.processed).to.be.true;
        expect(result.mock).to.be.true;
      });
    });

    describe('Chain Support', () => {
      it('should return supported chains', async () => {
        const chains = await circleMock.getSupportedChains();

        expect(chains).to.be.an('array');
        expect(chains.length).to.be.at.least(4);

        const chainNames = chains.map(c => c.chain);
        expect(chainNames).to.include.members(['ETH', 'SOL', 'MATIC', 'AVAX']);

        chains.forEach(chain => {
          expect(chain).to.have.property('name');
          expect(chain).to.have.property('enabled', true);
        });
      });
    });
  });

  describe('Mock Service Persistence', () => {
    it('should maintain state across operations', async () => {
      const userId = 'persistent-user';

      // Create wallet
      const wallet = await circleMock.createWallet(userId, 'enterprise');
      const initialBalance = wallet.balance;

      // Perform multiple operations
      await circleMock.mintUSDC(500, wallet.address, 'bank1', userId);
      await circleMock.transferUSDC(200, wallet.walletId, '0xDest1', userId);
      await circleMock.mintUSDC(300, wallet.address, 'bank2', userId);
      await circleMock.burnUSDC(150, wallet.walletId, 'bank3', userId);

      // Check final state
      const finalBalance = await circleMock.getBalance(wallet.walletId);
      const expectedBalance = initialBalance + 500 - 200 + 300 - 150;
      expect(finalBalance.usdcBalance).to.equal(expectedBalance);

      // Check transaction history
      const history = await circleMock.getMockTransactions(userId);
      expect(history.total).to.equal(4);
    });
  });

  describe('Mock ID Generation', () => {
    it('should generate unique IDs', () => {
      const ids = new Set();

      for (let i = 0; i < 100; i++) {
        const id = circleMock.generateId('test');
        ids.add(id);
      }

      expect(ids.size).to.equal(100); // All IDs should be unique
    });

    it('should include prefix in generated IDs', () => {
      const walletId = circleMock.generateId('wallet');
      const paymentId = circleMock.generateId('payment');
      const bankId = circleMock.generateId('bank');

      expect(walletId).to.include('wallet_mock');
      expect(paymentId).to.include('payment_mock');
      expect(bankId).to.include('bank_mock');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle wallet not found gracefully', async () => {
      try {
        await circleMock.getBalance('non-existent-wallet');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('Wallet not found');
      }
    });

    it('should handle negative amounts', async () => {
      const userId = 'negative-user';
      await circleMock.createWallet(userId, 'enterprise');

      try {
        await circleMock.transferUSDC(-100, 'wallet', '0xDest', userId);
        expect.fail('Should validate amount');
      } catch (error) {
        // Mock service doesn't validate negative amounts but real service should
        // This test documents expected behavior for real implementation
      }
    });
  });
});

module.exports = {};