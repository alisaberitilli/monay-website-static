'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface Provider {
  name: string;
  status: string;
  latency: string;
  errorRate: string;
  successRate: string;
  currentTPS: number;
  lastCheck: string;
  isHealthy: boolean;
}

export default function ProviderHealthMonitor() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [systemHealth, setSystemHealth] = useState('100%');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchProviderHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/v1/providers/health');
      const data = await response.json();

      if (data.success) {
        setProviders(data.providers);
        setSystemHealth(data.systemHealth);
      }
    } catch (error) {
      console.error('Failed to fetch provider health:', error);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchProviderHealth();
    const interval = setInterval(fetchProviderHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive',
      maintenance: 'outline'
    };

    const colors: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      down: 'bg-red-100 text-red-800',
      maintenance: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getLatencyColor = (latency: string) => {
    const ms = parseInt(latency);
    if (ms < 200) return 'text-green-600';
    if (ms < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl font-bold">Provider Health Monitor</CardTitle>
            <Badge className={systemHealth === '100%' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              System Health: {systemHealth}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Last update: {formatTimeAgo(lastRefresh.toISOString())}
            </span>
            <button
              onClick={fetchProviderHealth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && providers.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(provider.status)}
                    <div>
                      <div className="font-semibold text-lg capitalize">{provider.name}</div>
                      <div className="text-sm text-gray-500">
                        Last checked: {formatTimeAgo(provider.lastCheck)}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(provider.status)}
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600">Latency</div>
                    <div className={`font-semibold ${getLatencyColor(provider.latency)}`}>
                      {provider.latency}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                    <div className="font-semibold text-green-600">{provider.successRate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Error Rate</div>
                    <div className={`font-semibold ${parseFloat(provider.errorRate) > 5 ? 'text-red-600' : 'text-gray-800'}`}>
                      {provider.errorRate}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Current TPS</div>
                    <div className="font-semibold">{provider.currentTPS}</div>
                  </div>
                </div>

                {provider.status === 'degraded' && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ Provider experiencing elevated latency or error rates
                  </div>
                )}

                {provider.status === 'down' && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    🚨 Provider is currently unavailable - failover active
                  </div>
                )}
              </div>
            ))}

            {providers.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No provider data available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}