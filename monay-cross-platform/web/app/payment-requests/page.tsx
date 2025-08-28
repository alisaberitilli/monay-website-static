'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import {
  Send,
  Receipt,
  FileText,
  Upload,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Download,
  Eye,
  Paperclip
} from 'lucide-react';

interface PaymentRequest {
  id: string;
  requesterName: string;
  payerName: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'paid' | 'cancelled';
  description: string;
  invoiceType?: 'structured' | 'inline' | 'attachment';
  invoiceReference?: string;
  dueDate?: string;
  createdAt: string;
}

export default function PaymentRequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for new request
  const [newRequest, setNewRequest] = useState({
    payerPhone: '',
    amount: '',
    description: '',
    dueDate: '',
    invoiceType: 'none' as 'none' | 'inline' | 'attachment',
    invoiceItems: [{ description: '', amount: '' }],
    invoiceFile: null as File | null
  });

  // Mock data for demonstration
  const mockRequests: PaymentRequest[] = [
    {
      id: 'req_1',
      requesterName: 'Coffee Shop LLC',
      payerName: 'John Doe',
      amount: 541.25,
      status: 'pending',
      description: 'Coffee Shop Invoice #INV-2024-001',
      invoiceType: 'structured',
      invoiceReference: 'INV-2024-001',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'req_2',
      requesterName: 'Jane Smith',
      payerName: 'Mike Johnson',
      amount: 75.50,
      status: 'pending',
      description: 'Dinner split with invoice',
      invoiceType: 'inline',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'req_3',
      requesterName: 'Acme Corporation',
      payerName: 'Treasury',
      amount: 10000.00,
      status: 'pending',
      description: 'Q4 2024 Enterprise Services',
      invoiceType: 'attachment',
      invoiceReference: 'acme-invoice-q4-2024.pdf',
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Load payment requests
    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateRequest = async () => {
    // API call to create payment request
    console.log('Creating payment request:', newRequest);
    setShowCreateModal(false);
    // Reset form
    setNewRequest({
      payerPhone: '',
      amount: '',
      description: '',
      dueDate: '',
      invoiceType: 'none',
      invoiceItems: [{ description: '', amount: '' }],
      invoiceFile: null
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewRequest({ ...newRequest, invoiceFile: e.target.files[0] });
    }
  };

  const addInvoiceItem = () => {
    setNewRequest({
      ...newRequest,
      invoiceItems: [...newRequest.invoiceItems, { description: '', amount: '' }]
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Requests</h1>
            <p className="text-gray-600 mt-2">Manage payment requests with digital invoices</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Request
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'received'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'sent'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sent
          </button>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-3xl p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment requests</h3>
              <p className="text-gray-600 mb-6">Create your first payment request with an invoice</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Create Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {activeTab === 'sent' ? request.payerName : request.requesterName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{request.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {request.invoiceType && (
                          <div className="flex items-center">
                            {request.invoiceType === 'attachment' ? (
                              <Paperclip className="h-4 w-4 mr-1" />
                            ) : (
                              <FileText className="h-4 w-4 mr-1" />
                            )}
                            {request.invoiceReference || 'Invoice attached'}
                          </div>
                        )}
                        {request.dueDate && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {new Date(request.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-gray-900">
                        ${request.amount.toFixed(2)}
                      </p>
                      {request.status === 'pending' && activeTab === 'received' && (
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle payment
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                          >
                            Pay Now
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle rejection
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Payment Request</h2>
              
              <div className="space-y-6">
                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newRequest.payerPhone}
                    onChange={(e) => setNewRequest({ ...newRequest, payerPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={newRequest.amount}
                      onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="What is this payment for?"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newRequest.dueDate}
                    onChange={(e) => setNewRequest({ ...newRequest, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Invoice Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setNewRequest({ ...newRequest, invoiceType: 'none' })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newRequest.invoiceType === 'none'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium">No Invoice</span>
                    </button>
                    <button
                      onClick={() => setNewRequest({ ...newRequest, invoiceType: 'inline' })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newRequest.invoiceType === 'inline'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium">Create Invoice</span>
                    </button>
                    <button
                      onClick={() => setNewRequest({ ...newRequest, invoiceType: 'attachment' })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newRequest.invoiceType === 'attachment'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium">Upload PDF</span>
                    </button>
                  </div>
                </div>

                {/* Inline Invoice Items */}
                {newRequest.invoiceType === 'inline' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Items
                    </label>
                    <div className="space-y-3">
                      {newRequest.invoiceItems.map((item, index) => (
                        <div key={index} className="flex space-x-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const items = [...newRequest.invoiceItems];
                              items[index].description = e.target.value;
                              setNewRequest({ ...newRequest, invoiceItems: items });
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            placeholder="Item description"
                          />
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => {
                              const items = [...newRequest.invoiceItems];
                              items[index].amount = e.target.value;
                              setNewRequest({ ...newRequest, invoiceItems: items });
                            }}
                            className="w-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            placeholder="Amount"
                          />
                        </div>
                      ))}
                      <button
                        onClick={addInvoiceItem}
                        className="text-purple-600 font-medium hover:text-purple-700"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>
                )}

                {/* File Upload */}
                {newRequest.invoiceType === 'attachment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Invoice (PDF)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="invoice-upload"
                      />
                      <label
                        htmlFor="invoice-upload"
                        className="cursor-pointer text-purple-600 font-medium hover:text-purple-700"
                      >
                        Click to upload
                      </label>
                      {newRequest.invoiceFile && (
                        <p className="text-sm text-gray-600 mt-2">
                          {newRequest.invoiceFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRequest}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg"
                >
                  Create Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}