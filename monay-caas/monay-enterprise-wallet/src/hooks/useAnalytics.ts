import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  analyticsService,
  TimeRange,
  TransactionMetrics,
  WalletMetrics,
  ComplianceMetrics,
  PerformanceMetrics,
  UserMetrics,
  RevenueMetrics
} from '@/services/analytics';

interface UseAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialTimeRange?: TimeRange;
}

interface AnalyticsState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// Generic hook for analytics data
function useAnalyticsData<T>(
  fetcher: (timeRange: TimeRange) => Promise<T>,
  timeRange: TimeRange,
  options: UseAnalyticsOptions = {}
): AnalyticsState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher(timeRange);
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetcher, timeRange]);

  useEffect(() => {
    fetchData();

    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.autoRefresh, options.refreshInterval]);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
}

// Transaction Analytics Hook
export function useTransactionAnalytics(
  timeRange: TimeRange,
  options?: UseAnalyticsOptions
): AnalyticsState<TransactionMetrics> {
  return useAnalyticsData(
    (range) => analyticsService.getTransactionMetrics(range),
    timeRange,
    options
  );
}

// Wallet Analytics Hook
export function useWalletAnalytics(
  timeRange: TimeRange,
  options?: UseAnalyticsOptions
): AnalyticsState<WalletMetrics> {
  return useAnalyticsData(
    (range) => analyticsService.getWalletMetrics(range),
    timeRange,
    options
  );
}

// Compliance Analytics Hook
export function useComplianceAnalytics(
  timeRange: TimeRange,
  options?: UseAnalyticsOptions
): AnalyticsState<ComplianceMetrics> {
  return useAnalyticsData(
    (range) => analyticsService.getComplianceMetrics(range),
    timeRange,
    options
  );
}

// Performance Analytics Hook
export function usePerformanceAnalytics(
  options?: UseAnalyticsOptions
): AnalyticsState<PerformanceMetrics> {
  const [data, setData] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyticsService.getPerformanceMetrics();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (options?.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options?.autoRefresh, options?.refreshInterval]);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
}

// User Analytics Hook
export function useUserAnalytics(
  timeRange: TimeRange,
  options?: UseAnalyticsOptions
): AnalyticsState<UserMetrics> {
  return useAnalyticsData(
    (range) => analyticsService.getUserMetrics(range),
    timeRange,
    options
  );
}

// Revenue Analytics Hook
export function useRevenueAnalytics(
  timeRange: TimeRange,
  options?: UseAnalyticsOptions
): AnalyticsState<RevenueMetrics> {
  return useAnalyticsData(
    (range) => analyticsService.getRevenueMetrics(range),
    timeRange,
    options
  );
}

// Combined Analytics Hook
export function useDashboardAnalytics(timeRange: TimeRange, options?: UseAnalyticsOptions) {
  const transactions = useTransactionAnalytics(timeRange, options);
  const wallets = useWalletAnalytics(timeRange, options);
  const compliance = useComplianceAnalytics(timeRange, options);
  const performance = usePerformanceAnalytics(options);
  const users = useUserAnalytics(timeRange, options);
  const revenue = useRevenueAnalytics(timeRange, options);

  const loading = 
    transactions.loading ||
    wallets.loading ||
    compliance.loading ||
    performance.loading ||
    users.loading ||
    revenue.loading;

  const error = 
    transactions.error ||
    wallets.error ||
    compliance.error ||
    performance.error ||
    users.error ||
    revenue.error;

  const refresh = useCallback(async () => {
    await Promise.all([
      transactions.refresh(),
      wallets.refresh(),
      compliance.refresh(),
      performance.refresh(),
      users.refresh(),
      revenue.refresh()
    ]);
  }, [transactions, wallets, compliance, performance, users, revenue]);

  return {
    transactions: transactions.data,
    wallets: wallets.data,
    compliance: compliance.data,
    performance: performance.data,
    users: users.data,
    revenue: revenue.data,
    loading,
    error,
    refresh
  };
}

// Time Range Hook
export function useTimeRange(initialPreset: string = 'Last 7 Days') {
  const presets = useMemo(() => analyticsService.getTimeRangePresets(), []);
  
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [customRange, setCustomRange] = useState<TimeRange | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  const currentRange = useMemo(() => {
    if (isCustom && customRange) {
      return customRange;
    }
    return presets.find(p => p.label === selectedPreset) || presets[1];
  }, [selectedPreset, customRange, isCustom, presets]);

  const selectPreset = useCallback((label: string) => {
    setSelectedPreset(label);
    setIsCustom(false);
    setCustomRange(null);
  }, []);

  const setCustom = useCallback((start: Date, end: Date) => {
    setCustomRange({ start, end, label: 'Custom' });
    setIsCustom(true);
  }, []);

  return {
    currentRange,
    presets,
    selectedPreset,
    isCustom,
    selectPreset,
    setCustom
  };
}

// Export Analytics Hook
export function useAnalyticsExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportData = useCallback(async (
    type: string,
    timeRange: TimeRange,
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ) => {
    try {
      setExporting(true);
      setError(null);
      
      const blob = await analyticsService.exportAnalytics(type, timeRange, format);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-analytics-${new Date().toISOString()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      setError(err as Error);
      console.error('Export error:', err);
      return false;
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportData,
    exporting,
    error
  };
}

// Real-time Metrics Hook
export function useRealTimeMetrics(onUpdate: (metrics: any) => void) {
  useEffect(() => {
    const unsubscribe = analyticsService.subscribeToMetrics(onUpdate);
    return unsubscribe;
  }, [onUpdate]);
}

// Comparison Analytics Hook
export function useComparisonAnalytics(
  currentRange: TimeRange,
  previousRange: TimeRange,
  metricType: 'transactions' | 'wallets' | 'revenue'
) {
  const [comparison, setComparison] = useState<{
    current: any;
    previous: any;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetcher: (range: TimeRange) => Promise<any>;
        switch (metricType) {
          case 'transactions':
            fetcher = analyticsService.getTransactionMetrics;
            break;
          case 'wallets':
            fetcher = analyticsService.getWalletMetrics;
            break;
          case 'revenue':
            fetcher = analyticsService.getRevenueMetrics;
            break;
        }

        const [current, previous] = await Promise.all([
          fetcher.call(analyticsService, currentRange),
          fetcher.call(analyticsService, previousRange)
        ]);

        const mainMetric = metricType === 'transactions' ? 'totalVolume' :
                          metricType === 'wallets' ? 'totalBalance' :
                          'totalRevenue';

        const growth = analyticsService.calculateGrowth(
          current[mainMetric],
          previous[mainMetric]
        );

        setComparison({
          current,
          previous,
          growth,
          trend: growth > 0.05 ? 'up' : growth < -0.05 ? 'down' : 'stable'
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [currentRange, previousRange, metricType]);

  return { comparison, loading, error };
}