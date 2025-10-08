'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Clock,
  Shield,
  Zap,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Copy,
  ExternalLink,
  Timer,
  TrendingUp
} from 'lucide-react';

interface Invoice {
  id: string;
  vendorName: string;
  amount: number;
  currency: string;
  dueDate: string;
  walletAddress: string;
  walletMode: 'ephemeral' | 'persistent' | 'adaptive';
  provider: string;
  expiresIn?: number;
  status: 'pending' | 'paid' | 'expired';
  description?: string;
}

interface EphemeralWallet {
  address: string;
  balance: number;
  expiresAt: Date;
  countdownSeconds: number;
}

export default function SmartInvoicePayment() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [ephemeralWallet, setEphemeralWallet] = useState<EphemeralWallet | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto'>('card');
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Fetch user's pending invoices
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Countdown timer for ephemeral wallet
  useEffect(() => {
    if (ephemeralWallet && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, ephemeralWallet]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  const selectInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);

    // If ephemeral, create temporary wallet
    if (invoice.walletMode === 'ephemeral') {
      try {
        const response = await fetch('/api/wallets/ephemeral/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            purpose: 'invoice',
            amount: invoice.amount,
            expiryMinutes: 30
          })
        });

        const wallet = await response.json();
        setEphemeralWallet({
          address: wallet.address,
          balance: 0,
          expiresAt: new Date(wallet.expiresAt),
          countdownSeconds: 1800 // 30 minutes
        });
        setCountdown(1800);
      } catch (error) {
        console.error('Failed to create ephemeral wallet:', error);
      }
    }
  };

  const processPayment = async () => {
    if (!selectedInvoice) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/invoices/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          paymentMethod,
          walletAddress: ephemeralWallet?.address || selectedInvoice.walletAddress
        })
      });

      if (response.ok) {
        // Update invoice status
        setInvoices(invoices.map(inv =>
          inv.id === selectedInvoice.id
            ? { ...inv, status: 'paid' }
            : inv
        ));
        setSelectedInvoice(null);
        setEphemeralWallet(null);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProviderBadge = (provider: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode }> = {
      tempo: { color: 'bg-blue-100 text-blue-800', icon: <Zap className="w-3 h-3" /> },
      circle: { color: 'bg-green-100 text-green-800', icon: <TrendingUp className="w-3 h-3" /> },
      stripe: { color: 'bg-purple-100 text-purple-800', icon: <Shield className="w-3 h-3" /> }
    };

    const badge = badges[provider] || badges.tempo;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {provider}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Smart Invoice Payment</h1>
        <p className="text-gray-600 mt-2">Pay invoices instantly with ephemeral wallets</p>
      </div>

      {/* Invoice List */}
      <div className="grid gap-4 mb-8">
        {invoices.map((invoice) => (
          <motion.div
            key={invoice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-lg border ${
              invoice.status === 'paid'
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 hover:border-orange-300'
            } p-6 cursor-pointer transition-all`}
            onClick={() => invoice.status !== 'paid' && selectInvoice(invoice)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{invoice.vendorName}</h3>
                <p className="text-gray-600 text-sm mt-1">{invoice.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-2xl font-bold">
                    ${invoice.amount.toFixed(2)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getProviderBadge(invoice.provider)}
                {invoice.status === 'paid' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <div className="flex items-center gap-2">
                    {invoice.walletMode === 'ephemeral' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Ephemeral
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Pay Invoice</h2>

              {/* Invoice Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">To:</span>
                  <span className="font-semibold">{selectedInvoice.vendorName}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-2xl font-bold text-orange-500">
                    ${selectedInvoice.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Provider:</span>
                  {getProviderBadge(selectedInvoice.provider)}
                </div>
              </div>

              {/* Ephemeral Wallet Info */}
              {ephemeralWallet && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-900">Ephemeral Wallet</span>
                    </div>
                    <span className="text-yellow-600 font-mono font-bold">
                      {formatTime(countdown)}
                    </span>
                  </div>
                  <div className="text-xs text-yellow-700 mt-2">
                    This temporary wallet will self-destruct after payment or when timer expires
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={ephemeralWallet.address}
                      readOnly
                      className="flex-1 text-xs font-mono bg-white border border-yellow-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => copyAddress(ephemeralWallet.address)}
                      className="p-1 hover:bg-yellow-100 rounded"
                    >
                      <Copy className="w-4 h-4 text-yellow-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div className="space-y-2 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Select Payment Method</p>
                {['card', 'bank', 'crypto'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method as any)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      paymentMethod === method
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{method} Payment</span>
                      {paymentMethod === method && (
                        <CheckCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}