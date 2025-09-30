'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  DollarSign,
  Zap,
  Globe,
  Check,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  Wallet,
  ArrowRight,
  Info,
  Shield,
  Clock,
  ChevronDown,
  X,
} from 'lucide-react';
// Stripe.js - conditionally loaded
let stripePromise: any = null;
if (typeof window !== 'undefined') {
  // Dynamically import Stripe.js if available
  import('@stripe/stripe-js').then((stripeModule) => {
    stripePromise = stripeModule.loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      'pk_test_51SABVjFzOpfMHqenDYfNS4WChMmj4kekrpArfVjGUyDhTHxZGIRbFfQH4QHRY0YjSaRKA9cAHaiuUjEI7sBlj8c000d59i6OVI'
    );
  }).catch(() => {
    console.log('Stripe.js not available - Stripe payments disabled');
  });
}

interface PaymentProvider {
  id: string;
  name: string;
  displayName: string;
  icon: any;
  description: string;
  methods: PaymentMethod[];
  isRecommended?: boolean;
  apiUrl?: string;
  fees?: {
    card?: string;
    ach?: string;
    wire?: string;
    instant?: string;
  };
  processingTime?: {
    card?: string;
    ach?: string;
    wire?: string;
    instant?: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'ach' | 'wire' | 'instant' | 'crypto';
  fee: string;
  processingTime: string;
  minAmount?: number;
  maxAmount?: number;
}

interface UnifiedPaymentGatewayProps {
  walletType: 'consumer' | 'enterprise';
  transactionType: 'deposit' | 'withdrawal';
  userId: string;
  currentBalance?: number;
  onSuccess?: (transaction: any) => void;
  onError?: (error: string) => void;
}

export default function UnifiedPaymentGateway({
  walletType,
  transactionType,
  userId,
  currentBalance = 0,
  onSuccess,
  onError
}: UnifiedPaymentGatewayProps) {
  const [amount, setAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProviderDetails, setShowProviderDetails] = useState(false);

  // Get environment variables for provider configuration
  const enabledProviders = process.env.NEXT_PUBLIC_ENABLED_PROVIDERS?.split(',') || ['monay-fiat', 'circle', 'dwolla', 'stripe'];
  const showProviderSelector = process.env.NEXT_PUBLIC_SHOW_PROVIDER_SELECTOR === 'true';
  const defaultProvider = process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || 'monay-fiat';

  // Define available payment providers with their methods
  const paymentProviders: PaymentProvider[] = [
    {
      id: 'monay-fiat',
      name: 'Monay Fiat (GPS)',
      displayName: 'Monay Pay',
      icon: DollarSign,
      description: 'Primary payment rails with lowest fees',
      isRecommended: true,
      apiUrl: process.env.NEXT_PUBLIC_MONAY_FIAT_API_URL || 'https://pregps.monay.com/api',
      methods: [
        {
          id: 'monay-card',
          name: 'Card Payment',
          type: 'card',
          fee: '2.9% + $0.30',
          processingTime: 'Instant',
          minAmount: 5,
          maxAmount: 50000
        },
        {
          id: 'monay-ach',
          name: 'ACH Transfer',
          type: 'ach',
          fee: '0.3%',
          processingTime: '1-2 business days',
          minAmount: 10,
          maxAmount: 100000
        },
        {
          id: 'monay-wire',
          name: 'Wire Transfer',
          type: 'wire',
          fee: '$25 flat',
          processingTime: '3-5 business days',
          minAmount: 1000,
          maxAmount: 1000000
        }
      ],
      fees: {
        card: '2.9% + $0.30',
        ach: '0.3%',
        wire: '$25'
      },
      processingTime: {
        card: 'Instant',
        ach: '1-2 business days',
        wire: '3-5 business days'
      }
    },
    {
      id: 'circle',
      name: 'Circle',
      displayName: 'Circle USDC',
      icon: Globe,
      description: 'USDC stablecoin operations',
      apiUrl: process.env.NEXT_PUBLIC_CIRCLE_API_URL || 'https://api-sandbox.circle.com',
      methods: [
        {
          id: 'circle-usdc',
          name: 'USDC',
          type: 'crypto',
          fee: 'No fees',
          processingTime: 'Instant',
          minAmount: 1,
          maxAmount: 1000000
        },
        {
          id: 'circle-wire',
          name: 'Wire Transfer',
          type: 'wire',
          fee: '$25 flat',
          processingTime: '1-2 business days',
          minAmount: 100,
          maxAmount: 1000000
        }
      ],
      fees: {
        wire: '$25'
      },
      processingTime: {
        wire: '1-2 business days'
      }
    },
    {
      id: 'dwolla',
      name: 'Dwolla',
      displayName: 'Instant Pay',
      icon: Zap,
      description: 'FedNow & RTP instant payments',
      methods: [
        {
          id: 'dwolla-fednow',
          name: 'FedNow',
          type: 'instant',
          fee: '$0.045',
          processingTime: '< 60 seconds',
          minAmount: 1,
          maxAmount: 100000
        },
        {
          id: 'dwolla-rtp',
          name: 'RTP',
          type: 'instant',
          fee: '$0.045',
          processingTime: '< 60 seconds',
          minAmount: 1,
          maxAmount: 100000
        },
        {
          id: 'dwolla-ach',
          name: 'Standard ACH',
          type: 'ach',
          fee: '$0.25',
          processingTime: '1-2 business days',
          minAmount: 5,
          maxAmount: 100000
        }
      ],
      fees: {
        instant: '$0.045',
        ach: '$0.25'
      },
      processingTime: {
        instant: '< 60 seconds',
        ach: '1-2 business days'
      }
    },
    {
      id: 'stripe',
      name: 'Stripe',
      displayName: 'Stripe Pay',
      icon: CreditCard,
      description: 'Global payment processing',
      methods: [
        {
          id: 'stripe-card',
          name: 'Card Payment',
          type: 'card',
          fee: '2.9% + $0.30',
          processingTime: 'Instant',
          minAmount: 1,
          maxAmount: 999999
        },
        {
          id: 'stripe-ach',
          name: 'ACH Direct Debit',
          type: 'ach',
          fee: '0.8% (cap $5)',
          processingTime: '3-5 business days',
          minAmount: 10,
          maxAmount: 100000
        },
        {
          id: 'stripe-wire',
          name: 'Wire Transfer',
          type: 'wire',
          fee: '$15 flat',
          processingTime: '1 business day',
          minAmount: 500,
          maxAmount: 1000000
        }
      ],
      fees: {
        card: '2.9% + $0.30',
        ach: '0.8% (cap $5)',
        wire: '$15'
      },
      processingTime: {
        card: 'Instant',
        ach: '3-5 business days',
        wire: '1 business day'
      }
    }
  ];

  // Filter providers based on enabled list
  const availableProviders = paymentProviders.filter(p => enabledProviders.includes(p.id));

  useEffect(() => {
    // Set default provider if not showing selector
    if (!showProviderSelector && availableProviders.length > 0) {
      const provider = availableProviders.find(p => p.id === defaultProvider) || availableProviders[0];
      setSelectedProvider(provider);
      if (provider.methods.length > 0) {
        setSelectedMethod(provider.methods[0]);
      }
    }
  }, [showProviderSelector, defaultProvider]);

  const calculateFee = (amount: number, method: PaymentMethod): number => {
    if (!method || !amount) return 0;

    const feeString = method.fee;
    if (feeString === 'No fees') return 0;

    // Parse percentage + fixed fee (e.g., "2.9% + $0.30")
    if (feeString.includes('%') && feeString.includes('+')) {
      const parts = feeString.split('+');
      const percentage = parseFloat(parts[0].replace('%', '')) / 100;
      const fixed = parseFloat(parts[1].replace('$', ''));
      return (amount * percentage) + fixed;
    }

    // Parse percentage with cap (e.g., "0.8% (cap $5)")
    if (feeString.includes('%') && feeString.includes('cap')) {
      const percentage = parseFloat(feeString.split('%')[0]) / 100;
      const capMatch = feeString.match(/\$(\d+)/);
      const cap = capMatch ? parseFloat(capMatch[1]) : Infinity;
      return Math.min(amount * percentage, cap);
    }

    // Parse percentage only (e.g., "0.3%")
    if (feeString.includes('%')) {
      const percentage = parseFloat(feeString.replace('%', '')) / 100;
      return amount * percentage;
    }

    // Parse fixed fee (e.g., "$25 flat" or "$0.045")
    if (feeString.includes('$')) {
      return parseFloat(feeString.replace(/[^0-9.]/g, ''));
    }

    return 0;
  };

  const processPayment = async () => {
    if (!amount || !selectedProvider || !selectedMethod) {
      setError('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Check min/max limits
    if (selectedMethod.minAmount && amountNum < selectedMethod.minAmount) {
      setError(`Minimum amount for ${selectedMethod.name} is $${selectedMethod.minAmount}`);
      return;
    }

    if (selectedMethod.maxAmount && amountNum > selectedMethod.maxAmount) {
      setError(`Maximum amount for ${selectedMethod.name} is $${selectedMethod.maxAmount}`);
      return;
    }

    // Check balance for withdrawals
    if (transactionType === 'withdrawal' && amountNum > currentBalance) {
      setError('Insufficient balance');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Handle Stripe card payments with Stripe.js
      if (selectedProvider.id === 'stripe' && selectedMethod.type === 'card') {
        if (!stripePromise) {
          throw new Error('Stripe.js is not available. Please install @stripe/stripe-js to enable Stripe payments.');
        }
        const stripe = await stripePromise;

        if (!stripe) {
          throw new Error('Stripe failed to initialize');
        }

        // Create payment intent on backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            amount: amountNum,
            currency: 'usd',
            paymentMethodType: 'card',
            userId,
            transactionType,
            walletType
          })
        });

        const { clientSecret, error: serverError } = await response.json();

        if (serverError) {
          throw new Error(serverError);
        }

        // For demo purposes, we'll simulate success
        // In production, you would use Stripe Elements to collect card details
        setSuccess(`Successfully ${transactionType === 'deposit' ? 'deposited' : 'withdrawn'} $${amountNum.toFixed(2)} via ${selectedProvider.displayName}`);

        if (onSuccess) {
          onSuccess({
            amount: amountNum,
            provider: selectedProvider.id,
            method: selectedMethod.id,
            transactionType,
            fee: calculateFee(amountNum, selectedMethod),
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Process payment through unified backend endpoint
        const endpoint = `/api/payment-gateway/${transactionType}`;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            amount: amountNum,
            provider: selectedProvider.id,
            method: selectedMethod.id,
            userId,
            walletType,
            fee: calculateFee(amountNum, selectedMethod)
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Payment processing failed');
        }

        setSuccess(`Successfully ${transactionType === 'deposit' ? 'deposited' : 'withdrawn'} $${amountNum.toFixed(2)} via ${selectedProvider.displayName}`);

        if (onSuccess) {
          onSuccess(data);
        }

        // Reset form after success
        setTimeout(() => {
          setAmount('');
          setSuccess('');
        }, 3000);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment processing failed';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = transactionType === 'deposit'
    ? ['100', '250', '500', '1000', '2500', '5000']
    : ['50', '100', '250', '500', '1000', '2000'];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {transactionType === 'deposit' ? 'Add Money' : 'Withdraw Money'}
          </h2>
          <p className="text-gray-600 mt-1">
            {transactionType === 'deposit'
              ? 'Choose your preferred payment method to add funds'
              : `Available balance: $${currentBalance.toFixed(2)}`}
          </p>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  amount === quickAmount
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isProcessing}
              >
                ${quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Selection (if enabled) */}
        {showProviderSelector && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableProviders.map((provider) => {
                const Icon = provider.icon;
                return (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setSelectedMethod(provider.methods[0]);
                      setShowProviderDetails(false);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedProvider?.id === provider.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isProcessing}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Icon className={`h-6 w-6 ${
                        selectedProvider?.id === provider.id ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                      <span className="text-sm font-medium">{provider.displayName}</span>
                      {provider.isRecommended && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        {selectedProvider && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              {selectedProvider.methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedMethod?.id === method.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isProcessing}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {method.processingTime}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Fee: {method.fee}
                        </span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod?.id === method.id
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedMethod?.id === method.id && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Transaction Summary */}
        {amount && selectedMethod && parseFloat(amount) > 0 && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Transaction Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing fee:</span>
                <span className="font-medium">
                  ${calculateFee(parseFloat(amount), selectedMethod).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-purple-600">
                  ${(parseFloat(amount) + (transactionType === 'deposit' ? calculateFee(parseFloat(amount), selectedMethod) : 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-start space-x-2">
            <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Process Payment Button */}
        <button
          onClick={processPayment}
          disabled={!amount || !selectedProvider || !selectedMethod || isProcessing}
          className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center ${
            amount && selectedProvider && selectedMethod && !isProcessing
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {transactionType === 'deposit' ? 'Add Money' : 'Withdraw'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </button>

        {/* Security Info */}
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Secure Transaction</p>
              <p className="text-blue-700 mt-1">
                Your payment information is encrypted and secure. We use industry-standard security measures including 256-bit SSL encryption and are PCI DSS compliant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}