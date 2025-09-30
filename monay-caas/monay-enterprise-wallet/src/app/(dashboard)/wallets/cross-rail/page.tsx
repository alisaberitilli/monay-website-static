'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Download,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Zap,
  Settings,
  Eye,
  RefreshCcw,
  ArrowRight,
  ArrowLeft,
  Database,
  Shield,
  Wallet
} from 'lucide-react';

interface CrossRailTransfer {
  id: string;
  fromChain: 'base' | 'solana';
  toChain: 'base' | 'solana';
  sourceAddress: string;
  destinationAddress: string;
  amount: number;
  tokenSymbol: string;
  usdValue: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  estimatedTime: number; // seconds
  actualTime?: number; // seconds
  fee: number;
  transactionHash?: string;
  bridgeRoute: string;
}

interface ChainStatus {
  chain: 'base' | 'solana';
  status: 'online' | 'degraded' | 'offline';
  blockHeight: number;
  lastUpdate: Date;
  avgBlockTime: number;
  congestion: 'low' | 'medium' | 'high';
}

export default function CrossRailTransferPage() {
  const [transfers, setTransfers] = useState<CrossRailTransfer[]>([
    {
      id: 'xr-001',
      fromChain: 'base',
      toChain: 'solana',
      sourceAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      destinationAddress: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
      amount: 50000,
      tokenSymbol: 'USDC',
      usdValue: 50000,
      status: 'completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      estimatedTime: 45,
      actualTime: 42,
      fee: 25,
      transactionHash: '0xabc123...',
      bridgeRoute: 'Circle CCTP'
    },
    {
      id: 'xr-002',
      fromChain: 'solana',
      toChain: 'base',
      sourceAddress: 'FKyBko7LbfSQsRW9QkPhHq4xYyqzJUqcY9uZvXqkZKJx',
      destinationAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA22',
      amount: 25000,
      tokenSymbol: 'USDT',
      usdValue: 25000,
      status: 'processing',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      estimatedTime: 60,
      fee: 30,
      bridgeRoute: 'Wormhole'
    },
    {
      id: 'xr-003',
      fromChain: 'base',
      toChain: 'solana',
      sourceAddress: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE',
      destinationAddress: '2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C',
      amount: 75000,
      tokenSymbol: 'USDXM',
      usdValue: 75000,
      status: 'pending',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      estimatedTime: 50,
      fee: 35,
      bridgeRoute: 'Circle CCTP'
    },
    {
      id: 'xr-004',
      fromChain: 'solana',
      toChain: 'base',
      sourceAddress: '9f4A8C8EbC7D5F1a3B2E6D4C8A7B5E9F2C1A8D6E',
      destinationAddress: '0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B',
      amount: 100000,
      tokenSymbol: 'USDC',
      usdValue: 100000,
      status: 'failed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      estimatedTime: 45,
      fee: 25,
      bridgeRoute: 'Circle CCTP'
    }
  ]);

  const [chainStatus, setChainStatus] = useState<ChainStatus[]>([
    {
      chain: 'base',
      status: 'online',
      blockHeight: 8457392,
      lastUpdate: new Date(Date.now() - 1000 * 30),
      avgBlockTime: 2,
      congestion: 'low'
    },
    {
      chain: 'solana',
      status: 'online',
      blockHeight: 245789634,
      lastUpdate: new Date(Date.now() - 1000 * 15),
      avgBlockTime: 0.4,
      congestion: 'medium'
    }
  ]);

  const [selectedFromChain, setSelectedFromChain] = useState('base');
  const [selectedToChain, setSelectedToChain] = useState('solana');
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransfers = transfers.filter(transfer =>
    transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVolume24h = transfers
    .filter(t => t.timestamp > new Date(Date.now() - 1000 * 60 * 60 * 24))
    .reduce((sum, t) => sum + t.usdValue, 0);

  const completedTransfers = transfers.filter(t => t.status === 'completed').length;
  const averageTime = transfers
    .filter(t => t.actualTime)
    .reduce((sum, t) => sum + (t.actualTime || 0), 0) / transfers.filter(t => t.actualTime).length;

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
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getChainStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-700">Online</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-700">Degraded</Badge>;
      case 'offline':
        return <Badge className="bg-red-100 text-red-700">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <RefreshCcw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChainIcon = (chain: string) => {
    return chain === 'base' ?
      <Database className="w-4 h-4 text-blue-600" /> :
      <Zap className="w-4 h-4 text-purple-600" />;
  };

  const swapChains = () => {
    const temp = selectedFromChain;
    setSelectedFromChain(selectedToChain);
    setSelectedToChain(temp);
  };

  const initiateTransfer = () => {
    // Handle transfer initiation logic here
    console.log('Initiating transfer:', {
      fromChain: selectedFromChain,
      toChain: selectedToChain,
      amount: transferAmount,
      token: selectedToken
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cross-Rail Transfers</h1>
          <p className="text-gray-600 mt-1">Transfer assets between Base L2 and Solana networks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalVolume24h)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+15.2% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((completedTransfers / transfers.length) * 100)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedTransfers} of {transfers.length} completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg Transfer Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageTime)}s</div>
            <div className="text-xs text-gray-500 mt-1">
              Cross-chain completion
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transfers.filter(t => t.status === 'processing' || t.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Currently in progress
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chain Status */}
      <Card>
        <CardHeader>
          <CardTitle>Network Status</CardTitle>
          <CardDescription>Real-time status of connected blockchain networks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chainStatus.map((chain) => (
              <div key={chain.chain} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getChainIcon(chain.chain)}
                    <span className="font-semibold capitalize">{chain.chain} L2</span>
                  </div>
                  {getChainStatusBadge(chain.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Block Height</div>
                    <div className="font-medium">{chain.blockHeight.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Block Time</div>
                    <div className="font-medium">{chain.avgBlockTime}s</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Last Update</div>
                    <div className="font-medium">{formatTimeAgo(chain.lastUpdate)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Congestion</div>
                    <div className={`font-medium ${getCongestionColor(chain.congestion)}`}>
                      {chain.congestion}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transfer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transfer">New Transfer</TabsTrigger>
          <TabsTrigger value="history">Transfer History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Bridge Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Cross-Rail Transfer</CardTitle>
              <CardDescription>
                Transfer tokens between Base L2 and Solana networks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1">
                    <Label>From Chain</Label>
                    <Select value={selectedFromChain} onValueChange={setSelectedFromChain}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">Base L2</SelectItem>
                        <SelectItem value="solana">Solana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={swapChains}
                      className="p-2"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Label>To Chain</Label>
                    <Select value={selectedToChain} onValueChange={setSelectedToChain}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">Base L2</SelectItem>
                        <SelectItem value="solana">Solana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="token">Token</Label>
                    <Select value={selectedToken} onValueChange={setSelectedToken}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="USDXM">USDXM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Transfer Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-blue-700">Estimated Time</div>
                      <div className="font-medium">45-60 seconds</div>
                    </div>
                    <div>
                      <div className="text-blue-700">Bridge Fee</div>
                      <div className="font-medium">$25 USDC</div>
                    </div>
                    <div>
                      <div className="text-blue-700">Bridge Route</div>
                      <div className="font-medium">Circle CCTP</div>
                    </div>
                    <div>
                      <div className="text-blue-700">You'll Receive</div>
                      <div className="font-medium">
                        {transferAmount ? `${(parseFloat(transferAmount) - 25).toFixed(2)} ${selectedToken}` : '0.00 USDC'}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={initiateTransfer}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                  disabled={!transferAmount || parseFloat(transferAmount) <= 25}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Initiate Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>
                Recent cross-rail transfers and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transfers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {filteredTransfers.map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(transfer.status)}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          <span className="capitalize">{transfer.fromChain}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="capitalize">{transfer.toChain}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {transfer.id} • {formatTimeAgo(transfer.timestamp)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Route: {transfer.bridgeRoute}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {transfer.amount.toLocaleString()} {transfer.tokenSymbol}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(transfer.usdValue)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Fee: {formatCurrency(transfer.fee)}
                      </div>
                    </div>
                    <div className="text-center">
                      {transfer.actualTime && (
                        <div className="text-sm font-medium">
                          {transfer.actualTime}s
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Est: {transfer.estimatedTime}s
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(transfer.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Rail Analytics</CardTitle>
              <CardDescription>Bridge performance and usage metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Bridge Analytics</h3>
                <p className="text-gray-600">
                  Detailed analytics and performance metrics coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bridge Configuration</CardTitle>
              <CardDescription>Configure cross-rail bridge settings and parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Bridge Settings</h3>
                <p className="text-gray-600">
                  Advanced bridge configuration and settings coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}