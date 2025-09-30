'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Building2,
  Wallet,
  Plus,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Trash2,
  Edit,
  Copy,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  name: string;
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
  status: 'active' | 'pending' | 'expired';
  icon: any;
}

interface PaymentLimit {
  id: string;
  name: string;
  type: 'daily' | 'monthly' | 'per-transaction';
  amount: number;
  used: number;
  resetDate?: string;
}

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isEditLimitOpen, setIsEditLimitOpen] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<PaymentLimit | null>(null);
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [instantSettlement, setInstantSettlement] = useState(false);

  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Corporate Card',
      last4: '4242',
      expiryDate: '12/25',
      isDefault: true,
      status: 'active',
      icon: CreditCard
    },
    {
      id: '2',
      type: 'bank',
      name: 'Chase Business',
      last4: '6789',
      isDefault: false,
      status: 'active',
      icon: Building2
    },
    {
      id: '3',
      type: 'wallet',
      name: 'Circle Wallet',
      last4: 'a1b2',
      isDefault: false,
      status: 'active',
      icon: Wallet
    }
  ]);

  // Mock payment limits
  const [paymentLimits, setPaymentLimits] = useState<PaymentLimit[]>([
    {
      id: '1',
      name: 'Daily Limit',
      type: 'daily',
      amount: 50000,
      used: 12500,
      resetDate: 'Tomorrow at 12:00 AM'
    },
    {
      id: '2',
      name: 'Monthly Limit',
      type: 'monthly',
      amount: 1000000,
      used: 325000,
      resetDate: 'Feb 1, 2024'
    },
    {
      id: '3',
      name: 'Per Transaction',
      type: 'per-transaction',
      amount: 25000,
      used: 0
    }
  ]);

  const handleAddPaymentMethod = async (data: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: data.type,
        name: data.name,
        last4: data.number.slice(-4),
        expiryDate: data.expiry,
        isDefault: false,
        status: 'pending',
        icon: data.type === 'card' ? CreditCard : data.type === 'bank' ? Building2 : Wallet
      };

      setPaymentMethods([...paymentMethods, newMethod]);
      setIsAddMethodOpen(false);

      toast({
        title: 'Payment Method Added',
        description: 'Your new payment method has been added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add payment method. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setPaymentMethods(methods =>
        methods.map(m => ({
          ...m,
          isDefault: m.id === methodId
        }))
      );

      toast({
        title: 'Default Payment Method Updated',
        description: 'Your default payment method has been changed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update default payment method.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setPaymentMethods(methods => methods.filter(m => m.id !== methodId));

      toast({
        title: 'Payment Method Removed',
        description: 'The payment method has been removed from your account.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove payment method.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateLimit = async (limitId: string, newAmount: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setPaymentLimits(limits =>
        limits.map(l =>
          l.id === limitId ? { ...l, amount: newAmount } : l
        )
      );

      setIsEditLimitOpen(false);
      setSelectedLimit(null);

      toast({
        title: 'Limit Updated',
        description: 'Your payment limit has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment limit.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLimitPercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground">Manage payment methods, limits, and preferences</p>
        </div>
        <Button onClick={() => setIsAddMethodOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      <Tabs defaultValue="methods" className="space-y-4">
        <TabsList>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="limits">Limits & Controls</TabsTrigger>
          <TabsTrigger value="autopay">Auto-Pay Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <method.icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{method.name}</p>
                          {method.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          <Badge className={getStatusColor(method.status)}>
                            {method.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          •••• {method.last4}
                          {method.expiryDate && ` • Expires ${method.expiryDate}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMethod(method)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMethod(method.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Payment Protection</p>
                    <p className="text-sm text-muted-foreground">
                      All payment methods are encrypted and secured
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits & Controls Tab */}
        <TabsContent value="limits" className="space-y-4">
          <div className="grid gap-4">
            {paymentLimits.map((limit) => {
              const percentage = getLimitPercentage(limit.used, limit.amount);
              return (
                <Card key={limit.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{limit.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${limit.used.toLocaleString()} of ${limit.amount.toLocaleString()} used
                            {limit.resetDate && ` • Resets ${limit.resetDate}`}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLimit(limit);
                            setIsEditLimitOpen(true);
                          }}
                        >
                          Edit Limit
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{percentage}% Used</span>
                          <span>${(limit.amount - limit.used).toLocaleString()} Remaining</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Velocity Controls</CardTitle>
              <CardDescription>
                Set transaction frequency limits to prevent fraud
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Max transactions per hour</p>
                  <p className="text-sm text-muted-foreground">Current: 10 transactions</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Duplicate transaction prevention</p>
                  <p className="text-sm text-muted-foreground">Block identical transactions within 5 minutes</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Pay Settings Tab */}
        <TabsContent value="autopay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Pay Configuration</CardTitle>
              <CardDescription>
                Automatically process recurring payments and invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Auto-Pay</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically pay approved invoices on due date
                  </p>
                </div>
                <Switch
                  checked={autoPayEnabled}
                  onCheckedChange={setAutoPayEnabled}
                />
              </div>

              {autoPayEnabled && (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label>Auto-Pay Threshold</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          placeholder="10000"
                          defaultValue="10000"
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">
                          Require approval for amounts above this limit
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label>Default Payment Method</Label>
                      <Select defaultValue="1">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name} (•••• {method.last4})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Payment Schedule</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button variant="outline" className="justify-start">
                          <Clock className="w-4 h-4 mr-2" />
                          On due date
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Clock className="w-4 h-4 mr-2" />
                          3 days before due
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recurring Payments</CardTitle>
              <CardDescription>
                Manage your subscriptions and recurring charges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">AWS Services</p>
                    <p className="text-sm text-muted-foreground">$2,500/month • Next payment on Feb 1</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Office Rent</p>
                    <p className="text-sm text-muted-foreground">$15,000/month • Next payment on Feb 1</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Software Licenses</p>
                    <p className="text-sm text-muted-foreground">$500/month • Next payment on Feb 5</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Security Settings</CardTitle>
              <CardDescription>
                Configure security measures for payment processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for payments above $5,000
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send email/SMS for all transactions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">IP Whitelisting</p>
                  <p className="text-sm text-muted-foreground">
                    Only allow payments from trusted IP addresses
                  </p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Instant Settlement</p>
                  <p className="text-sm text-muted-foreground">
                    Enable real-time settlement for critical payments
                  </p>
                </div>
                <Switch
                  checked={instantSettlement}
                  onCheckedChange={setInstantSettlement}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Security Reminder</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Always verify large payment requests through multiple channels before processing.
                    Enable all available security features to protect against fraud.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Payment Method Modal */}
      <Dialog open={isAddMethodOpen} onOpenChange={setIsAddMethodOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new payment method to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Payment Type</Label>
              <Select defaultValue="card">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="wallet">Digital Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Card Number</Label>
              <Input placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expiry Date</Label>
                <Input placeholder="MM/YY" />
              </div>
              <div>
                <Label>CVV</Label>
                <Input placeholder="123" type="password" />
              </div>
            </div>
            <div>
              <Label>Card Nickname</Label>
              <Input placeholder="e.g., Corporate Card" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMethodOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleAddPaymentMethod({
              type: 'card',
              name: 'New Card',
              number: '4242424242424242',
              expiry: '12/25'
            })}>
              Add Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Limit Modal */}
      <Dialog open={isEditLimitOpen} onOpenChange={setIsEditLimitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Limit</DialogTitle>
            <DialogDescription>
              Update the limit for {selectedLimit?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Limit Amount</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg">$</span>
                <Input
                  type="number"
                  defaultValue={selectedLimit?.amount}
                  placeholder="Enter amount"
                />
              </div>
            </div>
            {selectedLimit?.type === 'daily' && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  Daily limits reset automatically at midnight in your timezone.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLimitOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedLimit && handleUpdateLimit(selectedLimit.id, 75000)}>
              Update Limit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}