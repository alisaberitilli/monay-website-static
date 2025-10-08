'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  CreditCard,
  Users,
  DollarSign,
  Hash,
  Zap
} from 'lucide-react';

interface BulkInvoice {
  id: string;
  vendorName: string;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
  email?: string;
  walletMode?: 'ephemeral' | 'persistent' | 'adaptive';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  walletAddress?: string;
  error?: string;
}

interface ProcessingStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  totalAmount: number;
}

export default function BulkInvoiceProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [invoices, setInvoices] = useState<BulkInvoice[]>([]);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<ProcessingStats>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    totalAmount: 0
  });
  const [selectedProvider, setSelectedProvider] = useState('tempo');

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      parseCSV(uploadedFile);
    }
  }, []);

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const parsedInvoices: BulkInvoice[] = [];
    let totalAmount = 0;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const invoice: BulkInvoice = {
          id: `inv-${Date.now()}-${i}`,
          vendorName: values[0],
          amount: parseFloat(values[1]),
          currency: values[2] || 'USD',
          dueDate: values[3],
          description: values[4],
          email: values[5],
          walletMode: 'ephemeral',
          status: 'pending'
        };
        parsedInvoices.push(invoice);
        totalAmount += invoice.amount;
      }
    }

    setInvoices(parsedInvoices);
    setStats({
      total: parsedInvoices.length,
      processed: 0,
      successful: 0,
      failed: 0,
      totalAmount
    });
  };

  const processBulkInvoices = async () => {
    setProcessing(true);
    const updatedInvoices = [...invoices];
    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < updatedInvoices.length; i++) {
      const invoice = updatedInvoices[i];
      invoice.status = 'processing';
      setInvoices([...updatedInvoices]);

      try {
        // Simulate API call to create invoice wallet
        const response = await fetch('http://localhost:3001/api/invoice-wallets/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            amount: invoice.amount,
            currency: invoice.currency,
            vendorName: invoice.vendorName,
            mode: invoice.walletMode,
            provider: selectedProvider
          })
        });

        if (response.ok) {
          const data = await response.json();
          invoice.status = 'completed';
          invoice.walletAddress = data.walletAddress;
          successful++;
        } else {
          invoice.status = 'failed';
          invoice.error = 'Failed to create wallet';
          failed++;
        }
      } catch (error) {
        invoice.status = 'failed';
        invoice.error = 'Network error';
        failed++;
      }

      processed++;
      setStats(prev => ({
        ...prev,
        processed,
        successful,
        failed
      }));

      // Update UI with delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setProcessing(false);
  };

  const downloadResults = () => {
    const csv = [
      ['Vendor Name', 'Amount', 'Currency', 'Due Date', 'Status', 'Wallet Address', 'Error'],
      ...invoices.map(inv => [
        inv.vendorName,
        inv.amount,
        inv.currency,
        inv.dueDate,
        inv.status,
        inv.walletAddress || '',
        inv.error || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-invoices-${Date.now()}.csv`;
    a.click();
  };

  const downloadTemplate = () => {
    const template = 'Vendor Name,Amount,Currency,Due Date,Description,Email\n' +
      'Acme Corp,5000,USD,2025-02-01,Monthly Software License,billing@acme.com\n' +
      'Tech Solutions,2500,USD,2025-02-15,Consulting Services,accounts@techsolutions.com';

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice-template.csv';
    a.click();
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Bulk Invoice Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Provider</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedProvider === 'tempo' ? 'default' : 'outline'}
                  onClick={() => setSelectedProvider('tempo')}
                  className={selectedProvider === 'tempo' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Tempo (Primary)
                </Button>
                <Button
                  size="sm"
                  variant={selectedProvider === 'circle' ? 'default' : 'outline'}
                  onClick={() => setSelectedProvider('circle')}
                  className={selectedProvider === 'circle' ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Circle
                </Button>
                <Button
                  size="sm"
                  variant={selectedProvider === 'stripe' ? 'default' : 'outline'}
                  onClick={() => setSelectedProvider('stripe')}
                  className={selectedProvider === 'stripe' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Stripe
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {!file ? (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload CSV file with invoice data</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-500"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">or</p>
                  <button
                    onClick={downloadTemplate}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Download CSV Template
                  </button>
                </>
              ) : (
                <div>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-600">{stats.total} invoices ready to process</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Stats */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
            </div>

            {processing && (
              <div className="mb-4">
                <Progress value={(stats.processed / stats.total) * 100} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  Processing {stats.processed} of {stats.total} invoices...
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={processBulkInvoices}
                disabled={processing || stats.processed === stats.total}
                className="bg-orange-400 hover:bg-orange-500"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Process All Invoices
                  </>
                )}
              </Button>
              {stats.processed > 0 && (
                <Button variant="outline" onClick={downloadResults}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice List */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Vendor</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-left p-2">Due Date</th>
                    <th className="text-left p-2">Wallet Address</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 10).map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{getStatusIcon(invoice.status)}</td>
                      <td className="p-2">{invoice.vendorName}</td>
                      <td className="p-2 text-right">${invoice.amount.toFixed(2)}</td>
                      <td className="p-2">{invoice.dueDate}</td>
                      <td className="p-2 font-mono text-xs">
                        {invoice.walletAddress ? (
                          <span className="text-green-600">{invoice.walletAddress.slice(0, 10)}...</span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length > 10 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing 10 of {invoices.length} invoices
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}