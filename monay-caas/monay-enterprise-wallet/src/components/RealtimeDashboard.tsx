'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertCircle, TrendingUp, Users, Wallet, DollarSign, Shield, Clock } from 'lucide-react';
import { useWebSocket, useTransactionUpdates, useWalletUpdates, useComplianceAlerts } from '@/hooks/useWebSocket';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';

interface MetricsData {
  activeConnections: number;
  activeTenants: number;
  queuedTransactions: number;
  timestamp: string;
}

interface TransactionUpdate {
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  timestamp: string;
}

interface WalletUpdate {
  walletId: string;
  balance: number;
  status: string;
  lastActivity: string;
}

interface ComplianceAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
}

const RealtimeDashboard: React.FC = () => {
  const { isConnected, connectionState, connect, disconnect, subscribe, send } = useWebSocket();
  const { addNotification } = useNotificationStore();

  const [metrics, setMetrics] = useState<MetricsData>({
    activeConnections: 0,
    activeTenants: 0,
    queuedTransactions: 0,
    timestamp: new Date().toISOString()
  });

  const [recentTransactions, setRecentTransactions] = useState<TransactionUpdate[]>([]);
  const [walletActivity, setWalletActivity] = useState<WalletUpdate[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);
  const [latency, setLatency] = useState(0);

  // Handle transaction updates
  useTransactionUpdates((data: TransactionUpdate) => {
    setRecentTransactions(prev => [
      data,
      ...prev.slice(0, 9) // Keep last 10
    ]);

    // Show notification for large transactions
    if (data.amount > 100000) {
      addNotification({
        type: 'info',
        message: `Large transaction: ${data.currency} ${data.amount.toLocaleString()}`,
        autoClose: true
      });
    }
  });

  // Handle wallet updates
  useWalletUpdates((data: WalletUpdate) => {
    setWalletActivity(prev => {
      const existing = prev.findIndex(w => w.walletId === data.walletId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = data;
        return updated;
      }
      return [data, ...prev.slice(0, 9)];
    });
  });

  // Handle compliance alerts
  useComplianceAlerts((alert: ComplianceAlert) => {
    setComplianceAlerts(prev => [
      alert,
      ...prev.slice(0, 19) // Keep last 20
    ]);

    // Show notification for high severity alerts
    if (alert.severity === 'high' || alert.severity === 'critical') {
      addNotification({
        type: 'error',
        message: `Compliance Alert: ${alert.message}`,
        autoClose: false
      });
    }
  });

  // Subscribe to metrics updates
  useEffect(() => {
    if (!isConnected) return;

    const metricsHandler = (data: MetricsData) => {
      setMetrics(data);
    };

    const latencyHandler = (data: { latency: number }) => {
      setLatency(data.latency);
    };

    const unsubscribeMetrics = subscribe('metrics-update', metricsHandler);
    const unsubscribeLatency = subscribe('latency', latencyHandler);

    // Request initial metrics
    send('request-metrics', {});

    // Request metrics periodically
    const interval = setInterval(() => {
      send('request-metrics', {});
      send('ping', { timestamp: Date.now() });
    }, 30000);

    return () => {
      unsubscribeMetrics();
      unsubscribeLatency();
      clearInterval(interval);
    };
  }, [isConnected, subscribe, send]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Bar */}
      <Card className="border-t-4 border-t-primary">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`} />
                {isConnected && (
                  <div className={`absolute -inset-0.5 rounded-full ${getConnectionStatusColor()} animate-ping opacity-75`} />
                )}
              </div>
              <span className="font-medium">
                {connectionState === 'connected' ? 'Real-time Updates Active' : 
                 connectionState === 'connecting' ? 'Connecting...' : 
                 'Real-time Updates Disconnected'}
              </span>
              {isConnected && latency > 0 && (
                <Badge variant="outline" className="ml-2">
                  <Clock className="w-3 h-3 mr-1" />
                  {latency}ms
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isConnected ? (
                <button
                  onClick={connect}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                >
                  Connect
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeConnections}</div>
            <p className="text-xs text-muted-foreground">Users online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTenants}</div>
            <p className="text-xs text-muted-foreground">Organizations active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queued Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.queuedTransactions}</div>
            <p className="text-xs text-muted-foreground">Pending processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <Progress value={98.5} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Transaction Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {recentTransactions.map((tx) => (
                  <motion.div
                    key={tx.transactionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {tx.currency} {tx.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
              {recentTransactions.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No recent transactions
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Compliance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {complianceAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(alert.severity)}`} />
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {complianceAlerts.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No active alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Active Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {walletActivity.map((wallet) => (
                <motion.div
                  key={wallet.walletId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate">
                      {wallet.walletId.slice(0, 8)}...
                    </span>
                    <Badge variant={wallet.status === 'active' ? 'default' : 'secondary'}>
                      {wallet.status}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">
                    ${wallet.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last activity: {new Date(wallet.lastActivity).toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            {walletActivity.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No active wallets
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeDashboard;