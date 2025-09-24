'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Wallet,
  Shield,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  CreditCard,
  Zap
} from 'lucide-react';
import {
  useDashboardAnalytics,
  useTimeRange,
  useAnalyticsExport,
  useComparisonAnalytics
} from '@/hooks/useAnalytics';
import { analyticsService } from '@/services/analytics';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'text-primary',
  loading
}) => {
  const isPositive = change && change > 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${changeColor}`}>
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(change).toFixed(1)}%</span>
                <span className="text-gray-500">vs last period</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const { currentRange, presets, selectedPreset, selectPreset } = useTimeRange();
  const {
    transactions,
    wallets,
    compliance,
    performance,
    users,
    revenue,
    loading,
    error,
    refresh
  } = useDashboardAnalytics(currentRange, {
    autoRefresh: true,
    refreshInterval: 60000 // Refresh every minute
  });

  const { exportData, exporting } = useAnalyticsExport();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'compliance' | 'performance'>('overview');

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (!transactions || !wallets || !revenue || !users) return null;

    return {
      totalVolume: analyticsService.formatMetricValue(transactions.totalVolume, 'currency'),
      activeWallets: analyticsService.formatMetricValue(wallets.activeWallets, 'number'),
      totalRevenue: analyticsService.formatMetricValue(revenue.totalRevenue, 'currency'),
      activeUsers: analyticsService.formatMetricValue(users.activeUsers, 'number'),
      successRate: analyticsService.formatMetricValue(transactions.successRate, 'percentage'),
      complianceRate: compliance ? analyticsService.formatMetricValue(compliance.complianceRate, 'percentage') : 'N/A'
    };
  }, [transactions, wallets, revenue, users, compliance]);

  const handleExport = async (type: string) => {
    await exportData(type, currentRange, 'csv');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Analytics</h3>
              <p className="text-sm text-gray-600 mb-4">{error.message}</p>
              <Button onClick={refresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-gray-500 mt-1">Monitor your platform performance and insights</p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedPreset} onValueChange={selectPreset}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.label} value={preset.label}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={refresh}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => handleExport('dashboard')}
            variant="outline"
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Transaction Volume"
          value={keyMetrics?.totalVolume || '—'}
          change={15.3}
          icon={DollarSign}
          color="text-green-600"
          loading={loading}
        />
        <MetricCard
          title="Active Wallets"
          value={keyMetrics?.activeWallets || '—'}
          change={8.2}
          icon={Wallet}
          color="text-blue-600"
          loading={loading}
        />
        <MetricCard
          title="Total Revenue"
          value={keyMetrics?.totalRevenue || '—'}
          change={12.5}
          icon={TrendingUp}
          color="text-purple-600"
          loading={loading}
        />
        <MetricCard
          title="Active Users"
          value={keyMetrics?.activeUsers || '—'}
          change={-2.3}
          icon={Users}
          color="text-orange-600"
          loading={loading}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {(['overview', 'transactions', 'compliance', 'performance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Transaction Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={transactions?.volumeByHour || []}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorVolume)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Two Column Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Wallet Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Balance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={wallets?.balanceDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.range}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(wallets?.balanceDistribution || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={users?.userGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <>
            {/* Transaction Status */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {keyMetrics?.successRate || '—'}
                  </div>
                  <Progress value={transactions?.successRate ? transactions.successRate * 100 : 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Average Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactions ? analyticsService.formatMetricValue(transactions.averageSize, 'currency') : '—'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {transactions?.pendingCount || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions by Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(transactions?.byPaymentMethod || {}).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Merchants */}
            <Card>
              <CardHeader>
                <CardTitle>Top Merchants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(transactions?.topMerchants || []).map((merchant, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-medium">{merchant.name}</span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-500">{merchant.count} transactions</span>
                        <span className="font-semibold">
                          {analyticsService.formatMetricValue(merchant.volume, 'currency')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'compliance' && compliance && (
          <>
            {/* Compliance Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Compliance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsService.formatMetricValue(compliance.complianceRate, 'percentage')}
                  </div>
                  <Progress value={compliance.complianceRate * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">KYC Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {compliance.kycCompleted}
                  </div>
                  <Badge variant="default" className="mt-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AML Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {compliance.amlAlerts}
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {compliance.riskScore.toFixed(1)}
                  </div>
                  <Progress
                    value={compliance.riskScore * 10}
                    className={`mt-2 ${compliance.riskScore > 7 ? 'bg-red-100' : compliance.riskScore > 4 ? 'bg-yellow-100' : 'bg-green-100'}`}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Alerts Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={compliance.alertsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ff8042" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alerts by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Alerts by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(compliance.alertsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(count / 100) * 100} className="w-32" />
                        <span className="text-sm font-semibold w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'performance' && performance && (
          <>
            {/* Performance Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">API Latency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1">
                    <div className="text-2xl font-bold">{performance.apiLatency}</div>
                    <span className="text-sm text-gray-500">ms</span>
                  </div>
                  <Badge variant={performance.apiLatency < 100 ? "default" : "secondary"} className="mt-2">
                    <Zap className="h-3 w-3 mr-1" />
                    {performance.apiLatency < 100 ? 'Optimal' : 'Slow'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">System Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {performance.uptime.toFixed(2)}%
                  </div>
                  <Progress value={performance.uptime} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {(performance.errorRate * 100).toFixed(2)}%
                  </div>
                  <Progress value={performance.errorRate * 100} className="mt-2 bg-red-100" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Throughput</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1">
                    <div className="text-2xl font-bold">{performance.throughput}</div>
                    <span className="text-sm text-gray-500">req/s</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Response Time by Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle>API Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performance.responseTimeByEndpoint}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="endpoint" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgTime" fill="#8884d8" name="Average" />
                    <Bar dataKey="p99" fill="#82ca9d" name="P99" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* System Health Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="transform -rotate-90 w-48 h-48">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke={performance.systemHealth > 80 ? '#10b981' : performance.systemHealth > 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${(performance.systemHealth / 100) * 502.4} 502.4`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{performance.systemHealth}%</div>
                        <div className="text-sm text-gray-500">Health Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;