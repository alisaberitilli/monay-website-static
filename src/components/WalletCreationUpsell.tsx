'use client';

import { useState } from 'react';
import { Wallet, Shield, Zap, Clock, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import type { PaymentMethod } from '@/app/pay/page';

export type WalletType = 'ephemeral' | 'persistent' | 'adaptive' | 'none';

interface WalletCreationUpsellProps {
  selectedPaymentMethod: PaymentMethod;
  amount: number;
  customerEmail: string;
  organizationName: string;
  onCreateWallet: (walletType: WalletType) => void;
  onPayDirect: () => void;
}

interface WalletOption {
  id: WalletType;
  name: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  recommended?: boolean;
  color: string;
}

export default function WalletCreationUpsell({
  selectedPaymentMethod,
  amount,
  customerEmail,
  organizationName,
  onCreateWallet,
  onPayDirect
}: WalletCreationUpsellProps) {
  const [selectedWallet, setSelectedWallet] = useState<WalletType>('persistent');
  const [kycConsent, setKycConsent] = useState(false);

  const walletOptions: WalletOption[] = [
    {
      id: 'ephemeral',
      name: 'Ephemeral Wallet',
      description: 'Temporary wallet (24 hours)',
      icon: <Clock className="w-5 h-5" />,
      benefits: [
        'Active for 24 hours',
        'No ongoing commitment',
        'Instant setup',
        '$0.25 loyalty credit'
      ],
      color: 'blue'
    },
    {
      id: 'persistent',
      name: 'Persistent Wallet',
      description: 'Permanent wallet with full features',
      icon: <Shield className="w-5 h-5" />,
      benefits: [
        'Permanent account',
        'Save payment methods',
        'Transaction history',
        '$0.25 loyalty credit',
        'Future instant payments'
      ],
      recommended: true,
      color: 'green'
    },
    {
      id: 'adaptive',
      name: 'Adaptive Wallet',
      description: 'Start temporary, upgrade anytime',
      icon: <Zap className="w-5 h-5" />,
      benefits: [
        'Instant start',
        'Upgrade to permanent later',
        'Smart limits',
        '$0.25 loyalty credit',
        'Best of both worlds'
      ],
      color: 'purple'
    }
  ];

  const getPaymentMethodFee = () => {
    const feeMap: Record<PaymentMethod, string> = {
      'echeck': '$0.50',
      'card': `$${(amount * 0.029 + 0.30).toFixed(2)}`,
      'apple-pay': `$${(amount * 0.029 + 0.30).toFixed(2)}`,
      'google-pay': `$${(amount * 0.029 + 0.30).toFixed(2)}`,
      'venmo': `$${(amount * 0.019 + 0.10).toFixed(2)}`,
      'paypal': `$${(amount * 0.0299 + 0.49).toFixed(2)}`,
      'usdc': '$0.01',
      'usdt': '$0.01',
      'pyusd': '$0.01'
    };
    return feeMap[selectedPaymentMethod] || '$0.00';
  };

  const getPaymentMethodName = () => {
    const nameMap: Record<PaymentMethod, string> = {
      'echeck': 'eCheck (ACH)',
      'card': 'Credit/Debit Card',
      'apple-pay': 'Apple Pay',
      'google-pay': 'Google Pay',
      'venmo': 'Venmo',
      'paypal': 'PayPal',
      'usdc': 'USDC',
      'usdt': 'USDT',
      'pyusd': 'PayPal USD'
    };
    return nameMap[selectedPaymentMethod];
  };

  return (
    <div className="space-y-6">
      {/* Two-Column Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Pay Direct */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Pay Directly</h3>
            <p className="text-sm text-slate-600">One-time payment without wallet</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Payment Method:</span>
              <span className="font-semibold text-slate-900">{getPaymentMethodName()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Amount:</span>
              <span className="font-semibold text-slate-900">${amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Processing Fee:</span>
              <span className="font-semibold text-slate-900">{getPaymentMethodFee()}</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="text-slate-900 font-semibold">Total:</span>
              <span className="font-bold text-slate-900">${(amount + parseFloat(getPaymentMethodFee().replace('$', ''))).toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <p className="text-xs text-slate-700 mb-2">What you get:</p>
            <ul className="space-y-1">
              <li className="flex items-start space-x-2 text-xs text-slate-600">
                <CheckCircle className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Payment processed</span>
              </li>
              <li className="flex items-start space-x-2 text-xs text-slate-600">
                <CheckCircle className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Transaction complete</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onPayDirect}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Pay ${amount.toFixed(2)} Now
          </button>
        </div>

        {/* Option 2: Create Wallet & Pay */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-500 p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
            ✨ RECOMMENDED
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-900">Create Monay Wallet & Pay</h3>
            </div>
            <p className="text-sm text-blue-700">Same payment + instant future transactions</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Payment Method:</span>
              <span className="font-semibold text-blue-900">{getPaymentMethodName()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Amount:</span>
              <span className="font-semibold text-blue-900">${amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Processing Fee:</span>
              <span className="font-semibold text-green-600">$0.00 (Waived!)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Loyalty Credit:</span>
              <span className="font-semibold text-green-600">+$0.25</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-blue-200">
              <span className="text-blue-900 font-semibold">Total:</span>
              <span className="font-bold text-blue-900">${amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4">
            <p className="text-xs text-green-900 font-semibold mb-2">🎉 Special Launch Offer:</p>
            <ul className="space-y-1">
              <li className="flex items-start space-x-2 text-xs text-green-800">
                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Processing fees waived</strong> (merchant-paid during adoption)</span>
              </li>
              <li className="flex items-start space-x-2 text-xs text-green-800">
                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span>$0.25 loyalty credit added to wallet</span>
              </li>
              <li className="flex items-start space-x-2 text-xs text-green-800">
                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Future payments: instant settlement</span>
              </li>
              <li className="flex items-start space-x-2 text-xs text-green-800">
                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Ultra-low fees on stablecoin payments</span>
              </li>
              <li className="flex items-start space-x-2 text-xs text-green-800">
                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Save payment methods securely</span>
              </li>
            </ul>
          </div>

          {/* Wallet Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-900 mb-3">Choose Wallet Type:</label>
            <div className="space-y-2">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet.id)}
                  className={`
                    w-full text-left p-3 rounded-lg border-2 transition-all
                    ${selectedWallet === wallet.id
                      ? 'border-blue-500 bg-white shadow-md'
                      : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`
                      p-1.5 rounded-lg flex-shrink-0
                      ${selectedWallet === wallet.id ? 'bg-blue-100 text-blue-600' : 'bg-blue-200 text-blue-700'}
                    `}>
                      {wallet.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-blue-900 text-sm">{wallet.name}</h4>
                        {wallet.recommended && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Recommended</span>
                        )}
                      </div>
                      <p className="text-xs text-blue-700 mt-0.5">{wallet.description}</p>
                    </div>
                    {selectedWallet === wallet.id && (
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* KYC Consent & Email Info */}
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">Enterprise KYC Verification</h4>
                <p className="text-xs text-blue-700">
                  {organizationName} has already verified your identity. No additional ID upload required!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 mb-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">Wallet Credentials</h4>
                <p className="text-xs text-blue-700">
                  Wallet download information and login credentials will be sent to:
                </p>
                <p className="text-xs font-mono bg-blue-100 text-blue-900 px-2 py-1 rounded mt-1">
                  {customerEmail}
                </p>
              </div>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={kycConsent}
                onChange={(e) => setKycConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-blue-900">
                I authorize <strong>{organizationName}</strong> to share my verified identity information with Monay for wallet creation.
              </span>
            </label>
          </div>

          <button
            onClick={() => onCreateWallet(selectedWallet)}
            disabled={!kycConsent}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <Wallet className="w-5 h-5" />
            <span>Create Wallet & Pay ${amount.toFixed(2)}</span>
          </button>

          {!kycConsent && (
            <div className="flex items-center justify-center space-x-1 mt-2">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <p className="text-xs text-amber-700">Please accept the KYC consent to continue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
