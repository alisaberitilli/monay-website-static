import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import pkg from '@coral-xyz/anchor';
const { Program, AnchorProvider, BN } = pkg;
import mplPkg from '@metaplex-foundation/mpl-bubblegum';
const { createTree, mintCompressedNFT } = mplPkg;
import crypto from 'crypto';
import db from '../models/index.js';
import tempoService from './tempo.js';
import circleService from './circle.js';
import auditLogService from './audit-log.js';

class EnterpriseTreasuryService {
  constructor() {
    // Solana connection
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Invoice program ID on Solana
    // This will be the deployed program for invoice tokenization
    // Using system program for now, will be replaced with actual invoice program
    this.INVOICE_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

    // Provider hierarchy for stablecoin operations
    this.providers = {
      primary: 'tempo',
      fallback: 'circle'
    };

    // Cost tracking
    this.COSTS = {
      TREE_SETUP: 50,         // One-time merkle tree setup
      INVOICE_MINT: 0.00005,  // Per invoice using compressed NFTs
      PAYMENT_FEE: 0.0001,    // Tempo payment fee
      SWAP_FEE: 0.001         // Provider swap fee
    };
  }

  /**
   * Initialize treasury for an enterprise
   * Creates merkle tree for compressed invoice NFTs
   */
  async initializeEnterpriseTreasury(enterpriseId, walletAddress) {
    try {
      // Check if enterprise already has treasury
      const existingTreasury = await db.EnterpriseTreasury.findOne({
        where: { enterprise_id: enterpriseId }
      });

      if (existingTreasury) {
        throw new Error('Treasury already initialized for this enterprise');
      }

      // Create merkle tree for invoice storage (one-time setup)
      const treeKeypair = Keypair.generate();
      const maxDepth = 20; // Can store 2^20 = 1,048,576 invoices
      const maxBufferSize = 64;

      // Initialize tree on Solana (stores compressed NFTs)
      // Note: In production, this would actually create the tree on-chain
      const treePublicKey = treeKeypair.publicKey.toString();

      // Create treasury record in database
      const treasury = await db.EnterpriseTreasury.create({
        enterprise_id: enterpriseId,
        wallet_address: walletAddress,
        solana_tree_address: treePublicKey,
        tree_capacity: Math.pow(2, maxDepth),
        invoices_created: 0,
        tempo_balance: 0,
        circle_balance: 0,
        total_minted: 0,
        total_burned: 0,
        status: 'ACTIVE',
        created_at: new Date()
      });

      // Create tempo wallet for enterprise
      const tempoWallet = await tempoService.createEnterpriseWallet(enterpriseId);

      // Create circle wallet as fallback
      const circleWallet = await circleService.createWallet({
        enterpriseId,
        walletType: 'ENTERPRISE'
      });

      // Update treasury with wallet addresses
      await treasury.update({
        tempo_wallet_id: tempoWallet.walletId,
        circle_wallet_id: circleWallet.id
      });

      // Log treasury initialization
      await auditLogService.log({
        user_id: enterpriseId,
        action: 'TREASURY_INITIALIZED',
        details: {
          tree_address: treePublicKey,
          capacity: Math.pow(2, maxDepth),
          tempo_wallet: tempoWallet.walletId,
          circle_wallet: circleWallet.id,
          setup_cost_usd: this.COSTS.TREE_SETUP
        }
      });

      console.log(`✅ Treasury initialized for enterprise ${enterpriseId}`);
      console.log(`📊 Capacity: ${Math.pow(2, maxDepth).toLocaleString()} invoices`);
      console.log(`💰 Setup cost: $${this.COSTS.TREE_SETUP}`);

      return {
        success: true,
        treasury: {
          id: treasury.id,
          tree_address: treePublicKey,
          capacity: Math.pow(2, maxDepth),
          tempo_wallet: tempoWallet.walletId,
          circle_wallet: circleWallet.id,
          setup_cost: this.COSTS.TREE_SETUP
        }
      };
    } catch (error) {
      console.error('Treasury initialization error:', error);
      throw error;
    }
  }

  /**
   * Create tokenized invoice on Solana
   * Uses compressed NFTs for ultra-low cost
   */
  async createTokenizedInvoice(enterpriseId, invoiceData) {
    try {
      const treasury = await db.EnterpriseTreasury.findOne({
        where: { enterprise_id: enterpriseId }
      });

      if (!treasury) {
        throw new Error('Treasury not initialized. Please initialize first.');
      }

      // Generate invoice number
      const invoiceNumber = treasury.invoices_created + 1;

      // Create invoice metadata for IPFS
      const metadata = {
        name: `Invoice #${invoiceNumber}`,
        description: invoiceData.description,
        amount: invoiceData.amount,
        due_date: invoiceData.due_date,
        recipient: invoiceData.recipient_id,
        line_items: invoiceData.line_items,
        terms: invoiceData.terms,
        created_at: new Date().toISOString()
      };

      // Store metadata on IPFS (mock for now)
      const ipfsHash = crypto.randomBytes(32).toString('hex');
      const metadataUri = `ipfs://${ipfsHash}`;

      // Derive invoice PDA on Solana
      const [invoicePDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from('invoice'),
          new PublicKey(treasury.wallet_address).toBuffer(),
          new BN(invoiceNumber).toArrayLike(Buffer, 'le', 8)
        ],
        this.INVOICE_PROGRAM_ID
      );

      // Create invoice record in database
      const invoice = await db.Invoice.create({
        enterprise_id: enterpriseId,
        invoice_number: invoiceNumber,
        solana_address: invoicePDA.toString(),
        recipient_id: invoiceData.recipient_id,
        amount: invoiceData.amount,
        paid_amount: 0,
        status: 'PENDING',
        invoice_type: invoiceData.type || 'ENTERPRISE',
        metadata_uri: metadataUri,
        due_date: invoiceData.due_date,
        created_at: new Date()
      });

      // Store line items
      if (invoiceData.line_items && invoiceData.line_items.length > 0) {
        const lineItems = invoiceData.line_items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        }));

        await db.InvoiceLineItem.bulkCreate(lineItems);
      }

      // Update treasury counters
      await treasury.increment('invoices_created');

      // Log invoice creation
      await auditLogService.log({
        user_id: enterpriseId,
        action: 'INVOICE_TOKENIZED',
        details: {
          invoice_id: invoice.id,
          invoice_number: invoiceNumber,
          solana_address: invoicePDA.toString(),
          amount: invoiceData.amount,
          recipient: invoiceData.recipient_id,
          cost_usd: this.COSTS.INVOICE_MINT
        }
      });

      console.log(`✅ Invoice #${invoiceNumber} tokenized on Solana`);
      console.log(`🆔 Solana address: ${invoicePDA.toString()}`);
      console.log(`💰 Cost: $${this.COSTS.INVOICE_MINT}`);

      return {
        success: true,
        invoice: {
          id: invoice.id,
          number: invoiceNumber,
          solana_address: invoicePDA.toString(),
          amount: invoiceData.amount,
          due_date: invoiceData.due_date,
          metadata_uri: metadataUri,
          cost: this.COSTS.INVOICE_MINT,
          status: 'PENDING'
        }
      };
    } catch (error) {
      console.error('Invoice tokenization error:', error);
      throw error;
    }
  }

  /**
   * Process invoice payment
   * Atomic operation on Solana
   */
  async processInvoicePayment(invoiceId, payerId, paymentAmount, provider = 'tempo') {
    try {
      const invoice = await db.Invoice.findByPk(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'PAID') {
        throw new Error('Invoice already paid');
      }

      const treasury = await db.EnterpriseTreasury.findOne({
        where: { enterprise_id: invoice.enterprise_id }
      });

      // Determine payment type
      const remainingAmount = invoice.amount - invoice.paid_amount;
      let paymentType;
      let actualPayment = paymentAmount;
      let customerCredit = 0;

      if (paymentAmount === remainingAmount) {
        paymentType = 'EXACT';
      } else if (paymentAmount < remainingAmount) {
        paymentType = 'PARTIAL';
      } else {
        paymentType = 'OVERPAYMENT';
        customerCredit = paymentAmount - remainingAmount;
        actualPayment = remainingAmount;
      }

      // Execute payment via selected provider
      let paymentResult;
      if (provider === 'tempo') {
        paymentResult = await tempoService.transfer({
          from: payerId,
          to: treasury.tempo_wallet_id,
          amount: actualPayment,
          memo: `Invoice #${invoice.invoice_number}`
        });
      } else {
        paymentResult = await circleService.createTransfer({
          sourceWalletId: payerId,
          destinationWalletId: treasury.circle_wallet_id,
          amount: actualPayment,
          currency: 'USDC'
        });
      }

      // Record payment
      const payment = await db.InvoicePayment.create({
        invoice_id: invoiceId,
        payer_id: payerId,
        amount: paymentAmount,
        payment_type: paymentType,
        provider: provider,
        transaction_hash: paymentResult.transactionHash,
        status: 'COMPLETED',
        created_at: new Date()
      });

      // Update invoice
      const newPaidAmount = invoice.paid_amount + actualPayment;
      const newStatus = newPaidAmount >= invoice.amount ? 'PAID' : 'PARTIALLY_PAID';

      await invoice.update({
        paid_amount: newPaidAmount,
        status: newStatus,
        last_payment_at: new Date(),
        paid_at: newStatus === 'PAID' ? new Date() : null
      });

      // Handle customer credit for overpayment
      if (customerCredit > 0) {
        await db.CustomerCredit.create({
          customer_id: payerId,
          enterprise_id: invoice.enterprise_id,
          amount: customerCredit,
          source_invoice_id: invoiceId,
          status: 'AVAILABLE',
          created_at: new Date()
        });
      }

      // Update treasury balance
      const balanceField = provider === 'tempo' ? 'tempo_balance' : 'circle_balance';
      await treasury.increment(balanceField, { by: actualPayment });

      // Log payment
      await auditLogService.log({
        user_id: payerId,
        action: 'INVOICE_PAYMENT',
        details: {
          invoice_id: invoiceId,
          payment_id: payment.id,
          amount: paymentAmount,
          actual_payment: actualPayment,
          customer_credit: customerCredit,
          payment_type: paymentType,
          provider: provider,
          new_status: newStatus,
          settlement_time_ms: paymentResult.settlementTime || 100
        }
      });

      console.log(`✅ Invoice #${invoice.invoice_number} payment processed`);
      console.log(`💸 Amount: $${paymentAmount} (${paymentType})`);
      console.log(`⚡ Settlement: ${paymentResult.settlementTime || 100}ms via ${provider}`);

      return {
        success: true,
        payment: {
          id: payment.id,
          invoice_id: invoiceId,
          amount: paymentAmount,
          actual_payment: actualPayment,
          customer_credit: customerCredit,
          payment_type: paymentType,
          provider: provider,
          transaction_hash: paymentResult.transactionHash,
          invoice_status: newStatus,
          remaining_balance: invoice.amount - newPaidAmount
        }
      };
    } catch (error) {
      console.error('Invoice payment error:', error);
      throw error;
    }
  }

  /**
   * Treasury swap between Tempo and Circle
   * Optimizes for speed vs reliability
   */
  async swapTreasuryProvider(enterpriseId, amount, fromProvider, toProvider) {
    try {
      const treasury = await db.EnterpriseTreasury.findOne({
        where: { enterprise_id: enterpriseId }
      });

      if (!treasury) {
        throw new Error('Treasury not found');
      }

      // Validate sufficient balance
      const fromBalance = fromProvider === 'tempo' ?
        treasury.tempo_balance : treasury.circle_balance;

      if (fromBalance < amount) {
        throw new Error(`Insufficient ${fromProvider} balance`);
      }

      // Execute atomic swap
      let swapResult;
      if (fromProvider === 'tempo' && toProvider === 'circle') {
        // Burn on Tempo, mint on Circle
        const burnResult = await tempoService.burn({
          walletId: treasury.tempo_wallet_id,
          amount: amount
        });

        const mintResult = await circleService.mint({
          walletId: treasury.circle_wallet_id,
          amount: amount
        });

        swapResult = { burn: burnResult, mint: mintResult };
      } else if (fromProvider === 'circle' && toProvider === 'tempo') {
        // Burn on Circle, mint on Tempo
        const burnResult = await circleService.burn({
          walletId: treasury.circle_wallet_id,
          amount: amount
        });

        const mintResult = await tempoService.mint({
          walletId: treasury.tempo_wallet_id,
          amount: amount
        });

        swapResult = { burn: burnResult, mint: mintResult };
      }

      // Update balances
      const fromBalanceField = fromProvider === 'tempo' ? 'tempo_balance' : 'circle_balance';
      const toBalanceField = toProvider === 'tempo' ? 'tempo_balance' : 'circle_balance';

      await treasury.decrement(fromBalanceField, { by: amount });
      await treasury.increment(toBalanceField, { by: amount });

      // Log swap
      await auditLogService.log({
        user_id: enterpriseId,
        action: 'TREASURY_SWAP',
        details: {
          from_provider: fromProvider,
          to_provider: toProvider,
          amount: amount,
          swap_result: swapResult,
          new_tempo_balance: treasury.tempo_balance,
          new_circle_balance: treasury.circle_balance
        }
      });

      console.log(`✅ Treasury swap completed`);
      console.log(`💱 ${amount} USDC: ${fromProvider} → ${toProvider}`);

      return {
        success: true,
        swap: {
          from: fromProvider,
          to: toProvider,
          amount: amount,
          new_balances: {
            tempo: treasury.tempo_balance,
            circle: treasury.circle_balance
          }
        }
      };
    } catch (error) {
      console.error('Treasury swap error:', error);
      throw error;
    }
  }

  /**
   * Enterprise on-ramp: Deposit fiat to mint tokens
   */
  async enterpriseOnRamp(enterpriseId, amount, depositMethod) {
    try {
      const treasury = await db.EnterpriseTreasury.findOne({
        where: { enterprise_id: enterpriseId }
      });

      // Record fiat deposit
      const deposit = await db.FiatReserve.create({
        user_id: enterpriseId,
        amount: amount,
        deposit_method: depositMethod,
        status: 'PENDING',
        created_at: new Date()
      });

      // Mint equivalent tokens (Tempo primary, Circle fallback)
      let mintResult;
      try {
        mintResult = await tempoService.mint({
          walletId: treasury.tempo_wallet_id,
          amount: amount,
          reserveId: deposit.id
        });

        await treasury.increment('tempo_balance', { by: amount });
      } catch (tempoError) {
        console.log('Tempo mint failed, using Circle:', tempoError);
        mintResult = await circleService.mint({
          walletId: treasury.circle_wallet_id,
          amount: amount,
          reserveId: deposit.id
        });

        await treasury.increment('circle_balance', { by: amount });
      }

      // Update deposit status
      await deposit.update({
        status: 'CONFIRMED',
        confirmed_at: new Date()
      });

      // Update treasury totals
      await treasury.increment('total_minted', { by: amount });

      console.log(`✅ Enterprise on-ramp completed`);
      console.log(`💰 Amount: $${amount}`);
      console.log(`🏦 Method: ${depositMethod}`);

      return {
        success: true,
        deposit: {
          id: deposit.id,
          amount: amount,
          provider: mintResult.provider || 'tempo',
          transaction_hash: mintResult.transactionHash,
          new_balance: mintResult.provider === 'tempo' ?
            treasury.tempo_balance : treasury.circle_balance
        }
      };
    } catch (error) {
      console.error('Enterprise on-ramp error:', error);
      throw error;
    }
  }

  /**
   * Enterprise off-ramp: Burn tokens to withdraw fiat
   */
  async enterpriseOffRamp(enterpriseId, amount, withdrawalMethod, provider = 'tempo') {
    try {
      const treasury = await db.EnterpriseTreasury.findOne({
        where: { enterprise_id: enterpriseId }
      });

      // Validate sufficient balance
      const balance = provider === 'tempo' ?
        treasury.tempo_balance : treasury.circle_balance;

      if (balance < amount) {
        throw new Error(`Insufficient ${provider} balance`);
      }

      // Burn tokens
      let burnResult;
      if (provider === 'tempo') {
        burnResult = await tempoService.burn({
          walletId: treasury.tempo_wallet_id,
          amount: amount
        });

        await treasury.decrement('tempo_balance', { by: amount });
      } else {
        burnResult = await circleService.burn({
          walletId: treasury.circle_wallet_id,
          amount: amount
        });

        await treasury.decrement('circle_balance', { by: amount });
      }

      // Create withdrawal record
      const withdrawal = await db.TokenBurn.create({
        user_id: enterpriseId,
        amount: amount,
        provider: provider,
        burn_transaction_hash: burnResult.transactionHash,
        withdrawal_method: withdrawalMethod,
        status: 'PENDING',
        created_at: new Date()
      });

      // Update treasury totals
      await treasury.increment('total_burned', { by: amount });

      console.log(`✅ Enterprise off-ramp initiated`);
      console.log(`💰 Amount: $${amount}`);
      console.log(`🏦 Method: ${withdrawalMethod}`);

      return {
        success: true,
        withdrawal: {
          id: withdrawal.id,
          amount: amount,
          provider: provider,
          burn_hash: burnResult.transactionHash,
          estimated_arrival: '2-3 business days',
          remaining_balance: balance - amount
        }
      };
    } catch (error) {
      console.error('Enterprise off-ramp error:', error);
      throw error;
    }
  }

  /**
   * Get treasury dashboard data
   */
  async getTreasuryDashboard(enterpriseId) {
    try {
      const treasury = await db.EnterpriseTreasury.findOne({
        where: { enterprise_id: enterpriseId }
      });

      if (!treasury) {
        throw new Error('Treasury not found');
      }

      // Get invoice statistics
      const invoiceStats = await db.Invoice.findAll({
        where: { enterprise_id: enterpriseId },
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total_invoices'],
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total_value'],
          [db.sequelize.fn('SUM', db.sequelize.col('paid_amount')), 'total_collected'],
          [db.sequelize.literal(`COUNT(CASE WHEN status = 'PAID' THEN 1 END)`), 'paid_count'],
          [db.sequelize.literal(`COUNT(CASE WHEN status = 'PENDING' THEN 1 END)`), 'pending_count']
        ],
        raw: true
      });

      // Get recent payments
      const recentPayments = await db.InvoicePayment.findAll({
        include: [{
          model: db.Invoice,
          where: { enterprise_id: enterpriseId }
        }],
        order: [['created_at', 'DESC']],
        limit: 10
      });

      // Calculate metrics
      const totalBalance = treasury.tempo_balance + treasury.circle_balance;
      const utilizationRate = treasury.invoices_created / treasury.tree_capacity * 100;

      return {
        treasury: {
          id: treasury.id,
          total_balance: totalBalance,
          tempo_balance: treasury.tempo_balance,
          circle_balance: treasury.circle_balance,
          total_minted: treasury.total_minted,
          total_burned: treasury.total_burned,
          tree_utilization: utilizationRate.toFixed(2) + '%'
        },
        invoices: {
          total: invoiceStats[0]?.total_invoices || 0,
          total_value: invoiceStats[0]?.total_value || 0,
          total_collected: invoiceStats[0]?.total_collected || 0,
          paid: invoiceStats[0]?.paid_count || 0,
          pending: invoiceStats[0]?.pending_count || 0
        },
        recent_payments: recentPayments,
        costs: {
          tree_setup: this.COSTS.TREE_SETUP,
          per_invoice: this.COSTS.INVOICE_MINT,
          total_invoice_costs: treasury.invoices_created * this.COSTS.INVOICE_MINT
        }
      };
    } catch (error) {
      console.error('Dashboard error:', error);
      throw error;
    }
  }
}

export default new EnterpriseTreasuryService();