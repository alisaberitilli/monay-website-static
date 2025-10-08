'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  Calendar,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ReserveSummary {
  totalTokensMinted: number;
  totalFiatReserved: number;
  discrepancy: number;
  ratio: string;
  status: 'balanced' | 'imbalanced';
}

interface ProviderReserve {
  provider: string;
  date: string;
  total_tokens_minted: string;
  total_fiat_reserved: string;
  discrepancy: string;
  status: string;
  reconciled_at: string;
}

export default function ReserveReconciliation() {
  const [summary, setSummary] = useState<ReserveSummary | null>(null);
  const [providers, setProviders] = useState<ProviderReserve[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);

  const fetchReserveData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/v1/reserves/balance');
      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
        setProviders(data.providers);
      }

      // Fetch history
      const historyResponse = await fetch('http://localhost:3001/api/v1/reserves/history?days=7');
      const historyData = await historyResponse.json();
      if (historyData.success) {
        setHistory(historyData.history);
      }
    } catch (error) {
      console.error('Failed to fetch reserve data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReserveData();
  }, []);

  const triggerReconciliation = async () => {
    setReconciling(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/reserves/reconcile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ provider: 'tempo' })
      });

      const data = await response.json();
      if (data.success) {
        await fetchReserveData(); // Refresh data
      }
    } catch (error) {
      console.error('Reconciliation failed:', error);
    } finally {
      setReconciling(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    return status === 'balanced' ? 'text-green-600' : 'text-yellow-600';
  };

  const getDiscrepancyColor = (discrepancy: number) => {
    const abs = Math.abs(discrepancy);
    if (abs < 0.01) return 'text-green-600';
    if (abs < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Prepare chart data
  const chartData = history.slice(0, 7).reverse().map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tokens: parseFloat(item.total_tokens_minted),
    reserves: parseFloat(item.total_fiat_reserved),
    discrepancy: parseFloat(item.discrepancy)
  }));

  const pieData = providers.map(p => ({
    name: p.provider.charAt(0).toUpperCase() + p.provider.slice(1),
    value: parseFloat(p.total_fiat_reserved)
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tokens Minted</p>
                <p className="text-2xl font-bold">{formatNumber(summary?.totalTokensMinted || 0)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fiat Reserved</p>
                <p className="text-2xl font-bold">{formatCurrency(summary?.totalFiatReserved || 0)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discrepancy</p>
                <p className={`text-2xl font-bold ${getDiscrepancyColor(summary?.discrepancy || 0)}`}>
                  {formatCurrency(Math.abs(summary?.discrepancy || 0))}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reserve Ratio</p>
                <p className="text-2xl font-bold">{summary?.ratio || '1.0000'}</p>
              </div>
              <Badge className={summary?.status === 'balanced' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {summary?.status || 'unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reserve Reconciliation</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchReserveData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={triggerReconciliation}
                disabled={reconciling}
                className="bg-orange-400 hover:bg-orange-500 text-white"
              >
                {reconciling ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Reconciling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Reconcile Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Provider Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-4">Provider Reserves</h3>
              <div className="space-y-3">
                {providers.map((provider) => (
                  <div key={provider.provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{provider.provider}</div>
                      <div className="text-sm text-gray-600">
                        Last reconciled: {new Date(provider.reconciled_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(parseFloat(provider.total_fiat_reserved))}</div>
                      <div className={`text-sm ${provider.status === 'balanced' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {provider.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Reserve Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${((entry.value / (summary?.totalFiatReserved || 1)) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Chart */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-4">7-Day Reserve History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatNumber(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="#0088FE"
                  name="Tokens Minted"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="reserves"
                  stroke="#00C49F"
                  name="Fiat Reserved"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="discrepancy"
                  stroke="#FF8042"
                  name="Discrepancy"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts */}
          {Math.abs(summary?.discrepancy || 0) > 1000 && (
            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Reserve discrepancy exceeds threshold. Manual review recommended.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}