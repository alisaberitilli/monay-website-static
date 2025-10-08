'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Wallet,
  Check,
  AlertCircle,
  Loader,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import DashboardLayout from '@/components/DashboardLayout';

export default function CrossRailTransferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Wallet data
  const [balance, setBalance] = useState(0);
  const [walletAddresses, setWalletAddresses] = useState({
    solana: '',
    ethereum: ''
  });

  // Transaction result
  const [txResult, setTxResult] = useState<any>(null);

  // Fetch wallet data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, addressesRes] = await Promise.all([
          apiClient.getBalance(),
          apiClient.getWalletAddresses()
        ]);

        if (balanceRes.success && balanceRes.data) {
          const balanceValue = balanceRes.data.totalWalletAmount || balanceRes.data.balance || balanceRes.data.available || 0;
          setBalance(parseFloat(balanceValue));
        }

        if (addressesRes.success && addressesRes.data) {
          setWalletAddresses({
            solana: addressesRes.data.solana || '',
            ethereum: addressesRes.data.base || addressesRes.data.ethereum || ''
          });
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);

    // Validation
    if (!toAddress) {
      setError('Please enter recipient address');
      return;
    }

    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      setError(`Insufficient balance. Available: $${balance.toFixed(2)}`);
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.crossRailTransfer({
        toAddress,
        amount: parseFloat(amount),
        currency: 'USD',
        description: description || 'Cross-rail transfer'
      });

      if (response.success && response.data) {
        setTxResult(response.data);
        setStep('success');
      } else {
        setError(response.error || 'Transfer failed');
      }
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('form');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Cross-Rail Transfer</h1>
          <p className="text-gray-600 mt-2">
            Send funds from Solana (Consumer) to Base L2 (Enterprise)
          </p>
        </div>

        {/* Transfer Form */}
        {step === 'form' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Available Balance */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Solana Network</p>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Base L2 Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the Enterprise Wallet's Base L2 (Ethereum) address
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={balance}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                    required
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-500">Minimum: $0.01</p>
                  <button
                    type="button"
                    onClick={() => setAmount(balance.toString())}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Max: ${balance.toFixed(2)}
                  </button>
                </div>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment for invoice #12345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Transfer Info */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">How it works:</p>
                    <ul className="text-xs text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                      <li>Funds are deducted from your Solana wallet (Consumer Rail)</li>
                      <li>Treasury performs atomic swap to Base L2 network</li>
                      <li>Recipient receives funds on Base L2 (Enterprise Rail)</li>
                      <li>Transfer completes in under 60 seconds</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Continue to Review</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Transfer</h2>
              <p className="text-gray-600">Please confirm the details below</p>
            </div>

            {/* Transfer Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">From (Solana)</p>
                <p className="font-mono text-xs text-gray-900 break-all">{walletAddresses.solana}</p>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">To (Base L2)</p>
                <p className="font-mono text-xs text-gray-900 break-all">{toAddress}</p>
              </div>

              {description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-sm text-gray-900">{description}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">New Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  ${(balance - parseFloat(amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep('form')}
                disabled={loading}
                className="py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Confirm Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && txResult && (
          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
              <p className="text-gray-600">
                ${parseFloat(amount).toFixed(2)} has been sent to {txResult.recipientName}
              </p>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Transaction ID</span>
                <span className="text-sm font-mono text-gray-900">{txResult.transactionId}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-semibold text-gray-900">${txResult.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">From Rail</span>
                <span className="text-sm text-gray-900">{txResult.rails.from}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">To Rail</span>
                <span className="text-sm text-gray-900">{txResult.rails.to}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">New Balance</span>
                <span className="text-sm font-semibold text-gray-900">${txResult.newBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {txResult.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setStep('form');
                  setAmount('');
                  setToAddress('');
                  setDescription('');
                  setError('');
                  setTxResult(null);
                }}
                className="py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Make Another Transfer
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
