'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Copy,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Loader2,
  DollarSign,
  Calendar,
  Building,
  ExternalLink,
  Receipt,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoice_number: string;
  recipient: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  paid_amount: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  solana_token_address?: string;
  provider: 'tempo' | 'circle';
  description?: string;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Mock data for demonstration
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoice_number: 'INV-202409-0001',
          recipient: {
            id: '1',
            name: 'Acme Corporation',
            email: 'billing@acme.com'
          },
          amount: 15000.00,
          paid_amount: 15000.00,
          status: 'paid',
          due_date: '2024-10-15',
          created_at: '2024-09-15T10:00:00Z',
          solana_token_address: 'Sol' + Math.random().toString(36).substring(2, 45),
          provider: 'tempo',
          description: 'Monthly SaaS subscription'
        },
        {
          id: '2',
          invoice_number: 'INV-202409-0002',
          recipient: {
            id: '2',
            name: 'TechStart Inc',
            email: 'finance@techstart.com'
          },
          amount: 8500.00,
          paid_amount: 4250.00,
          status: 'partial',
          due_date: '2024-10-20',
          created_at: '2024-09-20T14:30:00Z',
          solana_token_address: 'Sol' + Math.random().toString(36).substring(2, 45),
          provider: 'circle',
          description: 'Consulting services'
        },
        {
          id: '3',
          invoice_number: 'INV-202409-0003',
          recipient: {
            id: '3',
            name: 'Global Logistics',
            email: 'accounts@globallog.com'
          },
          amount: 25750.00,
          paid_amount: 0,
          status: 'pending',
          due_date: '2024-10-25',
          created_at: '2024-09-25T09:15:00Z',
          solana_token_address: 'Sol' + Math.random().toString(36).substring(2, 45),
          provider: 'tempo',
          description: 'Shipping and handling'
        },
        {
          id: '4',
          invoice_number: 'INV-202409-0004',
          recipient: {
            id: '4',
            name: 'Digital Services Ltd',
            email: 'pay@digitalserv.com'
          },
          amount: 3200.00,
          paid_amount: 0,
          status: 'overdue',
          due_date: '2024-09-10',
          created_at: '2024-08-10T11:45:00Z',
          solana_token_address: 'Sol' + Math.random().toString(36).substring(2, 45),
          provider: 'tempo',
          description: 'API integration services'
        },
        {
          id: '5',
          invoice_number: 'INV-202409-0005',
          recipient: {
            id: '5',
            name: 'Enterprise Solutions',
            email: 'invoice@enterprise.com'
          },
          amount: 45000.00,
          paid_amount: 45000.00,
          status: 'paid',
          due_date: '2024-09-30',
          created_at: '2024-09-01T08:00:00Z',
          solana_token_address: 'Sol' + Math.random().toString(36).substring(2, 45),
          provider: 'circle',
          description: 'Enterprise license renewal'
        }
      ];

      // Apply status filter
      let filtered = mockInvoices;
      if (statusFilter !== 'all') {
        filtered = mockInvoices.filter(inv => inv.status === statusFilter);
      }

      setInvoices(filtered);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchInvoices(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-600"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProviderBadge = (provider: string) => {
    return provider === 'tempo' ? (
      <Badge variant="outline" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Tempo
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs">
        <DollarSign className="h-3 w-3 mr-1" />
        Circle
      </Badge>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: invoices.length,
    totalValue: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tokenized Invoices</h1>
            <p className="text-muted-foreground mt-1">
              Manage your Solana blockchain invoices
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
            <Link href="/treasury/create-invoice">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(0) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice List</CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-[300px]"
                  />
                </div>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowDetails(true);
                    }}
                  >
                    <TableCell className="font-mono text-sm">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.recipient.name}</p>
                        <p className="text-xs text-muted-foreground">{invoice.recipient.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">
                          ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        {invoice.paid_amount > 0 && invoice.paid_amount < invoice.amount && (
                          <p className="text-xs text-green-600">
                            ${invoice.paid_amount.toFixed(2)} paid
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getProviderBadge(invoice.provider)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Invoice ID
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Explorer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No invoices found</p>
                <Link href="/treasury/create-invoice">
                  <Button variant="outline" className="mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Invoice
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Invoice #{selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedInvoice.recipient.name}</p>
                  <p className="text-sm">{selectedInvoice.recipient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-lg">
                    ${selectedInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  {selectedInvoice.paid_amount > 0 && (
                    <p className="text-sm text-green-600">
                      ${selectedInvoice.paid_amount.toFixed(2)} paid
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Blockchain Details</p>
                <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Token Address</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs">
                        {selectedInvoice.solana_token_address?.slice(0, 8)}...
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(selectedInvoice.solana_token_address || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Provider</span>
                    {getProviderBadge(selectedInvoice.provider)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tokenization Cost</span>
                    <Badge variant="secondary" className="text-xs">$0.00005</Badge>
                  </div>
                </div>
              </div>

              {selectedInvoice.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{selectedInvoice.description}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Solana Explorer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}