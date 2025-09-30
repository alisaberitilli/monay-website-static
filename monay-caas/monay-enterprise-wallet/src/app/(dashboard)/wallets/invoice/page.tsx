'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Plus,
  Search,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Eye,
  Send,
  Wallet,
  Building,
  Users
} from 'lucide-react';

interface InvoiceWallet {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'paid' | 'expired' | 'cancelled';
  createdDate: Date;
  expiryDate: Date;
  walletAddress: string;
  network: string;
  paymentReceived: number;
  remainingBalance: number;
  description: string;
  tags: string[];
}

export default function InvoiceWalletsPage() {
  const [invoiceWallets, setInvoiceWallets] = useState<InvoiceWallet[]>([
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Acme Corporation',
      amount: 50000,
      currency: 'USDC',
      status: 'active',
      createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      network: 'Base L2',
      paymentReceived: 30000,
      remainingBalance: 20000,
      description: 'Q4 Consulting Services',
      tags: ['consulting', 'enterprise']
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      clientName: 'TechStart Inc.',
      amount: 25000,
      currency: 'USDC',
      status: 'paid',
      createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      expiryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      walletAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA22',
      network: 'Base L2',
      paymentReceived: 25000,
      remainingBalance: 0,
      description: 'Software Development Package',
      tags: ['development', 'software']
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Global Solutions Ltd.',
      amount: 75000,
      currency: 'USDT',
      status: 'pending',
      createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
      walletAddress: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE',
      network: 'Base L2',
      paymentReceived: 0,
      remainingBalance: 75000,
      description: 'Enterprise Integration Services',
      tags: ['integration', 'enterprise']
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2024-004',
      clientName: 'Startup Hub',
      amount: 15000,
      currency: 'USDXM',
      status: 'expired',
      createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      expiryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      walletAddress: '0x9f4A8C8EbC7D5F1a3B2E6D4C8A7B5E9F2C1A8D6E',
      network: 'Base L2',
      paymentReceived: 5000,
      remainingBalance: 10000,
      description: 'Product Development Consultation',
      tags: ['consultation', 'product']
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = invoiceWallets.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = invoiceWallets
    .filter(inv => inv.status === 'active' || inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.remainingBalance, 0);

  const totalReceived = invoiceWallets.reduce((sum, inv) => sum + inv.paymentReceived, 0);
  const activeInvoices = invoiceWallets.filter(inv => inv.status === 'active').length;
  const paidInvoices = invoiceWallets.filter(inv => inv.status === 'paid').length;

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'USD' || currency === 'USDC' || currency === 'USDT' || currency === 'USDXM') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPaymentProgress = (received: number, total: number) => {
    return Math.round((received / total) * 100);
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice-First Wallets</h1>
          <p className="text-gray-600 mt-1">Dedicated wallets for invoice-based payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Invoices
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice Wallet
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Outstanding Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalOutstanding)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-600">Pending collection</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalReceived)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Across all invoice wallets
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvoices}</div>
            <div className="text-xs text-gray-500 mt-1">
              Awaiting payment
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Payment Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((paidInvoices / invoiceWallets.length) * 100)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {paidInvoices} of {invoiceWallets.length} paid
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search invoices by number, client, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoice Wallets</TabsTrigger>
          <TabsTrigger value="analytics">Payment Analytics</TabsTrigger>
          <TabsTrigger value="templates">Invoice Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Wallets</CardTitle>
              <CardDescription>
                {filteredInvoices.length} invoice wallets found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-500">{invoice.clientName}</div>
                          <div className="text-xs text-gray-400">{invoice.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Invoice Amount</div>
                        <div className="font-semibold">
                          {formatCurrency(invoice.amount)} {invoice.currency}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Received</div>
                        <div className="font-semibold">
                          {formatCurrency(invoice.paymentReceived)} {invoice.currency}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Remaining</div>
                        <div className="font-semibold">
                          {formatCurrency(invoice.remainingBalance)} {invoice.currency}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Expiry</div>
                        <div className="font-semibold">
                          {formatDate(invoice.expiryDate)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {getDaysUntilExpiry(invoice.expiryDate) > 0
                            ? `${getDaysUntilExpiry(invoice.expiryDate)} days left`
                            : 'Expired'
                          }
                        </div>
                      </div>
                    </div>

                    {invoice.paymentReceived > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Payment Progress</span>
                          <span>{getPaymentProgress(invoice.paymentReceived, invoice.amount)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getPaymentProgress(invoice.paymentReceived, invoice.amount)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          <Wallet className="w-4 h-4 inline mr-1" />
                          {invoice.walletAddress.slice(0, 8)}...{invoice.walletAddress.slice(-6)}
                        </span>
                        <span>
                          <Building className="w-4 h-4 inline mr-1" />
                          {invoice.network}
                        </span>
                        <span>
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Created {formatTimeAgo(invoice.createdDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {invoice.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {(invoice.status === 'active' || invoice.status === 'pending') && (
                        <Button
                          size="sm"
                          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>Invoice payment trends and client analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Payment Analytics</h3>
                <p className="text-gray-600">
                  Detailed payment analytics and trends coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Templates</CardTitle>
              <CardDescription>Pre-configured templates for different invoice types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Invoice Templates</h3>
                <p className="text-gray-600">
                  Customizable invoice templates coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Wallet Settings</CardTitle>
              <CardDescription>Configure invoice wallet behavior and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Wallet Settings</h3>
                <p className="text-gray-600">
                  Advanced wallet configuration options coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}