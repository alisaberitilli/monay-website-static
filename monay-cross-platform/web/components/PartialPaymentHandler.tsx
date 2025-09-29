'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DollarSign,
  Calculator,
  Users,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Split,
  User,
  Percent,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  dueDate: Date;
  customerName: string;
  description: string;
  allowPartialPayments: boolean;
  minimumPaymentAmount?: number;
  maximumPaymentAmount?: number;
}

interface PaymentSchedule {
  id: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
}

interface PaymentSplit {
  participantId: string;
  name: string;
  email: string;
  amount: number;
  percentage?: number;
  isPaid: boolean;
  paidAt?: Date;
}

interface PartialPaymentHandlerProps {
  invoice: Invoice;
  onPayment: (amount: number, options?: PaymentOptions) => void;
  onSchedulePayment?: (schedule: PaymentSchedule[]) => void;
  onSplitPayment?: (splits: PaymentSplit[]) => void;
  onClose?: () => void;
}

interface PaymentOptions {
  paymentMethod?: 'card' | 'bank' | 'crypto' | 'wallet';
  scheduledDate?: Date;
  splits?: PaymentSplit[];
  memo?: string;
}

const PartialPaymentHandler: React.FC<PartialPaymentHandlerProps> = ({
  invoice,
  onPayment,
  onSchedulePayment,
  onSplitPayment,
  onClose
}) => {
  const [paymentMode, setPaymentMode] = useState<'partial' | 'full' | 'custom' | 'split' | 'schedule'>('partial');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto' | 'wallet'>('card');
  const [scheduleType, setScheduleType] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  const [numberOfPayments, setNumberOfPayments] = useState(2);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule[]>([]);
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [numberOfParticipants, setNumberOfParticipants] = useState(2);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Calculate suggested payment amounts
  const suggestedAmounts = [
    { label: 'Minimum', amount: invoice.minimumPaymentAmount || invoice.remainingAmount * 0.1 },
    { label: '25%', amount: invoice.remainingAmount * 0.25 },
    { label: '50%', amount: invoice.remainingAmount * 0.5 },
    { label: '75%', amount: invoice.remainingAmount * 0.75 }
  ];

  useEffect(() => {
    // Set initial amount based on mode
    if (paymentMode === 'full') {
      setSelectedAmount(invoice.remainingAmount);
    } else if (paymentMode === 'partial') {
      setSelectedAmount(suggestedAmounts[1].amount); // Default to 25%
    }
  }, [paymentMode, invoice.remainingAmount]);

  useEffect(() => {
    // Generate payment schedule
    if (paymentMode === 'schedule') {
      generatePaymentSchedule();
    }
  }, [paymentMode, scheduleType, numberOfPayments]);

  useEffect(() => {
    // Generate payment splits
    if (paymentMode === 'split') {
      generatePaymentSplits();
    }
  }, [paymentMode, splitType, numberOfParticipants]);

  const generatePaymentSchedule = () => {
    const schedules: PaymentSchedule[] = [];
    const amountPerPayment = invoice.remainingAmount / numberOfPayments;
    const today = new Date();

    for (let i = 0; i < numberOfPayments; i++) {
      const dueDate = new Date(today);

      switch (scheduleType) {
        case 'weekly':
          dueDate.setDate(today.getDate() + (i + 1) * 7);
          break;
        case 'biweekly':
          dueDate.setDate(today.getDate() + (i + 1) * 14);
          break;
        case 'monthly':
          dueDate.setMonth(today.getMonth() + (i + 1));
          break;
      }

      schedules.push({
        id: `schedule-${i}`,
        amount: amountPerPayment,
        dueDate,
        status: 'pending'
      });
    }

    setPaymentSchedule(schedules);
  };

  const generatePaymentSplits = () => {
    const splits: PaymentSplit[] = [];
    const amountPerPerson = invoice.remainingAmount / numberOfParticipants;
    const percentagePerPerson = 100 / numberOfParticipants;

    for (let i = 0; i < numberOfParticipants; i++) {
      splits.push({
        participantId: `participant-${i}`,
        name: i === 0 ? 'You' : `Participant ${i}`,
        email: i === 0 ? 'your@email.com' : '',
        amount: splitType === 'equal' ? amountPerPerson : 0,
        percentage: splitType === 'percentage' ? percentagePerPerson : undefined,
        isPaid: false
      });
    }

    setPaymentSplits(splits);
  };

  const updateSplitParticipant = (index: number, field: keyof PaymentSplit, value: any) => {
    const newSplits = [...paymentSplits];
    newSplits[index] = { ...newSplits[index], [field]: value };

    // Recalculate amounts if percentage changed
    if (field === 'percentage') {
      const totalPercentage = newSplits.reduce((sum, split) => sum + (split.percentage || 0), 0);
      if (totalPercentage <= 100) {
        newSplits[index].amount = (invoice.remainingAmount * value) / 100;
      }
    }

    setPaymentSplits(newSplits);
  };

  const updateScheduleAmount = (index: number, amount: number) => {
    const newSchedule = [...paymentSchedule];
    newSchedule[index].amount = amount;
    setPaymentSchedule(newSchedule);
  };

  const validatePayment = (): boolean => {
    setError(null);

    if (paymentMode === 'custom') {
      const amount = parseFloat(customAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return false;
      }
      if (invoice.minimumPaymentAmount && amount < invoice.minimumPaymentAmount) {
        setError(`Minimum payment amount is $${invoice.minimumPaymentAmount}`);
        return false;
      }
      if (invoice.maximumPaymentAmount && amount > invoice.maximumPaymentAmount) {
        setError(`Maximum payment amount is $${invoice.maximumPaymentAmount}`);
        return false;
      }
      if (amount > invoice.remainingAmount) {
        setError(`Amount exceeds remaining balance of $${invoice.remainingAmount}`);
        return false;
      }
      setSelectedAmount(amount);
    }

    if (paymentMode === 'split') {
      const totalAmount = paymentSplits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalAmount - invoice.remainingAmount) > 0.01) {
        setError('Split amounts must equal the total invoice amount');
        return false;
      }
    }

    if (paymentMode === 'schedule') {
      const totalScheduled = paymentSchedule.reduce((sum, schedule) => sum + schedule.amount, 0);
      if (Math.abs(totalScheduled - invoice.remainingAmount) > 0.01) {
        setError('Scheduled amounts must equal the total invoice amount');
        return false;
      }
    }

    return true;
  };

  const handlePayment = () => {
    if (!validatePayment()) return;

    const options: PaymentOptions = {
      paymentMethod,
      memo
    };

    if (paymentMode === 'split') {
      options.splits = paymentSplits;
      if (onSplitPayment) {
        onSplitPayment(paymentSplits);
      }
    }

    if (paymentMode === 'schedule') {
      if (onSchedulePayment) {
        onSchedulePayment(paymentSchedule);
      }
      // Process first payment if auto-schedule is enabled
      if (autoSchedule && paymentSchedule.length > 0) {
        options.scheduledDate = paymentSchedule[0].dueDate;
        onPayment(paymentSchedule[0].amount, options);
      }
    } else {
      onPayment(selectedAmount, options);
    }
  };

  const progressPercentage = ((invoice.paidAmount / invoice.totalAmount) * 100);
  const newProgressPercentage = (((invoice.paidAmount + selectedAmount) / invoice.totalAmount) * 100);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Partial Payment</CardTitle>
            <CardDescription>
              Invoice #{invoice.id} - {invoice.customerName}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {invoice.currency} {invoice.remainingAmount.toLocaleString()}
          </Badge>
        </div>

        {/* Payment Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Progress</span>
            <span>{progressPercentage.toFixed(1)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {selectedAmount > 0 && paymentMode !== 'schedule' && paymentMode !== 'split' && (
            <Progress
              value={newProgressPercentage}
              className="h-2 opacity-50"
            />
          )}
          <div className="flex justify-between text-xs text-gray-600">
            <span>Paid: ${invoice.paidAmount.toLocaleString()}</span>
            <span>Remaining: ${invoice.remainingAmount.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Mode Selection */}
        <div>
          <Label>Payment Type</Label>
          <RadioGroup value={paymentMode} onValueChange={(value: any) => setPaymentMode(value)}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="cursor-pointer">
                  <Badge variant="secondary" className="w-full justify-center">
                    Partial
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="cursor-pointer">
                  <Badge variant="secondary" className="w-full justify-center">
                    Full
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">
                  <Badge variant="secondary" className="w-full justify-center">
                    Custom
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="split" id="split" />
                <Label htmlFor="split" className="cursor-pointer">
                  <Badge variant="secondary" className="w-full justify-center">
                    <Split className="h-3 w-3 mr-1" />
                    Split
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="schedule" id="schedule" />
                <Label htmlFor="schedule" className="cursor-pointer">
                  <Badge variant="secondary" className="w-full justify-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Schedule
                  </Badge>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Partial Payment Options */}
        {paymentMode === 'partial' && (
          <div className="space-y-4">
            <Label>Select Payment Amount</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {suggestedAmounts.map((suggestion) => (
                <Button
                  key={suggestion.label}
                  variant={selectedAmount === suggestion.amount ? 'default' : 'outline'}
                  onClick={() => setSelectedAmount(suggestion.amount)}
                  className="flex flex-col py-3"
                >
                  <span className="text-xs">{suggestion.label}</span>
                  <span className="text-lg font-semibold">
                    ${suggestion.amount.toLocaleString()}
                  </span>
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Or use slider</Label>
              <Slider
                value={[selectedAmount]}
                onValueChange={([value]) => setSelectedAmount(value)}
                min={invoice.minimumPaymentAmount || 1}
                max={invoice.remainingAmount}
                step={1}
                className="w-full"
              />
              <div className="text-center text-2xl font-bold">
                ${selectedAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Custom Amount */}
        {paymentMode === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Enter Payment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="custom-amount"
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-10"
              />
            </div>
            {invoice.minimumPaymentAmount && (
              <p className="text-xs text-gray-500">
                Minimum payment: ${invoice.minimumPaymentAmount}
              </p>
            )}
          </div>
        )}

        {/* Split Payment */}
        {paymentMode === 'split' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Split Type</Label>
              <Select value={splitType} onValueChange={(value: any) => setSplitType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal Split</SelectItem>
                  <SelectItem value="percentage">By Percentage</SelectItem>
                  <SelectItem value="custom">Custom Amounts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Label>Number of People</Label>
              <Input
                type="number"
                value={numberOfParticipants}
                onChange={(e) => setNumberOfParticipants(parseInt(e.target.value) || 2)}
                min="2"
                max="10"
                className="w-20"
              />
            </div>

            <div className="space-y-3">
              {paymentSplits.map((split, index) => (
                <div key={split.participantId} className="flex items-center gap-3 p-3 border rounded">
                  <User className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Name"
                    value={split.name}
                    onChange={(e) => updateSplitParticipant(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Email"
                    value={split.email}
                    onChange={(e) => updateSplitParticipant(index, 'email', e.target.value)}
                    className="flex-1"
                  />
                  {splitType === 'percentage' && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={split.percentage}
                        onChange={(e) => updateSplitParticipant(index, 'percentage', parseFloat(e.target.value))}
                        className="w-20"
                      />
                      <Percent className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={split.amount}
                      onChange={(e) => updateSplitParticipant(index, 'amount', parseFloat(e.target.value))}
                      disabled={splitType === 'equal'}
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Payment */}
        {paymentMode === 'schedule' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Frequency</Label>
                <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Number of Payments</Label>
                <Input
                  type="number"
                  value={numberOfPayments}
                  onChange={(e) => setNumberOfPayments(parseInt(e.target.value) || 2)}
                  min="2"
                  max="12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Schedule</Label>
              {paymentSchedule.map((schedule, index) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Payment {index + 1}</span>
                    <span className="text-sm text-gray-500">
                      {format(schedule.dueDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={schedule.amount}
                      onChange={(e) => updateScheduleAmount(index, parseFloat(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-schedule"
                checked={autoSchedule}
                onCheckedChange={(checked) => setAutoSchedule(checked as boolean)}
              />
              <Label htmlFor="auto-schedule" className="text-sm">
                Automatically process payments on scheduled dates
              </Label>
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        <div>
          <Label>Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="cursor-pointer flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Card
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="cursor-pointer flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Bank
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="crypto" id="crypto" />
                <Label htmlFor="crypto" className="cursor-pointer flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Crypto
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="cursor-pointer flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Wallet
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Memo */}
        <div>
          <Label htmlFor="memo">Payment Note (Optional)</Label>
          <Input
            id="memo"
            placeholder="Add a note for this payment..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Summary */}
        {(selectedAmount > 0 || paymentMode === 'schedule' || paymentMode === 'split') && (
          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-2">
              <div className="font-semibold text-lg">Payment Summary</div>
              {paymentMode !== 'schedule' && paymentMode !== 'split' ? (
                <>
                  <div className="flex justify-between">
                    <span>Payment Amount:</span>
                    <span className="font-semibold">${selectedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Remaining After Payment:</span>
                    <span>${(invoice.remainingAmount - selectedAmount).toLocaleString()}</span>
                  </div>
                </>
              ) : paymentMode === 'schedule' ? (
                <>
                  <div className="flex justify-between">
                    <span>Total Scheduled:</span>
                    <span className="font-semibold">
                      ${paymentSchedule.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Number of Payments:</span>
                    <span>{numberOfPayments}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>First Payment:</span>
                    <span>
                      ${paymentSchedule[0]?.amount.toLocaleString()} on{' '}
                      {paymentSchedule[0] && format(paymentSchedule[0].dueDate, 'MMM dd')}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Total Split Amount:</span>
                    <span className="font-semibold">
                      ${paymentSplits.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Your Portion:</span>
                    <span>${paymentSplits[0]?.amount.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Payment Method:</span>
                <span className="capitalize">{paymentMethod}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handlePayment}
            disabled={
              (paymentMode === 'custom' && !customAmount) ||
              (paymentMode !== 'schedule' && paymentMode !== 'split' && selectedAmount <= 0)
            }
            className="min-w-[150px]"
          >
            {paymentMode === 'schedule' ? (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Payments
              </>
            ) : paymentMode === 'split' ? (
              <>
                <Split className="mr-2 h-4 w-4" />
                Split Payment
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Pay ${selectedAmount.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartialPaymentHandler;