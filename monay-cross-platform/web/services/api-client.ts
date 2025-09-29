/**
 * API Client Service for Consumer Wallet
 * Handles all API calls to backend with proper authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Wallet Balance Endpoints
  async getWalletBalance(walletId?: string) {
    const endpoint = walletId ? `/wallet/balance/${walletId}` : '/wallet/balance';
    return this.request(endpoint);
  }

  async getAllWalletBalances() {
    return this.request('/wallet/all-balances');
  }

  async getWalletLimits(walletId?: string) {
    const params = walletId ? `?walletId=${walletId}` : '';
    return this.request(`/wallet/limits${params}`);
  }

  async validateTransaction(amount: number, transactionType: string, walletId?: string) {
    return this.request('/wallet/validate-transaction', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        transactionType,
        walletId,
      }),
    });
  }

  // P2P Transfer Endpoints
  async searchUsers(query: string, type?: 'phone' | 'email' | 'username') {
    return this.request('/p2p-transfer/search', {
      method: 'POST',
      body: JSON.stringify({ query, type }),
    });
  }

  async validateRecipient(recipientIdentifier: string, recipientType?: string) {
    return this.request('/p2p-transfer/validate', {
      method: 'POST',
      body: JSON.stringify({
        recipientIdentifier,
        recipientType: recipientType || 'auto',
      }),
    });
  }

  async sendMoney(data: {
    recipientIdentifier: string;
    amount: number;
    note?: string;
    category?: string;
    transferMethod?: string;
    scheduledDate?: string;
  }) {
    return this.request('/p2p-transfer/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransferStatus(transferId: string) {
    return this.request(`/p2p-transfer/status/${transferId}`);
  }

  async getTransferHistory(filters?: {
    limit?: number;
    offset?: number;
    status?: string;
    type?: 'sent' | 'received' | 'all';
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/p2p-transfer/history${params ? `?${params}` : ''}`);
  }

  async getRecentContacts() {
    return this.request('/p2p-transfer/recent-contacts');
  }

  async getFrequentContacts() {
    return this.request('/p2p-transfer/frequent');
  }

  async cancelTransfer(transferId: string) {
    return this.request(`/p2p-transfer/cancel/${transferId}`, {
      method: 'POST',
    });
  }

  async retryTransfer(transferId: string) {
    return this.request(`/p2p-transfer/retry/${transferId}`, {
      method: 'POST',
    });
  }

  // Transaction Endpoints
  async getTransactions(limit = 50, offset = 0) {
    return this.request(`/transaction?limit=${limit}&offset=${offset}`);
  }

  async getTransactionDetails(transactionId: string) {
    return this.request(`/transaction/${transactionId}`);
  }

  // User Endpoints
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(data: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Authentication Endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  // Add Money Endpoints
  async addMoneyFromCard(amount: number, cardId: string) {
    return this.request('/add-money/card', {
      method: 'POST',
      body: JSON.stringify({ amount, cardId }),
    });
  }

  async addMoneyFromBank(amount: number, bankAccountId: string) {
    return this.request('/add-money/ach', {
      method: 'POST',
      body: JSON.stringify({ amount, bankAccountId }),
    });
  }

  // Card Management
  async getCards() {
    return this.request('/card');
  }

  async createVirtualCard(data: any) {
    return this.request('/card/virtual/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async freezeCard(cardId: string) {
    return this.request(`/card/${cardId}/freeze`, {
      method: 'PUT',
    });
  }

  async unfreezeCard(cardId: string) {
    return this.request(`/card/${cardId}/unfreeze`, {
      method: 'PUT',
    });
  }

  // Bank Account Management
  async getBankAccounts() {
    return this.request('/bank');
  }

  async linkBankAccount(data: any) {
    return this.request('/bank/link', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyBankAccount(bankAccountId: string, amounts: number[]) {
    return this.request(`/bank/${bankAccountId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ amounts }),
    });
  }

  // Notification Preferences
  async getNotificationPreferences() {
    return this.request('/notification/preferences');
  }

  async updateNotificationPreferences(preferences: any) {
    return this.request('/notification/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Analytics
  async getSpendingAnalytics(period?: string) {
    const params = period ? `?period=${period}` : '';
    return this.request(`/analytics/spending${params}`);
  }

  async getTransactionSummary() {
    return this.request('/analytics/summary');
  }
}

export default new ApiClient();