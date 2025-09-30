/**
 * Unified Payment Gateway Component
 * Provides on-ramp (deposit) and off-ramp (withdrawal) functionality
 * Supports multiple payment providers via backend APIs
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
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Wallet,
  Globe
} from 'lucide-react';

export interface PaymentConfig {
  apiBaseUrl: string;
  authToken?: string;
  getAuthToken?: () => string | null;
  walletType: 'consumer' | 'enterprise';
}

export interface UnifiedPaymentGatewayProps {
  mode: 'deposit' | 'withdrawal';
  config: PaymentConfig;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  className?: string;
  theme?: 'light' | 'dark';
}

interface PaymentProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fees: string;
  speed: string;
  limits: {
    min: number;
    max: number;
  };
  available: boolean;
  recommended?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  processingTime: string;
  available: boolean;
}

const UnifiedPaymentGateway: React.FC<UnifiedPaymentGatewayProps> = ({
  mode,
  config,
  onSuccess,
  onError,
  className = '',
  theme = 'light'
}) => {
  const [step, setStep] = useState<'amount' | 'provider' | 'method' | 'confirm' | 'processing' | 'complete'>('amount');
  const [amount, setAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Get auth token helper
  const getAuthToken = () => {
    if (config.authToken) return config.authToken;
    if (config.getAuthToken) return config.getAuthToken();
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  };

  // Fetch available providers from backend
  useEffect(() => {
    fetchProviders();
  }, [mode]);

  const fetchProviders = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/payment-providers`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'X-Wallet-Type': config.walletType
        }
      });

      const data = await response.json();

      // Map backend providers to UI format
      const uiProviders: PaymentProvider[] = data.providers.map((p: any) => ({
        id: p.id,
        name: p.name,
        icon: getProviderIcon(p.id),
        description: p.description,
        fees: p.fees,
        speed: p.speed,
        limits: p.limits,
        available: p.available,
        recommended: p.recommended
      }));

      setProviders(uiProviders);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      // Set default providers as fallback
      setDefaultProviders();
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'monay-fiat':
        return <Building2 className="w-5 h-5" />;
      case 'tempo':
        return <Zap className="w-5 h-5" />;
      case 'circle':
        return <Globe className="w-5 h-5" />;
      case 'stripe':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const setDefaultProviders = () => {
    const defaultProviders: PaymentProvider[] = [
      {
        id: 'monay-fiat',
        name: 'Monay Fiat (GPS)',
        icon: <Building2 className="w-5 h-5" />,
        description: 'Traditional banking rails via GPS Banking',
        fees: '0.5%',
        speed: '1-2 business days',
        limits: { min: 10, max: 50000 },
        available: true,
        recommended: true
      },
      {
        id: 'tempo',
        name: 'Tempo',
        icon: <Zap className="w-5 h-5" />,
        description: 'High-speed blockchain rails (100,000+ TPS)',
        fees: '0.01%',
        speed: 'Instant',
        limits: { min: 1, max: 1000000 },
        available: true
      },
      {
        id: 'circle',
        name: 'Circle',
        icon: <Globe className="w-5 h-5" />,
        description: 'USDC stablecoin on multiple chains',
        fees: '0.1%',
        speed: '10-30 seconds',
        limits: { min: 5, max: 250000 },
        available: true
      }
    ];

    setProviders(defaultProviders);
  };

  // Fetch payment methods based on selected provider
  useEffect(() => {
    if (selectedProvider) {
      fetchPaymentMethods(selectedProvider);
    }
  }, [selectedProvider]);

  const fetchPaymentMethods = async (providerId: string) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/payment-methods/${providerId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'X-Wallet-Type': config.walletType
        }
      });

      const data = await response.json();

      const uiMethods: PaymentMethod[] = data.methods.map((m: any) => ({
        id: m.id,
        name: m.name,
        icon: getMethodIcon(m.id),
        processingTime: m.processingTime,
        available: m.available
      }));

      setMethods(uiMethods);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      setDefaultMethods(providerId);
    }
  };

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'bank_account':
        return <Building2 className="w-5 h-5" />;
      case 'debit_card':
        return <CreditCard className="w-5 h-5" />;
      case 'wallet':
        return <Wallet className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const setDefaultMethods = (providerId: string) => {
    const methodsByProvider: Record<string, PaymentMethod[]> = {
      'monay-fiat': [
        {
          id: 'bank_account',
          name: 'Bank Account (ACH)',
          icon: <Building2 className="w-5 h-5" />,
          processingTime: '2-3 business days',
          available: true
        },
        {
          id: 'debit_card',
          name: 'Debit Card',
          icon: <CreditCard className="w-5 h-5" />,
          processingTime: 'Instant',
          available: true
        }
      ],
      'tempo': [
        {
          id: 'wallet',
          name: 'Blockchain Wallet',
          icon: <Wallet className="w-5 h-5" />,
          processingTime: 'Instant',
          available: true
        }
      ],
      'circle': [
        {
          id: 'wallet',
          name: 'USDC Wallet',
          icon: <Wallet className="w-5 h-5" />,
          processingTime: '10-30 seconds',
          available: true
        }
      ]
    };

    setMethods(methodsByProvider[providerId] || []);
  };

  const validateAmount = (value: string): boolean => {
    const numAmount = parseFloat(value);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrors({ amount: 'Please enter a valid amount' });
      return false;
    }

    const provider = providers.find(p => p.id === selectedProvider);
    if (provider) {
      if (numAmount < provider.limits.min) {
        setErrors({ amount: `Minimum amount is $${provider.limits.min}` });
        return false;
      }
      if (numAmount > provider.limits.max) {
        setErrors({ amount: `Maximum amount is $${provider.limits.max}` });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAmount(amount)) return;
    if (!selectedProvider || !selectedMethod) return;

    setLoading(true);
    setStep('processing');

    try {
      const endpoint = mode === 'deposit'
        ? `${config.apiBaseUrl}/deposits`
        : `${config.apiBaseUrl}/withdrawals`;

      const payload = {
        amount: parseFloat(amount),
        provider: selectedProvider,
        method: selectedMethod,
        walletType: config.walletType,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTransactionId(data.transactionId);
        setStep('complete');
        onSuccess?.(data);
      } else {
        throw new Error(data.message || 'Transaction failed');
      }
    } catch (error: any) {
      setErrors({ transaction: error.message });
      setStep('confirm');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('amount');
    setAmount('');
    setSelectedProvider(null);
    setSelectedMethod(null);
    setErrors({});
    setTransactionId(null);
  };

  const themeClasses = theme === 'dark'
    ? 'bg-gray-900 text-white'
    : 'bg-white text-gray-900';

  return (
    <div className={`rounded-lg shadow-lg p-6 ${themeClasses} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {mode === 'deposit' ? (
            <ArrowDownCircle className="w-8 h-8 text-green-500" />
          ) : (
            <ArrowUpCircle className="w-8 h-8 text-blue-500" />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {mode === 'deposit' ? 'Add Money' : 'Withdraw Money'}
            </h2>
            <p className="text-sm text-gray-500">
              {config.walletType === 'enterprise' ? 'Enterprise Wallet' : 'Consumer Wallet'}
            </p>
          </div>
        </div>
        <Shield className="w-6 h-6 text-green-500" />
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['amount', 'provider', 'method', 'confirm'].map((s, idx) => (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full
              ${step === s || ['processing', 'complete'].includes(step) && idx === 3
                ? 'bg-blue-500 text-white'
                : step > s || ['processing', 'complete'].includes(step) && idx < 3
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'}`}>
              {idx + 1}
            </div>
            {idx < 3 && (
              <div className={`flex-1 h-1 mx-2
                ${step > s || ['processing', 'complete'].includes(step) && idx < 3
                  ? 'bg-green-500'
                  : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {step === 'amount' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>
            <button
              onClick={() => {
                if (validateAmount(amount)) {
                  setStep('provider');
                }
              }}
              disabled={!amount}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600
                disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </>
        )}

        {step === 'provider' && (
          <>
            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  disabled={!provider.available}
                  className={`w-full p-4 border rounded-lg transition-all
                    ${selectedProvider === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'}
                    ${!provider.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {provider.icon}
                      <div className="text-left">
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-gray-500">{provider.description}</p>
                      </div>
                    </div>
                    {provider.recommended && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Fees: {provider.fees}</span>
                    <span>Speed: {provider.speed}</span>
                    <span>Limits: ${provider.limits.min} - ${provider.limits.max.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('amount')}
                className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => selectedProvider && setStep('method')}
                disabled={!selectedProvider}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600
                  disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 'method' && (
          <>
            <div className="space-y-3">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={!method.available}
                  className={`w-full p-4 border rounded-lg transition-all
                    ${selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'}
                    ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {method.icon}
                      <div className="text-left">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-gray-500">
                          Processing: {method.processingTime}
                        </p>
                      </div>
                    </div>
                    {method.available && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('provider')}
                className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => selectedMethod && setStep('confirm')}
                disabled={!selectedMethod}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600
                  disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">
                  {providers.find(p => p.id === selectedProvider)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">
                  {methods.find(m => m.id === selectedMethod)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time:</span>
                <span className="font-medium">
                  {methods.find(m => m.id === selectedMethod)?.processingTime}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total:</span>
                <span>${parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>
            {errors.transaction && (
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{errors.transaction}</p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('method')}
                className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600
                  disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  `Confirm ${mode === 'deposit' ? 'Deposit' : 'Withdrawal'}`
                )}
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Processing Transaction</h3>
            <p className="text-gray-500">
              Please wait while we process your {mode}...
            </p>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Transaction Complete!</h3>
            <p className="text-gray-500 mb-4">
              Your {mode} of ${parseFloat(amount).toFixed(2)} has been successfully processed.
            </p>
            {transactionId && (
              <p className="text-sm text-gray-400 mb-4">
                Transaction ID: {transactionId}
              </p>
            )}
            <button
              onClick={resetFlow}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
            >
              Make Another {mode === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </button>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-6 flex items-center space-x-2 text-xs text-gray-500">
        <Shield className="w-4 h-4" />
        <span>Secured by bank-level encryption and compliance</span>
      </div>
    </div>
  );
};

export default UnifiedPaymentGateway;