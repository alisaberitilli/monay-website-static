'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Eye,
  Send,
  Download,
  Coins,
  Activity,
  DollarSign,
  Droplets,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface LiquidityPool {
  id: string;
  name: string;
  chain: string;
  tokenA: string;
  tokenB: string;
  tvl: number;
  apy: number;
  volume24h: number;
  fees24h: number;
  myLiquidity: number;
  status: 'active' | 'low' | 'critical';
}

interface LiquidityOperation {
  id: string;
  type: 'add' | 'remove' | 'swap';
  pool: string;
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  txHash: string;
}

export default function TreasuryLiquidityPage() {
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>([]);
  const [recentOperations, setRecentOperations] = useState<LiquidityOperation[]>([]);
  const [totalLiquidity, setTotalLiquidity] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockPools: LiquidityPool[] = [
      {
        id: 'pool-1',
        name: 'USDC/USDT',
        chain: 'Solana',
        tokenA: 'USDC',
        tokenB: 'USDT',
        tvl: 12500000,
        apy: 8.5,
        volume24h: 2400000,
        fees24h: 1200,
        myLiquidity: 125000,
        status: 'active'
      },
      {
        id: 'pool-2',
        name: 'USDXM/USDC',
        chain: 'Solana',
        tokenA: 'USDXM',
        tokenB: 'USDC',
        tvl: 8200000,
        apy: 12.3,
        volume24h: 1800000,
        fees24h: 900,
        myLiquidity: 82000,
        status: 'active'
      },
      {
        id: 'pool-3',
        name: 'SOL/USDC',
        chain: 'Solana',
        tokenA: 'SOL',
        tokenB: 'USDC',
        tvl: 15600000,
        apy: 15.7,
        volume24h: 3200000,
        fees24h: 1600,
        myLiquidity: 156000,
        status: 'low'
      },
      {
        id: 'pool-4',
        name: 'ETH/USDT',
        chain: 'Base L2',
        tokenA: 'ETH',
        tokenB: 'USDT',
        tvl: 6400000,
        apy: 9.8,
        volume24h: 1200000,
        fees24h: 600,
        myLiquidity: 64000,
        status: 'critical'
      }
    ];

    const mockOperations: LiquidityOperation[] = [
      {
        id: 'op-1',
        type: 'add',
        pool: 'USDC/USDT',
        amount: 50000,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'completed',
        txHash: '0x123...abc'
      },
      {
        id: 'op-2',
        type: 'remove',
        pool: 'SOL/USDC',
        amount: 25000,
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        status: 'completed',
        txHash: '0x456...def'
      },
      {
        id: 'op-3',
        type: 'swap',
        pool: 'USDXM/USDC',
        amount: 75000,
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        status: 'pending',
        txHash: '0x789...ghi'
      }
    ];

    setLiquidityPools(mockPools);
    setRecentOperations(mockOperations);
    setTotalLiquidity(mockPools.reduce((sum, pool) => sum + pool.myLiquidity, 0));
    setLoading(false);
  }, []);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-700"><AlertTriangle className="w-3 h-3 mr-1" />Low Liquidity</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'add': return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'remove': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'swap': return <RefreshCcw className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
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
          <h1 className="text-3xl font-bold">Treasury Liquidity</h1>
          <p className="text-gray-600 mt-1">Cross-rail liquidity management and optimization</p>
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
              Total Liquidity Provided
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalLiquidity)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+6.2% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Pools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liquidityPools.filter(p => p.status === 'active').length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {liquidityPools.length} total pools
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              24h Fees Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(liquidityPools.reduce((sum, pool) => sum + pool.fees24h, 0))}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+12.5% from yesterday</span>
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
              {(liquidityPools.reduce((sum, pool) => sum + pool.apy, 0) / liquidityPools.length).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Weighted average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity Tabs */}
      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
          <TabsTrigger value="operations">Recent Operations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Liquidity Pools</CardTitle>
              <CardDescription>
                Cross-rail liquidity pools and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liquidityPools.map((pool) => (
                  <div key={pool.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Droplets className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{pool.name}</div>
                        <div className="text-sm text-gray-500">
                          {pool.chain} • TVL: {formatCurrency(pool.tvl)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          24h Volume: {formatCurrency(pool.volume24h)}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="font-semibold text-lg">
                        {formatCurrency(pool.myLiquidity)}
                      </div>
                      <div className="text-sm text-gray-500">
                        My Liquidity
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {pool.apy.toFixed(1)}% APY
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-lg text-green-600">
                        {formatCurrency(pool.fees24h)}
                      </div>
                      <div className="text-sm text-gray-500">
                        24h Fees
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(pool.status)}
                      <div className="flex gap-1 ml-2">
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Liquidity Operations</CardTitle>
              <CardDescription>
                Latest liquidity additions, removals, and swaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOperations.map((op) => (
                  <div key={op.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getOperationIcon(op.type)}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {op.type === 'add' ? 'Add Liquidity' : op.type === 'remove' ? 'Remove Liquidity' : 'Swap'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTimeAgo(op.timestamp)} • {op.pool}
                        </div>
                        <div className="text-xs text-gray-400">
                          Tx: {op.txHash}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(op.amount)}
                      </div>
                      <Badge
                        variant={op.status === 'completed' ? 'default' : op.status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-xs mt-1"
                      >
                        {op.status}
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
                <CardTitle>Liquidity Distribution</CardTitle>
                <CardDescription>Allocation across pools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <BarChart3 className="w-32 h-32 text-gray-400" />
                  <span className="ml-4 text-gray-500">Chart coming soon</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fee Performance</CardTitle>
                <CardDescription>7-day fee earnings trend</CardDescription>
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