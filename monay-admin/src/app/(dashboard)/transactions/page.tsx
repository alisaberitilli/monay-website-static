'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { 
  CreditCard, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  FileText,
  MoreVertical,
  Eye,
  Copy,
  Ban,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, BarChart, DonutChart } from '@tremor/react';

interface Transaction {
  id: string;
  reference: string;
  type: 'credit' | 'debit' | 'transfer' | 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description: string;
  category: string;
  date: string;
  time: string;
  from: string;
  to: string;
  fee: number;
  balance: number;
}

export default function TransactionsPage() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel' | 'pdf'>('csv');
  const [exportDateRange, setExportDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportIncludeFields, setExportIncludeFields] = useState({
    reference: true,
    type: true,
    amount: true,
    currency: true,
    status: true,
    description: true,
    category: true,
    date: true,
    time: true,
    from: true,
    to: true,
    fee: true,
    balance: true,
  });
  const [exportNotes, setExportNotes] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      reference: 'TXN-2024-001',
      type: 'credit',
      amount: 5000.00,
      currency: 'USD',
      status: 'completed',
      description: 'Salary payment - August 2024',
      category: 'Income',
      date: '2024-08-23',
      time: '14:30',
      from: 'Employer Corp',
      to: 'Main Wallet',
      fee: 0,
      balance: 23500.00,
    },
    {
      id: '2',
      reference: 'TXN-2024-002',
      type: 'debit',
      amount: 1200.00,
      currency: 'USD',
      status: 'completed',
      description: 'Rent payment',
      category: 'Housing',
      date: '2024-08-23',
      time: '10:15',
      from: 'Main Wallet',
      to: 'Landlord Properties',
      fee: 2.50,
      balance: 18500.00,
    },
    {
      id: '3',
      reference: 'TXN-2024-003',
      type: 'transfer',
      amount: 500.00,
      currency: 'USD',
      status: 'pending',
      description: 'Transfer to savings',
      category: 'Savings',
      date: '2024-08-23',
      time: '09:45',
      from: 'Main Wallet',
      to: 'Savings Wallet',
      fee: 0,
      balance: 19700.00,
    },
    {
      id: '4',
      reference: 'TXN-2024-004',
      type: 'payment',
      amount: 89.99,
      currency: 'USD',
      status: 'completed',
      description: 'Netflix subscription',
      category: 'Entertainment',
      date: '2024-08-22',
      time: '18:20',
      from: 'Main Wallet',
      to: 'Netflix Inc.',
      fee: 0,
      balance: 20200.00,
    },
    {
      id: '5',
      reference: 'TXN-2024-005',
      type: 'credit',
      amount: 2500.00,
      currency: 'USD',
      status: 'completed',
      description: 'Freelance project payment',
      category: 'Income',
      date: '2024-08-22',
      time: '15:00',
      from: 'Client ABC',
      to: 'Business Wallet',
      fee: 25.00,
      balance: 20289.99,
    },
    {
      id: '6',
      reference: 'TXN-2024-006',
      type: 'refund',
      amount: 45.00,
      currency: 'USD',
      status: 'completed',
      description: 'Product return refund',
      category: 'Shopping',
      date: '2024-08-21',
      time: '11:30',
      from: 'Amazon',
      to: 'Main Wallet',
      fee: 0,
      balance: 17789.99,
    },
    {
      id: '7',
      reference: 'TXN-2024-007',
      type: 'debit',
      amount: 350.00,
      currency: 'USD',
      status: 'failed',
      description: 'Insurance payment',
      category: 'Insurance',
      date: '2024-08-21',
      time: '08:00',
      from: 'Main Wallet',
      to: 'Insurance Co.',
      fee: 5.00,
      balance: 17744.99,
    },
    {
      id: '8',
      reference: 'TXN-2024-008',
      type: 'payment',
      amount: 250.00,
      currency: 'USD',
      status: 'cancelled',
      description: 'Hotel booking',
      category: 'Travel',
      date: '2024-08-20',
      time: '19:15',
      from: 'Main Wallet',
      to: 'Hotel Chain',
      fee: 10.00,
      balance: 17744.99,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate statistics
  const totalTransactions = transactions.length;
  const totalCredits = transactions
    .filter(t => (t.type === 'credit' || t.type === 'refund') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter(t => (t.type === 'debit' || t.type === 'payment' || t.type === 'transfer') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const failedCount = transactions.filter(t => t.status === 'failed').length;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = 
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.to.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      // Simple date range filter
      let matchesDate = true;
      if (dateRange !== 'all') {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (dateRange) {
          case 'today':
            matchesDate = transactionDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchesDate = transactionDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            matchesDate = transactionDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [transactions, searchTerm, typeFilter, statusFilter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Chart data - Transaction Flow over time
  const chartData = [
    { date: 'Aug 17', Credits: 3200, Debits: 2100 },
    { date: 'Aug 18', Credits: 4500, Debits: 3200 },
    { date: 'Aug 19', Credits: 2800, Debits: 1900 },
    { date: 'Aug 20', Credits: 5200, Debits: 4100 },
    { date: 'Aug 21', Credits: 3900, Debits: 2800 },
    { date: 'Aug 22', Credits: 7500, Debits: 3500 },
    { date: 'Aug 23', Credits: 5000, Debits: 2200 },
  ];

  // Shared color mapping for consistency across charts - using simple Tremor color names
  const categoryColors = ['blue', 'violet', 'amber', 'emerald', 'rose', 'cyan', 'indigo', 'slate'];
  const categoryColorHex = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4', '#6366f1', '#64748b'];

  // For Donut Chart - with dynamic colors
  const categoryData = [
    { category: 'Housing', amount: 3600 },
    { category: 'Shopping', amount: 2200 },
    { category: 'Food', amount: 1800 },
    { category: 'Transport', amount: 900 },
    { category: 'Entertainment', amount: 650 },
    { category: 'Utilities', amount: 450 },
    { category: 'Healthcare', amount: 350 },
    { category: 'Other', amount: 250 },
  ];

  // Create color mapping for legends
  const categoryColorMapping = categoryData.map((item, index) => ({
    ...item,
    color: categoryColors[index],
    hexColor: categoryColorHex[index]
  }));

  // For Bar Chart - Monthly spending by category
  const monthlySpending = [
    { month: 'Jun', Housing: 3100, Shopping: 1700, Food: 1500, Transport: 750, Entertainment: 380, Utilities: 420, Healthcare: 300, Other: 850 },
    { month: 'Jul', Housing: 3200, Shopping: 1800, Food: 1600, Transport: 800, Entertainment: 400, Utilities: 430, Healthcare: 320, Other: 900 },
    { month: 'Aug', Housing: 3600, Shopping: 2200, Food: 1800, Transport: 900, Entertainment: 650, Utilities: 450, Healthcare: 350, Other: 250 },
  ];

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'credit': case 'refund': 
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'debit': case 'payment': case 'transfer':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <Ban className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleRetryTransaction = (transaction: Transaction) => {
    toast.success(`Retrying transaction ${transaction.reference}...`);
    // Update transaction status
    setTransactions(prev => prev.map(t => 
      t.id === transaction.id 
        ? { ...t, status: 'pending' as Transaction['status'] }
        : t
    ));
  };

  const handleCancelTransaction = (transaction: Transaction) => {
    toast.success(`Transaction ${transaction.reference} cancelled`);
    // Update transaction status
    setTransactions(prev => prev.map(t => 
      t.id === transaction.id 
        ? { ...t, status: 'cancelled' as Transaction['status'] }
        : t
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const performExport = async () => {
    setIsExporting(true);

    try {
      // Filter transactions based on date range
      let dataToExport = [...filteredTransactions];

      if (exportDateRange === 'today') {
        const today = new Date().toISOString().split('T')[0];
        dataToExport = dataToExport.filter(t => t.date === today);
      } else if (exportDateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dataToExport = dataToExport.filter(t => new Date(t.date) >= weekAgo);
      } else if (exportDateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dataToExport = dataToExport.filter(t => new Date(t.date) >= monthAgo);
      } else if (exportDateRange === 'custom' && exportStartDate && exportEndDate) {
        dataToExport = dataToExport.filter(t =>
          t.date >= exportStartDate && t.date <= exportEndDate
        );
      }

      // Build field list based on selected fields
      const fields = Object.entries(exportIncludeFields)
        .filter(([_, included]) => included)
        .map(([field, _]) => field);

      if (exportFormat === 'csv') {
        const csv = [
          fields.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(','),
          ...dataToExport.map(t => fields.map(field => String(t[field as keyof Transaction])).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else if (exportFormat === 'json') {
        const jsonData = dataToExport.map(t => {
          const obj: any = {};
          fields.forEach(field => {
            obj[field] = t[field as keyof Transaction];
          });
          return obj;
        });

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      } else {
        // For Excel and PDF, we'd normally use libraries like xlsx or jsPDF
        toast.success(`${exportFormat.toUpperCase()} export will be implemented with appropriate libraries`);
      }

      toast.success(`Exported ${dataToExport.length} transactions as ${exportFormat.toUpperCase()}`);

      setShowExportModal(false);
      // Reset export settings
      setExportDateRange('all');
      setExportNotes('');
    } catch (error) {
      toast.error('Failed to export transactions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transaction Management</h1>
          <p className="text-gray-600">Monitor and manage all your transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Debits</p>
                <p className="text-2xl font-bold text-red-600">
                  ${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
                {failedCount > 0 && (
                  <p className="text-sm text-red-600">{failedCount} failed</p>
                )}
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Transaction Flow
            </CardTitle>
            <p className="text-sm text-muted-foreground">Daily credits vs debits trend</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <AreaChart
                className="h-full"
                data={chartData}
                index="date"
                categories={["Credits", "Debits"]}
                colors={["emerald", "rose"]}
                valueFormatter={(value) => `$${value.toLocaleString()}`}
                showAnimation={true}
                showLegend={true}
                showGridLines={false}
                curveType="monotone"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Spending by Category
            </CardTitle>
            <p className="text-sm text-muted-foreground">Current month breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <DonutChart
                className="h-full"
                data={categoryData}
                category="amount"
                index="category"
                valueFormatter={(value) => `$${value.toLocaleString()}`}
                showAnimation={true}
                showLabel={true}
                showTooltip={true}
                showLegend={true}
                label="$10,200"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {categoryColorMapping.map((item, index) => (
                <div key={item.category} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.hexColor }}
                  ></div>
                  <span className="text-muted-foreground">{item.category}: ${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Spending Trend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Spending Trend
          </CardTitle>
          <p className="text-sm text-muted-foreground">Spending breakdown by category over months</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <BarChart
              className="h-full"
              data={monthlySpending}
              index="month"
              categories={["Housing", "Shopping", "Food", "Transport", "Entertainment", "Utilities", "Healthcare", "Other"]}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              showAnimation={true}
              showLegend={true}
              showGridLines={false}
              stack={true}
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
            {categoryColorMapping.map((item, index) => (
              <div key={item.category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.hexColor }}
                ></div>
                <span className="text-muted-foreground text-xs">{item.category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, description, or party..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Transaction History ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      <span className="font-medium">{transaction.reference}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{transaction.type}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.from} → {transaction.to}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      transaction.type === 'credit' || transaction.type === 'refund'
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' || transaction.type === 'refund' ? '+' : '-'}
                      ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    {transaction.fee > 0 && (
                      <p className="text-xs text-muted-foreground">Fee: ${transaction.fee}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{new Date(transaction.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{transaction.time}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {transaction.status === 'failed' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRetryTransaction(transaction)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      {transaction.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCancelTransaction(transaction)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No transactions found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                    if (pageNumber > totalPages) return null;
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Reference</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{selectedTransaction.reference}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedTransaction.reference)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="font-medium">{selectedTransaction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{selectedTransaction.from}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">{selectedTransaction.to}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    ${selectedTransaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {selectedTransaction.fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transaction Fee</span>
                    <span className="font-medium">
                      ${selectedTransaction.fee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">
                    ${(selectedTransaction.amount + selectedTransaction.fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedTransaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedTransaction.time}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Balance After</p>
                <p className="font-medium">
                  ${selectedTransaction.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            {selectedTransaction?.status === 'failed' && (
              <Button onClick={() => {
                handleRetryTransaction(selectedTransaction);
                setShowDetailsModal(false);
              }}>
                Retry Transaction
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
            <DialogDescription>
              Configure your export settings and choose the format for your transaction data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Export Format */}
            <div className="space-y-3">
              <Label>Export Format</Label>
              <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as any)}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">CSV</p>
                        <p className="text-sm text-gray-500">Comma-separated values, Excel compatible</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="json" id="json" />
                    <Label htmlFor="json" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">JSON</p>
                        <p className="text-sm text-gray-500">JavaScript Object Notation</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 opacity-50">
                    <RadioGroupItem value="excel" id="excel" disabled />
                    <Label htmlFor="excel" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Excel</p>
                        <p className="text-sm text-gray-500">Microsoft Excel format (Coming soon)</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 opacity-50">
                    <RadioGroupItem value="pdf" id="pdf" disabled />
                    <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">PDF</p>
                        <p className="text-sm text-gray-500">Formatted report (Coming soon)</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label>Date Range</Label>
              <Select value={exportDateRange} onValueChange={(value) => setExportDateRange(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {exportDateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fields to Include */}
            <div className="space-y-3">
              <Label>Fields to Include</Label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(exportIncludeFields).map(([field, included]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={included}
                      onCheckedChange={(checked) =>
                        setExportIncludeFields(prev => ({ ...prev, [field]: checked as boolean }))
                      }
                    />
                    <Label htmlFor={field} className="text-sm capitalize cursor-pointer">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Database Safety Notice */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Data Safety:</strong> This export will create a READ-ONLY copy of your transaction data.
                No records will be modified or deleted from the database. The export file will be downloaded
                to your local device.
              </AlertDescription>
            </Alert>

            {/* Export Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Export Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this export for your records..."
                value={exportNotes}
                onChange={(e) => setExportNotes(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-sm text-gray-500">
                These notes will be included in the export metadata
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="font-medium">Export Summary</p>
              <div className="text-sm space-y-1">
                <p>• Format: <strong>{exportFormat.toUpperCase()}</strong></p>
                <p>• Date Range: <strong>{exportDateRange === 'custom' ? `${exportStartDate} to ${exportEndDate}` : exportDateRange}</strong></p>
                <p>• Fields: <strong>{Object.values(exportIncludeFields).filter(Boolean).length} selected</strong></p>
                <p>• Records: <strong>{filteredTransactions.length} transactions</strong></p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button
              onClick={performExport}
              disabled={isExporting || Object.values(exportIncludeFields).filter(Boolean).length === 0}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}