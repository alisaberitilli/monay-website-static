// Use relative URL to go through Next.js proxy (avoids CORS issues)
const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: any }> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check if the backend is running.',
      };
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(data: any) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  // Wallet methods
  async getBalance() {
    return this.request('/wallet/balance');
  }

  async getTransactions(page = 1, limit = 20) {
    return this.request(`/transactions?page=${page}&limit=${limit}`);
  }

  // P2P Transfer methods
  async searchUsers(query: string, type?: string) {
    return this.request('/p2p-transfer/search', {
      method: 'POST',
      body: JSON.stringify({ query, type }),
    });
  }

  async getRecentContacts() {
    return this.request('/p2p-transfer/recent-contacts');
  }

  async initiateTransfer(data: any) {
    return this.request('/p2p-transfer/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransferLimits() {
    return this.request('/p2p-transfer/limits');
  }

  // Account management methods
  async getSecondaryAccounts() {
    return this.request('/accounts/secondary');
  }

  async getPrimaryAccount() {
    return this.request('/accounts/primary');
  }

  async linkSecondaryAccount(data: any) {
    return this.request('/accounts/secondary/link', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSecondaryLimits(userId: string, data: any) {
    return this.request(`/accounts/secondary/${userId}/limits`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async verifySecondaryAccount(userId: string, otp: string) {
    return this.request(`/accounts/secondary/${userId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  }

  async removeSecondaryAccount(userId: string) {
    return this.request(`/accounts/secondary/${userId}`, {
      method: 'DELETE',
    });
  }

  async getSecondaryTransactions(userId: string, params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/accounts/secondary/${userId}/transactions${queryString ? `?${queryString}` : ''}`);
  }

  // User profile methods
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(data: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Cards methods
  async getCards() {
    return this.request('/cards');
  }

  async createCard(data: any) {
    return this.request('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Dashboard methods
  async getDashboardData() {
    return this.request('/dashboard');
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient };