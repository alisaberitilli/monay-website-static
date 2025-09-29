// IMPORTANT: Frontend should NEVER connect directly to the database
// All data should come from the backend API at http://localhost:3001
// This file now only provides mock data for development/testing

import { 
  mockDataStore, 
  isMockMode, 
  User, 
  Wallet, 
  Transaction, 
  Card 
} from './mock-data';

// REMOVED: Direct database connection
// Frontend applications must use the backend API for all data operations
// Database connections should only exist in the backend service

// Force mock mode - frontend should never have direct DB access
const pool: null = null;

// Database service that abstracts mock vs real database
export class DatabaseService {
  // User operations
  static async getUser(id: string): Promise<User | null> {
    if (isMockMode()) {
      return mockDataStore.getUser(id) || null;
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async getUserByPhone(phone: string): Promise<User | null> {
    // ALWAYS use mock mode - frontend should never access DB directly
    // Real data should come from API calls to backend
    return mockDataStore.getUserByPhone(phone) || null;
        createdAt: result.rows[0].createdAt,
        updatedAt: result.rows[0].updatedAt
      } as User;
    }
    
    return null;
  }

  static async getAllUsers(): Promise<User[]> {
    if (isMockMode()) {
      return mockDataStore.getAllUsers();
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      `SELECT id, "firstName" || ' ' || "lastName" as name, 
              COALESCE(mobile, phone, mobile_number) as phone, 
              email, "isKycVerified" as "kycStatus",
              "createdAt", "updatedAt"
       FROM users 
       ORDER BY "createdAt" DESC`
    );
    
    return result.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      kycStatus: row.kycStatus ? 'verified' : 'pending',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (isMockMode()) {
      return mockDataStore.createUser(userData);
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      `INSERT INTO users (email, name, phone, kyc_status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userData.email, userData.name, userData.phone, userData.kycStatus]
    );
    return result.rows[0];
  }

  // Wallet operations
  static async getWalletByUserId(userId: string): Promise<Wallet | null> {
    if (isMockMode()) {
      return mockDataStore.getWalletByUserId(userId) || null;
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  static async updateWalletBalance(walletId: string, amount: number): Promise<Wallet | null> {
    if (isMockMode()) {
      return mockDataStore.updateWalletBalance(walletId, amount) || null;
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      `UPDATE wallets 
       SET balance = balance + $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [amount, walletId]
    );
    return result.rows[0] || null;
  }

  // Transaction operations
  static async getTransactions(walletId: string, limit: number = 50): Promise<Transaction[]> {
    if (isMockMode()) {
      return mockDataStore.getTransactions(walletId).slice(0, limit);
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE wallet_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [walletId, limit]
    );
    return result.rows;
  }

  static async createTransaction(
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    if (isMockMode()) {
      return mockDataStore.createTransaction(transactionData);
    }

    if (!pool) throw new Error('Database not configured');
    
    // Start a transaction for atomicity
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create transaction record
      const txnResult = await client.query(
        `INSERT INTO transactions (wallet_id, type, amount, currency, status, description, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          transactionData.walletId,
          transactionData.type,
          transactionData.amount,
          transactionData.currency,
          transactionData.status,
          transactionData.description,
          JSON.stringify(transactionData.metadata || {})
        ]
      );
      
      // Update wallet balance if completed
      if (transactionData.status === 'completed') {
        await client.query(
          `UPDATE wallets 
           SET balance = balance + $1, updated_at = NOW() 
           WHERE id = $2`,
          [transactionData.amount, transactionData.walletId]
        );
      }
      
      await client.query('COMMIT');
      return txnResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Card operations
  static async getCards(userId: string): Promise<Card[]> {
    if (isMockMode()) {
      return mockDataStore.getCards(userId);
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      'SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async createCard(cardData: Omit<Card, 'id' | 'createdAt'>): Promise<Card> {
    if (isMockMode()) {
      return mockDataStore.createCard(cardData);
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      `INSERT INTO cards (user_id, wallet_id, last4, brand, type, status, expiry_month, expiry_year) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        cardData.userId,
        cardData.walletId,
        cardData.last4,
        cardData.brand,
        cardData.type,
        cardData.status,
        cardData.expiryMonth,
        cardData.expiryYear
      ]
    );
    return result.rows[0];
  }

  // Analytics operations
  static async getSpendingByCategory(walletId: string, days: number = 30): Promise<Record<string, number>> {
    if (isMockMode()) {
      return mockDataStore.getSpendingByCategory(walletId, days);
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      `SELECT 
        COALESCE(metadata->>'category', 'other') as category,
        SUM(ABS(amount)) as total
       FROM transactions 
       WHERE wallet_id = $1 
         AND type = 'payment'
         AND status = 'completed'
         AND created_at >= NOW() - INTERVAL '%s days'
       GROUP BY category`,
      [walletId, days]
    );
    
    const spending: Record<string, number> = {};
    result.rows.forEach(row => {
      spending[row.category] = parseFloat(row.total);
    });
    return spending;
  }

  static async getTransactionSummary(walletId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
  }> {
    if (isMockMode()) {
      return mockDataStore.getTransactionSummary(walletId);
    }

    if (!pool) throw new Error('Database not configured');
    
    const result = await pool.query(
      `SELECT 
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expenses,
        COUNT(*) as transaction_count
       FROM transactions 
       WHERE wallet_id = $1 AND status = 'completed'`,
      [walletId]
    );
    
    return {
      totalIncome: parseFloat(result.rows[0].total_income || '0'),
      totalExpenses: parseFloat(result.rows[0].total_expenses || '0'),
      transactionCount: parseInt(result.rows[0].transaction_count || '0')
    };
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    if (isMockMode()) {
      return true;
    }

    if (!pool) return false;
    
    try {
      await pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

// Export convenience function for getting current mode
export function getDatabaseMode(): 'mock' | 'postgresql' {
  return isMockMode() ? 'mock' : 'postgresql';
}