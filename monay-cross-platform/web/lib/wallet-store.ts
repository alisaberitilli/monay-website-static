// Server-side wallet store using cookies
// In production, replace with a real database

import { cookies } from 'next/headers';

interface Transaction {
  id: string;
  type: 'add_money' | 'send' | 'receive' | 'expense';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description?: string;
  userId: string;
}

interface WalletData {
  balance: number;
  lastTransactionId?: string;
  lastUpdated: string;
}

const WALLET_COOKIE = 'monay_wallet';
const TRANSACTIONS_COOKIE = 'monay_transactions';
const DEFAULT_BALANCE = 2547.83;

// In-memory store for transactions (resets on server restart)
// In production, this would be a database
const transactionStore = new Map<string, Transaction[]>();

export class WalletStore {
  // Get wallet balance from cookies
  static async getWalletBalance(): Promise<number> {
    const cookieStore = await cookies();
    const walletData = cookieStore.get(WALLET_COOKIE);
    
    if (walletData) {
      try {
        const parsed = JSON.parse(walletData.value) as WalletData;
        return parsed.balance;
      } catch (e) {
        console.error('Error parsing wallet cookie:', e);
      }
    }
    
    return DEFAULT_BALANCE;
  }

  // Save wallet balance to cookies
  static async setWalletBalance(balance: number, transactionId?: string): Promise<void> {
    const cookieStore = await cookies();
    const walletData: WalletData = {
      balance,
      lastTransactionId: transactionId,
      lastUpdated: new Date().toISOString()
    };
    
    cookieStore.set(WALLET_COOKIE, JSON.stringify(walletData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }

  // Add money to wallet
  static async addMoney(
    amount: number, 
    method: string, 
    userId: string,
    transactionId: string
  ): Promise<{ newBalance: number; transaction: Transaction }> {
    const currentBalance = await this.getWalletBalance();
    const newBalance = currentBalance + amount;
    
    // Save new balance
    await this.setWalletBalance(newBalance, transactionId);
    
    // Create transaction record
    const transaction: Transaction = {
      id: transactionId,
      type: 'add_money',
      amount: amount,
      method: method,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: `Added money via ${method}`,
      userId
    };
    
    // Store transaction in memory (or database in production)
    const userTransactions = transactionStore.get(userId) || [];
    userTransactions.unshift(transaction);
    transactionStore.set(userId, userTransactions.slice(0, 100)); // Keep last 100
    
    return { newBalance, transaction };
  }

  // Send money (deduct from balance)
  static async sendMoney(
    amount: number,
    recipient: string,
    userId: string,
    transactionId: string
  ): Promise<{ newBalance: number; transaction: Transaction }> {
    const currentBalance = await this.getWalletBalance();
    
    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }
    
    const newBalance = currentBalance - amount;
    await this.setWalletBalance(newBalance, transactionId);
    
    const transaction: Transaction = {
      id: transactionId,
      type: 'send',
      amount: -amount,
      method: 'transfer',
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: `Sent to ${recipient}`,
      userId
    };
    
    const userTransactions = transactionStore.get(userId) || [];
    userTransactions.unshift(transaction);
    transactionStore.set(userId, userTransactions.slice(0, 100));
    
    return { newBalance, transaction };
  }

  // Get user transactions
  static getTransactions(userId: string, limit: number = 10): Transaction[] {
    const transactions = transactionStore.get(userId) || [];
    return transactions.slice(0, limit);
  }

  // Reset wallet (for testing)
  static async resetWallet(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(WALLET_COOKIE);
    transactionStore.clear();
  }
}