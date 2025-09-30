// IMPORTANT: Frontend should NEVER connect directly to the database
// All data should come from the backend API at http://localhost:3001
// This file now only provides mock data for development/testing

import {
  mockDataStore,
  User,
  Wallet,
  Transaction,
  Card
} from './mock-data';

// Database service that uses mock data only
// Real data should come from backend API calls
export class DatabaseService {
  // User operations
  static async getUser(id: string): Promise<User | null> {
    const user = mockDataStore.getUser(id);
    return user ?? null;
  }

  static async getUserByPhone(phone: string): Promise<User | null> {
    return mockDataStore.getUserByPhone(phone) || null;
  }

  static async getAllUsers(): Promise<User[]> {
    return mockDataStore.getAllUsers();
  }

  static async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return mockDataStore.createUser(user);
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = mockDataStore.updateUser(id, updates);
    return user ?? null;
  }

  static async deleteUser(id: string): Promise<boolean> {
    return mockDataStore.deleteUser(id);
  }

  static async getUserBalance(userId: string): Promise<number> {
    const user = mockDataStore.getUser(userId);
    return user?.balance || 0;
  }

  static async updateUserBalance(userId: string, amount: number): Promise<boolean> {
    const user = mockDataStore.getUser(userId);
    if (user) {
      mockDataStore.updateUser(userId, { balance: user.balance + amount });
      return true;
    }
    return false;
  }

  // Wallet operations
  static async getWallet(id: string): Promise<Wallet | null> {
    const wallet = mockDataStore.getWallet(id);
    return wallet ?? null;
  }

  static async getWalletByUserId(userId: string): Promise<Wallet | null> {
    return mockDataStore.getWalletByUserId(userId) || null;
  }

  static async createWallet(wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wallet> {
    return mockDataStore.createWallet(wallet);
  }

  static async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | null> {
    const wallet = mockDataStore.updateWallet(id, updates);
    return wallet ?? null;
  }

  // Transaction operations
  static async getTransaction(id: string): Promise<Transaction | null> {
    return mockDataStore.getTransaction(id) || null;
  }

  static async getTransactionsByUserId(userId: string, limit: number = 10): Promise<Transaction[]> {
    return mockDataStore.getTransactionsByUserId(userId, limit);
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    return mockDataStore.createTransaction(transaction);
  }

  // Card operations
  static async getCard(id: string): Promise<Card | null> {
    const card = mockDataStore.getCard(id);
    return card ?? null;
  }

  static async getCardsByUserId(userId: string): Promise<Card[]> {
    return mockDataStore.getCardsByUserId(userId);
  }

  static async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    return mockDataStore.createCard(card);
  }

  static async updateCard(id: string, updates: Partial<Card>): Promise<Card | null> {
    const card = mockDataStore.updateCard(id, updates);
    return card ?? null;
  }

  static async deleteCard(id: string): Promise<boolean> {
    return mockDataStore.deleteCard(id);
  }

  // P2P Transfer operations
  static async processP2PTransfer(fromUserId: string, toUserId: string, amount: number, description?: string): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    const fromUser = mockDataStore.getUser(fromUserId);
    const toUser = mockDataStore.getUser(toUserId);

    if (!fromUser || !toUser) {
      return { success: false, error: 'User not found' };
    }

    if (fromUser.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Update balances
    mockDataStore.updateUser(fromUserId, { balance: fromUser.balance - amount });
    mockDataStore.updateUser(toUserId, { balance: toUser.balance + amount });

    // Create transaction
    const fromWallet = mockDataStore.getWalletByUserId(fromUserId);
    if (!fromWallet) throw new Error('From user wallet not found');
    const transaction = mockDataStore.createTransaction({
      walletId: fromWallet.id,
      type: 'p2p_transfer',
      amount: -amount,
      currency: 'USD',
      status: 'completed',
      description: description || `Transfer to ${toUser.firstName} ${toUser.lastName}`,
      metadata: {
        recipientId: toUserId,
        recipientName: `${toUser.firstName} ${toUser.lastName}`
      }
    });

    // Create corresponding transaction for recipient
    const toWallet = mockDataStore.getWalletByUserId(toUserId);
    if (!toWallet) throw new Error('To user wallet not found');
    mockDataStore.createTransaction({
      walletId: toWallet.id,
      type: 'p2p_transfer',
      amount: amount,
      currency: 'USD',
      status: 'completed',
      description: description || `Transfer from ${fromUser.firstName} ${fromUser.lastName}`,
      metadata: {
        senderId: fromUserId,
        senderName: `${fromUser.firstName} ${fromUser.lastName}`
      }
    });

    return { success: true, transaction };
  }

  // Analytics operations
  static async getSpendingByCategory(walletId: string, days: number = 30): Promise<Record<string, number>> {
    const transactions = mockDataStore.getTransactions(walletId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const spending: Record<string, number> = {};

    transactions
      .filter(t => (t.type === 'payment' || t.type === 'withdrawal') &&
                   new Date(t.createdAt) > cutoffDate)
      .forEach(t => {
        const category = (t as any).category || 'other';
        spending[category] = (spending[category] || 0) + Math.abs(t.amount);
      });

    return spending;
  }

  static async getTransactionSummary(walletId: string): Promise<{
    totalTransactions: number;
    totalSpent: number;
    totalReceived: number;
  }> {
    const transactions = mockDataStore.getTransactions(walletId);

    return {
      totalTransactions: transactions.length,
      totalSpent: transactions
        .filter(t => t.type === 'payment' || t.type === 'withdrawal')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      totalReceived: transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0)
    };
  }

  // Initialize test data
  static async init(): Promise<void> {
    // Mock data is already initialized in mock-data.ts
    console.log('Database service initialized with mock data');
  }
}