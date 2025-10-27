'use client';

import { useState } from 'react';
import { CreditCard, Building2, Smartphone, Wallet, DollarSign, Loader2 } from 'lucide-react';
import type { PaymentMethod } from '@/app/pay/page';

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: PaymentMethod) => void;
  selectedMethod: PaymentMethod | null;
  amount: number;
  onSubmit: () => Promise<void>;
  walletType?: 'none' | 'ephemeral' | 'persistent' | 'adaptive';
}

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  processingTime: string;
  fee: string;
  category: 'traditional' | 'digital' | 'crypto';
}

export default function PaymentMethodSelector({
  onSelectMethod,
  selectedMethod,
  amount,
  onSubmit,
  walletType = 'none'
}: PaymentMethodSelectorProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Only show stablecoins if a wallet is selected
  const hasWallet = walletType !== 'none';

  const paymentMethods: PaymentMethodOption[] = [
    // Traditional Banking
    {
      id: 'echeck',
      name: 'eCheck (ACH)',
      description: 'Direct bank transfer via ACH network',
      icon: <Building2 className="w-6 h-6" />,
      processingTime: '1-3 business days',
      fee: '$0.50',
      category: 'traditional'
    },
    {
      id: 'card',
      name: 'Debit/Credit Card',
      description: 'Visa, Mastercard, Amex, Discover',
      icon: <CreditCard className="w-6 h-6" />,
      processingTime: 'Instant',
      fee: '2.9% + $0.30',
      category: 'traditional'
    },

    // Digital Wallets
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      description: 'Pay with your Apple device',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      ),
      processingTime: 'Instant',
      fee: '2.9% + $0.30',
      category: 'digital'
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      description: 'Pay with your Google account',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
        </svg>
      ),
      processingTime: 'Instant',
      fee: '2.9% + $0.30',
      category: 'digital'
    },
    {
      id: 'venmo',
      name: 'Venmo',
      description: 'Pay with your Venmo balance',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.524 4.355c.77 1.37 1.128 2.805 1.128 4.41 0 5.505-4.68 12.595-8.514 17.235H6.378L3.222 4.355h5.804l1.652 10.932c1.326-2.105 3.395-5.97 3.395-9.01 0-1.128-.195-2.027-.52-2.772l5.571-.15z"/>
        </svg>
      ),
      processingTime: 'Instant',
      fee: '1.9% + $0.10',
      category: 'digital'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
        </svg>
      ),
      processingTime: 'Instant',
      fee: '2.99% + $0.49',
      category: 'digital'
    },

    // Stablecoins
    {
      id: 'usdc',
      name: 'USDC',
      description: 'USD Coin stablecoin payment',
      icon: <DollarSign className="w-6 h-6" />,
      processingTime: '~30 seconds',
      fee: '+$0.25 Credit',
      category: 'crypto'
    },
    {
      id: 'usdt',
      name: 'USDT',
      description: 'Tether stablecoin payment',
      icon: <DollarSign className="w-6 h-6" />,
      processingTime: '~30 seconds',
      fee: '+$0.25 Credit',
      category: 'crypto'
    },
    {
      id: 'pyusd',
      name: 'PayPal USD',
      description: 'PayPal stablecoin (PYUSD)',
      icon: <Wallet className="w-6 h-6" />,
      processingTime: '~30 seconds',
      fee: '+$0.25 Credit',
      category: 'crypto'
    }
  ];

  const handleSubmit = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    await onSubmit();
    setIsProcessing(false);
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'traditional':
        return 'Traditional Banking';
      case 'digital':
        return 'Digital Wallets';
      case 'crypto':
        return 'Stablecoins';
      default:
        return '';
    }
  };

  // Filter payment methods based on wallet selection
  const filteredMethods = hasWallet
    ? paymentMethods.filter(method => method.category === 'crypto')  // Only stablecoins with wallet
    : paymentMethods.filter(method => method.category !== 'crypto'); // No stablecoins without wallet

  const groupedMethods = filteredMethods.reduce((acc, method) => {
    if (!acc[method.category]) {
      acc[method.category] = [];
    }
    acc[method.category].push(method);
    return acc;
  }, {} as Record<string, PaymentMethodOption[]>);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Select Payment Method</h2>

        {hasWallet ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <Wallet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  💎 Wallet Payment Methods - Earn Loyalty Credits!
                </p>
                <p className="text-xs text-blue-800">
                  Pay with stablecoins and earn $0.25 in loyalty credits on this transaction!
                  Stablecoins provide instant settlement, ultra-low fees, and funds go directly into your wallet.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <CreditCard className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Traditional Payment Methods
                </p>
                <p className="text-xs text-amber-800">
                  You're using traditional payment methods. To unlock stablecoin payments with loyalty credits ($0.25),
                  create a Monay Wallet above (Ephemeral, Persistent, or Adaptive).
                </p>
              </div>
            </div>
          </div>
        )}

        {Object.entries(groupedMethods).map(([category, methods]) => (
          <div key={category} className="mb-8 last:mb-0">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
              {getCategoryTitle(category)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => onSelectMethod(method.id)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }
                  `}
                >
                  {selectedMethod === method.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`
                      p-2 rounded-lg
                      ${selectedMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}
                    `}>
                      {method.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm">{method.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{method.description}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Processing:</span>
                      <span className="font-medium text-slate-900">{method.processingTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{method.category === 'crypto' ? 'Reward:' : 'Fee:'}</span>
                      <span className={`font-medium ${method.category === 'crypto' ? 'text-green-600' : 'text-slate-900'}`}>
                        {method.fee}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Summary & Submit */}
      {selectedMethod && (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Amount</p>
              <p className="text-4xl font-bold">
                ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm mb-1">Payment Method</p>
              <p className="text-lg font-semibold">
                {paymentMethods.find(m => m.id === selectedMethod)?.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-white text-blue-600 font-semibold py-4 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <span>Complete Payment</span>
            )}
          </button>

          <p className="text-center text-xs text-blue-100 mt-4">
            This is a simulation. No actual payment will be processed.
          </p>
        </div>
      )}
    </div>
  );
}
