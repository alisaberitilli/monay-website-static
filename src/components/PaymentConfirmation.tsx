'use client';

import { CheckCircle2, Download, Share2, ArrowLeft, Wallet } from 'lucide-react';
import type { PaymentRequestData, PaymentMethod } from '@/app/pay/page';
import type { WalletType } from './WalletTypeSelector';

interface PaymentConfirmationProps {
  paymentData: PaymentRequestData;
  paymentMethod: PaymentMethod;
  transactionId: string;
  walletType?: WalletType;
  walletAddress?: string;
  onReset: () => void;
}

const paymentMethodNames: Record<PaymentMethod, string> = {
  'echeck': 'eCheck (ACH)',
  'card': 'Debit/Credit Card',
  'apple-pay': 'Apple Pay',
  'google-pay': 'Google Pay',
  'venmo': 'Venmo',
  'paypal': 'PayPal',
  'usdc': 'USDC Stablecoin',
  'usdt': 'USDT Stablecoin',
  'pyusd': 'PayPal USD (PYUSD)'
};

const walletTypeNames: Record<WalletType, string> = {
  'none': 'No Wallet',
  'ephemeral': 'Ephemeral Wallet',
  'persistent': 'Persistent Wallet',
  'adaptive': 'Adaptive Wallet'
};

export default function PaymentConfirmation({
  paymentData,
  paymentMethod,
  transactionId,
  walletType = 'none',
  walletAddress,
  onReset
}: PaymentConfirmationProps) {
  const handleDownloadReceipt = () => {
    const walletInfo = walletType !== 'none' ? `
WALLET CREATED
-------------------------------------
Wallet Type: ${walletTypeNames[walletType]}
Wallet Address: ${walletAddress}
Status: Active
` : '';

    const receipt = `
PAYMENT RECEIPT
=====================================

Transaction ID: ${transactionId}
Date: ${new Date().toLocaleString()}

PAYMENT DETAILS
-------------------------------------
Account Number: ${paymentData.accountNumber}
Customer: ${paymentData.firstName} ${paymentData.lastName}
Amount Paid: $${paymentData.amountDue.toFixed(2)}
Payment Method: ${paymentMethodNames[paymentMethod]}
Due Date: ${new Date(paymentData.dueDate).toLocaleDateString()}
${walletInfo}
STATUS: COMPLETED ✓

This is a simulated transaction.
No actual payment was processed.

=====================================
Monay Payment Platform
www.monay.com
    `.trim();

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monay-receipt-${transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Payment Confirmation',
      text: `Payment of $${paymentData.amountDue.toFixed(2)} completed successfully. Transaction ID: ${transactionId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.title}\n${shareData.text}`;
      navigator.clipboard.writeText(text);
      alert('Payment details copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-green-100 text-lg">
          Your payment has been processed successfully
        </p>
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Transaction Details</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Transaction ID */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="text-sm text-slate-600">Transaction ID</span>
            <span className="font-mono text-sm font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded">
              {transactionId}
            </span>
          </div>

          {/* Payment Amount */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="text-sm text-slate-600">Amount Paid</span>
            <span className="text-2xl font-bold text-green-600">
              ${paymentData.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="text-sm text-slate-600">Payment Method</span>
            <span className="font-semibold text-slate-900">
              {paymentMethodNames[paymentMethod]}
            </span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="text-sm text-slate-600">Date & Time</span>
            <span className="font-medium text-slate-900">
              {new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>

          {/* Wallet Details */}
          {walletType !== 'none' && walletAddress && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Wallet className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-blue-900">Monay Wallet Created!</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Wallet Type</span>
                  <span className="font-semibold text-blue-900">{walletTypeNames[walletType]}</span>
                </div>
                <div>
                  <span className="text-sm text-blue-700 block mb-1">Wallet Address</span>
                  <code className="block bg-blue-900 text-green-400 text-xs p-2 rounded font-mono break-all">
                    {walletAddress}
                  </code>
                </div>
                <div className="text-xs text-blue-700 mt-3 space-y-1">
                  {walletType === 'ephemeral' && (
                    <>
                      <p>✓ Valid for 24 hours</p>
                      <p>✓ Check your email for wallet details</p>
                    </>
                  )}
                  {walletType === 'persistent' && (
                    <>
                      <p>✓ Complete KYC verification to activate full features</p>
                      <p>✓ Verification link sent to your email</p>
                    </>
                  )}
                  {walletType === 'adaptive' && (
                    <>
                      <p>✓ Wallet active immediately with basic features</p>
                      <p>✓ Upgrade to verified wallet anytime</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Account Number</span>
                <span className="font-medium text-slate-900">{paymentData.accountNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Name</span>
                <span className="font-medium text-slate-900">
                  {paymentData.firstName} {paymentData.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Original Due Date</span>
                <span className="font-medium text-slate-900">
                  {new Date(paymentData.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDownloadReceipt}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Download Receipt</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> This is a simulated payment transaction. No actual payment was processed.
          In a production environment, this would trigger real payment processing through the selected payment rail.
        </p>
      </div>

      {/* New Payment Button */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-xl border-2 border-slate-300 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Process Another Payment</span>
      </button>

      {/* Payment Method Details */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6">
        <h3 className="font-bold text-slate-900 mb-4">About This Payment Method</h3>
        <div className="space-y-3 text-sm text-slate-700">
          {paymentMethod === 'echeck' && (
            <>
              <p>• ACH (Automated Clearing House) payment processed through the banking network</p>
              <p>• Typically settles in 1-3 business days</p>
              <p>• Low-cost option ideal for recurring payments</p>
            </>
          )}
          {paymentMethod === 'card' && (
            <>
              <p>• Instant payment processing through card networks</p>
              <p>• Funds typically available within 24 hours</p>
              <p>• Supports major credit and debit cards</p>
            </>
          )}
          {paymentMethod === 'apple-pay' && (
            <>
              <p>• Secure payment using Apple's tokenization technology</p>
              <p>• Biometric authentication (Face ID/Touch ID)</p>
              <p>• No card details shared with merchants</p>
            </>
          )}
          {paymentMethod === 'google-pay' && (
            <>
              <p>• Fast and secure payment through Google's platform</p>
              <p>• Protected by Google's security infrastructure</p>
              <p>• Works across devices with your Google account</p>
            </>
          )}
          {paymentMethod === 'venmo' && (
            <>
              <p>• Social payment platform owned by PayPal</p>
              <p>• Instant transfer from Venmo balance or linked accounts</p>
              <p>• Popular for peer-to-peer transactions</p>
            </>
          )}
          {paymentMethod === 'paypal' && (
            <>
              <p>• Global payment platform with buyer protection</p>
              <p>• Can pay from PayPal balance, bank, or card</p>
              <p>• Trusted by millions of merchants worldwide</p>
            </>
          )}
          {(paymentMethod === 'usdc' || paymentMethod === 'usdt' || paymentMethod === 'pyusd') && (
            <>
              <p>• Blockchain-based stablecoin payment (1:1 USD peg)</p>
              <p>• Near-instant settlement (~30 seconds)</p>
              <p>• Ultra-low transaction fees</p>
              <p>• 24/7/365 availability with no banking hours</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
