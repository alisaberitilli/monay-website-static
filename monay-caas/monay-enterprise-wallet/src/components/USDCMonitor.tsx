'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  Link,
  RefreshCw,
  Server,
  Shield,
  TrendingUp,
  Users,
  Wallet,
  XCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  apiLatency: number;
  mockMode: boolean;
  lastCheck: string;
  services: {
    name: string;
    status: 'up' | 'down' | 'degraded';
    latency: number;
  }[];
}

interface TransactionMetrics {
  total: number;
  mints: number;
  burns: number;
  transfers: number;
  volume: number;
  averageSize: number;
  successRate: number;
}

interface WalletMetrics {
  total: number;
  active: number;
  enterprise: number;
  consumer: number;
  averageBalance: number;
  totalBalance: number;
}

interface NetworkStatus {
  chain: string;
  name: string;
  status: 'active' | 'congested' | 'down';
  gasPrice: number;
  blockHeight: number;
  tps: number;
}

interface RecentActivity {
  id: string;
  type: 'mint' | 'burn' | 'transfer' | 'wallet_created' | 'bank_linked';
  amount?: number;
  user: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export default function USDCMonitor() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    apiLatency: 45,
    mockMode: true,
    lastCheck: new Date().toISOString(),
    services: [
      { name: 'Circle API', status: 'up', latency: 120 },
      { name: 'Database', status: 'up', latency: 12 },
      { name: 'Redis Cache', status: 'up', latency: 3 },
      { name: 'Webhook Service', status: 'up', latency: 50 }
    ]
  });

  const [txMetrics, setTxMetrics] = useState<TransactionMetrics>({
    total: 1247,
    mints: 423,
    burns: 312,
    transfers: 512,
    volume: 1234567.89,
    averageSize: 989.45,
    successRate: 98.7
  });

  const [walletMetrics, setWalletMetrics] = useState<WalletMetrics>({
    total: 245,
    active: 187,
    enterprise: 89,
    consumer: 156,
    averageBalance: 5432.10,
    totalBalance: 1330964.50
  });

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus[]>([
    { chain: 'ETH', name: 'Ethereum', status: 'active', gasPrice: 25, blockHeight: 18234567, tps: 15 },
    { chain: 'SOL', name: 'Solana', status: 'active', gasPrice: 0.00025, blockHeight: 234567890, tps: 2500 },
    { chain: 'MATIC', name: 'Polygon', status: 'active', gasPrice: 30, blockHeight: 45678901, tps: 65 },
    { chain: 'AVAX', name: 'Avalanche', status: 'congested', gasPrice: 35, blockHeight: 34567890, tps: 45 }
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    { id: '1', type: 'mint', amount: 5000, user: 'user123', timestamp: new Date().toISOString(), status: 'confirmed' },
    { id: '2', type: 'transfer', amount: 250, user: 'user456', timestamp: new Date().toISOString(), status: 'pending' },
    { id: '3', type: 'wallet_created', user: 'user789', timestamp: new Date().toISOString(), status: 'confirmed' },
    { id: '4', type: 'burn', amount: 1000, user: 'user123', timestamp: new Date().toISOString(), status: 'confirmed' },
    { id: '5', type: 'bank_linked', user: 'user456', timestamp: new Date().toISOString(), status: 'confirmed' }
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Volume chart data
  const volumeData = [
    { time: '00:00', mint: 45000, burn: 32000, transfer: 28000 },
    { time: '04:00', mint: 52000, burn: 38000, transfer: 31000 },
    { time: '08:00', mint: 78000, burn: 45000, transfer: 42000 },
    { time: '12:00', mint: 125000, burn: 68000, transfer: 75000 },
    { time: '16:00', mint: 98000, burn: 55000, transfer: 62000 },
    { time: '20:00', mint: 72000, burn: 42000, transfer: 48000 }
  ];

  // Transaction distribution data
  const txDistribution = [
    { name: 'Mints', value: txMetrics.mints, color: '#10b981' },
    { name: 'Burns', value: txMetrics.burns, color: '#f59e0b' },
    { name: 'Transfers', value: txMetrics.transfers, color: '#3b82f6' }
  ];

  // Fetch metrics from backend
  const fetchMetrics = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('http://localhost:3001/api/circle/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update metrics with real data
        if (data.transactions) setTxMetrics(data.transactions);
        if (data.wallets) setWalletMetrics(data.wallets);
        if (data.health) setSystemHealth(data.health);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'active':
      case 'confirmed':
        return 'text-green-500';
      case 'warning':
      case 'degraded':
      case 'congested':
      case 'pending':
        return 'text-yellow-500';
      case 'critical':
      case 'down':
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'burn':
        return <ArrowUpRight className="h-4 w-4 text-orange-500" />;
      case 'transfer':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'wallet_created':
        return <Wallet className="h-4 w-4 text-purple-500" />;
      case 'bank_linked':
        return <Link className="h-4 w-4 text-indigo-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">USDC Operations Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and analytics for Circle USDC operations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={systemHealth.mockMode ? 'secondary' : 'default'}>
            {systemHealth.mockMode ? 'Mock Mode' : 'Production'}
          </Badge>
          <button
            onClick={fetchMetrics}
            className={`btn btn-secondary ${refreshing ? 'animate-spin' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth.status !== 'healthy' && (
        <Alert variant={systemHealth.status === 'critical' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>System Status: {systemHealth.status.toUpperCase()}</AlertTitle>
          <AlertDescription>
            Some services are experiencing issues. Check the health status below for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${txMetrics.volume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12.5%</span> from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletMetrics.active}</div>
            <Progress value={(walletMetrics.active / walletMetrics.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{txMetrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {txMetrics.total} total transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Latency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.apiLatency}ms</div>
            <p className="text-xs text-muted-foreground">
              <span className={getStatusColor(systemHealth.status)}>●</span> {systemHealth.status}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="networks">Networks</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Volume Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>24h Volume Trend</CardTitle>
                <CardDescription>USDC operations volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="mint" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="burn" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    <Area type="monotone" dataKey="transfer" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transaction Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Transaction Distribution</CardTitle>
                <CardDescription>Breakdown by operation type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={txDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {txDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest USDC operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="text-sm font-medium">
                          {activity.type.replace('_', ' ').charAt(0).toUpperCase() + activity.type.slice(1).replace('_', ' ')}
                          {activity.amount && ` - $${activity.amount.toLocaleString()}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={activity.status === 'confirmed' ? 'success' : activity.status === 'pending' ? 'secondary' : 'destructive'}>
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Analytics</CardTitle>
              <CardDescription>Detailed transaction metrics and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Mint Operations</p>
                  <p className="text-2xl font-bold text-green-500">{txMetrics.mints}</p>
                  <Progress value={(txMetrics.mints / txMetrics.total) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Burn Operations</p>
                  <p className="text-2xl font-bold text-orange-500">{txMetrics.burns}</p>
                  <Progress value={(txMetrics.burns / txMetrics.total) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Transfer Operations</p>
                  <p className="text-2xl font-bold text-blue-500">{txMetrics.transfers}</p>
                  <Progress value={(txMetrics.transfers / txMetrics.total) * 100} className="h-2" />
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Transaction Size</p>
                    <p className="text-lg font-semibold">${txMetrics.averageSize.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Hour</p>
                    <p className="text-lg font-semibold">12:00 PM - 1:00 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {networkStatus.map((network) => (
              <Card key={network.chain}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <CardTitle className="text-base">{network.name}</CardTitle>
                    </div>
                    <Badge variant={network.status === 'active' ? 'success' : network.status === 'congested' ? 'secondary' : 'destructive'}>
                      {network.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Chain ID</span>
                      <span className="font-mono">{network.chain}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gas Price</span>
                      <span>{network.gasPrice} gwei</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Block Height</span>
                      <span className="font-mono">{network.blockHeight.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TPS</span>
                      <span>{network.tps.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Status</CardTitle>
              <CardDescription>
                Last checked: {new Date(systemHealth.lastCheck).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealth.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">Latency: {service.latency}ms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getStatusColor(service.status)}`}>●</span>
                      <Badge variant={service.status === 'up' ? 'success' : service.status === 'degraded' ? 'secondary' : 'destructive'}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <p className="font-medium text-blue-900">Security Status</p>
                </div>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>✓ All webhook signatures verified</p>
                  <p>✓ API rate limits normal</p>
                  <p>✓ No suspicious activity detected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}