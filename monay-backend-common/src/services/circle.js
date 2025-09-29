import { Circle, CircleEnvironments } from '@circle-fin/circle-sdk';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import db from '../models/index.js';
import circleMock from './circle-mock.js';

class CircleService extends EventEmitter {
  constructor() {
    super();
    // Check if we should use mock mode
    this.isMockMode = !process.env.CIRCLE_API_KEY ||
                       process.env.CIRCLE_API_KEY === 'mock' ||
                       process.env.CIRCLE_MOCK_MODE === 'true';

    if (this.isMockMode) {
      console.log('⚠️  Circle running in MOCK MODE - no real API calls will be made');
      console.log('📝 To use real Circle API, add your credentials to .env file');
      console.log('📖 See CIRCLE_SETUP_GUIDE.md for instructions');

      // Use mock service for all operations
      this.client = null;
      this.mockService = circleMock;
    } else {
      this.client = new Circle(
        process.env.CIRCLE_API_KEY || '',
        process.env.CIRCLE_ENVIRONMENT === 'production'
          ? CircleEnvironments.production
          : CircleEnvironments.sandbox
      );
    }

    this.entitySecret = process.env.CIRCLE_ENTITY_SECRET || '';
    this.walletSetId = process.env.CIRCLE_WALLET_SET_ID || '';
    this.webhookSecret = process.env.CIRCLE_WEBHOOK_SECRET || '';
  }

  // Encrypt entity secret for API calls
  async encryptEntitySecret() {
    // In production, use proper encryption
    // This is a placeholder - Circle provides specific encryption requirements
    return Buffer.from(this.entitySecret).toString('base64');
  }

  // Create a new wallet for a user/enterprise
  async createWallet(userId, type = 'enterprise', metadata = {}) {
    // Use mock service if in mock mode
    if (this.isMockMode) {
      return this.mockService.createWallet(userId, type, metadata);
    }

    try {
      // Check if user already has a Circle wallet
      const existingWallet = await this.getWalletByUserId(userId);
      if (existingWallet) {
        return existingWallet;
      }

      const idempotencyKey = `wallet-${userId}-${Date.now()}`;

      const wallet = await this.client.wallets.create({
        idempotencyKey,
        entitySecretCipherText: await this.encryptEntitySecret(),
        walletSetId: this.walletSetId,
        metadata: {
          userId,
          type,
          createdAt: new Date().toISOString(),
          ...metadata
        }
      });

      const walletData = {
        userId,
        walletId: wallet.data.walletId,
        address: wallet.data.address,
        blockchain: wallet.data.blockchain || 'ETH',
        type,
        status: 'active'
      };

      // Store wallet info in database
      await this.saveWalletToDatabase(walletData);

      return walletData;
    } catch (error) {
      console.error('Create wallet error:', error);
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  // Save wallet info to database
  async saveWalletToDatabase(walletData) {
    try {
      const query = `
        INSERT INTO wallets (user_id, metadata, status, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET metadata = $2, updated_at = NOW()
        RETURNING id
      `;

      const metadata = {
        circle_wallet_id: walletData.walletId,
        circle_address: walletData.address,
        circle_chain: walletData.blockchain,
        wallet_type: walletData.type
      };

      const result = await db.query(query, [
        walletData.userId,
        JSON.stringify(metadata),
        walletData.status
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Save wallet to database error:', error);
      throw error;
    }
  }

  // Get wallet by user ID
  async getWalletByUserId(userId) {
    if (this.isMockMode) {
      return this.mockService.getWalletByUserId(userId);
    }
    try {
      const query = `
        SELECT * FROM wallets
        WHERE user_id = $1 AND status = 'active'
        LIMIT 1
      `;

      const result = await db.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const wallet = result.rows[0];
      const metadata = JSON.parse(wallet.metadata || '{}');

      return {
        walletId: metadata.circle_wallet_id,
        address: metadata.circle_address,
        blockchain: metadata.circle_chain,
        userId: wallet.user_id,
        type: metadata.wallet_type
      };
    } catch (error) {
      console.error('Get wallet by user ID error:', error);
      throw error;
    }
  }

  // Mint USDC (deposit USD -> receive USDC)
  async mintUSDC(amount, destinationAddress, sourceAccount, userId) {
    if (this.isMockMode) {
      return this.mockService.mintUSDC(amount, destinationAddress, sourceAccount, userId);
    }
    try {
      const idempotencyKey = `mint-${userId}-${Date.now()}`;

      // Create payment intent for minting
      const payment = await this.client.paymentIntents.create({
        idempotencyKey,
        amount: {
          amount: amount.toString(),
          currency: 'USD'
        },
        settlementCurrency: 'USD',
        paymentMethods: [{
          type: 'blockchain',
          chain: 'ETH',
          address: destinationAddress
        }],
        source: {
          type: sourceAccount.type || 'wire', // 'wire' or 'ach'
          id: sourceAccount.id
        },
        metadata: {
          userId,
          operation: 'mint',
          timestamp: new Date().toISOString()
        }
      });

      // Log transaction
      await this.logTransaction({
        userId,
        type: 'mint',
        amount,
        circlePaymentId: payment.data.id,
        status: payment.data.status,
        destinationAddress
      });

      return {
        paymentId: payment.data.id,
        status: payment.data.status,
        amount: amount,
        trackingRef: payment.data.trackingRef,
        requiredAction: payment.data.requiredAction
      };
    } catch (error) {
      console.error('Mint USDC error:', error);
      throw new Error(`Failed to mint USDC: ${error.message}`);
    }
  }

  // Burn USDC (send USDC -> receive USD)
  async burnUSDC(amount, sourceWalletId, destinationBankAccount, userId) {
    if (this.isMockMode) {
      return this.mockService.burnUSDC(amount, sourceWalletId, destinationBankAccount, userId);
    }
    try {
      const idempotencyKey = `burn-${userId}-${Date.now()}`;

      const payout = await this.client.payouts.create({
        idempotencyKey,
        source: {
          type: 'wallet',
          id: sourceWalletId
        },
        destination: {
          type: destinationBankAccount.type || 'wire', // 'wire' or 'ach'
          id: destinationBankAccount.id
        },
        amount: {
          currency: 'USD',
          amount: amount.toString()
        },
        metadata: {
          userId,
          operation: 'burn',
          timestamp: new Date().toISOString()
        }
      });

      // Log transaction
      await this.logTransaction({
        userId,
        type: 'burn',
        amount,
        circlePayoutId: payout.data.id,
        status: payout.data.status,
        sourceWalletId
      });

      return {
        payoutId: payout.data.id,
        status: payout.data.status,
        amount: amount,
        fees: payout.data.fees,
        trackingRef: payout.data.trackingRef
      };
    } catch (error) {
      console.error('Burn USDC error:', error);
      throw new Error(`Failed to burn USDC: ${error.message}`);
    }
  }

  // Transfer USDC between wallets
  async transferUSDC(amount, fromWalletId, toAddress, userId) {
    if (this.isMockMode) {
      return this.mockService.transferUSDC(amount, fromWalletId, toAddress, userId);
    }
    try {
      const idempotencyKey = `transfer-${userId}-${Date.now()}`;

      const transfer = await this.client.transfers.create({
        idempotencyKey,
        source: {
          type: 'wallet',
          id: fromWalletId
        },
        destination: {
          type: 'blockchain',
          address: toAddress,
          chain: 'ETH'
        },
        amount: {
          currency: 'USD',
          amount: amount.toString()
        },
        metadata: {
          userId,
          operation: 'transfer',
          timestamp: new Date().toISOString()
        }
      });

      // Log transaction
      await this.logTransaction({
        userId,
        type: 'transfer',
        amount,
        circleTransferId: transfer.data.id,
        status: transfer.data.status,
        fromWalletId,
        toAddress
      });

      return {
        transferId: transfer.data.id,
        status: transfer.data.status,
        transactionHash: transfer.data.transactionHash,
        amount: amount,
        fees: transfer.data.fees
      };
    } catch (error) {
      console.error('Transfer USDC error:', error);
      throw new Error(`Failed to transfer USDC: ${error.message}`);
    }
  }

  // Get wallet balance
  async getBalance(walletId) {
    if (this.isMockMode) {
      return this.mockService.getBalance(walletId);
    }
    try {
      const wallet = await this.client.wallets.get(walletId);

      if (!wallet.data) {
        throw new Error('Wallet not found');
      }

      const balances = wallet.data.balances || [];

      // Find USDC balance
      const usdcBalance = balances.find(b =>
        b.currency === 'USD' || b.currency === 'USDC'
      );

      return {
        walletId,
        address: wallet.data.address,
        balances: balances.map(b => ({
          currency: b.currency,
          amount: parseFloat(b.amount || '0'),
          updateTime: b.updateTime
        })),
        usdcBalance: parseFloat(usdcBalance?.amount || '0'),
        status: wallet.data.status
      };
    } catch (error) {
      console.error('Get balance error:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  // Create/Link bank account for ACH/Wire
  async linkBankAccount(accountDetails, userId) {
    if (this.isMockMode) {
      return this.mockService.linkBankAccount(accountDetails, userId);
    }
    try {
      const idempotencyKey = `bank-${userId}-${Date.now()}`;

      const bankAccount = await this.client.bankAccounts.create({
        idempotencyKey,
        accountNumber: accountDetails.accountNumber,
        routingNumber: accountDetails.routingNumber,
        billingDetails: {
          name: accountDetails.accountName,
          city: accountDetails.city,
          country: accountDetails.country || 'US',
          postalCode: accountDetails.postalCode,
          line1: accountDetails.address,
          district: accountDetails.state
        },
        bankAddress: {
          bankName: accountDetails.bankName,
          city: accountDetails.bankCity,
          country: accountDetails.bankCountry || 'US'
        },
        metadata: {
          userId,
          addedAt: new Date().toISOString()
        }
      });

      // Store bank account reference
      await this.saveBankAccountToDatabase({
        userId,
        bankAccountId: bankAccount.data.id,
        last4: accountDetails.accountNumber.slice(-4),
        bankName: accountDetails.bankName,
        status: bankAccount.data.status
      });

      return {
        bankAccountId: bankAccount.data.id,
        status: bankAccount.data.status,
        trackingRef: bankAccount.data.trackingRef,
        fingerprint: bankAccount.data.fingerprint
      };
    } catch (error) {
      console.error('Link bank account error:', error);
      throw new Error(`Failed to link bank account: ${error.message}`);
    }
  }

  // Save bank account to database
  async saveBankAccountToDatabase(accountData) {
    try {
      const query = `
        INSERT INTO bank_accounts (user_id, metadata, status, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `;

      const metadata = {
        circle_bank_id: accountData.bankAccountId,
        last4: accountData.last4,
        bank_name: accountData.bankName
      };

      const result = await db.query(query, [
        accountData.userId,
        JSON.stringify(metadata),
        accountData.status
      ]);

      return result.rows[0];
    } catch (error) {
      // If table doesn't exist, store in users metadata
      const fallbackQuery = `
        UPDATE users
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{circle_bank_account}',
          $1::jsonb
        )
        WHERE id = $2
      `;

      await db.query(fallbackQuery, [
        JSON.stringify(accountData),
        accountData.userId
      ]);
    }
  }

  // Log transaction to database
  async logTransaction(transactionData) {
    try {
      const query = `
        INSERT INTO transactions (
          user_id,
          type,
          amount,
          metadata,
          status,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `;

      const metadata = {
        circle_payment_id: transactionData.circlePaymentId,
        circle_transfer_id: transactionData.circleTransferId,
        circle_payout_id: transactionData.circlePayoutId,
        destination_address: transactionData.destinationAddress,
        source_wallet: transactionData.sourceWalletId,
        to_address: transactionData.toAddress
      };

      const result = await db.query(query, [
        transactionData.userId,
        transactionData.type,
        transactionData.amount,
        JSON.stringify(metadata),
        transactionData.status || 'pending'
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Log transaction error:', error);
      // Don't throw - logging failure shouldn't stop the operation
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  // Handle webhook notifications
  async handleWebhook(payload, signature) {
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const { Type, Message } = payload;

    switch (Type) {
      case 'payments':
        await this.handlePaymentUpdate(Message);
        break;
      case 'transfers':
        await this.handleTransferUpdate(Message);
        break;
      case 'payouts':
        await this.handlePayoutUpdate(Message);
        break;
      default:
        console.log('Unhandled webhook type:', Type);
    }
  }

  // Handle payment (mint) updates
  async handlePaymentUpdate(message) {
    const { id, status, amount } = message;

    // Update transaction status in database
    const query = `
      UPDATE transactions
      SET status = $1,
          metadata = jsonb_set(metadata, '{circle_status}', $2)
      WHERE metadata->>'circle_payment_id' = $3
    `;

    await db.query(query, [status, JSON.stringify(status), id]);

    // Emit event for real-time updates
    if (global.io) {
      global.io.emit('payment:update', {
        paymentId: id,
        status,
        amount
      });
    }
  }

  // Handle transfer updates
  async handleTransferUpdate(message) {
    const { id, status, transactionHash } = message;

    // Update transaction status in database
    const query = `
      UPDATE transactions
      SET status = $1,
          metadata = jsonb_set(metadata, '{transaction_hash}', $2)
      WHERE metadata->>'circle_transfer_id' = $3
    `;

    await db.query(query, [
      status,
      JSON.stringify(transactionHash),
      id
    ]);

    // Emit event for real-time updates
    if (global.io) {
      global.io.emit('transfer:update', {
        transferId: id,
        status,
        transactionHash
      });
    }
  }

  // Handle payout (burn) updates
  async handlePayoutUpdate(message) {
    const { id, status, amount } = message;

    // Update transaction status in database
    const query = `
      UPDATE transactions
      SET status = $1
      WHERE metadata->>'circle_payout_id' = $2
    `;

    await db.query(query, [status, id]);

    // Emit event for real-time updates
    if (global.io) {
      global.io.emit('payout:update', {
        payoutId: id,
        status,
        amount
      });
    }
  }

  // Get supported chains
  async getSupportedChains() {
    if (this.isMockMode) {
      return this.mockService.getSupportedChains();
    }
    return [
      { chain: 'ETH', name: 'Ethereum', enabled: true },
      { chain: 'SOL', name: 'Solana', enabled: true },
      { chain: 'MATIC', name: 'Polygon', enabled: true },
      { chain: 'AVAX', name: 'Avalanche', enabled: true }
    ];
  }

  // Estimate fees
  async estimateFees(operation, amount, chain = 'ETH') {
    if (this.isMockMode) {
      return this.mockService.estimateFees(operation, amount, chain);
    }
    // Circle fee structure (example)
    const fees = {
      mint: amount * 0.001, // 0.1%
      burn: amount * 0.001, // 0.1%
      transfer: chain === 'ETH' ? 5 : 1 // Network fees
    };

    return {
      operation,
      amount,
      chain,
      fee: fees[operation] || 0,
      total: amount + (fees[operation] || 0)
    };
  }
}

export default new CircleService();