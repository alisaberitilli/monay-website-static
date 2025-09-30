// Centralized mock data store for consistency across all Monay projects
export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone?: string;
  balance: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'p2p_transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  userId: string;
  walletId: string;
  last4: string;
  brand: string;
  type: 'virtual' | 'physical';
  status: 'active' | 'frozen' | 'cancelled';
  expiryMonth: number;
  expiryYear: number;
  createdAt: Date;
}

// Mock data store - this will be the single source of truth
class MockDataStore {
  private users: Map<string, User> = new Map();
  private wallets: Map<string, Wallet> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private cards: Map<string, Card> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create default user - John Doe with mobile number
    const defaultUser: User = {
      id: 'user123',
      email: 'john.doe@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+13016821633',  // John Doe's actual mobile number
      balance: 12450.75,  // Match wallet balance
      kycStatus: 'verified',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };
    this.users.set(defaultUser.id, defaultUser);
    // Also index by phone for mobile login
    this.users.set('+13016821633', defaultUser);

    // Create default wallet - matching balance from other Monay projects
    const defaultWallet: Wallet = {
      id: 'wallet123',
      userId: 'user123',
      balance: 12450.75,  // Updated to match frontend balance
      currency: 'USD',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };
    this.wallets.set(defaultWallet.id, defaultWallet);

    // Create sample transactions
    const sampleTransactions: Transaction[] = [
      {
        id: 'txn1',
        walletId: 'wallet123',
        type: 'deposit',
        amount: 500,
        currency: 'USD',
        status: 'completed',
        description: 'Direct deposit',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 'txn2',
        walletId: 'wallet123',
        type: 'payment',
        amount: -45.99,
        currency: 'USD',
        status: 'completed',
        description: 'Grocery Store',
        metadata: { merchant: 'Whole Foods', category: 'groceries' },
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date('2024-12-02')
      },
      {
        id: 'txn3',
        walletId: 'wallet123',
        type: 'transfer',
        amount: -100,
        currency: 'USD',
        status: 'completed',
        description: 'Transfer to Jane',
        createdAt: new Date('2024-12-03'),
        updatedAt: new Date('2024-12-03')
      },
      {
        id: 'txn4',
        walletId: 'wallet123',
        type: 'deposit',
        amount: 1000,
        currency: 'USD',
        status: 'completed',
        description: 'Bank transfer',
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05')
      },
      {
        id: 'txn5',
        walletId: 'wallet123',
        type: 'payment',
        amount: -125.50,
        currency: 'USD',
        status: 'completed',
        description: 'Restaurant',
        metadata: { merchant: 'The French Laundry', category: 'dining' },
        createdAt: new Date('2024-12-07'),
        updatedAt: new Date('2024-12-07')
      }
    ];

    sampleTransactions.forEach(txn => {
      this.transactions.set(txn.id, txn);
    });

    // Create sample cards
    const sampleCards: Card[] = [
      {
        id: 'card1',
        userId: 'user123',
        walletId: 'wallet123',
        last4: '8912',
        brand: 'Visa',
        type: 'physical',
        status: 'active',
        expiryMonth: 12,
        expiryYear: 2026,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'card2',
        userId: 'user123',
        walletId: 'wallet123',
        last4: '3456',
        brand: 'Mastercard',
        type: 'virtual',
        status: 'active',
        expiryMonth: 6,
        expiryYear: 2025,
        createdAt: new Date('2024-02-01')
      }
    ];

    sampleCards.forEach(card => {
      this.cards.set(card.id, card);
    });
  }

  // User methods
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByPhone(phone: string): User | undefined {
    // Try with and without country code
    const phoneWithPlus = phone.startsWith('+') ? phone : `+${phone}`;
    const phoneWithoutPlus = phone.startsWith('+') ? phone.slice(1) : phone;
    
    // Search through all users for matching phone
    for (const user of this.users.values()) {
      if (user.phone === phoneWithPlus || user.phone === phoneWithoutPlus || user.phone === phone) {
        return user;
      }
    }
    return undefined;
  }

  getAllUsers(): User[] {
    // Filter out duplicate entries (phone number keys)
    const uniqueUsers = new Map<string, User>();
    for (const user of this.users.values()) {
      if (user.id) {
        uniqueUsers.set(user.id, user);
      }
    }
    return Array.from(uniqueUsers.values());
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: `user${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  // Wallet methods
  getWallet(id: string): Wallet | undefined {
    return this.wallets.get(id);
  }

  getWalletByUserId(userId: string): Wallet | undefined {
    return Array.from(this.wallets.values()).find(w => w.userId === userId);
  }

  updateWalletBalance(walletId: string, amount: number): Wallet | undefined {
    const wallet = this.wallets.get(walletId);
    if (wallet) {
      wallet.balance += amount;
      wallet.updatedAt = new Date();
      this.wallets.set(walletId, wallet);
    }
    return wallet;
  }

  // Transaction methods
  getTransactions(walletId: string): Transaction[] {
    return Array.from(this.transactions.values())
      .filter(t => t.walletId === walletId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.set(newTransaction.id, newTransaction);
    
    // Update wallet balance if transaction is completed
    if (transaction.status === 'completed') {
      this.updateWalletBalance(transaction.walletId, transaction.amount);
    }
    
    return newTransaction;
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getTransactionsByUserId(userId: string, limit: number = 10): Transaction[] {
    const userWallet = this.getWalletByUserId(userId);
    if (!userWallet) return [];

    return this.getTransactions(userWallet.id).slice(0, limit);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  createWallet(wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>): Wallet {
    const newWallet: Wallet = {
      ...wallet,
      id: `wallet${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.wallets.set(newWallet.id, newWallet);
    return newWallet;
  }

  updateWallet(id: string, updates: Partial<Wallet>): Wallet | undefined {
    const wallet = this.wallets.get(id);
    if (wallet) {
      const updatedWallet = { ...wallet, ...updates, updatedAt: new Date() };
      this.wallets.set(id, updatedWallet);
      return updatedWallet;
    }
    return undefined;
  }

  // Card methods
  getCards(userId: string): Card[] {
    return Array.from(this.cards.values()).filter(c => c.userId === userId);
  }

  createCard(card: Omit<Card, 'id' | 'createdAt'>): Card {
    const newCard: Card = {
      ...card,
      id: `card${Date.now()}`,
      createdAt: new Date()
    };
    this.cards.set(newCard.id, newCard);
    return newCard;
  }

  getCard(id: string): Card | undefined {
    return this.cards.get(id);
  }

  getCardsByUserId(userId: string): Card[] {
    return Array.from(this.cards.values()).filter(c => c.userId === userId);
  }

  updateCard(id: string, updates: Partial<Card>): Card | undefined {
    const card = this.cards.get(id);
    if (card) {
      const updatedCard = { ...card, ...updates };
      this.cards.set(id, updatedCard);
      return updatedCard;
    }
    return undefined;
  }

  deleteCard(id: string): boolean {
    return this.cards.delete(id);
  }

  // Analytics methods
  getSpendingByCategory(walletId: string, days: number = 30): Record<string, number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const spending: Record<string, number> = {};
    
    this.getTransactions(walletId)
      .filter(t => t.type === 'payment' && t.createdAt >= cutoffDate)
      .forEach(t => {
        const category = t.metadata?.category || 'other';
        spending[category] = (spending[category] || 0) + Math.abs(t.amount);
      });
    
    return spending;
  }

  getTransactionSummary(walletId: string): {
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
  } {
    const transactions = this.getTransactions(walletId);
    
    const totalIncome = transactions
      .filter(t => t.amount > 0 && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.amount < 0 && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      totalIncome,
      totalExpenses,
      transactionCount: transactions.length
    };
  }

  // Reset method for testing
  reset() {
    this.users.clear();
    this.wallets.clear();
    this.transactions.clear();
    this.cards.clear();
    this.initializeMockData();
  }
}

// Export singleton instance
export const mockDataStore = new MockDataStore();

// Export helper function to get current user's wallet
export function getCurrentUserWallet(): Wallet | undefined {
  // For now, return the default user's wallet
  return mockDataStore.getWalletByUserId('user123');
}

// Export helper to check if we're in mock mode
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
}