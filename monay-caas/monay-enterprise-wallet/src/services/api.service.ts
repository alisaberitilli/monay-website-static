/**
 * API Service - Centralized API client for Enterprise Wallet
 * Handles all HTTP requests to the backend with proper error handling,
 * authentication, and fallback to mock data when needed
 */

import { toast } from '@/components/ui/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  fallbackToMock?: boolean;
}

class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  /**
   * Set authentication tokens
   */
  setTokens(token: string, refreshToken?: string) {
    this.token = token;
    this.refreshToken = refreshToken || null;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.token = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, fallbackToMock = true, ...fetchOptions } = options;

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Add authentication if needed
    if (!skipAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Build full URL
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && !skipAuth) {
        // Try to refresh token
        if (this.refreshToken) {
          await this.refreshAccessToken();
          // Retry request with new token
          headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers,
          });

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          return retryResponse.json();
        } else {
          // Redirect to login
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Authentication required');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);

      // Fallback to mock data if enabled
      if (USE_MOCK_DATA || fallbackToMock) {
        const mockData = await this.getMockData<T>(endpoint, fetchOptions.method);
        if (mockData) {
          console.warn(`Using mock data for ${endpoint}`);
          return mockData;
        }
      }

      throw error;
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Get mock data for development/fallback
   */
  private async getMockData<T>(endpoint: string, method?: string): Promise<T | null> {
    // Mock data based on endpoint patterns
    const mockResponses: Record<string, any> = {
      '/api/treasury/balance': {
        totalBalance: 1000000,
        availableBalance: 850000,
        pendingBalance: 150000,
        currency: 'USDC',
      },
      '/api/invoices': {
        invoices: [
          {
            id: 'INV-001',
            customerName: 'Acme Corp',
            amount: 15000,
            status: 'pending',
            dueDate: new Date().toISOString(),
          },
        ],
        total: 1,
      },
      '/api/payments/processing': {
        payments: [
          {
            id: 'PAY-001',
            invoiceId: 'INV-001',
            amount: 5000,
            status: 'processing',
            provider: 'circle',
          },
        ],
      },
      '/api/providers/performance': {
        providers: [
          {
            name: 'Circle',
            successRate: 99.5,
            avgSettlementTime: 45,
            volume: 500000,
          },
          {
            name: 'Tempo',
            successRate: 99.8,
            avgSettlementTime: 2,
            volume: 750000,
          },
        ],
      },
    };

    // Match endpoint pattern
    for (const [pattern, data] of Object.entries(mockResponses)) {
      if (endpoint.includes(pattern)) {
        return data as T;
      }
    }

    return null;
  }

  // Public API methods

  /**
   * Authentication
   */
  async login(email: string, password: string) {
    const response = await this.request<{
      token: string;
      refreshToken: string;
      user: any;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    this.setTokens(response.token, response.refreshToken);
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Treasury Operations
   */
  async getTreasuryBalance() {
    return this.request<{
      totalBalance: number;
      availableBalance: number;
      pendingBalance: number;
      currency: string;
    }>('/api/treasury/balance');
  }

  async initializeTreasury(data: any) {
    return this.request('/api/treasury/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Invoice Management
   */
  async getInvoices(params?: {
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`/api/invoices${queryParams ? `?${queryParams}` : ''}`);
  }

  async createInvoice(invoice: any) {
    return this.request('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  }

  async getInvoiceById(id: string) {
    return this.request(`/api/invoices/${id}`);
  }

  async updateInvoice(id: string, updates: any) {
    return this.request(`/api/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Payment Processing
   */
  async getPayments(params?: {
    status?: string;
    provider?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`/api/payments${queryParams ? `?${queryParams}` : ''}`);
  }

  async getPaymentStats() {
    return this.request('/api/payments/stats');
  }

  async retryPayment(paymentId: string) {
    return this.request(`/api/payments/${paymentId}/retry`, {
      method: 'POST',
    });
  }

  async cancelPayment(paymentId: string) {
    return this.request(`/api/payments/${paymentId}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * Provider Management
   */
  async getProviderPerformance() {
    return this.request('/api/providers/performance');
  }

  async getProviderMetrics() {
    return this.request('/api/providers/metrics');
  }

  async swapProvider(fromProvider: string, toProvider: string) {
    return this.request('/api/providers/swap', {
      method: 'POST',
      body: JSON.stringify({ fromProvider, toProvider }),
    });
  }

  /**
   * Customer Management
   */
  async getCustomers(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`/api/customers${queryParams ? `?${queryParams}` : ''}`);
  }

  async createCustomer(customer: any) {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async getCustomerById(id: string) {
    return this.request(`/api/customers/${id}`);
  }

  /**
   * Organization Management
   */
  async getOrganizations() {
    return this.request('/api/organizations');
  }

  async createOrganization(org: any) {
    return this.request('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(org),
    });
  }

  async switchOrganization(orgId: string) {
    return this.request('/api/organizations/switch', {
      method: 'POST',
      body: JSON.stringify({ organizationId: orgId }),
    });
  }

  /**
   * Spending Limits
   */
  async getSpendingLimits(entityType: string, entityId: string) {
    return this.request(`/api/spending-limits/${entityType}/${entityId}`);
  }

  async createSpendingLimit(limit: any) {
    return this.request('/api/spending-limits', {
      method: 'POST',
      body: JSON.stringify(limit),
    });
  }

  async updateSpendingLimit(id: string, updates: any) {
    return this.request(`/api/spending-limits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async checkSpendingLimit(
    entityType: string,
    entityId: string,
    limitType: string,
    amount: number
  ) {
    return this.request('/api/spending-limits/check', {
      method: 'POST',
      body: JSON.stringify({
        entityType,
        entityId,
        limitType,
        amount,
      }),
    });
  }

  /**
   * Transactions
   */
  async getTransactions(params?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`/api/transactions${queryParams ? `?${queryParams}` : ''}`);
  }

  async getTransactionById(id: string) {
    return this.request(`/api/transactions/${id}`);
  }

  /**
   * Analytics
   */
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`/api/analytics${queryParams ? `?${queryParams}` : ''}`);
  }

  /**
   * WebSocket Connection
   */
  connectWebSocket(onMessage: (data: any) => void): WebSocket | null {
    if (typeof window === 'undefined') return null;

    const wsUrl = API_BASE_URL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send authentication
      if (this.token) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: this.token,
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt reconnection after 5 seconds
      setTimeout(() => {
        this.connectWebSocket(onMessage);
      }, 5000);
    };

    return ws;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;