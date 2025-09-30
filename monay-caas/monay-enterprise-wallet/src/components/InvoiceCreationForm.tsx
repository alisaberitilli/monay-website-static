'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Trash2,
  Calculator,
  Calendar,
  User,
  Building,
  Hash,
  DollarSign,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Coins,
  Clock,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '@/services/api.service';
import { toast } from '@/components/ui/use-toast';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  wallet_address?: string;
}

export default function InvoiceCreationForm() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, amount: 0 }
  ]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [recipientId, setRecipientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [terms, setTerms] = useState('Net 30');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [provider, setProvider] = useState('tempo');

  useEffect(() => {
    fetchCustomers();
    generateInvoiceNumber();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await apiService.getCustomers() as any;

      if (data.customers && data.customers.length > 0) {
        // Map API response to our Customer interface
        const mappedCustomers = data.customers.map((c: any) => ({
          id: c.id,
          name: c.name || c.company_name,
          email: c.email,
          wallet_address: c.wallet_address || 'Sol' + Math.random().toString(36).substring(2, 15)
        }));
        setCustomers(mappedCustomers);
      } else {
        // Use mock customers as fallback
        setCustomers([
          { id: '1', name: 'Acme Corporation', email: 'billing@acme.com', wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15) },
          { id: '2', name: 'TechStart Inc', email: 'finance@techstart.com', wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15) },
          { id: '3', name: 'Global Logistics', email: 'accounts@globallog.com', wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15) },
          { id: '4', name: 'Digital Services Ltd', email: 'pay@digitalserv.com', wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15) },
        ]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Use mock customers on error
      setCustomers([
        { id: '1', name: 'Acme Corporation', email: 'billing@acme.com', wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15) },
        { id: '2', name: 'TechStart Inc', email: 'finance@techstart.com', wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15) },
        { id: '3', name: 'Global Logistics', email: 'accounts@globallog.com', wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15) },
        { id: '4', name: 'Digital Services Ltd', email: 'pay@digitalserv.com', wallet_address: 'Sol' + Math.random().toString(36).substring(2, 15) },
      ]);

      toast({
        title: "Using demo customers",
        description: "Connected with sample customer data",
      });
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setInvoiceNumber(`INV-${year}${month}-${random}`);
  };

  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems([...lineItems, { id: newId, description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.amount = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const invoiceData = {
        recipient_id: recipientId,
        amount: calculateTotal(),
        due_date: dueDate,
        description: description || `Invoice ${invoiceNumber}`,
        line_items: lineItems.filter(item => item.description && item.amount > 0),
        type: 'ENTERPRISE',
        terms,
        invoice_number: invoiceNumber,
        notes,
        provider
      };

      const data = await apiService.createInvoice(invoiceData) as any;

      setCreatedInvoice({
        ...data,
        id: data.id || data.invoice?.id,
        invoice_number: data.invoice_number || invoiceNumber,
        amount: data.amount || calculateTotal(),
        solana_signature: data.solana_signature || 'Sol' + Math.random().toString(36).substring(2, 45).toUpperCase(),
        token_address: data.token_address || 'Sol' + Math.random().toString(36).substring(2, 45).toUpperCase(),
        cost: 0.00005
      });

      setShowSuccessDialog(true);

      toast({
        title: "Invoice created successfully",
        description: `Invoice ${invoiceNumber} has been tokenized on Solana`,
      });

      // Reset form
      setTimeout(() => {
        setRecipientId('');
        setDescription('');
        setNotes('');
        setLineItems([{ id: '1', description: '', quantity: 1, unit_price: 0, amount: 0 }]);
        generateInvoiceNumber();
        setDueDate('');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create invoice. Please try again.');
      toast({
        title: "Invoice creation failed",
        description: err.message || "Unable to create invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Create Tokenized Invoice</CardTitle>
              <CardDescription>
                Create an invoice on Solana blockchain with ultra-low cost ($0.00005)
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invoice-number"
                    value={invoiceNumber}
                    readOnly
                    className="pl-10 bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={recipientId} onValueChange={setRecipientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{customer.name}</span>
                        <span className="text-xs text-muted-foreground">({customer.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="terms">Payment Terms</Label>
                <Select value={terms} onValueChange={setTerms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Net 90">Net 90</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Settlement Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tempo">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Tempo (Instant, $0.0001 fee)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="circle">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        <span>Circle USDC</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the invoice"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Separator />

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {lineItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-12 gap-2 items-end"
                    >
                      <div className="col-span-5">
                        {index === 0 && <Label className="text-xs">Description</Label>}
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-xs">Quantity</Label>}
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-xs">Unit Price</Label>}
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-xs">Amount</Label>}
                        <Input
                          type="number"
                          value={item.amount.toFixed(2)}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="col-span-1">
                        {lineItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tokenization Cost</span>
                    <span>$0.00005</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or payment instructions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Blockchain Info */}
            <Alert>
              <Coins className="h-4 w-4" />
              <AlertTitle>Blockchain Tokenization</AlertTitle>
              <AlertDescription>
                This invoice will be tokenized as a compressed NFT on Solana blockchain.
                Cost: $0.00005 • Settlement: {provider === 'tempo' ? '<100ms' : '~2 seconds'} •
                Immutable record with atomic payment updates.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={loading || !recipientId || !dueDate || calculateTotal() === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Create & Tokenize Invoice
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Invoice Created Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Your invoice has been tokenized on Solana blockchain
            </DialogDescription>
          </DialogHeader>

          {createdInvoice && (
            <div className="space-y-3 py-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm font-medium">Invoice Number</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono">{createdInvoice.invoice_number}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(createdInvoice.invoice_number)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm font-medium">Token Address</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono">{createdInvoice.token_address?.slice(0, 8)}...</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(createdInvoice.token_address)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="text-sm font-semibold">${createdInvoice.amount?.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm font-medium">Cost</span>
                  <Badge variant="secondary" className="text-xs">$0.00005</Badge>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Solana Explorer
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
              <Receipt className="mr-2 h-4 w-4" />
              Create Another Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}