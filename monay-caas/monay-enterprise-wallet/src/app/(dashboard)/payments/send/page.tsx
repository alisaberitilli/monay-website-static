'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Send,
  Wallet,
  AlertCircle,
  CheckCircle,
  DollarSign,
  User,
  FileText,
  Shield,
  Clock,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SendPaymentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fromWallet: '',
    toAddress: '',
    amount: '',
    currency: 'USDC',
    rail: 'evm',
    memo: '',
    recipientName: '',
    recipientType: 'external',
  });

  const [businessRulesCheck, setBusinessRulesCheck] = useState<any>(null);

  const wallets = [
    { id: 'corp-001', name: 'Corporate Operations Wallet', balance: 425850, network: 'Base Sepolia' },
    { id: 'corp-002', name: 'Payroll Wallet', balance: 1250000, network: 'Base Sepolia' },
    { id: 'corp-003', name: 'Vendor Payments Wallet', balance: 850000, network: 'Polygon zkEVM' },
    { id: 'treasury-001', name: 'Treasury Reserve Wallet', balance: 5000000, network: 'Base Mainnet' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleValidateTransaction = () => {
    if (!formData.fromWallet || !formData.toAddress || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate business rules validation
    const amount = parseFloat(formData.amount);
    const rulesCheck = {
      passed: true,
      checks: [
        {
          rule: 'Daily Transaction Limit',
          status: amount <= 50000 ? 'passed' : 'failed',
          message: amount <= 50000 ? 'Within daily limit ($50,000)' : 'Exceeds daily limit ($50,000)',
        },
        {
          rule: 'AML Screening',
          status: amount >= 10000 ? 'pending' : 'passed',
          message: amount >= 10000 ? 'AML screening required for amounts over $10,000' : 'No AML screening required',
        },
        {
          rule: 'Multi-Signature Requirement',
          status: amount >= 25000 ? 'pending' : 'passed',
          message: amount >= 25000 ? 'Requires 2 signatures for amounts over $25,000' : 'No additional signatures required',
        },
        {
          rule: 'Recipient KYC',
          status: 'passed',
          message: 'Recipient KYC verified',
        },
      ],
    };

    const hasFailed = rulesCheck.checks.some(check => check.status === 'failed');
    rulesCheck.passed = !hasFailed;

    setBusinessRulesCheck(rulesCheck);
    setStep(2);
  };

  const handleSendPayment = () => {
    if (!businessRulesCheck?.passed) {
      toast.error('Cannot proceed: Business rules validation failed');
      return;
    }

    // Simulate sending payment
    toast.success('Payment initiated successfully!');
    setTimeout(() => {
      router.push('/payments');
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      passed: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Passed' },
      failed: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Failed' },
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.passed;
    return <Badge className={config.color} variant="outline">{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Send Payment</h1>
            <p className="text-gray-500 mt-1">Transfer funds to another wallet</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="font-medium">Payment Details</span>
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="font-medium">Review & Confirm</span>
        </div>
      </div>

      {/* Step 1: Payment Details */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-orange-600" />
                  Payment Information
                </CardTitle>
                <CardDescription>Enter the details for your payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Wallet */}
                <div className="space-y-2">
                  <Label htmlFor="fromWallet" className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    From Wallet *
                  </Label>
                  <Select value={formData.fromWallet} onValueChange={(value) => handleInputChange('fromWallet', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{wallet.name}</span>
                            <span className="text-sm text-gray-500 ml-4">{formatCurrency(wallet.balance)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.fromWallet && (
                    <p className="text-sm text-gray-500">
                      Available: {formatCurrency(wallets.find(w => w.id === formData.fromWallet)?.balance || 0)}
                    </p>
                  )}
                </div>

                {/* Recipient Type */}
                <div className="space-y-2">
                  <Label htmlFor="recipientType">Recipient Type</Label>
                  <Select value={formData.recipientType} onValueChange={(value) => handleInputChange('recipientType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external">External Wallet</SelectItem>
                      <SelectItem value="internal">Internal Wallet</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Recipient Name */}
                <div className="space-y-2">
                  <Label htmlFor="recipientName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Recipient Name
                  </Label>
                  <Input
                    id="recipientName"
                    placeholder="Enter recipient name"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  />
                </div>

                {/* To Address */}
                <div className="space-y-2">
                  <Label htmlFor="toAddress">Recipient Wallet Address *</Label>
                  <Input
                    id="toAddress"
                    placeholder="0x... or Solana address"
                    value={formData.toAddress}
                    onChange={(e) => handleInputChange('toAddress', e.target.value)}
                    className="font-mono"
                  />
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Amount *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="PYUSD">PYUSD</SelectItem>
                        <SelectItem value="USDXM">USDXM (Monay)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rail Selection */}
                <div className="space-y-2">
                  <Label htmlFor="rail">Blockchain Rail</Label>
                  <Select value={formData.rail} onValueChange={(value) => handleInputChange('rail', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evm">EVM (Base, Polygon)</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Memo */}
                <div className="space-y-2">
                  <Label htmlFor="memo" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Memo / Note
                  </Label>
                  <Textarea
                    id="memo"
                    placeholder="Optional payment description..."
                    value={formData.memo}
                    onChange={(e) => handleInputChange('memo', e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleValidateTransaction}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  size="lg"
                >
                  Continue to Review
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-gray-600">
                    All payments are validated against your business rules before processing
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-gray-600">
                    Typical processing time: 1-5 seconds for blockchain confirmation
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-gray-600">
                    Transaction fees are automatically calculated based on network conditions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  Business Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Daily Limit</span>
                  <span className="font-medium">$50,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AML Threshold</span>
                  <span className="font-medium">$10,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Multi-sig Required</span>
                  <span className="font-medium">&gt;$25,000</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Review & Confirm */}
      {step === 2 && businessRulesCheck && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Business Rules Validation */}
            <Card className={businessRulesCheck.passed ? 'border-green-200' : 'border-red-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className={`h-5 w-5 ${businessRulesCheck.passed ? 'text-green-600' : 'text-red-600'}`} />
                  Business Rules Validation
                </CardTitle>
                <CardDescription>
                  {businessRulesCheck.passed
                    ? 'All compliance checks passed'
                    : 'Some rules require attention before proceeding'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {businessRulesCheck.checks.map((check: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      check.status === 'passed'
                        ? 'bg-green-50 border-green-200'
                        : check.status === 'failed'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{check.rule}</p>
                        {getStatusBadge(check.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Review your payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">From Wallet</p>
                    <p className="font-medium">
                      {wallets.find(w => w.id === formData.fromWallet)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recipient</p>
                    <p className="font-medium">{formData.recipientName || 'External Wallet'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium text-lg">
                      {formatCurrency(parseFloat(formData.amount))} {formData.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blockchain Rail</p>
                    <p className="font-medium">{formData.rail === 'evm' ? 'EVM' : 'Solana'}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Recipient Address</p>
                  <code className="text-sm font-mono break-all block mt-1">{formData.toAddress}</code>
                </div>
                {formData.memo && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">Memo</p>
                    <p className="mt-1">{formData.memo}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back to Edit
                  </Button>
                  <Button
                    onClick={handleSendPayment}
                    disabled={!businessRulesCheck.passed}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Estimated Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Network Fee</span>
                  <span className="font-medium">$0.25</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">$0.50</span>
                </div>
                <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
                  <span>Total Fee</span>
                  <span>$0.75</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Estimated confirmation: <span className="font-medium">1-5 seconds</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
