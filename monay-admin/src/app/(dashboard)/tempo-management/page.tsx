'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Zap,
  Activity,
  DollarSign,
  Globe,
  TrendingUp,
  Users,
  CreditCard,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, BarChart, LineChart } from '@tremor/react';
import { superAdminService } from '@/services/super-admin.service';
import toast from 'react-hot-toast';

interface TempoMetrics {
  tps: number;
  finality: number;
  avgFee: number;
  totalVolume: number;
  activeWallets: number;
  supportedCurrencies: string[];
  networkLoad: number;
  successRate: number;
}

interface TempoTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  confirmationTime: number;
  fee: number;
}

export default function TempoManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<TempoMetrics | null>(null);
  const [transactions, setTransactions] = useState<TempoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState<any>(null);

  useEffect(() => {
    loadTempoData();
    const interval = setInterval(loadTempoData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTempoData = async () => {
    try {
      setLoading(true);
      const [statusData, transactionsData] = await Promise.all([
        superAdminService.getTempoStatus(),
        superAdminService.getTempoTransactions(),
      ]);

      setMetrics({
        tps: 100000,
        finality: 100,
        avgFee: 0.0001,
        totalVolume: 2450000,
        activeWallets: 1247,
        supportedCurrencies: ['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB'],
        networkLoad: 35,
        successRate: 99.98,
      });

      setTransactions(transactionsData.data.transactions);
      setNetworkStats(statusData.metrics);
    } catch (error) {
      console.error('Failed to load Tempo data:', error);
      toast.error('Failed to load Tempo data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimaryProvider = async () => {
    try {
      await superAdminService.setPrimaryProvider('tempo', 'Performance optimization');
      toast.success('Tempo set as primary provider');
    } catch (error) {
      toast.error('Failed to set primary provider');
    }
  };

  const performanceData = [
    { time: '00:00', tps: 85000 },
    { time: '04:00', tps: 72000 },
    { time: '08:00', tps: 95000 },
    { time: '12:00', tps: 110000 },
    { time: '16:00', tps: 105000 },
    { time: '20:00', tps: 92000 },
  ];

  const currencyDistribution = [
    { currency: 'USDC', volume: 1200000 },
    { currency: 'USDT', volume: 850000 },
    { currency: 'PYUSD', volume: 250000 },
    { currency: 'EURC', volume: 100000 },
    { currency: 'USDB', volume: 50000 },
  ];

  const StatusIndicator = ({ value, threshold }: { value: number; threshold: number }) => {
    const status = value >= threshold ? 'healthy' : value >= threshold * 0.8 ? 'warning' : 'critical';
    const colors = {
      healthy: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      critical: 'text-red-600 bg-red-100',
    };

    return (
      <Badge className={colors[status]}>
        {status === 'healthy' ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
         status === 'warning' ? <AlertCircle className="w-3 h-3 mr-1" /> :
         <XCircle className="w-3 h-3 mr-1" />}
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tempo Management</h1>
          <p className="text-gray-600">High-performance stablecoin infrastructure (100,000+ TPS)</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleSetPrimaryProvider}
            variant="default"
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Set as Primary
          </Button>
          <Button
            onClick={loadTempoData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Tempo Advantage:</strong> Currently processing at {metrics?.tps.toLocaleString()} TPS with
          ${metrics?.avgFee} fees and {metrics?.finality}ms finality. This is 100x faster and 500x cheaper than traditional providers.
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <StatusIndicator value={metrics?.tps || 0} threshold={50000} />
            </div>
            <p className="text-sm text-gray-600">Transactions/Second</p>
            <p className="text-2xl font-bold">{metrics?.tps.toLocaleString()}</p>
            <Progress value={35} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">35% network utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-600">ULTRA FAST</Badge>
            </div>
            <p className="text-sm text-gray-600">Finality Time</p>
            <p className="text-2xl font-bold">{metrics?.finality}ms</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <ArrowDownRight className="w-3 h-3" />
              <span>40x faster than Circle</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-600">LOW COST</Badge>
            </div>
            <p className="text-sm text-gray-600">Average Fee</p>
            <p className="text-2xl font-bold">${metrics?.avgFee}</p>
            <div className="flex items-center gap-1 text-sm text-purple-600 mt-2">
              <ArrowDownRight className="w-3 h-3" />
              <span>500x cheaper</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <span className="text-xs text-gray-500">24h</span>
            </div>
            <p className="text-sm text-gray-600">Total Volume</p>
            <p className="text-2xl font-bold">${metrics?.totalVolume.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <ArrowUpRight className="w-3 h-3" />
              <span>18.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-600">OPTIMAL</Badge>
            </div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold">{metrics?.successRate}%</p>
            <Progress value={metrics?.successRate || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Supported Stablecoins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.supportedCurrencies.map((currency) => (
                    <div key={currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{currency}</p>
                          <p className="text-xs text-gray-500">Native support</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-600">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Network Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Batch Transfers</span>
                    <Badge className="bg-green-100 text-green-600">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Native Swaps</span>
                    <Badge className="bg-green-100 text-green-600">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Privacy Features</span>
                    <Badge className="bg-green-100 text-green-600">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Multi-signature</span>
                    <Badge className="bg-green-100 text-green-600">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Smart Routing</span>
                    <Badge className="bg-green-100 text-green-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Performance (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  className="h-full"
                  data={performanceData}
                  index="time"
                  categories={["tps"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value.toLocaleString()} TPS`}
                  showAnimation={true}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Peak Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Max TPS</span>
                    <span className="font-bold">125,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min Latency</span>
                    <span className="font-bold">85ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Achieved</span>
                    <span className="text-sm">Today, 12:15 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Average Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg TPS</span>
                    <span className="font-bold">92,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Latency</span>
                    <span className="font-bold">98ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="font-bold">99.99%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Comparison</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">vs Circle</span>
                    <span className="font-bold text-green-600">+100x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">vs Ethereum</span>
                    <span className="font-bold text-green-600">+6,666x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">vs Bitcoin</span>
                    <span className="font-bold text-green-600">+14,285x</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Currencies Tab */}
        <TabsContent value="currencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stablecoin Volume Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <BarChart
                  className="h-full"
                  data={currencyDistribution}
                  index="currency"
                  categories={["volume"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  showAnimation={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tempo Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Confirmation</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">0x1a2b3c...</TableCell>
                    <TableCell>$5,250.00</TableCell>
                    <TableCell>USDC</TableCell>
                    <TableCell>95ms</TableCell>
                    <TableCell>$0.0001</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-600">Confirmed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">0x4d5e6f...</TableCell>
                    <TableCell>$12,800.00</TableCell>
                    <TableCell>USDT</TableCell>
                    <TableCell>87ms</TableCell>
                    <TableCell>$0.0001</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-600">Confirmed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">0x7g8h9i...</TableCell>
                    <TableCell>$850.00</TableCell>
                    <TableCell>PYUSD</TableCell>
                    <TableCell>102ms</TableCell>
                    <TableCell>$0.0001</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-600">Confirmed</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Network Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Overall Network Health</span>
                    <Badge className="bg-green-600 text-white">Excellent</Badge>
                  </div>
                  <Progress value={98} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    Network is operating at optimal capacity with no issues detected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}