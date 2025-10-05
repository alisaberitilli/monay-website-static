# Implementation Plan: Monay Consumer Wallet (Port 3003)
## Invoice-First Architecture Integration

**Date**: October 2025
**Component**: monay-cross-platform/web
**Port**: 3003
**Dependencies**: monay-backend-common (Port 3001)
**Session Type**: Consumer Wallet Team

---

## 🎯 OBJECTIVE

Transform the Monay Consumer Super App to leverage Invoice-First architecture for all payment scenarios, enabling consumers to pay invoices, receive salary/vendor payments through ephemeral wallets, and create Request-to-Pay invoices that generate wallets on demand.

---

## 📱 CONSUMER WALLET SCOPE

### Primary Features
1. **Invoice Payment** - Pay business invoices directly from consumer wallet
2. **Request-to-Pay (R2P)** - Create invoices that generate wallets for receivers
3. **Ephemeral Wallet Receipt** - Receive salary/vendor payments via temporary wallets
4. **P2P Invoice Transfers** - Person-to-person payments via invoice paradigm
5. **Smart Invoice Recognition** - AI-powered invoice scanning and payment
6. **Recurring Invoice Management** - Subscription and bill management

---

## 🗂️ FILE STRUCTURE & COMPONENTS

```
monay-cross-platform/web/
├── app/
│   ├── invoices/                    # NEW: Invoice management
│   │   ├── page.tsx                # Invoice inbox/outbox
│   │   ├── pay/                    # Pay received invoices
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── create/                 # Create R2P invoices
│   │   │   └── page.tsx
│   │   └── recurring/              # Manage recurring invoices
│   │       └── page.tsx
│   ├── request-money/              # ENHANCED: Invoice-based requests
│   │   ├── page.tsx
│   │   └── [requestId]/
│   │       └── page.tsx
│   ├── send/                       # ENHANCED: Invoice-based sending
│   │   └── page.tsx
│   ├── wallet/                     # ENHANCED: Show ephemeral wallets
│   │   ├── page.tsx
│   │   └── ephemeral/             # Temporary wallet management
│   │       └── page.tsx
│   ├── p2p-requests/              # ENHANCED: P2P invoice requests
│   │   └── page.tsx
│   ├── dashboard/                 # UPDATED: Invoice-First metrics
│   │   └── page.tsx
│   └── api/
│       └── invoice-wallets/       # Invoice wallet APIs
├── components/
│   ├── invoices/                  # NEW: Invoice components
│   │   ├── InvoiceCard.tsx
│   │   ├── InvoicePaymentFlow.tsx
│   │   ├── RequestToPayCreator.tsx
│   │   ├── InvoiceScan.tsx       # AI invoice scanner
│   │   └── EphemeralWalletCard.tsx
│   ├── wallet/                    # ENHANCED: Wallet components
│   │   ├── WalletBalanceCard.tsx
│   │   ├── EphemeralCountdown.tsx
│   │   └── WalletSelector.tsx
│   ├── payments/                  # ENHANCED: Payment flows
│   │   ├── QuickPay.tsx
│   │   ├── InvoicePayment.tsx
│   │   └── RecurringManager.tsx
│   └── notifications/             # NEW: Real-time notifications
│       ├── InvoiceNotification.tsx
│       ├── WalletExpiryAlert.tsx
│       └── PaymentReceived.tsx
├── services/
│   ├── consumer-invoice.service.ts    # NEW: Consumer invoice APIs
│   ├── request-to-pay.service.ts      # NEW: R2P service
│   ├── ephemeral-wallet.service.ts    # NEW: Ephemeral wallet management
│   ├── invoice-scanner.service.ts     # NEW: AI invoice recognition
│   └── notification.service.ts        # NEW: Push notifications
└── hooks/
    ├── useInvoiceWallet.ts            # NEW: Invoice wallet hook
    ├── useEphemeralCountdown.ts      # NEW: Countdown timer hook
    └── useRequestToPay.ts            # NEW: R2P management hook
```

---

## 📋 IMPLEMENTATION PHASES

### Phase 1: Core Invoice Infrastructure (Week 1)

#### 1.1 Invoice Inbox Page

```typescript
// app/invoices/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConsumerInvoiceService } from '@/services/consumer-invoice.service';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';
import { FileText, Send, Download, Clock, DollarSign } from '@monay/icons';
import { useRouter } from 'next/navigation';

interface Invoice {
  id: string;
  type: 'incoming' | 'outgoing';
  from: string;
  to: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  walletAddress?: string;
  walletMode?: 'ephemeral' | 'persistent';
  ttl?: number;
  createdAt: Date;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [incomingInvoices, setIncomingInvoices] = useState<Invoice[]>([]);
  const [outgoingInvoices, setOutgoingInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalDue: 0,
    totalOwed: 0,
    overdue: 0,
    expiringSoon: 0
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const [incoming, outgoing, statistics] = await Promise.all([
      ConsumerInvoiceService.getIncomingInvoices(),
      ConsumerInvoiceService.getOutgoingInvoices(),
      ConsumerInvoiceService.getStatistics()
    ]);

    setIncomingInvoices(incoming);
    setOutgoingInvoices(outgoing);
    setStats(statistics);
  };

  const handlePayInvoice = (invoiceId: string) => {
    router.push(`/invoices/pay/${invoiceId}`);
  };

  const handleCreateInvoice = () => {
    router.push('/invoices/create');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invoice Center</h1>
        <Button onClick={handleCreateInvoice}>
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.totalDue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {incomingInvoices.filter(i => i.status === 'pending').length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalOwed.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {outgoingInvoices.filter(i => i.status === 'pending').length} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.expiringSoon}
            </div>
            <p className="text-xs text-muted-foreground">
              Within 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Tabs */}
      <Tabs defaultValue="incoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming">
            <Download className="h-4 w-4 mr-2" />
            Incoming ({incomingInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            <Send className="h-4 w-4 mr-2" />
            Outgoing ({outgoingInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-4">
          {incomingInvoices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">No incoming invoices</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {incomingInvoices.map(invoice => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onPay={() => handlePayInvoice(invoice.id)}
                  showWalletStatus
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4">
          {outgoingInvoices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Send className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">No outgoing invoices</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {outgoingInvoices.map(invoice => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  showRecipientWallet
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### 1.2 Request-to-Pay Creator

```typescript
// app/invoices/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RequestToPayService } from '@/services/request-to-pay.service';
import { UserPlus, Wallet, Clock, QrCode } from '@monay/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface R2PForm {
  recipientContact: string; // Email or phone
  amount: number;
  currency: string;
  description: string;
  category: string;
  dueDate: string;

  // Invoice-First Wallet Config
  createWalletOnAccept: boolean;
  walletMode: 'ephemeral' | 'persistent';
  ttlHours: number;
  allowPartialPayment: boolean;
  recurringEnabled: boolean;
  recurringInterval?: 'weekly' | 'monthly';
}

export default function CreateRequestToPayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [r2p, setR2p] = useState<R2PForm>({
    recipientContact: '',
    amount: 0,
    currency: 'USD',
    description: '',
    category: 'general',
    dueDate: '',
    createWalletOnAccept: true, // Invoice-First by default
    walletMode: 'ephemeral',
    ttlHours: 72, // 3 days default
    allowPartialPayment: false,
    recurringEnabled: false
  });

  const [preview, setPreview] = useState({
    shareableLink: '',
    qrCode: '',
    estimatedWallet: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Request-to-Pay invoice
      const result = await RequestToPayService.createRequest({
        ...r2p,
        walletConfig: {
          autoCreate: r2p.createWalletOnAccept,
          mode: r2p.walletMode,
          ttl: r2p.ttlHours
        }
      });

      // Generate shareable link and QR code
      setPreview({
        shareableLink: result.shareableLink,
        qrCode: result.qrCode,
        estimatedWallet: result.walletPreview
      });

      // Show success modal with sharing options
      showShareModal(result);
    } catch (error) {
      alert('Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showShareModal = (result: any) => {
    // Implementation would show modal with:
    // - Copy link button
    // - QR code display
    // - Share via SMS/Email/WhatsApp
    // - Save to invoice list
    router.push(`/request-money/${result.requestId}`);
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'rent', label: 'Rent/Utilities' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'services', label: 'Services' },
    { value: 'shared', label: 'Shared Expense' },
    { value: 'loan', label: 'Loan Repayment' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create Payment Request</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                Create an invoice that generates a wallet when accepted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Recipient Contact</Label>
                <Input
                  type="text"
                  value={r2p.recipientContact}
                  onChange={(e) => setR2p({...r2p, recipientContact: e.target.value})}
                  placeholder="Email or phone number"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  They don't need a Monay account - wallet created on acceptance
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={r2p.amount}
                    onChange={(e) => setR2p({...r2p, amount: Number(e.target.value)})}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={r2p.category}
                    onChange={(e) => setR2p({...r2p, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={r2p.description}
                  onChange={(e) => setR2p({...r2p, description: e.target.value})}
                  placeholder="What is this payment for?"
                  required
                />
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={r2p.dueDate}
                  onChange={(e) => setR2p({...r2p, dueDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice-First Wallet Configuration */}
          <Card className={!r2p.createWalletOnAccept ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Auto-Wallet Creation
                </CardTitle>
                <Switch
                  checked={r2p.createWalletOnAccept}
                  onCheckedChange={(checked) => setR2p({...r2p, createWalletOnAccept: checked})}
                />
              </div>
              <CardDescription>
                Automatically create a wallet when recipient accepts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Wallet Type</Label>
                  <Select
                    value={r2p.walletMode}
                    onChange={(e) => setR2p({...r2p, walletMode: e.target.value as any})}
                    disabled={!r2p.createWalletOnAccept}
                  >
                    <option value="ephemeral">Ephemeral (Temporary)</option>
                    <option value="persistent">Persistent (Permanent)</option>
                  </Select>
                </div>
                <div>
                  <Label>Valid For (Hours)</Label>
                  <Input
                    type="number"
                    value={r2p.ttlHours}
                    onChange={(e) => setR2p({...r2p, ttlHours: Number(e.target.value)})}
                    min="1"
                    max="720"
                    disabled={!r2p.createWalletOnAccept || r2p.walletMode !== 'ephemeral'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {r2p.ttlHours / 24} days until expiry
                  </p>
                </div>
              </div>

              {r2p.walletMode === 'ephemeral' && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    The payment wallet will automatically destroy itself {r2p.ttlHours} hours
                    after creation, returning any unclaimed funds.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch
                    id="partial"
                    checked={r2p.allowPartialPayment}
                    onCheckedChange={(checked) => setR2p({...r2p, allowPartialPayment: checked})}
                    disabled={!r2p.createWalletOnAccept}
                  />
                  <Label htmlFor="partial">Allow partial payments</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="recurring"
                    checked={r2p.recurringEnabled}
                    onCheckedChange={(checked) => setR2p({...r2p, recurringEnabled: checked})}
                    disabled={!r2p.createWalletOnAccept}
                  />
                  <Label htmlFor="recurring">Make this recurring</Label>
                  {r2p.recurringEnabled && (
                    <Select
                      value={r2p.recurringInterval}
                      onChange={(e) => setR2p({...r2p, recurringInterval: e.target.value as any})}
                      className="ml-2"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Request Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Amount Requested</Label>
                <div className="text-2xl font-bold">${r2p.amount.toFixed(2)}</div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">From</Label>
                <div className="text-sm">{r2p.recipientContact || 'Enter recipient'}</div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Due</Label>
                <div className="text-sm">
                  {r2p.dueDate ? new Date(r2p.dueDate).toLocaleDateString() : 'Select date'}
                </div>
              </div>

              {r2p.createWalletOnAccept && (
                <div className="pt-4 border-t">
                  <Label className="text-xs text-muted-foreground">Wallet Creation</Label>
                  <div className="text-sm">
                    {r2p.walletMode === 'ephemeral'
                      ? `Temporary (${r2p.ttlHours}h)`
                      : 'Permanent'}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground">Sharing Options</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserPlus className="h-4 w-4" />
                    Share Link
                  </div>
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
            {loading ? 'Creating...' : 'Create Request'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### Phase 2: Invoice Payment Flow (Week 2)

#### 2.1 Invoice Payment Page

```typescript
// app/invoices/pay/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConsumerInvoiceService } from '@/services/consumer-invoice.service';
import { InvoicePaymentFlow } from '@/components/invoices/InvoicePaymentFlow';
import { EphemeralCountdown } from '@/components/wallet/EphemeralCountdown';
import { FileText, Wallet, Clock, Shield, CheckCircle } from '@monay/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PayInvoicePage() {
  const router = useRouter();
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('balance');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadInvoiceDetails();
  }, [id]);

  const loadInvoiceDetails = async () => {
    try {
      const invoiceData = await ConsumerInvoiceService.getInvoiceDetails(id);
      setInvoice(invoiceData);

      // Check if invoice has an associated wallet
      if (invoiceData.walletAddress) {
        const walletData = await ConsumerInvoiceService.getInvoiceWallet(invoiceData.walletAddress);
        setWallet(walletData);
      }
    } catch (error) {
      console.error('Failed to load invoice:', error);
      alert('Invoice not found');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // If no wallet exists, create one (Invoice-First)
      if (!wallet) {
        const newWallet = await ConsumerInvoiceService.createWalletFromInvoice(invoice.id);
        setWallet(newWallet);
      }

      // Process payment through the wallet
      const result = await ConsumerInvoiceService.payInvoice({
        invoiceId: invoice.id,
        walletAddress: wallet.address,
        paymentMethod,
        amount: invoice.amount
      });

      if (result.success) {
        // Show success screen
        router.push(`/invoices/success/${invoice.id}`);
      }
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="container mx-auto px-4 py-8">Invoice not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Pay Invoice</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Payment Flow - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
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
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <div className="font-semibold">{invoice.from}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Invoice #</Label>
                  <div className="font-mono">{invoice.invoiceNumber}</div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <div>{invoice.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Amount Due</Label>
                  <div className="text-2xl font-bold">${invoice.amount.toFixed(2)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <div className={new Date(invoice.dueDate) < new Date() ? 'text-red-600' : ''}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Status (if ephemeral) */}
          {wallet && wallet.mode === 'ephemeral' && (
            <Card className="border-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ephemeral Payment Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EphemeralCountdown
                  createdAt={wallet.createdAt}
                  ttlHours={wallet.ttlHours}
                  onExpire={() => {
                    alert('Payment window expired');
                    router.push('/invoices');
                  }}
                />
                <Alert className="mt-4">
                  <AlertDescription>
                    This payment wallet will self-destruct after the countdown.
                    Complete your payment before it expires.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoicePaymentFlow
                invoice={invoice}
                wallet={wallet}
                onMethodSelect={setPaymentMethod}
                selectedMethod={paymentMethod}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Invoice Amount</span>
                  <span className="font-semibold">${invoice.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Processing Fee</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Total</span>
                  <span>${invoice.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Wallet Info */}
              {wallet && (
                <div className="pt-4 border-t">
                  <Label className="text-xs text-muted-foreground">Payment Wallet</Label>
                  <div className="font-mono text-xs mt-1">
                    {wallet.address.slice(0, 20)}...
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Type: {wallet.mode === 'ephemeral' ? 'Temporary' : 'Permanent'}
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Shield className="h-4 w-4" />
                  Secure Invoice-First Payment
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pay Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Pay $${invoice.amount.toFixed(2)}`}
          </Button>

          {/* Cancel Link */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/invoices')}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

### Phase 3: Ephemeral Wallet Management (Week 3)

#### 3.1 Ephemeral Wallets Dashboard

```typescript
// app/wallet/ephemeral/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EphemeralWalletService } from '@/services/ephemeral-wallet.service';
import { EphemeralWalletCard } from '@/components/invoices/EphemeralWalletCard';
import { WebSocketService } from '@/services/websocket.service';
import { Wallet, Clock, AlertTriangle, TrendingDown } from '@monay/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface EphemeralWallet {
  id: string;
  address: string;
  balance: number;
  purpose: string;
  createdAt: Date;
  expiresAt: Date;
  ttlHours: number;
  status: 'active' | 'expiring' | 'expired';
  source: 'salary' | 'vendor' | 'p2p' | 'other';
  autoTransferEnabled: boolean;
  autoTransferDestination?: string;
}

export default function EphemeralWalletsPage() {
  const [wallets, setWallets] = useState<EphemeralWallet[]>([]);
  const [stats, setStats] = useState({
    activeCount: 0,
    totalBalance: 0,
    expiringIn24h: 0,
    autoTransferScheduled: 0
  });
  const ws = WebSocketService.getInstance();

  useEffect(() => {
    loadEphemeralWallets();
    subscribeToUpdates();

    return () => {
      ws.unsubscribe('ephemeral-update');
    };
  }, []);

  const loadEphemeralWallets = async () => {
    const [walletList, statistics] = await Promise.all([
      EphemeralWalletService.getActiveWallets(),
      EphemeralWalletService.getStatistics()
    ]);

    setWallets(walletList);
    setStats(statistics);
  };

  const subscribeToUpdates = () => {
    ws.subscribe('ephemeral-update', (update) => {
      if (update.type === 'countdown') {
        setWallets(prev => prev.map(w =>
          w.id === update.walletId ? { ...w, ...update.data } : w
        ));
      }
      if (update.type === 'expired') {
        setWallets(prev => prev.filter(w => w.id !== update.walletId));
        loadEphemeralWallets();
      }
    });
  };

  const handleTransferOut = async (walletId: string) => {
    const destination = prompt('Enter destination wallet address:');
    if (destination) {
      await EphemeralWalletService.transferOut(walletId, destination);
      loadEphemeralWallets();
    }
  };

  const handleSetupAutoTransfer = async (walletId: string) => {
    const destination = prompt('Enter auto-transfer destination:');
    if (destination) {
      await EphemeralWalletService.setupAutoTransfer(walletId, destination);
      loadEphemeralWallets();
    }
  };

  const urgentWallets = wallets.filter(w => {
    const hoursRemaining = (new Date(w.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursRemaining <= 24 && w.balance > 0;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Ephemeral Wallets</h1>

      {/* Warning Alert */}
      {urgentWallets.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{urgentWallets.length} wallet(s) expiring soon!</strong>
            <br />
            Transfer funds immediately to avoid automatic return.
            Total at risk: ${urgentWallets.reduce((sum, w) => sum + w.balance, 0).toFixed(2)}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Temporary payment wallets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all ephemeral wallets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.expiringIn24h}
            </div>
            <p className="text-xs text-muted-foreground">
              Within 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto-Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.autoTransferScheduled}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled transfers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet List */}
      <div className="space-y-4">
        {wallets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">No active ephemeral wallets</p>
              <p className="text-sm text-muted-foreground mt-2">
                Ephemeral wallets are created automatically when you receive payments
              </p>
            </CardContent>
          </Card>
        ) : (
          wallets.map(wallet => (
            <EphemeralWalletCard
              key={wallet.id}
              wallet={wallet}
              onTransfer={() => handleTransferOut(wallet.id)}
              onSetupAutoTransfer={() => handleSetupAutoTransfer(wallet.id)}
              showCountdown
              urgent={urgentWallets.includes(wallet)}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

---

### Phase 4: P2P Invoice Integration (Week 4)

#### 4.1 Enhanced P2P Requests

```typescript
// app/p2p-requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestToPayService } from '@/services/request-to-pay.service';
import { P2PRequestToPay } from '@/components/P2PRequestToPay';
import { Users, Send, Download, QrCode, Share2 } from '@monay/icons';
import { useRouter } from 'next/navigation';

export default function P2PRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState({
    sent: [],
    received: [],
    templates: []
  });

  const [quickActions] = useState([
    { id: 'split', label: 'Split Bill', icon: Users, preset: 'split' },
    { id: 'collect', label: 'Collect Money', icon: Download, preset: 'collect' },
    { id: 'request', label: 'Request Payment', icon: Send, preset: 'request' }
  ]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const [sent, received, templates] = await Promise.all([
      RequestToPayService.getSentRequests(),
      RequestToPayService.getReceivedRequests(),
      RequestToPayService.getTemplates()
    ]);

    setRequests({ sent, received, templates });
  };

  const handleQuickAction = (preset: string) => {
    router.push(`/invoices/create?preset=${preset}`);
  };

  const handleShareRequest = async (requestId: string) => {
    const request = await RequestToPayService.getShareableLink(requestId);

    // Native share API if available
    if (navigator.share) {
      await navigator.share({
        title: 'Payment Request',
        text: `Please pay ${request.amount} for ${request.description}`,
        url: request.shareableLink
      });
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(request.shareableLink);
      alert('Payment link copied to clipboard!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">P2P Requests</h1>
        <Button onClick={() => router.push('/invoices/create')}>
          New Request
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {quickActions.map(action => (
          <Card
            key={action.id}
            className="cursor-pointer hover:border-blue-500 transition"
            onClick={() => handleQuickAction(action.preset)}
          >
            <CardContent className="flex flex-col items-center justify-center py-6">
              <action.icon className="h-8 w-8 mb-2 text-blue-500" />
              <span className="font-semibold">{action.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Tabs */}
      <Tabs defaultValue="received" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received">
            Received ({requests.received.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({requests.sent.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            Templates ({requests.templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          <div className="space-y-4">
            {requests.received.map(request => (
              <P2PRequestToPay
                key={request.id}
                request={request}
                type="received"
                onPay={() => router.push(`/invoices/pay/${request.invoiceId}`)}
                onReject={() => handleRejectRequest(request.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sent">
          <div className="space-y-4">
            {requests.sent.map(request => (
              <P2PRequestToPay
                key={request.id}
                request={request}
                type="sent"
                onShare={() => handleShareRequest(request.id)}
                onCancel={() => handleCancelRequest(request.id)}
                showWalletStatus
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-2 gap-4">
            {requests.templates.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-blue-500"
                onClick={() => handleUseTemplate(template.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">${template.amount}</span>
                    <span className="text-sm text-muted-foreground">
                      {template.frequency}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### Phase 5: Dashboard Integration & Smart Features (Week 5)

#### 5.1 Enhanced Consumer Dashboard

```typescript
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsumerInvoiceService } from '@/services/consumer-invoice.service';
import { WebSocketService } from '@/services/websocket.service';
import {
  Wallet, FileText, Clock, TrendingUp,
  Send, Download, AlertTriangle, Zap
} from '@monay/icons';
import { InvoiceQuickPay } from '@/components/dashboard/InvoiceQuickPay';
import { EphemeralWalletWidget } from '@/components/dashboard/EphemeralWalletWidget';
import { RecentInvoiceActivity } from '@/components/dashboard/RecentInvoiceActivity';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ConsumerDashboard() {
  const [metrics, setMetrics] = useState({
    // Wallet Balances
    primaryBalance: 0,
    ephemeralBalance: 0,
    totalBalance: 0,

    // Invoice Metrics
    pendingInvoices: 0,
    pendingAmount: 0,
    outgoingRequests: 0,
    outgoingAmount: 0,

    // Ephemeral Metrics
    activeEphemeralWallets: 0,
    ephemeralExpiringToday: 0,

    // Activity
    recentTransactions: [],
    upcomingPayments: []
  });

  const [urgentActions, setUrgentActions] = useState([]);
  const ws = WebSocketService.getInstance();

  useEffect(() => {
    loadDashboardData();
    subscribeToUpdates();

    const interval = setInterval(loadDashboardData, 30000);
    return () => {
      clearInterval(interval);
      ws.unsubscribe('consumer-update');
    };
  }, []);

  const loadDashboardData = async () => {
    const data = await ConsumerInvoiceService.getDashboardData();
    setMetrics(data);

    // Check for urgent actions
    const urgent = [];
    if (data.ephemeralExpiringToday > 0) {
      urgent.push({
        type: 'ephemeral',
        message: `${data.ephemeralExpiringToday} ephemeral wallet(s) expiring today`,
        action: 'Transfer funds'
      });
    }
    if (data.overdueInvoices > 0) {
      urgent.push({
        type: 'invoice',
        message: `${data.overdueInvoices} overdue invoice(s)`,
        action: 'Pay now'
      });
    }
    setUrgentActions(urgent);
  };

  const subscribeToUpdates = () => {
    ws.subscribe('consumer-update', (update) => {
      if (update.type === 'invoice-received') {
        setMetrics(prev => ({
          ...prev,
          pendingInvoices: prev.pendingInvoices + 1,
          pendingAmount: prev.pendingAmount + update.amount
        }));
      }
      if (update.type === 'ephemeral-created') {
        setMetrics(prev => ({
          ...prev,
          activeEphemeralWallets: prev.activeEphemeralWallets + 1
        }));
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Invoice-First payments made simple</p>
      </div>

      {/* Urgent Actions Alert */}
      {urgentActions.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Action Required:</strong>
            <ul className="mt-2 space-y-1">
              {urgentActions.map((action, idx) => (
                <li key={idx}>
                  {action.message} -
                  <Button
                    variant="link"
                    className="px-2 text-white underline"
                    onClick={() => handleUrgentAction(action.type)}
                  >
                    {action.action}
                  </Button>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Primary + Ephemeral
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending to Pay</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${metrics.pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingInvoices} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending to Receive</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.outgoingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.outgoingRequests} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ephemeral Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeEphemeralWallets}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.ephemeralExpiringToday} expiring today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions */}
        <div className="space-y-6">
          <InvoiceQuickPay
            pendingInvoices={metrics.recentTransactions.filter(t => t.type === 'invoice' && t.status === 'pending')}
          />

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="ghost">
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice Request
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <Zap className="h-4 w-4 mr-2" />
                Scan & Pay Invoice
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <Users className="h-4 w-4 mr-2" />
                Split Bill
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Activity Feed */}
        <div className="space-y-6">
          <RecentInvoiceActivity
            transactions={metrics.recentTransactions}
            onViewDetails={(id) => router.push(`/invoices/${id}`)}
          />
        </div>

        {/* Right Column - Ephemeral Wallets */}
        <div className="space-y-6">
          <EphemeralWalletWidget
            wallets={metrics.activeEphemeralWallets}
            onManage={() => router.push('/wallet/ephemeral')}
          />

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.upcomingPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming payments</p>
              ) : (
                <div className="space-y-3">
                  {metrics.upcomingPayments.map((payment, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-sm">{payment.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-bold">${payment.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
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
// Consumer-specific API endpoints:

// Invoice Management
GET    /api/consumer/invoices/incoming      // List incoming invoices
GET    /api/consumer/invoices/outgoing      // List outgoing R2P requests
POST   /api/consumer/invoices/create        // Create R2P invoice
POST   /api/consumer/invoices/pay           // Pay an invoice
GET    /api/consumer/invoices/:id           // Invoice details

// Request-to-Pay
POST   /api/consumer/r2p/create             // Create payment request
GET    /api/consumer/r2p/sent               // Sent requests
GET    /api/consumer/r2p/received           // Received requests
POST   /api/consumer/r2p/:id/share          // Get shareable link

// Ephemeral Wallets
GET    /api/consumer/wallets/ephemeral      // List ephemeral wallets
POST   /api/consumer/wallets/:id/transfer   // Transfer from ephemeral
POST   /api/consumer/wallets/:id/auto-transfer // Setup auto-transfer

// P2P Transfers
POST   /api/consumer/p2p/split              // Split bill
POST   /api/consumer/p2p/request            // Request money
GET    /api/consumer/p2p/history            // P2P history

// Smart Features
POST   /api/consumer/invoice/scan           // AI invoice scanning
GET    /api/consumer/invoice/recurring      // Recurring payments
POST   /api/consumer/invoice/schedule       // Schedule payment

// WebSocket Events
- invoice-received       // New invoice received
- wallet-created        // Ephemeral wallet created
- wallet-expiring       // Wallet expiring soon
- payment-completed     // Payment processed
- r2p-accepted         // Request accepted
```

### With Enterprise Wallet (Port 3007)

Consumers interact with enterprise wallets:
- Receive salary through ephemeral wallets
- Pay enterprise invoices
- Vendor payment receipt

### With Admin Dashboard (Port 3002)

Consumer wallet reports to admin:
- Invoice payment metrics
- Ephemeral wallet usage
- P2P transfer volumes

---

## 🚀 DEPLOYMENT CHECKLIST

1. **Environment Variables**
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   NEXT_PUBLIC_CONSUMER_APP=true
   ```

2. **Dependencies to Install**
   ```bash
   npm install react-dropzone@^14.2.0
   npm install qrcode@^1.5.3
   npm install date-fns@^2.30.0
   npm install react-countdown@^2.3.5
   ```

3. **Testing Requirements**
   - Test invoice payment flow
   - Verify ephemeral wallet countdown
   - Test R2P creation and sharing
   - Validate P2P invoice transfers
   - Test urgent action alerts

4. **Mobile Considerations**
   - Responsive design for all screens
   - Native share API integration
   - QR code scanning capability
   - Push notification support

---

## 📊 SUCCESS METRICS

- Invoice payment completion < 3 taps
- R2P creation < 30 seconds
- Ephemeral wallet transfer < 2 seconds
- Real-time updates < 500ms latency
- Mobile responsiveness 100%

---

## 🔗 PARALLEL SESSION COORDINATION

This Consumer Wallet implementation works with:

1. **Backend Team** (Port 3001) - Consumer-specific APIs
2. **Admin Team** (Port 3002) - Monitoring consumer activity
3. **Enterprise Team** (Port 3007) - Cross-platform payments

Key coordination:
- Consistent invoice data model
- Shared wallet lifecycle management
- Unified notification system
- Cross-platform payment compatibility

---

This plan provides the Consumer Wallet team with everything needed to implement Invoice-First architecture for consumer payments, including invoice management, R2P creation, ephemeral wallet handling, and P2P transfers.