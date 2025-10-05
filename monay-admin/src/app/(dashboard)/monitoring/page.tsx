'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Server,
  Database,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Pause,
  Play,
  Download,
  Bell,
  Wifi,
  WifiOff,
  Clock,
  BarChart3,
  Users,
  DollarSign,
  Shield,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, AreaChart, BarChart } from '@tremor/react';
import { superAdminService } from '@/services/super-admin.service';
import { useToast } from '@/components/ui/use-toast';

interface MetricStream {
  timestamp: number;
  value: number;
  label?: string;
}

interface SystemMetric {
  name: string;
  current: number;
  max: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  lastCheck: Date;
}

interface LiveTransaction {
  id: string;
  type: 'payment' | 'transfer' | 'mint' | 'burn';
  amount: number;
  currency: string;
  provider: 'tempo' | 'circle';
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  // Metrics states
  const [tpsData, setTpsData] = useState<MetricStream[]>([]);
  const [volumeData, setVolumeData] = useState<MetricStream[]>([]);
  const [latencyData, setLatencyData] = useState<MetricStream[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', current: 45, max: 100, unit: '%', status: 'healthy', trend: 'stable' },
    { name: 'Memory', current: 6.2, max: 16, unit: 'GB', status: 'healthy', trend: 'up' },
    { name: 'Disk I/O', current: 125, max: 500, unit: 'MB/s', status: 'healthy', trend: 'down' },
    { name: 'Network', current: 850, max: 1000, unit: 'Mbps', status: 'warning', trend: 'up' },
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Gateway', status: 'operational', latency: 45, uptime: 99.99, lastCheck: new Date() },
    { name: 'Database (PostgreSQL)', status: 'operational', latency: 12, uptime: 100, lastCheck: new Date() },
    { name: 'Redis Cache', status: 'operational', latency: 2, uptime: 99.98, lastCheck: new Date() },
    { name: 'Tempo Network', status: 'operational', latency: 95, uptime: 99.99, lastCheck: new Date() },
    { name: 'Circle API', status: 'degraded', latency: 250, uptime: 99.5, lastCheck: new Date() },
    { name: 'WebSocket Server', status: 'operational', latency: 5, uptime: 100, lastCheck: new Date() },
  ]);

  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>([]);
  const [activeUsers, setActiveUsers] = useState(3456);
  const [totalTPS, setTotalTPS] = useState(8523);
  const [errorRate, setErrorRate] = useState(0.02);

  // Animation interval
  const animationInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isLive) {
      connectWebSocket();
      startDataSimulation();
    } else {
      disconnectWebSocket();
      stopDataSimulation();
    }

    return () => {
      disconnectWebSocket();
      stopDataSimulation();
    };
  }, [isLive]);

  const connectWebSocket = () => {
    try {
      const websocket = superAdminService.subscribeToRealTimeUpdates();

      websocket.onopen = () => {
        setConnected(true);
        toast.success('Real-time monitoring active');
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealtimeData(data);
      };

      websocket.onerror = () => {
        setConnected(false);
        toast.error('Failed to connect to monitoring service');
      };

      websocket.onclose = () => {
        setConnected(false);
      };

      setWs(websocket);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close();
      setWs(null);
      setConnected(false);
    }
  };

  const startDataSimulation = () => {
    // Simulate real-time data updates
    animationInterval.current = setInterval(() => {
      const now = Date.now();

      // Update TPS data
      setTpsData(prev => {
        const newData = [...prev, {
          timestamp: now,
          value: Math.floor(Math.random() * 5000) + 7000,
          label: new Date(now).toLocaleTimeString(),
        }].slice(-30);
        return newData;
      });

      // Update volume data
      setVolumeData(prev => {
        const newData = [...prev, {
          timestamp: now,
          value: Math.floor(Math.random() * 50000) + 100000,
          label: new Date(now).toLocaleTimeString(),
        }].slice(-30);
        return newData;
      });

      // Update latency data
      setLatencyData(prev => {
        const newData = [...prev, {
          timestamp: now,
          value: Math.floor(Math.random() * 50) + 80,
          label: new Date(now).toLocaleTimeString(),
        }].slice(-30);
        return newData;
      });

      // Update system metrics
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        current: Math.min(
          metric.max,
          Math.max(0, metric.current + (Math.random() - 0.5) * 10)
        ),
      })));

      // Update live stats
      setActiveUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
      setTotalTPS(prev => Math.floor(Math.random() * 2000) + 7500);
      setErrorRate(Math.random() * 0.5);

      // Add random transaction
      if (Math.random() > 0.5) {
        const newTransaction: LiveTransaction = {
          id: `tx-${Date.now()}`,
          type: ['payment', 'transfer', 'mint', 'burn'][Math.floor(Math.random() * 4)] as any,
          amount: Math.floor(Math.random() * 10000),
          currency: ['USDC', 'USDT', 'PYUSD'][Math.floor(Math.random() * 3)],
          provider: Math.random() > 0.2 ? 'tempo' : 'circle',
          status: Math.random() > 0.95 ? 'failed' : 'completed',
          timestamp: new Date(),
        };

        setLiveTransactions(prev => [newTransaction, ...prev].slice(0, 10));
      }
    }, 1000);
  };

  const stopDataSimulation = () => {
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
    }
  };

  const handleRealtimeData = (data: any) => {
    // Handle real WebSocket data when connected
    console.log('Realtime data:', data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-500';
      case 'down':
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const MetricCard = ({ metric }: { metric: SystemMetric }) => {
    const percentage = (metric.current / metric.max) * 100;
    const isWarning = percentage > 80;
    const isCritical = percentage > 90;

    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{metric.name}</span>
            <Badge
              className={`
                ${isCritical ? 'bg-red-100 text-red-600' :
                isWarning ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'}
              `}
            >
              {metric.status}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold">
              {metric.current.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              / {metric.max} {metric.unit}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex items-center gap-1 mt-2">
            {metric.trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : metric.trend === 'down' ? (
              <TrendingDown className="w-3 h-3 text-red-600" />
            ) : (
              <Activity className="w-3 h-3 text-gray-600" />
            )}
            <span className="text-xs text-gray-500">
              {metric.trend === 'stable' ? 'Stable' : `Trending ${metric.trend}`}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Monitoring</h1>
          <p className="text-gray-600">Live system performance and metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Disconnected</span>
              </>
            )}
          </div>
          <Button
            onClick={() => setIsLive(!isLive)}
            variant={isLive ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            {isLive ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            )}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total TPS</p>
                <p className="text-2xl font-bold">
                  {totalTPS.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active Users</p>
                <p className="text-2xl font-bold">
                  {activeUsers.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {(100 - errorRate).toFixed(2)}%
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Error Rate</p>
                <p className="text-2xl font-bold">
                  {errorRate.toFixed(3)}%
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="transactions">Live Transactions</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TPS Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Transactions Per Second
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <LineChart
                    className="h-full"
                    data={tpsData.map(d => ({ time: d.label, tps: d.value }))}
                    index="time"
                    categories={["tps"]}
                    colors={["blue"]}
                    showAnimation={false}
                    showTooltip={true}
                    showGridLines={true}
                    curveType="monotone"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Transaction Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <AreaChart
                    className="h-full"
                    data={volumeData.map(d => ({ time: d.label, volume: d.value }))}
                    index="time"
                    categories={["volume"]}
                    colors={["green"]}
                    showAnimation={false}
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latency Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                API Latency (ms)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <LineChart
                  className="h-full"
                  data={latencyData.map(d => ({ time: d.label, latency: d.value }))}
                  index="time"
                  categories={["latency"]}
                  colors={["purple"]}
                  showAnimation={false}
                  showTooltip={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.name} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} animate-pulse`} />
                      <span className="font-medium">{service.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge variant={service.status === 'operational' ? 'success' : 'warning'}>
                        {service.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Latency</span>
                      <span className="font-medium">{service.latency}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium">{service.uptime}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Check</span>
                      <span className="text-xs">
                        {new Date(service.lastCheck).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Live Transaction Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <AnimatePresence>
                  {liveTransactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          tx.status === 'completed' ? 'bg-green-500' :
                          tx.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        } animate-pulse`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{tx.type.toUpperCase()}</span>
                            <Badge variant="secondary" className="text-xs">
                              {tx.provider}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {tx.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {tx.amount.toLocaleString()} {tx.currency}
                        </p>
                        <Badge
                          variant={
                            tx.status === 'completed' ? 'success' :
                            tx.status === 'failed' ? 'destructive' :
                            'warning'
                          }
                          className="text-xs"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {liveTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Waiting for transactions...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric) => (
              <MetricCard key={metric.name} metric={metric} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Load Balancer', region: 'US-East', status: 'healthy', load: 45 },
                  { name: 'Database Primary', region: 'US-East', status: 'healthy', load: 32 },
                  { name: 'Database Replica', region: 'US-West', status: 'healthy', load: 28 },
                  { name: 'Redis Cluster', region: 'Global', status: 'healthy', load: 67 },
                  { name: 'CDN', region: 'Global', status: 'healthy', load: 23 },
                ].map((infra) => (
                  <div key={infra.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{infra.name}</p>
                        <p className="text-xs text-gray-500">{infra.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{infra.load}%</p>
                        <p className="text-xs text-gray-500">Load</p>
                      </div>
                      <Badge className="bg-green-100 text-green-600">
                        {infra.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}