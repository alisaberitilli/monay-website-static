'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  User, 
  Phone, 
  DollarSign, 
  Send, 
  Clock,
  ChevronRight,
  QrCode,
  Smartphone,
  CreditCard,
  Building,
  Users,
  ArrowRight
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  initials: string;
  lastTransaction?: string;
}

export default function SendMoneyPage() {
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'card' | 'bank'>('balance');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [note, setNote] = useState('');

  const recentContacts: Contact[] = [
    { id: '1', name: 'John Doe', phone: '+1 234 567 8900', initials: 'JD', lastTransaction: '2 days ago' },
    { id: '2', name: 'Jane Smith', phone: '+1 234 567 8901', initials: 'JS', lastTransaction: '1 week ago' },
    { id: '3', name: 'Mike Johnson', phone: '+1 234 567 8902', initials: 'MJ', lastTransaction: '2 weeks ago' },
    { id: '4', name: 'Sarah Williams', phone: '+1 234 567 8903', initials: 'SW', lastTransaction: '1 month ago' },
  ];

  const frequentContacts: Contact[] = [
    { id: '5', name: 'Alex Brown', phone: '+1 234 567 8904', initials: 'AB' },
    { id: '6', name: 'Emily Davis', phone: '+1 234 567 8905', initials: 'ED' },
    { id: '7', name: 'Chris Wilson', phone: '+1 234 567 8906', initials: 'CW' },
    { id: '8', name: 'Lisa Anderson', phone: '+1 234 567 8907', initials: 'LA' },
  ];

  const quickAmounts = ['10', '25', '50', '100', '250', '500'];

  const handleSendMoney = () => {
    if (selectedContact && amount) {
      setShowConfirmation(true);
      // Simulate sending money
      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedContact(null);
        setAmount('');
        setNote('');
      }, 3000);
    }
  };

  const filteredContacts = [...recentContacts, ...frequentContacts].filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Send Money</h1>
          <p className="text-gray-600 mt-2">Transfer money instantly to anyone</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Send</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Scan QR</span>
                </button>
                <button className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Phone</span>
                </button>
              </div>
            </div>

            {/* Search Contacts */}
            <div className="bg-white rounded-3xl p-6">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Recent Contacts */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Recent</h4>
                <div className="space-y-2">
                  {filteredContacts.slice(0, 4).map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all ${
                        selectedContact?.id === contact.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        selectedContact?.id === contact.id
                          ? 'bg-white/20 text-white'
                          : 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600'
                      }`}>
                        {contact.initials}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${
                          selectedContact?.id === contact.id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {contact.name}
                        </p>
                        <p className={`text-xs ${
                          selectedContact?.id === contact.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {contact.lastTransaction}
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${
                        selectedContact?.id === contact.id ? 'text-white' : 'text-gray-400'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* All Contacts Link */}
              <button className="w-full mt-4 py-3 text-purple-600 font-medium hover:bg-purple-50 rounded-2xl transition-all">
                View All Contacts
              </button>
            </div>
          </div>

          {/* Middle Column - Amount Entry */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selected Contact */}
            {selectedContact && (
              <div className="bg-white rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sending to</h3>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedContact.initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedContact.name}</p>
                    <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Amount</h3>
              
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl text-gray-400">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-center bg-gray-50 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount)}
                    className="py-2 px-3 bg-gray-100 hover:bg-purple-100 hover:text-purple-600 rounded-xl font-medium transition-all"
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>

              {/* Add Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add a note (optional)</label>
                <textarea
                  placeholder="What's this for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('balance')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'balance'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Monay Balance</p>
                      <p className="text-sm text-gray-500">$12,547.83 available</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    paymentMethod === 'balance'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'balance' && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Debit Card</p>
                      <p className="text-sm text-gray-500">•••• 4532</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    paymentMethod === 'card'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'card' && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Transaction Summary */}
            {selectedContact && amount && (
              <div className="bg-white rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-gray-900">${amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">${amount}</span>
                    </div>
                  </div>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMoney}
                  disabled={!selectedContact || !amount || showConfirmation}
                  className="w-full btn-modern btn-gradient group flex items-center justify-center"
                >
                  {showConfirmation ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Money
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Transfers are instant and secure with 256-bit encryption
                </p>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transfers</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">To John Doe</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">$250</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">To Sarah W.</p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">$125</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Instant Transfers</h4>
                  <p className="text-sm text-gray-600">
                    Money is transferred instantly to other Monay users. Bank transfers may take 1-3 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}