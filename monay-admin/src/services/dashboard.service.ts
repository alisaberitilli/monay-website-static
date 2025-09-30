import axiosInstance from '@/lib/axios';

class DashboardService {
  async getStats() {
    try {
      const response = await axiosInstance.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return null;
    }
  }

  async getRecentTransactions() {
    try {
      const response = await axiosInstance.get('/api/transactions?limit=10');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error);
      return null;
    }
  }

  async getChartData(period: 'week' | 'month' | 'year' = 'month') {
    try {
      const response = await axiosInstance.get(`/api/dashboard/chart-data?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      return null;
    }
  }
}

export const dashboardService = new DashboardService();