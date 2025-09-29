// Simple browser-based storage for development
// In production, replace this with a real database (PostgreSQL, MongoDB, etc.)

interface Transaction {
  id: string;
  type: 'add_money' | 'send' | 'receive' | 'expense';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description?: string;
}

interface UserWallet {
  balance: number;
  transactions: Transaction[];
  lastUpdated: string;
}

const STORAGE_KEY = 'monay_wallet_data';

export class WalletStorage {
  // Get wallet data from localStorage
  static getWallet(): UserWallet {
    if (typeof window === 'undefined') {
      return { balance: 2547.83, transactions: [], lastUpdated: new Date().toISOString() };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing wallet data:', e);
      }
    }

    // Return default wallet if nothing stored
    return {
      balance: 2547.83, // Starting balance
      transactions: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Save wallet data to localStorage
  static saveWallet(wallet: UserWallet): void {
    if (typeof window === 'undefined') return;
    
    wallet.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  }

  // Add money to wallet
  static addMoney(amount: number, method: string, transactionId: string): UserWallet {
    const wallet = this.getWallet();
    
    // Add to balance
    wallet.balance += amount;
    
    // Add transaction record
    wallet.transactions.unshift({
      id: transactionId,
      type: 'add_money',
      amount: amount,
      method: method,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: `Added money via ${method}`
    });

    // Keep only last 100 transactions
    if (wallet.transactions.length > 100) {
      wallet.transactions = wallet.transactions.slice(0, 100);
    }

    this.saveWallet(wallet);
    return wallet;
  }

  // Send money (deduct from balance)
  static sendMoney(amount: number, recipient: string, transactionId: string): UserWallet {
    const wallet = this.getWallet();
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Deduct from balance
    wallet.balance -= amount;
    
    // Add transaction record
    wallet.transactions.unshift({
      id: transactionId,
      type: 'send',
      amount: -amount,
      method: 'transfer',
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: `Sent to ${recipient}`
    });

    this.saveWallet(wallet);
    return wallet;
  }

  // Get balance
  static getBalance(): number {
    return this.getWallet().balance;
  }

  // Get recent transactions
  static getTransactions(limit: number = 10): Transaction[] {
    const wallet = this.getWallet();
    return wallet.transactions.slice(0, limit);
  }

  // Clear all data (for testing)
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  // Reset to default (for testing)
  static reset(): void {
    this.saveWallet({
      balance: 2547.83,
      transactions: [
        {
          id: 'initial_1',
          type: 'add_money',
          amount: 2547.83,
          method: 'Initial Balance',
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: 'Initial wallet balance'
        }
      ],
      lastUpdated: new Date().toISOString()
    });
  }
}