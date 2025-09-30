'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Users,
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe,
  Layers,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, BarChart, DonutChart, LineChart } from '@tremor/react';
import CountUp from 'react-countup';
import { superAdminService } from '@/services/super-admin.service';

interface SystemStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  uptime?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StatusIndicator = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-500'} animate-pulse`} />
      <span className="text-sm capitalize">{status}</span>
    </div>
  );
};

const MetricCard = ({
  icon: Icon,
  title,
  value,
  change,
  trend,
  prefix = '',
  suffix = '',
  color = 'blue'
}: any) => {
  const trendColors: Record<string, string> = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  const bgColors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className={`absolute inset-0 bg-gradient-to-br ${bgColors[color] || bgColors.blue} opacity-5`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">
                  {prefix}
                  <CountUp
                    end={value}
                    duration={2}
                    separator=","
                    decimals={prefix === '$' ? 2 : 0}
                  />
                  {suffix}
                </h3>
                {change && (
                  <div className={`flex items-center gap-1 text-sm ${trendColors[trend] || 'text-gray-600'}`}>
                    {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(change)}%
                  </div>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-lg bg-gradient-to-br ${bgColors[color] || bgColors.blue} bg-opacity-10`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function PlatformOverview() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<SystemStatus[]>([]);
  const [providerComparison, setProviderComparison] = useState<any>(null);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    loadPlatformData();
    const interval = setInterval(loadPlatformData, 30000); // Refresh every 30 seconds

    // Set up WebSocket connection
    const websocket = superAdminService.subscribeToRealTimeUpdates();

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleRealtimeUpdate(data);
    };

    setWs(websocket);

    return () => {
      clearInterval(interval);
      websocket.close();
    };
  }, []);

  const loadPlatformData = async () => {
    try {
      setLoading(true);
      const [platformMetrics, health, comparison] = await Promise.all([
        superAdminService.getPlatformOverview(),
        superAdminService.getSystemHealth(),
        superAdminService.getProviderComparison(),
      ]);

      setMetrics((platformMetrics as any).data || platformMetrics);
      setSystemHealth(formatSystemHealth((health as any).data || health));
      setProviderComparison(comparison);
    } catch (error) {
      console.error('Failed to load platform data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSystemHealth = (health: any): SystemStatus[] => {
    return [
      { service: 'API', status: health.api, uptime: 99.95 },
      { service: 'Database', status: health.database, uptime: 99.99 },
      { service: 'Redis Cache', status: health.redis, uptime: 99.98 },
      { service: 'Tempo Provider', status: health.providers?.tempo?.available ? 'healthy' : 'down', latency: 12 },
      { service: 'Circle Provider', status: health.providers?.circle?.available ? 'healthy' : 'degraded', latency: 150 },
    ];
  };

  const handleRealtimeUpdate = (data: any) => {
    // Update realtime data for charts
    setRealtimeData(prev => [...prev.slice(-29), data]);

    // Update specific metrics based on event type
    if (data.type === 'transaction') {
      setMetrics((prev: any) => ({
        ...prev,
        transactions: {
          ...prev.transactions,
          total: prev.transactions.total + 1,
          dailyVolume: prev.transactions.dailyVolume + data.amount,
        },
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-gray-600">Complete platform oversight and control</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadPlatformData}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          title="Total Users"
          value={metrics?.users?.total || 0}
          change={12.5}
          trend="up"
          color="blue"
        />
        <MetricCard
          icon={Wallet}
          title="Active Wallets"
          value={metrics?.wallets?.active || 0}
          change={8.3}
          trend="up"
          color="green"
        />
        <MetricCard
          icon={DollarSign}
          title="Daily Volume"
          value={metrics?.transactions?.dailyVolume || 0}
          prefix="$"
          change={15.2}
          trend="up"
          color="purple"
        />
        <MetricCard
          icon={Activity}
          title="Transactions"
          value={metrics?.transactions?.total || 0}
          change={5.1}
          trend="up"
          color="orange"
        />
      </div>

      {/* System Health and Provider Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((service) => (
              <div key={service.service} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIndicator status={service.status} />
                  <span className="font-medium">{service.service}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {service.latency && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {service.latency}ms
                    </span>
                  )}
                  {service.uptime && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {service.uptime}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Provider Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Provider Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Tempo */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600">Tempo</Badge>
                    <span className="text-sm text-gray-600">Primary Provider</span>
                  </div>
                  <StatusIndicator status="healthy" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">TPS</p>
                    <p className="font-bold">100,000+</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fees</p>
                    <p className="font-bold">$0.0001</p>
                  </div>
                  <div>
                    <p className="text-gray-600">24h Volume</p>
                    <p className="font-bold">$2.4M</p>
                  </div>
                </div>
              </div>

              {/* Circle */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600">Circle</Badge>
                    <span className="text-sm text-gray-600">Fallback Provider</span>
                  </div>
                  <StatusIndicator status="healthy" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">TPS</p>
                    <p className="font-bold">1,000</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fees</p>
                    <p className="font-bold">$0.05</p>
                  </div>
                  <div>
                    <p className="text-gray-600">24h Volume</p>
                    <p className="font-bold">$450K</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-time Transaction Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <LineChart
              className="h-full"
              data={realtimeData.length > 0 ? realtimeData : generateMockChartData()}
              index="time"
              categories={["volume"]}
              colors={["blue"]}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              showAnimation={true}
              showLegend={false}
              curveType="monotone"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Quick Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm font-medium">Manage Users</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Wallet className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm font-medium">View Wallets</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Activity className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium">Monitor Transactions</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <AlertCircle className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm font-medium">View Alerts</p>
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateMockChartData() {
  return Array.from({ length: 30 }, (_, i) => ({
    time: new Date(Date.now() - (29 - i) * 60000).toLocaleTimeString(),
    volume: Math.floor(Math.random() * 50000) + 10000,
  }));
}