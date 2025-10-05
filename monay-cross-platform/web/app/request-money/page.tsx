'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  DollarSign,
  User,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  QrCode,
  Copy,
  Share2
} from 'lucide-react';

export default function RequestMoneyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    contactMethod: 'phone' as 'phone' | 'email',
    contact: '',
    note: '',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a mock payment link
      const requestId = 'req_' + Math.random().toString(36).substr(2, 9);
      const link = `https://monay.app/pay/${requestId}`;
      setGeneratedLink(link);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    // You could add a toast notification here
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Request',
        text: `Please pay $${formData.amount} via Monay`,
        url: generatedLink,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      contactMethod: 'phone',
      contact: '',
      note: '',
      dueDate: ''
    });
    setShowSuccess(false);
    setGeneratedLink('');
  };

  if (showSuccess) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Sent!</h1>
            <p className="text-gray-600">Your payment request has been created successfully</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Request Details</h2>
              <div className="text-3xl font-bold text-purple-600">${formData.amount}</div>
              {formData.note && (
                <p className="text-gray-600 mt-2">{formData.note}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-2xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Link
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShareLink}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Link
                </button>
                <button
                  onClick={() => {/* Generate QR code */}}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  QR Code
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Create Another
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowDown className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Money</h1>
          <p className="text-gray-600">Create a payment request and share it with others</p>
        </div>

        {/* Request Form */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Request
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Contact Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How should we contact them?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, contactMethod: 'phone', contact: '' })}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                    formData.contactMethod === 'phone'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Phone Number
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, contactMethod: 'email', contact: '' })}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                    formData.contactMethod === 'email'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Address
                </button>
              </div>
            </div>

            {/* Contact Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.contactMethod === 'phone' ? 'Phone Number' : 'Email Address'}
              </label>
              <div className="relative">
                {formData.contactMethod === 'phone' ? (
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                ) : (
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                )}
                <input
                  type={formData.contactMethod === 'phone' ? 'tel' : 'email'}
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={formData.contactMethod === 'phone' ? '+1 234 567 8900' : 'email@example.com'}
                  required
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's this for? (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Dinner, rent split, project payment..."
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.amount || !formData.contact}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Request...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Create Payment Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              We'll send them a secure payment link
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              They can pay instantly with any card or bank account
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              Money goes directly to your Monay wallet
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}