'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import PaymentConfirmation from '@/components/PaymentConfirmation';
import WalletCreationUpsell, { WalletType } from '@/components/WalletCreationUpsell';
import { AlertCircle, FileJson } from 'lucide-react';

export interface PaymentRequestData {
  accountNumber: string;
  firstName: string;
  lastName: string;
  amountDue: number;
  dueDate: string;
  email?: string;
  enterpriseKYC?: {
    verified: boolean;
    verificationLevel: 'tier1' | 'tier2';
    employeeId?: string;
    organizationId?: string;
    organizationName?: string;
  };
}

export type PaymentMethod =
  | 'echeck'
  | 'card'
  | 'apple-pay'
  | 'google-pay'
  | 'venmo'
  | 'paypal'
  | 'usdc'
  | 'usdt'
  | 'pyusd';

// Inner component that uses searchParams
function PaymentRequestContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentRequestData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>('none');
  const [createWallet, setCreateWallet] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [needsFunding, setNeedsFunding] = useState(false);
  const [fundingComplete, setFundingComplete] = useState(false);
  const [kycConsent, setKycConsent] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get data from URL parameters
    const accountNumber = searchParams.get('accountNumber');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const amountDue = searchParams.get('amountDue');
    const dueDate = searchParams.get('dueDate');
    const email = searchParams.get('email');
    const organizationName = searchParams.get('organizationName');

    // Try to get data from localStorage (for POST requests)
    const storedData = typeof window !== 'undefined' ? localStorage.getItem('paymentRequest') : null;

    if (accountNumber && firstName && lastName && amountDue && dueDate) {
      // URL parameters provided
      setPaymentData({
        accountNumber,
        firstName,
        lastName,
        amountDue: parseFloat(amountDue),
        dueDate,
        email: email || 'ali@monay.com',
        enterpriseKYC: organizationName ? {
          verified: true,
          verificationLevel: 'tier2',
          organizationName: organizationName
        } : {
          verified: true,
          verificationLevel: 'tier2',
          organizationName: 'Acme Corporation'
        }
      });
      setLoading(false);
    } else if (storedData) {
      // POST data from localStorage
      try {
        const data = JSON.parse(storedData);
        setPaymentData(data);
        localStorage.removeItem('paymentRequest'); // Clean up
        setLoading(false);
      } catch (err) {
        setError('Invalid payment request data');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handlePaymentSubmit = async () => {
    const txId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setTransactionId(txId);

    // Simulate wallet creation if selected
    if (createWallet && selectedWallet !== 'none') {
      const walletAddr = `0x${Math.random().toString(16).substr(2, 40).toUpperCase()}`;
      setWalletAddress(walletAddr);
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setPaymentComplete(true);
  };

  const handleSelectWallet = (type: WalletType) => {
    setSelectedWallet(type);
    // Check if wallet needs funding when selected
    if (type !== 'none' && paymentData) {
      setNeedsFunding(walletBalance < paymentData.amountDue);
    } else {
      setNeedsFunding(false);
    }
  };

  const handleWalletCreated = (email: string, walletAddr: string) => {
    console.log('Wallet created for:', email);
    setWalletAddress(walletAddr);
    // Check if funding is needed
    if (paymentData) {
      setNeedsFunding(walletBalance < paymentData.amountDue);
    }
  };

  const handleFundingComplete = (fundedAmount: number, method: string) => {
    console.log(`Funded ${fundedAmount} via ${method}`);
    setWalletBalance(prev => prev + fundedAmount);
    setFundingComplete(true);
    setNeedsFunding(false);
  };

  const handleCreateWallet = (walletType: WalletType) => {
    setSelectedWallet(walletType);
    setCreateWallet(true);
    handlePaymentSubmit();
  };

  const handlePayDirect = () => {
    setCreateWallet(false);
    setSelectedWallet('none');
    handlePaymentSubmit();
  };

  const handleReset = () => {
    setPaymentData(null);
    setSelectedMethod(null);
    setSelectedWallet('none');
    setCreateWallet(false);
    setPaymentComplete(false);
    setTransactionId('');
    setWalletAddress('');
    setWalletBalance(0);
    setNeedsFunding(false);
    setFundingComplete(false);
    setKycConsent(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Monay Payment Request</h1>
                <p className="text-sm text-slate-600">Multi-Rail Payment Processing</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!paymentData && !error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="text-center mb-6">
                <FileJson className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No Payment Request Found</h2>
                <p className="text-slate-600">
                  This page requires payment request data to be provided via URL parameters or POST request.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 mb-3">Usage Examples:</h3>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">1. Via URL Parameters:</p>
                  <code className="block bg-slate-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto">
                    /pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31
                  </code>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">2. Via POST Request:</p>
                  <code className="block bg-slate-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre">
{`fetch('/pay/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountNumber: "ACC-123456",
    firstName: "John",
    lastName: "Doe",
    amountDue: 1250,
    dueDate: "2025-12-31"
  })
}).then(res => res.json())
  .then(data => window.location.href = data.redirectUrl);`}
                  </code>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">3. Via HTML Form:</p>
                  <code className="block bg-slate-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre">
{`<form action="/pay/api" method="POST">
  <input type="hidden" name="accountNumber" value="ACC-123456" />
  <input type="hidden" name="firstName" value="John" />
  <input type="hidden" name="lastName" value="Doe" />
  <input type="hidden" name="amountDue" value="1250" />
  <input type="hidden" name="dueDate" value="2025-12-31" />
  <button type="submit">Pay Now</button>
</form>`}
                  </code>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Try Sample Payment Request
                </a>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">Error</h3>
              </div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {paymentData && !paymentComplete && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Payment Request Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Request Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Account Number</p>
                  <p className="text-lg font-semibold text-slate-900">{paymentData.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer Name</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {paymentData.firstName} {paymentData.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Amount Due</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${paymentData.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Due Date</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(paymentData.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1: Payment Method Selection */}
            {!selectedMethod && (
              <PaymentMethodSelector
                onSelectMethod={handlePaymentMethodSelect}
                selectedMethod={selectedMethod}
                amount={paymentData.amountDue}
                onSubmit={async () => {}} // Not used in this flow
                walletType="none" // Always show all methods initially
              />
            )}

            {/* Step 2: Wallet Creation Upsell */}
            {selectedMethod && (
              <WalletCreationUpsell
                selectedPaymentMethod={selectedMethod}
                amount={paymentData.amountDue}
                customerEmail={paymentData.email || 'ali@monay.com'}
                organizationName={paymentData.enterpriseKYC?.organizationName || 'Acme Corporation'}
                onCreateWallet={handleCreateWallet}
                onPayDirect={handlePayDirect}
              />
            )}
          </div>
        )}

        {paymentComplete && paymentData && selectedMethod && (
          <div className="max-w-3xl mx-auto">
            <PaymentConfirmation
              paymentData={paymentData}
              paymentMethod={selectedMethod}
              transactionId={transactionId}
              walletType={selectedWallet}
              walletAddress={walletAddress}
              onReset={handleReset}
            />

            {/* Additional Wallet Creation Confirmation */}
            {createWallet && walletAddress && (
              <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl shadow-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">🎉 Monay Wallet Created!</h3>
                  <p className="text-green-800">
                    Your {selectedWallet === 'ephemeral' ? 'Ephemeral' : selectedWallet === 'persistent' ? 'Persistent' : 'Adaptive'} wallet has been created and funded.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Wallet Address:</p>
                      <code className="block bg-slate-900 text-green-400 text-xs p-2 rounded font-mono break-all">
                        {walletAddress}
                      </code>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Initial Balance:</p>
                      <p className="text-lg font-bold text-green-600">$0.25 Loyalty Credit</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Wallet Credentials Sent To:</p>
                      <p className="text-sm font-mono bg-blue-50 text-blue-900 px-3 py-1.5 rounded">
                        {paymentData.email || 'ali@monay.com'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 text-sm mb-2">📧 Check Your Email</h4>
                  <ul className="space-y-1 text-xs text-blue-800">
                    <li>✓ Wallet download links (iOS & Android)</li>
                    <li>✓ Login credentials</li>
                    <li>✓ Getting started guide</li>
                    <li>✓ Security tips</li>
                  </ul>
                </div>

                <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 text-sm mb-2">🎁 Your Benefits</h4>
                  <ul className="space-y-1 text-xs text-green-800">
                    <li>✓ $0.25 loyalty credit already in your wallet</li>
                    <li>✓ Future payments: instant settlement (~30 seconds)</li>
                    <li>✓ Ultra-low fees on stablecoin transactions</li>
                    <li>✓ Verified by {paymentData.enterpriseKYC?.organizationName || 'Acme Corporation'} - no additional KYC needed</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-slate-600">
            © 2025 Monay. Payment Simulation Demo - Not a real payment processor.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Main export with Suspense wrapper
export default function PaymentRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment request...</p>
        </div>
      </div>
    }>
      <PaymentRequestContent />
    </Suspense>
  );
}
