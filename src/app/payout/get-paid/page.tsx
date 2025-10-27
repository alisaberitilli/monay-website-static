'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';

function PayoutFlowContent() {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState('0');
  const [payoutId, setPayoutId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isConsented, setIsConsented] = useState(false);
  const [step, setStep] = useState<'consent' | 'otp' | 'methods' | 'wallet' | 'success'>('consent');
  const [otp, setOtp] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAmount(searchParams.get('amount') || '0');
    setPayoutId(searchParams.get('payoutId') || '');
    setRecipient(searchParams.get('recipient') || '');
  }, [searchParams]);

  const handleConsent = async () => {
    if (!isConsented || !email || !phone) {
      alert('Please enter your email and phone number and accept the consent');
      return;
    }

    setIsLoading(true);

    try {
      // Send OTP via Nudge API
      const response = await fetch('/api/nudge/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          firstName: recipient.split(' ')[0] || '',
          lastName: recipient.split(' ').slice(1).join(' ') || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store OTP for verification (in production, verify server-side)
        setSentOtp(data.otp);
        setStep('otp');
      } else {
        alert(`Failed to send OTP: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = () => {
    if (otp === sentOtp) {
      setStep('methods');
    } else {
      alert('Incorrect OTP. Please check your email and SMS.');
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/nudge/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          firstName: recipient.split(' ')[0] || '',
          lastName: recipient.split(' ').slice(1).join(' ') || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        setSentOtp(data.otp);
        alert('New OTP sent! Check your email and SMS.');
      } else {
        alert('Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (method === 'monay-wallet') {
      setStep('wallet');
    } else {
      setStep('success');
    }
  };

  const handleTokenSelect = (token: string) => {
    setSelectedToken(token);
    setStep('success');
  };

  const formatAmount = (amt: string) => {
    return parseFloat(amt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      {/* Phone Container */}
      <div className="w-full max-w-[390px] bg-white rounded-[40px] shadow-2xl overflow-hidden relative">
        {/* Status Bar */}
        <div className="bg-black text-white px-5 py-3 flex items-center justify-between text-sm font-semibold relative">
          <span className="flex-1">9:12</span>

          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[30px] bg-black rounded-b-[20px]"></div>

          <div className="flex items-center gap-1">
            <span>⚫</span>
            <span>📶</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Browser Bar */}
        <div className="bg-[#f7f7f7] px-4 py-2.5 flex items-center gap-2.5 border-b border-slate-200">
          <ChevronLeft className="w-5 h-5 text-blue-500" />
          <span className="text-blue-500 text-sm">Outlook</span>
          <div className="flex-1 bg-white px-3 py-2 rounded-lg text-xs text-slate-600 truncate">
            monay.com/payouts — Private
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 min-h-[600px]">
          {/* Consent Step */}
          {step === 'consent' && (
            <>
              {/* Logo */}
              <div className="text-center mb-10">
                <h1 className="text-3xl font-light text-slate-800 mb-8 tracking-tight">Monay</h1>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-8">
                  <span className="text-4xl">💵</span>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl font-semibold text-slate-900 text-center mb-8 tracking-tight">
                Your payout is ready!
              </h2>

              {/* Contact Information Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="(555) 123-4567"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Consent Box */}
              <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div
                    onClick={() => setIsConsented(!isConsented)}
                    className={`w-6 h-6 flex-shrink-0 rounded border-2 flex items-center justify-center cursor-pointer transition-colors mt-0.5 ${
                      isConsented ? 'bg-slate-900 border-slate-900' : 'bg-transparent border-slate-400'
                    }`}
                  >
                    {isConsented && <span className="text-white text-base font-bold">✓</span>}
                  </div>
                  <p className="text-[15px] text-slate-700 leading-relaxed">
                    By checking this box, you're expressly consenting to receive a one-time passcode by text and email (using automated means) from or on behalf of Monay for identity verification and the digital payouts demo service. You also agree to receive follow-up communications about Monay's products and services. You consent and agree to our{' '}
                    <a href="https://www.monay.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Privacy Policy</a> and{' '}
                    <a href="https://www.monay.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Terms of Use</a>. Standard text messaging and data rates may apply. You can unsubscribe at any time.
                  </p>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Privacy Notice:</strong> The contact information you provide will be used by Monay to verify your identity for this demo and to send you information about our payment solutions, product updates, and related services. We will not sell or share your information with third parties for marketing purposes without your explicit consent. See our{' '}
                  <a href="https://www.monay.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a> for details.
                </p>
              </div>

              {/* Amount Display */}
              <div className="text-center mb-8">
                <p className="text-sm text-slate-500 mb-1">Payout Amount</p>
                <p className="text-2xl font-bold text-green-600">${formatAmount(amount)}</p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleConsent}
                disabled={!isConsented || !email || !phone || isLoading}
                className={`w-full py-4 rounded-full text-base font-semibold transition-all mb-6 ${
                  isConsented && email && phone && !isLoading
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </button>

              {/* Cancel Text */}
              <p className="text-center text-sm text-slate-600 leading-relaxed">
                If you choose not to continue, you may cancel<br />
                this payment <a href="#" className="text-blue-500 hover:underline">here</a>.
              </p>
            </>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-light text-slate-800 mb-8 tracking-tight">Monay</h1>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-8">
                  <span className="text-4xl">📱</span>
                </div>
              </div>

              <h2 className="text-3xl font-semibold text-slate-900 text-center mb-4 tracking-tight">
                Verify your identity
              </h2>

              <p className="text-center text-slate-600 mb-8">
                Enter the 6-digit code sent to your phone
              </p>

              {/* OTP Input */}
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedText = e.clipboardData.getData('text');
                  const digits = pastedText.replace(/\D/g, '').slice(0, 6);
                  setOtp(digits);
                }}
                placeholder="000000"
                className="w-full text-center text-3xl font-mono font-semibold tracking-[0.5em] bg-slate-50 border-2 border-slate-300 rounded-xl py-4 mb-6 focus:outline-none focus:border-blue-500"
              />

              <button
                onClick={handleOtpVerify}
                className="w-full bg-slate-900 text-white py-4 rounded-full text-base font-semibold hover:bg-slate-800 transition-colors mb-4"
              >
                Verify Code
              </button>

              <p className="text-center text-sm text-slate-600">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-blue-500 hover:underline font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              </p>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-xs text-slate-700">
                <strong className="text-green-800">✓ OTP Sent!</strong> Check your email ({email}) and phone ({phone}) for the verification code.
              </div>
            </>
          )}

          {/* Payment Methods Step */}
          {step === 'methods' && (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-light text-slate-800 mb-8 tracking-tight">Monay</h1>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-8">
                  <span className="text-4xl">💳</span>
                </div>
              </div>

              <h2 className="text-3xl font-semibold text-slate-900 text-center mb-4 tracking-tight">
                Choose payout method
              </h2>

              <p className="text-center text-slate-600 mb-8">
                Select how you'd like to receive your ${formatAmount(amount)}
              </p>

              {/* Payment Methods */}
              <div className="space-y-3 mb-8">
                {[
                  { id: 'monay-wallet', name: 'Monay Wallet', icon: '💰', fee: 'Free', time: 'Instant', badge: 'RECOMMENDED' },
                  { id: 'instant', name: 'Instant Bank Transfer', icon: '⚡', fee: 'Free', time: 'Instant' },
                  { id: 'debit', name: 'Debit Card', icon: '💳', fee: '$1.50', time: '30 minutes' },
                  { id: 'wallet', name: 'Digital Wallet (Apple/Google Pay)', icon: '📱', fee: 'Free', time: '5 minutes' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`w-full hover:bg-slate-100 border-2 hover:border-blue-500 rounded-xl p-4 transition-all text-left relative ${
                      method.badge ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {method.badge && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {method.badge}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{method.name}</p>
                          <p className="text-sm text-slate-500">
                            {method.fee} • Arrives in {method.time}
                          </p>
                        </div>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-center text-slate-500">
                All payout methods are secure and encrypted
              </p>
            </>
          )}

          {/* Monay Wallet Token Selection Step */}
          {step === 'wallet' && (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-light text-slate-800 mb-8 tracking-tight">Monay</h1>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-8">
                  <span className="text-4xl">💰</span>
                </div>
              </div>

              <h2 className="text-3xl font-semibold text-slate-900 text-center mb-4 tracking-tight">
                Select token
              </h2>

              <p className="text-center text-slate-600 mb-8">
                Choose which stablecoin to receive in your Monay Wallet
              </p>

              {/* Wallet Balance Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-6 text-white">
                <p className="text-sm text-slate-400 mb-1">Total Wallet Balance</p>
                <p className="text-3xl font-bold mb-4">$12,847.50</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-400">USDC</p>
                    <p className="text-sm font-semibold">$5,200</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">FIUSD</p>
                    <p className="text-sm font-semibold">$4,500</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">PYUSD</p>
                    <p className="text-sm font-semibold">$3,147.50</p>
                  </div>
                </div>
              </div>

              {/* Token Selection */}
              <div className="space-y-3 mb-8">
                {[
                  {
                    id: 'usdc',
                    name: 'USDC',
                    fullName: 'USD Coin',
                    icon: '🔵',
                    balance: '$5,200.00',
                    network: 'Ethereum',
                    fee: '$0.01'
                  },
                  {
                    id: 'fiusd',
                    name: 'FIUSD',
                    fullName: 'Fiserv USD',
                    icon: '🟢',
                    balance: '$4,500.00',
                    network: 'Stellar',
                    fee: '$0.01'
                  },
                  {
                    id: 'pyusd',
                    name: 'PYUSD',
                    fullName: 'PayPal USD',
                    icon: '🔷',
                    balance: '$3,147.50',
                    network: 'Ethereum',
                    fee: '$0.01'
                  },
                  {
                    id: 'usdt',
                    name: 'USDT',
                    fullName: 'Tether USD',
                    icon: '🟢',
                    balance: '$0.00',
                    network: 'Tron',
                    fee: '$0.01'
                  },
                  {
                    id: 'eurc',
                    name: 'EURC',
                    fullName: 'Euro Coin',
                    icon: '🟣',
                    balance: '$0.00',
                    network: 'Ethereum',
                    fee: '$0.01'
                  },
                ].map((token) => (
                  <button
                    key={token.id}
                    onClick={() => handleTokenSelect(token.id)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-blue-500 rounded-xl p-4 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{token.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{token.name}</p>
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                              {token.network}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{token.fullName}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Balance: {token.balance} • Fee: {token.fee}
                          </p>
                        </div>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-xs text-slate-700 leading-relaxed">
                  💡 <strong>New to stablecoins?</strong> These are digital dollars pegged 1:1 to USD. They settle instantly with minimal fees and can be easily converted to cash.
                </p>
              </div>

              <p className="text-xs text-center text-slate-500">
                All tokens are secured in your non-custodial Monay Wallet
              </p>
            </>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
              </div>

              <h2 className="text-3xl font-semibold text-slate-900 text-center mb-4 tracking-tight">
                Payout confirmed!
              </h2>

              <p className="text-center text-slate-600 mb-8">
                Your ${formatAmount(amount)} is on the way
              </p>

              <div className="bg-slate-50 rounded-xl p-6 mb-8 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Payout ID</span>
                  <span className="font-mono font-semibold text-slate-900">{payoutId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Recipient</span>
                  <span className="font-semibold text-slate-900">{recipient}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Method</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {selectedMethod.replace('-', ' ')}
                    {selectedToken && ` (${selectedToken.toUpperCase()})`}
                  </span>
                </div>
                {selectedToken && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Token</span>
                    <span className="font-semibold text-slate-900 uppercase">{selectedToken}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status</span>
                  <span className="font-semibold text-green-600">Processing</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                <p className="text-sm text-green-800 text-center">
                  ✓ You'll receive a confirmation when funds arrive
                </p>
              </div>

              <button
                onClick={() => window.close()}
                className="w-full bg-slate-900 text-white py-4 rounded-full text-base font-semibold hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </>
          )}

          {/* Bottom Bar */}
          <div className="mt-8">
            <div className="h-1 w-32 bg-black rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GetPaidPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payout...</p>
        </div>
      </div>
    }>
      <PayoutFlowContent />
    </Suspense>
  );
}
