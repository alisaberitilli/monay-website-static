'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DollarSign
} from 'lucide-react';

interface Position {
  id: string;
  currency: string;
  balance: number;
  usdValue: number;
  change24h: number;
  changeValue: number;
  chainInfo: {
    name: string;
    type: 'mainnet' | 'testnet';
  };
  allocation: number;
  status: 'active' | 'locked' | 'pending';
}

export default function TreasuryPositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API calls
    const mockPositions: Position[] = [
      {
        id: 'pos-1',
        currency: 'USDC',
        balance: 2500000,
        usdValue: 2500000,
        change24h: 2.5,
        changeValue: 61250,
        chainInfo: { name: 'Solana', type: 'mainnet' },
        allocation: 38.5,
        status: 'active'
      },
      {
        id: 'pos-2',
        currency: 'USDT',
        balance: 1800000,
        usdValue: 1800000,
        change24h: -1.2,
        changeValue: -21600,
        chainInfo: { name: 'Base L2', type: 'mainnet' },
        allocation: 27.7,
        status: 'active'
      },
      {
        id: 'pos-3',
        currency: 'USDXM',
        balance: 850000,
        usdValue: 850000,
        change24h: 5.8,
        changeValue: 49300,
        chainInfo: { name: 'Solana', type: 'mainnet' },
        allocation: 13.1,
        status: 'active'
      },
      {
        id: 'pos-4',
        currency: 'SOL',
        balance: 12500,
        usdValue: 750000,
        change24h: 12.3,
        changeValue: 92250,
        chainInfo: { name: 'Solana', type: 'mainnet' },
        allocation: 11.5,
        status: 'locked'
      },
      {
        id: 'pos-5',
        currency: 'ETH',
        balance: 250,
        usdValue: 625000,
        change24h: 8.7,
        changeValue: 54375,
        chainInfo: { name: 'Base L2', type: 'mainnet' },
        allocation: 9.6,
        status: 'active'
      }
    ];

    setPositions(mockPositions);
    setTotalValue(mockPositions.reduce((sum, pos) => sum + pos.usdValue, 0));
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'locked':
        return <Badge className="bg-yellow-100 text-yellow-700">Locked</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-700">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
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
          <h1 className="text-3xl font-bold">Treasury Positions</h1>
          <p className="text-gray-600 mt-1">Detailed breakdown of all treasury holdings and allocations</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Position Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+4.8% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.filter(p => p.status === 'active').length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {positions.length} total positions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Largest Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions.length > 0 ? positions[0].currency : '-'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {positions.length > 0 ? `${positions[0].allocation}% allocation` : 'No positions'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Positions</CardTitle>
          <CardDescription>
            Complete breakdown of treasury positions across all chains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Coins className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{position.currency}</div>
                    <div className="text-sm text-gray-500">
                      {position.chainInfo.name} • {position.chainInfo.type}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {position.allocation}% of total portfolio
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {formatCurrency(position.balance, position.currency)} {position.currency}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(position.usdValue)}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-medium flex items-center gap-1 ${
                    position.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {position.change24h >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(position.change24h)}%
                  </div>
                  <div className={`text-xs ${
                    position.changeValue >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {position.changeValue >= 0 ? '+' : ''}{formatCurrency(position.changeValue)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(position.status)}
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
                      disabled={position.status === 'locked'}
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
    </div>
  );
}