/**
 * Unified Payment Gateway Component
 * Provides on-ramp (deposit) and off-ramp (withdrawal) functionality
 * Supports multiple payment providers: Monay-Fiat (GPS), Dwolla, Stripe
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  Zap,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Wallet,
  Globe,
  TrendingUp,
  Info
} from 'lucide-react';

// Payment Provider Types
type PaymentProvider = 'monay-fiat' | 'dwolla' | 'stripe' | 'circle';
type PaymentMethod = 'card' | 'ach' | 'wire' | 'instant' | 'crypto';
type TransactionType = 'deposit' | 'withdrawal';

interface PaymentProviderConfig {
  id: PaymentProvider;
  name: string;
  displayName: string;
  description: string;
  icon: React.ComponentType<any>;
  supportedMethods: PaymentMethod[];
  fees: {
    [key in PaymentMethod]?: {
      fixed: number;
      percentage: number;
      min?: number;
      max?: number;
    };
  };
  processingTime: {
    [key in PaymentMethod]?: string;
  };
  limits: {
    [key in PaymentMethod]?: {
      min: number;
      max: number;
      daily?: number;
    };
  };
  availability: string;
  priority: number;
  color: string;
}

// Payment Provider Configurations
const paymentProviders: PaymentProviderConfig[] = [
  {
    id: 'monay-fiat',
    name: 'Monay GPS',
    displayName: 'Monay Fiat (GPS)',
    description: 'Primary on/off-ramp provider with card and ACH support',
    icon: Globe,
    supportedMethods: ['card', 'ach', 'wire'],
    fees: {
      card: { fixed: 0.30, percentage: 0.029 }, // 2.9% + $0.30
      ach: { fixed: 0, percentage: 0.003 }, // 0.3%
      wire: { fixed: 25, percentage: 0 }
    },
    processingTime: {
      card: 'Instant',
      ach: '2-3 business days',
      wire: 'Same day'
    },
    limits: {
      card: { min: 1, max: 10000, daily: 50000 },
      ach: { min: 10, max: 100000, daily: 500000 },
      wire: { min: 100, max: 1000000, daily: 5000000 }
    },
    availability: '24/7',
    priority: 1,
    color: 'purple'
  },
  {
    id: 'dwolla',
    name: 'Dwolla',
    displayName: 'Dwolla (FedNow/RTP)',
    description: 'Instant payments via FedNow and Real-Time Payments',
    icon: Zap,
    supportedMethods: ['ach', 'instant'],
    fees: {
      instant: { fixed: 0.045, percentage: 0 }, // $0.045 for FedNow/RTP
      ach: { fixed: 0.25, percentage: 0 } // $0.25 for standard ACH
    },
    processingTime: {
      instant: '< 20 seconds',
      ach: '1-2 business days'
    },
    limits: {
      instant: { min: 1, max: 1000000 },
      ach: { min: 1, max: 100000 }
    },
    availability: '24/7/365',
    priority: 2,
    color: 'orange'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    displayName: 'Stripe',
    description: 'Global payments with cards and international support',
    icon: CreditCard,
    supportedMethods: ['card', 'ach', 'wire'],
    fees: {
      card: { fixed: 0.30, percentage: 0.029 },
      ach: { fixed: 0, percentage: 0.008 }, // 0.8% capped at $5
      wire: { fixed: 15, percentage: 0 }
    },
    processingTime: {
      card: 'Instant',
      ach: '3-5 business days',
      wire: '1-2 business days'
    },
    limits: {
      card: { min: 0.50, max: 999999 },
      ach: { min: 1, max: 100000 },
      wire: { min: 100, max: 10000000 }
    },
    availability: '24/7',
    priority: 3,
    color: 'blue'
  },
  {
    id: 'circle',
    name: 'Circle',
    displayName: 'Circle (USDC)',
    description: 'Stablecoin minting and redemption',
    icon: Wallet,
    supportedMethods: ['crypto', 'wire'],
    fees: {
      crypto: { fixed: 0, percentage: 0 }, // No fees for USDC
      wire: { fixed: 25, percentage: 0 }
    },
    processingTime: {
      crypto: 'Instant',
      wire: '1-2 business days'
    },
    limits: {
      crypto: { min: 1, max: 10000000 },
      wire: { min: 100, max: 10000000 }
    },
    availability: '24/7',
    priority: 4,
    color: 'green'
  }
];

interface UnifiedPaymentGatewayProps {
  walletType: 'consumer' | 'enterprise';
  transactionType: TransactionType;
  onSuccess?: (transaction: any) => void;
  onError?: (error: any) => void;
  initialAmount?: string;
  userId: string;
  currentBalance?: number;
}

export default function UnifiedPaymentGateway({
  walletType,
  transactionType,
  onSuccess,
  onError,
  initialAmount = '',
  userId,
  currentBalance = 0
}: UnifiedPaymentGatewayProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderConfig | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'provider' | 'method' | 'confirm' | 'processing'>('amount');
  const [transactionFee, setTransactionFee] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Filter providers based on wallet type
  const availableProviders = paymentProviders.filter(provider => {
    if (walletType === 'consumer') {
      return ['monay-fiat', 'dwolla', 'stripe'].includes(provider.id);
    } else {
      // Enterprise wallet
      return true; // All providers available
    }
  }).sort((a, b) => a.priority - b.priority);

  // Calculate fees when amount or method changes
  useEffect(() => {
    if (amount && selectedProvider && selectedMethod) {
      const feeConfig = selectedProvider.fees[selectedMethod];
      if (feeConfig) {
        const fee = (parseFloat(amount) * feeConfig.percentage) + feeConfig.fixed;
        setTransactionFee(fee);
      }

      const time = selectedProvider.processingTime[selectedMethod];
      setEstimatedTime(time || 'Unknown');
    }
  }, [amount, selectedProvider, selectedMethod]);

  // Validate amount
  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrors({ amount: 'Please enter a valid amount' });
      return false;
    }

    if (transactionType === 'withdrawal' && numAmount > currentBalance) {
      setErrors({ amount: 'Insufficient balance' });
      return false;
    }

    if (selectedProvider && selectedMethod) {
      const limits = selectedProvider.limits[selectedMethod];
      if (limits) {
        if (numAmount < limits.min) {
          setErrors({ amount: `Minimum amount is $${limits.min}` });
          return false;
        }
        if (numAmount > limits.max) {
          setErrors({ amount: `Maximum amount is $${limits.max}` });
          return false;
        }
      }
    }

    setErrors({});
    return true;
  };

  // Process transaction
  const processTransaction = async () => {
    if (!validateAmount() || !selectedProvider || !selectedMethod) {
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      // Determine the API endpoint based on provider and transaction type
      let endpoint = '';
      let payload: any = {
        amount: parseFloat(amount),
        userId,
        provider: selectedProvider.id,
        method: selectedMethod,
        type: transactionType
      };

      switch (selectedProvider.id) {
        case 'monay-fiat':
          endpoint = transactionType === 'deposit'
            ? '/api/monay-fiat/payment/add-money'
            : '/api/monay-fiat/payment/withdraw';
          payload.merchantId = selectedMethod === 'ach' ? '8DutmzBEHr4W' : 'lpEGBQCW1mtX';
          break;

        case 'dwolla':
          endpoint = transactionType === 'deposit'
            ? '/api/payment-rails/transfer/deposit'
            : '/api/payment-rails/transfer/withdraw';
          payload.rail = selectedMethod === 'instant' ? 'FEDNOW' : 'STANDARD_ACH';
          break;

        case 'stripe':
          endpoint = transactionType === 'deposit'
            ? '/api/stripe/charge'
            : '/api/stripe/payout';
          break;

        case 'circle':
          endpoint = transactionType === 'deposit'
            ? '/api/circle/mint'
            : '/api/circle/burn';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess?.(data);
        // Reset form
        setAmount('');
        setSelectedProvider(null);
        setSelectedMethod(null);
        setStep('amount');
      } else {
        throw new Error(data.message || 'Transaction failed');
      }
    } catch (error: any) {
      onError?.(error);
      setErrors({ transaction: error.message });
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 'amount':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">
              Enter {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} Amount
            </h3>

            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 text-2xl font-semibold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            {errors.amount && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errors.amount}</span>
              </div>
            )}

            {/* Quick amount buttons */}
            <div className="grid grid-cols-3 gap-3">
              {['100', '500', '1000', '2500', '5000', '10000'].map(quickAmount => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  className={`py-3 rounded-lg font-medium transition-all ${
                    amount === quickAmount
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (amount && parseFloat(amount) > 0) {
                  setStep('provider');
                }
              }}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Continue
            </button>
          </div>
        );

      case 'provider':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Select Payment Provider</h3>

            <div className="space-y-3">
              {availableProviders.map(provider => {
                const Icon = provider.icon;
                const isSelected = selectedProvider?.id === provider.id;

                return (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg bg-${provider.color}-100 flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 text-${provider.color}-600`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{provider.displayName}</h4>
                          <p className="text-sm text-gray-600">{provider.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {provider.availability}
                            </span>
                            {provider.priority === 1 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="h-5 w-5 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('amount')}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (selectedProvider) {
                    setStep('method');
                  }
                }}
                disabled={!selectedProvider}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  selectedProvider
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'method':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Select Payment Method</h3>

            <div className="space-y-3">
              {selectedProvider?.supportedMethods.map(method => {
                const isSelected = selectedMethod === method;
                const methodDetails = {
                  card: { name: 'Credit/Debit Card', icon: CreditCard },
                  ach: { name: 'Bank Transfer (ACH)', icon: Building2 },
                  wire: { name: 'Wire Transfer', icon: TrendingUp },
                  instant: { name: 'Instant Payment', icon: Zap },
                  crypto: { name: 'Cryptocurrency', icon: Wallet }
                };

                const details = methodDetails[method];
                const Icon = details.icon;
                const fee = selectedProvider.fees[method];
                const time = selectedProvider.processingTime[method];

                return (
                  <div
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{details.name}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {time}
                            </span>
                            {fee && (
                              <span className="text-xs text-gray-500">
                                Fee: {fee.percentage > 0 ? `${fee.percentage * 100}%` : ''}
                                {fee.percentage > 0 && fee.fixed > 0 ? ' + ' : ''}
                                {fee.fixed > 0 ? `$${fee.fixed}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="h-5 w-5 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('provider')}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (selectedMethod) {
                    setStep('confirm');
                  }
                }}
                disabled={!selectedMethod}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  selectedMethod
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'confirm':
        const totalAmount = transactionType === 'deposit'
          ? parseFloat(amount) + transactionFee
          : parseFloat(amount) - transactionFee;

        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Confirm Transaction</h3>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-lg">${amount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Provider</span>
                <span className="font-medium">{selectedProvider?.displayName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Method</span>
                <span className="font-medium capitalize">{selectedMethod}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing Time</span>
                <span className="font-medium">{estimatedTime}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fee</span>
                <span className="font-medium">${transactionFee.toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">
                    {transactionType === 'deposit' ? 'Total to Pay' : 'You will receive'}
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {errors.transaction && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errors.transaction}</span>
              </div>
            )}

            <div className="flex items-start space-x-2 bg-blue-50 p-4 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Security Notice</p>
                <p>Your transaction is secured with 256-bit encryption and processed through PCI-compliant systems.</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('method')}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={processTransaction}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {transactionType === 'deposit' ? (
                      <ArrowDownCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5 mr-2" />
                    )}
                    Confirm {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6 py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full">
              <RefreshCw className="h-10 w-10 text-purple-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold">Processing Transaction</h3>
            <p className="text-gray-600">
              Please wait while we process your {transactionType}...
            </p>
            <p className="text-sm text-gray-500">
              Estimated time: {estimatedTime}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['amount', 'provider', 'method', 'confirm'].map((s, index) => {
              const stepNumber = index + 1;
              const isActive = step === s;
              const isCompleted = ['amount', 'provider', 'method', 'confirm'].indexOf(step) > index;

              return (
                <React.Fragment key={s}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                    </div>
                    <span className={`ml-2 text-sm ${
                      isActive ? 'text-purple-600 font-medium' : 'text-gray-500'
                    }`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        {getStepContent()}

        {/* Security Badge */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4 text-green-600" />
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}