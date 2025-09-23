// API Service Layer for connecting to backend services
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function for API calls with authentication
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Government Benefits Services
export const governmentBenefitsAPI = {
  // Eligibility Verification
  verifyEligibility: async (applicantData: any, programType: string) => {
    return fetchAPI('/government/eligibility/verify', {
      method: 'POST',
      body: JSON.stringify({ applicantData, programType }),
    });
  },

  batchVerification: async (applicants: any[]) => {
    return fetchAPI('/government/eligibility/batch-verify', {
      method: 'POST',
      body: JSON.stringify({ applicants }),
    });
  },

  // Balance Management
  getBalances: async (userId: string) => {
    return fetchAPI(`/government/balance/${userId}`);
  },

  updateBalance: async (userId: string, programType: string, amount: number, operation: string) => {
    return fetchAPI('/government/balance/update', {
      method: 'POST',
      body: JSON.stringify({ userId, programType, amount, operation }),
    });
  },

  // Transaction Processing
  processTransaction: async (transactionData: any) => {
    return fetchAPI('/government/transaction/process', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  getTransactionHistory: async (userId: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/government/transaction/history/${userId}${queryString}`);
  },

  // Dashboard Data
  getDashboard: async (userId: string, period?: string) => {
    const queryString = period ? `?period=${period}` : '';
    return fetchAPI(`/government/reports/dashboard/${userId}${queryString}`);
  },

  getAnalytics: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/government/reports/analytics${queryString}`);
  },
};

// AI/ML Services
export const aiMlAPI = {
  // Predictive Analytics
  predictCustomerLTV: async (userId: string, horizon = '365_days') => {
    return fetchAPI('/ai-ml/predict/customer-ltv', {
      method: 'POST',
      body: JSON.stringify({ userId, horizon }),
    });
  },

  predictChurnRisk: async (userId: string) => {
    return fetchAPI('/ai-ml/predict/churn-risk', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  predictCreditScore: async (userId: string) => {
    return fetchAPI('/ai-ml/predict/credit-score', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Fraud Detection
  analyzeTransaction: async (transaction: any) => {
    return fetchAPI('/ai-ml/fraud/analyze-transaction', {
      method: 'POST',
      body: JSON.stringify({ transaction }),
    });
  },

  getUserRiskProfile: async (userId: string) => {
    return fetchAPI(`/ai-ml/fraud/risk-profile/${userId}`);
  },

  // Smart Features
  routeTransaction: async (transactionData: any) => {
    return fetchAPI('/ai-ml/ai/route-transaction', {
      method: 'POST',
      body: JSON.stringify({ transactionData }),
    });
  },

  getDashboardMetrics: async () => {
    return fetchAPI('/ai-ml/analytics/dashboard');
  },

  getModelPerformance: async () => {
    return fetchAPI('/ai-ml/models/performance');
  },

  getRecommendations: async (userId: string, type = 'all') => {
    return fetchAPI(`/ai-ml/recommendations/${userId}?type=${type}`);
  },
};

// ERP Connectors Services
export const erpAPI = {
  // Connection Management
  getAuthUrl: async (system: string, accountId: string) => {
    return fetchAPI(`/erp/${system}/connect`, {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  },

  handleCallback: async (system: string, code: string, accountId: string) => {
    return fetchAPI(`/erp/${system}/callback`, {
      method: 'POST',
      body: JSON.stringify({ code, accountId }),
    });
  },

  getConnectionStatus: async (accountId: string) => {
    return fetchAPI(`/erp/status/${accountId}`);
  },

  // QuickBooks
  quickbooks: {
    syncCustomers: async (accountId: string, fromDate?: string) => {
      return fetchAPI('/erp/quickbooks/sync/customers', {
        method: 'POST',
        body: JSON.stringify({ accountId, fromDate }),
      });
    },
    syncInvoices: async (accountId: string, fromDate?: string) => {
      return fetchAPI('/erp/quickbooks/sync/invoices', {
        method: 'POST',
        body: JSON.stringify({ accountId, fromDate }),
      });
    },
    createInvoice: async (accountId: string, invoiceData: any) => {
      return fetchAPI('/erp/quickbooks/create/invoice', {
        method: 'POST',
        body: JSON.stringify({ accountId, invoiceData }),
      });
    },
  },

  // FreshBooks
  freshbooks: {
    syncClients: async (accountId: string) => {
      return fetchAPI('/erp/freshbooks/sync/clients', {
        method: 'POST',
        body: JSON.stringify({ accountId }),
      });
    },
    syncExpenses: async (accountId: string, fromDate?: string) => {
      return fetchAPI('/erp/freshbooks/sync/expenses', {
        method: 'POST',
        body: JSON.stringify({ accountId, fromDate }),
      });
    },
    syncTimeTracking: async (accountId: string, projectId?: string) => {
      return fetchAPI('/erp/freshbooks/time-tracking', {
        method: 'POST',
        body: JSON.stringify({ accountId, projectId }),
      });
    },
  },

  // Wave
  wave: {
    syncCustomers: async (accountId: string) => {
      return fetchAPI('/erp/wave/sync/customers', {
        method: 'POST',
        body: JSON.stringify({ accountId }),
      });
    },
    generateReport: async (accountId: string, reportType: string, parameters?: any) => {
      return fetchAPI('/erp/wave/financial/report', {
        method: 'POST',
        body: JSON.stringify({ accountId, reportType, parameters }),
      });
    },
  },

  // Zoho
  zoho: {
    syncAll: async (accountId: string) => {
      return fetchAPI('/erp/zoho/sync/all', {
        method: 'POST',
        body: JSON.stringify({ accountId }),
      });
    },
    createSmartInvoice: async (accountId: string, invoiceData: any) => {
      return fetchAPI('/erp/zoho/invoice/smart', {
        method: 'POST',
        body: JSON.stringify({ accountId, invoiceData }),
      });
    },
    configureTaxEngine: async (accountId: string, taxConfig: any) => {
      return fetchAPI('/erp/zoho/tax/configure', {
        method: 'POST',
        body: JSON.stringify({ accountId, taxConfig }),
      });
    },
  },

  // Sage
  sage: {
    syncChartOfAccounts: async (accountId: string) => {
      return fetchAPI('/erp/sage/chart-of-accounts', {
        method: 'POST',
        body: JSON.stringify({ accountId }),
      });
    },
    createJournalEntry: async (accountId: string, entryData: any) => {
      return fetchAPI('/erp/sage/journal/create', {
        method: 'POST',
        body: JSON.stringify({ accountId, entryData }),
      });
    },
    bankReconciliation: async (accountId: string, reconciliationData: any) => {
      return fetchAPI('/erp/sage/bank/reconcile', {
        method: 'POST',
        body: JSON.stringify({ accountId, reconciliationData }),
      });
    },
  },

  // Generic
  generateReport: async (system: string, accountId: string, reportType: string, parameters?: any) => {
    return fetchAPI(`/erp/${system}/report/generate`, {
      method: 'POST',
      body: JSON.stringify({ accountId, reportType, parameters }),
    });
  },

  batchSync: async (syncRequests: any[]) => {
    return fetchAPI('/erp/batch/sync', {
      method: 'POST',
      body: JSON.stringify({ syncRequests }),
    });
  },
};

// Testing & Security Services
export const testingAPI = {
  runTests: async (testType: string, params?: any) => {
    return fetchAPI('/testing/run', {
      method: 'POST',
      body: JSON.stringify({ testType, params }),
    });
  },

  getTestResults: async (testId: string) => {
    return fetchAPI(`/testing/results/${testId}`);
  },

  performSecurityAudit: async () => {
    return fetchAPI('/security/audit', {
      method: 'POST',
    });
  },

  getPerformanceMetrics: async () => {
    return fetchAPI('/performance/metrics');
  },
};

// WebSocket Connection for Real-time Updates
export const createWebSocketConnection = (userId: string) => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  const ws = new WebSocket(`${wsUrl}/ws?userId=${userId}`);

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
};

// Export all services
export const apiServices = {
  government: governmentBenefitsAPI,
  ai: aiMlAPI,
  erp: erpAPI,
  testing: testingAPI,
  ws: createWebSocketConnection,
};