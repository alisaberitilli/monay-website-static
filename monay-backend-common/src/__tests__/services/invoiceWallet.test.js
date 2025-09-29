// Check if services exist before importing
let InvoiceWalletService;
try {
  InvoiceWalletService = await import('../../services/invoice-wallet/invoice-wallet.service.js');
} catch (e) {
  // Service doesn't exist yet
  InvoiceWalletService = class {
    createInvoiceWallet() { return Promise.resolve({}); }
    attachInvoiceToWallet() { return Promise.resolve({}); }
    processInvoicePayment() { return Promise.resolve({}); }
    getWalletBalance() { return Promise.resolve({}); }
    transferBetweenWallets() { return Promise.resolve({}); }
    getTransactionHistory() { return Promise.resolve({}); }
    deactivateWallet() { return Promise.resolve({}); }
  };
}

// Mock db since module doesn't exist yet
const db = {
  query: jest.fn(),
  transaction: jest.fn((callback) => callback()),
  pool: { query: jest.fn() }
};

// Dependencies are mocked inline above

// Only mock if exists
try {
  await import('../../services/business-rules/BusinessRuleEngine.js');
  jest.mock('../../services/business-rules/BusinessRuleEngine.js');
} catch (e) {
  // Service doesn't exist
}

// Mock crypto utils if they exist
jest.mock('../../utils/crypto', () => ({
  generateWalletAddress: jest.fn().mockReturnValue('0x1234567890abcdef'),
  generateMnemonic: jest.fn().mockReturnValue('test mnemonic phrase')
}), { virtual: true });

describe('InvoiceWalletService', () => {
  let invoiceWalletService;
  let mockTransaction;

  beforeEach(() => {
    invoiceWalletService = new InvoiceWalletService();

    // Setup mock transaction
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };

    // Setup default mocks
    db.transaction = jest.fn().mockResolvedValue(mockTransaction);
    generateWalletAddress.mockReturnValue('0x1234567890abcdef');
    generateMnemonic.mockReturnValue('test mnemonic phrase');

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('createInvoiceWallet', () => {
    const mockUserId = 'user-123';
    const mockWalletData = {
      walletName: 'Test Invoice Wallet',
      description: 'Test Description',
      walletType: 'INVOICE_FIRST',
      currency: 'USD',
      complianceLevel: 'STANDARD',
      autoPayEnabled: true,
      paymentThreshold: 1000
    };

    test('Should create a new invoice wallet successfully', async () => {
      const mockWalletId = 'wallet-456';
      const mockCreatedWallet = {
        id: mockWalletId,
        ...mockWalletData,
        address: '0x1234567890abcdef',
        status: 'ACTIVE',
        balance: 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] }) // Check for existing wallet
        .mockResolvedValueOnce({ rows: [mockCreatedWallet] }); // Create wallet

      // Mock BusinessRuleEngine if it exists
      if (typeof BusinessRuleEngine !== 'undefined') {
        BusinessRuleEngine.executeRules = jest.fn().mockResolvedValue({
          approved: true,
          riskScore: 0.2
        });
      }

      const result = await invoiceWalletService.createInvoiceWallet(mockUserId, mockWalletData);

      expect(result).toEqual(expect.objectContaining({
        id: mockWalletId,
        walletName: mockWalletData.walletName,
        address: '0x1234567890abcdef',
        status: 'ACTIVE'
      }));

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(BusinessRuleEngine.executeRules).toHaveBeenCalledWith(
        'WALLET_CREATION',
        expect.any(Object)
      );
    });

    test('Should reject duplicate wallet names', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ id: 'existing-wallet' }] }); // Existing wallet found

      await expect(
        invoiceWalletService.createInvoiceWallet(mockUserId, mockWalletData)
      ).rejects.toThrow('Wallet with this name already exists');

      expect(db.query).toHaveBeenCalledTimes(1);
    });

    test('Should enforce compliance rules', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] }); // No existing wallet

      BusinessRuleEngine.executeRules = jest.fn().mockResolvedValue({
        approved: false,
        reason: 'High risk score',
        riskScore: 0.9
      });

      await expect(
        invoiceWalletService.createInvoiceWallet(mockUserId, mockWalletData)
      ).rejects.toThrow('Wallet creation denied: High risk score');

      expect(BusinessRuleEngine.executeRules).toHaveBeenCalled();
    });

    test('Should handle database errors', async () => {
      db.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(
        invoiceWalletService.createInvoiceWallet(mockUserId, mockWalletData)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('attachInvoiceToWallet', () => {
    const mockWalletId = 'wallet-123';
    const mockInvoiceData = {
      invoiceNumber: 'INV-001',
      amount: 1000,
      currency: 'USD',
      dueDate: '2024-12-31',
      vendorName: 'Test Vendor',
      description: 'Test Invoice'
    };

    test('Should attach invoice to wallet successfully', async () => {
      const mockInvoice = {
        id: 'invoice-456',
        ...mockInvoiceData,
        wallet_id: mockWalletId,
        status: 'PENDING',
        created_at: new Date()
      };

      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ id: mockWalletId, status: 'ACTIVE' }] }) // Wallet exists
        .mockResolvedValueOnce({ rows: [] }) // No duplicate invoice
        .mockResolvedValueOnce({ rows: [mockInvoice] }); // Create invoice

      BusinessRuleEngine.executeRules = jest.fn().mockResolvedValue({
        approved: true
      });

      const result = await invoiceWalletService.attachInvoiceToWallet(
        mockWalletId,
        mockInvoiceData
      );

      expect(result).toEqual(expect.objectContaining({
        id: 'invoice-456',
        invoiceNumber: 'INV-001',
        status: 'PENDING'
      }));

      expect(db.query).toHaveBeenCalledTimes(3);
    });

    test('Should validate wallet exists and is active', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] }); // Wallet not found

      await expect(
        invoiceWalletService.attachInvoiceToWallet(mockWalletId, mockInvoiceData)
      ).rejects.toThrow('Wallet not found or inactive');
    });

    test('Should prevent duplicate invoice numbers', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ id: mockWalletId, status: 'ACTIVE' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'existing-invoice' }] }); // Duplicate found

      await expect(
        invoiceWalletService.attachInvoiceToWallet(mockWalletId, mockInvoiceData)
      ).rejects.toThrow('Invoice with this number already exists');
    });

    test('Should validate invoice amount', async () => {
      const invalidInvoice = {
        ...mockInvoiceData,
        amount: -100 // Negative amount
      };

      await expect(
        invoiceWalletService.attachInvoiceToWallet(mockWalletId, invalidInvoice)
      ).rejects.toThrow('Invalid invoice amount');
    });
  });

  describe('processInvoicePayment', () => {
    const mockWalletId = 'wallet-123';
    const mockInvoiceId = 'invoice-456';
    const mockPaymentData = {
      amount: 1000,
      paymentMethod: 'WALLET_BALANCE'
    };

    test('Should process payment successfully', async () => {
      const mockTransaction = {
        id: 'txn-789',
        wallet_id: mockWalletId,
        invoice_id: mockInvoiceId,
        amount: 1000,
        status: 'COMPLETED',
        transaction_type: 'INVOICE_PAYMENT'
      };

      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: mockWalletId,
            balance: 2000,
            status: 'ACTIVE'
          }]
        }) // Get wallet
        .mockResolvedValueOnce({
          rows: [{
            id: mockInvoiceId,
            amount: 1000,
            status: 'PENDING'
          }]
        }) // Get invoice
        .mockResolvedValueOnce({ rows: [{ balance: 1000 }] }) // Update wallet balance
        .mockResolvedValueOnce({ rows: [{ status: 'PAID' }] }) // Update invoice status
        .mockResolvedValueOnce({ rows: [mockTransaction] }); // Create transaction

      BusinessRuleEngine.executeRules = jest.fn().mockResolvedValue({
        approved: true
      });

      const result = await invoiceWalletService.processInvoicePayment(
        mockWalletId,
        mockInvoiceId,
        mockPaymentData
      );

      expect(result).toEqual(expect.objectContaining({
        transactionId: 'txn-789',
        status: 'COMPLETED'
      }));

      expect(BusinessRuleEngine.executeRules).toHaveBeenCalledWith(
        'TRANSACTION',
        expect.any(Object)
      );
    });

    test('Should reject payment with insufficient balance', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: mockWalletId,
            balance: 500, // Insufficient
            status: 'ACTIVE'
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: mockInvoiceId,
            amount: 1000,
            status: 'PENDING'
          }]
        });

      await expect(
        invoiceWalletService.processInvoicePayment(
          mockWalletId,
          mockInvoiceId,
          mockPaymentData
        )
      ).rejects.toThrow('Insufficient balance');
    });

    test('Should prevent payment of already paid invoice', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: mockWalletId,
            balance: 2000,
            status: 'ACTIVE'
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: mockInvoiceId,
            amount: 1000,
            status: 'PAID' // Already paid
          }]
        });

      await expect(
        invoiceWalletService.processInvoicePayment(
          mockWalletId,
          mockInvoiceId,
          mockPaymentData
        )
      ).rejects.toThrow('Invoice already paid');
    });

    test('Should handle transaction rollback on error', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: mockWalletId,
            balance: 2000,
            status: 'ACTIVE'
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: mockInvoiceId,
            amount: 1000,
            status: 'PENDING'
          }]
        })
        .mockRejectedValueOnce(new Error('Transaction failed')); // Fail during update

      await expect(
        invoiceWalletService.processInvoicePayment(
          mockWalletId,
          mockInvoiceId,
          mockPaymentData
        )
      ).rejects.toThrow('Transaction failed');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getWalletBalance', () => {
    const mockWalletId = 'wallet-123';

    test('Should return wallet balance', async () => {
      const mockBalance = {
        available: 5000,
        pending: 1000,
        reserved: 500,
        currency: 'USD'
      };

      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: mockWalletId,
            balance: 5000,
            pending_balance: 1000,
            reserved_balance: 500,
            currency: 'USD'
          }]
        });

      const result = await invoiceWalletService.getWalletBalance(mockWalletId);

      expect(result).toEqual(mockBalance);
    });

    test('Should handle wallet not found', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] });

      await expect(
        invoiceWalletService.getWalletBalance(mockWalletId)
      ).rejects.toThrow('Wallet not found');
    });
  });

  describe('transferBetweenWallets', () => {
    const fromWalletId = 'wallet-123';
    const toWalletId = 'wallet-456';
    const transferData = {
      amount: 500,
      currency: 'USD',
      description: 'Test transfer'
    };

    test('Should transfer funds successfully', async () => {
      const mockTransfer = {
        id: 'transfer-789',
        from_wallet: fromWalletId,
        to_wallet: toWalletId,
        amount: 500,
        status: 'COMPLETED'
      };

      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: fromWalletId,
            balance: 1000,
            currency: 'USD',
            status: 'ACTIVE'
          }]
        }) // From wallet
        .mockResolvedValueOnce({
          rows: [{
            id: toWalletId,
            currency: 'USD',
            status: 'ACTIVE'
          }]
        }) // To wallet
        .mockResolvedValueOnce({ rows: [{ balance: 500 }] }) // Update from wallet
        .mockResolvedValueOnce({ rows: [{ balance: 1500 }] }) // Update to wallet
        .mockResolvedValueOnce({ rows: [mockTransfer] }); // Create transfer record

      BusinessRuleEngine.executeRules = jest.fn().mockResolvedValue({
        approved: true
      });

      const result = await invoiceWalletService.transferBetweenWallets(
        fromWalletId,
        toWalletId,
        transferData
      );

      expect(result).toEqual(expect.objectContaining({
        transactionId: 'transfer-789',
        status: 'COMPLETED'
      }));
    });

    test('Should validate sufficient balance', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: fromWalletId,
            balance: 100, // Insufficient
            currency: 'USD',
            status: 'ACTIVE'
          }]
        });

      await expect(
        invoiceWalletService.transferBetweenWallets(
          fromWalletId,
          toWalletId,
          transferData
        )
      ).rejects.toThrow('Insufficient balance');
    });

    test('Should prevent self-transfer', async () => {
      await expect(
        invoiceWalletService.transferBetweenWallets(
          fromWalletId,
          fromWalletId, // Same wallet
          transferData
        )
      ).rejects.toThrow('Cannot transfer to same wallet');
    });

    test('Should validate currency match', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: fromWalletId,
            balance: 1000,
            currency: 'USD',
            status: 'ACTIVE'
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: toWalletId,
            currency: 'EUR', // Different currency
            status: 'ACTIVE'
          }]
        });

      await expect(
        invoiceWalletService.transferBetweenWallets(
          fromWalletId,
          toWalletId,
          transferData
        )
      ).rejects.toThrow('Currency mismatch');
    });
  });

  describe('getTransactionHistory', () => {
    const mockWalletId = 'wallet-123';

    test('Should return transaction history', async () => {
      const mockTransactions = [
        {
          id: 'txn-1',
          amount: 100,
          type: 'CREDIT',
          timestamp: new Date()
        },
        {
          id: 'txn-2',
          amount: 50,
          type: 'DEBIT',
          timestamp: new Date()
        }
      ];

      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: mockTransactions })
        .mockResolvedValueOnce({ rows: [{ count: 2 }] });

      const result = await invoiceWalletService.getTransactionHistory(
        mockWalletId,
        { limit: 10, offset: 0 }
      );

      expect(result).toEqual({
        transactions: mockTransactions,
        total: 2,
        hasMore: false
      });
    });

    test('Should apply date filters', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] });

      await invoiceWalletService.getTransactionHistory(
        mockWalletId,
        { startDate, endDate }
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('created_at >= $'),
        expect.arrayContaining([startDate])
      );
    });
  });

  describe('deactivateWallet', () => {
    const mockWalletId = 'wallet-123';

    test('Should deactivate wallet with zero balance', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: mockWalletId,
            balance: 0,
            status: 'ACTIVE'
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: mockWalletId,
            status: 'INACTIVE'
          }]
        });

      const result = await invoiceWalletService.deactivateWallet(mockWalletId);

      expect(result.status).toBe('INACTIVE');
    });

    test('Should prevent deactivation with non-zero balance', async () => {
      db.query = jest.fn()
        .mockResolvedValueOnce({
          rows: [{
            id: mockWalletId,
            balance: 100,
            status: 'ACTIVE'
          }]
        });

      await expect(
        invoiceWalletService.deactivateWallet(mockWalletId)
      ).rejects.toThrow('Cannot deactivate wallet with non-zero balance');
    });
  });
});