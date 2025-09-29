'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  UserPlus,
  Search,
  DollarSign,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  ArrowUpRight,
  ArrowDownRight,
  QrCode,
  Share2,
  Copy,
  Calendar,
  Tag,
  Hash,
  TrendingUp,
  Users,
  Receipt,
  Repeat
} from 'lucide-react';

interface PaymentRequest {
  id: string;
  request_id: string;
  type: 'sent' | 'received';
  from: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  to: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  reason: string; // Required audit tag
  category: 'rent' | 'food' | 'utilities' | 'entertainment' | 'transport' | 'medical' | 'education' | 'other';
  status: 'pending' | 'completed' | 'rejected' | 'expired';
  created_at: string;
  expires_at: string;
  recurring?: boolean;
  recurring_frequency?: 'weekly' | 'monthly' | 'yearly';
  notes?: string;
  provider: 'tempo' | 'circle';
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  last_transaction?: string;
  frequent?: boolean;
}

const PAYMENT_CATEGORIES = [
  { value: 'rent', label: 'Rent/Mortgage', icon: '🏠', color: 'bg-blue-100 text-blue-700' },
  { value: 'food', label: 'Food & Dining', icon: '🍔', color: 'bg-green-100 text-green-700' },
  { value: 'utilities', label: 'Utilities', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'bg-purple-100 text-purple-700' },
  { value: 'transport', label: 'Transportation', icon: '🚗', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'medical', label: 'Medical', icon: '🏥', color: 'bg-red-100 text-red-700' },
  { value: 'education', label: 'Education', icon: '📚', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'other', label: 'Other', icon: '📝', color: 'bg-gray-100 text-gray-700' }
];

export default function P2PRequestToPay() {
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [provider, setProvider] = useState<'tempo' | 'circle'>('tempo');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchContacts();
  }, []);

  const fetchRequests = async () => {
    // Mock data for demonstration
    const mockRequests: PaymentRequest[] = [
      {
        id: '1',
        request_id: 'REQ-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        type: 'received',
        from: {
          id: '2',
          name: 'John Smith',
          email: 'john@example.com',
          avatar: '👤'
        },
        to: {
          id: '1',
          name: 'You',
          email: 'user@example.com'
        },
        amount: 50.00,
        reason: 'Split dinner at Italian restaurant',
        category: 'food',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        provider: 'tempo'
      },
      {
        id: '2',
        request_id: 'REQ-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        type: 'sent',
        from: {
          id: '1',
          name: 'You',
          email: 'user@example.com'
        },
        to: {
          id: '3',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          avatar: '👩'
        },
        amount: 500.00,
        reason: 'Monthly rent share',
        category: 'rent',
        status: 'completed',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        recurring: true,
        recurring_frequency: 'monthly',
        provider: 'circle'
      },
      {
        id: '3',
        request_id: 'REQ-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        type: 'received',
        from: {
          id: '4',
          name: 'Mike Wilson',
          email: 'mike@example.com',
          avatar: '🧑'
        },
        to: {
          id: '1',
          name: 'You',
          email: 'user@example.com'
        },
        amount: 25.00,
        reason: 'Uber ride to airport',
        category: 'transport',
        status: 'pending',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        expires_at: new Date(Date.now() + 43200000).toISOString(),
        provider: 'tempo'
      }
    ];

    setRequests(mockRequests);
  };

  const fetchContacts = async () => {
    // Mock contacts
    const mockContacts: Contact[] = [
      {
        id: '2',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1234567890',
        avatar: '👤',
        last_transaction: '2 days ago',
        frequent: true
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+0987654321',
        avatar: '👩',
        last_transaction: 'Yesterday',
        frequent: true
      },
      {
        id: '4',
        name: 'Mike Wilson',
        email: 'mike@example.com',
        avatar: '🧑',
        last_transaction: '1 week ago',
        frequent: false
      },
      {
        id: '5',
        name: 'Emma Davis',
        email: 'emma@example.com',
        avatar: '👱‍♀️',
        last_transaction: '3 weeks ago',
        frequent: false
      }
    ];

    setContacts(mockContacts);
  };

  const handleSendRequest = async () => {
    if (!selectedContact || !amount || !reason) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/payment-request/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: selectedContact.id,
          amount: parseFloat(amount),
          reason, // Required for audit
          category,
          notes,
          recurring,
          recurring_frequency: recurring ? recurringFrequency : undefined,
          provider,
          type: 'P2P_REQUEST'
        })
      });

      if (response.ok) {
        // Reset form
        setSelectedContact(null);
        setAmount('');
        setReason('');
        setCategory('other');
        setNotes('');
        setRecurring(false);
        // Refresh requests
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to send request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRequest = async (request: PaymentRequest) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/payment-request/pay/${request.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: request.provider
        })
      });

      if (response.ok) {
        // Update request status
        setRequests(requests.map(req =>
          req.id === request.id
            ? { ...req, status: 'completed' }
            : req
        ));
      }
    } catch (error) {
      console.error('Failed to pay request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/payment-request/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setRequests(requests.map(req =>
          req.id === requestId
            ? { ...req, status: 'rejected' }
            : req
        ));
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const totalPending = pendingRequests.reduce((sum, req) =>
    req.type === 'received' ? sum + req.amount : sum, 0
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Request to Pay</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Send and receive payment requests with audit tags
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            My QR Code
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingRequests.length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Amount Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                ${totalPending.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sent Today</p>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.type === 'sent' &&
                  new Date(r.created_at).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Received Today</p>
              <p className="text-2xl font-bold text-blue-600">
                {requests.filter(r => r.type === 'received' &&
                  new Date(r.created_at).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <ArrowDownRight className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('request')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'request'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Create Request
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Request History
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'request' ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Contact
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full p-3 rounded-lg border-2 transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl">
                          {contact.avatar}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {contact.name}
                          </p>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                        </div>
                        {contact.frequent && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                            Frequent
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Request Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Required for Audit)
                  </label>
                  <input
                    type="text"
                    placeholder="What is this payment for?"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PAYMENT_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          category === cat.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-xl mb-1">{cat.icon}</div>
                          <p className="text-xs">{cat.label}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Add any additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={recurring}
                      onChange={(e) => setRecurring(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Recurring Request</span>
                  </label>
                  {recurring && (
                    <select
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value as any)}
                      className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-900"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Provider
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setProvider('tempo')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        provider === 'tempo'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-sm font-medium">Tempo</p>
                      <p className="text-xs text-gray-500">Instant</p>
                    </button>
                    <button
                      onClick={() => setProvider('circle')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        provider === 'circle'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <p className="text-sm font-medium">Circle</p>
                      <p className="text-xs text-gray-500">USDC</p>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSendRequest}
                  disabled={!selectedContact || !amount || !reason || loading}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Clock className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Payment Request
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Request History */}
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        request.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {request.type === 'sent' ? (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {request.type === 'sent' ? request.to.name : request.from.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <Tag className="w-3 h-3 inline mr-1" />
                          {request.reason}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            PAYMENT_CATEGORIES.find(c => c.value === request.category)?.color
                          }`}>
                            {PAYMENT_CATEGORIES.find(c => c.value === request.category)?.icon}
                            {PAYMENT_CATEGORIES.find(c => c.value === request.category)?.label}
                          </span>
                          {request.recurring && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center gap-1">
                              <Repeat className="w-3 h-3" />
                              {request.recurring_frequency}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          ${request.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.status === 'pending' ? (
                            <span className="text-orange-600">Pending</span>
                          ) : request.status === 'completed' ? (
                            <span className="text-green-600">Completed</span>
                          ) : request.status === 'rejected' ? (
                            <span className="text-red-600">Rejected</span>
                          ) : (
                            <span className="text-gray-600">Expired</span>
                          )}
                        </p>
                      </div>
                      {request.status === 'pending' && request.type === 'received' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePayRequest(request)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                          >
                            Pay
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {requests.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No payment requests yet</p>
                  <button
                    onClick={() => setActiveTab('request')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Create Your First Request
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQRCode(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Your Payment QR Code</h3>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 flex items-center justify-center">
                <QrCode className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
                Share this QR code to receive payments
              </p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}