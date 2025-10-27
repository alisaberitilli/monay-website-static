'use client';

import { useState } from 'react';
import { Trash2, Archive, Flag, Mail, RefreshCw, Search, MoreHorizontal, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function InboxDemoPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>('payout-ready');
  const [showEmailList, setShowEmailList] = useState(true);

  const emails = [
    {
      id: 'payment-confirmation',
      from: 'Monay Payments',
      email: 'payments@monay.com',
      subject: 'Payment Confirmed - Complete Your KYC',
      preview: 'Your payment of $1,250.00 was successful. Complete KYC to unlock full features.',
      time: 'Just now',
      unread: true,
      flagged: false,
    },
    {
      id: 'payout-ready',
      from: 'Monay Payouts',
      email: 'payouts@monay.com',
      subject: 'Your Payout is Ready!',
      preview: 'Your earnings are ready to be disbursed. Choose how you want to get paid.',
      time: 'Today at 9:15 AM',
      unread: true,
      flagged: false,
    },
    {
      id: 'payment-request',
      from: 'Monay via Nudge',
      email: 'notifications@nudge.net',
      subject: 'Payment Request',
      preview: 'Your Invoice is available for payment. You have several way to pay.',
      time: 'Monday, October 6, 2025 at 11:54 PM',
      unread: true,
      flagged: false,
    },
    {
      id: 'welcome',
      from: 'Monay',
      email: 'welcome@monay.com',
      subject: 'Welcome to Monay',
      preview: 'Thank you for joining Monay. Get started with your account...',
      time: '2 days ago',
      unread: false,
      flagged: false,
    },
    {
      id: 'invoice-2',
      from: 'Billing Team',
      email: 'billing@acmecorp.com',
      subject: 'Invoice #INV-2025-002',
      preview: 'Your monthly invoice is ready for review.',
      time: '3 days ago',
      unread: false,
      flagged: true,
    },
  ];

  const currentEmail = emails.find(e => e.id === selectedEmail);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
      {/* Mac Window Controls */}
      <div className="flex items-center justify-between bg-[#2d2d2d] px-4 py-2 border-b border-[#3d3d3d]">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
          </div>
          <span className="ml-4 text-sm text-gray-300">Payment Request - Inbox • ali@monay.com</span>
        </div>
        <div className="text-xs text-gray-400">Demo Mode</div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#2d2d2d] px-2 lg:px-4 py-2 border-b border-[#3d3d3d]">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button className="flex items-center space-x-1 lg:space-x-2 text-gray-300 hover:text-white transition-colors">
            <Trash2 className="w-4 h-4" />
            <span className="text-sm hidden lg:inline">Delete</span>
          </button>
          <button className="flex items-center space-x-1 lg:space-x-2 text-gray-300 hover:text-white transition-colors">
            <Archive className="w-4 h-4" />
            <span className="text-sm hidden lg:inline">Archive</span>
          </button>
          <button className="flex items-center space-x-1 lg:space-x-2 text-gray-300 hover:text-white transition-colors">
            <Flag className="w-4 h-4" />
            <span className="text-sm hidden lg:inline">Flag</span>
          </button>
          <button className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Mail className="w-4 h-4" />
            <span className="text-sm hidden lg:inline">Mark Unread</span>
          </button>
          <button className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm hidden lg:inline">Sync</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-blue-400 hidden md:inline">🔵 Copilot</span>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex w-64 bg-[#252525] border-r border-[#3d3d3d] flex-col">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-[#3d3d3d] text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-2">
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Mailboxes
                </div>
                <div className="space-y-1">
                  <div className="px-3 py-2 bg-[#3d3d3d] rounded-lg text-sm font-medium text-white">
                    📥 Inbox <span className="float-right text-gray-400">5</span>
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-[#3d3d3d] rounded-lg cursor-pointer">
                    📤 Sent
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-[#3d3d3d] rounded-lg cursor-pointer">
                    📝 Drafts
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-[#3d3d3d] rounded-lg cursor-pointer">
                    🗑️ Trash
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email List - Show on mobile only when no email selected */}
        <div className={`w-full lg:w-80 bg-[#2d2d2d] border-r border-[#3d3d3d] flex flex-col ${selectedEmail ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#3d3d3d]">
            <h2 className="text-lg font-semibold">Inbox</h2>
            <p className="text-sm text-gray-400">5 messages</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email.id)}
                className={`
                  p-4 border-b border-[#3d3d3d] cursor-pointer transition-colors
                  ${selectedEmail === email.id ? 'bg-[#3d3d3d]' : 'hover:bg-[#353535]'}
                  ${email.unread ? 'font-semibold' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                      {email.from.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm">{email.from}</div>
                      <div className="text-xs text-gray-400">{email.email}</div>
                    </div>
                  </div>
                  {email.flagged && <Flag className="w-4 h-4 text-orange-400 fill-orange-400" />}
                </div>
                <div className="ml-10">
                  <div className="text-sm mb-1">{email.subject}</div>
                  <div className="text-xs text-gray-400 line-clamp-1">{email.preview}</div>
                  <div className="text-xs text-gray-500 mt-1">{email.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Content - Show on mobile when email selected */}
        <div className={`flex-1 bg-[#1e1e1e] flex flex-col overflow-hidden ${selectedEmail ? 'flex' : 'hidden lg:flex'}`}>
          {currentEmail && currentEmail.id === 'payment-confirmation' ? (
            <>
              {/* Email Header */}
              <div className="p-4 lg:p-6 border-b border-[#3d3d3d]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {/* Back button - visible on mobile */}
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="lg:hidden text-gray-400 hover:text-white mr-2"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg lg:text-xl font-semibold">Payment Confirmed - Complete Your KYC</h1>
                  </div>
                  <div className="hidden lg:flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-white">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-sm font-bold">
                    MP
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      Monay Payments <span className="text-gray-400">&lt;payments@monay.com&gt;</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      To: <span className="text-blue-400">John Doe</span>
                    </div>
                  </div>
                  <div className="ml-auto text-xs text-gray-400">
                    {currentEmail.time}
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-4">
                    Payment Successful!
                  </h2>

                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Your payment has been processed successfully. Complete your KYC verification to unlock the full Monay experience.
                  </p>

                  {/* Payment Details Card */}
                  <div className="max-w-md mx-auto bg-[#2d2d2d] rounded-lg p-6 space-y-4 mb-8">
                    <div className="flex justify-between items-center pb-4 border-b border-[#3d3d3d]">
                      <span className="text-sm text-gray-400">Payment Amount</span>
                      <span className="text-2xl font-bold text-green-400">$1,250.00</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Transaction ID</span>
                      <span className="text-sm font-mono font-medium">TXN-PAY2025</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Account Number</span>
                      <span className="text-sm font-medium">ACC-123456</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Payment Method</span>
                      <span className="text-sm font-medium">Credit Card •••• 4242</span>
                    </div>
                  </div>

                  {/* KYC CTA Section */}
                  <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-700/50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mx-auto mb-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Complete Your KYC</h3>
                    <p className="text-sm text-blue-200 mb-4">
                      Verify your identity to unlock premium features:
                    </p>
                    <ul className="text-left text-sm text-blue-100 space-y-2 mb-6">
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        Higher transaction limits ($50,000+)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        Instant bank withdrawals
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        Virtual & physical debit cards
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        Premium account features
                      </li>
                    </ul>

                    <a
                      href="https://enterprise.monay.com/auth/login"
                      target="_blank"
                      className="inline-block w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-lg"
                    >
                      Complete KYC Now
                    </a>

                    <p className="text-xs text-blue-300 mt-4">
                      Takes only 2-3 minutes • Powered by Persona
                    </p>
                  </div>

                  {/* Next Steps */}
                  <div className="max-w-md mx-auto text-left mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3">What happens next?</h4>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold mr-3">1</span>
                        <div>
                          <div className="font-medium text-white">Verify Your Identity</div>
                          <div className="text-xs text-gray-400">Upload a government ID and take a selfie</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold mr-3">2</span>
                        <div>
                          <div className="font-medium text-white">Instant Approval</div>
                          <div className="text-xs text-gray-400">Most verifications complete in under 1 minute</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold mr-3">3</span>
                        <div>
                          <div className="font-medium text-white">Unlock Full Access</div>
                          <div className="text-xs text-gray-400">Start using all Monay features immediately</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Legal Text */}
                <div className="mt-8 p-4 bg-[#252525] rounded-lg text-xs text-gray-400 leading-relaxed">
                  This payment confirmation is from Monay's secure payment platform. Your transaction has been processed successfully. KYC verification is required to comply with federal regulations and unlock full platform features. For support, contact us at support@monay.com or call 1-888-MONAY-PAY.
                </div>
              </div>
            </>
          ) : currentEmail && currentEmail.id === 'payout-ready' ? (
            <>
              {/* Email Header */}
              <div className="p-4 lg:p-6 border-b border-[#3d3d3d]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="lg:hidden text-gray-400 hover:text-white mr-2"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg lg:text-xl font-semibold">Your Payout is Ready!</h1>
                  </div>
                  <div className="hidden lg:flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-white">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-sm font-bold">
                    MP
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      Monay Payouts <span className="text-gray-400">&lt;payouts@monay.com&gt;</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      To: <span className="text-blue-400">Ali Saberi</span>
                    </div>
                  </div>
                  <div className="ml-auto text-xs text-gray-400">
                    {currentEmail.time}
                  </div>
                </div>

                {/* Privacy Warning */}
                <div className="mt-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-xs text-yellow-200">
                    ⚠️ To protect your privacy, some external images in this message were not downloaded.
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-xs text-blue-400 hover:text-blue-300">Download external images</button>
                    <button className="text-xs text-blue-400 hover:text-blue-300">Go to Settings</button>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Main Message */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6">
                    <span className="text-4xl">💵</span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-4">
                    Good news! Your payout is ready
                  </h2>

                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Your earnings are ready to be disbursed. Please confirm how you would like to receive your payment.
                  </p>

                  {/* Payout Details Card */}
                  <div className="max-w-md mx-auto bg-[#2d2d2d] rounded-lg p-6 space-y-4 mb-8">
                    <div className="flex justify-between items-center pb-4 border-b border-[#3d3d3d]">
                      <span className="text-sm text-gray-400">Payout Amount</span>
                      <span className="text-2xl font-bold text-green-400">$2,450.00</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Payout ID</span>
                      <span className="text-sm font-mono font-medium">PAY-2025-10-001</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Pay Period</span>
                      <span className="text-sm font-medium">Sep 1 - Sep 30, 2025</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Recipient</span>
                      <span className="text-sm font-medium">Ali Saberi</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a
                    href="/payout/get-paid?amount=2450&payoutId=PAY-2025-10-001&recipient=Ali+Saberi"
                    target="_blank"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-lg mb-4"
                  >
                    Get Paid Now
                  </a>

                  <p className="text-xs text-gray-400">
                    Click the button above to choose your payout method
                  </p>
                </div>

                {/* Info Section */}
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-200 mb-2">💡 Multiple Payout Options</h3>
                  <p className="text-xs text-blue-200">
                    Choose from instant bank transfer, debit card, digital wallet, or stablecoin (USDC) payout. Most methods deliver funds within minutes.
                  </p>
                </div>

                {/* Footer Legal Text */}
                <div className="mt-8 p-4 bg-[#252525] rounded-lg text-xs text-gray-400 leading-relaxed">
                  This payout notification is from Monay's digital disbursement platform. Your funds are securely held and will be released once you confirm your preferred payout method. If you did not expect this payout, please contact our support team immediately at support@monay.com or call 1-888-MONAY. This email and any attached files are confidential. Standard data rates may apply.
                </div>
              </div>
            </>
          ) : currentEmail && currentEmail.id === 'payment-request' ? (
            <>
              {/* Email Header */}
              <div className="p-4 lg:p-6 border-b border-[#3d3d3d]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="lg:hidden text-gray-400 hover:text-white mr-2"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg lg:text-xl font-semibold">Payment Request</h1>
                  </div>
                  <div className="hidden lg:flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-white">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                    MV
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      Monay via Nudge <span className="text-gray-400">&lt;notifications@nudge.net&gt;</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      To: <span className="text-blue-400">Ali Saberi</span>
                    </div>
                  </div>
                  <div className="ml-auto text-xs text-gray-400">
                    {currentEmail.time}
                  </div>
                </div>

                {/* Privacy Warning */}
                <div className="mt-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-xs text-yellow-200">
                    ⚠️ To protect your privacy, some external images in this message were not downloaded.
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-xs text-blue-400 hover:text-blue-300">Download external images</button>
                    <button className="text-xs text-blue-400 hover:text-blue-300">Go to Settings</button>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* External Warning */}
                <div className="mb-6 p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-xs text-red-200">
                  [External: This email originated from outside of UTILLI. Please only click on links or attachments if you know the sender.]
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center space-x-4 mb-6">
                  <a
                    href="/sample-invoice.html"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    View Bill
                  </a>
                  <span className="text-gray-600">|</span>
                  <a
                    href="/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Pay Bill
                  </a>
                </div>

                {/* Email Content */}
                <div className="text-center mb-8">
                  <p className="text-gray-300 mb-6">
                    Your Invoice is available for payment. You have several way to pay.
                  </p>

                  {/* Payment Details Card */}
                  <div className="max-w-md mx-auto bg-[#2d2d2d] rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-left space-y-1">
                        <div className="text-xs text-gray-400">Customer Name</div>
                        <div className="text-sm font-medium">John Doe</div>
                        <div className="h-px bg-[#3d3d3d] mt-2"></div>
                      </div>

                      <div className="flex items-center justify-center">
                        <a
                          href="/sample-invoice.html"
                          target="_blank"
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                        >
                          View Bill
                        </a>
                      </div>

                      <div className="text-left space-y-1">
                        <div className="text-xs text-gray-400">Account Number</div>
                        <div className="text-sm font-medium">ACC-123456</div>
                        <div className="h-px bg-[#3d3d3d] mt-2"></div>
                      </div>

                      <div className="flex items-center justify-center">
                        <a
                          href="/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31"
                          target="_blank"
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                        >
                          Pay Bill
                        </a>
                      </div>

                      <div className="text-left space-y-1 col-span-2">
                        <div className="text-xs text-gray-400">Amount Due</div>
                        <div className="text-2xl font-bold text-blue-400">$1,250.00</div>
                        <div className="h-px bg-[#3d3d3d] mt-2"></div>
                      </div>

                      <div className="text-left space-y-1 col-span-2">
                        <div className="text-xs text-gray-400">Due Date</div>
                        <div className="text-sm font-medium">December 30, 2025</div>
                        <div className="h-px bg-[#3d3d3d] mt-2"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Legal Text */}
                <div className="mt-8 p-4 bg-[#252525] rounded-lg text-xs text-gray-400 leading-relaxed">
                  This email and any attached files are confidential and are intended solely for the use of recipient(s) specified above. This communication may contain material protected by attorney-client, work product, or other privileges. It is strictly forbidden to reveal the contents of this message or any part thereof to third party. If you are not the intended recipient or person responsible for delivering to the intended recipient, you have received this communication in error, any review, use, dissemination, transferring, printing, copying, or other distribution of this e-mail and any attached files is strictly prohibited. If you have received this confidential communication in error, please notify the sender immediately by reply email message and permanently delete the original email. Thank you for your cooperation and understanding.
                </div>
              </div>
            </>
          ) : currentEmail ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Email content preview not available in demo</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select an email to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
