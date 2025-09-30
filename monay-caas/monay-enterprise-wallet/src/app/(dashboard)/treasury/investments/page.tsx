'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Eye,
  Download,
  PieChart,
  BarChart3,
  Target,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

interface Investment {
  id: string;
  name: string;
  type: 'yield_farming' | 'staking' | 'bonds' | 'lending';
  platform: string;
  amount: number;
  apy: number;
  duration: string;
  maturity: Date | null;
  earned: number;
  status: 'active' | 'matured' | 'pending';
  risk: 'low' | 'medium' | 'high';
  chain: string;
}

interface InvestmentTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'reward';
  investment: string;
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending';
  txHash: string;
}

export default function TreasuryInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockInvestments: Investment[] = [
      {
        id: 'inv-1',
        name: 'USDC Lending Pool',
        type: 'lending',
        platform: 'Solend',
        amount: 500000,
        apy: 12.5,
        duration: 'Flexible',
        maturity: null,
        earned: 15625,
        status: 'active',
        risk: 'low',
        chain: 'Solana'
      },
      {
        id: 'inv-2',
        name: 'SOL-USDC LP Farming',
        type: 'yield_farming',
        platform: 'Raydium',
        amount: 300000,
        apy: 18.7,
        duration: 'Flexible',
        maturity: null,
        earned: 14025,
        status: 'active',
        risk: 'medium',
        chain: 'Solana'
      },
      {
        id: 'inv-3',
        name: 'ETH Staking',
        type: 'staking',
        platform: 'Lido',
        amount: 250000,
        apy: 8.3,
        duration: 'Flexible',
        maturity: null,
        earned: 5187.5,
        status: 'active',
        risk: 'low',
        chain: 'Base L2'
      },
      {
        id: 'inv-4',
        name: 'Treasury Bills',
        type: 'bonds',
        platform: 'TradFi Bridge',
        amount: 1000000,
        apy: 5.2,
        duration: '90 days',
        maturity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        earned: 13000,
        status: 'active',
        risk: 'low',
        chain: 'Base L2'
      },
      {
        id: 'inv-5',
        name: 'USDXM Yield Pool',
        type: 'yield_farming',
        platform: 'Native Protocol',
        amount: 200000,
        apy: 22.1,
        duration: 'Flexible',
        maturity: null,
        earned: 11050,
        status: 'active',
        risk: 'medium',
        chain: 'Solana'
      }
    ];

    const mockTransactions: InvestmentTransaction[] = [
      {
        id: 'tx-1',
        type: 'reward',
        investment: 'USDC Lending Pool',
        amount: 2100,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'completed',
        txHash: '0xabc...123'
      },
      {
        id: 'tx-2',
        type: 'deposit',
        investment: 'SOL-USDC LP Farming',
        amount: 50000,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        status: 'completed',
        txHash: '0xdef...456'
      },
      {
        id: 'tx-3',
        type: 'withdraw',
        investment: 'ETH Staking',
        amount: 25000,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
        status: 'pending',
        txHash: '0xghi...789'
      }
    ];

    setInvestments(mockInvestments);
    setTransactions(mockTransactions);
    setTotalInvested(mockInvestments.reduce((sum, inv) => sum + inv.amount, 0));
    setTotalEarned(mockInvestments.reduce((sum, inv) => sum + inv.earned, 0));
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-100 text-green-700"><Shield className="w-3 h-3 mr-1" />Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700"><AlertTriangle className="w-3 h-3 mr-1" />Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />High Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'matured':
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />Matured</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'yield_farming': return <Target className="w-5 h-5 text-green-600" />;
      case 'staking': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'bonds': return <PieChart className="w-5 h-5 text-purple-600" />;
      case 'lending': return <DollarSign className="w-5 h-5 text-orange-600" />;
      default: return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Treasury Investments</h1>
          <p className="text-gray-600 mt-1">Yield-generating strategies and institutional investments</p>
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
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalInvested)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+8.4% this quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEarned)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((totalEarned / totalInvested) * 100).toFixed(2)}% total return
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.filter(i => i.status === 'active').length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {investments.length} total investments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Average APY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(investments.reduce((sum, inv) => sum + (inv.apy * inv.amount), 0) / totalInvested).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Weighted average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Tabs */}
      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">Investment Portfolio</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Investment Portfolio</CardTitle>
              <CardDescription>
                Current yield-generating positions across platforms and chains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(investment.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{investment.name}</div>
                        <div className="text-sm text-gray-500">
                          {investment.platform} • {investment.chain}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Duration: {investment.duration}
                          {investment.maturity && ` • Matures: ${investment.maturity.toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="font-semibold text-lg">
                        {formatCurrency(investment.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Principal
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {investment.apy.toFixed(1)}% APY
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-lg text-green-600">
                        {formatCurrency(investment.earned)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Earned
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {((investment.earned / investment.amount) * 100).toFixed(2)}% return
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(investment.status)}
                      {getRiskBadge(investment.risk)}
                      <div className="flex gap-1">
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
                          Manage
                        </Button>
                      </div>
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
              <CardTitle>Recent Investment Transactions</CardTitle>
              <CardDescription>
                Latest deposits, withdrawals, and reward claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {tx.type === 'deposit' ? (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        ) : tx.type === 'withdraw' ? (
                          <TrendingUp className="w-4 h-4 text-red-600" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold capitalize">
                          {tx.type === 'reward' ? 'Reward Claim' : tx.type}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTimeAgo(tx.timestamp)} • {tx.investment}
                        </div>
                        <div className="text-xs text-gray-400">
                          Tx: {tx.txHash}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        tx.type === 'deposit' ? 'text-green-600' :
                        tx.type === 'withdraw' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {tx.type === 'withdraw' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </div>
                      <Badge
                        variant={tx.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs mt-1"
                      >
                        {tx.status}
                      </Badge>
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
                <CardTitle>Investment Allocation</CardTitle>
                <CardDescription>Distribution by investment type</CardDescription>
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
                <CardTitle>Yield Performance</CardTitle>
                <CardDescription>30-day earnings trend</CardDescription>
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
      </Tabs>
    </div>
  );
}