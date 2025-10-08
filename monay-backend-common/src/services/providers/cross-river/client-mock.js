/**
 * Cross River Bank Mock Client
 * Use this for development while waiting for API credentials
 * Replace with actual implementation once registered
 */

export class CrossRiverClient {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || process.env.CROSS_RIVER_API_URL || 'https://sandbox.crossriver.com/v1';
    this.apiKey = config.apiKey || process.env.CROSS_RIVER_API_KEY || 'mock-api-key';
    this.apiSecret = config.apiSecret || process.env.CROSS_RIVER_API_SECRET || 'mock-api-secret';
    this.fboAccount = config.fboAccount || process.env.CROSS_RIVER_FBO_ACCOUNT_NUMBER || 'mock-fbo-12345';
    this.isMockMode = !process.env.CROSS_RIVER_API_KEY;

    if (this.isMockMode) {
      console.warn('⚠️ Cross River running in MOCK mode - register at https://www.crossriver.com/partnerships');
    }
  }

  /**
   * Create ACH transfer
   */
  async createACHTransfer(params) {
    const { amount, recipientAccount, recipientRouting, recipientName, description } = params;

    if (this.isMockMode) {
      return {
        success: true,
        transactionId: `mock-ach-${Date.now()}`,
        status: 'pending',
        estimatedSettlement: new Date(Date.now() + 86400000).toISOString(), // +1 day
        amount,
        recipientAccount: recipientAccount.slice(-4).padStart(recipientAccount.length, '*'),
        fee: 0.15,
        message: 'MOCK: ACH transfer created'
      };
    }

    // Real implementation will go here
    // const response = await fetch(`${this.apiUrl}/transfers/ach`, { ... });
  }

  /**
   * Create FedNow instant payment
   */
  async createFedNowTransfer(params) {
    const { amount, recipientAccount, recipientRouting, recipientName } = params;

    if (this.isMockMode) {
      return {
        success: true,
        transactionId: `mock-fednow-${Date.now()}`,
        status: 'completed',
        settledAt: new Date().toISOString(),
        amount,
        recipientAccount: recipientAccount.slice(-4).padStart(recipientAccount.length, '*'),
        fee: 0.50,
        message: 'MOCK: FedNow transfer completed instantly'
      };
    }

    // Real implementation will go here
  }

  /**
   * Create RTP (Real-Time Payment)
   */
  async createRTPTransfer(params) {
    const { amount, recipientAccount, recipientRouting, recipientName } = params;

    if (this.isMockMode) {
      return {
        success: true,
        transactionId: `mock-rtp-${Date.now()}`,
        status: 'completed',
        settledAt: new Date().toISOString(),
        amount,
        recipientAccount: recipientAccount.slice(-4).padStart(recipientAccount.length, '*'),
        fee: 0.45,
        message: 'MOCK: RTP transfer completed'
      };
    }

    // Real implementation will go here
  }

  /**
   * Create SWIFT wire transfer
   */
  async createWireTransfer(params) {
    const { amount, recipientAccount, recipientBank, swiftCode, recipientName } = params;

    if (this.isMockMode) {
      return {
        success: true,
        transactionId: `mock-wire-${Date.now()}`,
        status: 'processing',
        estimatedSettlement: new Date(Date.now() + 172800000).toISOString(), // +2 days
        amount,
        recipientBank,
        fee: 25.00,
        message: 'MOCK: Wire transfer initiated'
      };
    }

    // Real implementation will go here
  }

  /**
   * Get FBO account balance
   */
  async getFBOBalance() {
    if (this.isMockMode) {
      return {
        success: true,
        accountNumber: this.fboAccount,
        availableBalance: 1000000.00,
        pendingBalance: 50000.00,
        currency: 'USD',
        lastUpdated: new Date().toISOString(),
        message: 'MOCK: FBO balance retrieved'
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
    // const expectedSignature = crypto.createHmac('sha256', this.webhookSecret)...
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId) {
    if (this.isMockMode) {
      return {
        success: true,
        transactionId,
        status: 'completed',
        settledAt: new Date().toISOString(),
        details: {
          type: transactionId.includes('ach') ? 'ACH' :
                transactionId.includes('fednow') ? 'FedNow' :
                transactionId.includes('rtp') ? 'RTP' : 'Wire',
          amount: 100.00,
          fee: 0.50
        },
        message: 'MOCK: Transaction status retrieved'
      };
    }

    // Real implementation will go here
  }
}

// Singleton instance
let instance;

export function getCrossRiverClient() {
  if (!instance) {
    instance = new CrossRiverClient();
  }
  return instance;
}

export default CrossRiverClient;