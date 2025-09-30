'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Eye,
  Send,
  Download,
  Coins,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TreasuryBalance {
  currency: string;
  balance: number;
  usdValue: number;
  change24h: number;
  chainInfo: {
    name: string;
    type: 'mainnet' | 'testnet';
  };
}

interface TreasuryTransaction {
  id: string;
  type: 'inbound' | 'outbound' | 'swap';
  amount: number;
  currency: string;
  usdValue: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export default function TreasuryDashboardPage() {
  const [treasuryBalances, setTreasuryBalances] = useState<TreasuryBalance[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TreasuryTransaction[]>([]);
  const [totalUsdValue, setTotalUsdValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockBalances: TreasuryBalance[] = [
      {
        currency: 'USDC',
        balance: 2500000,
        usdValue: 2500000,
        change24h: 2.5,
        chainInfo: { name: 'Solana', type: 'mainnet' }
      },
      {
        currency: 'USDT',
        balance: 1800000,
        usdValue: 1800000,
        change24h: -1.2,
        chainInfo: { name: 'Base L2', type: 'mainnet' }
      },
      {
        currency: 'USDXM',
        balance: 850000,
        usdValue: 850000,
        change24h: 5.8,
        chainInfo: { name: 'Solana', type: 'mainnet' }
      },
      {
        currency: 'SOL',
        balance: 12500,
        usdValue: 750000,
        change24h: 12.3,
        chainInfo: { name: 'Solana', type: 'mainnet' }
      },
      {
        currency: 'ETH',
        balance: 250,
        usdValue: 625000,
        change24h: 8.7,
        chainInfo: { name: 'Base L2', type: 'mainnet' }
      }
    ];

    const mockTransactions: TreasuryTransaction[] = [
      {
        id: 'tx-001',
        type: 'inbound',
        amount: 50000,
        currency: 'USDC',
        usdValue: 50000,
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        status: 'completed',
        description: 'Enterprise treasury deposit'
      },
      {
        id: 'tx-002',
        type: 'outbound',
        amount: 25000,
        currency: 'USDXM',
        usdValue: 25000,
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        status: 'completed',
        description: 'Cross-rail liquidity transfer'
      },
      {
        id: 'tx-003',
        type: 'swap',
        amount: 100000,
        currency: 'USDT',
        usdValue: 100000,
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        status: 'pending',
        description: 'USDT → USDC swap for rebalancing'
      }
    ];

    setTreasuryBalances(mockBalances);
    setRecentTransactions(mockTransactions);
    setTotalUsdValue(mockBalances.reduce((sum, balance) => sum + balance.usdValue, 0));
    setLoading(false);
  }, []);

  // Prepare chart data
  const pieChartData = treasuryBalances.map((balance) => ({
    name: balance.currency,
    value: balance.usdValue,
    percentage: ((balance.usdValue / totalUsdValue) * 100).toFixed(1)
  }));

  const barChartData = [
    { day: 'Mon', volume: 320000 },
    { day: 'Tue', volume: 450000 },
    { day: 'Wed', volume: 380000 },
    { day: 'Thu', volume: 520000 },
    { day: 'Fri', volume: 680000 },
    { day: 'Sat', volume: 420000 },
    { day: 'Sun', volume: 390000 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'inbound': return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'outbound': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'swap': return <RefreshCcw className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Treasury Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time treasury management and liquidity oversight</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Treasury Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalUsdValue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+5.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Chains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <div className="text-xs text-gray-500 mt-1">
              Solana & Base L2
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Liquidity Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-600">-2.1% optimal range</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(450000)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              175 transactions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treasury Tabs */}
      <Tabs defaultValue="balances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="balances">Asset Balances</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rebalancing">Rebalancing</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Asset Balances</CardTitle>
              <CardDescription>
                Real-time balances across all supported chains and assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {treasuryBalances.map((balance, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Coins className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{balance.currency}</div>
                        <div className="text-sm text-gray-500">
                          {balance.chainInfo.name} • {balance.chainInfo.type}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(balance.balance, balance.currency)} {balance.currency}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(balance.usdValue)}
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${
                        balance.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {balance.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(balance.change24h)}%
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
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
              <CardTitle>Recent Treasury Transactions</CardTitle>
              <CardDescription>
                Latest treasury operations and cross-rail transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="font-semibold">{tx.description}</div>
                        <div className="text-sm text-gray-500">
                          {formatTimeAgo(tx.timestamp)} • {tx.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(tx.amount, tx.currency)} {tx.currency}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(tx.usdValue)}
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Treasury Composition</CardTitle>
                <CardDescription>Asset allocation breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          'Value'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Volume Trends</CardTitle>
                <CardDescription>7-day transaction volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis
                        tickFormatter={(value) => `$${(value / 1000)}K`}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          'Volume'
                        ]}
                      />
                      <Bar dataKey="volume" fill="#F97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rebalancing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Rebalancing</CardTitle>
              <CardDescription>
                Automated liquidity management and cross-rail optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900">Recommended Action</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Rebalance 200K USDT from Base L2 to Solana to optimize cross-rail liquidity
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                  >
                    Execute Rebalance
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Rebalancing Rules</h4>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Maintain 60/40 Solana/Base L2 distribution</li>
                    <li>• Keep minimum 500K USDC liquidity per chain</li>
                    <li>• Auto-rebalance when deviation {'>'} 10%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}