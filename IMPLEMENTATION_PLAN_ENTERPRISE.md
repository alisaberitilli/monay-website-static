# Implementation Plan: Monay-CaaS Enterprise Wallet (Port 3007)
## Invoice-First Architecture Integration

**Date**: October 2025
**Component**: monay-caas/monay-enterprise-wallet
**Port**: 3007
**Dependencies**: monay-backend-common (Port 3001)
**Session Type**: Enterprise Wallet Team

---

## 🎯 OBJECTIVE

Transform the Enterprise Wallet platform to fully embrace Invoice-First architecture, enabling enterprises to create wallets directly from invoices, manage bulk invoice operations, and leverage ephemeral wallets for temporary vendor payments and payroll disbursements.

---

## 🏢 ENTERPRISE WALLET SCOPE

### Primary Features
1. **Enterprise Invoice Wallet Creation** - Create corporate wallets from invoices
2. **Bulk Invoice Processing** - Handle thousands of invoices simultaneously
3. **Vendor Payment Automation** - Ephemeral wallets for vendor payments
4. **Payroll Disbursement** - Temporary wallets for salary payments
5. **Department Budget Wallets** - Departmental expense management
6. **Multi-Signature Approvals** - Complex approval workflows for high-value invoices

---

## 🗂️ FILE STRUCTURE & COMPONENTS

```
monay-caas/monay-enterprise-wallet/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── invoices/              # ENHANCED: Invoice-First management
│   │   │   │   ├── page.tsx          # Invoice list with wallet creation
│   │   │   │   ├── create/           # Create invoice → Generate wallet
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── bulk/             # NEW: Bulk invoice processing
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Invoice details with wallet status
│   │   │   ├── wallets/
│   │   │   │   ├── corporate/        # ENHANCED: Corporate wallets from invoices
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── create/       # Create wallet from invoice
│   │   │   │   ├── departments/      # Department budget wallets
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── vendor/           # NEW: Vendor payment wallets
│   │   │   │   │   └── page.tsx
│   │   │   │   └── payroll/          # NEW: Payroll disbursement wallets
│   │   │   │       └── page.tsx
│   │   │   ├── payments/
│   │   │   │   ├── send/             # ENHANCED: Invoice-based payments
│   │   │   │   ├── bulk/             # Bulk payment processing
│   │   │   │   └── scheduled/        # NEW: Scheduled invoice payments
│   │   │   └── dashboard/
│   │   │       └── page.tsx          # ENHANCED: Invoice-First metrics
│   │   └── api/
│   │       └── invoice-wallets/      # NEW: Invoice wallet APIs
│   ├── components/
│   │   ├── invoices/                 # Invoice-First components
│   │   │   ├── InvoiceWalletCreator.tsx    # Create wallet from invoice
│   │   │   ├── BulkInvoiceProcessor.tsx    # Bulk invoice handling
│   │   │   ├── InvoicePaymentFlow.tsx      # Payment flow UI
│   │   │   └── InvoiceWalletStatus.tsx     # Wallet lifecycle status
│   │   ├── wallets/
│   │   │   ├── EnterpriseWalletCard.tsx    # ENHANCED: Show invoice origin
│   │   │   ├── VendorWalletManager.tsx     # NEW: Vendor wallet management
│   │   │   ├── PayrollWalletGrid.tsx       # NEW: Payroll wallet grid
│   │   │   └── EphemeralWalletMonitor.tsx  # NEW: Monitor temp wallets
│   │   └── approvals/                # NEW: Multi-sig components
│   │       ├── ApprovalWorkflow.tsx
│   │       ├── SignatureCollector.tsx
│   │       └── ApprovalStatus.tsx
│   └── services/
│       ├── enterprise-invoice.service.ts    # NEW: Enterprise invoice APIs
│       ├── bulk-processing.service.ts       # NEW: Bulk operations
│       ├── vendor-wallet.service.ts         # NEW: Vendor wallet management
│       ├── payroll.service.ts              # NEW: Payroll disbursement
│       └── approval.service.ts             # NEW: Multi-sig approvals
```

---

## 📋 IMPLEMENTATION PHASES

### Phase 1: Invoice-to-Wallet Core (Week 1)

#### 1.1 Enhanced Invoice Creation Page

```typescript
// src/app/(dashboard)/invoices/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EnterpriseInvoiceService } from '@/services/enterprise-invoice.service';
import { FileText, Wallet, Clock, Shield, DollarSign } from '@monay/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InvoiceForm {
  // Invoice Details
  invoiceNumber: string;
  vendorId: string;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;

  // Wallet Configuration
  createWallet: boolean;
  walletMode: 'ephemeral' | 'persistent' | 'adaptive';
  ttlHours: number;
  requireApproval: boolean;
  approvers: string[];

  // Payment Configuration
  paymentMethod: 'instant' | 'scheduled' | 'manual';
  scheduledDate?: string;
  recurringPayment: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly';
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [invoice, setInvoice] = useState<InvoiceForm>({
    invoiceNumber: '',
    vendorId: '',
    amount: 0,
    currency: 'USD',
    dueDate: '',
    description: '',
    createWallet: true, // Default to Invoice-First approach
    walletMode: 'ephemeral',
    ttlHours: 168, // 7 days default
    requireApproval: false,
    approvers: [],
    paymentMethod: 'manual',
    recurringPayment: false
  });

  const [walletPreview, setWalletPreview] = useState({
    estimatedAddress: '',
    estimatedCreation: new Date(),
    estimatedDestruction: null,
    estimatedCost: 0
  });

  useEffect(() => {
    loadVendorsAndDepartments();
  }, []);

  useEffect(() => {
    // Update wallet preview when configuration changes
    if (invoice.createWallet) {
      updateWalletPreview();
    }
  }, [invoice.walletMode, invoice.ttlHours, invoice.amount]);

  const loadVendorsAndDepartments = async () => {
    const [vendorList, deptList] = await Promise.all([
      EnterpriseInvoiceService.getVendors(),
      EnterpriseInvoiceService.getDepartments()
    ]);
    setVendors(vendorList);
    setDepartments(deptList);
  };

  const updateWalletPreview = () => {
    const now = new Date();
    const destruction = invoice.walletMode === 'ephemeral'
      ? new Date(now.getTime() + invoice.ttlHours * 60 * 60 * 1000)
      : null;

    setWalletPreview({
      estimatedAddress: `0x${Math.random().toString(16).substr(2, 8)}...enterprise`,
      estimatedCreation: now,
      estimatedDestruction: destruction,
      estimatedCost: invoice.amount * 0.001 // 0.1% transaction fee estimate
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create invoice with wallet configuration
      const result = await EnterpriseInvoiceService.createInvoiceWithWallet(invoice);

      // If approval required, redirect to approval workflow
      if (invoice.requireApproval) {
        router.push(`/approvals/${result.approvalId}`);
      } else {
        // Otherwise, go to invoice details with wallet
        router.push(`/invoices/${result.invoiceId}`);
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateWalletCost = () => {
    if (!invoice.createWallet) return 0;

    const baseCost = 0.001; // Base wallet creation cost
    const ttlCost = invoice.walletMode === 'ephemeral'
      ? (invoice.ttlHours / 24) * 0.0001 // Cost per day
      : 0.01; // Persistent wallet flat fee

    return invoice.amount * baseCost + ttlCost;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Create Invoice with Auto-Wallet</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Invoice Form - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice({...invoice, invoiceNumber: e.target.value})}
                    placeholder="INV-2025-001"
                    required
                  />
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Select
                    value={invoice.vendorId}
                    onChange={(e) => setInvoice({...invoice, vendorId: e.target.value})}
                    required
                  >
                    <option value="">Select vendor...</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={invoice.amount}
                    onChange={(e) => setInvoice({...invoice, amount: Number(e.target.value)})}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={invoice.currency}
                    onChange={(e) => setInvoice({...invoice, currency: e.target.value})}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </Select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice({...invoice, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={invoice.description}
                  onChange={(e) => setInvoice({...invoice, description: e.target.value})}
                  placeholder="Invoice description..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Wallet Configuration Card */}
          <Card className={!invoice.createWallet ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Invoice-First Wallet Configuration
                </CardTitle>
                <Switch
                  checked={invoice.createWallet}
                  onCheckedChange={(checked) => setInvoice({...invoice, createWallet: checked})}
                />
              </div>
              <CardDescription>
                Automatically create a wallet when this invoice is approved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Wallet Mode</Label>
                  <Select
                    value={invoice.walletMode}
                    onChange={(e) => setInvoice({...invoice, walletMode: e.target.value as any})}
                    disabled={!invoice.createWallet}
                  >
                    <option value="ephemeral">Ephemeral (Auto-destroy)</option>
                    <option value="persistent">Persistent (Permanent)</option>
                    <option value="adaptive">Adaptive (AI-managed)</option>
                  </Select>
                </div>
                <div>
                  <Label>TTL (Hours)</Label>
                  <Input
                    type="number"
                    value={invoice.ttlHours}
                    onChange={(e) => setInvoice({...invoice, ttlHours: Number(e.target.value)})}
                    min="1"
                    max="8760"
                    disabled={!invoice.createWallet || invoice.walletMode !== 'ephemeral'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {invoice.ttlHours / 24} days until auto-destruction
                  </p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={invoice.paymentMethod}
                    onChange={(e) => setInvoice({...invoice, paymentMethod: e.target.value as any})}
                    disabled={!invoice.createWallet}
                  >
                    <option value="instant">Instant on Creation</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="manual">Manual Approval</option>
                  </Select>
                </div>
              </div>

              {invoice.paymentMethod === 'scheduled' && (
                <div>
                  <Label>Scheduled Payment Date</Label>
                  <Input
                    type="datetime-local"
                    value={invoice.scheduledDate}
                    onChange={(e) => setInvoice({...invoice, scheduledDate: e.target.value})}
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <Switch
                  id="recurring"
                  checked={invoice.recurringPayment}
                  onCheckedChange={(checked) => setInvoice({...invoice, recurringPayment: checked})}
                  disabled={!invoice.createWallet}
                />
                <Label htmlFor="recurring">Recurring Payment</Label>
                {invoice.recurringPayment && (
                  <Select
                    value={invoice.recurringInterval}
                    onChange={(e) => setInvoice({...invoice, recurringInterval: e.target.value as any})}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approval Configuration */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Approval Workflow
                </CardTitle>
                <Switch
                  checked={invoice.requireApproval}
                  onCheckedChange={(checked) => setInvoice({...invoice, requireApproval: checked})}
                />
              </div>
            </CardHeader>
            <CardContent>
              {invoice.requireApproval && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Invoices over $10,000 require at least 2 approvers.
                      The wallet will only be created after all approvals are received.
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Label>Select Approvers</Label>
                    <div className="space-y-2 mt-2">
                      {departments.map(dept => (
                        <label key={dept.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={dept.managerId}
                            checked={invoice.approvers.includes(dept.managerId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInvoice({...invoice, approvers: [...invoice.approvers, dept.managerId]});
                              } else {
                                setInvoice({...invoice, approvers: invoice.approvers.filter(a => a !== dept.managerId)});
                              }
                            }}
                          />
                          {dept.managerName} ({dept.name})
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Wallet Preview */}
        <div className="space-y-6">
          {/* Wallet Preview Card */}
          {invoice.createWallet && (
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Preview
                </CardTitle>
                <CardDescription>
                  This wallet will be created automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Estimated Address</Label>
                  <div className="font-mono text-sm break-all">
                    {walletPreview.estimatedAddress}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Creation Time</Label>
                  <div className="text-sm">
                    {walletPreview.estimatedCreation.toLocaleString()}
                  </div>
                </div>

                {walletPreview.estimatedDestruction && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Auto-Destruction</Label>
                    <div className="text-sm text-red-600">
                      {walletPreview.estimatedDestruction.toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wallet Creation Fee</span>
                    <span className="font-semibold">${calculateWalletCost().toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transaction Fee (est.)</span>
                    <span className="font-semibold">${(invoice.amount * 0.001).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t font-bold">
                    <span>Total Cost</span>
                    <span>${(calculateWalletCost() + invoice.amount * 0.001).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Invoice Amount</span>
                  <span className="font-bold">${invoice.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fees</span>
                  <span>${(calculateWalletCost() + invoice.amount * 0.001).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t text-lg font-bold">
                  <span>Total</span>
                  <span>${(invoice.amount + calculateWalletCost() + invoice.amount * 0.001).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Invoice & Wallet'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### Phase 2: Bulk Invoice Processing (Week 2)

#### 2.1 Bulk Invoice Upload & Processing

```typescript
// src/app/(dashboard)/invoices/bulk/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BulkProcessingService } from '@/services/bulk-processing.service';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from '@monay/icons';
import { DataTable } from '@/components/ui/data-table';

interface BulkInvoice {
  rowNumber: number;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  walletMode: 'ephemeral' | 'persistent';
  ttl: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  walletAddress?: string;
  error?: string;
}

export default function BulkInvoicePage() {
  const [invoices, setInvoices] = useState<BulkInvoice[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    totalAmount: 0,
    walletsCreated: 0
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      parseCSV(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  const parseCSV = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const parsed = await BulkProcessingService.parseInvoiceFile(formData);
      setInvoices(parsed.invoices.map((inv, idx) => ({
        ...inv,
        rowNumber: idx + 1,
        status: 'pending'
      })));
      setSummary({
        ...summary,
        total: parsed.invoices.length,
        totalAmount: parsed.invoices.reduce((sum, inv) => sum + inv.amount, 0)
      });
    } catch (error) {
      alert('Failed to parse file. Please check the format.');
    }
  };

  const processBulkInvoices = async () => {
    setProcessing(true);
    setProgress(0);

    const batchSize = 10; // Process 10 at a time
    const batches = [];

    for (let i = 0; i < invoices.length; i += batchSize) {
      batches.push(invoices.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failCount = 0;
    let walletsCreated = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      // Update status to processing
      setInvoices(prev => prev.map(inv => {
        if (batch.includes(inv)) {
          return { ...inv, status: 'processing' };
        }
        return inv;
      }));

      // Process batch
      const results = await BulkProcessingService.processBatch(batch);

      // Update results
      setInvoices(prev => prev.map(inv => {
        const result = results.find(r => r.invoiceNumber === inv.invoiceNumber);
        if (result) {
          if (result.success) {
            successCount++;
            if (result.walletAddress) walletsCreated++;
            return {
              ...inv,
              status: 'success',
              walletAddress: result.walletAddress
            };
          } else {
            failCount++;
            return {
              ...inv,
              status: 'error',
              error: result.error
            };
          }
        }
        return inv;
      }));

      // Update progress
      setProgress(((batchIndex + 1) / batches.length) * 100);
    }

    // Update summary
    setSummary({
      ...summary,
      successful: successCount,
      failed: failCount,
      walletsCreated
    });

    setProcessing(false);
  };

  const downloadTemplate = () => {
    const csv = 'Invoice Number,Vendor Name,Amount,Due Date,Wallet Mode,TTL Hours\n' +
                'INV-2025-001,Acme Corp,5000.00,2025-11-01,ephemeral,168\n' +
                'INV-2025-002,Global Tech,12500.50,2025-11-15,persistent,0\n' +
                'INV-2025-003,Office Supplies Inc,350.75,2025-10-30,ephemeral,72';

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice_bulk_template.csv';
    a.click();
  };

  const columns = [
    {
      accessorKey: 'rowNumber',
      header: '#',
      cell: ({ row }) => row.original.rowNumber
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
    },
    {
      accessorKey: 'vendorName',
      header: 'Vendor',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `$${row.original.amount.toFixed(2)}`
    },
    {
      accessorKey: 'walletMode',
      header: 'Wallet Mode',
      cell: ({ row }) => (
        <Badge variant={row.original.walletMode === 'ephemeral' ? 'secondary' : 'default'}>
          {row.original.walletMode}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center gap-2">
            {status === 'pending' && <span className="text-gray-500">Pending</span>}
            {status === 'processing' && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
            <span className={
              status === 'success' ? 'text-green-600' :
              status === 'error' ? 'text-red-600' : ''
            }>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'walletAddress',
      header: 'Wallet Address',
      cell: ({ row }) => row.original.walletAddress ?
        <span className="font-mono text-xs">{row.original.walletAddress.slice(0, 10)}...</span> :
        '-'
    }
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bulk Invoice Processing</h1>
        <Button onClick={downloadTemplate} variant="outline">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      {invoices.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">
                {isDragActive ? 'Drop the file here...' : 'Drag & drop CSV/Excel file here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to select file (max 1000 invoices)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {invoices.length > 0 && (
        <>
          {/* Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Processing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Invoices</div>
                  <div className="text-2xl font-bold">{summary.total}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold">${summary.totalAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                  <div className="text-2xl font-bold text-green-600">{summary.successful}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                  <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Wallets Created</div>
                  <div className="text-2xl font-bold text-blue-600">{summary.walletsCreated}</div>
                </div>
              </div>

              {processing && (
                <div>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Processing batch... {Math.round(progress)}% complete
                  </p>
                </div>
              )}

              {!processing && invoices.some(inv => inv.status === 'pending') && (
                <Button
                  onClick={processBulkInvoices}
                  size="lg"
                  className="w-full"
                >
                  Process All Invoices
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Invoice Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={invoices}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
```

---

### Phase 3: Vendor & Payroll Wallets (Week 3)

#### 3.1 Vendor Payment Wallets

```typescript
// src/app/(dashboard)/wallets/vendor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VendorWalletService } from '@/services/vendor-wallet.service';
import { VendorWalletManager } from '@/components/wallets/VendorWalletManager';
import { Users, Wallet, Calendar, TrendingUp } from '@monay/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VendorWalletsPage() {
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeWallets: 0,
    totalVolume30d: 0,
    averagePaymentTime: 0,
    upcomingPayments: []
  });

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    const [vendorList, statistics] = await Promise.all([
      VendorWalletService.getVendorsWithWallets(),
      VendorWalletService.getStatistics()
    ]);
    setVendors(vendorList);
    setStats(statistics);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Vendor Payment Wallets</h1>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeWallets} with active wallets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">30-Day Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalVolume30d / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Across all vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Payment Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averagePaymentTime} hrs
            </div>
            <p className="text-xs text-muted-foreground">
              Invoice to payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingPayments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Vendors</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Payments</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Vendors</TabsTrigger>
          <TabsTrigger value="ephemeral">Ephemeral Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Vendor Wallets</CardTitle>
              <CardDescription>
                Vendors with active payment wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorWalletManager
                vendors={vendors.filter(v => v.walletStatus === 'active')}
                onUpdate={loadVendorData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Vendor Payments</CardTitle>
              <CardDescription>
                Upcoming automated payments to vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Scheduled payments calendar view */}
              <div className="space-y-4">
                {stats.upcomingPayments.map((payment, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <div className="font-semibold">{payment.vendorName}</div>
                      <div className="text-sm text-muted-foreground">
                        Invoice: {payment.invoiceNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${payment.amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Vendor Payments</CardTitle>
              <CardDescription>
                Vendors with automated recurring payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorWalletManager
                vendors={vendors.filter(v => v.hasRecurringPayment)}
                onUpdate={loadVendorData}
                showRecurringOptions
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ephemeral">
          <Card>
            <CardHeader>
              <CardTitle>Ephemeral Vendor Wallets</CardTitle>
              <CardDescription>
                Temporary wallets for one-time vendor payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorWalletManager
                vendors={vendors.filter(v => v.walletMode === 'ephemeral')}
                onUpdate={loadVendorData}
                showCountdown
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### 3.2 Payroll Disbursement Wallets

```typescript
// src/app/(dashboard)/wallets/payroll/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PayrollService } from '@/services/payroll.service';
import { PayrollWalletGrid } from '@/components/wallets/PayrollWalletGrid';
import { Users, DollarSign, Calendar, Clock } from '@monay/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PayrollBatch {
  id: string;
  period: string;
  employeeCount: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed';
  walletMode: 'ephemeral';
  ttlHours: 24; // Payroll wallets expire after 24 hours
  scheduledDate: Date;
  wallets: Array<{
    employeeId: string;
    employeeName: string;
    amount: number;
    walletAddress?: string;
    status: 'pending' | 'created' | 'funded' | 'disbursed' | 'expired';
  }>;
}

export default function PayrollWalletsPage() {
  const [payrollBatches, setPayrollBatches] = useState<PayrollBatch[]>([]);
  const [currentBatch, setCurrentBatch] = useState<PayrollBatch | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPayrollBatches();
  }, []);

  const loadPayrollBatches = async () => {
    const batches = await PayrollService.getPayrollBatches();
    setPayrollBatches(batches);

    // Set current batch if exists
    const activeBatch = batches.find(b => b.status === 'processing');
    if (activeBatch) {
      setCurrentBatch(activeBatch);
    }
  };

  const createPayrollBatch = async () => {
    setProcessing(true);
    try {
      // Get current payroll period data
      const payrollData = await PayrollService.getCurrentPeriodData();

      // Create ephemeral wallets for all employees
      const batch = await PayrollService.createPayrollBatch({
        period: payrollData.period,
        employees: payrollData.employees,
        walletMode: 'ephemeral',
        ttlHours: 24, // 24-hour window to collect salary
        scheduledDate: payrollData.payDate
      });

      setCurrentBatch(batch);
      await loadPayrollBatches();
    } finally {
      setProcessing(false);
    }
  };

  const processPayrollBatch = async (batchId: string) => {
    setProcessing(true);
    try {
      // This creates all ephemeral wallets and funds them
      await PayrollService.processBatch(batchId);
      await loadPayrollBatches();

      alert('Payroll batch processed! All employee wallets have been created and funded.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Payroll Disbursement Wallets</h1>
        <Button
          onClick={createPayrollBatch}
          disabled={processing || currentBatch !== null}
        >
          Create Payroll Batch
        </Button>
      </div>

      {/* Alert for Ephemeral Nature */}
      <Alert className="mb-6">
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Ephemeral Payroll Wallets:</strong> All payroll wallets are ephemeral with a 24-hour TTL.
          Employees must transfer funds to their personal accounts within this window.
          Unclaimed funds are automatically returned to the company treasury.
        </AlertDescription>
      </Alert>

      {/* Current Batch Status */}
      {currentBatch && (
        <Card className="mb-8 border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Current Payroll Batch</CardTitle>
            <CardDescription>Period: {currentBatch.period}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Employees</div>
                <div className="text-2xl font-bold">{currentBatch.employeeCount}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-2xl font-bold">${currentBatch.totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="text-2xl font-bold capitalize">{currentBatch.status}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
                <div className="text-2xl font-bold">
                  {new Date(currentBatch.scheduledDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Employee Wallet Grid */}
            <PayrollWalletGrid
              batch={currentBatch}
              onUpdate={loadPayrollBatches}
            />

            {currentBatch.status === 'pending' && (
              <Button
                onClick={() => processPayrollBatch(currentBatch.id)}
                className="w-full mt-4"
                disabled={processing}
              >
                Process Payroll Batch
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historical Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
          <CardDescription>Previous payroll disbursements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollBatches
              .filter(b => b.status === 'completed')
              .map(batch => (
                <div key={batch.id} className="p-4 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">Period: {batch.period}</div>
                      <div className="text-sm text-muted-foreground">
                        {batch.employeeCount} employees
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${batch.totalAmount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Processed: {new Date(batch.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-green-600">
                      {batch.wallets.filter(w => w.status === 'disbursed').length} collected
                    </span>
                    <span className="mx-2">•</span>
                    <span className="text-yellow-600">
                      {batch.wallets.filter(w => w.status === 'expired').length} expired
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Phase 4: Multi-Signature Approvals (Week 4)

#### 4.1 Approval Workflow Component

```typescript
// src/components/approvals/ApprovalWorkflow.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApprovalService } from '@/services/approval.service';
import { SignatureCollector } from './SignatureCollector';
import { Shield, CheckCircle, XCircle, Clock } from '@monay/icons';
import { Progress } from '@/components/ui/progress';

interface Props {
  invoiceId: string;
  requiredSignatures: number;
  approvers: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
  }>;
  amount: number;
  onComplete: (approved: boolean) => void;
}

export function ApprovalWorkflow({ invoiceId, requiredSignatures, approvers, amount, onComplete }: Props) {
  const [signatures, setSignatures] = useState<Array<{
    approverId: string;
    status: 'pending' | 'signed' | 'rejected';
    timestamp?: Date;
    notes?: string;
  }>>([]);

  const [walletCreationPending, setWalletCreationPending] = useState(false);

  useEffect(() => {
    // Initialize signature tracking
    setSignatures(approvers.map(a => ({
      approverId: a.id,
      status: 'pending'
    })));

    // Subscribe to signature updates
    subscribeToUpdates();
  }, [invoiceId]);

  const subscribeToUpdates = () => {
    // WebSocket subscription for real-time signature updates
    const ws = new WebSocket(`ws://localhost:3001/approvals/${invoiceId}`);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'signature') {
        updateSignature(update.approverId, update.status, update.notes);
      }
      if (update.type === 'complete') {
        handleApprovalComplete(update.approved);
      }
    };

    return () => ws.close();
  };

  const updateSignature = (approverId: string, status: 'signed' | 'rejected', notes?: string) => {
    setSignatures(prev => prev.map(sig =>
      sig.approverId === approverId
        ? { ...sig, status, timestamp: new Date(), notes }
        : sig
    ));

    checkCompletion();
  };

  const checkCompletion = () => {
    const signedCount = signatures.filter(s => s.status === 'signed').length;
    const rejectedCount = signatures.filter(s => s.status === 'rejected').length;

    if (signedCount >= requiredSignatures) {
      // Approval threshold met - create wallet
      triggerWalletCreation();
    } else if (rejectedCount > approvers.length - requiredSignatures) {
      // Too many rejections - cannot approve
      onComplete(false);
    }
  };

  const triggerWalletCreation = async () => {
    setWalletCreationPending(true);

    // This triggers the Invoice-First wallet creation
    const result = await ApprovalService.executeApprovedInvoice(invoiceId);

    if (result.walletAddress) {
      onComplete(true);
    }
  };

  const handleApprovalComplete = (approved: boolean) => {
    if (approved) {
      setWalletCreationPending(true);
    }
    onComplete(approved);
  };

  const signedCount = signatures.filter(s => s.status === 'signed').length;
  const progress = (signedCount / requiredSignatures) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Signature Approval
        </CardTitle>
        <CardDescription>
          {requiredSignatures} of {approvers.length} signatures required for ${amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>{signedCount} signed</span>
            <span>{requiredSignatures - signedCount} remaining</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Approver List */}
        <div className="space-y-3">
          {approvers.map(approver => {
            const signature = signatures.find(s => s.approverId === approver.id);
            return (
              <div key={approver.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {signature?.status === 'signed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {signature?.status === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                  {signature?.status === 'pending' && <Clock className="h-5 w-5 text-gray-400" />}

                  <div>
                    <div className="font-semibold">{approver.name}</div>
                    <div className="text-sm text-muted-foreground">{approver.role}</div>
                  </div>
                </div>

                <div className="text-right">
                  {signature?.status === 'pending' && (
                    <SignatureCollector
                      approverId={approver.id}
                      invoiceId={invoiceId}
                      onSign={(notes) => updateSignature(approver.id, 'signed', notes)}
                      onReject={(notes) => updateSignature(approver.id, 'rejected', notes)}
                    />
                  )}
                  {signature?.timestamp && (
                    <div className="text-sm text-muted-foreground">
                      {new Date(signature.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Wallet Creation Status */}
        {walletCreationPending && (
          <Alert>
            <AlertDescription>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Invoice-First wallet...
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Rejection Warning */}
        {signatures.filter(s => s.status === 'rejected').length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              Invoice has been rejected by one or more approvers.
              {signatures.filter(s => s.status === 'rejected').length > approvers.length - requiredSignatures &&
                ' This invoice cannot be approved.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### Phase 5: Enhanced Dashboard & Integration (Week 5)

#### 5.1 Updated Enterprise Dashboard

```typescript
// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnterpriseInvoiceService } from '@/services/enterprise-invoice.service';
import { WebSocketService } from '@/services/websocket.service';
import {
  FileText, Wallet, DollarSign, Users,
  TrendingUp, Clock, CheckCircle, AlertTriangle
} from '@monay/icons';
import { InvoiceWalletMetrics } from '@/components/dashboard/InvoiceWalletMetrics';
import { RecentInvoiceActivity } from '@/components/dashboard/RecentInvoiceActivity';
import { WalletLifecycleOverview } from '@/components/dashboard/WalletLifecycleOverview';

export default function EnterpriseDashboard() {
  const [metrics, setMetrics] = useState({
    // Invoice Metrics
    totalInvoices: 0,
    pendingInvoices: 0,
    invoiceVolume: 0,
    averageInvoiceAmount: 0,

    // Wallet Metrics
    totalWallets: 0,
    ephemeralWallets: 0,
    persistentWallets: 0,
    walletsExpiring24h: 0,

    // Financial Metrics
    totalBalance: 0,
    pendingPayments: 0,
    completedPayments: 0,
    savingsFromEphemeral: 0,

    // Vendor & Payroll
    activeVendors: 0,
    upcomingPayroll: null,
    recurringPayments: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const ws = WebSocketService.getInstance();

  useEffect(() => {
    loadDashboardData();
    subscribeToRealTimeUpdates();

    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => {
      clearInterval(interval);
      ws.unsubscribe('enterprise-update');
    };
  }, []);

  const loadDashboardData = async () => {
    const data = await EnterpriseInvoiceService.getDashboardMetrics();
    setMetrics(data.metrics);
    setRecentActivity(data.recentActivity);
  };

  const subscribeToRealTimeUpdates = () => {
    ws.subscribe('enterprise-update', (update) => {
      if (update.type === 'wallet-created') {
        setMetrics(prev => ({
          ...prev,
          totalWallets: prev.totalWallets + 1,
          [update.walletMode + 'Wallets']: prev[update.walletMode + 'Wallets'] + 1
        }));
      }
      if (update.type === 'invoice-paid') {
        setMetrics(prev => ({
          ...prev,
          pendingInvoices: prev.pendingInvoices - 1,
          completedPayments: prev.completedPayments + 1
        }));
      }
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Invoice-First Architecture Active
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingInvoices} pending approval
            </p>
          </CardContent>
        </Card>

        {/* Active Wallets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalWallets}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.ephemeralWallets} ephemeral, {metrics.persistentWallets} persistent
            </p>
          </CardContent>
        </Card>

        {/* Invoice Volume */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Invoice Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(metrics.invoiceVolume / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        {/* Cost Savings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.savingsFromEphemeral.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From ephemeral wallets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {metrics.walletsExpiring24h > 0 && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{metrics.walletsExpiring24h} wallets</strong> will expire in the next 24 hours.
            Ensure all pending transactions are completed.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Invoice/Wallet Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <InvoiceWalletMetrics />
          <WalletLifecycleOverview />
        </div>

        {/* Right Column - Recent Activity */}
        <div className="space-y-6">
          <RecentInvoiceActivity activity={recentActivity} />

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.upcomingPayroll && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-semibold">Payroll Processing</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(metrics.upcomingPayroll).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-semibold">{metrics.recurringPayments} Recurring</div>
                    <div className="text-sm text-muted-foreground">
                      Payments this week
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 INTEGRATION POINTS

### With Backend (Port 3001)

```typescript
// Enterprise-specific API endpoints:

// Invoice Management
POST   /api/enterprise/invoices                    // Create invoice with wallet
GET    /api/enterprise/invoices                    // List enterprise invoices
POST   /api/enterprise/invoices/bulk               // Bulk invoice upload
GET    /api/enterprise/invoices/:id                // Invoice details with wallet

// Enterprise Wallets
POST   /api/enterprise/wallets/create-from-invoice // Create wallet from invoice
GET    /api/enterprise/wallets                     // List all enterprise wallets
POST   /api/enterprise/wallets/:id/fund            // Fund wallet
POST   /api/enterprise/wallets/:id/destroy         // Destroy ephemeral wallet

// Vendor Management
GET    /api/enterprise/vendors                     // List vendors
POST   /api/enterprise/vendors/:id/wallet          // Create vendor wallet
GET    /api/enterprise/vendors/:id/payments        // Vendor payment history

// Payroll
POST   /api/enterprise/payroll/batch               // Create payroll batch
POST   /api/enterprise/payroll/:id/process         // Process payroll
GET    /api/enterprise/payroll/history             // Payroll history

// Approvals
GET    /api/enterprise/approvals/pending           // Pending approvals
POST   /api/enterprise/approvals/:id/sign          // Sign approval
POST   /api/enterprise/approvals/:id/reject        // Reject approval

// WebSocket Events
- invoice-created         // New invoice created
- wallet-created         // Wallet created from invoice
- wallet-funded          // Wallet funded
- wallet-expiring        // Wallet approaching TTL
- approval-required      // Multi-sig approval needed
- payment-completed      // Payment processed
```

### With Admin Dashboard (Port 3002)

The Enterprise Wallet reports to Admin Dashboard:
- Invoice creation metrics
- Wallet lifecycle data
- Vendor payment statistics
- Payroll disbursement reports

### With Consumer Wallet (Port 3003)

Enterprise wallets can interact with consumer wallets:
- Employee salary disbursements
- Vendor payments to consumer businesses
- Cross-platform invoice payments

---

## 🚀 DEPLOYMENT CHECKLIST

1. **Environment Variables**
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   NEXT_PUBLIC_ENTERPRISE_ID=enterprise_default
   ```

2. **Dependencies to Install**
   ```bash
   npm install react-dropzone@^14.2.0
   npm install papaparse@^5.4.0
   npm install date-fns@^2.30.0
   npm install recharts@^2.5.0
   ```

3. **Testing Requirements**
   - Test invoice-to-wallet creation flow
   - Verify bulk invoice processing
   - Test ephemeral wallet countdown and destruction
   - Validate multi-signature approvals
   - Test vendor and payroll wallet creation

4. **Security Considerations**
   - Multi-signature thresholds for high-value invoices
   - Ephemeral wallet automatic destruction
   - Audit logging for all wallet operations
   - Role-based access for departments

---

## 📊 SUCCESS METRICS

- Invoice-to-wallet creation < 2 seconds
- Bulk processing: 100 invoices/minute
- Ephemeral wallet destruction accuracy: 100%
- Multi-sig approval completion < 5 minutes
- Dashboard real-time updates < 500ms latency

---

## 🔗 PARALLEL SESSION COORDINATION

This Enterprise Wallet implementation works in parallel with:

1. **Backend Team** (Port 3001) - Consuming enterprise-specific APIs
2. **Admin Team** (Port 3002) - Reporting metrics and monitoring
3. **Consumer Team** (Port 3003) - Cross-platform payments

Key coordination:
- API contracts must align with backend
- WebSocket events must be consistent
- UI/UX patterns should match platform standards
- Security policies must be enforced uniformly

---

This plan equips the Enterprise Wallet team with everything needed to implement Invoice-First architecture, including wallet creation from invoices, bulk processing, vendor/payroll management, and multi-signature approvals.