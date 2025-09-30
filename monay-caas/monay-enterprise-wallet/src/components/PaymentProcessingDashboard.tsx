'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Download,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import apiService from '@/services/api.service';
import { toast } from '@/components/ui/use-toast';

interface Payment {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  provider: 'circle' | 'tempo' | 'ach' | 'wire';
  timestamp: Date;
  settlementTime?: number;
  fee?: number;
  errorMessage?: string;
}

interface PaymentStats {
  totalVolume: number;
  totalTransactions: number;
  successRate: number;
  averageSettlementTime: number;
  pendingPayments: number;
  failedPayments: number;
}

const PaymentProcessingDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalVolume: 0,
    totalTransactions: 0,
    successRate: 0,
    averageSettlementTime: 0,
    pendingPayments: 0,
    failedPayments: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchPayments();
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchPayments();
        fetchStats();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchPayments = async () => {
    try {
      const data = await apiService.getPayments({
        status: filterStatus === 'all' ? undefined : filterStatus,
        provider: filterProvider === 'all' ? undefined : filterProvider
      });

      const formattedPayments = (data as any).payments?.map((p: any) => ({
        id: p.id,
        invoiceId: p.invoiceId || p.invoice_id,
        customerName: p.customerName || p.customer_name || 'Unknown Customer',
        amount: p.amount,
        status: p.status,
        provider: p.provider,
        timestamp: new Date(p.createdAt || p.created_at || Date.now()),
        settlementTime: p.settlementTime || p.settlement_time,
        fee: p.fee,
        errorMessage: p.errorMessage || p.error_message
      })) || generateMockPayments();

      setPayments(formattedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments(generateMockPayments());
      toast({
        title: "Using mock data",
        description: "Failed to fetch payments from server",
      });
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiService.getPaymentStats() as any;

      const formattedStats = {
        totalVolume: data.totalVolume || data.total_volume || 0,
        totalTransactions: data.totalTransactions || data.total_transactions || 0,
        successRate: data.successRate || data.success_rate || 0,
        averageSettlementTime: data.averageSettlementTime || data.average_settlement_time || 0,
        pendingPayments: data.pendingPayments || data.pending_payments || 0,
        failedPayments: data.failedPayments || data.failed_payments || 0
      };

      if (formattedStats.totalVolume === 0) {
        setStats(generateMockStats());
      } else {
        setStats(formattedStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(generateMockStats());
    }
  };

  const generateMockPayments = (): Payment[] => {
    return [
      {
        id: 'PAY-001',
        invoiceId: 'INV-2024-001',
        customerName: 'Acme Corporation',
        amount: 15000,
        status: 'processing',
        provider: 'circle',
        timestamp: new Date(Date.now() - 60000),
        settlementTime: 45
      },
      {
        id: 'PAY-002',
        invoiceId: 'INV-2024-002',
        customerName: 'Tech Innovations Ltd',
        amount: 8500,
        status: 'completed',
        provider: 'tempo',
        timestamp: new Date(Date.now() - 120000),
        settlementTime: 2,
        fee: 85
      },
      {
        id: 'PAY-003',
        invoiceId: 'INV-2024-003',
        customerName: 'Global Services Inc',
        amount: 25000,
        status: 'pending',
        provider: 'ach',
        timestamp: new Date(Date.now() - 180000)
      },
      {
        id: 'PAY-004',
        invoiceId: 'INV-2024-004',
        customerName: 'Retail Solutions',
        amount: 3200,
        status: 'failed',
        provider: 'circle',
        timestamp: new Date(Date.now() - 300000),
        errorMessage: 'Insufficient funds'
      },
      {
        id: 'PAY-005',
        invoiceId: 'INV-2024-005',
        customerName: 'Enterprise Systems',
        amount: 50000,
        status: 'completed',
        provider: 'wire',
        timestamp: new Date(Date.now() - 600000),
        settlementTime: 180,
        fee: 25
      }
    ];
  };

  const generateMockStats = (): PaymentStats => {
    return {
      totalVolume: 101700,
      totalTransactions: 5,
      successRate: 60,
      averageSettlementTime: 75.5,
      pendingPayments: 1,
      failedPayments: 1
    };
  };

  const retryPayment = async (paymentId: string) => {
    setLoading(true);
    try {
      await apiService.retryPayment(paymentId);
      await fetchPayments();
      toast({
        title: "Payment retry initiated",
        description: `Payment ${paymentId} is being processed`,
      });
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast({
        title: "Retry failed",
        description: "Could not retry the payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelPayment = async (paymentId: string) => {
    setLoading(true);
    try {
      await apiService.cancelPayment(paymentId);
      await fetchPayments();
      toast({
        title: "Payment cancelled",
        description: `Payment ${paymentId} has been cancelled`,
      });
    } catch (error) {
      console.error('Error cancelling payment:', error);
      toast({
        title: "Cancellation failed",
        description: "Could not cancel the payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesProvider = filterProvider === 'all' || payment.provider === filterProvider;

    return matchesSearch && matchesStatus && matchesProvider;
  });

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Settlement</p>
                <p className="text-2xl font-bold">{stats.averageSettlementTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{stats.failedPayments}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Payment Processing</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchPayments();
                  fetchStats();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Now
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer or invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProvider} onValueChange={setFilterProvider}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="tempo">Tempo</SelectItem>
                <SelectItem value="ach">ACH</SelectItem>
                <SelectItem value="wire">Wire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Payment ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Provider</th>
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Settlement</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className="font-mono text-sm">{payment.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{payment.customerName}</p>
                        <p className="text-sm text-gray-500">{payment.invoiceId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">${payment.amount.toLocaleString()}</span>
                      {payment.fee && (
                        <p className="text-xs text-gray-500">Fee: ${payment.fee}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      {payment.errorMessage && (
                        <p className="text-xs text-red-500 mt-1">{payment.errorMessage}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{payment.provider.toUpperCase()}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{format(payment.timestamp, 'MMM dd, HH:mm')}</p>
                    </td>
                    <td className="py-3 px-4">
                      {payment.settlementTime ? (
                        <span className="text-sm">{payment.settlementTime}s</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {payment.status === 'failed' && (
                            <DropdownMenuItem onClick={() => retryPayment(payment.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                          {(payment.status === 'pending' || payment.status === 'processing') && (
                            <DropdownMenuItem
                              onClick={() => cancelPayment(payment.id)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />
                            Send Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payments found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProcessingDashboard;