import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from '@/components/ui/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PlatformMetrics {
  users: {
    total: number;
    active: number;
    new: number;
  };
  transactions: {
    total: number;
    dailyVolume: number;
    pending: number;
  };
  wallets: {
    total: number;
    active: number;
  };
  system: {
    api: string;
    database: string;
    redis: string;
    providers: {
      tempo: any;
      circle: any;
    };
    timestamp: Date;
  };
}

interface CircleMetrics {
  totalSupply: number;
  walletCount: number;
  dailyVolume: number;
  pendingOperations: number;
  failedTransactions: any[];
}

interface TempoStatus {
  status: any;
  metrics: any;
  capabilities: any;
  lastUpdate: Date;
}

interface ProviderComparison {
  tempo: {
    metrics: any;
    volume24h: number;
    activeWallets: number;
  };
  circle: {
    metrics: any;
    volume24h: number;
    activeWallets: number;
  };
  timestamp: Date;
}

class SuperAdminService {
  private getAuthHeaders() {
    const token = Cookies.get('accessToken') || localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async authenticatedRequest(endpoint: string, options: any = {}, showToast: boolean = true) {
    try {
      const response = await axios({
        url: `${API_URL}${endpoint}`,
        headers: this.getAuthHeaders(),
        ...options,
      });
      return response.data;
    } catch (error: any) {
      console.error('Super Admin API Error:', error);

      if (showToast) {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      throw error;
    }
  }

  // ===========================================
  // PLATFORM OVERVIEW
  // ===========================================

  async getPlatformOverview(): Promise<PlatformMetrics> {
    return await this.authenticatedRequest('/api/super-admin/platform/overview');
  }

  async getSystemHealth() {
    return await this.authenticatedRequest('/api/super-admin/platform/health');
  }

  // ===========================================
  // CIRCLE MANAGEMENT
  // ===========================================

  async getCircleWallets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) {
    return await this.authenticatedRequest('/api/super-admin/circle/wallets', {
      params,
    });
  }

  async getCircleMetrics(): Promise<CircleMetrics> {
    const response = await this.authenticatedRequest('/api/super-admin/circle/metrics');
    return response.data;
  }

  async freezeCircleWallet(walletId: string, reason: string) {
    const result = await this.authenticatedRequest('/api/super-admin/circle/freeze-wallet', {
      method: 'POST',
      data: { walletId, reason },
    });

    toast({
      title: 'Wallet Frozen',
      description: `Wallet ${walletId} has been frozen successfully.`,
    });

    return result;
  }

  async unfreezeCircleWallet(walletId: string) {
    const result = await this.authenticatedRequest('/api/super-admin/circle/unfreeze-wallet', {
      method: 'POST',
      data: { walletId },
    });

    toast({
      title: 'Wallet Unfrozen',
      description: `Wallet ${walletId} has been unfrozen successfully.`,
    });

    return result;
  }

  // ===========================================
  // TEMPO MANAGEMENT
  // ===========================================

  async getTempoStatus(): Promise<TempoStatus> {
    const response = await this.authenticatedRequest('/api/super-admin/tempo/status');
    return response.data;
  }

  async getTempoWallets(params?: {
    page?: number;
    limit?: number;
  }) {
    return await this.authenticatedRequest('/api/super-admin/tempo/wallets', {
      params,
    });
  }

  async getTempoTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    currency?: string;
  }) {
    return await this.authenticatedRequest('/api/super-admin/tempo/transactions', {
      params,
    });
  }

  // ===========================================
  // PROVIDER COMPARISON
  // ===========================================

  async getProviderComparison(): Promise<ProviderComparison> {
    const response = await this.authenticatedRequest('/api/super-admin/providers/comparison');
    return response.data;
  }

  async setPrimaryProvider(provider: 'tempo' | 'circle', reason: string) {
    const result = await this.authenticatedRequest('/api/super-admin/providers/set-primary', {
      method: 'POST',
      data: { provider, reason },
    });

    toast({
      title: 'Provider Switched',
      description: `${provider === 'tempo' ? 'Tempo' : 'Circle'} is now the primary provider.`,
    });

    return result;
  }

  // ===========================================
  // COMPLIANCE & KYC
  // ===========================================

  async getKYCQueue() {
    return await this.authenticatedRequest('/api/super-admin/compliance/kyc-queue');
  }

  async reviewKYC(kycId: string, status: 'approved' | 'rejected', notes: string) {
    const result = await this.authenticatedRequest('/api/super-admin/compliance/review-kyc', {
      method: 'POST',
      data: { kycId, status, notes },
    });

    toast({
      title: `KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `KYC submission has been ${status} successfully.`,
      variant: status === 'approved' ? 'default' : 'destructive',
    });

    return result;
  }

  async getComplianceReport(dateRange: { startDate: string; endDate: string }) {
    return await this.authenticatedRequest('/api/super-admin/compliance/report', {
      params: dateRange,
    });
  }

  // ===========================================
  // ANALYTICS
  // ===========================================

  async getAnalyticsDashboard(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    return await this.authenticatedRequest('/api/super-admin/analytics/dashboard', {
      params,
    });
  }

  async exportAnalytics(format: 'csv' | 'json' | 'pdf', dateRange: {
    startDate: string;
    endDate: string;
  }) {
    return await this.authenticatedRequest('/api/super-admin/analytics/export', {
      method: 'POST',
      data: { format, dateRange },
      responseType: format === 'pdf' ? 'blob' : 'json',
    });
  }

  // ===========================================
  // USER MANAGEMENT
  // ===========================================

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    return await this.authenticatedRequest('/api/super-admin/users', {
      params,
    });
  }

  async suspendUser(userId: string, reason: string, duration?: number) {
    return await this.authenticatedRequest('/api/super-admin/users/suspend', {
      method: 'POST',
      data: { userId, reason, duration },
    });
  }

  async activateUser(userId: string) {
    return await this.authenticatedRequest('/api/super-admin/users/activate', {
      method: 'POST',
      data: { userId },
    });
  }

  // ===========================================
  // TRANSACTION MONITORING
  // ===========================================

  async getTransactionMonitoring(params?: {
    page?: number;
    limit?: number;
    status?: string;
    provider?: string;
    dateRange?: { start: string; end: string };
  }) {
    return await this.authenticatedRequest('/api/super-admin/transactions/monitor', {
      params,
    });
  }

  async flagTransaction(transactionId: string, reason: string, severity: 'low' | 'medium' | 'high') {
    const result = await this.authenticatedRequest('/api/super-admin/transactions/flag', {
      method: 'POST',
      data: { transactionId, reason, severity },
    });

    toast({
      title: 'Transaction Flagged',
      description: `Transaction ${transactionId} has been flagged for review (${severity} priority).`,
      variant: severity === 'high' ? 'destructive' : 'default',
    });

    return result;
  }

  async reverseTransaction(transactionId: string, reason: string) {
    return await this.authenticatedRequest('/api/super-admin/transactions/reverse', {
      method: 'POST',
      data: { transactionId, reason },
    });
  }

  // ===========================================
  // REAL-TIME MONITORING
  // ===========================================

  subscribeToRealTimeUpdates() {
    const wsUrl = API_URL.replace(/^http/, 'ws');
    const token = Cookies.get('accessToken') || localStorage.getItem('token');

    const ws = new WebSocket(`${wsUrl}/super-admin?token=${token}`);

    ws.onopen = () => {
      console.log('Connected to Super Admin WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }

  // ===========================================
  // AUDIT LOGS
  // ===========================================

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    dateRange?: { start: string; end: string };
  }) {
    return await this.authenticatedRequest('/api/super-admin/audit-logs', {
      params,
    });
  }

  // ===========================================
  // SUBSCRIPTION FOR REAL-TIME UPDATES
  // ===========================================

  subscribeToUpdates(callback: (data: any) => void): () => void {
    // This would be replaced with actual WebSocket implementation
    const interval = setInterval(() => {
      // Mock real-time data
      const mockUpdate = {
        type: Math.random() > 0.5 ? 'alert' : 'metric',
        alert: {
          id: Math.random().toString(),
          type: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)] as any,
          category: 'system',
          title: 'System Update',
          message: 'New system event detected',
          timestamp: new Date(),
          acknowledged: false
        },
        metric: {
          transactions: Math.floor(Math.random() * 100),
          revenue: Math.floor(Math.random() * 10000)
        }
      };
      callback(mockUpdate);
    }, 30000); // Update every 30 seconds

    // Return cleanup function
    return () => clearInterval(interval);
  }

  // ===========================================
  // SYSTEM CONFIGURATION
  // ===========================================

  async getSystemConfig() {
    return await this.authenticatedRequest('/api/super-admin/system/config');
  }

  async updateSystemConfig(config: any) {
    return await this.authenticatedRequest('/api/super-admin/system/config', {
      method: 'PUT',
      data: config,
    });
  }

  async getFeatureFlags() {
    return await this.authenticatedRequest('/api/super-admin/system/feature-flags');
  }

  async updateFeatureFlag(flag: string, enabled: boolean) {
    return await this.authenticatedRequest('/api/super-admin/system/feature-flags', {
      method: 'PUT',
      data: { flag, enabled },
    });
  }
}

export const superAdminService = new SuperAdminService();