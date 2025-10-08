/**
 * BitGo Trust Mock Client
 * Use this for development while waiting for API credentials
 * Replace with actual implementation once registered
 */

export class BitGoClient {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || process.env.BITGO_API_URL || 'https://test.bitgo.com/api/v2';
    this.accessToken = config.accessToken || process.env.BITGO_ACCESS_TOKEN || 'mock-access-token';
    this.enterpriseId = config.enterpriseId || process.env.BITGO_ENTERPRISE_ID || 'mock-enterprise-id';
    this.isMockMode = !process.env.BITGO_ACCESS_TOKEN;

    if (this.isMockMode) {
      console.warn('⚠️ BitGo running in MOCK mode - register at https://www.bitgo.com/contact-sales');
    }

    // Mock wallet storage
    this.mockWallets = new Map();
  }

  /**
   * Create a new custody wallet
   */
  async createWallet(params) {
    const { coin = 'usdc', label, type = 'hot' } = params;

    if (this.isMockMode) {
      const walletId = `mock-wallet-${Date.now()}`;
      const address = `0x${Math.random().toString(16).substr(2, 40)}`;

      const wallet = {
        id: walletId,
        coin,
        label,
        type,
        address,
        balance: 0,
        enterpriseId: this.enterpriseId,
        createdAt: new Date().toISOString(),
        message: 'MOCK: Wallet created successfully'
      };

      this.mockWallets.set(walletId, wallet);
      return wallet;
    }

    // Real implementation will go here
    // const response = await fetch(`${this.apiUrl}/${coin}/enterprise/${this.enterpriseId}/wallet`, { ... });
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletId) {
    if (this.isMockMode) {
      const wallet = this.mockWallets.get(walletId) || {
        balance: Math.random() * 10000,
        coin: 'usdc'
      };

      return {
        success: true,
        walletId,
        balance: wallet.balance,
        confirmedBalance: wallet.balance,
        spendableBalance: wallet.balance * 0.98, // 98% spendable
        coin: wallet.coin,
        message: 'MOCK: Balance retrieved'
      };
    }

    // Real implementation will go here
  }

  /**
   * Create a transfer between wallets
   */
  async createTransfer(params) {
    const { sourceWalletId, destinationAddress, amount, coin = 'usdc', memo } = params;

    if (this.isMockMode) {
      return {
        success: true,
        transferId: `mock-transfer-${Date.now()}`,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        sourceWalletId,
        destinationAddress,
        amount,
        coin,
        fee: amount * 0.001, // 0.1% fee
        status: 'signed',
        estimatedConfirmation: new Date(Date.now() + 30000).toISOString(), // +30 seconds
        message: 'MOCK: Transfer created and signed'
      };
    }

    // Real implementation will go here
  }

  /**
   * Mint stablecoins (USDC/PYUSD)
   */
  async mintStablecoin(params) {
    const { coin = 'usdc', amount, destinationWalletId, bankAccountId } = params;

    if (this.isMockMode) {
      // Update mock wallet balance
      if (this.mockWallets.has(destinationWalletId)) {
        const wallet = this.mockWallets.get(destinationWalletId);
        wallet.balance = (wallet.balance || 0) + amount;
      }

      return {
        success: true,
        mintId: `mock-mint-${Date.now()}`,
        coin,
        amount,
        destinationWalletId,
        bankAccountId,
        status: 'pending',
        estimatedSettlement: new Date(Date.now() + 86400000).toISOString(), // +1 day
        message: 'MOCK: Stablecoin mint initiated'
      };
    }

    // Real implementation will go here
  }

  /**
   * Redeem stablecoins to fiat
   */
  async redeemStablecoin(params) {
    const { coin = 'usdc', amount, sourceWalletId, bankAccountId } = params;

    if (this.isMockMode) {
      // Update mock wallet balance
      if (this.mockWallets.has(sourceWalletId)) {
        const wallet = this.mockWallets.get(sourceWalletId);
        wallet.balance = Math.max(0, (wallet.balance || 0) - amount);
      }

      return {
        success: true,
        redeemId: `mock-redeem-${Date.now()}`,
        coin,
        amount,
        sourceWalletId,
        bankAccountId,
        status: 'pending',
        estimatedSettlement: new Date(Date.now() + 172800000).toISOString(), // +2 days
        message: 'MOCK: Stablecoin redemption initiated'
      };
    }

    // Real implementation will go here
  }

  /**
   * Setup multi-signature wallet
   */
  async setupMultiSig(walletId, params) {
    const { requiredSignatures = 2, signers = [] } = params;

    if (this.isMockMode) {
      return {
        success: true,
        walletId,
        multiSigConfig: {
          requiredSignatures,
          totalSigners: signers.length,
          signers: signers.map(s => ({ ...s, publicKey: `mock-key-${Math.random()}` })),
          createdAt: new Date().toISOString()
        },
        message: 'MOCK: Multi-sig configuration created'
      };
    }

    // Real implementation will go here
  }

  /**
   * Get supported coins
   */
  async getSupportedCoins() {
    if (this.isMockMode) {
      return {
        success: true,
        coins: [
          { coin: 'usdc', name: 'USD Coin', chain: 'ethereum', decimals: 6 },
          { coin: 'usdt', name: 'Tether USD', chain: 'ethereum', decimals: 6 },
          { coin: 'pyusd', name: 'PayPal USD', chain: 'ethereum', decimals: 6 },
          { coin: 'eurc', name: 'Euro Coin', chain: 'ethereum', decimals: 6 },
          { coin: 'btc', name: 'Bitcoin', chain: 'bitcoin', decimals: 8 },
          { coin: 'eth', name: 'Ethereum', chain: 'ethereum', decimals: 18 },
          { coin: 'sol', name: 'Solana', chain: 'solana', decimals: 9 }
        ],
        message: 'MOCK: Supported coins retrieved'
      };
    }

    // Real implementation will go here
  }

  /**
   * Generate deposit address
   */
  async generateDepositAddress(walletId) {
    if (this.isMockMode) {
      return {
        success: true,
        walletId,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        qrCode: 'data:image/png;base64,mock-qr-code',
        createdAt: new Date().toISOString(),
        message: 'MOCK: Deposit address generated'
      };
    }

    // Real implementation will go here
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    if (this.isMockMode) {
      return true; // Always valid in mock mode
    }

    // Real implementation will use HMAC verification
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId) {
    if (this.isMockMode) {
      return {
        success: true,
        txId,
        status: 'confirmed',
        confirmations: 12,
        blockHeight: 1234567,
        timestamp: new Date().toISOString(),
        fee: 0.001,
        message: 'MOCK: Transaction confirmed'
      };
    }

    // Real implementation will go here
  }
}

// Singleton instance
let instance;

export function getBitGoClient() {
  if (!instance) {
    instance = new BitGoClient();
  }
  return instance;
}

export default BitGoClient;