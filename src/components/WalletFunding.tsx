'use client';

import { useState } from 'react';
import { CreditCard, Building2, Smartphone, Wallet, DollarSign, ArrowRight, CheckCircle } from 'lucide-react';

interface WalletFundingProps {
  requiredAmount: number;
  currentBalance: number;
  walletAddress: string;
  onFundingComplete: (fundedAmount: number, method: string) => void;
}

interface FundingMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  processingTime: string;
  fee: string;
}

export default function WalletFunding({
  requiredAmount,
  currentBalance,
  walletAddress,
  onFundingComplete
}: WalletFundingProps) {
  const [selectedFundingMethod, setSelectedFundingMethod] = useState<string | null>(null);
  const [fundingAmount, setFundingAmount] = useState<number>(requiredAmount - currentBalance);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fundingMethods: FundingMethod[] = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      description: 'Instant funding via card',
      icon: <CreditCard className="w-6 h-6" />,
      processingTime: 'Instant',
      fee: '2.9% + $0.30'
    },
    {
      id: 'ach',
      name: 'Bank Transfer (ACH)',
      description: 'Direct from your bank account',
      icon: <Building2 className="w-6 h-6" />,
      processingTime: '1-2 business days',
      fee: '$0.50'
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      description: 'Quick funding with Apple Pay',
      icon: <Smartphone className="w-6 h-6" />,
      processingTime: 'Instant',
      fee: '2.9% + $0.30'
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      description: 'Quick funding with Google Pay',
      icon: <Smartphone className="w-6 h-6" />,
      processingTime: 'Instant',
      fee: '2.9% + $0.30'
    }
  ];

  const handleFund = async () => {
    if (!selectedFundingMethod || fundingAmount <= 0) return;

    setIsProcessing(true);

    // Simulate funding process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setShowSuccess(true);

    // Wait a moment to show success, then complete
    setTimeout(() => {
      onFundingComplete(fundingAmount, selectedFundingMethod);
    }, 1500);
  };

  const neededAmount = requiredAmount - currentBalance;
  const totalWithFees = fundingAmount * 1.029 + 0.30; // Example fee calculation

  return (
    <div className="space-y-6">
      {!showSuccess ? (
        <>
          {/* Wallet Balance Status */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Fund Your Wallet</h2>
                <p className="text-sm text-slate-600">Add funds to complete your payment</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-600 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${currentBalance.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-xs text-red-600 mb-1">Amount Needed</p>
                <p className="text-2xl font-bold text-red-600">
                  ${neededAmount.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 mb-1">Total Required</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${requiredAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Wallet Address:</strong>
              </p>
              <code className="block mt-2 bg-blue-900 text-green-400 text-xs p-2 rounded font-mono break-all">
                {walletAddress}
              </code>
            </div>
          </div>

          {/* Funding Amount Input */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">How much do you want to add?</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Funding Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg">$</span>
                <input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(parseFloat(e.target.value) || 0)}
                  min={neededAmount}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 text-lg font-semibold border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Minimum: ${neededAmount.toFixed(2)} (to cover payment)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFundingAmount(neededAmount)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Exact Amount
              </button>
              <button
                onClick={() => setFundingAmount(neededAmount + 50)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                +$50
              </button>
              <button
                onClick={() => setFundingAmount(neededAmount + 100)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                +$100
              </button>
            </div>
          </div>

          {/* Funding Methods */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Select Funding Method</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fundingMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedFundingMethod(method.id)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all text-left
                    ${selectedFundingMethod === method.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }
                  `}
                >
                  {selectedFundingMethod === method.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`
                      p-2 rounded-lg
                      ${selectedFundingMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}
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
                      <span className="text-slate-600">Fee:</span>
                      <span className="font-medium text-slate-900">{method.fee}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Funding Summary & Submit */}
          {selectedFundingMethod && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Funding Summary</h3>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-100">Amount to Add:</span>
                  <span className="font-semibold">${fundingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Processing Fee:</span>
                  <span className="font-semibold">${(totalWithFees - fundingAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-400">
                  <span className="text-blue-100">Total Charge:</span>
                  <span className="font-bold text-lg">${totalWithFees.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleFund}
                disabled={isProcessing || !selectedFundingMethod || fundingAmount < neededAmount}
                className="w-full bg-white text-blue-600 font-semibold py-4 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    <span>Add Funds to Wallet</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-blue-100 mt-4">
                Secure transaction • Funds available instantly
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">Wallet Funded!</h3>
          <p className="text-slate-600 mb-4">
            ${fundingAmount.toFixed(2)} has been added to your wallet
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900">
              <strong>New Balance:</strong> ${(currentBalance + fundingAmount).toFixed(2)}
            </p>
            <p className="text-xs text-green-800 mt-1">
              Proceeding to payment selection...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
