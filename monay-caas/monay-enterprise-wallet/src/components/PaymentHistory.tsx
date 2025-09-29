'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Download,
  Filter,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Coins,
  Building,
  Hash,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Payment {
  id: string;
  transaction_id: string;
  invoice_number?: string;
  type: 'payment_received' | 'payment_sent' | 'onramp' | 'offramp' | 'provider_swap';
  amount: number;
  provider: 'tempo' | 'circle' | 'credit';
  status: 'completed' | 'pending' | 'failed';
  customer: {
    name: string;
    email: string;
    wallet_address?: string;
  };
  timestamp: string;
  fee: number;
  settlement_time: string;
  solana_signature?: string;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchPayments();
  }, [typeFilter, providerFilter, dateRange]);

  const fetchPayments = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Mock payment data
      const mockPayments: Payment[] = [
        {
          id: '1',
          transaction_id: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          invoice_number: 'INV-202409-0001',
          type: 'payment_received',
          amount: 15000.00,
          provider: 'tempo',
          status: 'completed',
          customer: {
            name: 'Acme Corporation',
            email: 'billing@acme.com',
            wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15)
          },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          fee: 0.15,
          settlement_time: '87ms',
          solana_signature: 'Sol' + Math.random().toString(36).substring(2, 45)
        },
        {
          id: '2',
          transaction_id: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          type: 'onramp',
          amount: 50000.00,
          provider: 'tempo',
          status: 'completed',
          customer: {
            name: 'Enterprise Treasury',
            email: 'treasury@enterprise.com'
          },
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          fee: 50.00,
          settlement_time: '2.3s',
          solana_signature: 'Sol' + Math.random().toString(36).substring(2, 45)
        },
        {
          id: '3',
          transaction_id: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          invoice_number: 'INV-202409-0002',
          type: 'payment_received',
          amount: 4250.00,
          provider: 'circle',
          status: 'completed',
          customer: {
            name: 'TechStart Inc',
            email: 'finance@techstart.com',
            wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15)
          },
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          fee: 4.25,
          settlement_time: '1.8s',
          solana_signature: 'Sol' + Math.random().toString(36).substring(2, 45)
        },
        {
          id: '4',
          transaction_id: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          type: 'provider_swap',
          amount: 10000.00,
          provider: 'tempo',
          status: 'completed',
          customer: {
            name: 'Treasury Operations',
            email: 'ops@enterprise.com'
          },
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          fee: 0.10,
          settlement_time: '125ms',
          solana_signature: 'Sol' + Math.random().toString(36).substring(2, 45)
        },
        {
          id: '5',
          transaction_id: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          type: 'payment_sent',
          amount: 3500.00,
          provider: 'tempo',
          status: 'completed',
          customer: {
            name: 'Vendor Services LLC',
            email: 'accounts@vendor.com'
          },
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          fee: 0.35,
          settlement_time: '92ms',
          solana_signature: 'Sol' + Math.random().toString(36).substring(2, 45)
        },
        {
          id: '6',
          transaction_id: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          type: 'offramp',
          amount: 25000.00,
          provider: 'circle',
          status: 'pending',
          customer: {
            name: 'Enterprise Treasury',
            email: 'treasury@enterprise.com'
          },
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          fee: 25.00,
          settlement_time: 'pending',
          solana_signature: 'Sol' + Math.random().toString(36).substring(2, 45)
        }
      ];

      // Apply filters
      let filtered = mockPayments;
      if (typeFilter !== 'all') {
        filtered = filtered.filter(p => p.type === typeFilter);
      }
      if (providerFilter !== 'all') {
        filtered = filtered.filter(p => p.provider === providerFilter);
      }

      setPayments(filtered);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPayments(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'payment_sent':
        return <ArrowUpRight className="h-4 w-4 text-orange-600" />;
      case 'onramp':
        return <ArrowDownRight className="h-4 w-4 text-blue-600" />;
      case 'offramp':
        return <ArrowUpRight className="h-4 w-4 text-purple-600" />;
      case 'provider_swap':
        return <RefreshCw className="h-4 w-4 text-indigo-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      payment_received: 'Received',
      payment_sent: 'Sent',
      onramp: 'On-Ramp',
      offramp: 'Off-Ramp',
      provider_swap: 'Swap'
    };
    const colors = {
      payment_received: 'bg-green-600',
      payment_sent: 'bg-orange-600',
      onramp: 'bg-blue-600',
      offramp: 'bg-purple-600',
      provider_swap: 'bg-indigo-600'
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-600'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'tempo':
        return <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />Tempo</Badge>;
      case 'circle':
        return <Badge variant="outline" className="text-xs"><Coins className="h-3 w-3 mr-1" />Circle</Badge>;
      case 'credit':
        return <Badge variant="outline" className="text-xs"><CreditCard className="h-3 w-3 mr-1" />Credit</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{provider}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: filteredPayments.length,
    totalVolume: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
    totalFees: filteredPayments.reduce((sum, p) => sum + p.fee, 0),
    avgSettlement: '124ms',
    successRate: (filteredPayments.filter(p => p.status === 'completed').length / filteredPayments.length * 100) || 0
  };

  // Chart data
  const volumeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Payment Volume',
      data: [45000, 52000, 48000, 61000, 58000, 42000, 39000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground mt-1">
            Track all treasury transactions and settlements
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15.2% vs last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalFees.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              0.1% avg fee rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Settlement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSettlement}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredPayments.filter(p => p.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Volume Trend</CardTitle>
            <Tabs value={dateRange} onValueChange={setDateRange}>
              <TabsList>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <Line
              data={volumeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + (Number(value) / 1000).toFixed(0) + 'k';
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[250px]"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment_received">Received</SelectItem>
                  <SelectItem value="payment_sent">Sent</SelectItem>
                  <SelectItem value="onramp">On-Ramp</SelectItem>
                  <SelectItem value="offramp">Off-Ramp</SelectItem>
                  <SelectItem value="provider_swap">Swap</SelectItem>
                </SelectContent>
              </Select>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="tempo">Tempo</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer/Entity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Settlement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(payment.type)}
                      <div>
                        <p className="font-mono text-sm">{payment.transaction_id}</p>
                        {payment.invoice_number && (
                          <p className="text-xs text-muted-foreground">
                            <Receipt className="h-3 w-3 inline mr-1" />
                            {payment.invoice_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(payment.type)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{payment.customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">
                        {payment.type === 'payment_sent' || payment.type === 'offramp' ? '-' : '+'}
                        ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fee: ${payment.fee.toFixed(2)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getProviderBadge(payment.provider)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {payment.settlement_time}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(payment.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}