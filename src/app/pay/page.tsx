'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { CreditCard, Wallet, Building2, Smartphone, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface PaymentDetails {
  accountNumber: string;
  firstName: string;
  lastName: string;
  amountDue: string;
  dueDate: string;
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract payment details from URL parameters
    const details: PaymentDetails = {
      accountNumber: searchParams.get('accountNumber') || '',
      firstName: searchParams.get('firstName') || '',
      lastName: searchParams.get('lastName') || '',
      amountDue: searchParams.get('amountDue') || '0',
      dueDate: searchParams.get('dueDate') || '',
    };
    setPaymentDetails(details);
  }, [searchParams]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Integrate with actual payment processor (Stripe, etc.)
      setPaymentSuccess(true);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment request...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600 mb-6">
            Your payment of <span className="font-semibold text-slate-900">${parseFloat(paymentDetails.amountDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> has been processed successfully.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 mb-1">Account Number</p>
            <p className="font-mono font-semibold text-slate-900">{paymentDetails.accountNumber}</p>
            <p className="text-sm text-slate-600 mt-3 mb-1">Confirmation</p>
            <p className="font-mono font-semibold text-slate-900">TXN-{Date.now().toString(36).toUpperCase()}</p>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            A confirmation email has been sent to your registered email address.
          </p>
          <button
            onClick={() => window.location.href = 'https://www.monay.com'}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, badge: '💳' },
    { id: 'ach', name: 'Bank Transfer (ACH)', icon: Building2, badge: '🏦' },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet, badge: '💎' },
    { id: 'mobile', name: 'Mobile Payment', icon: Smartphone, badge: '📱' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="https://www.monay.com" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Monay</span>
            </a>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MONAY
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
                <p className="text-blue-100">Secure payment powered by Monay</p>
              </div>

              {/* Form Body */}
              <form onSubmit={handlePayment} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`
                          relative p-4 border-2 rounded-xl transition-all
                          ${selectedMethod === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{method.badge}</span>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-slate-900 text-sm">{method.name}</p>
                          </div>
                          {selectedMethod === method.id && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Payment Form */}
                {selectedMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        defaultValue={`${paymentDetails.firstName} ${paymentDetails.lastName}`}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* ACH Payment Form */}
                {selectedMethod === 'ach' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        placeholder="000123456789"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        placeholder="110000000"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Digital Wallet */}
                {selectedMethod === 'wallet' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-600 transition-colors"
                      >
                        <span className="text-2xl mb-2 block"> Apple Pay</span>
                        <p className="text-sm font-medium text-slate-700">Apple Pay</p>
                      </button>
                      <button
                        type="button"
                        className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-600 transition-colors"
                      >
                        <span className="text-2xl mb-2 block">🔵 Google Pay</span>
                        <p className="text-sm font-medium text-slate-700">Google Pay</p>
                      </button>
                    </div>
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-600">Or connect your crypto wallet</p>
                      <button
                        type="button"
                        className="mt-3 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        💎 Connect Wallet (USDC, USDT)
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Payment */}
                {selectedMethod === 'mobile' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-600 transition-colors"
                      >
                        <span className="text-2xl mb-2 block">💵 PayPal</span>
                        <p className="text-sm font-medium text-slate-700">PayPal</p>
                      </button>
                      <button
                        type="button"
                        className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-600 transition-colors"
                      >
                        <span className="text-2xl mb-2 block">💙 Venmo</span>
                        <p className="text-sm font-medium text-slate-700">Venmo</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Pay $${parseFloat(paymentDetails.amountDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  )}
                </button>

                {/* Security Note */}
                <p className="text-xs text-center text-slate-500">
                  🔒 Your payment information is encrypted and secure. We never store your card details.
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Account</span>
                  <span className="font-mono font-semibold text-slate-900">{paymentDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Name</span>
                  <span className="font-semibold text-slate-900">{paymentDetails.firstName} {paymentDetails.lastName}</span>
                </div>
                {paymentDetails.dueDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Due Date</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(paymentDetails.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${parseFloat(paymentDetails.amountDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">💼 Create a Monay Wallet</h3>
                <p className="text-xs text-slate-600 mb-3">
                  Save payment methods, track transactions, and enjoy faster checkouts.
                </p>
                <button
                  type="button"
                  className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Learn More →
                </button>
              </div>

              <div className="text-xs text-slate-500 space-y-2">
                <p>✓ PCI-DSS Level 1 Certified</p>
                <p>✓ 256-bit SSL Encryption</p>
                <p>✓ SOC 2 Type II Compliant</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-slate-600">
            <p className="mb-2">Powered by <span className="font-semibold text-blue-600">Monay</span> - Enterprise Stablecoin Platform</p>
            <div className="flex items-center justify-center space-x-4">
              <a href="https://www.monay.com/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <span className="text-slate-300">•</span>
              <a href="https://www.monay.com/terms" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              <span className="text-slate-300">•</span>
              <a href="mailto:support@monay.com" className="hover:text-slate-900 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment request...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
