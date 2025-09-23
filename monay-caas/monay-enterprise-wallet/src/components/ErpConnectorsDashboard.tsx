'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { erpAPI } from '../lib/api/services';
import {
  Link2,
  Building2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Database,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Download,
  Upload,
  ArrowRight,
  Zap,
  Shield,
  Activity,
  ChevronRight,
  Plus,
  Loader2
} from 'lucide-react';

interface ERPSystem {
  id: string;
  name: string;
  logo?: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: Date;
  syncInterval: string;
  metrics: {
    customers: number;
    invoices: number;
    transactions: number;
    lastError?: string;
  };
}

const ErpConnectorsDashboard: React.FC = () => {
  const [connectedSystems, setConnectedSystems] = useState<ERPSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [syncInProgress, setSyncInProgress] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    // Initialize with mock data
    const systems: ERPSystem[] = [
      {
        id: 'quickbooks',
        name: 'QuickBooks Online',
        status: 'connected',
        lastSync: new Date(Date.now() - 3600000),
        syncInterval: 'Every hour',
        metrics: {
          customers: 1254,
          invoices: 3421,
          transactions: 8932
        }
      },
      {
        id: 'freshbooks',
        name: 'FreshBooks',
        status: 'connected',
        lastSync: new Date(Date.now() - 7200000),
        syncInterval: 'Every 2 hours',
        metrics: {
          customers: 567,
          invoices: 1234,
          transactions: 2890
        }
      },
      {
        id: 'wave',
        name: 'Wave Accounting',
        status: 'syncing',
        lastSync: new Date(Date.now() - 1800000),
        syncInterval: 'Real-time',
        metrics: {
          customers: 234,
          invoices: 567,
          transactions: 1234
        }
      },
      {
        id: 'zoho',
        name: 'Zoho Books',
        status: 'connected',
        lastSync: new Date(Date.now() - 5400000),
        syncInterval: 'Every 30 minutes',
        metrics: {
          customers: 890,
          invoices: 2345,
          transactions: 5678
        }
      },
      {
        id: 'sage',
        name: 'Sage Business Cloud',
        status: 'disconnected',
        syncInterval: 'Not configured',
        metrics: {
          customers: 0,
          invoices: 0,
          transactions: 0
        }
      },
      {
        id: 'sap',
        name: 'SAP',
        status: 'error',
        lastSync: new Date(Date.now() - 86400000),
        syncInterval: 'Daily',
        metrics: {
          customers: 2345,
          invoices: 5678,
          transactions: 12345,
          lastError: 'Authentication failed'
        }
      }
    ];
    setConnectedSystems(systems);
  }, []);

  const handleSync = async (systemId: string) => {
    setSyncInProgress(systemId);
    // Simulate sync
    setTimeout(() => {
      setSyncInProgress(null);
      setConnectedSystems(prev => prev.map(sys =>
        sys.id === systemId
          ? { ...sys, status: 'connected', lastSync: new Date() }
          : sys
      ));
    }, 3000);
  };

  const handleConnect = async (systemId: string) => {
    // This would open OAuth flow
    window.open(`/api/erp/${systemId}/connect`, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'syncing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Connected</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Syncing</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  const totalMetrics = connectedSystems.reduce((acc, sys) => ({
    customers: acc.customers + sys.metrics.customers,
    invoices: acc.invoices + sys.metrics.invoices,
    transactions: acc.transactions + sys.metrics.transactions
  }), { customers: 0, invoices: 0, transactions: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Link2 className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            ERP Connectors
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your accounting and ERP system integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Connect New System
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Connected Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {connectedSystems.filter(s => s.status === 'connected' || s.status === 'syncing').length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                of {connectedSystems.length} available
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalMetrics.customers.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Synced across all systems
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalMetrics.invoices.toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Processed this month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Sync Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                98.5%
              </div>
              <Progress value={98.5} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Systems Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Systems</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedSystems.map((system) => (
              <motion.div
                key={system.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setSelectedSystem(system.id)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">{system.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {system.syncInterval}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(system.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        {getStatusBadge(system.status)}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Sync</span>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatLastSync(system.lastSync)}
                        </span>
                      </div>

                      {system.status === 'error' && system.metrics.lastError && (
                        <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded-md">
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {system.metrics.lastError}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Customers</p>
                          <p className="text-sm font-bold">{system.metrics.customers}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Invoices</p>
                          <p className="text-sm font-bold">{system.metrics.invoices}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Transactions</p>
                          <p className="text-sm font-bold">{system.metrics.transactions}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {system.status === 'connected' || system.status === 'error' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSync(system.id);
                            }}
                            disabled={syncInProgress === system.id}
                          >
                            {syncInProgress === system.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sync Now
                              </>
                            )}
                          </Button>
                        ) : system.status === 'disconnected' ? (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnect(system.id);
                            }}
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="flex-1" disabled>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSystem(system.id);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Add New System Card */}
          <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer"
                onClick={() => setShowConnectModal(true)}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect New System</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Add QuickBooks, Xero, NetSuite, or other accounting systems
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Systems Overview</CardTitle>
              <CardDescription>Manage your active ERP integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedSystems
                  .filter(s => s.status === 'connected' || s.status === 'syncing')
                  .map((system) => (
                    <div key={system.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{system.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last sync: {formatLastSync(system.lastSync)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{system.metrics.transactions}</p>
                          <p className="text-xs text-muted-foreground">Transactions</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
              <CardDescription>Configure sync settings and field mappings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Sync Frequency</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Customer Sync</label>
                      <select className="w-full p-2 border rounded-md bg-background">
                        <option>Every 15 minutes</option>
                        <option>Every 30 minutes</option>
                        <option>Every hour</option>
                        <option>Every 2 hours</option>
                        <option>Daily</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Invoice Sync</label>
                      <select className="w-full p-2 border rounded-md bg-background">
                        <option>Real-time</option>
                        <option>Every 5 minutes</option>
                        <option>Every 15 minutes</option>
                        <option>Every 30 minutes</option>
                        <option>Hourly</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Field Mapping</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Customer ID → Monay User ID</span>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Invoice Number → Transaction Reference</span>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Payment Status → Monay Status</span>
                      <Badge>Active</Badge>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Activity Logs</CardTitle>
              <CardDescription>Recent synchronization activities and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="font-medium">QuickBooks sync completed</p>
                    <p className="text-sm text-muted-foreground">234 records synced</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="font-medium">FreshBooks sync started</p>
                    <p className="text-sm text-muted-foreground">Processing invoices...</p>
                  </div>
                  <span className="text-xs text-muted-foreground">5 min ago</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div className="flex-1">
                    <p className="font-medium">Wave Accounting rate limit</p>
                    <p className="text-sm text-muted-foreground">Retry scheduled in 10 minutes</p>
                  </div>
                  <span className="text-xs text-muted-foreground">15 min ago</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <p className="font-medium">SAP connection failed</p>
                    <p className="text-sm text-muted-foreground">Authentication expired</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                View All Logs
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErpConnectorsDashboard;