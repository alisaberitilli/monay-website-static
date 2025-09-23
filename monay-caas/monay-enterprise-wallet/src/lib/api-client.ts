import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for authentication
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken');
          // window.location.href = '/login';
          break;
        case 403:
          // Forbidden - show permission error
          console.error('Permission denied');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error occurred');
          break;
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - please check your connection');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Invoice Wallet endpoints
  invoiceWallet: {
    create: (data: any) => apiClient.post('/api/invoice-wallets', data),
    get: (id: string) => apiClient.get(`/api/invoice-wallets/${id}`),
    list: () => apiClient.get('/api/invoice-wallets'),
    update: (id: string, data: any) => apiClient.patch(`/api/invoice-wallets/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/invoice-wallets/${id}`),
    evaluateInvoice: (invoice: any) => apiClient.post('/api/invoice-wallets/evaluate', { invoice }),
  },

  // Business Rules endpoints
  businessRules: {
    create: (data: any) => apiClient.post('/api/business-rules', data),
    get: (id: string) => apiClient.get(`/api/business-rules/${id}`),
    list: (params?: any) => apiClient.get('/api/business-rules', { params }),
    update: (id: string, data: any) => apiClient.patch(`/api/business-rules/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/business-rules/${id}`),
    toggle: (id: string, isActive: boolean) =>
      apiClient.patch(`/api/business-rules/${id}/toggle`, { isActive }),
    evaluate: (invoice: any) => apiClient.post('/api/business-rules/evaluate', { invoice }),
  },

  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/api/auth/login', credentials),
    logout: () => apiClient.post('/api/auth/logout'),
    register: (data: any) => apiClient.post('/api/auth/register', data),
    refresh: () => apiClient.post('/api/auth/refresh'),
    me: () => apiClient.get('/api/auth/me'),
  },

  // User endpoints
  user: {
    get: (id: string) => apiClient.get(`/api/user/${id}`),
    list: (params?: any) => apiClient.get('/api/user', { params }),
    update: (id: string, data: any) => apiClient.patch(`/api/user/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/user/${id}`),
  },

  // Wallet endpoints
  wallet: {
    create: (data: any) => apiClient.post('/api/wallet', data),
    get: (id: string) => apiClient.get(`/api/wallet/${id}`),
    list: () => apiClient.get('/api/wallet'),
    balance: (id: string) => apiClient.get(`/api/wallet/${id}/balance`),
  },

  // Transaction endpoints
  transaction: {
    create: (data: any) => apiClient.post('/api/transaction', data),
    get: (id: string) => apiClient.get(`/api/transaction/${id}`),
    list: (params?: any) => apiClient.get('/api/transaction', { params }),
  },

  // Blockchain endpoints
  blockchain: {
    deployContract: (data: any) => apiClient.post('/api/blockchain/deploy', data),
    getContract: (address: string) => apiClient.get(`/api/blockchain/contract/${address}`),
    executeTransaction: (data: any) => apiClient.post('/api/blockchain/transaction', data),
  },

  // EVM endpoints
  evm: {
    deployToken: (data: any) => apiClient.post('/api/evm/token/deploy', data),
    getToken: (address: string) => apiClient.get(`/api/evm/token/${address}`),
    mint: (data: any) => apiClient.post('/api/evm/token/mint', data),
    burn: (data: any) => apiClient.post('/api/evm/token/burn', data),
  },

  // Solana endpoints
  solana: {
    createWallet: () => apiClient.post('/api/solana/wallet'),
    getBalance: (address: string) => apiClient.get(`/api/solana/balance/${address}`),
    transfer: (data: any) => apiClient.post('/api/solana/transfer', data),
  },
};

// Helper function for error handling
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response?.data) {
      return axiosError.response.data.message || axiosError.response.data.error || 'An error occurred';
    }
    if (axiosError.request) {
      return 'Network error - please check your connection';
    }
  }
  return error.message || 'An unexpected error occurred';
};

export default apiClient;