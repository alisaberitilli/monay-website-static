'use client';

import { useState } from 'react';
import { Wallet, Clock, Shield, Zap, Mail, User, ArrowRight } from 'lucide-react';

export type WalletType = 'ephemeral' | 'persistent' | 'adaptive' | 'none';

interface WalletTypeSelectorProps {
  selectedWallet: WalletType;
  onSelectWallet: (type: WalletType) => void;
  firstName?: string;
  lastName?: string;
  onWalletCreated?: (email: string) => void;
}

interface WalletOption {
  id: WalletType;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
  color: string;
}

export default function WalletTypeSelector({
  selectedWallet,
  onSelectWallet,
  firstName = '',
  lastName = '',
  onWalletCreated
}: WalletTypeSelectorProps) {
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const walletOptions: WalletOption[] = [
    {
      id: 'none',
      name: 'No Wallet',
      description: 'One-time payment without creating a wallet',
      icon: <Clock className="w-6 h-6" />,
      features: [
        'No account creation',
        'Single payment only',
        'No saved payment methods',
        'No transaction history'
      ],
      color: 'slate'
    },
    {
      id: 'ephemeral',
      name: 'Ephemeral Wallet',
      description: 'Temporary wallet for this payment session',
      icon: <Clock className="w-6 h-6" />,
      features: [
        'Active for 24 hours',
        'No KYC required',
        'Quick setup',
        'Automatically expires',
        'Perfect for one-time payments'
      ],
      color: 'blue'
    },
    {
      id: 'persistent',
      name: 'Persistent Wallet',
      description: 'Permanent wallet with full features',
      icon: <Shield className="w-6 h-6" />,
      features: [
        'Permanent account',
        'KYC verification',
        'Save payment methods',
        'Transaction history',
        'Recurring payments',
        'Full wallet features'
      ],
      recommended: true,
      color: 'green'
    },
    {
      id: 'adaptive',
      name: 'Adaptive Wallet',
      description: 'Starts temporary, converts to permanent',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Instant start (no KYC)',
        'Upgrade to permanent anytime',
        'Smart transaction limits',
        'Seamless transition',
        'Best of both worlds'
      ],
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      switch (color) {
        case 'blue':
          return 'border-blue-500 bg-blue-50';
        case 'green':
          return 'border-green-500 bg-green-50';
        case 'purple':
          return 'border-purple-500 bg-purple-50';
        case 'slate':
          return 'border-slate-500 bg-slate-50';
        default:
          return 'border-slate-500 bg-slate-50';
      }
    }
    return 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm';
  };

  const getIconColor = (color: string, isSelected: boolean) => {
    if (isSelected) {
      switch (color) {
        case 'blue':
          return 'bg-blue-100 text-blue-600';
        case 'green':
          return 'bg-green-100 text-green-600';
        case 'purple':
          return 'bg-purple-100 text-purple-600';
        case 'slate':
          return 'bg-slate-100 text-slate-600';
        default:
          return 'bg-slate-100 text-slate-600';
      }
    }
    return 'bg-slate-100 text-slate-600';
  };

  const handleQuickCreate = async (walletType: WalletType) => {
    if (!email || walletType === 'none') return;

    setIsCreating(true);

    // Simulate wallet creation API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setCreationSuccess(true);
    setIsCreating(false);

    // Call the callback if provided
    if (onWalletCreated) {
      onWalletCreated(email);
    }

    // Auto-select the wallet type after creation
    setTimeout(() => {
      onSelectWallet(walletType);
      setShowQuickCreate(false);
      setCreationSuccess(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Wallet className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Create Monay Wallet (Optional)</h2>
        </div>
        <p className="text-sm text-slate-600">
          Choose a wallet type to save payment methods and track transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {walletOptions.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => onSelectWallet(wallet.id)}
            className={`
              relative p-5 rounded-xl border-2 transition-all duration-200 text-left
              ${getColorClasses(wallet.color, selectedWallet === wallet.id)}
            `}
          >
            {wallet.recommended && (
              <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Recommended
              </div>
            )}

            {selectedWallet === wallet.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="flex items-start space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${getIconColor(wallet.color, selectedWallet === wallet.id)}`}>
                {wallet.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-base mb-1">{wallet.name}</h3>
                <p className="text-xs text-slate-600">{wallet.description}</p>
              </div>
            </div>

            <ul className="space-y-1.5">
              {wallet.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2 text-xs text-slate-700">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {selectedWallet !== 'none' && !showQuickCreate && (
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">What happens next?</h4>
            <div className="text-xs text-blue-800 space-y-1">
              {selectedWallet === 'ephemeral' && (
                <>
                  <p>✓ Wallet created instantly after payment</p>
                  <p>✓ Active for 24 hours</p>
                  <p>✓ No personal information required</p>
                  <p>✓ Wallet address sent to your email</p>
                </>
              )}
              {selectedWallet === 'persistent' && (
                <>
                  <p>✓ Complete KYC verification after payment</p>
                  <p>✓ Permanent wallet with full features</p>
                  <p>✓ Save multiple payment methods</p>
                  <p>✓ Access via mobile app or web</p>
                </>
              )}
              {selectedWallet === 'adaptive' && (
                <>
                  <p>✓ Start with basic wallet (no KYC)</p>
                  <p>✓ Upgrade to verified wallet anytime</p>
                  <p>✓ Automatic limit increases</p>
                  <p>✓ Smooth transition to full features</p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowQuickCreate(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Zap className="w-5 h-5" />
            <span>Quick Create Wallet Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {showQuickCreate && selectedWallet !== 'none' && (
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-lg">
                Create Your {walletOptions.find(w => w.id === selectedWallet)?.name}
              </h4>
              <p className="text-xs text-blue-700">Takes less than 30 seconds</p>
            </div>
          </div>

          {!creationSuccess ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Name
                </label>
                <input
                  type="text"
                  value={`${firstName} ${lastName}`}
                  disabled
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  disabled={isCreating}
                />
                <p className="text-xs text-blue-700 mt-1">
                  We'll send your wallet details to this email
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleQuickCreate(selectedWallet)}
                  disabled={!email || isCreating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Wallet...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Create Wallet</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowQuickCreate(false)}
                  disabled={isCreating}
                  className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <strong>Quick & Secure:</strong> Your wallet will be created instantly.
                  {selectedWallet === 'persistent' && ' You can complete KYC verification after payment.'}
                  {selectedWallet === 'ephemeral' && ' No verification needed - wallet active for 24 hours.'}
                  {selectedWallet === 'adaptive' && ' Start immediately, upgrade to verified anytime.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h5 className="text-lg font-bold text-green-900 mb-2">Wallet Created!</h5>
              <p className="text-sm text-green-800">
                Your {walletOptions.find(w => w.id === selectedWallet)?.name} is being set up...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
