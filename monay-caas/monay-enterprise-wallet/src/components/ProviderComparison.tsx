'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiService from '@/services/api.service';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Zap,
  DollarSign,
  Globe,
  Shield,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  Users,
  CreditCard,
  Cpu,
  GitBranch,
  Target
} from 'lucide-react';

interface ProviderMetrics {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  tps: number;
  latency: number;
  fee: number;
  currencies: string[];
  uptime: number;
  transactions: number;
  volume: number;
  successRate: number;
}

const COLORS = {
  tempo: '#3B82F6',
  circle: '#10B981',
  monay: '#8B5CF6'
};

export default function ProviderComparison() {
  const [providers, setProviders] = useState<ProviderMetrics[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<any[]>([]);
  const [routingStats, setRoutingStats] = useState<any>({});

  useEffect(() => {
    fetchProviderData();
    const interval = setInterval(fetchProviderData, 30000);
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const generateMockPerformanceData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      tempo: Math.floor(Math.random() * 20000 + 80000),
      circle: Math.floor(Math.random() * 200 + 800),
      monay: 0
    }));
  };

  const generateMockCostAnalysis = () => {
    return [
      { volume: '1K', tempo: 0.1, circle: 50, monay: 0.01 },
      { volume: '10K', tempo: 1, circle: 500, monay: 0.1 },
      { volume: '100K', tempo: 10, circle: 5000, monay: 1 },
      { volume: '1M', tempo: 100, circle: 50000, monay: 10 }
    ];
  };

  const generateMockRoutingStats = () => {
    return {
      totalRequests: 1700000,
      tempoRouted: 1250000,
      circleRouted: 450000,
      failovers: 125,
      avgRoutingTime: 2.3
    };
  };

  const fetchProviderData = async () => {
    try {
      // Try to fetch from API
      const data = await apiService.getProviderMetrics() as any;
      if (data && data.providers) {
        setProviders(data.providers);
        setPerformanceData(data.performanceHistory || generateMockPerformanceData());
        setCostAnalysis(data.costAnalysis || generateMockCostAnalysis());
        setRoutingStats(data.routingStats || generateMockRoutingStats());
        return;
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
      toast({
        title: "Using demo data",
        description: "Connected with sample provider metrics",
      });
    }

    // Fallback to mock data
    const mockProviders: ProviderMetrics[] = [
      {
        name: 'Tempo',
        status: 'operational',
        tps: 100000,
        latency: 50,
        fee: 0.0001,
        currencies: ['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB'],
        uptime: 99.99,
        transactions: 1250000,
        volume: 50000000,
        successRate: 99.8
      },
      {
        name: 'Circle',
        status: 'operational',
        tps: 1000,
        latency: 2000,
        fee: 0.05,
        currencies: ['USDC'],
        uptime: 99.5,
        transactions: 450000,
        volume: 25000000,
        successRate: 98.5
      },
      {
        name: 'Monay (Future)',
        status: 'down',
        tps: 200000,
        latency: 25,
        fee: 0.00001,
        currencies: ['MUSDC', 'USDC', 'USDT', 'PYUSD', 'EURC'],
        uptime: 0,
        transactions: 0,
        volume: 0,
        successRate: 0
      }
    ];

    setProviders(mockProviders);

    // Generate performance timeline data
    const perfData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      tempo: Math.floor(Math.random() * 20000 + 80000),
      circle: Math.floor(Math.random() * 200 + 800),
      monay: 0
    }));
    setPerformanceData(perfData);

    // Cost analysis data
    const costData = [
      { volume: '1K', tempo: 0.1, circle: 50, monay: 0.01 },
      { volume: '10K', tempo: 1, circle: 500, monay: 0.1 },
      { volume: '100K', tempo: 10, circle: 5000, monay: 1 },
      { volume: '1M', tempo: 100, circle: 50000, monay: 10 }
    ];
    setCostAnalysis(costData);

    // Routing statistics
    setRoutingStats({
      totalRequests: 1700000,
      tempoRouted: 1250000,
      circleRouted: 450000,
      failovers: 125,
      avgRoutingTime: 2.3
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const radarData = providers
    .filter(p => p.status !== 'down')
    .map(provider => ({
      provider: provider.name,
      TPS: (provider.tps / 1000),
      'Low Fees': provider.fee < 0.01 ? 100 : provider.fee < 0.1 ? 50 : 10,
      Currencies: provider.currencies.length * 20,
      Uptime: provider.uptime,
      'Low Latency': provider.latency < 100 ? 100 : provider.latency < 1000 ? 50 : 10
    }));

  const pieData = [
    { name: 'Tempo', value: routingStats.tempoRouted || 0 },
    { name: 'Circle', value: routingStats.circleRouted || 0 }
  ].filter(d => d.value > 0);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <GitBranch className="mr-3 h-8 w-8 text-blue-600" />
          Provider Comparison Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time comparison of stablecoin infrastructure providers
        </p>
      </div>

      {/* Provider Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {providers.map((provider) => (
          <Card key={provider.name} className={provider.status === 'down' ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{provider.name}</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(provider.status)}
                  <Badge
                    variant={
                      provider.name === 'Tempo' ? 'default' :
                      provider.name === 'Circle' ? 'secondary' :
                      'outline'
                    }
                  >
                    {provider.name === 'Tempo' ? 'PRIMARY' :
                     provider.name === 'Circle' ? 'FALLBACK' :
                     'FUTURE'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">TPS Capacity</p>
                  <p className="font-bold text-lg">{provider.tps.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Fee</p>
                  <p className="font-bold text-lg">${provider.fee}</p>
                </div>
                <div>
                  <p className="text-gray-500">Latency</p>
                  <p className="font-bold text-lg">{provider.latency}ms</p>
                </div>
                <div>
                  <p className="text-gray-500">Uptime</p>
                  <p className="font-bold text-lg">{provider.uptime}%</p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Supported Currencies</p>
                <div className="flex flex-wrap gap-1">
                  {provider.currencies.map(currency => (
                    <Badge key={currency} variant="outline" className="text-xs">
                      {currency}
                    </Badge>
                  ))}
                </div>
              </div>
              {provider.status === 'operational' && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Success Rate</span>
                    <span>{provider.successRate}%</span>
                  </div>
                  <Progress value={provider.successRate} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Routing Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Intelligent Routing Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold">{(routingStats.totalRequests / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tempo Routed</p>
              <p className="text-2xl font-bold text-blue-600">
                {((routingStats.tempoRouted / routingStats.totalRequests) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Circle Fallback</p>
              <p className="text-2xl font-bold text-green-600">
                {((routingStats.circleRouted / routingStats.totalRequests) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Failovers</p>
              <p className="text-2xl font-bold">{routingStats.failovers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Routing Time</p>
              <p className="text-2xl font-bold">{routingStats.avgRoutingTime}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>TPS Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tempo" stroke={COLORS.tempo} name="Tempo" strokeWidth={2} />
                  <Line type="monotone" dataKey="circle" stroke={COLORS.circle} name="Circle" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost">
          <Card>
            <CardHeader>
              <CardTitle>Cost Comparison by Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="volume" />
                  <YAxis scale="log" domain={[0.01, 100000]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tempo" fill={COLORS.tempo} name="Tempo" />
                  <Bar dataKey="circle" fill={COLORS.circle} name="Circle" />
                  <Bar dataKey="monay" fill={COLORS.monay} name="Monay (Future)" />
                </BarChart>
              </ResponsiveContainer>
              <Alert className="mt-4">
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  Tempo offers 500x cost savings compared to Circle for high-volume transactions
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities">
          <Card>
            <CardHeader>
              <CardTitle>Provider Capabilities Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="provider" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Tempo" dataKey="Tempo" stroke={COLORS.tempo} fill={COLORS.tempo} fillOpacity={0.6} />
                  <Radar name="Circle" dataKey="Circle" stroke={COLORS.circle} fill={COLORS.circle} fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Volume by Provider</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div className="flex items-center">
                        <Zap className="h-5 w-5 text-blue-600 mr-2" />
                        <span>Tempo Advantage</span>
                      </div>
                      <span className="font-bold">100x TPS</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                        <span>Cost Savings</span>
                      </div>
                      <span className="font-bold">99.8% Lower</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-purple-600 mr-2" />
                        <span>Finality Speed</span>
                      </div>
                      <span className="font-bold">40x Faster</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Strategic Vision */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Strategic Evolution Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Current: Tempo Primary (2025)</h4>
                <p className="text-sm text-gray-600">100,000+ TPS, multi-stablecoin, near-zero fees</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Backup: Circle Fallback</h4>
                <p className="text-sm text-gray-600">USDC operations, proven reliability, risk mitigation</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Future: Monay Chain (2026-2027)</h4>
                <p className="text-sm text-gray-600">200,000+ TPS, full control, proprietary infrastructure</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}