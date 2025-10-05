'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Users,
  Settings,
  Eye,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Plus,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet,
  CreditCard,
  BarChart3,
  PieChart
} from 'lucide-react';

interface CorporateWallet {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: {
    native: number;
    usd: number;
    tokens: Array<{
      symbol: string;
      balance: number;
      usdValue: number;
    }>;
  };
  status: 'active' | 'restricted' | 'frozen';
  department: string;
  signers: number;
  threshold: number;
  dailyLimit: number;
  monthlyLimit: number;
  usedDaily: number;
  usedMonthly: number;
}

interface CorporateTransaction {
  id: string;
  type: 'incoming' | 'outgoing' | 'internal';
  amount: number;
  currency: string;
  usdValue: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  department: string;
  approver: string;
}

export default function CorporateOverviewPage() {
  const router = useRouter();
  const [corporateWallets, setCorporateWallets] = useState<CorporateWallet[]>([
    {
      id: 'corp-001',
      name: 'Treasury Operations',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      network: 'Base L2',
      balance: {
        native: 125.5,
        usd: 2500000,
        tokens: [
          { symbol: 'USDC', balance: 1500000, usdValue: 1500000 },
          { symbol: 'USDT', balance: 1000000, usdValue: 1000000 }
        ]
      },
      status: 'active',
      department: 'Finance',
      signers: 5,
      threshold: 3,
      dailyLimit: 500000,
      monthlyLimit: 10000000,
      usedDaily: 125000,
      usedMonthly: 3200000
    },
    {
      id: 'corp-002',
      name: 'Payroll Processing',
      address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA22',
      network: 'Base L2',
      balance: {
        native: 45.2,
        usd: 850000,
        tokens: [
          { symbol: 'USDC', balance: 850000, usdValue: 850000 }
        ]
      },
      status: 'active',
      department: 'HR',
      signers: 3,
      threshold: 2,
      dailyLimit: 200000,
      monthlyLimit: 4000000,
      usedDaily: 45000,
      usedMonthly: 1250000
    },
    {
      id: 'corp-003',
      name: 'Vendor Payments',
      address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE',
      network: 'Base L2',
      balance: {
        native: 18.7,
        usd: 320000,
        tokens: [
          { symbol: 'USDC', balance: 320000, usdValue: 320000 }
        ]
      },
      status: 'restricted',
      department: 'Procurement',
      signers: 4,
      threshold: 3,
      dailyLimit: 100000,
      monthlyLimit: 2000000,
      usedDaily: 25000,
      usedMonthly: 680000
    }
  ]);

  const [recentTransactions, setRecentTransactions] = useState<CorporateTransaction[]>([
    {
      id: 'tx-001',
      type: 'outgoing',
      amount: 125000,
      currency: 'USDC',
      usdValue: 125000,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'completed',
      description: 'Monthly payroll distribution',
      department: 'HR',
      approver: 'John Smith'
    },
    {
      id: 'tx-002',
      type: 'incoming',
      amount: 500000,
      currency: 'USDC',
      usdValue: 500000,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'completed',
      description: 'Treasury funding from Circle',
      department: 'Finance',
      approver: 'Sarah Johnson'
    },
    {
      id: 'tx-003',
      type: 'outgoing',
      amount: 75000,
      currency: 'USDC',
      usdValue: 75000,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      status: 'pending',
      description: 'Vendor payment - Cloud services',
      department: 'Procurement',
      approver: 'Mike Davis'
    }
  ]);

  const totalBalance = corporateWallets.reduce((sum, w) => sum + w.balance.usd, 0);
  const totalDailyUsed = corporateWallets.reduce((sum, w) => sum + w.usedDaily, 0);
  const totalDailyLimit = corporateWallets.reduce((sum, w) => sum + w.dailyLimit, 0);
  const activeWallets = corporateWallets.filter(w => w.status === 'active').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'restricted':
        return <Badge className="bg-orange-100 text-orange-700">Restricted</Badge>;
      case 'frozen':
        return <Badge className="bg-red-100 text-red-700">Frozen</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'outgoing':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'internal':
        return <RefreshCcw className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleCreateWallet = () => {
    // Navigate to wallet creation page
    router.push('/wallets/corporate/create');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Corporate Wallets Overview</h1>
          <p className="text-gray-600 mt-1">Enterprise treasury and departmental wallet management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
            onClick={handleCreateWallet}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Wallet
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Corporate Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+8.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWallets}</div>
            <div className="text-xs text-gray-500 mt-1">
              of {corporateWallets.length} total wallets
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Daily Limit Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((totalDailyUsed / totalDailyLimit) * 100)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatCurrency(totalDailyUsed)} of {formatCurrency(totalDailyLimit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Multi-sig Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">All wallets secured</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wallets">Corporate Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Corporate Wallet Portfolio</CardTitle>
              <CardDescription>
                Enterprise wallets with multi-signature security and spending controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {corporateWallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{wallet.name}</div>
                        <div className="text-sm text-gray-500">
                          {wallet.department} • {wallet.network}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {formatCurrency(wallet.balance.usd)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {wallet.balance.tokens.length} tokens
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        {wallet.signers} signers
                      </div>
                      <div className="text-xs text-gray-500">
                        {wallet.threshold} of {wallet.signers} required
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        {Math.round((wallet.usedDaily / wallet.dailyLimit) * 100)}% used
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(wallet.usedDaily)} daily
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(wallet.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => router.push(`/wallets/corporate/${wallet.id}`)}
                        title="View wallet details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => router.push('/wallets/corporate/settings')}
                        title="Wallet settings"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                        onClick={() => router.push('/payments/send')}
                        title="Send payment"
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
              <CardTitle>Recent Corporate Transactions</CardTitle>
              <CardDescription>
                Latest transactions across all corporate wallets
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
                          {tx.department} • {formatTimeAgo(tx.timestamp)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Approved by: {tx.approver} • {tx.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(tx.amount)} {tx.currency}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(tx.usdValue)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <span className="text-sm capitalize">{tx.status}</span>
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
                <CardTitle>Spending by Department</CardTitle>
                <CardDescription>Monthly breakdown by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <PieChart className="w-32 h-32 text-gray-400" />
                  <span className="ml-4 text-gray-500">Chart coming soon</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>7-day transaction volume trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <BarChart3 className="w-32 h-32 text-gray-400" />
                  <span className="ml-4 text-gray-500">Chart coming soon</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Governance & Controls</CardTitle>
              <CardDescription>
                Multi-signature policies and spending controls across corporate wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Multi-Signature Security
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    All corporate wallets require multiple signatures for transactions above threshold limits.
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-900">15</div>
                      <div className="text-xs text-blue-600">Total Signers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-900">3</div>
                      <div className="text-xs text-blue-600">Wallets Protected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-900">100%</div>
                      <div className="text-xs text-blue-600">Security Coverage</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Spending Limits</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Daily and monthly spending limits enforced across all wallets
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-700">All limits compliant</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Approval Workflows</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Automated approval processes for different transaction types
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-blue-100 text-blue-700">3 active workflows</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}