# Implementation Plan: Monay-Admin Dashboard (Port 3002)
## Invoice-First Architecture Integration

**Date**: October 2025
**Component**: monay-admin
**Port**: 3002
**Dependencies**: monay-backend-common (Port 3001)
**Session Type**: Admin Dashboard Team

---

## 🎯 OBJECTIVE

Transform the Monay-Admin dashboard into the central control plane for Invoice-First wallet architecture, providing platform-wide visibility and management of ephemeral wallets, provider health, reserve reconciliation, and real-time metrics.

---

## 📊 ADMIN DASHBOARD SCOPE

### Primary Responsibilities
1. **Invoice-First Wallet Management** - Monitor all ephemeral and persistent wallets
2. **Provider Health Dashboard** - Real-time Tempo/Circle status monitoring
3. **Reserve Reconciliation** - 1:1 backing verification interface
4. **Compliance Monitoring** - KYC/AML status for Invoice-First wallets
5. **Analytics & Reporting** - Platform-wide metrics and insights
6. **System Configuration** - Provider switching, TTL defaults, mode settings

---

## 🗂️ FILE STRUCTURE & COMPONENTS

```
monay-admin/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── invoice-wallets/        # NEW: Invoice-First management
│   │   │   │   ├── page.tsx           # Main wallet list
│   │   │   │   ├── [id]/              # Individual wallet details
│   │   │   │   └── ephemeral/         # Ephemeral wallet monitoring
│   │   │   ├── providers/              # NEW: Provider health
│   │   │   │   ├── page.tsx           # Provider status dashboard
│   │   │   │   ├── tempo/             # Tempo-specific metrics
│   │   │   │   └── circle/            # Circle-specific metrics
│   │   │   ├── reserves/               # NEW: Reserve management
│   │   │   │   ├── page.tsx           # Reserve overview
│   │   │   │   └── reconciliation/    # Manual reconciliation
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # UPDATE: Add Invoice-First widgets
│   │   │   └── monitoring/
│   │   │       └── page.tsx           # UPDATE: Add wallet lifecycle metrics
│   │   └── api/
│   │       └── socket/                 # NEW: WebSocket connection
│   ├── components/
│   │   ├── invoice-wallets/            # NEW: Invoice wallet components
│   │   │   ├── WalletLifecycleChart.tsx
│   │   │   ├── EphemeralCountdown.tsx
│   │   │   ├── WalletModeSelector.tsx
│   │   │   └── InvoiceWalletCard.tsx
│   │   ├── providers/                  # NEW: Provider components
│   │   │   ├── ProviderHealthCard.tsx
│   │   │   ├── ProviderMetrics.tsx
│   │   │   └── FailoverStatus.tsx
│   │   └── reserves/                   # NEW: Reserve components
│   │       ├── ReserveBalanceCard.tsx
│   │       ├── ReconciliationReport.tsx
│   │       └── MintBurnChart.tsx
│   └── services/
│       ├── invoice-wallet.service.ts   # NEW: Invoice wallet API calls
│       ├── provider.service.ts         # NEW: Provider monitoring
│       ├── reserve.service.ts          # NEW: Reserve management
│       └── websocket.service.ts        # NEW: Real-time updates
```

---

## 📋 IMPLEMENTATION PHASES

### Phase 1: Core Dashboard Updates (Week 1)

#### 1.1 Update Main Dashboard (dashboard/page.tsx)

```typescript
// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceWalletService } from '@/services/invoice-wallet.service';
import { ProviderService } from '@/services/provider.service';
import { ReserveService } from '@/services/reserve.service';
import { WalletLifecycleChart } from '@/components/invoice-wallets/WalletLifecycleChart';
import { ProviderHealthCard } from '@/components/providers/ProviderHealthCard';
import { ReserveBalanceCard } from '@/components/reserves/ReserveBalanceCard';
import { Activity, Wallet, Shield, TrendingUp } from '@monay/icons';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalInvoiceWallets: 0,
    activeEphemeralWallets: 0,
    persistentWallets: 0,
    adaptiveWallets: 0,
    totalVolume24h: 0,
    averageTTL: 0,
    providerHealth: {
      tempo: 'operational',
      circle: 'operational'
    },
    reserveBalance: 0,
    mintedTokens: 0
  });

  useEffect(() => {
    loadDashboardMetrics();
    const interval = setInterval(loadDashboardMetrics, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardMetrics = async () => {
    const [walletStats, providerStatus, reserveData] = await Promise.all([
      InvoiceWalletService.getStatistics(),
      ProviderService.getHealthStatus(),
      ReserveService.getBalance()
    ]);

    setMetrics({
      ...walletStats,
      providerHealth: providerStatus,
      reserveBalance: reserveData.totalReserve,
      mintedTokens: reserveData.totalMinted
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Invoice-First Platform Dashboard</h1>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoice Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalInvoiceWallets}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeEphemeralWallets} ephemeral active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(metrics.totalVolume24h / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">
              Avg TTL: {metrics.averageTTL} hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Provider Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <span className={`text-sm ${metrics.providerHealth.tempo === 'operational' ? 'text-green-500' : 'text-red-500'}`}>
                Tempo: {metrics.providerHealth.tempo}
              </span>
              <span className={`text-sm ${metrics.providerHealth.circle === 'operational' ? 'text-green-500' : 'text-yellow-500'}`}>
                Circle: {metrics.providerHealth.circle}
              </span>
            </div>
          </CardContent>
        </Card>

        <ReserveBalanceCard
          reserveBalance={metrics.reserveBalance}
          mintedTokens={metrics.mintedTokens}
        />
      </div>

      {/* Wallet Lifecycle Chart */}
      <div className="mb-8">
        <WalletLifecycleChart />
      </div>

      {/* Provider Health Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProviderHealthCard provider="tempo" />
        <ProviderHealthCard provider="circle" />
      </div>
    </div>
  );
}
```

#### 1.2 Create Invoice Wallet Service

```typescript
// src/services/invoice-wallet.service.ts
import { apiClient } from '@/lib/api-client';

export class InvoiceWalletService {
  static async getStatistics() {
    const response = await apiClient.get('/api/invoice-wallets/stats');
    return response.data;
  }

  static async listWallets(filters: {
    mode?: 'ephemeral' | 'persistent' | 'adaptive';
    status?: 'active' | 'expired' | 'destroyed';
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/api/invoice-wallets', { params: filters });
    return response.data;
  }

  static async getWalletDetails(walletId: string) {
    const response = await apiClient.get(`/api/invoice-wallets/${walletId}`);
    return response.data;
  }

  static async destroyWallet(walletId: string, reason: string) {
    const response = await apiClient.post(`/api/invoice-wallets/${walletId}/destroy`, { reason });
    return response.data;
  }

  static async extendTTL(walletId: string, additionalHours: number) {
    const response = await apiClient.post(`/api/invoice-wallets/${walletId}/extend`, { additionalHours });
    return response.data;
  }

  static async getWalletTransactions(walletId: string) {
    const response = await apiClient.get(`/api/invoice-wallets/${walletId}/transactions`);
    return response.data;
  }
}
```

---

### Phase 2: Invoice Wallet Management (Week 2)

#### 2.1 Invoice Wallets List Page

```typescript
// src/app/(dashboard)/invoice-wallets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InvoiceWalletService } from '@/services/invoice-wallet.service';
import { WebSocketService } from '@/services/websocket.service';
import { EphemeralCountdown } from '@/components/invoice-wallets/EphemeralCountdown';
import { Clock, Eye, Trash2, Timer } from '@monay/icons';
import { useRouter } from 'next/navigation';

const columns = [
  {
    accessorKey: 'wallet_address',
    header: 'Wallet Address',
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.original.wallet_address.slice(0, 10)}...</div>
    )
  },
  {
    accessorKey: 'mode',
    header: 'Mode',
    cell: ({ row }) => (
      <Badge variant={
        row.original.mode === 'ephemeral' ? 'destructive' :
        row.original.mode === 'persistent' ? 'default' : 'secondary'
      }>
        {row.original.mode}
      </Badge>
    )
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => `$${row.original.balance.toFixed(2)}`
  },
  {
    accessorKey: 'ttl',
    header: 'Time Remaining',
    cell: ({ row }) => {
      if (row.original.mode !== 'ephemeral') return 'N/A';
      return <EphemeralCountdown wallet={row.original} />;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={
        row.original.status === 'active' ? 'success' :
        row.original.status === 'expired' ? 'warning' : 'destructive'
      }>
        {row.original.status}
      </Badge>
    )
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/invoice-wallets/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.mode === 'ephemeral' && row.original.status === 'active' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleExtendTTL(row.original.id)}
              >
                <Timer className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600"
                onClick={() => handleDestroy(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      );
    }
  }
];

export default function InvoiceWalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ mode: 'all', status: 'all' });
  const ws = WebSocketService.getInstance();

  useEffect(() => {
    loadWallets();

    // Subscribe to real-time updates
    ws.subscribe('wallet-update', (data) => {
      setWallets(prev => prev.map(w =>
        w.id === data.walletId ? { ...w, ...data.updates } : w
      ));
    });

    return () => {
      ws.unsubscribe('wallet-update');
    };
  }, [filter]);

  const loadWallets = async () => {
    setLoading(true);
    try {
      const data = await InvoiceWalletService.listWallets({
        mode: filter.mode !== 'all' ? filter.mode : undefined,
        status: filter.status !== 'all' ? filter.status : undefined,
        limit: 100
      });
      setWallets(data.wallets);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendTTL = async (walletId: string) => {
    const hours = prompt('Extend TTL by how many hours?');
    if (hours && !isNaN(Number(hours))) {
      await InvoiceWalletService.extendTTL(walletId, Number(hours));
      loadWallets();
    }
  };

  const handleDestroy = async (walletId: string) => {
    const reason = prompt('Reason for manual destruction?');
    if (reason) {
      await InvoiceWalletService.destroyWallet(walletId, reason);
      loadWallets();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoice-First Wallets</h1>

        <div className="flex gap-4">
          <select
            className="px-4 py-2 border rounded"
            value={filter.mode}
            onChange={(e) => setFilter({...filter, mode: e.target.value})}
          >
            <option value="all">All Modes</option>
            <option value="ephemeral">Ephemeral</option>
            <option value="persistent">Persistent</option>
            <option value="adaptive">Adaptive</option>
          </select>

          <select
            className="px-4 py-2 border rounded"
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="destroyed">Destroyed</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={wallets}
        loading={loading}
      />
    </div>
  );
}
```

#### 2.2 Ephemeral Wallet Countdown Component

```typescript
// src/components/invoice-wallets/EphemeralCountdown.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock } from '@monay/icons';

interface Props {
  wallet: {
    created_at: string;
    ttl_hours: number;
    destroy_at: string;
  };
}

export function EphemeralCountdown({ wallet }: Props) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical'>('normal');

  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date();
      const destroyAt = new Date(wallet.destroy_at);
      const diff = destroyAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setUrgency('critical');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Set urgency levels
      if (hours < 1) {
        setUrgency('critical');
      } else if (hours < 24) {
        setUrgency('warning');
      } else {
        setUrgency('normal');
      }

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [wallet]);

  const getColorClass = () => {
    switch (urgency) {
      case 'critical': return 'text-red-600 font-bold animate-pulse';
      case 'warning': return 'text-yellow-600 font-semibold';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${getColorClass()}`}>
      <Clock className="h-4 w-4" />
      <span>{timeRemaining}</span>
    </div>
  );
}
```

---

### Phase 3: Provider Health Monitoring (Week 3)

#### 3.1 Provider Dashboard Page

```typescript
// src/app/(dashboard)/providers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProviderService } from '@/services/provider.service';
import { WebSocketService } from '@/services/websocket.service';
import { ProviderMetrics } from '@/components/providers/ProviderMetrics';
import { FailoverStatus } from '@/components/providers/FailoverStatus';
import { Activity, Shield, Zap, AlertTriangle } from '@monay/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ProvidersPage() {
  const [providers, setProviders] = useState({
    tempo: {
      status: 'operational',
      tps: 0,
      latency: 0,
      successRate: 100,
      lastCheck: new Date(),
      endpoints: {
        api: 'healthy',
        webhook: 'healthy'
      }
    },
    circle: {
      status: 'operational',
      tps: 0,
      latency: 0,
      successRate: 100,
      lastCheck: new Date(),
      endpoints: {
        api: 'healthy',
        webhook: 'healthy'
      }
    }
  });

  const [settings, setSettings] = useState({
    primaryProvider: 'tempo',
    autoFailover: true,
    failoverThreshold: 95, // Success rate %
    healthCheckInterval: 30 // seconds
  });

  const ws = WebSocketService.getInstance();

  useEffect(() => {
    loadProviderStatus();

    // Subscribe to real-time health updates
    ws.subscribe('provider-health', (data) => {
      setProviders(prev => ({
        ...prev,
        [data.provider]: data.metrics
      }));
    });

    const interval = setInterval(loadProviderStatus, 10000); // Check every 10s
    return () => {
      clearInterval(interval);
      ws.unsubscribe('provider-health');
    };
  }, []);

  const loadProviderStatus = async () => {
    const status = await ProviderService.getHealthStatus();
    setProviders(status);
  };

  const handleProviderSwitch = async () => {
    const newPrimary = settings.primaryProvider === 'tempo' ? 'circle' : 'tempo';
    await ProviderService.switchPrimary(newPrimary);
    setSettings({...settings, primaryProvider: newPrimary});
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Provider Health Dashboard</h1>

      {/* Failover Alert if active */}
      {settings.primaryProvider === 'circle' && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failover Active</AlertTitle>
          <AlertDescription>
            Circle is currently the primary provider due to Tempo issues.
            System will automatically switch back when Tempo recovers.
          </AlertDescription>
        </Alert>
      )}

      {/* Provider Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Provider Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <Label>Primary Provider</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className={settings.primaryProvider === 'tempo' ? 'font-bold' : ''}>
                  Tempo
                </span>
                <Switch
                  checked={settings.primaryProvider === 'circle'}
                  onCheckedChange={handleProviderSwitch}
                />
                <span className={settings.primaryProvider === 'circle' ? 'font-bold' : ''}>
                  Circle
                </span>
              </div>
            </div>

            <div>
              <Label>Auto-Failover</Label>
              <Switch
                checked={settings.autoFailover}
                onCheckedChange={(checked) =>
                  setSettings({...settings, autoFailover: checked})
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label>Failover Threshold</Label>
              <input
                type="number"
                value={settings.failoverThreshold}
                onChange={(e) =>
                  setSettings({...settings, failoverThreshold: Number(e.target.value)})
                }
                className="w-20 px-2 py-1 border rounded mt-2"
                min="50"
                max="100"
              />
              <span className="ml-1">%</span>
            </div>

            <div>
              <Label>Health Check Interval</Label>
              <input
                type="number"
                value={settings.healthCheckInterval}
                onChange={(e) =>
                  setSettings({...settings, healthCheckInterval: Number(e.target.value)})
                }
                className="w-20 px-2 py-1 border rounded mt-2"
                min="10"
                max="300"
              />
              <span className="ml-1">sec</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Tempo Card */}
        <Card className={providers.tempo.status !== 'operational' ? 'border-red-500' : ''}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tempo Infrastructure</CardTitle>
              <Badge variant={
                providers.tempo.status === 'operational' ? 'success' :
                providers.tempo.status === 'degraded' ? 'warning' : 'destructive'
              }>
                {providers.tempo.status}
              </Badge>
            </div>
            <CardDescription>Primary provider - 100k+ TPS capability</CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderMetrics provider="tempo" metrics={providers.tempo} />
          </CardContent>
        </Card>

        {/* Circle Card */}
        <Card className={providers.circle.status !== 'operational' ? 'border-yellow-500' : ''}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Circle Infrastructure</CardTitle>
              <Badge variant={
                providers.circle.status === 'operational' ? 'success' :
                providers.circle.status === 'degraded' ? 'warning' : 'destructive'
              }>
                {providers.circle.status}
              </Badge>
            </div>
            <CardDescription>Fallback provider - 1000 TPS capability</CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderMetrics provider="circle" metrics={providers.circle} />
          </CardContent>
        </Card>
      </div>

      {/* Failover History */}
      <FailoverStatus />
    </div>
  );
}
```

#### 3.2 Provider Metrics Component

```typescript
// src/components/providers/ProviderMetrics.tsx
'use client';

import { Activity, Clock, CheckCircle, AlertCircle } from '@monay/icons';
import { Progress } from '@/components/ui/progress';

interface Props {
  provider: 'tempo' | 'circle';
  metrics: {
    tps: number;
    latency: number;
    successRate: number;
    endpoints: {
      api: string;
      webhook: string;
    };
    lastCheck: Date;
  };
}

export function ProviderMetrics({ provider, metrics }: Props) {
  const getEndpointIcon = (status: string) => {
    return status === 'healthy' ?
      <CheckCircle className="h-4 w-4 text-green-500" /> :
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-600';
    if (latency < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* TPS Meter */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Transactions/sec
          </span>
          <span className="font-mono">{metrics.tps.toLocaleString()}</span>
        </div>
        <Progress
          value={provider === 'tempo' ? (metrics.tps / 100000) * 100 : (metrics.tps / 1000) * 100}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Max: {provider === 'tempo' ? '100,000' : '1,000'} TPS
        </p>
      </div>

      {/* Latency */}
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1 text-sm">
          <Clock className="h-4 w-4" />
          Latency
        </span>
        <span className={`font-mono text-sm ${getLatencyColor(metrics.latency)}`}>
          {metrics.latency}ms
        </span>
      </div>

      {/* Success Rate */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Success Rate</span>
          <span className={metrics.successRate >= 99 ? 'text-green-600' : 'text-yellow-600'}>
            {metrics.successRate.toFixed(2)}%
          </span>
        </div>
        <Progress
          value={metrics.successRate}
          className={metrics.successRate < 95 ? 'bg-red-100' : ''}
        />
      </div>

      {/* Endpoint Health */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex justify-between items-center text-sm">
          <span>API Endpoint</span>
          <div className="flex items-center gap-1">
            {getEndpointIcon(metrics.endpoints.api)}
            <span className="text-xs">{metrics.endpoints.api}</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Webhook Endpoint</span>
          <div className="flex items-center gap-1">
            {getEndpointIcon(metrics.endpoints.webhook)}
            <span className="text-xs">{metrics.endpoints.webhook}</span>
          </div>
        </div>
      </div>

      {/* Last Check */}
      <div className="text-xs text-muted-foreground pt-2 border-t">
        Last checked: {new Date(metrics.lastCheck).toLocaleTimeString()}
      </div>
    </div>
  );
}
```

---

### Phase 4: Reserve Management & Reconciliation (Week 4)

#### 4.1 Reserve Management Page

```typescript
// src/app/(dashboard)/reserves/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReserveService } from '@/services/reserve.service';
import { ReserveBalanceCard } from '@/components/reserves/ReserveBalanceCard';
import { ReconciliationReport } from '@/components/reserves/ReconciliationReport';
import { MintBurnChart } from '@/components/reserves/MintBurnChart';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from '@monay/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ReservesPage() {
  const [reserves, setReserves] = useState({
    totalFiatReserve: 0,
    totalMintedTokens: 0,
    bankAccounts: [],
    reconciliationStatus: 'balanced',
    lastReconciliation: null,
    discrepancies: []
  });

  const [reconciling, setReconciling] = useState(false);
  const [mintBurnHistory, setMintBurnHistory] = useState([]);

  useEffect(() => {
    loadReserveData();
    loadMintBurnHistory();
  }, []);

  const loadReserveData = async () => {
    const data = await ReserveService.getReserveStatus();
    setReserves(data);
  };

  const loadMintBurnHistory = async () => {
    const history = await ReserveService.getMintBurnHistory();
    setMintBurnHistory(history);
  };

  const handleReconciliation = async () => {
    setReconciling(true);
    try {
      const result = await ReserveService.performReconciliation();
      setReserves(result);

      if (result.discrepancies.length > 0) {
        alert(`Reconciliation completed with ${result.discrepancies.length} discrepancies found`);
      }
    } finally {
      setReconciling(false);
    }
  };

  const isBalanced = reserves.totalFiatReserve === reserves.totalMintedTokens;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reserve Management</h1>
        <Button
          onClick={handleReconciliation}
          disabled={reconciling}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${reconciling ? 'animate-spin' : ''}`} />
          Reconcile Now
        </Button>
      </div>

      {/* Reserve Status Alert */}
      {!isBalanced && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            <strong>Reserve Imbalance Detected!</strong>
            <br />
            Fiat Reserve: ${reserves.totalFiatReserve.toLocaleString()}
            <br />
            Minted Tokens: ${reserves.totalMintedTokens.toLocaleString()}
            <br />
            Discrepancy: ${Math.abs(reserves.totalFiatReserve - reserves.totalMintedTokens).toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fiat Reserve</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(reserves.totalFiatReserve / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Across {reserves.bankAccounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Minted Tokens</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(reserves.totalMintedTokens / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              USDC equivalent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reserve Ratio</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {((reserves.totalFiatReserve / reserves.totalMintedTokens) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Target: 100.00%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bank Account Reserves</CardTitle>
          <CardDescription>Real-time fiat reserves across partner banks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reserves.bankAccounts.map((account, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <div className="font-semibold">{account.bankName}</div>
                  <div className="text-sm text-muted-foreground">
                    Account: ****{account.lastFour}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${account.balance.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(account.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mint/Burn History Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Mint/Burn Activity (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <MintBurnChart data={mintBurnHistory} />
        </CardContent>
      </Card>

      {/* Reconciliation Report */}
      <ReconciliationReport
        lastReconciliation={reserves.lastReconciliation}
        discrepancies={reserves.discrepancies}
      />
    </div>
  );
}
```

---

### Phase 5: WebSocket Integration & Real-time Updates (Week 5)

#### 5.1 WebSocket Service

```typescript
// src/services/websocket.service.ts
import io, { Socket } from 'socket.io-client';

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket;
  private subscribers: Map<string, Set<Function>> = new Map();

  private constructor() {
    this.socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.emit('admin-subscribe', { role: 'platform_admin' });
    });

    this.socket.on('wallet-countdown', (data) => {
      this.notifySubscribers('wallet-countdown', data);
    });

    this.socket.on('wallet-expired', (data) => {
      this.notifySubscribers('wallet-expired', data);
    });

    this.socket.on('wallet-destroyed', (data) => {
      this.notifySubscribers('wallet-destroyed', data);
    });

    this.socket.on('provider-health', (data) => {
      this.notifySubscribers('provider-health', data);
    });

    this.socket.on('reserve-update', (data) => {
      this.notifySubscribers('reserve-update', data);
    });

    this.socket.on('failover-triggered', (data) => {
      this.notifySubscribers('failover-triggered', data);
    });
  }

  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);
  }

  unsubscribe(event: string, callback?: Function) {
    if (callback) {
      this.subscribers.get(event)?.delete(callback);
    } else {
      this.subscribers.delete(event);
    }
  }

  private notifySubscribers(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
```

---

## 🔄 INTEGRATION POINTS

### With Backend (Port 3001)

```typescript
// API Endpoints the Admin Dashboard will consume:

// Invoice Wallet Management
GET    /api/invoice-wallets                 // List all wallets with filters
GET    /api/invoice-wallets/stats           // Platform statistics
GET    /api/invoice-wallets/:id             // Wallet details
POST   /api/invoice-wallets/:id/destroy     // Manual destruction
POST   /api/invoice-wallets/:id/extend      // Extend TTL
GET    /api/invoice-wallets/:id/transactions // Transaction history

// Provider Management
GET    /api/providers/health                // Health status for all providers
GET    /api/providers/:provider/metrics     // Detailed metrics
POST   /api/providers/switch                // Switch primary provider
GET    /api/providers/failover-history      // Failover event history

// Reserve Management
GET    /api/reserves/status                 // Current reserve status
POST   /api/reserves/reconcile              // Trigger reconciliation
GET    /api/reserves/mint-burn-history      // Mint/burn transaction history
GET    /api/reserves/bank-accounts          // Bank account balances

// WebSocket Events
- wallet-countdown      // TTL countdown updates
- wallet-expired        // Wallet expiration notifications
- wallet-destroyed      // Wallet destruction notifications
- provider-health       // Provider health updates
- reserve-update        // Reserve balance changes
- failover-triggered    // Provider failover events
```

### With Enterprise Wallet (Port 3007)

The Admin dashboard provides oversight of enterprise wallets:
- Monitor enterprise wallet creation from invoices
- Track enterprise wallet balances and transactions
- View compliance status for enterprise wallets

### With Consumer Wallet (Port 3003)

The Admin dashboard provides oversight of consumer wallets:
- Monitor consumer wallet creation from invoices
- Track ephemeral wallet usage patterns
- View consumer wallet lifecycle analytics

---

## 🚀 DEPLOYMENT CHECKLIST

1. **Environment Variables**
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   NEXT_PUBLIC_ADMIN_ROLE=platform_admin
   ```

2. **Dependencies to Install**
   ```bash
   npm install socket.io-client@^4.5.0
   npm install recharts@^2.5.0
   npm install date-fns@^2.30.0
   npm install @tanstack/react-query@^4.29.0
   ```

3. **Testing Requirements**
   - Test real-time WebSocket updates
   - Verify provider failover scenarios
   - Test manual wallet destruction
   - Validate reserve reconciliation
   - Test TTL extension functionality

4. **Security Considerations**
   - Admin authentication required for all pages
   - Role-based access control for sensitive operations
   - Audit logging for all admin actions
   - Encryption for WebSocket communications

---

## 📊 SUCCESS METRICS

- Real-time wallet status updates < 100ms latency
- Provider health checks every 30 seconds
- Reserve reconciliation completion < 5 seconds
- Dashboard load time < 2 seconds
- WebSocket reconnection within 5 seconds

---

## 🔗 PARALLEL SESSION COORDINATION

This Admin Dashboard implementation plan is designed to work in parallel with:

1. **Backend Team** (Port 3001) - Consuming APIs and WebSocket events
2. **Enterprise Team** (Port 3007) - Monitoring enterprise wallets
3. **Consumer Team** (Port 3003) - Monitoring consumer wallets

Key coordination points:
- API contract must match backend implementation
- WebSocket event names must be consistent
- Database schema changes must be communicated
- UI components should maintain consistent design language

---

This plan provides the Admin Dashboard team with everything needed to implement Invoice-First wallet management, provider health monitoring, and reserve reconciliation features. The team can work independently while staying synchronized with the backend APIs.