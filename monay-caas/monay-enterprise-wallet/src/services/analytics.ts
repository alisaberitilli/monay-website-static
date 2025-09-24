import { apiClient } from '@/lib/api';

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface MetricData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface TransactionMetrics {
  totalVolume: number;
  totalCount: number;
  averageSize: number;
  successRate: number;
  failureRate: number;
  pendingCount: number;
  volumeByHour: MetricData[];
  countByStatus: Record<string, number>;
  topMerchants: Array<{ name: string; volume: number; count: number }>;
  byPaymentMethod: Record<string, number>;
}

export interface WalletMetrics {
  totalWallets: number;
  activeWallets: number;
  dormantWallets: number;
  averageBalance: number;
  totalBalance: number;
  walletGrowth: MetricData[];
  balanceDistribution: Array<{ range: string; count: number }>;
  topWallets: Array<{ id: string; balance: number; transactions: number }>;
}

export interface ComplianceMetrics {
  kycCompleted: number;
  kycPending: number;
  kycFailed: number;
  amlAlerts: number;
  riskScore: number;
  alertsByType: Record<string, number>;
  complianceRate: number;
  alertsTrend: MetricData[];
}

export interface PerformanceMetrics {
  apiLatency: number;
  uptime: number;
  errorRate: number;
  throughput: number;
  responseTimeByEndpoint: Array<{ endpoint: string; avgTime: number; p99: number }>;
  errorsByType: Record<string, number>;
  systemHealth: number;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churnRate: number;
  retentionRate: number;
  userGrowth: MetricData[];
  usersByCountry: Record<string, number>;
  sessionDuration: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  recurringRevenue: number;
  transactionFees: number;
  averageRevenuePerUser: number;
  revenueGrowth: MetricData[];
  revenueByProduct: Record<string, number>;
  projectedRevenue: number;
}

class AnalyticsService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 60000; // 1 minute cache

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}-${JSON.stringify(params || {})}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getTransactionMetrics(timeRange: TimeRange): Promise<TransactionMetrics> {
    const cacheKey = this.getCacheKey('transaction-metrics', timeRange);
    const cached = this.getCachedData<TransactionMetrics>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/api/analytics/transactions', {
        params: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString()
        }
      });
      
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transaction metrics:', error);
      throw error;
    }
  }

  async getWalletMetrics(timeRange: TimeRange): Promise<WalletMetrics> {
    const cacheKey = this.getCacheKey('wallet-metrics', timeRange);
    const cached = this.getCachedData<WalletMetrics>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/api/analytics/wallets', {
        params: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString()
        }
      });
      
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wallet metrics:', error);
      throw error;
    }
  }

  async getComplianceMetrics(timeRange: TimeRange): Promise<ComplianceMetrics> {
    const cacheKey = this.getCacheKey('compliance-metrics', timeRange);
    const cached = this.getCachedData<ComplianceMetrics>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/api/analytics/compliance', {
        params: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString()
        }
      });
      
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance metrics:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const cacheKey = this.getCacheKey('performance-metrics');
    const cached = this.getCachedData<PerformanceMetrics>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/api/analytics/performance');
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      throw error;
    }
  }

  async getUserMetrics(timeRange: TimeRange): Promise<UserMetrics> {
    const cacheKey = this.getCacheKey('user-metrics', timeRange);
    const cached = this.getCachedData<UserMetrics>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/api/analytics/users', {
        params: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString()
        }
      });
      
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user metrics:', error);
      throw error;
    }
  }

  async getRevenueMetrics(timeRange: TimeRange): Promise<RevenueMetrics> {
    const cacheKey = this.getCacheKey('revenue-metrics', timeRange);
    const cached = this.getCachedData<RevenueMetrics>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/api/analytics/revenue', {
        params: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString()
        }
      });
      
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revenue metrics:', error);
      throw error;
    }
  }

  async exportAnalytics(type: string, timeRange: TimeRange, format: 'csv' | 'json' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.get(`/api/analytics/export/${type}`, {
        params: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString(),
          format
        },
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to export analytics:', error);
      throw error;
    }
  }

  async getCustomReport(reportId: string, params?: any): Promise<any> {
    try {
      const response = await apiClient.get(`/api/analytics/reports/${reportId}`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch custom report:', error);
      throw error;
    }
  }

  // Real-time metrics stream
  subscribeToMetrics(callback: (metrics: any) => void): () => void {
    // This would connect to WebSocket for real-time updates
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/stream`);
    
    eventSource.onmessage = (event) => {
      const metrics = JSON.parse(event.data);
      callback(metrics);
    };

    return () => {
      eventSource.close();
    };
  }

  // Utility methods
  getTimeRangePresets(): TimeRange[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        start: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 24 Hours'
      },
      {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 7 Days'
      },
      {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 30 Days'
      },
      {
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 90 Days'
      },
      {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
        label: 'Year to Date'
      }
    ];
  }

  formatMetricValue(value: number, type: 'currency' | 'number' | 'percentage' = 'number'): string {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  }

  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 1 : 0;
    return (current - previous) / previous;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const analyticsService = new AnalyticsService();

export default analyticsService;