'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Building,
  ChevronRight,
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Send,
  Receipt,
  TrendingUp,
  Bell,
  X
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  issuer: {
    id: string;
    name: string;
    logo?: string;
  };
  amount: number;
  paid_amount: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  due_date: string;
  created_at: string;
  description?: string;
  provider: 'tempo' | 'circle';
  urgent?: boolean;
  discount_available?: boolean;
  discount_amount?: number;
}

export default function InvoiceInbox() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('tempo');

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoice_number: 'INV-2024-0156',
          issuer: {
            id: '1',
            name: 'Netflix',
            logo: '🎬'
          },
          amount: 15.99,
          paid_amount: 0,
          status: 'pending',
          due_date: '2024-10-05',
          created_at: '2024-09-25T10:00:00Z',
          description: 'Monthly subscription',
          provider: 'tempo',
          urgent: false,
          discount_available: false
        },
        {
          id: '2',
          invoice_number: 'INV-2024-0892',
          issuer: {
            id: '2',
            name: 'Electric Company',
            logo: '⚡'
          },
          amount: 125.43,
          paid_amount: 0,
          status: 'pending',
          due_date: '2024-10-01',
          created_at: '2024-09-20T14:30:00Z',
          description: 'September electricity bill',
          provider: 'circle',
          urgent: true,
          discount_available: true,
          discount_amount: 5.00
        },
        {
          id: '3',
          invoice_number: 'INV-2024-0445',
          issuer: {
            id: '3',
            name: 'Gym Membership',
            logo: '💪'
          },
          amount: 49.99,
          paid_amount: 49.99,
          status: 'paid',
          due_date: '2024-09-30',
          created_at: '2024-09-15T09:00:00Z',
          description: 'Monthly gym membership',
          provider: 'tempo',
          urgent: false
        },
        {
          id: '4',
          invoice_number: 'INV-2024-0223',
          issuer: {
            id: '4',
            name: 'Internet Provider',
            logo: '🌐'
          },
          amount: 79.99,
          paid_amount: 0,
          status: 'overdue',
          due_date: '2024-09-20',
          created_at: '2024-09-01T11:00:00Z',
          description: 'Internet service',
          provider: 'tempo',
          urgent: true
        },
        {
          id: '5',
          invoice_number: 'INV-2024-0667',
          issuer: {
            id: '5',
            name: 'Phone Company',
            logo: '📱'
          },
          amount: 45.00,
          paid_amount: 20.00,
          status: 'partial',
          due_date: '2024-10-10',
          created_at: '2024-09-22T15:30:00Z',
          description: 'Mobile phone plan',
          provider: 'circle',
          urgent: false
        }
      ];

      // Apply filter
      let filtered = mockInvoices;
      if (filter !== 'all') {
        filtered = mockInvoices.filter(inv => inv.status === filter);
      }

      setInvoices(filtered);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedInvoice) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/enterprise-treasury/invoice/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invoice_id: selectedInvoice.id,
          amount: selectedInvoice.amount - selectedInvoice.paid_amount,
          provider: paymentMethod
        })
      });

      if (response.ok) {
        // Update invoice status locally
        setInvoices(invoices.map(inv =>
          inv.id === selectedInvoice.id
            ? { ...inv, status: 'paid' as const, paid_amount: inv.amount }
            : inv
        ));
        setShowPaymentModal(false);
        setSelectedInvoice(null);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'partial': return <AlertCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
  const totalDue = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paid_amount), 0);
  const urgentCount = invoices.filter(inv => inv.urgent && inv.status !== 'paid').length;

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.issuer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice Inbox</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and pay your invoices with one click
          </p>
        </div>
        {urgentCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {urgentCount} urgent invoice{urgentCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Due</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalDue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-blue-600">
                {invoices.filter(inv => inv.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {invoices.filter(inv => inv.status === 'overdue').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'overdue', 'paid'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredInvoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">
                    {invoice.issuer.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {invoice.issuer.name}
                      </h3>
                      {invoice.urgent && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">
                          Urgent
                        </span>
                      )}
                      {invoice.discount_available && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full font-medium">
                          Save ${invoice.discount_amount?.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {invoice.description} • {invoice.invoice_number}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(invoice.amount - invoice.paid_amount).toFixed(2)}
                    </p>
                    {invoice.paid_amount > 0 && invoice.paid_amount < invoice.amount && (
                      <p className="text-xs text-gray-500">
                        ${invoice.paid_amount.toFixed(2)} paid
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      via {invoice.provider === 'tempo' ? 'Tempo (instant)' : 'Circle USDC'}
                    </p>
                  </div>
                  {invoice.status !== 'paid' && (
                    <button
                      onClick={() => handleQuickPay(invoice)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Now
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No invoices found</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Confirm Payment
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paying to</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedInvoice.issuer.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(selectedInvoice.amount - selectedInvoice.paid_amount).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('tempo')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'tempo'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-sm font-medium">Tempo</p>
                      <p className="text-xs text-gray-500">Instant • $0.01 fee</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('circle')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'circle'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <p className="text-sm font-medium">Circle USDC</p>
                      <p className="text-xs text-gray-500">2-3 sec • $0.10 fee</p>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayment}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Pay ${(selectedInvoice.amount - selectedInvoice.paid_amount).toFixed(2)}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}