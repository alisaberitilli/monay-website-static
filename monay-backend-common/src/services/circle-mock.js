/**
 * Mock Circle Service for Testing Without API Keys
 * This allows testing the UI and flow without actual Circle credentials
 */

class CircleMockService {
  constructor() {
    this.mockWallets = new Map();
    this.mockTransactions = [];
    this.mockBankAccounts = new Map();
    this.nextId = 1000;
  }

  // Generate mock IDs
  generateId(prefix) {
    return `${prefix}_mock_${this.nextId++}_${Date.now()}`;
  }

  // Mock wallet creation
  async createWallet(userId, type = 'enterprise', metadata = {}) {
    console.log('🔵 MOCK MODE: Creating mock wallet for user:', userId);

    // Check if user already has a wallet
    const existing = Array.from(this.mockWallets.values()).find(w => w.userId === userId);
    if (existing) {
      return existing;
    }

    const walletData = {
      userId,
      walletId: this.generateId('wallet'),
      address: `0xMOCK${Math.random().toString(36).substring(2, 15)}`,
      blockchain: 'ETH',
      type,
      status: 'active',
      balance: 1000, // Start with $1000 mock balance
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        isMock: true
      }
    };

    this.mockWallets.set(walletData.walletId, walletData);
    return walletData;
  }

  // Mock get wallet by user ID
  async getWalletByUserId(userId) {
    console.log('🔵 MOCK MODE: Getting wallet for user:', userId);

    const wallet = Array.from(this.mockWallets.values()).find(w => w.userId === userId);

    if (!wallet) {
      // Auto-create wallet if not exists
      return await this.createWallet(userId);
    }

    return wallet;
  }

  // Mock mint USDC
  async mintUSDC(amount, destinationAddress, sourceAccount, userId) {
    console.log('🔵 MOCK MODE: Minting USDC:', { amount, userId });

    const wallet = await this.getWalletByUserId(userId);
    if (wallet) {
      wallet.balance += parseFloat(amount);
      this.mockWallets.set(wallet.walletId, wallet);
    }

    const transaction = {
      paymentId: this.generateId('payment'),
      status: 'confirmed',
      amount,
      type: 'mint',
      userId,
      timestamp: new Date().toISOString(),
      trackingRef: `MOCK-MINT-${Date.now()}`
    };

    this.mockTransactions.push(transaction);

    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      paymentId: transaction.paymentId,
      status: transaction.status,
      amount,
      trackingRef: transaction.trackingRef,
      message: 'Mock mint successful'
    };
  }

  // Mock burn USDC
  async burnUSDC(amount, sourceWalletId, destinationBankAccount, userId) {
    console.log('🔵 MOCK MODE: Burning USDC:', { amount, userId });

    const wallet = await this.getWalletByUserId(userId);

    if (!wallet || wallet.balance < parseFloat(amount)) {
      throw new Error('Insufficient balance for burn operation');
    }

    wallet.balance -= parseFloat(amount);
    this.mockWallets.set(wallet.walletId, wallet);

    const transaction = {
      payoutId: this.generateId('payout'),
      status: 'confirmed',
      amount,
      type: 'burn',
      userId,
      timestamp: new Date().toISOString(),
      trackingRef: `MOCK-BURN-${Date.now()}`
    };

    this.mockTransactions.push(transaction);

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      payoutId: transaction.payoutId,
      status: transaction.status,
      amount,
      fees: { amount: '2', currency: 'USD' },
      trackingRef: transaction.trackingRef
    };
  }

  // Mock transfer USDC
  async transferUSDC(amount, fromWalletId, toAddress, userId) {
    console.log('🔵 MOCK MODE: Transferring USDC:', { amount, toAddress, userId });

    const wallet = await this.getWalletByUserId(userId);

    if (!wallet || wallet.balance < parseFloat(amount)) {
      throw new Error('Insufficient balance for transfer');
    }

    wallet.balance -= parseFloat(amount);
    this.mockWallets.set(wallet.walletId, wallet);

    const transaction = {
      transferId: this.generateId('transfer'),
      status: 'confirmed',
      transactionHash: `0xMOCK${Math.random().toString(36).substring(2, 35)}`,
      amount,
      type: 'transfer',
      userId,
      fromAddress: wallet.address,
      toAddress,
      timestamp: new Date().toISOString()
    };

    this.mockTransactions.push(transaction);

    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      transferId: transaction.transferId,
      status: transaction.status,
      transactionHash: transaction.transactionHash,
      amount,
      fees: { amount: '5', currency: 'USD' }
    };
  }

  // Mock get balance
  async getBalance(walletId) {
    console.log('🔵 MOCK MODE: Getting balance for wallet:', walletId);

    let wallet = this.mockWallets.get(walletId);

    // If wallet not found by ID, try to find by user ID
    if (!wallet && walletId) {
      wallet = await this.getWalletByUserId(walletId);
    }

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return {
      walletId: wallet.walletId,
      address: wallet.address,
      balances: [
        {
          currency: 'USDC',
          amount: wallet.balance.toFixed(2),
          updateTime: new Date().toISOString()
        }
      ],
      usdcBalance: wallet.balance,
      status: wallet.status
    };
  }

  // Mock link bank account
  async linkBankAccount(accountDetails, userId) {
    console.log('🔵 MOCK MODE: Linking bank account for user:', userId);

    const bankAccountId = this.generateId('bank');

    const bankAccount = {
      ...accountDetails,
      id: bankAccountId,
      userId,
      status: 'verified',
      createdAt: new Date().toISOString()
    };

    this.mockBankAccounts.set(bankAccountId, bankAccount);

    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      bankAccountId,
      status: 'verified',
      trackingRef: `MOCK-BANK-${Date.now()}`,
      fingerprint: `fp_mock_${Math.random().toString(36).substring(2, 10)}`
    };
  }

  // Mock save wallet to database (no-op in mock mode)
  async saveWalletToDatabase(walletData) {
    console.log('🔵 MOCK MODE: Saving wallet to database (simulated)');
    return { id: this.generateId('db') };
  }

  // Mock save bank account to database (no-op in mock mode)
  async saveBankAccountToDatabase(accountData) {
    console.log('🔵 MOCK MODE: Saving bank account to database (simulated)');
    return { id: this.generateId('db') };
  }

  // Mock log transaction (no-op in mock mode)
  async logTransaction(transactionData) {
    console.log('🔵 MOCK MODE: Logging transaction (simulated)');
    this.mockTransactions.push(transactionData);
    return { id: this.generateId('tx') };
  }

  // Mock verify webhook signature
  verifyWebhookSignature(payload, signature) {
    console.log('🔵 MOCK MODE: Webhook signature verification (always true)');
    return true;
  }

  // Mock handle webhook
  async handleWebhook(payload, signature) {
    console.log('🔵 MOCK MODE: Handling webhook:', payload.Type);
    // In mock mode, just log and return
    return { processed: true, mock: true };
  }

  // Mock webhook handlers
  async handlePaymentUpdate(message) {
    console.log('🔵 MOCK MODE: Payment update:', message);
  }

  async handleTransferUpdate(message) {
    console.log('🔵 MOCK MODE: Transfer update:', message);
  }

  async handlePayoutUpdate(message) {
    console.log('🔵 MOCK MODE: Payout update:', message);
  }

  // Mock get supported chains
  async getSupportedChains() {
    return [
      { chain: 'ETH', name: 'Ethereum', enabled: true },
      { chain: 'SOL', name: 'Solana', enabled: true },
      { chain: 'MATIC', name: 'Polygon', enabled: true },
      { chain: 'AVAX', name: 'Avalanche', enabled: true }
    ];
  }

  // Mock estimate fees
  async estimateFees(operation, amount, chain = 'ETH') {
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
      total: amount + (fees[operation] || 0),
      isMock: true
    };
  }

  // Get mock transactions for a user
  async getMockTransactions(userId, limit = 20, offset = 0) {
    const userTransactions = this.mockTransactions
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + limit);

    return {
      transactions: userTransactions,
      total: this.mockTransactions.filter(tx => tx.userId === userId).length
    };
  }
}

// Export singleton instance
export default new CircleMockService();