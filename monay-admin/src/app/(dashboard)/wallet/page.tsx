'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Building,
  Coins,
  Database,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, BarChart, DonutChart } from '@tremor/react';
import { toast } from 'sonner';

interface TreasuryWallet {
  id: string;
  name: string;
  type: 'hot' | 'cold' | 'fees' | 'settlement';
  address: string;
  network: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'maintenance';
  lastActivity: string;
  securityLevel: 'high' | 'critical';
}

interface PlatformTransaction {
  id: string;
  type: 'fee_collection' | 'settlement' | 'withdrawal' | 'deposit' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  from: string;
  to: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  tenantId?: string;
  tenantName?: string;
}

interface RevenueMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  transactionFees: number;
  subscriptionRevenue: number;
  otherRevenue: number;
}

export default function TreasuryDashboardPage() {
  const [showBalances, setShowBalances] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Treasury Wallets - Mock data with structure for real data
  const [treasuryWallets, setTreasuryWallets] = useState<TreasuryWallet[]>([
    {
      id: 'treasury-hot-001',
      name: 'Platform Hot Wallet',
      type: 'hot',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      network: 'Base Mainnet',
      balance: 2500000.00,
      currency: 'USDC',
      status: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      securityLevel: 'high'
    },
    {
      id: 'treasury-cold-001',
      name: 'Cold Storage Vault',
      type: 'cold',
      address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA22',
      network: 'Base Mainnet',
      balance: 15000000.00,
      currency: 'USDC',
      status: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      securityLevel: 'critical'
    },
    {
      id: 'treasury-fees-001',
      name: 'Fee Collection Wallet',
      type: 'fees',
      address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE',
      network: 'Base Mainnet',
      balance: 458320.50,
      currency: 'USDC',
      status: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      securityLevel: 'high'
    },
    {
      id: 'treasury-settlement-001',
      name: 'Settlement Wallet (Circle)',
      type: 'settlement',
      address: '0x9f4A8C8EbC7D5F1a3B2E6D4C8A7B5E9F2C1A8D6E',
      network: 'Base Mainnet',
      balance: 3200000.00,
      currency: 'USDC',
      status: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      securityLevel: 'high'
    }
  ]);

  // Platform Transactions - Mock data with structure for real API data
  const [transactions, setTransactions] = useState<PlatformTransaction[]>([
    {
      id: 'tx-001',
      type: 'fee_collection',
      amount: 2500.00,
      currency: 'USDC',
      description: 'Transaction fees collected from tenant operations',
      from: 'Tenant Wallets',
      to: 'Fee Collection Wallet',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'completed',
      tenantId: 'tenant-001',
      tenantName: 'Acme Corp'
    },
    {
      id: 'tx-002',
      type: 'settlement',
      amount: 150000.00,
      currency: 'USDC',
      description: 'Circle settlement batch processing',
      from: 'Settlement Wallet',
      to: 'Circle Treasury',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'completed'
    },
    {
      id: 'tx-003',
      type: 'deposit',
      amount: 500000.00,
      currency: 'USDC',
      description: 'Liquidity deposit from investors',
      from: 'External',
      to: 'Platform Hot Wallet',
      date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      status: 'completed'
    },
    {
      id: 'tx-004',
      type: 'transfer',
      amount: 1000000.00,
      currency: 'USDC',
      description: 'Security transfer to cold storage',
      from: 'Platform Hot Wallet',
      to: 'Cold Storage Vault',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: 'completed'
    },
    {
      id: 'tx-005',
      type: 'fee_collection',
      amount: 8750.00,
      currency: 'USDC',
      description: 'Transaction fees - Enterprise tier',
      from: 'Tenant Wallets',
      to: 'Fee Collection Wallet',
      date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      status: 'completed',
      tenantId: 'tenant-005',
      tenantName: 'Tech Solutions Inc'
    }
  ]);

  // Revenue Metrics - Mock data, to be replaced with API
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    daily: 45250.00,
    weekly: 285000.00,
    monthly: 1250000.00,
    yearly: 12500000.00,
    transactionFees: 458320.50,
    subscriptionRevenue: 750000.00,
    otherRevenue: 41679.50
  });

  // Chart data
  const revenueChartData = [
    { date: 'Jan', revenue: 950000 },
    { date: 'Feb', revenue: 1050000 },
    { date: 'Mar', revenue: 980000 },
    { date: 'Apr', revenue: 1150000 },
    { date: 'May', revenue: 1080000 },
    { date: 'Jun', revenue: 1250000 },
  ];

  const feeBreakdownData = [
    { name: 'Transaction Fees', value: 458320.50 },
    { name: 'Subscription', value: 750000.00 },
    { name: 'Other', value: 41679.50 },
  ];

  const totalTreasuryBalance = treasuryWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalRevenue = revenueMetrics.transactionFees + revenueMetrics.subscriptionRevenue + revenueMetrics.otherRevenue;

  // Function to fetch real transactions from backend
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('monay_admin_token');
      console.log('📡 Fetching treasury transactions with token:', token ? 'Found' : 'Missing');
      const response = await fetch('http://localhost:3001/api/super-admin/treasury/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.transactions) {
          setTransactions(data.transactions);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Continue with mock data if API fails
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch treasury wallet balances
  const fetchWalletBalances = async () => {
    try {
      const token = localStorage.getItem('monay_admin_token');
      const response = await fetch('http://localhost:3001/api/super-admin/treasury/wallets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.wallets) {
          setTreasuryWallets(data.wallets);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      // Continue with mock data if API fails
    }
  };

  // Function to fetch revenue metrics
  const fetchRevenueMetrics = async () => {
    try {
      const token = localStorage.getItem('monay_admin_token');
      const response = await fetch('http://localhost:3001/api/super-admin/treasury/revenue', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.metrics) {
          setRevenueMetrics(data.metrics);
        }
      }
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      // Continue with mock data if API fails
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchTransactions(),
      fetchWalletBalances(),
      fetchRevenueMetrics()
    ]);
    toast.success('Treasury data refreshed');
  };

  useEffect(() => {
    // Attempt to fetch real data on mount, fallback to mock data
    fetchTransactions();
    fetchWalletBalances();
    fetchRevenueMetrics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard');
  };

  const getWalletTypeIcon = (type: TreasuryWallet['type']) => {
    switch (type) {
      case 'hot': return <Wallet className="w-5 h-5 text-orange-600" />;
      case 'cold': return <Lock className="w-5 h-5 text-blue-600" />;
      case 'fees': return <Coins className="w-5 h-5 text-green-600" />;
      case 'settlement': return <Building className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTransactionIcon = (type: PlatformTransaction['type']) => {
    switch (type) {
      case 'fee_collection': return <Coins className="w-4 h-4 text-green-600" />;
      case 'settlement': return <Building className="w-4 h-4 text-purple-600" />;
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'transfer': return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Failed' },
      active: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Active' },
      frozen: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Frozen' },
      maintenance: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Maintenance' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    return <Badge className={config.color} variant="outline">{config.label}</Badge>;
  };

  const getSecurityBadge = (level: string) => {
    return level === 'critical'
      ? <Badge className="bg-red-100 text-red-700">Critical Security</Badge>
      : <Badge className="bg-blue-100 text-blue-700">High Security</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">Platform Treasury</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-gray-600">Manage platform wallets, fees, and settlements</p>
        </div>

        <Button onClick={handleRefresh} disabled={isLoading} className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Treasury</p>
                <p className="text-2xl font-bold text-blue-600">
                  {showBalances ? formatCurrency(totalTreasuryBalance) : '••••••••'}
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {showBalances ? formatCurrency(revenueMetrics.monthly) : '••••••••'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fee Collection</p>
                <p className="text-2xl font-bold text-purple-600">
                  {showBalances ? formatCurrency(revenueMetrics.transactionFees) : '••••••••'}
                </p>
              </div>
              <Coins className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Wallets</p>
                <p className="text-2xl font-bold">{treasuryWallets.filter(w => w.status === 'active').length}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallets">Treasury Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <AreaChart
                      className="h-full"
                      data={revenueChartData}
                      index="date"
                      categories={["revenue"]}
                      colors={["blue"]}
                      valueFormatter={(value) => formatCurrency(value)}
                      showAnimation={true}
                      showGridLines={false}
                      curveType="monotone"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>By source type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <DonutChart
                      className="h-full"
                      data={feeBreakdownData}
                      category="value"
                      index="name"
                      valueFormatter={(value) => formatCurrency(value)}
                      colors={["green", "blue", "purple"]}
                      showAnimation={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Treasury Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treasuryWallets.map((wallet) => (
              <Card key={wallet.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getWalletTypeIcon(wallet.type)}
                      <div>
                        <CardTitle className="text-lg">{wallet.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {wallet.network}
                          {getSecurityBadge(wallet.securityLevel)}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(wallet.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Wallet Address</p>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(wallet.address)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-xs font-mono break-all">{wallet.address}</code>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Balance</p>
                      <p className="text-2xl font-bold">
                        {showBalances ? formatCurrency(wallet.balance) : '••••••••'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Last Activity</p>
                      <p className="text-sm font-medium">{formatTimeAgo(wallet.lastActivity)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Transactions</CardTitle>
              <CardDescription>All treasury and fee collection transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>From/To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          {tx.tenantName && (
                            <p className="text-sm text-muted-foreground">Tenant: {tx.tenantName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-gray-600">From: {tx.from}</p>
                          <p className="text-gray-600">To: {tx.to}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          tx.type === 'deposit' || tx.type === 'fee_collection'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'fee_collection' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(tx.date).toLocaleDateString()}
                          <p className="text-xs text-gray-500">{formatTimeAgo(tx.date)}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-medium text-muted-foreground">Daily Revenue</p>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.daily)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-muted-foreground">Weekly Revenue</p>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.weekly)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.monthly)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  <p className="text-sm font-medium text-muted-foreground">Yearly Revenue</p>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.yearly)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Sources</CardTitle>
              <CardDescription>Breakdown by revenue type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Transaction Fees</p>
                      <p className="text-sm text-gray-500">Platform transaction fees</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(revenueMetrics.transactionFees)}</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Subscription Revenue</p>
                      <p className="text-sm text-gray-500">Monthly/yearly subscriptions</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(revenueMetrics.subscriptionRevenue)}</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Other Revenue</p>
                      <p className="text-sm text-gray-500">Miscellaneous income</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(revenueMetrics.otherRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Source Indicator */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              {isLoading ? 'Loading real-time data...' : 'Currently showing mock demo data. Connect to backend API for live treasury data.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
