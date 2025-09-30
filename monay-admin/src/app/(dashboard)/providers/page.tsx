'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  DollarSign,
  Activity,
  TrendingUp,
  Globe,
  Layers,
  Shield,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  BarChart3,
  ArrowRight,
  Star,
} from 'lucide-react';
import {
  LineChart,
  BarChart,
  DonutChart,
  AreaChart,
} from '@tremor/react';
import { motion } from 'framer-motion';
import { superAdminService } from '@/services/super-admin.service';
import { useToast } from '@/components/ui/use-toast';

interface ProviderMetrics {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  tps: number;
  maxTps: number;
  avgFee: number;
  finality: number;
  volume24h: number;
  activeWallets: number;
  successRate: number;
  supportedCurrencies: string[];
  features: string[];
  isPrimary: boolean;
}

const ComparisonCard = ({ title, tempo, circle, unit = '', better = 'higher' }: any) => {
  const tempoWins = better === 'higher' ? tempo > circle : tempo < circle;
  const improvement = Math.abs(((tempo - circle) / circle) * 100);

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className={`${tempoWins ? 'order-1' : 'order-2'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-blue-600 font-medium">TEMPO</span>
            {tempoWins && <Star className="w-3 h-3 text-yellow-500" />}
          </div>
          <p className="text-xl font-bold">
            {typeof tempo === 'number' ? tempo.toLocaleString() : tempo}{unit}
          </p>
        </div>
        <div className={`${!tempoWins ? 'order-1' : 'order-2'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-purple-600 font-medium">CIRCLE</span>
            {!tempoWins && <Star className="w-3 h-3 text-yellow-500" />}
          </div>
          <p className="text-xl font-bold">
            {typeof circle === 'number' ? circle.toLocaleString() : circle}{unit}
          </p>
        </div>
      </div>
      {improvement > 0 && tempoWins && (
        <div className="mt-2 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3 text-green-600" />
          <span className="text-xs text-green-600">
            {improvement.toFixed(0)}x {better === 'higher' ? 'better' : 'faster'}
          </span>
        </div>
      )}
    </div>
  );
};

export default function ProvidersPage() {
  const [activeTab, setActiveTab] = useState('comparison');
  const [providers, setProviders] = useState<{ tempo: ProviderMetrics; circle: ProviderMetrics } | null>(null);
  const [loading, setLoading] = useState(true);
  const [primaryProvider, setPrimaryProvider] = useState<'tempo' | 'circle'>('tempo');
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [targetProvider, setTargetProvider] = useState<'tempo' | 'circle' | null>(null);
  const [switchReason, setSwitchReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProviderData();
    const interval = setInterval(loadProviderData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadProviderData = async () => {
    try {
      setLoading(true);
      const comparison = await superAdminService.getProviderComparison();

      setProviders({
        tempo: {
          name: 'Tempo',
          status: 'healthy',
          tps: 100000,
          maxTps: 150000,
          avgFee: 0.0001,
          finality: 100,
          volume24h: 2450000,
          activeWallets: 1247,
          successRate: 99.98,
          supportedCurrencies: ['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB'],
          features: ['Batch Transfers', 'Native Swaps', 'Privacy', 'Multi-sig'],
          isPrimary: primaryProvider === 'tempo',
        },
        circle: {
          name: 'Circle',
          status: 'healthy',
          tps: 1000,
          maxTps: 1500,
          avgFee: 0.05,
          finality: 4000,
          volume24h: 450000,
          activeWallets: 892,
          successRate: 99.5,
          supportedCurrencies: ['USDC'],
          features: ['Mint/Burn', 'Bank Integration'],
          isPrimary: primaryProvider === 'circle',
        },
      });
    } catch (error) {
      console.error('Failed to load provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchProvider = (provider: 'tempo' | 'circle') => {
    setTargetProvider(provider);
    setSwitchReason('');
    setConfirmText('');
    setShowSwitchModal(true);
  };

  const confirmProviderSwitch = async () => {
    if (!targetProvider || !switchReason || confirmText !== 'CONFIRM') {
      toast.error('Please fill all required fields and type CONFIRM');
      return;
    }

    setIsSwitching(true);
    try {
      await superAdminService.setPrimaryProvider(targetProvider, switchReason);
      setPrimaryProvider(targetProvider);
      toast.success(`${targetProvider === 'tempo' ? 'Tempo' : 'Circle'} is now the primary provider`);
      setShowSwitchModal(false);
      await loadProviderData();
    } catch (error) {
      toast.error('Failed to switch provider. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  const radarData = [
    { metric: 'Speed (TPS)', tempo: 100, circle: 1, max: 100 },
    { metric: 'Cost Efficiency', tempo: 99, circle: 20, max: 100 },
    { metric: 'Finality Speed', tempo: 98, circle: 25, max: 100 },
    { metric: 'Currency Support', tempo: 100, circle: 20, max: 100 },
    { metric: 'Features', tempo: 90, circle: 40, max: 100 },
    { metric: 'Reliability', tempo: 99, circle: 99, max: 100 },
  ];

  const volumeTrend = [
    { time: '00:00', tempo: 85000, circle: 15000 },
    { time: '04:00', tempo: 72000, circle: 12000 },
    { time: '08:00', tempo: 95000, circle: 18000 },
    { time: '12:00', tempo: 110000, circle: 22000 },
    { time: '16:00', tempo: 105000, circle: 20000 },
    { time: '20:00', tempo: 92000, circle: 17000 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Provider Comparison & Management</h1>
          <p className="text-gray-600">Compare and manage stablecoin infrastructure providers</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={loadProviderData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Primary Provider Alert */}
      <Alert className={`border-2 ${primaryProvider === 'tempo' ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50'}`}>
        <Zap className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            <strong>{primaryProvider === 'tempo' ? 'Tempo' : 'Circle'}</strong> is currently the primary provider.
            {primaryProvider === 'tempo' && ' Processing at 100,000+ TPS with $0.0001 fees.'}
            {primaryProvider === 'circle' && ' Processing at 1,000 TPS with $0.05 fees.'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSwitchProvider(primaryProvider === 'tempo' ? 'circle' : 'tempo')}
          >
            Switch to {primaryProvider === 'tempo' ? 'Circle' : 'Tempo'}
          </Button>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {/* Head-to-head comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tempo Card */}
            <Card className={`relative ${primaryProvider === 'tempo' ? 'ring-2 ring-blue-500' : ''}`}>
              {primaryProvider === 'tempo' && (
                <div className="absolute -top-3 -right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  PRIMARY
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span>Tempo</span>
                  </div>
                  <Badge className="bg-green-100 text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Healthy
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Throughput</p>
                    <p className="text-2xl font-bold">100,000+ TPS</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Fee</p>
                    <p className="text-2xl font-bold">$0.0001</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Finality</p>
                    <p className="text-2xl font-bold">100ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">24h Volume</p>
                    <p className="text-2xl font-bold">$2.45M</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Supported Currencies (5)</p>
                  <div className="flex flex-wrap gap-2">
                    {['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB'].map(currency => (
                      <Badge key={currency} variant="secondary">{currency}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Network Load</p>
                  <Progress value={35} className="mb-1" />
                  <p className="text-xs text-gray-500">35% capacity utilized</p>
                </div>

                {primaryProvider !== 'tempo' && (
                  <Button
                    className="w-full"
                    onClick={() => handleSwitchProvider('tempo')}
                  >
                    Set as Primary Provider
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Circle Card */}
            <Card className={`relative ${primaryProvider === 'circle' ? 'ring-2 ring-purple-500' : ''}`}>
              {primaryProvider === 'circle' && (
                <div className="absolute -top-3 -right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  PRIMARY
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <span>Circle</span>
                  </div>
                  <Badge className="bg-green-100 text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Healthy
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Throughput</p>
                    <p className="text-2xl font-bold">1,000 TPS</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Fee</p>
                    <p className="text-2xl font-bold">$0.05</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Finality</p>
                    <p className="text-2xl font-bold">4s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">24h Volume</p>
                    <p className="text-2xl font-bold">$450K</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Supported Currencies (1)</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">USDC</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Network Load</p>
                  <Progress value={65} className="mb-1" />
                  <p className="text-xs text-gray-500">65% capacity utilized</p>
                </div>

                {primaryProvider !== 'circle' && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleSwitchProvider('circle')}
                  >
                    Set as Primary Provider
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Direct Comparisons */}
          <Card>
            <CardHeader>
              <CardTitle>Head-to-Head Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ComparisonCard
                  title="Transactions Per Second"
                  tempo={100000}
                  circle={1000}
                  unit=" TPS"
                  better="higher"
                />
                <ComparisonCard
                  title="Transaction Fee"
                  tempo={0.0001}
                  circle={0.05}
                  unit="$"
                  better="lower"
                />
                <ComparisonCard
                  title="Finality Time"
                  tempo={100}
                  circle={4000}
                  unit="ms"
                  better="lower"
                />
                <ComparisonCard
                  title="Daily Volume"
                  tempo={2450000}
                  circle={450000}
                  unit="$"
                  better="higher"
                />
                <ComparisonCard
                  title="Active Wallets"
                  tempo={1247}
                  circle={892}
                  unit=""
                  better="higher"
                />
                <ComparisonCard
                  title="Success Rate"
                  tempo={99.98}
                  circle={99.5}
                  unit="%"
                  better="higher"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume Comparison (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  className="h-full"
                  data={volumeTrend}
                  index="time"
                  categories={["tempo", "circle"]}
                  colors={["blue", "purple"]}
                  valueFormatter={(value) => `${value.toLocaleString()} tx`}
                  showAnimation={true}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tempo Performance</span>
                      <Badge className="bg-green-100 text-green-600">Optimal</Badge>
                    </div>
                    <Progress value={98} className="mb-1" />
                    <p className="text-xs text-gray-500">98% efficiency</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Circle Performance</span>
                      <Badge className="bg-yellow-100 text-yellow-600">Good</Badge>
                    </div>
                    <Progress value={75} className="mb-1" />
                    <p className="text-xs text-gray-500">75% efficiency</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uptime Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Tempo</p>
                      <p className="text-sm text-gray-600">Last 30 days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">99.99%</p>
                      <p className="text-xs text-gray-500">2 min downtime</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">Circle</p>
                      <p className="text-sm text-gray-600">Last 30 days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">99.95%</p>
                      <p className="text-xs text-gray-500">22 min downtime</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Comparison Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">For 10,000 Transactions</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-blue-600">Tempo</p>
                        <p className="text-xl font-bold">$1.00</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600">Circle</p>
                        <p className="text-xl font-bold">$500.00</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">For 100,000 Transactions</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-blue-600">Tempo</p>
                        <p className="text-xl font-bold">$10.00</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600">Circle</p>
                        <p className="text-xl font-bold">$5,000.00</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Savings with Tempo</p>
                    <p className="text-2xl font-bold text-green-600">$49,990</p>
                    <p className="text-xs text-gray-500">Based on 1M transactions</p>
                  </div>
                </div>

                <Alert className="border-green-200 bg-green-50">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Cost Advantage:</strong> Tempo is 500x cheaper than Circle for transaction fees.
                    At scale, this results in millions in savings annually.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { feature: 'Multi-currency Support', tempo: true, circle: false },
                  { feature: 'Batch Transfers', tempo: true, circle: false },
                  { feature: 'Native Swaps', tempo: true, circle: false },
                  { feature: 'Privacy Features', tempo: true, circle: false },
                  { feature: 'Multi-signature', tempo: true, circle: true },
                  { feature: 'Mint/Burn USDC', tempo: false, circle: true },
                  { feature: 'Bank Integration', tempo: false, circle: true },
                  { feature: 'Sub-second Finality', tempo: true, circle: false },
                  { feature: '100K+ TPS', tempo: true, circle: false },
                  { feature: 'Enterprise Support', tempo: true, circle: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{item.feature}</span>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600">Tempo</span>
                        {item.tempo ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-600">Circle</span>
                        {item.circle ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Provider Switch Modal */}
      <Dialog open={showSwitchModal} onOpenChange={setShowSwitchModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Switch Primary Provider</DialogTitle>
            <DialogDescription>
              You are about to switch the primary stablecoin provider from{' '}
              <strong>{primaryProvider === 'tempo' ? 'Tempo' : 'Circle'}</strong> to{' '}
              <strong>{targetProvider === 'tempo' ? 'Tempo' : 'Circle'}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Impact Analysis */}
            <div className="space-y-4">
              <h3 className="font-semibold">Impact Analysis</h3>

              {targetProvider === 'tempo' ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">Performance Improvement</p>
                        <p className="text-sm text-green-700">100x faster transactions (100,000+ TPS vs 1,000 TPS)</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">Cost Reduction</p>
                        <p className="text-sm text-green-700">500x cheaper fees ($0.0001 vs $0.05 per transaction)</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">Enhanced Features</p>
                        <p className="text-sm text-green-700">Multi-currency support, batch transfers, native swaps</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-800">Performance Impact</p>
                        <p className="text-sm text-yellow-700">100x slower (1,000 TPS vs 100,000+ TPS)</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-800">Cost Increase</p>
                        <p className="text-sm text-yellow-700">500x higher fees ($0.05 vs $0.0001 per transaction)</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-800">Bank Integration</p>
                        <p className="text-sm text-blue-700">Direct USDC mint/burn capabilities with Circle</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Database Safety Warning */}
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Database Safety:</strong> This operation will UPDATE the provider configuration
                in the database. No data will be deleted or purged. All transaction history and
                provider metrics will be preserved.
              </AlertDescription>
            </Alert>

            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Switch *</Label>
              <Textarea
                id="reason"
                placeholder="Enter a detailed reason for switching providers (e.g., performance optimization, cost reduction, feature requirements)..."
                value={switchReason}
                onChange={(e) => setSwitchReason(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-gray-500">
                This reason will be logged for audit purposes
              </p>
            </div>

            {/* Active Transactions Warning */}
            <Alert className="border-blue-200 bg-blue-50">
              <Activity className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Active Transactions:</strong> Currently processing transactions will complete
                with the current provider. New transactions will use the new provider after switching.
                Estimated switch completion: ~5 seconds.
              </AlertDescription>
            </Alert>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Type "CONFIRM" to proceed *</Label>
              <Input
                id="confirm"
                type="text"
                placeholder="Type CONFIRM to switch provider"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={confirmText === 'CONFIRM' ? 'border-green-500' : ''}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSwitchModal(false)}
              disabled={isSwitching}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmProviderSwitch}
              disabled={isSwitching || !switchReason || confirmText !== 'CONFIRM'}
              className={targetProvider === 'tempo' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}
            >
              {isSwitching ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                <>Switch to {targetProvider === 'tempo' ? 'Tempo' : 'Circle'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}